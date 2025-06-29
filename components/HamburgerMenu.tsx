import { FONTS } from '@/app/_layout';
import { Title } from '@/utils/titleUtils';
import { BlurView } from 'expo-blur';
import React, { useEffect, useRef } from 'react';
import {
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

interface HamburgerMenuProps {
    visible: boolean;
    onClose: () => void;
    // Navigation props
    onNavigateToTitleManagement: () => void;
    onNavigateToSettings: () => void;
    onNavigateToThemes: () => void;
    onNavigateToSaveLoad: () => void;
    onExportData: () => void;
    recentlyUsedTitles: Title[];
    onSelectTitle: (title: Title) => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
    visible,
    onClose,
    onNavigateToTitleManagement,
    onNavigateToSettings,
    onNavigateToThemes,
    onNavigateToSaveLoad,
    onExportData,
    recentlyUsedTitles,
    onSelectTitle,
}) => {
    const { currentTheme } = useTheme();
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
        // Navigation section styles
        navigationSection: {
            marginVertical: 16,
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
        navItem: {
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
        navText: {
            fontSize: 16,
            fontFamily: FONTS.nunito,
            color: currentTheme.uiColors.text,
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
                        {/* Manage Section */}
                        <View style={styles.navigationSection}>
                            <Text style={styles.sectionTitle}>Manage</Text>
                            <TouchableOpacity
                                style={styles.navItem}
                                onPress={() => {
                                    onNavigateToTitleManagement();
                                    onClose();
                                }}
                            >
                                <Text style={styles.navText}>🎯 Manage Wheels</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.navItem}
                                onPress={() => {
                                    onNavigateToSaveLoad();
                                    onClose();
                                }}
                            >
                                <Text style={styles.navText}>💾 Save/Load Lists</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Settings Section */}
                        <View style={styles.navigationSection}>
                            <Text style={styles.sectionTitle}>Settings</Text>
                            <TouchableOpacity
                                style={styles.navItem}
                                onPress={() => {
                                    onNavigateToThemes();
                                    onClose();
                                }}
                            >
                                <Text style={styles.navText}>🎨 Themes</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.navItem}
                                onPress={() => {
                                    onNavigateToSettings();
                                    onClose();
                                }}
                            >
                                <Text style={styles.navText}>⚙️ Settings</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Data Section */}
                        <View style={styles.navigationSection}>
                            <Text style={styles.sectionTitle}>Data</Text>
                            <TouchableOpacity
                                style={styles.navItem}
                                onPress={() => {
                                    onExportData();
                                    onClose();
                                }}
                            >
                                <Text style={styles.navText}>📤 Export Data</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Recently Used Titles Section */}
                        {recentlyUsedTitles && recentlyUsedTitles.length > 0 && (
                            <View style={styles.navigationSection}>
                                <Text style={styles.sectionTitle}>🕒 Recently Used</Text>
                                {recentlyUsedTitles.map(title => (
                                    <TouchableOpacity
                                        key={title.id}
                                        style={styles.navItem}
                                        onPress={() => {
                                            onSelectTitle(title);
                                            onClose();
                                        }}
                                    >
                                        <Text style={styles.navText}>{title.emoji} {title.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </ScrollView>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}