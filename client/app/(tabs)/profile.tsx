import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';

interface Ride {
  id: string;
  driverName: string;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  seats: number;
  price: number;
  description?: string;
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [myRides, setMyRides] = useState<Ride[]>([
    {
      id: '1',
      driverName: 'You',
      pickup: 'Downtown',
      dropoff: 'Airport',
      date: '2024-01-20',
      time: '10:00 AM',
      seats: 3,
      price: 25,
      description: 'Comfortable ride with AC',
    },
    {
      id: '2',
      driverName: 'You',
      pickup: 'University',
      dropoff: 'Mall',
      date: '2024-01-20',
      time: '2:30 PM',
      seats: 2,
      price: 15,
    },
  ]);

  const handleDeleteRide = (rideId: string) => {
    Alert.alert(
      'Delete Ride',
      'Are you sure you want to delete this ride?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setMyRides(myRides.filter(ride => ride.id !== rideId));
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
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>
              {user?.user_metadata?.full_name?.substring(0, 2).toUpperCase() || 
               user?.email?.substring(0, 2).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.profileName}>
            {user?.user_metadata?.full_name || 'User'}
          </Text>
          <Text style={styles.profileEmail}>{user?.email || 'No email'}</Text>
          
          {user?.user_metadata?.phone_number && (
            <Text style={styles.profilePhone}>{user.user_metadata.phone_number}</Text>
          )}
          
          {user?.user_metadata?.age && user?.user_metadata?.gender && (
            <Text style={styles.profileInfo}>
              {user.user_metadata.age} • {user.user_metadata.gender}
              {user.user_metadata.year_of_study && ` • ${user.user_metadata.year_of_study}`}
            </Text>
          )}
          
          <TouchableOpacity 
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{myRides.length}</Text>
            <Text style={styles.statLabel}>Rides Offered</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>4.8</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Trips</Text>
          </View>
        </View>

        {/* My Rides Section */}
        <View style={styles.myRidesSection}>
          <Text style={styles.sectionTitle}>My Rides</Text>
          
          {myRides.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No rides yet</Text>
              <Text style={styles.emptyStateSubtext}>Start offering rides to help others</Text>
            </View>
          ) : (
            myRides.map((ride) => (
              <View key={ride.id} style={styles.rideCard}>
                <View style={styles.rideTopSection}>
                  <View style={styles.rideMainInfo}>
                    <Text style={styles.rideTime}>{ride.time}</Text>
                    <Text style={styles.rideDate}>{ride.date}</Text>
                    <View style={styles.routeInfo}>
                      <View style={styles.routePoint}>
                        <View style={styles.pickupDot} />
                        <Text style={styles.locationText} numberOfLines={1}>{ride.pickup}</Text>
                      </View>
                      <View style={styles.routeDivider} />
                      <View style={styles.routePoint}>
                        <View style={styles.dropoffDot} />
                        <Text style={styles.locationText} numberOfLines={1}>{ride.dropoff}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.priceSection}>
                    <Text style={styles.priceText}>${ride.price}</Text>
                    <Text style={styles.seatsText}>{ride.seats} seats</Text>
                  </View>
                </View>

                {ride.description && (
                  <Text style={styles.rideDescription}>{ride.description}</Text>
                )}

                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteRide(ride.id)}
                >
                  <Text style={styles.deleteButtonText}>Delete Ride</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarLargeText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  profileEmail: {
    fontSize: 16,
    color: '#8e8e93',
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 16,
    color: '#8e8e93',
  },
  profileInfo: {
    fontSize: 15,
    color: '#8e8e93',
    marginTop: 4,
  },
  signOutButton: {
    marginTop: 16,
    backgroundColor: '#000000',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  signOutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsSection: {
    flexDirection: 'row',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#8e8e93',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#f0f0f0',
  },
  myRidesSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#8e8e93',
    textAlign: 'center',
  },
  rideCard: {
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  rideTopSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  rideMainInfo: {
    flex: 1,
    marginRight: 16,
  },
  rideTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  rideDate: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 12,
  },
  routeInfo: {
    gap: 6,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pickupDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000000',
  },
  dropoffDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000000',
  },
  routeDivider: {
    width: 2,
    height: 10,
    backgroundColor: '#d1d1d6',
    marginLeft: 3,
  },
  locationText: {
    fontSize: 14,
    color: '#000000',
    flex: 1,
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  seatsText: {
    fontSize: 13,
    color: '#8e8e93',
  },
  rideDescription: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 12,
    lineHeight: 20,
  },
  deleteButton: {
    backgroundColor: '#000000',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
