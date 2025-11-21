import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  Linking,
  RefreshControl,
  ScrollView,
} from 'react-native';
import * as Location from 'expo-location';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { ScreenContainer, EmptyState, Tag } from '@/components/ui/primitives';
import { RideCard } from '@/components/RideCard';
import { HomeHeader } from '@/components/HomeHeader';
import { rideService } from '@/services/mock/rideService';
import { Ride } from '@/types/ride';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function RidesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [rides, setRides] = useState<Ride[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const filters: any = {};

      if (activeFilter === 'Today') {
        filters.date = new Date().toISOString();
      } else if (activeFilter === 'Tomorrow') {
        const tmrw = new Date();
        tmrw.setDate(tmrw.getDate() + 1);
        filters.date = tmrw.toISOString();
      } else if (activeFilter === 'Female Only') {
        filters.femaleOnly = true;
      } else if (activeFilter === 'Lowest Price') {
        filters.sortBy = 'price_asc';
      }

      const response = await rideService.getAvailableRides(filters);
      if (response.data) {
        setRides(response.data);
      }
    } catch (error) {
      console.error('Error fetching rides:', error);
      Alert.alert('Error', 'Failed to load rides');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const requestLocationPermission = async () => {
    try {
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        // Don't block the UI, just show default state
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUserLocation(location);
    } catch (error) {
      console.error('Location error:', error);
    } finally {
      setLocationLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleFilterPress = (filter: string) => {
    if (activeFilter === filter) {
      setActiveFilter(null); // Toggle off
    } else {
      setActiveFilter(filter);
    }
  };

  const handleRequestRide = async (ride: Ride) => {
    if (!user) return;

    Alert.alert(
      'Request to Join',
      `Request to join ride to ${ride.destination_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request',
          onPress: async () => {
            const response = await rideService.joinRide(ride.id);
            if (response.error) {
              Alert.alert('Error', response.error);
            } else {
              Alert.alert('Success', 'You have joined the ride!');
              loadData();
            }
          },
        },
      ]
    );
  };

  const handleCallDriver = (phone?: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert('Info', 'Driver phone number not available');
    }
  };

  const renderHeader = () => (
    <View>
      <HomeHeader
        locationName={userLocation ? 'Current Location' : undefined}
        locationLoading={locationLoading}
        onLocationPress={requestLocationPermission}
        onProfilePress={() => router.push('/(tabs)/profile')}
      />

      {/* Search Trigger */}
      <TouchableOpacity
        style={styles.searchContainer}
        onPress={() => router.push('/search-rides' as any)}
        activeOpacity={0.9}
      >
        <View style={styles.searchBar}>
          <IconSymbol name="magnifyingglass" size={20} color={theme.colors.gray500} />
          <Text style={styles.searchPlaceholder}>Where do you want to go?</Text>
        </View>
      </TouchableOpacity>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        <Tag
          text="Today"
          selected={activeFilter === 'Today'}
          onPress={() => handleFilterPress('Today')}
        />
        <Tag
          text="Tomorrow"
          selected={activeFilter === 'Tomorrow'}
          onPress={() => handleFilterPress('Tomorrow')}
        />
        <Tag
          text="Female Only"
          selected={activeFilter === 'Female Only'}
          onPress={() => handleFilterPress('Female Only')}
          leftIcon={<IconSymbol name="person.2.fill" size={12} color={activeFilter === 'Female Only' ? theme.colors.white : theme.colors.gray500} />}
        />
        <Tag
          text="Lowest Price"
          selected={activeFilter === 'Lowest Price'}
          onPress={() => handleFilterPress('Lowest Price')}
        />
        <Tag
          text="AC Car"
          selected={activeFilter === 'AC Car'}
          onPress={() => handleFilterPress('AC Car')}
        />
      </ScrollView>

      <Text style={styles.sectionTitle}>
        {activeFilter ? `${activeFilter} Rides` : 'Nearby Rides'}
      </Text>
    </View>
  );

  return (
    <ScreenContainer backgroundColor={theme.colors.backgroundSecondary} edges={['top']}>
      <FlatList
        data={rides}
        renderItem={({ item }) => (
          <RideCard
            ride={item}
            onPress={() => router.push(`/ride-details/${item.id}` as any)}
            onCallDriver={handleCallDriver}
            onRequestRide={handleRequestRide}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon={<Text style={{ fontSize: 48 }}>🚗</Text>}
              title="No rides available"
              subtitle="Be the first to create a ride in your area"
              action={{
                label: 'Create Ride',
                onPress: () => router.push('/create-ride' as any),
              }}
            />
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/create-ride' as any)}
        activeOpacity={0.9}
      >
        <IconSymbol name="plus" size={32} color={theme.colors.white} />
      </TouchableOpacity>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 100,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.base,
    marginBottom: theme.spacing.lg,
    marginTop: -theme.spacing.md, // Pull up into header space slightly
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    ...theme.shadows.md,
    gap: theme.spacing.md,
  },
  searchPlaceholder: {
    ...theme.typography.bodyM,
    color: theme.colors.textTertiary,
  },
  filtersContainer: {
    marginBottom: theme.spacing.xl,
    maxHeight: 40,
  },
  filtersContent: {
    paddingHorizontal: theme.spacing.base,
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    ...theme.typography.headingL,
    color: theme.colors.textPrimary,
    paddingHorizontal: theme.spacing.base,
    marginBottom: theme.spacing.md,
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    right: theme.spacing.base,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.lg,
  },
});
