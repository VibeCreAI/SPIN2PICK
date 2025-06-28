// Content moderation utilities for user-generated titles and content
import { TitleCategory } from './titleUtils';

// Content filtering levels
export enum ContentFilterLevel {
  RELAXED = 'relaxed',
  MODERATE = 'moderate', 
  STRICT = 'strict'
}

// Content categories to block
export enum BlockedContentType {
  SEXUAL = 'sexual',
  VIOLENCE = 'violence',
  DRUGS = 'drugs',
  ILLEGAL = 'illegal',
  HATE_SPEECH = 'hate_speech',
  SELF_HARM = 'self_harm',
  SCAM = 'scam',
  SPAM = 'spam',
  PROFANITY = 'profanity'
}

// Moderation result interface
export interface ModerationResult {
  approved: boolean;
  flaggedContent: string[];
  flaggedCategories: BlockedContentType[];
  suggestions: string[];
  confidence: number; // 0-1 confidence score
}

// User preferences for content filtering
export interface ContentModerationPreferences {
  filterLevel: ContentFilterLevel;
  enableAIFiltering: boolean;
  customBlockedWords: string[];
  blockedCategories: BlockedContentType[];
  reportingEnabled: boolean;
}

// Blocked word lists by severity
const BLOCKED_WORDS = {
  // High severity - always blocked
  high: [
    // Sexual content
    'sex', 'porn', 'xxx', 'nude', 'naked', 'sexual', 'erotic', 'adult', 'nsfw',
    
    // Violence
    'kill', 'murder', 'death', 'suicide', 'shoot', 'gun', 'weapon', 'bomb', 'terrorist',
    'violence', 'fight', 'attack', 'harm', 'hurt', 'abuse', 'torture',
    
    // Drugs
    'drug', 'cocaine', 'heroin', 'meth', 'marijuana', 'weed', 'cannabis', 'pill',
    'addiction', 'overdose', 'high', 'stoned', 'drunk', 'alcohol',
    
    // Hate speech
    'hate', 'racist', 'nazi', 'fascist', 'discrimination', 'prejudice',
    
    // Illegal activities
    'steal', 'theft', 'robbery', 'scam', 'fraud', 'piracy', 'illegal', 'criminal',
    
    // Self-harm
    'depression', 'anxiety', 'panic', 'trauma', 'ptsd', 'mental illness',
    'self-harm', 'cutting', 'eating disorder'
  ],
  
  // Medium severity - blocked in moderate/strict modes
  medium: [
    'gambling', 'bet', 'casino', 'lottery', 'money', 'cash', 'rich', 'wealth',
    'politics', 'government', 'election', 'vote', 'political', 'democrat', 'republican',
    'religion', 'god', 'jesus', 'muslim', 'christian', 'islam', 'bible', 'prayer',
    'scary', 'horror', 'nightmare', 'fear', 'creepy', 'haunted', 'ghost'
  ],
  
  // Low severity - blocked only in strict mode
  low: [
    'stupid', 'dumb', 'idiot', 'moron', 'loser', 'fail', 'suck', 'crap',
    'weird', 'strange', 'odd', 'bizarre', 'crazy', 'insane', 'mad'
  ]
};

// Common inappropriate patterns (regex)
const INAPPROPRIATE_PATTERNS = [
  /\b(?:contact|call|text|email|phone|whatsapp|telegram|discord)\b.*\b(?:\d{3}[-.\s]?\d{3}[-.\s]?\d{4}|\d{10})\b/i, // Phone numbers
  /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/i, // Email addresses
  /\b(?:https?:\/\/|www\.)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/i, // URLs
  /\b(?:buy|sell|purchase|order|cheap|free|discount|sale|offer|deal)\b.*\b(?:now|today|click|link)\b/i, // Sales/spam
  /\$\d+|\d+\s*(?:dollars?|usd|€|£)/i, // Money amounts
  /\b(?:investment|crypto|bitcoin|trading|profit|earn|income)\b/i, // Financial schemes
];

