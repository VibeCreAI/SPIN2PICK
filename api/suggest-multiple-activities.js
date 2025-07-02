// Vercel serverless function for bulk AI option suggestions (SIMPLIFIED VERSION)
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
    // Simple helper to format the option lists for the prompt
    const formatOptionsList = (options) => {
      return options.length > 0 ? options.join(', ') : 'None';
    };

    // Ultra-constrained prompt for bulk suggestions
    const userPrompt = `Generate ${count} options for a ${titleName} wheel.

RULES:
1. Respond with ONLY a numbered list, nothing else
2. Each option should be 1-5 words maximum
3. Make them relevant to: ${titleDescription}  
4. Do NOT include any of these existing options: [${formatOptionsList(existingActivities)}]
5. Do NOT include any of these rejected options: [${formatOptionsList(declinedSuggestions)}]

Examples of good format:
1. Swimming
2. Board Games
3. Cook Dinner
4. Movie Night
5. Reading Books

Generate exactly ${count} options now:`;

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
        max_tokens: 500, // Reduced for focused bulk response  
        temperature: 0.8 // Balanced for variety with consistency
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