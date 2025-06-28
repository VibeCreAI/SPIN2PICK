import { FONTS } from '@/app/_layout';
import { BlurView } from 'expo-blur';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Title, TitleCategory, TitleManager } from '../utils/titleUtils';

interface HamburgerMenuProps {
    visible: boolean;
    onClose: () => void;
    onTitleSelected: (title: Title) => void;
    currentTitle: string;
    // Navigation props
    onNavigateToTitleManagement: () => void;
    onNavigateToActivityManagement: () => void;
    onNavigateToSettings: () => void;
    onNavigateToThemes: () => void;
    onNavigateToSaveLoad: () => void;
    onReset: () => void;
    onExportData: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function HamburgerMenu({
    visible,
    onClose,
    onTitleSelected,
    currentTitle,
    onNavigateToTitleManagement,
    onNavigateToActivityManagement,
    onNavigateToSettings,
    onNavigateToThemes,
    onNavigateToSaveLoad,
    onReset,
    onExportData
}: HamburgerMenuProps) {
    const { currentTheme } = useTheme();
    const [titlesByCategory, setTitlesByCategory] = useState<Record<TitleCategory, Title[]>>({
        [TitleCategory.FAMILY]: [],
        [TitleCategory.FOOD]: [],
        [TitleCategory.GAMES]: [],
        [TitleCategory.DECISIONS]: [],
        [TitleCategory.NUMBERS]: [],
        [TitleCategory.WORKPLACE]: [],
        [TitleCategory.EDUCATION]: [],
        [TitleCategory.ENTERTAINMENT]: [],
        [TitleCategory.CUSTOM]: [],
    });
    const [expandedCategories, setExpandedCategories] = useState<Set<TitleCategory>>(new Set());
    const slideAnim = useRef(new Animated.Value(screenWidth)).current;
    const overlayOpacity = useRef(new Animated.Value(0)).current;

    // Animation effects
    useEffect(() => {
        if (visible) {
            // Slide in from right and fade in overlay
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(overlayOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            // Slide out to right and fade out overlay
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: screenWidth,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(overlayOpacity, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    // Load titles on mount
    useEffect(() => {
        loadTitles();
    }, []);

    const loadTitles = async () => {
        try {
            const titles = await TitleManager.getAllTitles();
            const categorized: Record<TitleCategory, Title[]> = {
                [TitleCategory.FAMILY]: [],
                [TitleCategory.FOOD]: [],
                [TitleCategory.GAMES]: [],
                [TitleCategory.DECISIONS]: [],
                [TitleCategory.NUMBERS]: [],
                [TitleCategory.WORKPLACE]: [],
                [TitleCategory.EDUCATION]: [],
                [TitleCategory.ENTERTAINMENT]: [],
                [TitleCategory.CUSTOM]: [],
            };
            
            titles.forEach(title => {
                if (categorized[title.category]) {
                    categorized[title.category].push(title);
                }
            });
            
            setTitlesByCategory(categorized);
        } catch (error) {
            console.error('Error loading titles:', error);
        }
    };

    const toggleCategory = (category: TitleCategory) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(category)) {
            newExpanded.delete(category);
        } else {
            newExpanded.add(category);
        }
        setExpandedCategories(newExpanded);
    };

    const handleTitleSelect = (title: Title) => {
        onTitleSelected(title);
        onClose();
    };

    const handleDeleteTitle = async (titleId: string) => {
        Alert.alert(
            'Delete Title',
            'Are you sure you want to delete this title?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await TitleManager.deleteTitle(titleId);
                            await loadTitles();
                        } catch (error) {
                            console.error('Error deleting title:', error);
                            Alert.alert('Error', 'Failed to delete title');
                        }
                    },
                },
            ]
        );
    };

    // Category emoji mapping
    const getCategoryEmoji = (category: TitleCategory): string => {
        const emojiMap: Record<TitleCategory, string> = {
            [TitleCategory.FAMILY]: '🏠',
            [TitleCategory.FOOD]: '🍽️',
            [TitleCategory.GAMES]: '🎮',
            [TitleCategory.DECISIONS]: '🤔',
            [TitleCategory.NUMBERS]: '🔢',
            [TitleCategory.WORKPLACE]: '💼',
            [TitleCategory.EDUCATION]: '📚',
            [TitleCategory.ENTERTAINMENT]: '🎭',
            [TitleCategory.CUSTOM]: '⭐'
        };
        return emojiMap[category] || '📝';
    };

