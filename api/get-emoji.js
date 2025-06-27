// Vercel serverless function for emoji generation
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

  const { activityName } = req.body;

  if (!activityName) {
    return res.status(400).json({ error: 'Activity name is required' });
  }

  try {
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
            content: 'Return only one emoji for kids\' activities. Choose clear, directly related emojis. Examples: "Sing Songs"→🎤, "Draw"→🎨, "Soccer"→⚽, "Read"→📚, "Dance"→💃, "Bake"→🍪'
          },
          {
            role: "user",
            content: `Emoji for: "${activityName}"`
          }
        ],
        max_tokens: 10
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
    console.error('Error in get-emoji API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 