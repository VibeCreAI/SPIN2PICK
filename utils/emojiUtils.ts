import Constants from 'expo-constants';
import { PREDETERMINED_TITLES } from '../data/predeterminedTitles';
import { TitleCategory } from './titleUtils';

/**
 * Get the appropriate API base URL based on platform
 * @returns The base URL for API calls
 */
const getApiBaseUrl = (): string => {
  // 🔒 Secure API configuration - uses deployed Vercel API
  // API keys stay secure on the server side
  const configuredUrl = Constants.expoConfig?.extra?.apiBaseUrl;
  
  if (configuredUrl) {
    return configuredUrl;
  }
  
  // Fallback to deployed API (no API keys exposed)
  return 'https://spin2pick-app.vercel.app';
};

/**
 * Get an appropriate emoji for an activity using AI
 * @param activityName The name of the activity
 * @returns A promise that resolves to an emoji string
 */
export const getEmojiForActivity = async (activityName: string): Promise<string> => {
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/get-emoji`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ activityName })
    });

    if (!response.ok) {
      console.error('API error:', await response.text());
      return getRandomFallbackEmoji(); // Random fallback emoji
    }

    const data = await response.json();
    const emojiText = data.choices[0]?.message?.content?.trim() || getRandomFallbackEmoji();
    
    // Extract just the emoji if there's any additional text
    const emojiRegex = /(\p{Emoji})/u;
    const match = emojiText.match(emojiRegex);
    return match ? match[0] : getRandomFallbackEmoji();
    
  } catch (error) {
    console.error('Error getting emoji:', error);
    return getRandomFallbackEmoji(); // Random fallback emoji
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
 * Diverse fallback emojis for when AI emoji generation fails
 */
const FALLBACK_EMOJIS = [
  // Fun & Games
  '🎯', '🎲', '🎪', '🎨', '🎭', '🎮', '🎳', '🎸', '🎺', '🎻',
  // Sports & Activities  
  '⚽', '🏀', '🏈', '🎾', '🏐', '🏓', '🏸', '🥏', '🏹', '🎣',
  // Creative & Arts
  '✏️', '🖍️', '🖌️', '📝', '📚', '📖', '🎼', '🎵', '🎶', '🎤',
  // Science & Discovery
  '🔬', '🧪', '🔭', '🧲', '⚗️', '🌡️', '💡', '🔍', '🗝️', '⚡',
  // Nature & Outdoor
  '🌱', '🌸', '🌺', '🌻', '🌳', '🍃', '🦋', '🐛', '🐝', '🌈',
  // Food & Cooking
  '🍪', '🧁', '🍰', '🥧', '🍕', '🥪', '🍎', '🍌', '🥕', '🥒',
  // Adventure & Exploration
  '🗺️', '🧭', '⛰️', '🏕️', '🎒', '🔦', '🪓', '🏴‍☠️', '💎', '🏆',
  // Magic & Fantasy
  '✨', '🌟', '⭐', '🔮', '🎩', '🪄', '🧚', '🦄', '🐉', '👑',
  // Tools & Building
  '🔨', '🔧', '⚙️', '🧰', '📐', '📏', '✂️', '📎', '🔗', '🧩'
];

/**
 * Get a random fallback emoji when AI emoji generation fails
 */
const getRandomFallbackEmoji = (): string => {
  const randomIndex = Math.floor(Math.random() * FALLBACK_EMOJIS.length);
  return FALLBACK_EMOJIS[randomIndex];
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
    return getRandomFallbackEmoji(); // Random fallback emoji
  }
};

/**
 * Get an AI-suggested activity based on existing activities
 * @param existingActivities Array of existing activity names
 * @param declinedSuggestions Array of previously declined suggestion names
 * @returns A promise that resolves to a suggested activity name
 */
export const getAISuggestedActivity = async (
  existingActivities: string[], 
  declinedSuggestions: string[] = [],
  titleName: string = 'Kids Activity',
  titleCategory: string = 'family',
  titleDescription: string = 'Random activities',
  titleId?: string
): Promise<string> => {
  const maxRetries = 4; // Allow up to 5 total attempts (initial + 4 retries) for better AI success rate
  let retryDeclinedSuggestions = [...declinedSuggestions]; // Copy to avoid mutating original
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const baseUrl = getApiBaseUrl();
      const requestBody = { 
        existingActivities, 
        declinedSuggestions: retryDeclinedSuggestions,
        titleName,
        titleCategory,
        titleDescription,
        isRetry: attempt > 0 // Flag for potential server-side improvements
      };
      
      const response = await fetch(`${baseUrl}/api/suggest-activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ AI API Error (attempt ${attempt + 1}/${maxRetries + 1}):`, response.status, response.statusText, errorText);
        if (attempt === maxRetries) {
          return getRandomFallbackActivity([...existingActivities, ...retryDeclinedSuggestions]);
        }
        continue;
      }

      const data = await response.json();
      
      // Check if response has expected structure
      if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
        console.error(`❌ Invalid AI response structure - no choices array (attempt ${attempt + 1}/${maxRetries + 1})`);
        if (attempt === maxRetries) {
          return getRandomFallbackActivity([...existingActivities, ...retryDeclinedSuggestions]);
        }
        continue;
      }
      
      const choice = data.choices[0];
      if (!choice.message || !choice.message.content) {
        console.error(`❌ Invalid AI choice structure - no message.content (attempt ${attempt + 1}/${maxRetries + 1})`);
        if (attempt === maxRetries) {
          return getRandomFallbackActivity([...existingActivities, ...retryDeclinedSuggestions]);
        }
        continue;
      }
      
      let rawResponse = choice.message.content;
      
      // Enhanced cleaning pipeline
      let suggestedActivity = rawResponse
        .trim()
        .split('\n')[0]                    // First line only
        .replace(/^["'`]|["'`]$/g, '')     // Remove quotes and backticks
        .replace(/^\d+[.)]\s*/, '')        // Remove numbering (1. 1) )
        .replace(/^[-*•]\s*/, '')          // Remove bullets
        .replace(/^(Option|Suggestion):\s*/i, '') // Remove prefixes
        .split(/[.!?]/)[0]                 // First sentence only
        .split(',')[0]                     // First part before comma
        .trim();

      // Enhanced meta-response detection - content-based rather than character-based
      const isMetaResponse = (text: string) => {
        const lower = text.toLowerCase().trim();
        
        // Analytical phrases that indicate meta-responses
        const analyticalPhrases = [
          'based on', 'analysis', 'suggest', 'recommend',
          'consider', 'would be', 'you could', 'here are',
          'i think', 'perhaps', 'maybe', 'could be',
          'for example', 'such as', 'like:', 'including',
          'depending on', 'according to', 'in conclusion',
          'to summarize', 'overall', 'in general'
        ];

        // Check for analytical phrases
        if (analyticalPhrases.some(phrase => lower.includes(phrase))) {
          return true;
        }

        // Check for response-like patterns
        if ((lower.startsWith('the ') && lower.includes('option')) ||
            lower.includes('response') ||
            lower.includes('answer') ||
            lower.includes('result') ||
            lower.startsWith('here') ||
            lower.startsWith('these') ||
            lower.startsWith('some')) {
          return true;
        }

        return false;
      };

      // Relaxed validation - focus on format rather than character restrictions
      const isValidOption = (text: string) => {
        // Length check
        if (text.length < 2 || text.length > 80) return false;

        // Reject if it's clearly analytical text
        if (isMetaResponse(text)) return false;

        // Allow almost all characters except control characters
        if (/[\x00-\x1F\x7F]/.test(text)) return false;

        // Must contain at least one letter or number
        if (!/[a-zA-Z0-9]/.test(text)) return false;

        // Reject if it's just punctuation or whitespace
        if (/^[\s\W]*$/.test(text)) return false;

        return true;
      };

      if (!isValidOption(suggestedActivity)) {
        console.error(`❌ AI suggestion validation failed: "${suggestedActivity}" (attempt ${attempt + 1}/${maxRetries + 1})`);
        if (attempt === maxRetries) {
          // Use smart fallback system
          const fallback = getSmartFallbackOption([...existingActivities, ...retryDeclinedSuggestions], retryDeclinedSuggestions, titleName, titleId);
          if (fallback.source === 'tryagain') {
            throw new Error('AI suggestion failed after maximum attempts. Please try again later.');
          }
          return fallback.name;
        }
        continue;
      }

      if (existingActivities.includes(suggestedActivity)) {
        console.error(`❌ AI suggested duplicate activity: "${suggestedActivity}" (attempt ${attempt + 1}/${maxRetries + 1})`);
        if (attempt === maxRetries) {
          const fallback = getSmartFallbackOption([...existingActivities, ...retryDeclinedSuggestions], retryDeclinedSuggestions, titleName, titleId);
          if (fallback.source === 'tryagain') {
            throw new Error('AI suggestion failed after maximum attempts. Please try again later.');
          }
          return fallback.name;
        }
        // Add duplicate to declined list for next retry
        retryDeclinedSuggestions.push(suggestedActivity);
        continue;
      }

      if (retryDeclinedSuggestions.includes(suggestedActivity)) {
        console.error(`❌ AI suggested previously declined activity: "${suggestedActivity}" (attempt ${attempt + 1}/${maxRetries + 1})`);
        if (attempt === maxRetries) {
          const fallback = getSmartFallbackOption([...existingActivities, ...retryDeclinedSuggestions], retryDeclinedSuggestions, titleName, titleId);
          if (fallback.source === 'tryagain') {
            throw new Error('AI suggestion failed after maximum attempts. Please try again later.');
          }
          return fallback.name;
        }
        continue;
      }
      
      // Success! Return the valid suggestion
      if (attempt > 0) {
        console.log(`✅ AI suggestion successful on retry attempt ${attempt + 1}: "${suggestedActivity}"`);
      }
      return suggestedActivity;
      
    } catch (error: unknown) {
      console.error(`❌ AI suggestion failed (attempt ${attempt + 1}/${maxRetries + 1}):`, error instanceof Error ? error.message : String(error));
      if (attempt === maxRetries) {
        const fallback = getSmartFallbackOption([...existingActivities, ...retryDeclinedSuggestions], retryDeclinedSuggestions, titleName, titleId);
        if (fallback.source === 'tryagain') {
          throw new Error('AI suggestion failed after maximum attempts. Please try again later.');
        }
        return fallback.name;
      }
    }
  }
  
  // This should never be reached, but just in case
  const fallback = getSmartFallbackOption([...existingActivities, ...retryDeclinedSuggestions], retryDeclinedSuggestions, titleName, titleId);
  if (fallback.source === 'tryagain') {
    throw new Error('AI suggestion failed after maximum attempts. Please try again later.');
  }
  return fallback.name;
};

