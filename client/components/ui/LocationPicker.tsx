import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    FlatList,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { theme } from '@/constants/theme';
import { POPULAR_LOCATIONS } from '@/constants/locations';
import { IconSymbol } from './icon-symbol';
import { locationService, LocationResult } from '@/services/locationService';

interface LocationPickerProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (location: string) => void;
    placeholder?: string;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
    visible,
    onClose,
    onSelect,
    placeholder = 'Search location',
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length > 1) {
                setIsLoading(true);
                try {
                    const results = await locationService.searchPlaces(searchQuery);
                    setSearchResults(results);
                } catch (error) {
                    console.error('Search failed:', error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSelect = (location: string) => {
        onSelect(location);
        setSearchQuery('');
        setSearchResults([]);
        onClose();
    };

    const renderItem = ({ item }: { item: LocationResult }) => (
        <TouchableOpacity
            style={styles.locationItem}
            onPress={() => handleSelect(item.name)}
        >
            <View style={styles.iconContainer}>
                <IconSymbol name="mappin.and.ellipse" size={24} color={theme.colors.textSecondary} />
            </View>
            <View style={styles.locationInfo}>
                <Text style={styles.locationName}>{item.name}</Text>
                <Text style={styles.locationAddress}>{item.address}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.dragIndicator} />
                    <View style={styles.headerTop}>
                        <Text style={styles.title}>Select Location</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeText}>Close</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchContainer}>
                        <IconSymbol name="magnifyingglass" size={20} color={theme.colors.textTertiary} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder={placeholder}
                            placeholderTextColor={theme.colors.textTertiary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <IconSymbol name="xmark.circle.fill" size={20} color={theme.colors.textTertiary} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Content */}
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                        <Text style={styles.loadingText}>Searching...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={searchQuery.length > 1 ? searchResults : POPULAR_LOCATIONS}
                        keyExtractor={(item) => item.id}
                        keyboardShouldPersistTaps="handled"
                        ListHeaderComponent={() => (
                            <>
                                {searchQuery.length > 0 && (
                                    <TouchableOpacity
                                        style={styles.customLocationItem}
                                        onPress={() => handleSelect(searchQuery)}
                                    >
                                        <View style={styles.iconContainer}>
                                            <IconSymbol name="mappin.circle.fill" size={24} color={theme.colors.primary} />
                                        </View>
                                        <View style={styles.locationInfo}>
                                            <Text style={styles.locationName}>Use "{searchQuery}"</Text>
                                            <Text style={styles.locationAddress}>Custom Location</Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                                <Text style={styles.sectionTitle}>
                                    {searchQuery.length > 1 ? 'Search Results' : 'Popular Locations'}
                                </Text>
                            </>
                        )}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            searchQuery.length > 1 ? (
                                <Text style={styles.emptyText}>No places found</Text>
                            ) : null
                        }
                    />
                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        padding: theme.spacing.md,
        backgroundColor: theme.colors.white,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        paddingTop: Platform.OS === 'ios' ? 20 : theme.spacing.md,
    },
    dragIndicator: {
        width: 40,
        height: 4,
        backgroundColor: theme.colors.gray300,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: theme.spacing.md,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    title: {
        ...theme.typography.headingS,
        color: theme.colors.textPrimary,
    },
    closeButton: {
        padding: theme.spacing.xs,
    },
    closeText: {
        ...theme.typography.bodyM,
        color: theme.colors.primary,
        fontWeight: '600',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.gray100,
        borderRadius: theme.radius.lg,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        gap: theme.spacing.sm,
    },
    searchInput: {
        flex: 1,
        ...theme.typography.bodyL,
        color: theme.colors.textPrimary,
        paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    },
    listContent: {
        padding: theme.spacing.md,
    },
    sectionTitle: {
        ...theme.typography.captionM,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.sm,
        marginTop: theme.spacing.md,
        fontWeight: '600',
    },
    locationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        gap: theme.spacing.md,
    },
    customLocationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        gap: theme.spacing.md,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.gray100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    locationInfo: {
        flex: 1,
    },
    locationName: {
        ...theme.typography.bodyM,
        color: theme.colors.textPrimary,
        fontWeight: '500',
        marginBottom: 2,
    },
    locationAddress: {
        ...theme.typography.captionM,
        color: theme.colors.textSecondary,
    },
    loadingContainer: {
        padding: theme.spacing.xl,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: theme.spacing.sm,
        ...theme.typography.bodyS,
        color: theme.colors.textSecondary,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: theme.spacing.xl,
        ...theme.typography.bodyM,
        color: theme.colors.textSecondary,
    },
});
