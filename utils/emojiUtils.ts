// API key for OpenRouter
const API_KEY = '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';

/**
 * Get an appropriate emoji for an activity using AI
 * @param activityName The name of the activity
 * @returns A promise that resolves to an emoji string
 */
export const getEmojiForActivity = async (activityName: string): Promise<string> => {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': 'https://pick2play.app', // Using a placeholder domain
        'X-Title': 'PICK2PLAY App',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku', // Using a cheaper, faster model
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that returns a single appropriate emoji for an activity. Just return the emoji character with no other text or explanation.'
          },
          {
            role: 'user',
            content: `Give me one emoji that best represents this activity: "${activityName}"`
          }
        ],
        max_tokens: 10,
      })
    });

    if (!response.ok) {
      console.error('API error:', await response.text());
      return '🎲'; // Default fallback emoji
    }

    const data = await response.json();
    const emojiText = data.choices[0]?.message?.content?.trim() || '🎲';
    
    // Extract just the emoji if there's any additional text
    const emojiRegex = /(\p{Emoji})/u;
    const match = emojiText.match(emojiRegex);
    return match ? match[0] : '🎲';
    
  } catch (error) {
    console.error('Error getting emoji:', error);
    return '🎲'; // Default fallback emoji
  }
};

/**
 * Cache for storing already generated emojis to avoid redundant API calls
 */
const emojiCache: Record<string, string> = {
  // Preset mappings for common activities
  'Sing Songs': '🎤',
  'Craft Corner': '🎨',
  'Jump Trampoline': '🤸',
  'Plant Seeds': '🌱',
  'Hide and Seek': '🙈',
  'Dance Party': '💃',
  'Puzzle Time': '🧩',
  'Read a Book': '📚',
};

/**
 * Get an emoji for an activity, using cache when possible
 * @param activityName The name of the activity
 * @returns A promise that resolves to an emoji string
 */
export const getEmoji = async (activityName: string): Promise<string> => {
  // Check if we already have this emoji cached
  if (emojiCache[activityName]) {
    return emojiCache[activityName];
  }
  
  try {
    const emoji = await getEmojiForActivity(activityName);
    // Save to cache for future use
    emojiCache[activityName] = emoji;
    return emoji;
  } catch (error) {
    console.error('Error in getEmoji:', error);
    return '🎲'; // Default fallback emoji
  }
}; 