/**
 * 🆕 NEW TERMINOLOGY - Wrapper for getAISuggestedActivity using "option" terminology
 * Get an AI-suggested option based on existing options
 * @param existingOptions Array of existing option names
 * @param declinedSuggestions Array of previously declined suggestion names
 * @param titleName Name of the wheel (e.g., "Kids Options")
 * @param titleCategory Category of the wheel (e.g., "family", "food", "games")
 * @param titleDescription Description of the wheel
 * @returns A promise that resolves to a suggested option name
 */
export const getAISuggestedOption = async (
  existingOptions: string[], 
  declinedSuggestions: string[] = [],
  titleName: string = 'Kids Options',
  titleCategory: string = 'family',
  titleDescription: string = 'Random options',
  titleId?: string
): Promise<string> => {
  // Call the existing function - maintains full compatibility
  return getAISuggestedActivity(existingOptions, declinedSuggestions, titleName, titleCategory, titleDescription, titleId);
};

/**
 * 🆕 NEW TERMINOLOGY - Wrapper for getRandomFallbackActivityPair using "option" terminology
 * Get a random fallback option with its matching emoji
 * @param existingOptions Array of existing option names
 * @returns An object with name and emoji properties
 */
export const getRandomFallbackOptionPair = (existingOptions: string[]): { name: string; emoji: string } => {
  // Call the existing function - maintains full compatibility
  return getRandomFallbackActivityPair(existingOptions);
};

