// Vercel serverless function for AI activity suggestions
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const { existingActivities } = req.body;

  if (!Array.isArray(existingActivities)) {
    return res.status(400).json({ error: 'Existing activities must be an array' });
  }

  try {
    const activitiesList = existingActivities.length > 0 
      ? existingActivities.join(', ') 
      : 'No activities yet';

    // Practical prompt for recognizable, common activities
    const systemPrompt = `You are a practical activity expert for kids aged 3-12. Your goal is to suggest simple, recognizable activities that kids and parents easily understand.

PRACTICAL GUIDELINES:
- Suggest COMMON, well-known activities that most families can do
- Focus on simple, clear activities like: "Play Soccer", "Draw Pictures", "Bake Cookies", "Read Books", "Build Blocks"
- Consider different categories: arts & crafts, sports, cooking, reading, building, music, outdoor play, board games
- Avoid abstract, complex, or unusual activities
- Keep suggestions practical and immediately recognizable

GOOD EXAMPLES: "Play Tag", "Make Slime", "Ride Bikes", "Do Puzzles", "Plant Seeds", "Play Chess", "Sing Songs"
BAD EXAMPLES: Abstract concepts, overly creative names, complex multi-step activities

OUTPUT FORMAT:
- Return ONLY the activity name (1-3 words maximum)
- Keep it under 20 characters
- Make it clear and actionable
- NO explanations, quotes, or extra text`;

    const userPrompt = `Current activities: ${activitiesList}

Suggest ONE simple, recognizable activity that:
1. Is different from ALL existing activities
2. Is a common activity most kids know
3. Is age-appropriate for kids (3-12 years)
4. Is practical and easy to understand

Focus on well-known activities. If existing activities are mostly physical, consider arts/crafts or quiet activities. If mostly indoor, consider simple outdoor activities.

Activity name only:`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://spin2pick.app",
        "X-Title": "Spin2Pick App"
      },
      body: JSON.stringify({
        model: "liquid/lfm-7b", // Cost-effective model
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