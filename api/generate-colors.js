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
    style = 'modern_vibrant', 
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

  // Define color style presets with specific characteristics
  const stylePresets = {
    modern_vibrant: {
      name: "Modern Vibrant",
      characteristics: "bright, energetic colors with good contrast",
      harmonyType: "triadic or split-complementary",
      saturation: "70-95%",
      brightness: "75-90%",
      examples: "#E74C3C, #3498DB, #2ECC71, #F39C12"
    },
    neon_futuristic: {
      name: "Neon Futuristic",
      characteristics: "electric, glowing colors with cyberpunk aesthetic",
      harmonyType: "complementary or electric contrasts",
      saturation: "90-100%",
      brightness: "85-100%",
      examples: "#FF0080, #00FFFF, #FF1493, #00FF00, #FF4500, #9400D3"
    },
    pastel_harmony: {
      name: "Pastel Harmony",
      characteristics: "soft, gentle colors that blend beautifully",
      harmonyType: "analogous or monochromatic",
      saturation: "40-70%",
      brightness: "80-95%",
      examples: "#FFACAB, #FFCEA2, #FFF29C, #E4FEBD"
    },
    sunset_gradient: {
      name: "Sunset Gradient",
      characteristics: "warm colors flowing from orange to pink to purple",
      harmonyType: "analogous warm tones",
      saturation: "60-85%",
      brightness: "70-85%",
      examples: "#FF6B35, #F7931E, #FF8E53, #FF4081"
    },
    ocean_depths: {
      name: "Ocean Depths",
      characteristics: "cool blues and teals with aquatic feel",
      harmonyType: "analogous cool tones",
      saturation: "55-80%",
      brightness: "65-85%",
      examples: "#0077BE, #00A8CC, #7DD3C0, #4CB5F5"
    },
    forest_earth: {
      name: "Forest Earth",
      characteristics: "natural greens and earth tones",
      harmonyType: "analogous earth tones",
      saturation: "50-75%",
      brightness: "60-80%",
      examples: "#228B22, #32CD32, #90EE90, #9ACD32"
    },
    retro_synthwave: {
      name: "Retro Synthwave",
      characteristics: "80s-inspired electric colors with high contrast",
      harmonyType: "high contrast electric",
      saturation: "85-100%",
      brightness: "80-95%",
      examples: "#FF00FF, #00FFFF, #FF1493, #FFFF00"
    },
    minimal_elegant: {
      name: "Minimal Elegant",
      characteristics: "sophisticated muted tones with subtle variation",
      harmonyType: "monochromatic or subtle analogous",
      saturation: "30-60%",
      brightness: "70-85%",
      examples: "#E8E8E8, #D1D1D1, #B8B8B8, #A0A0A0"
    }
  };

  const selectedStyle = stylePresets[style] || stylePresets.modern_vibrant;

  try {
    const existingColorsList = existingColors.length > 0 
      ? existingColors.join(', ') 
      : 'No existing colors to avoid';

    // Enhanced professional color generation prompt
    const systemPrompt = `You are an expert color designer specializing in creating harmonious, cohesive color palettes for digital interfaces.

CORE DESIGN PRINCIPLES:
- Generate colors that form a COHESIVE, HARMONIOUS palette
- Colors should work beautifully together, not just be random distinct colors
- Follow color theory: ${selectedStyle.harmonyType}
- Use ${selectedStyle.characteristics}
- Saturation range: ${selectedStyle.saturation}
- Brightness range: ${selectedStyle.brightness}

COLOR HARMONY TECHNIQUES:
1. ANALOGOUS: Colors next to each other on color wheel (most harmonious)
2. COMPLEMENTARY: Colors opposite on color wheel (high contrast)
3. TRIADIC: Three colors equally spaced on color wheel
4. SPLIT-COMPLEMENTARY: Base color + two adjacent to its complement
5. MONOCHROMATIC: Variations of a single hue

TECHNICAL REQUIREMENTS:
- Return exactly ${count} hex colors in JSON array format
- Each color must be a valid 6-digit hex code (e.g., #FF5733)
- Colors should transition smoothly or complement each other
- Ensure accessibility with good contrast ratios
- Follow the ${selectedStyle.name} aesthetic precisely

OUTPUT FORMAT:
- Return ONLY a valid JSON array of hex colors
- Example: ["#E74C3C", "#E67E22", "#F39C12", "#F1C40F"]
- NO explanations, quotes, or extra text
- NO markdown formatting or code blocks`;

    const userPrompt = `Create a ${selectedStyle.name} color palette with ${count} colors for a ${context}.

STYLE REQUIREMENTS:
- Theme: ${selectedStyle.name}
- Characteristics: ${selectedStyle.characteristics}
- Color harmony: ${selectedStyle.harmonyType}
- Saturation: ${selectedStyle.saturation}
- Brightness: ${selectedStyle.brightness}
- Reference colors: ${selectedStyle.examples}

${existingColors.length > 0 ? `AVOID these existing colors: ${existingColorsList}` : ''}

CRITICAL: Generate colors that work TOGETHER as a cohesive set. They should either:
1. Flow smoothly from one to another (gradient-like)
2. Be variations of related hues (analogous harmony)
3. Create balanced contrast (complementary pairs)
4. Share similar saturation/brightness for unity

The colors should look like they belong to the same design system, not random colors thrown together.

Return exactly ${count} colors as a JSON array:`;

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
        max_tokens: 250, // Slightly more for better responses
        temperature: 0.6 // Slightly lower for more consistent color harmony
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
        
        // Ensure we have the requested count with fallbacks by style
        if (colors.length < count) {
          const fallbacksByStyle = {
            neon_futuristic: [
              '#FF0080', '#00FFFF', '#FF1493', '#00FF00', '#FF4500', '#9400D3',
              '#FF00FF', '#00BFFF', '#FF69B4', '#32CD32', '#FFD700', '#FF8C00'
            ],
            pastel_harmony: [
              '#FFACAB', '#FFCEA2', '#FFF29C', '#E4FEBD', '#C2FFE1', '#ABFCFE',
              '#C5E5FE', '#C4D1FE', '#DDC4FC', '#FEE0F3', '#FFC7C6', '#FFD7B3'
            ],
            sunset_gradient: [
              '#FF6B35', '#F7931E', '#FF8E53', '#FFD93D', '#FFC72C', '#FF9F1C',
              '#FF7F00', '#FF5722', '#FF4081', '#E91E63', '#9C27B0', '#673AB7'
            ],
            ocean_depths: [
              '#0077BE', '#00A8CC', '#7DD3C0', '#86C5D8', '#4CB5F5', '#2E8BC0',
              '#1E6091', '#0F3460', '#00BCD4', '#26C6DA', '#4DD0E1', '#80DEEA'
            ],
            retro_synthwave: [
              '#FF00FF', '#00FFFF', '#FF1493', '#FFFF00', '#FF0080', '#00FF00',
              '#FF4500', '#9400D3', '#FF69B4', '#32CD32', '#FFD700', '#FF8C00'
            ]
          };
          
          const fallbackColors = fallbacksByStyle[style] || [
            '#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6', '#1ABC9C',
            '#E67E22', '#34495E', '#F1C40F', '#E91E63', '#FF9800', '#607D8B'
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
        
        // Style-specific fallback colors
        const styleDefaults = {
          neon_futuristic: ['#FF0080', '#00FFFF', '#FF1493', '#00FF00', '#FF4500', '#9400D3'],
          pastel_harmony: ['#FFACAB', '#FFCEA2', '#FFF29C', '#E4FEBD', '#C2FFE1', '#ABFCFE'],
          sunset_gradient: ['#FF6B35', '#F7931E', '#FF8E53', '#FFD93D', '#FFC72C', '#FF9F1C'],
          ocean_depths: ['#0077BE', '#00A8CC', '#7DD3C0', '#86C5D8', '#4CB5F5', '#2E8BC0'],
          retro_synthwave: ['#FF00FF', '#00FFFF', '#FF1493', '#FFFF00', '#FF0080', '#00FF00']
        };
        
        const defaultSet = styleDefaults[style] || [
          '#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6', '#1ABC9C'
        ];
        
        colors = [...defaultSet].slice(0, count);
        
        // Fill remaining if needed
        while (colors.length < count) {
          colors.push('#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0').toUpperCase());
        }
      }
    }

    // Return the processed colors with metadata
    res.status(200).json({
      ...data,
      extractedColors: colors,
      requestedCount: count,
      actualCount: colors.length,
      style: style,
      styleName: selectedStyle.name,
      styleCharacteristics: selectedStyle.characteristics,
      context: context,
      reasoning: reasoning,
      availableStyles: Object.keys(stylePresets)
    });
    
  } catch (error) {
    console.error('Error in generate-colors API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 