/**
 * 🆕 NEW TERMINOLOGY - Wrapper for getEmojiForActivity using "option" terminology
 * Get an appropriate emoji for an option using AI
 * @param optionName The name of the option
 * @returns A promise that resolves to an emoji string
 */
export const getEmojiForOption = async (optionName: string): Promise<string> => {
  // Call the existing function - maintains full compatibility
  return getEmojiForActivity(optionName);
};

/**
 * Enhanced fallback activity suggestions with matching emojis - organized by category for diversity
 */
export const FALLBACK_ACTIVITY_PAIRS = [
  // Creative & Arts
  { name: 'Draw Pictures', emoji: '🎨' },
  { name: 'Paint Rocks', emoji: '🖌️' },
  { name: 'Make Origami', emoji: '📄' },
  { name: 'Build Blocks', emoji: '🧱' },
  { name: 'Make Jewelry', emoji: '💎' },
  { name: 'Do Crafts', emoji: '✂️' },
  { name: 'Make Puppets', emoji: '🧸' },
  { name: 'Clay Sculpting', emoji: '🏺' },
  { name: 'Finger Painting', emoji: '🖐️' },
  { name: 'Make Collages', emoji: '📸' },
  
  // Science & Discovery  
  { name: 'Make Slime', emoji: '🧪' },
  { name: 'Do Science', emoji: '🔬' },
  { name: 'Grow Crystals', emoji: '💎' },
  { name: 'Mix Colors', emoji: '🌈' },
  { name: 'Make Volcanoes', emoji: '🌋' },
  { name: 'Bug Hunting', emoji: '🐛' },
  { name: 'Cloud Watching', emoji: '☁️' },
  { name: 'Magnet Play', emoji: '🧲' },
  { name: 'Shadow Puppets', emoji: '👥' },
  { name: 'Water Experiments', emoji: '💧' },
  
  // Physical & Active
  { name: 'Play Soccer', emoji: '⚽' },
  { name: 'Do Yoga', emoji: '🧘' },
  { name: 'Play Tag', emoji: '🏃' },
  { name: 'Ride Bikes', emoji: '🚴' },
  { name: 'Skip Rope', emoji: '🪢' },
  { name: 'Do Gymnastics', emoji: '🤸' },
  { name: 'Play Basketball', emoji: '🏀' },
  { name: 'Hopscotch', emoji: '🦘' },
  { name: 'Obstacle Course', emoji: '🏁' },
  { name: 'Balloon Games', emoji: '🎈' },
  
  // Imaginative & Role Play
  { name: 'Tell Stories', emoji: '📚' },
  { name: 'Do Magic', emoji: '🎩' },
  { name: 'Build Fort', emoji: '🏰' },
  { name: 'Treasure Hunt', emoji: '🗺️' },
  { name: 'Dress Up', emoji: '👗' },
  { name: 'Puppet Show', emoji: '🎭' },
  { name: 'Space Adventure', emoji: '🚀' },
  { name: 'Pirate Quest', emoji: '🏴‍☠️' },
  { name: 'Superhero Training', emoji: '🦸' },
  { name: 'Tea Party', emoji: '🫖' },
  
  // Music & Performance
  { name: 'Play Music', emoji: '🎵' },
  { name: 'Sing Karaoke', emoji: '🎤' },
  { name: 'Play Drums', emoji: '🥁' },
  { name: 'Sing Songs', emoji: '🎶' },
  { name: 'Dance Battle', emoji: '💃' },
  { name: 'Make Instruments', emoji: '🎸' },
  { name: 'Rhythm Games', emoji: '🎼' },
  { name: 'Opera Singing', emoji: '🎭' },
  { name: 'Beat Boxing', emoji: '🎵' },
  { name: 'Air Guitar', emoji: '🎸' },
  
  // Outdoor & Nature
  { name: 'Fly Kites', emoji: '🪁' },
  { name: 'Water Plants', emoji: '🌱' },
  { name: 'Build Sandcastles', emoji: '🏰' },
  { name: 'Go Fishing', emoji: '🎣' },
  { name: 'Feed Birds', emoji: '🐦' },
  { name: 'Collect Leaves', emoji: '🍃' },
  { name: 'Go Camping', emoji: '🏕️' },
  { name: 'Nature Walk', emoji: '🌳' },
  { name: 'Rock Collecting', emoji: '🪨' },
  { name: 'Flower Pressing', emoji: '🌸' },
  
  // Games & Puzzles
  { name: 'Play Chess', emoji: '♟️' },
  { name: 'Play Cards', emoji: '🃏' },
  { name: 'Board Games', emoji: '🎲' },
  { name: 'Memory Games', emoji: '🧠' },
  { name: 'Riddle Time', emoji: '🤔' },
  { name: 'Word Games', emoji: '📝' },
  { name: 'Number Puzzles', emoji: '🔢' },
  { name: 'Brain Teasers', emoji: '🧩' },
  { name: 'Trivia Quiz', emoji: '❓' },
  { name: 'Charades', emoji: '🎭' },
  
  // Cooking & Food
  { name: 'Bake Cookies', emoji: '🍪' },
  { name: 'Make Smoothies', emoji: '🥤' },
  { name: 'Fruit Kabobs', emoji: '🍓' },
  { name: 'Pizza Making', emoji: '🍕' },
  { name: 'Cookie Decorating', emoji: '🧁' },
  { name: 'Sandwich Art', emoji: '🥪' },
  { name: 'Ice Cream Sundae', emoji: '🍨' },
  { name: 'Veggie Faces', emoji: '🥕' },
  { name: 'Trail Mix', emoji: '🥜' },
  { name: 'Pancake Art', emoji: '🥞' },
  
  // Unique & Quirky
  { name: 'Blow Bubbles', emoji: '🫧' },
  { name: 'Play Catch', emoji: '⚾' },
  { name: 'Write Letters', emoji: '✉️' },
  { name: 'Sock Puppet', emoji: '🧦' },
  { name: 'Backwards Day', emoji: '🔄' },
  { name: 'Silly Walks', emoji: '🚶' },
  { name: 'Robot Dance', emoji: '🤖' },
  { name: 'Animal Sounds', emoji: '🐄' },
  { name: 'Tongue Twisters', emoji: '👅' },
  { name: 'Joke Telling', emoji: '😂' },
  
  // Additional Activities (91-100)
  { name: 'Make Paper Planes', emoji: '✈️' },
  { name: 'Hula Hooping', emoji: '🤹' },
  { name: 'Face Painting', emoji: '🎨' },
  { name: 'Meditation', emoji: '🧘' },
  { name: 'Photography', emoji: '📷' },
  { name: 'Origami Animals', emoji: '🦢' },
  { name: 'Invisible Rope', emoji: '🪢' },
  { name: 'Mirror Games', emoji: '🪞' },
  { name: 'Sound Effects', emoji: '🔊' },
  { name: 'Time Capsule', emoji: '⏰' }
];

