// Vercel serverless function for AI-powered content moderation
export default async function handler(req, res) {
  // 🌐 CORS headers for cross-origin requests (development)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const { 
    title,
    description,
    items = [],
    category = 'custom',
    strictness = 'moderate'
  } = req.body;

  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'Title is required and must be a string' });
  }

  if (!description || typeof description !== 'string') {
    return res.status(400).json({ error: 'Description is required and must be a string' });
  }

  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Items must be an array' });
  }

  try {
    // Combine all content for analysis
    const allContent = [title, description, ...items].join(' ');
    
    // Generate content moderation prompt based on strictness
    const generateModerationPrompt = (strictnessLevel) => {
      const basePrompt = `You are a content moderation expert analyzing user-generated content for appropriateness. Evaluate the following content for any issues.`;
      
      const strictnessGuidelines = {
        relaxed: `Focus only on clearly harmful content:
- Explicit sexual content
- Graphic violence or threats
- Illegal activities
- Hate speech or discrimination
- Self-harm content`,
        
        moderate: `Standard content guidelines:
- Sexual or suggestive content
- Violence or aggressive behavior
- Drugs, alcohol, or substance abuse
- Illegal activities or fraud
- Hate speech or discrimination
- Self-harm or mental health crisis content
- Spam or promotional content`,
        
        strict: `Comprehensive content review:
- Any sexual references or innuendo
- Violence, aggression, or conflict
- Substance use including alcohol
- Political or controversial topics
- Religious content
- Potentially scary or disturbing content
- Commercial or promotional content
- Negative or inappropriate language`
      };
      
      return `${basePrompt}

${strictnessGuidelines[strictnessLevel] || strictnessGuidelines.moderate}

ANALYSIS CRITERIA:
- Content should be appropriate for all ages and backgrounds
- Consider family-friendly usage context
- Category context: "${category}" content
- Focus on safety and inclusivity

RESPONSE FORMAT:
Return a JSON object with:
{
  "approved": boolean,
  "issues": ["list", "of", "specific", "issues"],
  "severity": "low|medium|high",
  "suggestions": ["improvement", "suggestions"],
  "confidence": 0.95
}

Be precise and helpful in feedback.`;
    };

    const systemPrompt = generateModerationPrompt(strictness);

    const userPrompt = `Please analyze this content:

TITLE: "${title}"
DESCRIPTION: "${description}"
ITEMS: ${items.length > 0 ? items.join(', ') : 'No items provided'}
CATEGORY: ${category}

Provide detailed moderation analysis.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://spin2pick.app",
        "X-Title": "Spin2Pick App - Content Moderation"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-nemo",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user", 
            content: userPrompt
          }
        ],
        max_tokens: 500,
        temperature: 0.1, // Low temperature for consistent moderation
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      console.error('❌ AI Moderation API Error:', response.status, response.statusText);
      
      // Fallback to basic keyword moderation
      const basicCheck = performBasicModeration(allContent);
      return res.status(200).json({
        approved: basicCheck.approved,
        issues: basicCheck.issues,
        severity: basicCheck.severity,
        suggestions: ['Content moderation completed with basic filtering'],
        confidence: 0.7,
        fallback: true
      });
    }

    const data = await response.json();
    
    if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      throw new Error('Invalid AI response structure');
    }
    
    const aiResponse = data.choices[0].message.content;
    
    try {
      // Parse AI response as JSON
      const moderationResult = JSON.parse(aiResponse);
      
      // Validate response structure
      if (typeof moderationResult.approved !== 'boolean') {
        throw new Error('Invalid moderation result structure');
      }
      
      // Ensure arrays exist
      moderationResult.issues = moderationResult.issues || [];
      moderationResult.suggestions = moderationResult.suggestions || [];
      moderationResult.severity = moderationResult.severity || 'low';
      moderationResult.confidence = moderationResult.confidence || 0.8;
      
      return res.status(200).json(moderationResult);
      
    } catch (parseError) {
      console.error('❌ Failed to parse AI moderation response:', parseError);
      
      // Fallback to basic moderation
      const basicCheck = performBasicModeration(allContent);
      return res.status(200).json({
        ...basicCheck,
        suggestions: ['Content reviewed with basic moderation (AI parsing failed)'],
        confidence: 0.6,
        fallback: true
      });
    }

  } catch (error) {
    console.error('❌ Content moderation error:', error);
    
    // Always provide a fallback response
    const basicCheck = performBasicModeration([title, description, ...items].join(' '));
    return res.status(200).json({
      ...basicCheck,
      suggestions: ['Content reviewed with basic moderation (AI unavailable)'],
      confidence: 0.5,
      fallback: true
    });
  }
}

// Basic fallback moderation using keyword filtering
function performBasicModeration(content) {
  const text = content.toLowerCase();
  
  // Basic inappropriate content keywords
  const highSeverityKeywords = [
    'explicit', 'sexual', 'violent', 'drug', 'illegal', 'hate', 'kill', 'death',
    'porn', 'xxx', 'nude', 'weapon', 'bomb', 'terrorist', 'suicide'
  ];
  
  const mediumSeverityKeywords = [
    'gambling', 'bet', 'money', 'politics', 'religion', 'scary', 'horror'
  ];
  
  const foundHighSeverity = highSeverityKeywords.filter(keyword => text.includes(keyword));
  const foundMediumSeverity = mediumSeverityKeywords.filter(keyword => text.includes(keyword));
  
  const allIssues = [...foundHighSeverity, ...foundMediumSeverity];
  
  let severity = 'low';
  if (foundHighSeverity.length > 0) {
    severity = 'high';
  } else if (foundMediumSeverity.length > 0) {
    severity = 'medium';
  }
  
  const approved = allIssues.length === 0;
  
  return {
    approved,
    issues: allIssues.length > 0 ? [`Potentially inappropriate content detected: ${allIssues.join(', ')}`] : [],
    severity,
    suggestions: approved ? ['Content appears appropriate'] : ['Review and revise potentially inappropriate content']
  };
}