// Category-specific content validation
const CATEGORY_VALIDATIONS = {
  [TitleCategory.FOOD]: {
    required: ['food', 'meal', 'eat', 'cook', 'recipe', 'dish', 'cuisine', 'restaurant', 'snack', 'drink'],
    inappropriate: ['diet', 'weight', 'calorie', 'fat', 'skinny', 'obesity']
  },
  [TitleCategory.GAMES]: {
    required: ['game', 'play', 'fun', 'sport', 'activity', 'challenge', 'competition', 'team', 'player'],
    inappropriate: ['gambling', 'bet', 'win money', 'prize money']
  },
  [TitleCategory.EDUCATION]: {
    required: ['learn', 'study', 'skill', 'knowledge', 'education', 'course', 'lesson', 'practice', 'subject'],
    inappropriate: ['grade', 'test', 'exam', 'failure', 'stupid']
  },
  [TitleCategory.WORKPLACE]: {
    required: ['work', 'office', 'break', 'professional', 'colleague', 'meeting', 'productivity', 'stress'],
    inappropriate: ['boss', 'salary', 'fired', 'quit', 'unemployed']
  }
};

/**
 * Check if content contains blocked words
 */
export const containsBlockedWords = (
  text: string, 
  filterLevel: ContentFilterLevel,
  customBlockedWords: string[] = []
): { blocked: boolean; flaggedWords: string[] } => {
  const normalizedText = text.toLowerCase();
  const flaggedWords: string[] = [];
  
  // Always check high severity words
  for (const word of BLOCKED_WORDS.high) {
    if (normalizedText.includes(word.toLowerCase())) {
      flaggedWords.push(word);
    }
  }
  
  // Check medium severity for moderate and strict modes
  if (filterLevel === ContentFilterLevel.MODERATE || filterLevel === ContentFilterLevel.STRICT) {
    for (const word of BLOCKED_WORDS.medium) {
      if (normalizedText.includes(word.toLowerCase())) {
        flaggedWords.push(word);
      }
    }
  }
  
  // Check low severity for strict mode only
  if (filterLevel === ContentFilterLevel.STRICT) {
    for (const word of BLOCKED_WORDS.low) {
      if (normalizedText.includes(word.toLowerCase())) {
        flaggedWords.push(word);
      }
    }
  }
  
  // Check custom blocked words
  for (const word of customBlockedWords) {
    if (normalizedText.includes(word.toLowerCase())) {
      flaggedWords.push(word);
    }
  }
  
  return {
    blocked: flaggedWords.length > 0,
    flaggedWords
  };
};

/**
 * Check for inappropriate patterns in content
 */
export const containsInappropriatePatterns = (text: string): { blocked: boolean; flaggedPatterns: string[] } => {
  const flaggedPatterns: string[] = [];
  
  for (const pattern of INAPPROPRIATE_PATTERNS) {
    if (pattern.test(text)) {
      flaggedPatterns.push(pattern.source);
    }
  }
  
  return {
    blocked: flaggedPatterns.length > 0,
    flaggedPatterns
  };
};

/**
 * Validate content against category-specific rules
 */
export const validateCategoryContent = (
  title: string,
  description: string,
  category: TitleCategory
): { valid: boolean; suggestions: string[] } => {
  const validation = CATEGORY_VALIDATIONS[category];
  if (!validation) {
    return { valid: true, suggestions: [] };
  }
  
  const combinedText = `${title} ${description}`.toLowerCase();
  const suggestions: string[] = [];
  
  // Check for required keywords (lenient - not strictly enforced)
  const hasRequiredKeyword = validation.required.some(keyword => 
    combinedText.includes(keyword.toLowerCase())
  );
  
  if (!hasRequiredKeyword) {
    suggestions.push(`Consider including keywords related to ${category}: ${validation.required.slice(0, 3).join(', ')}`);
  }
  
  // Check for inappropriate content for this category
  const hasInappropriate = validation.inappropriate.some(keyword => 
    combinedText.includes(keyword.toLowerCase())
  );
  
  if (hasInappropriate) {
    suggestions.push(`Content may not be appropriate for ${category} category`);
  }
  
  return {
    valid: !hasInappropriate,
    suggestions
  };
};

/**
 * Main content moderation function
 */
