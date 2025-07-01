import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys for the new title system
export const STORAGE_KEYS = {
  TITLES: 'SPIN2PICK_TITLES',
  CURRENT_TITLE_ID: 'SPIN2PICK_CURRENT_TITLE_ID',
  USER_PREFERENCES: 'SPIN2PICK_USER_PREFERENCES',
  SAVE_SLOTS: 'SPIN2PICK_SAVE_SLOTS_V2', // V2 to distinguish from legacy
  
  // Legacy keys for migration
  LEGACY_ACTIVITIES: 'SPIN2PICK_ACTIVITIES',
  LEGACY_SPIN_COUNT: 'SPIN2PICK_SPIN_COUNT',
  LEGACY_SAVE_SLOTS: 'SPIN2PICK_SAVE_SLOTS',
} as const;

// Title categories for organization and context
export enum TitleCategory {
  FAMILY = 'family',
  FOOD = 'food',
  GAMES = 'games',
  DECISIONS = 'decisions',
  NUMBERS = 'numbers',
  WORKPLACE = 'workplace',
  EDUCATION = 'education',
  ENTERTAINMENT = 'entertainment',
  CUSTOM = 'custom',
}

// New universal Item interface (evolved from Activity)
export interface Item {
  id: string;
  name: string;
  color: string;
  emoji?: string;
  category?: string; // Optional subcategory within a title
}

// Main Title interface for the new system
export interface Title {
  id: string;
  name: string;
  emoji?: string; // Optional emoji for title display
  description: string;
  category: TitleCategory;
  items: Item[];
  isCustom: boolean;
  isPredetermined: boolean;
  isCustomUserCreated?: boolean; // New flag for user-created custom wheels
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  spinCount?: number; // Track usage per title
  lastUsed?: Date;
}

// User preferences for content and behavior
export interface UserPreferences {
  contentFilterLevel: 'relaxed' | 'moderate' | 'strict';
  enableAIFiltering: boolean;
  preferredCategories: TitleCategory[];
  customBlockedWords: string[];
  showDescriptions: boolean;
  defaultTitleCategory: TitleCategory;
  lastAppVersion: string;
}

// Save slot structure for the new system
export interface SaveSlot {
  id: number;
  name: string;
  titleId: string;
  titleSnapshot: Title; // Full title snapshot for independence
  savedAt: Date;
  isUsed: boolean;
}

// Title management functions
export class TitleManager {
  // Get all titles
  static async getAllTitles(): Promise<Title[]> {
    try {
      const titlesJson = await AsyncStorage.getItem(STORAGE_KEYS.TITLES);
      if (!titlesJson) return [];
      
      const titles = JSON.parse(titlesJson);
      return titles.map((title: any) => ({
        ...title,
        createdAt: new Date(title.createdAt),
        updatedAt: new Date(title.updatedAt),
        lastUsed: title.lastUsed ? new Date(title.lastUsed) : undefined,
      }));
    } catch (error) {
      console.error('Error loading titles:', error);
      return [];
    }
  }

