import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
  RefreshControl,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { theme } from '@/constants/theme';
import { ScreenContainer, Card, SectionHeader, Divider, Badge, Button } from '@/components/ui/primitives';
import { rideService } from '@/services/mock/rideService';
import { Ride } from '@/types/ride';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [myRides, setMyRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMyRides = useCallback(async () => {
    try {
      // In a real app, we'd have a specific endpoint for "my rides"
      // For mock, we'll fetch all and filter
      const response = await rideService.getAvailableRides();
      if (response.data) {
        // Filter rides where current user is organizer or participant
        // Mock logic: assuming 'user_current' is the ID
        const filtered = response.data.filter(ride =>
          ride.organizer_id === 'user_current' ||
          ride.participants?.some(p => p.user_id === 'user_current')
        );
        setMyRides(filtered);
      }
    } catch (error) {
      console.error('Error loading rides:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMyRides();
  }, [loadMyRides]);

  const onRefresh = () => {
    setRefreshing(true);
    loadMyRides();
  };

  const handleDeleteRide = (rideId: string) => {
    Alert.alert(
      'Delete Ride',
      'Are you sure you want to delete this ride? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const response = await rideService.deleteRide(rideId);
            if (response.error) {
              Alert.alert('Error', response.error);
            } else {
              Alert.alert('Success', 'Ride deleted');
              loadMyRides();
            }
          },
        },
      ]
    );
  };

  const handleLeaveRide = (rideId: string) => {
    Alert.alert(
      'Leave Ride',
      'Are you sure you want to leave this ride?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            const response = await rideService.leaveRide(rideId);
            if (response.error) {
              Alert.alert('Error', response.error);
            } else {
              Alert.alert('Success', 'You left the ride');
              loadMyRides();
            }
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScreenContainer backgroundColor={theme.colors.backgroundSecondary}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
      >
        {/* Profile Info Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>
                {user?.user_metadata?.full_name?.substring(0, 1).toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.profileTexts}>
              <Text style={styles.profileName}>
                {user?.user_metadata?.full_name || 'User'}
              </Text>
              <Text style={styles.profileEmail}>{user?.email || 'No email'}</Text>
              <View style={styles.ratingContainer}>
                <IconSymbol name="star.fill" size={16} color="#F59E0B" />
                <Text style={styles.ratingText}>4.8 (24 rides)</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Settings Section */}
        <Card style={styles.sectionCard}>
          <SectionHeader title="Settings" />
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconBox, { backgroundColor: '#E0F2FE' }]}>
                <IconSymbol name="bell.fill" size={20} color="#0284C7" />
              </View>
              <Text style={styles.settingLabel}>Notifications</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={theme.colors.gray400} />
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconBox, { backgroundColor: '#DCFCE7' }]}>
                <IconSymbol name="shield.fill" size={20} color="#16A34A" />
              </View>
              <Text style={styles.settingLabel}>Privacy & Security</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={theme.colors.gray400} />
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconBox, { backgroundColor: '#FEF3C7' }]}>
                <IconSymbol name="creditcard.fill" size={20} color="#D97706" />
              </View>
              <Text style={styles.settingLabel}>Payments</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={theme.colors.gray400} />
          </TouchableOpacity>
        </Card>

        {/* My Rides Section */}
        <Text style={styles.sectionTitle}>My Rides</Text>
        {myRides.length === 0 ? (
          <Card>
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🚗</Text>
              <Text style={styles.emptyStateText}>No rides yet</Text>
              <Text style={styles.emptyStateSubtext}>Your planned and joined rides will appear here</Text>
            </View>
          </Card>
        ) : (
          myRides.map((ride) => {
            const isOrganizer = ride.organizer_id === 'user_current'; // Mock check
            return (
              <Card key={ride.id} style={styles.rideCard}>
                <View style={styles.rideHeader}>
                  <View>
                    <Text style={styles.rideDate}>{formatDate(ride.scheduled_start_time)}</Text>
                    <Text style={styles.rideRoute} numberOfLines={1}>
                      {ride.start_location_name} → {ride.destination_name}
                    </Text>
                  </View>
                  <Badge
                    text={isOrganizer ? 'Organizer' : 'Passenger'}
                    variant={isOrganizer ? 'success' : 'info'}
                    size="sm"
                  />
                </View>

                <Divider spacing="sm" />

                <View style={styles.rideActions}>
                  <Button
                    title="View Details"
                    variant="outline"
                    size="sm"
                    onPress={() => router.push(`/ride-details/${ride.id}` as any)}
                  />
                  {isOrganizer ? (
                    <Button
                      title="Delete"
                      variant="danger"
                      size="sm"
                      onPress={() => handleDeleteRide(ride.id)}
                    />
                  ) : (
                    <Button
                      title="Leave"
                      variant="ghost"
                      size="sm"
                      onPress={() => handleLeaveRide(ride.id)}
                      style={{ backgroundColor: theme.colors.gray100 }}
                    />
                  )}
                </View>
              </Card>
            );
          })
        )}

        <Button
          title="Sign Out"
          variant="secondary"
          onPress={handleSignOut}
          style={styles.signOutButton}
        />

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: theme.spacing.base,
    paddingTop: Platform.OS === 'ios' ? theme.spacing.xl : theme.spacing.lg,
    paddingBottom: theme.spacing.base,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  headerTitle: {
    ...theme.typography.headingXL,
    color: theme.colors.textPrimary,
  },
  scrollContent: {
    padding: theme.spacing.base,
  },
  profileCard: {
    marginBottom: theme.spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  avatarLargeText: {
    ...theme.typography.headingL,
    color: theme.colors.white,
  },
  profileTexts: {
    flex: 1,
  },
  profileName: {
    ...theme.typography.headingM,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  profileEmail: {
    ...theme.typography.bodyS,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    ...theme.typography.captionM,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  sectionCard: {
    marginBottom: theme.spacing.xl,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  settingIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    ...theme.typography.bodyM,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  sectionTitle: {
    ...theme.typography.headingL,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  rideCard: {
    marginBottom: theme.spacing.md,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  rideDate: {
    ...theme.typography.captionM,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  rideRoute: {
    ...theme.typography.bodyM,
    color: theme.colors.textPrimary,
    fontWeight: '600',
    maxWidth: 200,
  },
  rideActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.md,
  },
  emptyStateText: {
    ...theme.typography.headingS,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    ...theme.typography.bodyS,
    color: theme.colors.textSecondary,
  },
  signOutButton: {
    marginTop: theme.spacing.xl,
  },
  bottomSpacer: {
    height: 40,
  },
});