export const moderateContent = (
  title: string,
  description: string,
  items: string[],
  category: TitleCategory,
  preferences: ContentModerationPreferences
): ModerationResult => {
  const flaggedContent: string[] = [];
  const flaggedCategories: BlockedContentType[] = [];
  const suggestions: string[] = [];
  
  // Combine all content for analysis
  const allContent = [title, description, ...items].join(' ');
  
  // Check blocked words
  const blockedWordsResult = containsBlockedWords(allContent, preferences.filterLevel, preferences.customBlockedWords);
  if (blockedWordsResult.blocked) {
    flaggedContent.push(...blockedWordsResult.flaggedWords);
    flaggedCategories.push(BlockedContentType.PROFANITY);
  }
  
  // Check inappropriate patterns
  const patternsResult = containsInappropriatePatterns(allContent);
  if (patternsResult.blocked) {
    flaggedContent.push('Inappropriate patterns detected');
    flaggedCategories.push(BlockedContentType.SPAM);
  }
  
  // Check category-specific validation
  const categoryResult = validateCategoryContent(title, description, category);
  suggestions.push(...categoryResult.suggestions);
  
  // Calculate confidence score
  const totalChecks = 3;
  const passedChecks = [!blockedWordsResult.blocked, !patternsResult.blocked, categoryResult.valid]
    .filter(Boolean).length;
  const confidence = passedChecks / totalChecks;
  
  // Determine approval
  const approved = flaggedContent.length === 0 && categoryResult.valid;
  
  return {
    approved,
    flaggedContent: [...new Set(flaggedContent)], // Remove duplicates
    flaggedCategories: [...new Set(flaggedCategories)],
    suggestions,
    confidence
  };
};

/**
 * Get default content moderation preferences
 */
export const getDefaultModerationPreferences = (): ContentModerationPreferences => ({
  filterLevel: ContentFilterLevel.MODERATE,
  enableAIFiltering: true,
  customBlockedWords: [],
  blockedCategories: [
    BlockedContentType.SEXUAL,
    BlockedContentType.VIOLENCE,
    BlockedContentType.DRUGS,
    BlockedContentType.ILLEGAL,
    BlockedContentType.HATE_SPEECH,
    BlockedContentType.SELF_HARM
  ],
  reportingEnabled: true
});

/**
 * Generate content improvement suggestions
 */
export const generateContentSuggestions = (
  title: string,
  description: string,
  category: TitleCategory
): string[] => {
  const suggestions: string[] = [];
  
  // Title length suggestions
  if (title.length < 3) {
    suggestions.push('Title should be at least 3 characters long');
  }
  if (title.length > 50) {
    suggestions.push('Title should be under 50 characters for better display');
  }
  
  // Description length suggestions
  if (description.length < 10) {
    suggestions.push('Description should provide more detail about the content');
  }
  if (description.length > 200) {
    suggestions.push('Description should be concise and under 200 characters');
  }
  
  // Category-specific suggestions
  const categoryValidation = validateCategoryContent(title, description, category);
  suggestions.push(...categoryValidation.suggestions);
  
  return suggestions;
};

/**
 * Clean and sanitize content
 */
export const sanitizeContent = (text: string): string => {
  return text
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\w\s\-.,!?()&']/g, '') // Remove special characters except common punctuation
    .substring(0, 200); // Limit length
};

// AI Content Validation Result
export interface AIValidationResult {
  approved: boolean;
  issues: string[];
  severity: 'low' | 'medium' | 'high';
  suggestions: string[];
  confidence: number;
  fallback?: boolean;
}

/**
 * Get API base URL for content validation
 */