  // Save all titles
  static async saveTitles(titles: Title[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TITLES, JSON.stringify(titles));
    } catch (error) {
      console.error('Error saving titles:', error);
      throw error;
    }
  }

  // Get current active title ID
  static async getCurrentTitleId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_TITLE_ID);
    } catch (error) {
      console.error('Error getting current title ID:', error);
      return null;
    }
  }

  // Set current active title
  static async setCurrentTitleId(titleId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_TITLE_ID, titleId);
    } catch (error) {
      console.error('Error setting current title ID:', error);
      throw error;
    }
  }

  // Get current active title
  static async getCurrentTitle(): Promise<Title | null> {
    try {
      const currentId = await this.getCurrentTitleId();
      if (!currentId) return null;
      
      const titles = await this.getAllTitles();
      return titles.find(title => title.id === currentId) || null;
    } catch (error) {
      console.error('Error getting current title:', error);
      return null;
    }
  }

  // Get a title by ID
  static async getTitle(titleId: string): Promise<Title | null> {
    try {
      const titles = await this.getAllTitles();
      return titles.find(title => title.id === titleId) || null;
    } catch (error) {
      console.error('Error getting title:', error);
      return null;
    }
  }

  // Save a single title (add or update)
  static async saveTitle(title: Title): Promise<void> {
    try {
      const titles = await this.getAllTitles();
      const existingIndex = titles.findIndex(t => t.id === title.id);
      
      if (existingIndex >= 0) {
        // Update existing title
        titles[existingIndex] = { ...title, updatedAt: new Date() };
      } else {
        // Add new title
        titles.push(title);
      }
      
      await this.saveTitles(titles);
    } catch (error) {
      console.error('Error saving title:', error);
      throw error;
    }
  }

  // Create a new title
  static async createTitle(titleData: Partial<Title>): Promise<Title> {
    const newTitle: Title = {
      id: `title_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: titleData.name || 'Untitled',
      description: titleData.description || '',
      category: titleData.category || TitleCategory.CUSTOM,
      items: titleData.items || [],
      isCustom: true,
      isPredetermined: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      spinCount: 0,
      ...titleData,
    };

    const titles = await this.getAllTitles();
    titles.push(newTitle);
    await this.saveTitles(titles);

    return newTitle;
  }

  // Update an existing title
  static async updateTitle(titleId: string, updates: Partial<Title>): Promise<Title | null> {
    try {
      const titles = await this.getAllTitles();
      const titleIndex = titles.findIndex(title => title.id === titleId);
      
      if (titleIndex === -1) return null;

      titles[titleIndex] = {
        ...titles[titleIndex],
        ...updates,
        updatedAt: new Date(),
      };

      await this.saveTitles(titles);
      return titles[titleIndex];
    } catch (error) {
      console.error('Error updating title:', error);
      return null;
    }
  }

  // Delete a title
  static async deleteTitle(titleId: string): Promise<boolean> {
    try {
      const titles = await this.getAllTitles();
      const filteredTitles = titles.filter(title => title.id !== titleId);
      
      if (filteredTitles.length === titles.length) return false; // Title not found

      await this.saveTitles(filteredTitles);

      // If deleted title was current, switch to first available title
      const currentId = await this.getCurrentTitleId();
      if (currentId === titleId && filteredTitles.length > 0) {
        await this.setCurrentTitleId(filteredTitles[0].id);
      }

      return true;
    } catch (error) {
      console.error('Error deleting title:', error);
      return false;
    }
  }

  // Add item to a title
  static async addItemToTitle(titleId: string, item: Omit<Item, 'id'>): Promise<Item | null> {
    try {
      const newItem: Item = {
        ...item,
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      const titles = await this.getAllTitles();
      const titleIndex = titles.findIndex(title => title.id === titleId);
      
      if (titleIndex === -1) return null;

      titles[titleIndex].items.push(newItem);
      titles[titleIndex].updatedAt = new Date();

      await this.saveTitles(titles);
      return newItem;
    } catch (error) {
      console.error('Error adding item to title:', error);
      return null;
    }
  }

  // Remove item from a title
  static async removeItemFromTitle(titleId: string, itemId: string): Promise<boolean> {
    try {
      const titles = await this.getAllTitles();
      const titleIndex = titles.findIndex(title => title.id === titleId);
      
      if (titleIndex === -1) return false;

      const initialLength = titles[titleIndex].items.length;
      titles[titleIndex].items = titles[titleIndex].items.filter(item => item.id !== itemId);
      
      if (titles[titleIndex].items.length === initialLength) return false; // Item not found

      titles[titleIndex].updatedAt = new Date();
      await this.saveTitles(titles);
      return true;
    } catch (error) {
      console.error('Error removing item from title:', error);
      return false;
    }
  }

  // Update title usage stats
  static async incrementTitleUsage(titleId: string): Promise<void> {
    try {
      const titles = await this.getAllTitles();
      const titleIndex = titles.findIndex(title => title.id === titleId);
      
      if (titleIndex !== -1) {
        titles[titleIndex].spinCount = (titles[titleIndex].spinCount || 0) + 1;
        titles[titleIndex].lastUsed = new Date();
        await this.saveTitles(titles);
      }
    } catch (error) {
      console.error('Error updating title usage:', error);
    }
  }

  // Get titles by category
  static async getTitlesByCategory(category: TitleCategory): Promise<Title[]> {
    try {
      const titles = await this.getAllTitles();
      return titles.filter(title => title.category === category);
    } catch (error) {
      console.error(`Error getting titles for category ${category}:`, error);
      return [];
    }
  }

  // Search titles by name or description
  static async searchTitles(query: string): Promise<Title[]> {
    try {
      if (!query) return [];
      const titles = await this.getAllTitles();
      const lowercaseQuery = query.toLowerCase();
      
      return titles.filter(title => 
        title.name.toLowerCase().includes(lowercaseQuery) ||
        title.description.toLowerCase().includes(lowercaseQuery)
      );
    } catch (error) {
      console.error('Error searching titles:', error);
      return [];
    }
  }

  static async getRecentlyUsedTitles(limit: number = 3): Promise<Title[]> {
    try {
      const titles = await this.getAllTitles();
      return titles
        .filter(title => title.lastUsed)
        .sort((a, b) => b.lastUsed!.getTime() - a.lastUsed!.getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting recently used titles:', error);
      return [];
    }
  }
}

// User preferences management
export class PreferencesManager {
  static async getPreferences(): Promise<UserPreferences> {
    try {
      const prefsJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      if (!prefsJson) {
        return this.getDefaultPreferences();
      }
      
      return JSON.parse(prefsJson);
    } catch (error) {
      console.error('Error loading user preferences:', error);
      return this.getDefaultPreferences();
    }
  }

  static async savePreferences(preferences: UserPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving user preferences:', error);
      throw error;
    }
  }

  static getDefaultPreferences(): UserPreferences {
    return {
      contentFilterLevel: 'moderate',
      enableAIFiltering: true,
      preferredCategories: [TitleCategory.FAMILY, TitleCategory.GAMES],
      customBlockedWords: [],
      showDescriptions: true,
      defaultTitleCategory: TitleCategory.FAMILY,
      lastAppVersion: '2.0.0',
    };
  }
}

// Save slots management for the new system
export class SaveSlotsManager {
  static async getAllSaveSlots(): Promise<SaveSlot[]> {
    try {
      const slotsJson = await AsyncStorage.getItem(STORAGE_KEYS.SAVE_SLOTS);
      if (!slotsJson) {
        return this.createEmptySlots();
      }
      
      const slots = JSON.parse(slotsJson);
      return slots.map((slot: any) => ({
        ...slot,
        savedAt: new Date(slot.savedAt),
        titleSnapshot: {
          ...slot.titleSnapshot,
          createdAt: new Date(slot.titleSnapshot.createdAt),
          updatedAt: new Date(slot.titleSnapshot.updatedAt),
          lastUsed: slot.titleSnapshot.lastUsed ? new Date(slot.titleSnapshot.lastUsed) : undefined,
        },
      }));
    } catch (error) {
      console.error('Error loading save slots:', error);
      return this.createEmptySlots();
    }
  }

  static async saveSaveSlots(slots: SaveSlot[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SAVE_SLOTS, JSON.stringify(slots));
    } catch (error) {
      console.error('Error saving save slots:', error);
      throw error;
    }
  }

  static createEmptySlots(): SaveSlot[] {
    return Array.from({ length: 5 }, (_, index) => ({
      id: index + 1,
      name: `Slot ${index + 1}`,
      titleId: '',
      titleSnapshot: {} as Title,
      savedAt: new Date(),
      isUsed: false,
    }));
  }

  static async saveCurrentTitle(slotId: number, name: string): Promise<boolean> {
    try {
      const currentTitle = await TitleManager.getCurrentTitle();
      if (!currentTitle) return false;

      const slots = await this.getAllSaveSlots();
      const slotIndex = slots.findIndex(slot => slot.id === slotId);
      
      if (slotIndex === -1) return false;

      slots[slotIndex] = {
        id: slotId,
        name: name || `${currentTitle.name} - ${new Date().toLocaleDateString()}`,
        titleId: currentTitle.id,
        titleSnapshot: { ...currentTitle },
        savedAt: new Date(),
        isUsed: true,
      };

      await this.saveSaveSlots(slots);
      return true;
    } catch (error) {
      console.error('Error saving to slot:', error);
      return false;
    }
  }

  static async loadFromSlot(slotId: number): Promise<boolean> {
    try {
      const slots = await this.getAllSaveSlots();
      const slot = slots.find(slot => slot.id === slotId);
      
      if (!slot || !slot.isUsed) return false;

      // Create or update the title from the snapshot
      await TitleManager.updateTitle(slot.titleId, slot.titleSnapshot) ||
            await TitleManager.createTitle(slot.titleSnapshot);
      
      // Set as current title
      await TitleManager.setCurrentTitleId(slot.titleId);
      
      return true;
    } catch (error) {
      console.error('Error loading from slot:', error);
      return false;
    }
  }
}

// Utility functions for title system
export const titleUtils = {
  // Generate unique ID for titles and items
  generateId: (prefix: string = 'item'): string => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Validate title name
  isValidTitleName: (name: string): boolean => {
    return name.trim().length >= 1 && name.trim().length <= 50;
  },

  // Validate title description
  isValidTitleDescription: (description: string): boolean => {
    return description.length <= 200;
  },

  // Get category display name
  getCategoryDisplayName: (category: TitleCategory): string => {
    const displayNames = {
      [TitleCategory.FAMILY]: 'Family & Kids',
      [TitleCategory.FOOD]: 'Food & Dining',
      [TitleCategory.GAMES]: 'Games & Entertainment',
      [TitleCategory.DECISIONS]: 'Decisions & Choices',
      [TitleCategory.NUMBERS]: 'Numbers & Random',
      [TitleCategory.WORKPLACE]: 'Work & Professional',
      [TitleCategory.EDUCATION]: 'Education & Learning',
      [TitleCategory.ENTERTAINMENT]: 'Movies & Entertainment',
      [TitleCategory.CUSTOM]: 'Custom',
    };
    return displayNames[category] || category;
  },

  // Get category emoji
  getCategoryEmoji: (category: TitleCategory): string => {
    const emojis = {
      [TitleCategory.FAMILY]: '👨‍👩‍👧‍👦',
      [TitleCategory.FOOD]: '🍽️',
      [TitleCategory.GAMES]: '🎮',
      [TitleCategory.DECISIONS]: '🤔',
      [TitleCategory.NUMBERS]: '🎲',
      [TitleCategory.WORKPLACE]: '💼',
      [TitleCategory.EDUCATION]: '🎓',
      [TitleCategory.ENTERTAINMENT]: '🎬',
      [TitleCategory.CUSTOM]: '⭐',
    };
    return emojis[category] || '📋';
  },
};

/**
 * Generate a unique ID for titles
 */
export const generateTitleId = (): string => {
  return `title_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create a new Title object from form data
 */
export const createNewTitle = (
  name: string,
  description: string,
  category: TitleCategory,
  itemNames: string[]
): Title => {
  const items = itemNames.map((itemName, index) => ({
    id: `item_${Date.now()}_${index}`,
    name: itemName,
    emoji: '', // Will be populated by emoji service
    color: '#FFFFFF' // Will be assigned by color system
  }));

  return {
    id: generateTitleId(),
    name: name.trim(),
    emoji: titleUtils.getCategoryEmoji(category),
    description: description.trim(),
    category,
    items,
    isCustom: true,
    isPredetermined: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    spinCount: 0
  };
};