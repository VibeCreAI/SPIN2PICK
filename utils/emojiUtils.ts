import { Platform } from 'react-native';

/**
 * Get the appropriate API base URL based on platform
 * @returns The base URL for API calls
 */
const getApiBaseUrl = (): string => {
  // For web, use relative URLs (same domain)
  if (Platform.OS === 'web') {
    return '';
  }
  
  // For mobile, use the environment variable from EAS dashboard
  // This will be set during build time from the Expo dashboard
  return process.env.EXPO_PUBLIC_API_BASE_URL || '';
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
  console.log('🚀 Starting AI suggestion request...');
  console.log('📝 Existing activities:', existingActivities);
  
  try {
    const baseUrl = getApiBaseUrl();
    console.log('🌐 API Base URL:', baseUrl);
    
    const requestBody = { existingActivities };
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
      return getRandomFallbackActivity(existingActivities);
    }

    console.log('✅ Response OK, parsing JSON...');
    const data = await response.json();
    console.log('📋 Full API Response Structure:');
    console.log(JSON.stringify(data, null, 2));
    
    // Check if response has expected structure
    if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      console.error('❌ Invalid response structure - no choices array');
      console.log('🔄 Falling back to random activity');
      return getRandomFallbackActivity(existingActivities);
    }
    
    const choice = data.choices[0];
    console.log('🎯 First choice object:', JSON.stringify(choice, null, 2));
    
    if (!choice.message || !choice.message.content) {
      console.error('❌ Invalid choice structure - no message.content');
      console.log('🔄 Falling back to random activity');
      return getRandomFallbackActivity(existingActivities);
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
      return getRandomFallbackActivity(existingActivities);
    }
    console.log('✅ Basic validation passed');

    if (existingActivities.includes(suggestedActivity)) {
      console.log('❌ VALIDATION FAILED: Duplicate activity suggested');
      console.log('   Suggested:', JSON.stringify(suggestedActivity));
      console.log('   Existing:', existingActivities);
      console.log('🔄 Falling back to random activity');
      return getRandomFallbackActivity(existingActivities);
    }
    console.log('✅ Not a duplicate');

    console.log('🎉 ALL VALIDATIONS PASSED!');
    console.log('✅ Accepting AI suggestion:', JSON.stringify(suggestedActivity));
    return suggestedActivity;
    
  } catch (error: unknown) {
    console.error('💥 Exception in getAISuggestedActivity:');
    console.error('   Error type:', error?.constructor?.name || 'Unknown');
    console.error('   Error message:', error instanceof Error ? error.message : String(error));
    console.error('   Full error:', error);
    console.log('🔄 Falling back to random activity');
    return getRandomFallbackActivity(existingActivities);
  }
};

/**
 * Enhanced fallback activity suggestions when AI fails - organized by category for diversity
 */
const FALLBACK_ACTIVITIES = [
  // Creative & Arts
  'Draw Pictures', 'Paint Rocks', 'Make Origami', 'Build Blocks', 'Make Jewelry', 'Do Crafts', 'Make Puppets', 'Clay Sculpting', 'Finger Painting', 'Make Collages',
  
  // Science & Discovery  
  'Make Slime', 'Do Science', 'Grow Crystals', 'Mix Colors', 'Make Volcanoes', 'Bug Hunting', 'Cloud Watching', 'Magnet Play', 'Shadow Puppets', 'Water Experiments',
  
  // Physical & Active
  'Play Soccer', 'Do Yoga', 'Play Tag', 'Ride Bikes', 'Skip Rope', 'Do Gymnastics', 'Play Basketball', 'Hopscotch', 'Obstacle Course', 'Balloon Games',
  
  // Imaginative & Role Play
  'Tell Stories', 'Do Magic', 'Build Fort', 'Treasure Hunt', 'Dress Up', 'Puppet Show', 'Space Adventure', 'Pirate Quest', 'Superhero Training', 'Tea Party',
  
  // Music & Performance
  'Play Music', 'Sing Karaoke', 'Play Drums', 'Sing Songs', 'Dance Battle', 'Make Instruments', 'Rhythm Games', 'Opera Singing', 'Beat Boxing', 'Air Guitar',
  
  // Outdoor & Nature
  'Fly Kites', 'Water Plants', 'Build Sandcastles', 'Go Fishing', 'Feed Birds', 'Collect Leaves', 'Go Camping', 'Nature Walk', 'Rock Collecting', 'Flower Pressing',
  
  // Games & Puzzles
  'Play Chess', 'Play Cards', 'Board Games', 'Memory Games', 'Riddle Time', 'Word Games', 'Number Puzzles', 'Brain Teasers', 'Trivia Quiz', 'Charades',
  
  // Cooking & Food
  'Bake Cookies', 'Make Smoothies', 'Fruit Kabobs', 'Pizza Making', 'Cookie Decorating', 'Sandwich Art', 'Ice Cream Sundae', 'Veggie Faces', 'Trail Mix', 'Pancake Art',
  
  // Unique & Quirky
  'Blow Bubbles', 'Play Catch', 'Write Letters', 'Sock Puppet', 'Backwards Day', 'Silly Walks', 'Robot Dance', 'Animal Sounds', 'Tongue Twisters', 'Joke Telling'
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