    const styles = StyleSheet.create({
        modal: {
            margin: 0,
            justifyContent: 'flex-end',
        },
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
        },
        menuPanel: {
            position: 'absolute',
            top: 0,
            right: 0,
            width: Math.min(320, screenWidth * 0.85),
            height: screenHeight,
            backgroundColor: currentTheme.uiColors.modalBackground,
            shadowColor: '#000',
            shadowOffset: { width: -2, height: 0 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 16,
        },
        header: {
            paddingTop: StatusBar.currentHeight || 44,
            paddingHorizontal: 20,
            paddingBottom: 20,
            backgroundColor: currentTheme.backgroundColor,
            borderBottomWidth: 1,
            borderBottomColor: currentTheme.uiColors.primary + '20',
        },
        headerTitle: {
            fontSize: 24,
            fontFamily: FONTS.nunito,
            fontWeight: 'bold',
            color: currentTheme.uiColors.text,
            textAlign: 'center',
            marginBottom: 8,
        },
        closeButton: {
            position: 'absolute',
            top: (StatusBar.currentHeight || 44) + 10,
            right: 20,
            padding: 8,
            backgroundColor: currentTheme.uiColors.accent + '20',
            borderRadius: 20,
        },
        closeButtonText: {
            fontSize: 18,
            color: currentTheme.uiColors.accent,
            fontWeight: 'bold',
        },
        scrollContainer: {
            flex: 1,
        },
        scrollContent: {
            paddingBottom: 20,
        },
        categorySection: {
            marginVertical: 8,
            marginHorizontal: 16,
        },
        categoryHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 12,
            paddingHorizontal: 16,
            backgroundColor: currentTheme.uiColors.cardBackground,
            borderRadius: 12,
            marginBottom: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        categoryTitle: {
            fontSize: 16,
            fontFamily: FONTS.nunito,
            fontWeight: '600',
            color: currentTheme.uiColors.text,
            flex: 1,
            marginLeft: 8,
        },
        categoryCount: {
            fontSize: 12,
            color: currentTheme.uiColors.text + '80',
            backgroundColor: currentTheme.uiColors.primary + '20',
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 10,
            marginRight: 8,
        },
        expandIcon: {
            fontSize: 16,
            color: currentTheme.uiColors.accent,
            fontWeight: 'bold',
        },
        titlesList: {
            marginLeft: 8,
        },
        titleItem: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 12,
            paddingHorizontal: 16,
            marginVertical: 2,
            backgroundColor: currentTitle === '' ? currentTheme.uiColors.primary + '15' : 'transparent',
            borderRadius: 10,
            borderWidth: currentTitle === '' ? 1 : 0,
            borderColor: currentTheme.uiColors.primary + '30',
        },
        titleContent: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
        },
        titleEmoji: {
            fontSize: 20,
            marginRight: 12,
        },
        titleText: {
            fontSize: 16,
            fontFamily: FONTS.nunito,
            color: currentTheme.uiColors.text,
            flex: 1,
        },
        deleteButton: {
            padding: 8,
            backgroundColor: '#ff4444' + '20',
            borderRadius: 6,
            marginLeft: 8,
        },
        deleteButtonText: {
            fontSize: 12,
            color: '#ff4444',
            fontWeight: 'bold',
        },
        emptyCategory: {
            paddingVertical: 20,
            paddingHorizontal: 16,
            alignItems: 'center',
        },
        emptyCategoryText: {
            fontSize: 14,
            color: currentTheme.uiColors.text + '60',
            fontStyle: 'italic',
        },
        // Navigation section styles
        navigationSection: {
            marginVertical: 16,
            marginHorizontal: 16,
        },
        titleSection: {
            marginTop: 24,
            marginHorizontal: 16,
        },
        sectionTitle: {
            fontSize: 18,
            fontFamily: FONTS.nunito,
            fontWeight: 'bold',
            color: currentTheme.uiColors.text,
            marginBottom: 12,
            paddingHorizontal: 4,
        },
        menuItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 14,
            paddingHorizontal: 16,
            marginVertical: 2,
            backgroundColor: currentTheme.uiColors.cardBackground,
            borderRadius: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 2,
        },
        menuItemIcon: {
            fontSize: 20,
            marginRight: 12,
            width: 24,
            textAlign: 'center',
        },
        menuItemText: {
            fontSize: 16,
            fontFamily: FONTS.nunito,
            color: currentTheme.uiColors.text,
            flex: 1,
        },
        menuItemArrow: {
            fontSize: 18,
            color: currentTheme.uiColors.accent,
            fontWeight: 'bold',
        },
    });

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
                <TouchableOpacity 
                    style={{ flex: 1 }} 
                    activeOpacity={1} 
                    onPress={onClose}
                />
                <Animated.View 
                    style={[
                        styles.menuPanel, 
                        { transform: [{ translateX: slideAnim }] }
                    ]}
                >
                    {Platform.OS === 'ios' ? (
                        <BlurView intensity={95} style={StyleSheet.absoluteFill} />
                    ) : null}
                    
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Menu</Text>
                        <TouchableOpacity 
                            style={styles.closeButton} 
                            onPress={onClose}
                        >
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView 
                        style={styles.scrollContainer}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Navigation Section */}
                        <View style={styles.navigationSection}>
                            <Text style={styles.sectionTitle}>🛠️ App Functions</Text>
                            
                            <TouchableOpacity style={styles.menuItem} onPress={() => { onNavigateToTitleManagement(); onClose(); }}>
                                <Text style={styles.menuItemIcon}>📝</Text>
                                <Text style={styles.menuItemText}>Manage Titles</Text>
                                <Text style={styles.menuItemArrow}>›</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity style={styles.menuItem} onPress={() => { onNavigateToActivityManagement(); onClose(); }}>
                                <Text style={styles.menuItemIcon}>🏃</Text>
                                <Text style={styles.menuItemText}>Manage Activities</Text>
                                <Text style={styles.menuItemArrow}>›</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity style={styles.menuItem} onPress={() => { onNavigateToThemes(); onClose(); }}>
                                <Text style={styles.menuItemIcon}>🎨</Text>
                                <Text style={styles.menuItemText}>Themes</Text>
                                <Text style={styles.menuItemArrow}>›</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity style={styles.menuItem} onPress={() => { onNavigateToSaveLoad(); onClose(); }}>
                                <Text style={styles.menuItemIcon}>💾</Text>
                                <Text style={styles.menuItemText}>Save/Load</Text>
                                <Text style={styles.menuItemArrow}>›</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity style={styles.menuItem} onPress={() => { onReset(); onClose(); }}>
                                <Text style={styles.menuItemIcon}>🔄</Text>
                                <Text style={styles.menuItemText}>Reset Activities</Text>
                                <Text style={styles.menuItemArrow}>›</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity style={styles.menuItem} onPress={() => { onExportData(); onClose(); }}>
                                <Text style={styles.menuItemIcon}>📤</Text>
                                <Text style={styles.menuItemText}>Export Data</Text>
                                <Text style={styles.menuItemArrow}>›</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity style={styles.menuItem} onPress={() => { onNavigateToSettings(); onClose(); }}>
                                <Text style={styles.menuItemIcon}>⚙️</Text>
                                <Text style={styles.menuItemText}>Settings</Text>
                                <Text style={styles.menuItemArrow}>›</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Title Selection Section */}
                        <View style={styles.titleSection}>
                            <Text style={styles.sectionTitle}>🎯 Quick Title Selection</Text>
                        </View>
                        {Object.entries(titlesByCategory).map(([category, titles]) => (
                            <View key={category} style={styles.categorySection}>
                                <TouchableOpacity
                                    style={styles.categoryHeader}
                                    onPress={() => toggleCategory(category as TitleCategory)}
                                >
                                    <Text style={styles.categoryTitle}>
                                        {getCategoryEmoji(category as TitleCategory)} {category}
                                    </Text>
                                    <Text style={styles.categoryCount}>
                                        {titles.length}
                                    </Text>
                                    <Text style={styles.expandIcon}>
                                        {expandedCategories.has(category as TitleCategory) ? '−' : '+'}
                                    </Text>
                                </TouchableOpacity>

                                {expandedCategories.has(category as TitleCategory) && (
                                    <View style={styles.titlesList}>
                                        {titles.length === 0 ? (
                                            <View style={styles.emptyCategory}>
                                                <Text style={styles.emptyCategoryText}>
                                                    No titles in this category yet
                                                </Text>
                                            </View>
                                        ) : (
                                            titles.map((title) => (
                                                <View key={title.id} style={styles.titleItem}>
                                                    <TouchableOpacity
                                                        style={styles.titleContent}
                                                        onPress={() => handleTitleSelect(title)}
                                                    >
                                                        <Text style={styles.titleEmoji}>
                                                            {title.emoji}
                                                        </Text>
                                                        <Text style={styles.titleText}>
                                                            {title.name}
                                                        </Text>
                                                    </TouchableOpacity>
                                                    {!title.isPredetermined && (
                                                        <TouchableOpacity
                                                            style={styles.deleteButton}
                                                            onPress={() => handleDeleteTitle(title.id)}
                                                        >
                                                            <Text style={styles.deleteButtonText}>
                                                                Delete
                                                            </Text>
                                                        </TouchableOpacity>
                                                    )}
                                                </View>
                                            ))
                                        )}
                                    </View>
                                )}
                            </View>
                        ))}
                    </ScrollView>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}