// Extract just the activity names for backward compatibility
const FALLBACK_ACTIVITIES = FALLBACK_ACTIVITY_PAIRS.map(pair => pair.name);

/**
 * Get a random fallback activity that doesn't exist in current activities
 */
const getRandomFallbackActivity = (existingActivities: string[]): string => {
  const availableActivities = FALLBACK_ACTIVITIES.filter(
    activity => !existingActivities.includes(activity)
  );
  
  if (availableActivities.length === 0) {
    // If all fallbacks are used, generate a simple numbered option
    let counter = 1;
    let newOption = `Fun Option ${counter}`;
    while (existingActivities.includes(newOption)) {
      counter++;
      newOption = `Fun Option ${counter}`;
    }
    return newOption;
  }
  
  const randomIndex = Math.floor(Math.random() * availableActivities.length);
  return availableActivities[randomIndex];
};

/**
 * Get a random fallback activity with its matching emoji
 */
export const getRandomFallbackActivityPair = (existingActivities: string[]): { name: string; emoji: string } => {
  const availablePairs = FALLBACK_ACTIVITY_PAIRS.filter(
    pair => !existingActivities.includes(pair.name)
  );
  
  if (availablePairs.length === 0) {
    // If all fallbacks are used, generate a simple numbered option
    let counter = 1;
    let newOption = `Fun Option ${counter}`;
    while (existingActivities.includes(newOption)) {
      counter++;
      newOption = `Fun Option ${counter}`;
    }
    return { name: newOption, emoji: getRandomFallbackEmoji() };
  }
  
  const randomIndex = Math.floor(Math.random() * availablePairs.length);
  return availablePairs[randomIndex];
};

