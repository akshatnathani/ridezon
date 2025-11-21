import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { theme } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HomeHeaderProps {
    locationName?: string;
    locationLoading?: boolean;
    onLocationPress?: () => void;
    onProfilePress?: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
    locationName,
    locationLoading,
    onLocationPress,
    onProfilePress,
}) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top + theme.spacing.md }]}>
            <View style={styles.topRow}>
                <TouchableOpacity
                    style={styles.locationBadge}
                    onPress={onLocationPress}
                    activeOpacity={0.8}
                >
                    <IconSymbol name="location.fill" size={16} color={theme.colors.primary} />
                    <Text style={styles.locationText} numberOfLines={1}>
                        {locationLoading ? 'Locating...' : locationName || 'Set Location'}
                    </Text>
                    <IconSymbol name="chevron.down" size={12} color={theme.colors.gray500} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.profileButton}
                    onPress={onProfilePress}
                    activeOpacity={0.8}
                >
                    <IconSymbol name="person.circle.fill" size={32} color={theme.colors.gray300} />
                </TouchableOpacity>
            </View>

            <View style={styles.titleContainer}>
                <Text style={styles.greeting}>Hello there! 👋</Text>
                <Text style={styles.title}>Where to today?</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.background,
        paddingHorizontal: theme.spacing.base,
        paddingBottom: theme.spacing.lg,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    locationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.gray50,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: 8,
        borderRadius: theme.radius.full,
        borderWidth: 1,
        borderColor: theme.colors.gray200,
        gap: theme.spacing.xs,
        maxWidth: '70%',
    },
    locationText: {
        ...theme.typography.captionL,
        color: theme.colors.textPrimary,
        fontWeight: '600',
        flexShrink: 1,
    },
    profileButton: {
        padding: 4,
    },
    titleContainer: {
        gap: theme.spacing.xs,
    },
    greeting: {
        ...theme.typography.bodyL,
        color: theme.colors.textSecondary,
    },
    title: {
        ...theme.typography.headingXL,
        color: theme.colors.textPrimary,
    },
});
