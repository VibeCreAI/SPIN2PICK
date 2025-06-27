import Constants from 'expo-constants';

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
export const getAISuggestedActivity = async (existingActivities: string[], declinedSuggestions: string[] = []): Promise<string> => {
  try {
    const baseUrl = getApiBaseUrl();
    const requestBody = { existingActivities, declinedSuggestions };
    
    const response = await fetch(`${baseUrl}/api/suggest-activity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ AI API Error:', response.status, response.statusText, errorText);
      return getRandomFallbackActivity([...existingActivities, ...declinedSuggestions]);
    }

    const data = await response.json();
    
    // Check if response has expected structure
    if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      console.error('❌ Invalid AI response structure - no choices array');
      return getRandomFallbackActivity([...existingActivities, ...declinedSuggestions]);
    }
    
    const choice = data.choices[0];
    if (!choice.message || !choice.message.content) {
      console.error('❌ Invalid AI choice structure - no message.content');
      return getRandomFallbackActivity([...existingActivities, ...declinedSuggestions]);
    }
    
    let rawResponse = choice.message.content;
    
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

    // Very permissive validation - only reject truly invalid responses
    if (/^[\s]*$/.test(suggestedActivity) || /[^\w\s&'.,!-]/.test(suggestedActivity)) {
      console.error('❌ AI suggestion validation failed: invalid characters or empty');
      return getRandomFallbackActivity([...existingActivities, ...declinedSuggestions]);
    }

    if (existingActivities.includes(suggestedActivity)) {
      console.error('❌ AI suggested duplicate activity:', suggestedActivity);
      return getRandomFallbackActivity([...existingActivities, ...declinedSuggestions]);
    }

    if (declinedSuggestions.includes(suggestedActivity)) {
      console.error('❌ AI suggested previously declined activity:', suggestedActivity);
      return getRandomFallbackActivity([...existingActivities, ...declinedSuggestions]);
    }
    return suggestedActivity;
    
  } catch (error: unknown) {
    console.error('❌ AI suggestion failed:', error instanceof Error ? error.message : String(error));
    return getRandomFallbackActivity([...existingActivities, ...declinedSuggestions]);
  }
};

/**
 * Enhanced fallback activity suggestions with matching emojis - organized by category for diversity
 */
const FALLBACK_ACTIVITY_PAIRS = [
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

/**
 * Get a random fallback activity with its matching emoji
 */
export const getRandomFallbackActivityPair = (existingActivities: string[]): { name: string; emoji: string } => {
  const availablePairs = FALLBACK_ACTIVITY_PAIRS.filter(
    pair => !existingActivities.includes(pair.name)
  );
  
  if (availablePairs.length === 0) {
    // If all fallbacks are used, generate a simple numbered activity
    let counter = 1;
    let newActivity = `Fun Activity ${counter}`;
    while (existingActivities.includes(newActivity)) {
      counter++;
      newActivity = `Fun Activity ${counter}`;
    }
    return { name: newActivity, emoji: getRandomFallbackEmoji() };
  }
  
  const randomIndex = Math.floor(Math.random() * availablePairs.length);
  return availablePairs[randomIndex];
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