/**
 * 🆕 SMART FALLBACK SYSTEM - Handles predetermined vs custom wheels intelligently
 * @param existingOptions Array of existing option names on the wheel
 * @param declinedSuggestions Array of previously declined suggestion names
 * @param titleName Current wheel title name
 * @param titleId Current wheel title ID (if from predetermined titles)
 * @returns Smart fallback result
 */
export const getSmartFallbackOption = (
  existingOptions: string[], 
  declinedSuggestions: string[] = [], 
  titleName: string = '',
  titleId?: string
): { name: string; emoji: string; source: 'predetermined' | 'tryagain' } => {
  const exclusionList = [...existingOptions, ...declinedSuggestions];
  
  // Check if this is a predetermined wheel by matching title ID or name
  const predeterminedWheel = PREDETERMINED_TITLES.find(title => 
    (titleId && title.id === titleId) || 
    title.name.toLowerCase() === titleName.toLowerCase()
  );
  
  if (predeterminedWheel) {
    console.log(`🔍 Checking predetermined wheel: "${predeterminedWheel.name}"`);
    
    // Find unused options from this specific predetermined wheel
    const availableOptions: { name: string; emoji: string }[] = [];
    predeterminedWheel.items.forEach(item => {
      if (!exclusionList.includes(item.name)) {
        availableOptions.push({
          name: item.name,
          emoji: item.emoji || '🎯'
        });
      }
    });
    
    if (availableOptions.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableOptions.length);
      console.log(`✅ Predetermined fallback: Found ${availableOptions.length} unused options from wheel "${predeterminedWheel.name}"`);
      return {
        ...availableOptions[randomIndex],
        source: 'predetermined'
      };
    } else {
      console.log(`🚫 All options exhausted from predetermined wheel "${predeterminedWheel.name}"`);
      return {
        name: 'Try again',
        emoji: '🔄',
        source: 'tryagain'
      };
    }
  }
  
  // For custom wheels, always return "Try again"
  console.log(`🎨 Custom wheel detected: "${titleName}" - returning try again`);
  return {
    name: 'Try again',
    emoji: '🔄',
    source: 'tryagain'
  };
};

/**
 * LEGACY - Enhanced fallback system (kept for backward compatibility)
 */
export const getContextualFallbackOption = (
  existingOptions: string[], 
  declinedSuggestions: string[] = [], 
  category?: TitleCategory
): { name: string; emoji: string } => {
  // Use the new smart system but return just the name/emoji for compatibility
  const result = getSmartFallbackOption(existingOptions, declinedSuggestions, '', undefined);
  return { name: result.name, emoji: result.emoji };
};

/**
 * Generate random default activities for first-time app installation
 */
export const generateRandomDefaultActivities = (count: number = 8): Array<{ name: string; emoji: string }> => {
  // Ensure we don't exceed our available unique activities
  const maxAvailable = FALLBACK_ACTIVITY_PAIRS.length; // 100 activities
  const actualCount = Math.min(count, maxAvailable);
  
  // Shuffle the activity pairs array
  const shuffled = [...FALLBACK_ACTIVITY_PAIRS].sort(() => Math.random() - 0.5);
  
  // Take the first 'actualCount' activities (up to 100)
  return shuffled.slice(0, actualCount);
}; 