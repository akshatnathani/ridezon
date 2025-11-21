import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@/constants/theme';
import { Card, Badge } from '@/components/ui/primitives';
import { Ride } from '@/types/ride';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface RideCardProps {
    ride: Ride;
    onPress: () => void;
    onCallDriver?: (phone?: string) => void;
    onRequestRide?: (ride: Ride) => void;
}

export const RideCard: React.FC<RideCardProps> = ({
    ride,
    onPress,
    onCallDriver,
    onRequestRide,
}) => {
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const driver = ride.participants?.find((p) => p.role === 'ORGANIZER')?.user;
    const isFull = ride.available_seats === 0;

    return (
        <Card style={styles.container} onPress={onPress} shadow="sm" variant="elevated">
            {/* Header: Time & Price */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.time}>{formatTime(ride.scheduled_start_time)}</Text>
                    <Text style={styles.date}>{formatDate(ride.scheduled_start_time)}</Text>
                </View>
                <View style={styles.priceContainer}>
                    <Text style={styles.price}>${ride.price_per_seat}</Text>
                </View>
            </View>

            {/* Route Visualization */}
            <View style={styles.routeContainer}>
                <View style={styles.timeline}>
                    <View style={[styles.dot, styles.dotStart]} />
                    <View style={styles.line} />
                    <View style={[styles.dot, styles.dotEnd]} />
                </View>
                <View style={styles.locations}>
                    <View style={styles.locationItem}>
                        <Text style={styles.locationLabel} numberOfLines={1}>
                            {ride.start_location_name}
                        </Text>
                    </View>
                    <View style={styles.locationItem}>
                        <Text style={styles.locationLabel} numberOfLines={1}>
                            {ride.destination_name}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Footer: Driver & Actions */}
            <View style={styles.footer}>
                <View style={styles.driverInfo}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {driver?.full_name.charAt(0).toUpperCase() || '?'}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.driverName} numberOfLines={1}>
                            {driver?.full_name || 'Unknown Driver'}
                        </Text>
                        <View style={styles.metaRow}>
                            <Text style={styles.seatsText}>
                                {ride.available_seats} seats left
                            </Text>
                            {ride.is_female_only && (
                                <View style={styles.femaleBadge}>
                                    <Text style={styles.femaleBadgeText}>Female Only</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                <View style={styles.actions}>
                    {onCallDriver && (
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => onCallDriver(driver?.phone)}
                        >
                            <IconSymbol name="phone.fill" size={20} color={theme.colors.gray600} />
                        </TouchableOpacity>
                    )}
                    {onRequestRide && (
                        <TouchableOpacity
                            style={[styles.joinButton, isFull && styles.joinButtonDisabled]}
                            onPress={() => onRequestRide(ride)}
                            disabled={isFull}
                        >
                            <Text style={styles.joinButtonText}>{isFull ? 'Full' : 'Join'}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.base,
        padding: theme.spacing.lg,
        borderRadius: theme.radius.xl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: theme.spacing.lg,
    },
    time: {
        ...theme.typography.headingM,
        color: theme.colors.textPrimary,
    },
    date: {
        ...theme.typography.captionM,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    priceContainer: {
        backgroundColor: theme.colors.primaryLight,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.radius.full,
    },
    price: {
        ...theme.typography.headingS,
        color: theme.colors.primaryDark,
    },
    routeContainer: {
        flexDirection: 'row',
        marginBottom: theme.spacing.xl,
    },
    timeline: {
        alignItems: 'center',
        marginRight: theme.spacing.md,
        paddingVertical: 4,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: theme.colors.white,
        ...theme.shadows.sm,
    },
    dotStart: {
        backgroundColor: theme.colors.primary,
    },
    dotEnd: {
        backgroundColor: theme.colors.black,
    },
    line: {
        width: 2,
        flex: 1,
        backgroundColor: theme.colors.gray200,
        marginVertical: 2,
    },
    locations: {
        flex: 1,
        justifyContent: 'space-between',
        height: 56, // Fixed height to match timeline visual
    },
    locationItem: {
        justifyContent: 'center',
    },
    locationLabel: {
        ...theme.typography.bodyM,
        color: theme.colors.textPrimary,
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.gray100,
    },
    driverInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: theme.spacing.md,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.gray200,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.sm,
    },
    avatarText: {
        ...theme.typography.captionM,
        fontWeight: '600',
        color: theme.colors.gray700,
    },
    driverName: {
        ...theme.typography.captionM,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 2,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    seatsText: {
        ...theme.typography.captionS,
        color: theme.colors.textSecondary,
    },
    femaleBadge: {
        marginLeft: theme.spacing.xs,
        backgroundColor: '#FCE7F3',
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 4,
    },
    femaleBadgeText: {
        fontSize: 10,
        color: '#DB2777',
        fontWeight: '600',
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.gray100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    joinButton: {
        backgroundColor: theme.colors.black,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.radius.full,
    },
    joinButtonDisabled: {
        backgroundColor: theme.colors.gray300,
    },
    joinButtonText: {
        ...theme.typography.buttonSmall,
        color: theme.colors.white,
    },
});
