// Vercel serverless function for AI activity suggestions
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
    titleName = 'Kids Activity',
    titleCategory = 'family',
    titleDescription = 'Random activities',
    isRetry = false
  } = req.body;

  if (!Array.isArray(existingActivities)) {
    return res.status(400).json({ error: 'Existing activities must be an array' });
  }

  if (!Array.isArray(declinedSuggestions)) {
    return res.status(400).json({ error: 'Declined suggestions must be an array' });
  }

  try {
    const activitiesList = existingActivities.length > 0 
      ? existingActivities.join(', ') 
      : 'No activities yet';

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

        games: `You are a game expert suggesting fun activities and games. Focus on party games, sports, challenges, and entertainment.
        
GUIDELINES:
- Suggest engaging games for various group sizes and ages
- Include party games, sports, puzzles, challenges, and competitions
- Consider indoor/outdoor options and required materials
- Range from quick games to longer activities
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

        education: `You are an educational expert suggesting learning topics and activities. Focus on knowledge, skills, and personal development.
        
GUIDELINES:
- Suggest educational topics and learning activities
- Include academic subjects, practical skills, and creative pursuits
- Consider different learning styles and difficulty levels
- Range from basic to advanced topics
- Examples: "Spanish Language", "Photography", "Critical Thinking", "Science Experiment"`,

        workplace: `You are a workplace wellness expert suggesting professional break activities. Focus on office-appropriate stress relief and productivity.
        
GUIDELINES:
- Suggest professional, office-appropriate activities
- Include stress relief, networking, and skill development options
- Consider different time constraints (5-30 minutes)
- Focus on activities that refresh and energize
- Examples: "Quick Walk", "Desk Yoga", "Team Coffee", "Brain Games"`,

        family: `You are a family activity expert suggesting engaging activities for all ages. Focus on bonding, fun, and shared experiences.
        
GUIDELINES:
- Suggest activities suitable for families and groups
- Include indoor/outdoor options and various skill levels
- Consider bonding, learning, and entertainment value
- Range from quiet to active activities
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
- Return ONLY the suggestion (1-4 words maximum)
- Keep it under 25 characters
- Make it clear and actionable
- NO explanations, quotes, or extra text
- Match the style and theme of existing items`;
    };

    const systemPrompt = generateSystemPrompt(titleCategory, titleName, titleDescription);

    const basePrompt = `Current items: ${activitiesList}
Previously declined suggestions: ${declinedList}

Suggest ONE appropriate item that:
1. Is different from ALL existing items
2. Is NOT any of the previously declined suggestions  
3. Fits perfectly with the theme "${titleName}"
4. Matches the context: ${titleDescription}
5. Is practical and easily understood

Analyze the existing items to understand the pattern and suggest something that fits the same style and category. Provide variety - if existing items follow a certain pattern, maintain consistency while adding diversity.

IMPORTANT: Do not suggest any item from the declined list even if it fits the theme.`;

    // Enhanced prompt for retry attempts
    const retryEnhancement = isRetry ? `

🔄 RETRY ATTEMPT: Previous suggestions failed validation. Please be extra careful to:
- Avoid ALL items listed in "Current items" above
- Avoid ALL items listed in "Previously declined suggestions" above  
- Suggest something completely different and unique
- Double-check that your suggestion is not a duplicate or variation of existing items` : '';

    const userPrompt = basePrompt + retryEnhancement + '\n\nSuggestion only:';

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
        max_tokens: 50, // Reduced since we only need activity name
        temperature: 0.5 // Balanced for practical, recognizable suggestions
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