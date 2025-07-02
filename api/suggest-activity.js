// Vercel serverless function for AI option suggestions (SIMPLIFIED VERSION)
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
    // Simple helper to format the option lists for the prompt
    const formatOptionsList = (options) => {
      return options.length > 0 ? options.join(', ') : 'None';
    };

    // Ultra-constrained prompt for better results
    const userPrompt = `Generate ONE single option for a ${titleName} wheel.

RULES:
1. Respond with ONLY the option name, nothing else
2. Keep it 1-5 words maximum  
3. Make it relevant to: ${titleDescription}
4. Do NOT include any of these existing options: [${formatOptionsList(existingActivities)}]
5. Do NOT include any of these rejected options: [${formatOptionsList(declinedSuggestions)}]

Examples of good responses:
- "Swimming"
- "Board Games"
- "Cook Dinner" 
- "Movie Night"

Generate ONE option now:`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://spin2pick.app",
        "X-Title": "Spin2Pick App"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.2-3b-instruct",
        messages: [
          {
            role: "user",
            content: userPrompt
          }
        ],
        max_tokens: 100, // Very limited for single option only
        temperature: 0.8 // Balanced for creativity with consistency
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