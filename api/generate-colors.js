// Vercel serverless function for AI color generation
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
    count = 12, 
    style = 'modern and vibrant', 
    context = 'game interface',
    existingColors = []
  } = req.body;

  // Validate input parameters
  if (typeof count !== 'number' || count < 1 || count > 20) {
    return res.status(400).json({ error: 'Count must be a number between 1 and 20' });
  }

  if (!Array.isArray(existingColors)) {
    return res.status(400).json({ error: 'Existing colors must be an array' });
  }

  try {
    const existingColorsList = existingColors.length > 0 
      ? existingColors.join(', ') 
      : 'No existing colors to avoid';

    // Professional color generation prompt
    const systemPrompt = `You are a professional color designer and UI/UX expert specializing in creating harmonious color palettes for digital interfaces.

DESIGN PRINCIPLES:
- Generate colors that work well together following color theory
- Ensure high contrast and readability for game interfaces
- Use vibrant, engaging colors suitable for interactive applications
- Consider accessibility and visual appeal
- Create distinct colors that are easily distinguishable
- Follow modern design trends and color harmony principles

COLOR REQUIREMENTS:
- Return exactly ${count} hex colors in JSON array format
- Each color must be a valid 6-digit hex code (e.g., #FF5733)
- Colors should be visually distinct from each other
- High saturation and brightness for game interface visibility
- Good contrast ratios for text readability
- Follow color theory: complementary, triadic, analogous, or split-complementary schemes

OUTPUT FORMAT:
- Return ONLY a valid JSON array of hex colors
- Example: ["#E74C3C", "#3498DB", "#2ECC71", "#F39C12", "#9B59B6", "#1ABC9C"]
- NO explanations, quotes, or extra text
- NO markdown formatting or code blocks`;

    const userPrompt = `Generate ${count} hex colors for a ${context} with ${style} aesthetic.

${existingColors.length > 0 ? `Avoid these existing colors: ${existingColorsList}` : ''}

Requirements:
1. Create a cohesive color palette that works well together
2. Ensure colors are visually distinct and easily distinguishable
3. Use vibrant, engaging colors suitable for interactive games
4. Follow color theory principles for harmony
5. Ensure good contrast for readability
6. Make colors modern and appealing

Return exactly ${count} colors as a JSON array of hex codes:`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://spin2pick.app",
        "X-Title": "Spin2Pick App"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.2-3b-instruct", // Same model as other AI features
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
        max_tokens: 200, // Enough for color array response
        temperature: 0.7 // Balanced creativity for color generation
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', errorText);
      return res.status(500).json({ error: 'API request failed' });
    }

    const data = await response.json();
    
    // Parse the response to extract colors
    let colors = [];
    let reasoning = '';
    
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      const content = data.choices[0].message.content.trim();
      reasoning = content;
      
      try {
        // Try to parse as JSON array first
        const jsonMatch = content.match(/\[.*\]/);
        if (jsonMatch) {
          colors = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback: extract hex codes with regex
          const hexPattern = /#[0-9A-Fa-f]{6}/g;
          const matches = content.match(hexPattern);
          if (matches) {
            colors = matches.slice(0, count);
          }
        }
        
        // Validate colors
        colors = colors.filter(color => 
          typeof color === 'string' && 
          /^#[0-9A-Fa-f]{6}$/i.test(color)
        );
        
        // Ensure we have the requested count
        if (colors.length < count) {
          // Fill remaining with fallback colors if needed
          const fallbackColors = [
            '#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6', '#1ABC9C',
            '#E67E22', '#34495E', '#F1C40F', '#E91E63', '#FF9800', '#607D8B',
            '#FF5722', '#4CAF50', '#2196F3', '#FF4081', '#00BCD4', '#FFC107',
            '#8BC34A', '#673AB7'
          ];
          
          while (colors.length < count && fallbackColors.length > 0) {
            const fallback = fallbackColors.shift();
            if (!colors.includes(fallback)) {
              colors.push(fallback);
            }
          }
        }
        
        // Trim to exact count
        colors = colors.slice(0, count);
        
      } catch (parseError) {
        console.error('Error parsing AI color response:', parseError);
        
        // Complete fallback - return default vibrant colors
        colors = [
          '#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6', '#1ABC9C',
          '#E67E22', '#34495E', '#F1C40F', '#E91E63', '#FF9800', '#607D8B'
        ].slice(0, count);
      }
    }

    // Return the processed colors with metadata
    res.status(200).json({
      ...data,
      extractedColors: colors,
      requestedCount: count,
      actualCount: colors.length,
      style: style,
      context: context,
      reasoning: reasoning
    });
    
  } catch (error) {
    console.error('Error in generate-colors API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 