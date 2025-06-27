// Vercel serverless function for bulk AI activity suggestions
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

  const { existingActivities, declinedSuggestions = [], count = 5, category } = req.body;

  if (!Array.isArray(existingActivities)) {
    return res.status(400).json({ error: 'Existing activities must be an array' });
  }

  if (!Array.isArray(declinedSuggestions)) {
    return res.status(400).json({ error: 'Declined suggestions must be an array' });
  }

  if (typeof count !== 'number' || count < 1 || count > 10) {
    return res.status(400).json({ error: 'Count must be a number between 1 and 10' });
  }

  try {
    const activitiesList = existingActivities.length > 0 
      ? existingActivities.join(', ') 
      : 'No activities yet';

    const declinedList = declinedSuggestions.length > 0 
      ? declinedSuggestions.join(', ') 
      : 'None declined yet';

    const categoryFilter = category 
      ? `Focus on ${category.toLowerCase()} activities. `
      : '';

    // Enhanced prompt for bulk activity generation
    const systemPrompt = `You are a practical activity expert for kids aged 3-12. Your goal is to suggest simple, recognizable activities that kids and parents easily understand.

PRACTICAL GUIDELINES:
- Suggest COMMON, well-known activities that most families can do
- Focus on simple, clear activities like: "Play Soccer", "Draw Pictures", "Bake Cookies", "Read Books", "Build Blocks"
- Consider different categories: arts & crafts, sports, cooking, reading, building, music, outdoor play, board games
- Avoid abstract, complex, or unusual activities
- Keep suggestions practical and immediately recognizable
- Ensure variety across different activity types
- Each activity should be 1-3 words maximum, under 20 characters

GOOD EXAMPLES: "Play Tag", "Make Slime", "Ride Bikes", "Do Puzzles", "Plant Seeds", "Play Chess", "Sing Songs"
BAD EXAMPLES: Abstract concepts, overly creative names, complex multi-step activities

OUTPUT FORMAT:
- Return ONLY a numbered list of activity names
- Each line should be: "1. Activity Name"
- NO explanations, quotes, or extra text
- Each activity should be unique and different`;

    const userPrompt = `Current activities: ${activitiesList}
Previously declined suggestions: ${declinedList}

${categoryFilter}Generate ${count} simple, recognizable activities that:
1. Are completely different from ALL existing activities
2. Are NOT any of the previously declined suggestions
3. Are common activities most kids know
4. Are age-appropriate for kids (3-12 years)
5. Are practical and easy to understand
6. Cover different types of activities for variety

IMPORTANT: 
- Do not suggest any activity from the declined list
- Make sure all ${count} activities are different from each other
- Focus on well-known, practical activities
- If existing activities are mostly physical, include some arts/crafts or quiet activities
- If mostly indoor, include some simple outdoor activities

Return exactly ${count} activities in this format:
1. Activity Name
2. Activity Name
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
    
    // Parse the response to extract activity names
    let activities = [];
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      const content = data.choices[0].message.content.trim();
      
      // Extract activities from numbered list format
      const lines = content.split('\n');
      activities = lines
        .map(line => line.trim())
        .filter(line => /^\d+\./.test(line)) // Only lines that start with number and dot
        .map(line => line.replace(/^\d+\.\s*/, '').trim()) // Remove number and dot
        .filter(activity => activity.length > 0 && activity.length <= 50) // Valid length
        .slice(0, count); // Ensure we don't exceed requested count
    }

    // Fallback if parsing fails - return the raw response
    if (activities.length === 0) {
      activities = [data.choices?.[0]?.message?.content?.trim() || 'Play Games'];
    }

    // Return the processed activities
    res.status(200).json({
      ...data,
      extractedActivities: activities,
      requestedCount: count,
      actualCount: activities.length
    });
    
  } catch (error) {
    console.error('Error in suggest-multiple-activities API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 