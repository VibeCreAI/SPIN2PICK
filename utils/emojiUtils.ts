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
    console.log('📡 Using configured API URL:', configuredUrl);
    return configuredUrl;
  }
  
  // Fallback to deployed API (no API keys exposed)
  const fallbackUrl = 'https://spin2pick-app.vercel.app';
  console.log('📡 Using fallback API URL:', fallbackUrl);
  return fallbackUrl;
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
  console.log('🚀 Starting AI suggestion request...');
  console.log('📝 Existing activities:', existingActivities);
  console.log('🚫 Declined suggestions:', declinedSuggestions);
  
  try {
    const baseUrl = getApiBaseUrl();
    console.log('🌐 API Base URL:', baseUrl);
    
    const requestBody = { existingActivities, declinedSuggestions };
    console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));
    
    console.log('📡 Making fetch request...');
    const response = await fetch(`${baseUrl}/api/suggest-activity`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📈 Response status:', response.status);
    console.log('📈 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Response Error:');
      console.error('   Status:', response.status, response.statusText);
      console.error('   Error body:', errorText);
      console.log('🔄 Falling back to random activity');
      return getRandomFallbackActivity([...existingActivities, ...declinedSuggestions]);
    }

    console.log('✅ Response OK, parsing JSON...');
    const data = await response.json();
    console.log('📋 Full API Response Structure:');
    console.log(JSON.stringify(data, null, 2));
    
    // Check if response has expected structure
    if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      console.error('❌ Invalid response structure - no choices array');
      console.log('🔄 Falling back to random activity');
      return getRandomFallbackActivity([...existingActivities, ...declinedSuggestions]);
    }
    
    const choice = data.choices[0];
    console.log('🎯 First choice object:', JSON.stringify(choice, null, 2));
    
    if (!choice.message || !choice.message.content) {
      console.error('❌ Invalid choice structure - no message.content');
      console.log('🔄 Falling back to random activity');
      return getRandomFallbackActivity([...existingActivities, ...declinedSuggestions]);
    }
    
    let rawResponse = choice.message.content;
    console.log('🤖 Raw AI response (type: ' + typeof rawResponse + '):', JSON.stringify(rawResponse));
    console.log('🤖 Raw AI response (length: ' + rawResponse.length + '):', rawResponse);
    
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

    console.log('🧹 After cleaning steps:');
    console.log('   - Remove quotes/backticks');
    console.log('   - Remove periods');
    console.log('   - Remove dashes');
    console.log('   - Remove numbered format');
    console.log('   - Split by newline (first part)');
    console.log('   - Split by period (first sentence)');
    console.log('   - Split by comma (first part)');
    console.log('   - Final trim');
    console.log('🧹 Cleaned response:', JSON.stringify(suggestedActivity));
    console.log('🧹 Cleaned length:', suggestedActivity.length);

    // Very permissive validation - only reject truly invalid responses
    if (/^[\s]*$/.test(suggestedActivity) || /[^\w\s&'.,!-]/.test(suggestedActivity)) {
      console.log('❌ VALIDATION FAILED: Contains invalid characters or is empty');
      console.log('   String breakdown:');
      for (let i = 0; i < suggestedActivity.length; i++) {
        const char = suggestedActivity[i];
        const code = char.charCodeAt(0);
        console.log(`   [${i}]: "${char}" (code: ${code})`);
      }
      console.log('🔄 Falling back to random activity');
      return getRandomFallbackActivity([...existingActivities, ...declinedSuggestions]);
    }
    console.log('✅ Basic validation passed');

    if (existingActivities.includes(suggestedActivity)) {
      console.log('❌ VALIDATION FAILED: Duplicate activity suggested');
      console.log('   Suggested:', JSON.stringify(suggestedActivity));
      console.log('   Existing:', existingActivities);
      console.log('🔄 Falling back to random activity');
      return getRandomFallbackActivity([...existingActivities, ...declinedSuggestions]);
    }
    console.log('✅ Not a duplicate from existing activities');

    if (declinedSuggestions.includes(suggestedActivity)) {
      console.log('❌ VALIDATION FAILED: Previously declined activity suggested');
      console.log('   Suggested:', JSON.stringify(suggestedActivity));
      console.log('   Declined:', declinedSuggestions);
      console.log('🔄 Falling back to random activity');
      return getRandomFallbackActivity([...existingActivities, ...declinedSuggestions]);
    }
    console.log('✅ Not a previously declined suggestion');

    console.log('🎉 ALL VALIDATIONS PASSED!');
    console.log('✅ Accepting AI suggestion:', JSON.stringify(suggestedActivity));
    return suggestedActivity;
    
  } catch (error: unknown) {
    console.error('💥 Exception in getAISuggestedActivity:');
    console.error('   Error type:', error?.constructor?.name || 'Unknown');
    console.error('   Error message:', error instanceof Error ? error.message : String(error));
    console.error('   Full error:', error);
    console.log('🔄 Falling back to random activity');
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
  { name: 'Joke Telling', emoji: '😂' }
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
  // Shuffle the activity pairs array
  const shuffled = [...FALLBACK_ACTIVITY_PAIRS].sort(() => Math.random() - 0.5);
  
  // Take the first 'count' activities
  return shuffled.slice(0, count);
}; 