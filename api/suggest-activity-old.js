// Vercel serverless function for AI option suggestions
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
    titleName = 'Kids Options',
    titleCategory = 'family',
    titleDescription = 'Random options',
    isRetry = false
  } = req.body;

  if (!Array.isArray(existingActivities)) {
    return res.status(400).json({ error: 'Existing options must be an array' });
  }

  if (!Array.isArray(declinedSuggestions)) {
    return res.status(400).json({ error: 'Declined suggestions must be an array' });
  }

  try {
    const optionsList = existingActivities.length > 0 
      ? existingActivities.join(', ') 
      : 'No options yet';

    const declinedList = declinedSuggestions.length > 0 
      ? declinedSuggestions.join(', ') 
      : 'None declined yet';

    // Simple helper to format the option lists for the prompt
    const formatOptionsList = (options) => {
      return options.length > 0 ? options.join(', ') : 'None';
    };

    // Dramatically simplified prompt generation
    const generateSimplePrompt = (titleName, description, currentOptions, declinedOptions) => {
      return `You are helping to generate random options for a picker wheel.

Wheel title: ${titleName}
Wheel description: ${description}

Current wheel items: [${formatOptionsList(currentOptions)}]
Previously suggested items: [${formatOptionsList(declinedOptions)}]

Suggest a new relevant item based on the title and description.
Do not suggest anything already on the wheel or already suggested previously.`;
    };

      const categoryPrompts = {
        food: `${baseInstructions} Focus on culinary experiences ranging from simple snacks to elaborate meals.
        
EXPERTISE AREAS:
- International cuisines and regional specialties
- Dietary accommodations (vegetarian, gluten-free, quick prep)
- Occasion-based suggestions (breakfast, lunch, dinner, snacks, desserts)
- Cooking methods and complexity levels
- Seasonal and fresh ingredient focus

QUALITY STANDARDS:
- Prioritize accessible, recognizable food options
- Balance familiar favorites with discovery opportunities  
- Consider preparation time and skill requirements
- Include both homemade and dining options`,

        games: `${baseInstructions} Focus on entertainment, games, and recreational options for various settings and group sizes.
        
EXPERTISE AREAS:
- Party games and social options
- Sports and physical games (indoor/outdoor)
- Board games, card games, and puzzles
- Digital and traditional games
- Team building and group options
- Solo entertainment options

QUALITY STANDARDS:
- Consider required materials and setup complexity
- Balance active and passive options
- Include options for different skill levels and ages
- Suggest both competitive and cooperative formats`,

        numbers: `${baseInstructions} Focus on numerical selections for games, decisions, randomization, and mathematical contexts.
        
EXPERTISE AREAS:
- Gaming numbers (dice, lottery, bingo)
- Decision-making aids (rankings, quantities)
- Mathematical sequences and patterns
- Lucky numbers and cultural significance
- Practical number applications

QUALITY STANDARDS:
- Provide numbers appropriate for the stated context
- Consider cultural and psychological number preferences
- Include both simple and complex numerical formats
- Balance randomness with meaningful selections`,

        entertainment: `${baseInstructions} Focus on media consumption, cultural experiences, and leisure activities.
        
EXPERTISE AREAS:
- Movies, TV shows, documentaries across genres
- Music discovery (artists, genres, playlists)
- Books, podcasts, and digital content
- Live entertainment and cultural events
- Streaming platforms and content curation

QUALITY STANDARDS:
- Balance mainstream and niche recommendations
- Consider different moods and occasions
- Include both active and passive entertainment
- Suggest discovery opportunities alongside familiar options`,

        education: `${baseInstructions} Focus on learning opportunities, skill development, and intellectual growth.
        
EXPERTISE AREAS:
- Academic subjects and curricula
- Practical life skills and hobbies
- Professional development and certifications
- Creative and artistic learning
- Technology and digital literacy
- Language learning and cultural studies

QUALITY STANDARDS:
- Provide clear learning objectives and outcomes
- Consider different learning styles and preferences
- Balance theoretical knowledge with practical application
- Include both structured and self-directed learning options`,

        workplace: `${baseInstructions} Focus on professional development, workplace wellness, and productivity enhancement.
        
EXPERTISE AREAS:
- Stress relief and mental health breaks
- Team building and networking activities
- Skill development and career growth
- Office-appropriate physical activities
- Professional social interactions
- Quick productivity boosters

QUALITY STANDARDS:
- Ensure all suggestions are workplace-appropriate
- Consider time constraints (5-30 minute activities)
- Balance individual and group activities
- Focus on activities that refresh and energize`,

        family: `${baseInstructions} Focus on multi-generational activities that promote bonding, fun, and shared experiences.
        
EXPERTISE AREAS:
- Age-inclusive activities for diverse family groups
- Educational and entertaining combinations
- Indoor and outdoor family adventures
- Creative projects and collaborative activities
- Seasonal and holiday-themed suggestions
- Budget-friendly and accessible options

QUALITY STANDARDS:
- Ensure activities work for different age groups
- Balance active and quiet activities
- Consider varying attention spans and interests
- Promote positive family interactions and memories`,

        custom: `${baseInstructions} Based on the specific context "${titleName}" and description "${description}", provide highly relevant suggestions.
        
ANALYSIS APPROACH:
1. Parse the title for key themes, demographics, and intent
2. Extract context clues from the description
3. Infer appropriate activity types and complexity levels
4. Consider the specific use case and target audience

QUALITY STANDARDS:
- Maintain strict relevance to the stated theme
- Demonstrate understanding of the specific context
- Provide creative yet practical suggestions
- Ensure suggestions align with the intended purpose`
      };

      const basePrompt = categoryPrompts[category] || categoryPrompts.custom;
      
      // Add pattern analysis insights
      let patternInsights = '';
      if (!optionAnalysis.isEmpty) {
        const themes = optionAnalysis.themes.join(', ');
        patternInsights = `
EXISTING OPTION ANALYSIS:
- Current collection has ${optionAnalysis.patterns ? Object.keys(optionAnalysis.patterns.commonWords || {}).length : 0} options
- Average length: ${Math.round(optionAnalysis.avgLength || 0)} characters
- Complexity level: ${optionAnalysis.complexity}
- Detected themes: ${themes || 'general'}
- Pattern consistency: Match the established style and complexity level`;
      } else {
        patternInsights = `
EMPTY WHEEL CONTEXT:
- This is a fresh start - no existing options to reference
- Use title and description to infer appropriate suggestions
- Establish a consistent style and theme for future additions
- Consider the target demographic and intended use case`;
      }

      return `${basePrompt}

CONTEXT: "${titleName}" - ${description}
${patternInsights}

SUGGESTION STRATEGY:
1. ANALYZE: Study the existing patterns and context thoroughly
2. DIFFERENTIATE: Ensure complete uniqueness from existing and declined items
3. CONTEXTUALIZE: Match the established theme and style perfectly
4. VALIDATE: Confirm relevance, appropriateness, and practical value

OUTPUT FORMAT:
- Return ONLY the suggestion (1-4 words maximum)
- Keep it under 25 characters total
- Make it clear, actionable, and memorable
- NO explanations, quotes, or extra formatting
- Match the style and complexity of existing items`;
    };

    // Analyze existing options for pattern recognition
    const optionAnalysis = analyzeExistingOptions(existingActivities);
    const systemPrompt = generateSystemPrompt(titleCategory, titleName, titleDescription, optionAnalysis);

    // Enhanced semantic similarity checking for declined suggestions
    const createSemanticExclusions = (declinedList) => {
      if (declinedList.length === 0) return 'None declined yet';
      
      const exclusions = declinedSuggestions.map(item => {
        const variations = [];
        const words = item.toLowerCase().split(' ');
        
        // Add common variations and synonyms
        words.forEach(word => {
          const synonyms = {
            'soccer': ['football', 'kick ball'],
            'football': ['soccer', 'american football'],
            'movie': ['film', 'cinema', 'video'],
            'read': ['reading', 'book'],
            'cook': ['cooking', 'chef', 'kitchen'],
            'game': ['games', 'gaming', 'play'],
            'music': ['song', 'singing', 'audio'],
            'walk': ['walking', 'stroll', 'hike'],
            'draw': ['drawing', 'sketch', 'art']
          };
          
          if (synonyms[word]) {
            variations.push(...synonyms[word]);
          }
        });
        
        return variations.length > 0 ? `${item} (avoid variations: ${variations.join(', ')})` : item;
      });
      
      return exclusions.join('; ');
    };

    const enhancedDeclinedList = createSemanticExclusions(declinedSuggestions);

    // Enhanced multi-step reasoning prompt
    const basePrompt = `STEP 1 - CONTEXT ANALYSIS:
Current wheel contents: ${optionsList}
Previously declined suggestions: ${enhancedDeclinedList}
Title context: "${titleName}" (Category: ${titleCategory})
Description: ${titleDescription}

STEP 2 - PATTERN RECOGNITION:
${optionAnalysis.isEmpty ? 
  `- Empty wheel: Focus on establishing strong thematic foundation
   - Infer demographics and preferences from title/description
   - Create gateway option that opens possibilities for future additions` :
  `- Existing option count: ${existingActivities.length}
   - Pattern themes detected: ${optionAnalysis.themes.join(', ') || 'general'}
   - Complexity level: ${optionAnalysis.complexity}
   - Average length: ${Math.round(optionAnalysis.avgLength)} characters
   - Style consistency: Match established patterns`}

STEP 3 - EXCLUSION VALIDATION:
- Verify NO similarity to existing items (including partial matches)
- Verify NO similarity to declined suggestions (including synonyms/variations)
- Check for semantic duplicates, not just exact text matches

STEP 4 - SUGGESTION GENERATION:
Generate ONE suggestion that:
1. FITS PERFECTLY within the established theme and category
2. MAINTAINS CONSISTENCY with existing activity patterns and style
3. PROVIDES MEANINGFUL DIVERSITY without breaking theme coherence
4. OFFERS PRACTICAL VALUE and clear actionability
5. RESPECTS ALL exclusions (existing + declined + variations)
6. BALANCES FAMILIARITY with discovery potential`;

    // Enhanced retry logic with pattern learning
    const retryEnhancement = isRetry ? `

🔄 CRITICAL RETRY - Previous attempts failed validation:
- ANALYZE failures: Review what was rejected and why
- AVOID ALL PATTERNS that led to previous rejections
- INCREASE DIVERGENCE from both existing and declined items
- DOUBLE-CHECK exclusions before finalizing suggestion
- PRIORITIZE uniqueness while maintaining thematic relevance
- Consider less obvious but highly relevant suggestions` : '';

    const userPrompt = basePrompt + retryEnhancement + `

FINAL OUTPUT: Return ONLY the option name (no explanations, formatting, or extra text):`;

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
        max_tokens: 75, // Increased for enhanced prompt processing
        temperature: 0.6 // Slightly higher for creativity while maintaining relevance
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', errorText);
      return res.status(500).json({ error: 'API request failed' });
    }

    const data = await response.json();
    res.status(200).json(data);
    
  } catch (error) {
    console.error('Error in suggest-activity API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 