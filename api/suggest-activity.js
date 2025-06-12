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

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://spin2pick.app",
        "X-Title": "Spin2Pick App"
      },
      body: JSON.stringify({
        model: "liquid/lfm-7b",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that suggests fun activities for kids. You must return ONLY the activity name, nothing else. Prefer TWO-WORD activity names when possible (like 'Play Soccer', 'Draw Pictures', 'Bake Cookies'). The activity name must be 20 characters or less and must be a complete, proper activity name. Make sure the suggested activity is different from the existing ones and fits well with the theme/trend of activities already present."
          },
          {
            role: "user",
            content: `Based on these existing activities: "${activitiesList}", suggest ONE new fun activity for kids that is different from the existing ones and fits the theme. Prefer a SHORT, TWO-WORD activity name when possible (examples: 'Play Soccer', 'Draw Pictures', 'Build Blocks'). The activity name must be 20 characters or less and must be complete (not truncated). Return only the activity name, no explanations, no quotes, no periods.`
          }
        ],
        max_tokens: 100,
        temperature: 0.7
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