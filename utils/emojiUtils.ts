// API key for OpenRouter - now using environment variable
const API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;

if (!API_KEY) {
  throw new Error('EXPO_PUBLIC_OPENROUTER_API_KEY environment variable is not set');
}

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
        'HTTP-Referer': 'https://spin2pick.app', // Using a placeholder domain
        'X-Title': 'Spin2Pick App',
      },
      body: JSON.stringify({
        model: 'liquid/lfm-7b', // Using the liquid model
        messages: [
          {
            role: 'system',
            content: 'Return only one emoji for kids\' activities. Choose clear, directly related emojis. Examples: "Sing Songs"→🎤, "Draw"→🎨, "Soccer"→⚽, "Read"→📚, "Dance"→💃, "Bake"→🍪'
          },
          {
            role: 'user',
            content: `Emoji for: "${activityName}"`
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

/**
 * Get an AI-suggested activity based on existing activities
 * @param existingActivities Array of existing activity names
 * @returns A promise that resolves to a suggested activity name
 */
export const getAISuggestedActivity = async (existingActivities: string[]): Promise<string> => {
  try {
    const activitiesList = existingActivities.length > 0 
      ? existingActivities.join(', ') 
      : 'No activities yet';

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': 'https://spin2pick.app',
        'X-Title': 'Spin2Pick App',
      },
      body: JSON.stringify({
        model: 'liquid/lfm-7b',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that suggests fun activities for kids. You must return ONLY the activity name, nothing else. The activity name must be 20 characters or less and must be a complete, proper activity name. Make sure the suggested activity is different from the existing ones and fits well with the theme/trend of activities already present.'
          },
          {
            role: 'user',
            content: `Based on these existing activities: "${activitiesList}", suggest ONE new fun activity for kids that is different from the existing ones and fits the theme. The activity name must be 20 characters or less and must be complete (not truncated). Return only the activity name, no explanations, no quotes, no periods.`
          }
        ],
        max_tokens: 50, // Increased to ensure complete responses
        temperature: 0.7, // Slightly reduced for more consistent responses
      })
    });

    if (!response.ok) {
      console.error('API error:', await response.text());
      return getRandomFallbackActivity(existingActivities);
    }

    const data = await response.json();
    let rawResponse = data.choices[0]?.message?.content || '';
    
    console.log('🤖 Raw AI response:', JSON.stringify(rawResponse)); // Debug logging
    
    // More comprehensive cleaning
    let suggestedActivity = rawResponse
      .trim()
      .replace(/^["'`]|["'`]$/g, '') // Remove quotes and backticks
      .replace(/^\.|\.$/g, '') // Remove leading/trailing periods
      .replace(/^-\s*/, '') // Remove leading dashes
      .replace(/^\d+\.\s*/, '') // Remove numbered list format
      .split('\n')[0] // Take only first line
      .split('.')[0] // Take only first sentence
      .split(',')[0] // Take only first part before comma
      .trim();

    console.log('🧹 Cleaned response:', JSON.stringify(suggestedActivity)); // Debug logging

    // Validate the response
    if (!suggestedActivity) {
      console.log('❌ Empty response after cleaning');
      return getRandomFallbackActivity(existingActivities);
    }

    // Check if it looks like a truncated word (starts with lowercase or has weird patterns)
    if (suggestedActivity.length < 3 || 
        /^[a-z]/.test(suggestedActivity) || // Starts with lowercase
        /^[^a-zA-Z]/.test(suggestedActivity) || // Starts with non-letter
        suggestedActivity.includes('edy"') || // Contains the specific issue you mentioned
        suggestedActivity.length > 20) {
      console.log('❌ Invalid response format:', suggestedActivity);
      return getRandomFallbackActivity(existingActivities);
    }

    // Check for duplicates
    if (existingActivities.includes(suggestedActivity)) {
      console.log('❌ Duplicate activity suggested:', suggestedActivity);
      return getRandomFallbackActivity(existingActivities);
    }

    // Final validation - ensure it's a reasonable activity name
    if (!/^[A-Z][a-zA-Z\s]*$/.test(suggestedActivity)) {
      console.log('❌ Activity name format invalid:', suggestedActivity);
      return getRandomFallbackActivity(existingActivities);
    }

    console.log('✅ Valid AI suggestion:', suggestedActivity);
    return suggestedActivity;
    
  } catch (error) {
    console.error('Error getting AI suggested activity:', error);
    return getRandomFallbackActivity(existingActivities);
  }
};

/**
 * Fallback activity suggestions when AI fails
 */
const FALLBACK_ACTIVITIES = [
  'Build Blocks', 'Draw Pictures', 'Play Soccer', 'Bake Cookies', 'Water Plants',
  'Tell Stories', 'Play Music', 'Do Yoga', 'Make Slime', 'Fly Kites',
  'Play Chess', 'Do Magic', 'Paint Rocks', 'Build Fort', 'Play Tag',
  'Make Origami', 'Blow Bubbles', 'Play Catch', 'Do Puzzles', 'Sing Karaoke',
  'Ride Bikes', 'Skip Rope', 'Play Cards', 'Build Sandcastles', 'Go Fishing',
  'Make Jewelry', 'Play Drums', 'Do Gymnastics', 'Feed Birds', 'Collect Leaves',
  'Make Smoothies', 'Play Hopscotch', 'Do Science', 'Write Letters', 'Play Piano',
  'Make Puppets', 'Go Camping', 'Play Basketball', 'Do Crafts', 'Sing Songs'
];

/**
 * Get a random fallback activity that doesn't exist in current activities
 */
const getRandomFallbackActivity = (existingActivities: string[]): string => {
  const availableActivities = FALLBACK_ACTIVITIES.filter(
    activity => !existingActivities.includes(activity)
  );
  
  if (availableActivities.length === 0) {
    // If all fallbacks are used, generate a simple numbered activity
    let counter = 1;
    let newActivity = `Fun Activity ${counter}`;
    while (existingActivities.includes(newActivity)) {
      counter++;
      newActivity = `Fun Activity ${counter}`;
    }
    return newActivity;
  }
  
  const randomIndex = Math.floor(Math.random() * availableActivities.length);
  return availableActivities[randomIndex];
}; 