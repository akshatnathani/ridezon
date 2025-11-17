import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import * as Location from 'expo-location';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { ScreenContainer, Button, Card, Badge, Tag, EmptyState } from '@/components/ui/primitives';

interface Ride {
  id: string;
  createdBy: {
    id: string;
    name: string;
    phone: string;
    gender: string;
  };
  from: string;
  to: string;
  date: string;
  time: string;
  seats: number;
  seatsAvailable: number;
  price: number;
  description: string;
  itinerary: string[];
  femaleOnly: boolean;
  pickupLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  dropoffLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  distance: number;
  requests: string[];
}

export default function RidesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [rides, setRides] = useState<Ride[]>([]);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'We need your location to show nearby rides',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      setUserLocation(location);
      await fetchNearbyRides(location);
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to get your location');
    } finally {
      setLocationLoading(false);
      setLoading(false);
    }
  };

  const fetchNearbyRides = async (location: Location.LocationObject) => {
    const mockRides: Ride[] = [
      {
        id: '1',
        createdBy: {
          id: 'user1',
          name: 'Sarah Johnson',
          phone: '+1 (555) 123-4567',
          gender: 'Female',
        },
        from: 'University Campus',
        to: 'Downtown Mall',
        date: '2025-11-18',
        time: '3:00 PM',
        seats: 4,
        seatsAvailable: 2,
        price: 150,
        description: 'Going to the mall for shopping. Can pick up from main gate.',
        itinerary: ['University Main Gate', 'Central Avenue', 'Downtown Mall'],
        femaleOnly: true,
        pickupLocation: {
          latitude: location.coords.latitude + 0.01,
          longitude: location.coords.longitude + 0.01,
          address: 'University Campus, Main Gate',
        },
        dropoffLocation: {
          latitude: location.coords.latitude + 0.05,
          longitude: location.coords.longitude + 0.05,
          address: 'Downtown Mall, Entrance A',
        },
        distance: 2.3,
        requests: [],
      },
      {
        id: '2',
        createdBy: {
          id: 'user2',
          name: 'Michael Chen',
          phone: '+1 (555) 234-5678',
          gender: 'Male',
        },
        from: 'Campus Dorms',
        to: 'Airport',
        date: '2025-11-18',
        time: '8:00 AM',
        seats: 3,
        seatsAvailable: 1,
        price: 250,
        description: 'Early morning airport ride. Have luggage space.',
        itinerary: ['Campus Dorms', 'Highway 101', 'Airport Terminal 2'],
        femaleOnly: false,
        pickupLocation: {
          latitude: location.coords.latitude - 0.02,
          longitude: location.coords.longitude - 0.01,
          address: 'Campus Dorms, Building C',
        },
        dropoffLocation: {
          latitude: location.coords.latitude + 0.15,
          longitude: location.coords.longitude + 0.12,
          address: 'International Airport',
        },
        distance: 5.7,
        requests: [],
      },
    ];

    setRides(mockRides);
  };

  const handleRequestRide = (ride: Ride) => {
    if (!user) return;

    Alert.alert(
      'Request to Join',
      `Request to join ${ride.createdBy.name}'s ride from ${ride.from} to ${ride.to}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request',
          onPress: () => {
            Alert.alert('Request Sent', 'The ride creator will be notified of your request.');
          },
        },
      ]
    );
  };

  const handleCallDriver = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleCreateRide = () => {
    router.push('/create-ride' as any);
  };

  const handleOpenSearch = () => {
    router.push('/search-rides' as any);
  };

  if (loading || locationLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color={theme.colors.primary} />
        <Text style={styles.loadingText}>
          {locationLoading ? 'Getting your location...' : 'Loading rides...'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle='dark-content' backgroundColor={theme.colors.background} />
      
      {/* Premium Header with Location */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.locationBadge}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText} numberOfLines={1}>
              {userLocation ? 'Near you' : 'Location unavailable'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.myRidesButton}
            onPress={() => router.push('/rides' as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.myRidesIcon}>📋</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Find your ride</Text>
      </View>

      {/* Premium Search Bar */}
      <TouchableOpacity 
        style={styles.searchBar}
        onPress={handleOpenSearch}
        activeOpacity={0.9}
      >
        <View style={styles.searchContent}>
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>Where do you want to go?</Text>
        </View>
      </TouchableOpacity>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        <Tag text="Today" selected />
        <Tag text="Tomorrow" />
        <Tag text="This Week" />
        <Tag text="Female Only" leftIcon={<Text style={styles.filterIcon}>♀</Text>} />
        <Tag text="Budget" leftIcon={<Text style={styles.filterIcon}>💰</Text>} />
      </ScrollView>

      {/* Rides List */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {rides.length === 0 ? (
          <EmptyState
            icon={<Text style={styles.emptyIcon}>🚗</Text>}
            title="No rides available"
            subtitle="Be the first to create a ride in your area"
            action={{
              label: 'Create Ride',
              onPress: handleCreateRide,
            }}
          />
        ) : (
          rides.map((ride) => (
            <Card key={ride.id} style={styles.rideCard} shadow="lg">
              {/* Time and Route */}
              <View style={styles.rideHeader}>
                <View style={styles.timeSection}>
                  <Text style={styles.timeText}>{ride.time}</Text>
                  <Text style={styles.dateText}>{ride.date.split('-').slice(1).join('/')}</Text>
                </View>
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>{ride.distance.toFixed(1)} km</Text>
                </View>
              </View>

              {/* Route Visualization */}
              <View style={styles.routeContainer}>
                <View style={styles.routeVisual}>
                  <View style={styles.routeDot} />
                  <View style={styles.routeLine} />
                  <View style={[styles.routeDot, styles.routeDotEnd]} />
                </View>
                <View style={styles.routeLabels}>
                  <Text style={styles.routeFromText} numberOfLines={1}>{ride.from}</Text>
                  <Text style={styles.routeToText} numberOfLines={1}>{ride.to}</Text>
                </View>
              </View>

              {/* Driver Info */}
              <View style={styles.driverSection}>
                <View style={styles.driverAvatar}>
                  <Text style={styles.driverAvatarText}>
                    {ride.createdBy.name.substring(0, 1).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.driverDetails}>
                  <Text style={styles.driverName}>{ride.createdBy.name}</Text>
                  <View style={styles.driverMeta}>
                    <Text style={styles.metaText}>{ride.seatsAvailable} seats available</Text>
                    {ride.femaleOnly && (
                      <>
                        <Text style={styles.metaDot}>•</Text>
                        <Text style={styles.femaleOnlyText}>♀ Female only</Text>
                      </>
                    )}
                  </View>
                </View>
              </View>

              {/* Price and Actions */}
              <View style={styles.rideFooter}>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceAmount}>₹{ride.price}</Text>
                  <Text style={styles.priceLabel}>per seat</Text>
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => handleCallDriver(ride.createdBy.phone)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.callIcon}>📞</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.requestButton,
                      ride.seatsAvailable === 0 && styles.requestButtonDisabled,
                    ]}
                    onPress={() => handleRequestRide(ride)}
                    disabled={ride.seatsAvailable === 0}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.requestButtonText}>
                      {ride.seatsAvailable === 0 ? 'Full' : 'Request'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* FAB - Create Ride */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateRide}
        activeOpacity={0.9}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // Base
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    ...theme.typography.bodyM,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.base,
  },

  // Header
  header: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.base,
    paddingTop: Platform.OS === 'ios' ? theme.spacing.xxxxl : theme.spacing.lg,
    paddingBottom: theme.spacing.base,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray50,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    flex: 1,
    marginRight: theme.spacing.md,
  },
  locationIcon: {
    fontSize: theme.iconSize.sm,
    marginRight: theme.spacing.xs,
  },
  locationText: {
    ...theme.typography.bodyS,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  myRidesButton: {
    width: 44,
    height: 44,
    backgroundColor: theme.colors.gray100,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  myRidesIcon: {
    fontSize: theme.iconSize.lg,
  },
  headerTitle: {
    ...theme.typography.headingXL,
    color: theme.colors.textPrimary,
  },

  // Search Bar
  searchBar: {
    marginHorizontal: theme.spacing.base,
    marginTop: theme.spacing.base,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
  searchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
  },
  searchIcon: {
    fontSize: theme.iconSize.md,
    marginRight: theme.spacing.md,
  },
  searchPlaceholder: {
    ...theme.typography.bodyM,
    color: theme.colors.textTertiary,
  },

  // Filters
  filtersContainer: {
    marginTop: theme.spacing.base,
    maxHeight: 44,
  },
  filtersContent: {
    paddingHorizontal: theme.spacing.base,
    gap: theme.spacing.sm,
  },
  filterIcon: {
    fontSize: theme.iconSize.sm,
  },

  // Rides List
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: theme.spacing.base,
    paddingBottom: 10,
  },

  // Empty State
  emptyIcon: {
    fontSize: 48,
  },

  // Ride Card
  rideCard: {
    marginBottom: theme.spacing.base,
    padding: theme.spacing.base,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.base,
  },
  timeSection: {
    flex: 1,
  },
  timeText: {
    ...theme.typography.headingL,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  dateText: {
    ...theme.typography.captionL,
    color: theme.colors.textSecondary,
  },
  durationBadge: {
    backgroundColor: theme.colors.gray100,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
  },
  durationText: {
    ...theme.typography.captionL,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },

  // Route
  routeContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
  },
  routeVisual: {
    width: 20,
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
  },
  routeDotEnd: {
    backgroundColor: theme.colors.gray900,
  },
  routeLine: {
    width: 2,
    flex: 1,
    backgroundColor: theme.colors.gray200,
    marginVertical: theme.spacing.xs,
  },
  routeLabels: {
    flex: 1,
    justifyContent: 'space-between',
  },
  routeFromText: {
    ...theme.typography.bodyL,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  routeToText: {
    ...theme.typography.bodyL,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },

  // Driver
  driverSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.base,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  driverAvatar: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.gray900,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  driverAvatarText: {
    ...theme.typography.bodyM,
    color: theme.colors.white,
    fontWeight: '600',
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    ...theme.typography.bodyM,
    color: theme.colors.textPrimary,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  driverMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    ...theme.typography.captionL,
    color: theme.colors.textSecondary,
  },
  metaDot: {
    ...theme.typography.captionL,
    color: theme.colors.gray300,
    marginHorizontal: theme.spacing.xs,
  },
  femaleOnlyText: {
    ...theme.typography.captionL,
    color: '#FF1493',
    fontWeight: '600',
  },

  // Footer
  rideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  priceContainer: {
    flex: 1,
  },
  priceAmount: {
    ...theme.typography.headingL,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  priceLabel: {
    ...theme.typography.captionM,
    color: theme.colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  callButton: {
    width: 44,
    height: 44,
    backgroundColor: theme.colors.gray100,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callIcon: {
    fontSize: theme.iconSize.md,
  },
  requestButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.full,
    justifyContent: 'center',
  },
  requestButtonDisabled: {
    backgroundColor: theme.colors.gray300,
  },
  requestButtonText: {
    ...theme.typography.button,
    color: theme.colors.white,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    right: theme.spacing.base,
    left: theme.spacing.base,
    backgroundColor: theme.colors.primary,
    height: theme.buttonHeight.lg,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.xl,
  },
  fabIcon: {
    fontSize: 32,
    color: theme.colors.white,
    fontWeight: '300',
  },
});