const getApiBaseUrl = (): string => {
  // Check for environment variables or fallback to default
  if (typeof process !== 'undefined' && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Development fallback
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Production fallback
  return 'https://spin2pick.vercel.app';
};

/**
 * Validate content using AI moderation API
 */
export const validateContentWithAI = async (
  title: string,
  description: string,
  items: string[],
  category: TitleCategory,
  strictness: ContentFilterLevel = ContentFilterLevel.MODERATE
): Promise<AIValidationResult> => {
  try {
    const baseUrl = getApiBaseUrl();
    const requestBody = {
      title: sanitizeContent(title),
      description: sanitizeContent(description),
      items: items.map(item => sanitizeContent(item)),
      category,
      strictness
    };
    
    const response = await fetch(`${baseUrl}/api/validate-content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      console.error('❌ Content Validation API Error:', response.status, response.statusText);
      
      // Fallback to local moderation
      return performLocalValidation(title, description, items, category, strictness);
    }

    const result = await response.json();
    
    // Validate response structure
    if (typeof result.approved !== 'boolean') {
      console.error('❌ Invalid AI validation response structure');
      return performLocalValidation(title, description, items, category, strictness);
    }
    
    return {
      approved: result.approved,
      issues: result.issues || [],
      severity: result.severity || 'low',
      suggestions: result.suggestions || [],
      confidence: result.confidence || 0.8,
      fallback: result.fallback || false
    };

  } catch (error) {
    console.error('❌ Content validation error:', error);
    
    // Always provide a fallback response
    return performLocalValidation(title, description, items, category, strictness);
  }
};

/**
 * Local fallback validation when AI is unavailable
 */
const performLocalValidation = (
  title: string,
  description: string,
  items: string[],
  category: TitleCategory,
  strictness: ContentFilterLevel
): AIValidationResult => {
  const preferences: ContentModerationPreferences = {
    filterLevel: strictness,
    enableAIFiltering: false,
    customBlockedWords: [],
    blockedCategories: [
      BlockedContentType.SEXUAL,
      BlockedContentType.VIOLENCE,
      BlockedContentType.DRUGS,
      BlockedContentType.ILLEGAL,
      BlockedContentType.HATE_SPEECH,
      BlockedContentType.SELF_HARM
    ],
    reportingEnabled: false
  };
  
  const localResult = moderateContent(title, description, items, category, preferences);
  
  // Convert to AI validation result format
  let severity: 'low' | 'medium' | 'high' = 'low';
  if (localResult.flaggedCategories.includes(BlockedContentType.SEXUAL) ||
      localResult.flaggedCategories.includes(BlockedContentType.VIOLENCE) ||
      localResult.flaggedCategories.includes(BlockedContentType.ILLEGAL)) {
    severity = 'high';
  } else if (localResult.flaggedContent.length > 0) {
    severity = 'medium';
  }
  
  return {
    approved: localResult.approved,
    issues: localResult.flaggedContent,
    severity,
    suggestions: localResult.suggestions,
    confidence: localResult.confidence,
    fallback: true
  };
};

/**
 * Comprehensive content validation combining local and AI checks
 */
export const performComprehensiveValidation = async (
  title: string,
  description: string,
  items: string[],
  category: TitleCategory,
  preferences: ContentModerationPreferences
): Promise<{
  localResult: ModerationResult;
  aiResult?: AIValidationResult;
  overallApproved: boolean;
  recommendations: string[];
}> => {
  // Always perform local validation first (fast)
  const localResult = moderateContent(title, description, items, category, preferences);
  
  let aiResult: AIValidationResult | undefined;
  let overallApproved = localResult.approved;
  const recommendations: string[] = [...localResult.suggestions];
  
  // Perform AI validation if enabled and local validation passes
  if (preferences.enableAIFiltering && localResult.approved) {
    try {
      aiResult = await validateContentWithAI(title, description, items, category, preferences.filterLevel);
      overallApproved = localResult.approved && aiResult.approved;
      
      // Combine suggestions
      recommendations.push(...aiResult.suggestions);
      
      if (!aiResult.approved) {
        recommendations.push('AI moderation flagged potential issues. Please review and revise.');
      }
      
    } catch (error) {
      console.error('❌ AI validation failed:', error);
      recommendations.push('AI validation unavailable, using local moderation only');
    }
  }
  
  return {
    localResult,
    aiResult,
    overallApproved,
    recommendations: [...new Set(recommendations)] // Remove duplicates
  };
};

/**
 * Quick content check for real-time validation (local only)
 */
export const quickContentCheck = (
  text: string,
  filterLevel: ContentFilterLevel = ContentFilterLevel.MODERATE
): { safe: boolean; issues: string[] } => {
  const blockedWordsResult = containsBlockedWords(text, filterLevel);
  const patternsResult = containsInappropriatePatterns(text);
  
  const issues: string[] = [];
  
  if (blockedWordsResult.blocked) {
    issues.push(`Blocked words detected: ${blockedWordsResult.flaggedWords.join(', ')}`);
  }
  
  if (patternsResult.blocked) {
    issues.push('Inappropriate patterns detected');
  }
  
  return {
    safe: issues.length === 0,
    issues
  };
};