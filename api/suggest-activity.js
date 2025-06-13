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

    // Enhanced prompt for more creative and diverse suggestions
    const systemPrompt = `You are a creative activity expert for kids aged 3-12. Your goal is to suggest diverse, engaging activities that spark imagination and fun.

CREATIVITY GUIDELINES:
- Think outside the box! Consider indoor/outdoor, active/quiet, solo/group, creative/educational activities
- Explore different categories: arts & crafts, science experiments, physical activities, imaginative play, cooking, nature exploration, building, music, storytelling, games
- Consider seasonal activities, cultural activities, and unique experiences
- Be innovative - suggest activities that might be unexpected but age-appropriate and safe

OUTPUT FORMAT:
- Return ONLY the activity name (1-3 words maximum)
- Keep it under 20 characters
- Make it clear and actionable (e.g., "Build Robots", "Make Slime", "Treasure Hunt")
- NO explanations, quotes, or extra text`;

    const userPrompt = `Current activities: ${activitiesList}

Suggest ONE completely NEW activity that:
1. Is different from ALL existing activities
2. Brings fresh variety to the collection
3. Is age-appropriate for kids (3-12 years)
4. Is creative and engaging

Think creatively about different activity categories. If the existing activities are mostly physical, consider creative/educational ones. If they're mostly indoor, consider outdoor options. Aim for diversity and surprise!

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
        model: "anthropic/claude-3.5-sonnet", // Upgraded to more creative model
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
        temperature: 0.9 // Increased for more creativity and variety
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