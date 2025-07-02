// Vercel serverless function for bulk AI option suggestions
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
    existingActivities, 
    declinedSuggestions = [], 
    count = 5, 
    category,
    titleName = 'Kids Options',
    titleCategory = 'family',
    titleDescription = 'Random options'
  } = req.body;

  if (!Array.isArray(existingActivities)) {
    return res.status(400).json({ error: 'Existing options must be an array' });
  }

  if (!Array.isArray(declinedSuggestions)) {
    return res.status(400).json({ error: 'Declined suggestions must be an array' });
  }

  if (typeof count !== 'number' || count < 1 || count > 10) {
    return res.status(400).json({ error: 'Count must be a number between 1 and 10' });
  }

  try {
    const optionsList = existingActivities.length > 0 
      ? existingActivities.join(', ') 
      : 'No options yet';

    const declinedList = declinedSuggestions.length > 0 
      ? declinedSuggestions.join(', ') 
      : 'None declined yet';

    // Generate context-aware prompt based on title category
    const generateSystemPrompt = (category, titleName, description) => {
      const categoryPrompts = {
        food: `You are a culinary expert suggesting delicious food options. Focus on meals, snacks, cuisines, and food experiences.
        
GUIDELINES:
- Suggest appetizing food options from different cuisines and meal types
- Include quick snacks, full meals, beverages, and desserts
- Consider dietary preferences, cooking methods, and occasions
- Range from simple to elaborate options
- Examples: "Thai Green Curry", "Grilled Sandwich", "Smoothie Bowl", "Fish Tacos"`,

        games: `You are a game expert suggesting fun options and games. Focus on party games, sports, challenges, and entertainment.
        
GUIDELINES:
- Suggest engaging games for various group sizes and ages
- Include party games, sports, puzzles, challenges, and competitions
- Consider indoor/outdoor options and required materials
- Range from quick games to longer options
- Examples: "Scavenger Hunt", "Word Association", "Frisbee", "Card Games"`,

        numbers: `You are providing random numbers for various purposes. Focus on numerical selections for games, decisions, or randomization.
        
GUIDELINES:
- Suggest numbers appropriate for the context
- Consider ranges, sequences, and special number formats
- Include lottery numbers, game numbers, or decision numbers
- Keep numbers practical and useful
- Examples: "42", "7", "100", "Lucky Number 13"`,

        entertainment: `You are an entertainment expert suggesting movies, books, music, and media. Focus on discovery and enjoyment.
        
GUIDELINES:
- Suggest diverse entertainment options across genres and formats
- Include classic and modern options
- Consider different moods, occasions, and preferences
- Range from mainstream to niche discoveries
- Examples: "Action Movie", "Jazz Music", "Mystery Novel", "Documentary"`,

        education: `You are an educational expert suggesting learning topics and options. Focus on knowledge, skills, and personal development.
        
GUIDELINES:
- Suggest educational topics and learning options
- Include academic subjects, practical skills, and creative pursuits
- Consider different learning styles and difficulty levels
- Range from basic to advanced topics
- Examples: "Spanish Language", "Photography", "Critical Thinking", "Science Experiment"`,

        workplace: `You are a workplace wellness expert suggesting professional break options. Focus on office-appropriate stress relief and productivity.
        
GUIDELINES:
- Suggest professional, office-appropriate options
- Include stress relief, networking, and skill development options
- Consider different time constraints (5-30 minutes)
- Focus on options that refresh and energize
- Examples: "Quick Walk", "Desk Yoga", "Team Coffee", "Brain Games"`,

        family: `You are a family option expert suggesting engaging options for all ages. Focus on bonding, fun, and shared experiences.
        
GUIDELINES:
- Suggest options suitable for families and groups
- Include indoor/outdoor options and various skill levels
- Consider bonding, learning, and entertainment value
- Range from quiet to active options
- Examples: "Board Game Night", "Nature Walk", "Cooking Together", "Craft Project"`,

        custom: `You are a versatile suggestion expert. Based on the title "${titleName}" and description "${description}", provide relevant suggestions.
        
GUIDELINES:
- Analyze the title and description to understand the context
- Suggest items that fit the specific theme or purpose
- Be creative but practical within the given context
- Consider the variety and usefulness of suggestions
- Examples will vary based on the specific title context`
      };

      const basePrompt = categoryPrompts[category] || categoryPrompts.custom;
      
      return `${basePrompt}

CONTEXT: "${titleName}" - ${description}

OUTPUT FORMAT:
- Return ONLY a numbered list (1. Item Name)
- Each suggestion should be 1-4 words maximum, under 25 characters
- Make each item clear and actionable
- NO explanations, quotes, or extra text
- Ensure variety and uniqueness across all suggestions
- Match the style and theme of existing items`;
    };

    const systemPrompt = generateSystemPrompt(titleCategory, titleName, titleDescription);

    const userPrompt = `Current items: ${optionsList}
Previously declined suggestions: ${declinedList}

Generate ${count} appropriate items that:
1. Are completely different from ALL existing items
2. Are NOT any of the previously declined suggestions
3. Fit perfectly with the theme "${titleName}"
4. Match the context: ${titleDescription}
5. Are practical and easily understood
6. Provide variety within the theme

IMPORTANT: 
- Do not suggest any item from the declined list
- Make sure all ${count} items are different from each other
- Analyze the existing items to understand the pattern and style
- Maintain consistency with the theme while adding diversity
- Each suggestion should fit naturally within this category

Return exactly ${count} items in this format:
1. Item Name
2. Item Name
...`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://spin2pick.app",
        "X-Title": "Spin2Pick App"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.2-3b-instruct", // Faster and cheaper model
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
        max_tokens: 150, // Increased for multiple activities
        temperature: 0.7 // Slightly higher for more variety in bulk suggestions
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', errorText);
      return res.status(500).json({ error: 'API request failed' });
    }

    const data = await response.json();
    
    // Parse the response to extract option names
    let options = [];
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      const content = data.choices[0].message.content.trim();
      
      // Extract options from numbered list format
      const lines = content.split('\n');
      options = lines
        .map(line => line.trim())
        .filter(line => /^\d+\./.test(line)) // Only lines that start with number and dot
        .map(line => line.replace(/^\d+\.\s*/, '').trim()) // Remove number and dot
        .filter(option => option.length > 0 && option.length <= 50) // Valid length
        .slice(0, count); // Ensure we don't exceed requested count
    }

    // Fallback if parsing fails - return the raw response
    if (options.length === 0) {
      options = [data.choices?.[0]?.message?.content?.trim() || 'Choose Option'];
    }

    // Return the processed options
    res.status(200).json({
      ...data,
      extractedOptions: options,
      requestedCount: count,
      actualCount: options.length
    });
    
  } catch (error) {
    console.error('Error in suggest-multiple-activities API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 