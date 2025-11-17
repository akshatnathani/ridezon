import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

type RideStatus = 'active' | 'completed' | 'cancelled';
type RideRole = 'creator' | 'passenger';

interface MyRide {
  id: string;
  from: string;
  to: string;
  date: string;
  time: string;
  status: RideStatus;
  role: RideRole;
  driverName: string;
  passengerCount: number;
  totalSeats: number;
  unreadMessages: number;
  lastMessage?: string;
  totalExpense: number;
  yourShare: number;
}

export default function MyRidesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [rides, setRides] = useState<MyRide[]>([]);

  useEffect(() => {
    fetchMyRides();
  }, []);

  const fetchMyRides = async () => {
    // TODO: Fetch from Supabase
    const mockRides: MyRide[] = [
      {
        id: '1',
        from: 'University Campus',
        to: 'Downtown Mall',
        date: 'Nov 20, 2025',
        time: '3:00 PM',
        status: 'active',
        role: 'creator',
        driverName: 'You',
        passengerCount: 3,
        totalSeats: 4,
        unreadMessages: 5,
        lastMessage: 'Sarah: Can we leave 5 mins early?',
        totalExpense: 120,
        yourShare: 30,
      },
      {
        id: '2',
        from: 'Downtown',
        to: 'Airport',
        date: 'Nov 18, 2025',
        time: '6:00 AM',
        status: 'active',
        role: 'passenger',
        driverName: 'John Smith',
        passengerCount: 4,
        totalSeats: 4,
        unreadMessages: 2,
        lastMessage: 'John: Meeting at parking lot B',
        totalExpense: 85,
        yourShare: 21.25,
      },
      {
        id: '3',
        from: 'Campus Dorms',
        to: 'City Center',
        date: 'Nov 15, 2025',
        time: '2:00 PM',
        status: 'completed',
        role: 'passenger',
        driverName: 'Sarah Johnson',
        passengerCount: 3,
        totalSeats: 4,
        unreadMessages: 0,
        totalExpense: 45,
        yourShare: 15,
      },
    ];

    setRides(mockRides);
    setLoading(false);
  };

  const handleOpenRide = (rideId: string) => {
    router.push(`/ride-details?id=${rideId}` as any);
  };

  const getFilteredRides = () => {
    if (filter === 'all') return rides;
    if (filter === 'active') return rides.filter(r => r.status === 'active');
    return rides.filter(r => r.status === 'completed');
  };

  const getStatusColor = (status: RideStatus) => {
    switch (status) {
      case 'active': return '#34c759';
      case 'completed': return '#8e8e93';
      case 'cancelled': return '#ff3b30';
    }
  };

  const getStatusText = (status: RideStatus) => {
    switch (status) {
      case 'active': return 'Active';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={styles.loadingText}>Loading your rides...</Text>
      </View>
    );
  }

  const filteredRides = getFilteredRides();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Rides</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All ({rides.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'active' && styles.filterTabActive]}
          onPress={() => setFilter('active')}
        >
          <Text style={[styles.filterText, filter === 'active' && styles.filterTextActive]}>
            Active ({rides.filter(r => r.status === 'active').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'completed' && styles.filterTabActive]}
          onPress={() => setFilter('completed')}
        >
          <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>
            Past ({rides.filter(r => r.status === 'completed').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Rides List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredRides.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No rides found</Text>
            <Text style={styles.emptyStateSubtext}>
              {filter === 'active' 
                ? 'You have no active rides at the moment'
                : 'Your ride history will appear here'}
            </Text>
          </View>
        ) : (
          filteredRides.map((ride) => (
            <TouchableOpacity
              key={ride.id}
              style={styles.rideCard}
              onPress={() => handleOpenRide(ride.id)}
              activeOpacity={0.7}
            >
              {/* Status & Role Badge */}
              <View style={styles.cardHeader}>
                <View style={styles.badges}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ride.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(ride.status)}</Text>
                  </View>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>
                      {ride.role === 'creator' ? '🚗 Driver' : '👤 Passenger'}
                    </Text>
                  </View>
                </View>
                {ride.unreadMessages > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{ride.unreadMessages}</Text>
                  </View>
                )}
              </View>

              {/* Route Info */}
              <View style={styles.routeSection}>
                <View style={styles.routeHeader}>
                  <View style={styles.routeColumn}>
                    <Text style={styles.timeText}>{ride.time}</Text>
                    <Text style={styles.dateTextSmall}>{ride.date}</Text>
                  </View>
                  <View style={styles.routeVisualization}>
                    <View style={styles.locationRow}>
                      <View style={styles.dotFrom} />
                      <Text style={styles.locationText} numberOfLines={1}>{ride.from}</Text>
                    </View>
                    <View style={styles.routeLine} />
                    <View style={styles.locationRow}>
                      <View style={styles.dotTo} />
                      <Text style={styles.locationText} numberOfLines={1}>{ride.to}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Participants Info */}
              <View style={styles.participantsSection}>
                <View style={styles.participantItem}>
                  <Text style={styles.participantIcon}>👥</Text>
                  <Text style={styles.participantText}>
                    {ride.passengerCount}/{ride.totalSeats} passengers
                  </Text>
                </View>
                {ride.role === 'passenger' && (
                  <View style={styles.participantItem}>
                    <Text style={styles.participantIcon}>🚗</Text>
                    <Text style={styles.participantText}>{ride.driverName}</Text>
                  </View>
                )}
              </View>

              {/* Last Message Preview */}
              {ride.lastMessage && (
                <View style={styles.messagePreview}>
                  <Text style={styles.messageIcon}>💬</Text>
                  <Text style={styles.messageText} numberOfLines={1}>{ride.lastMessage}</Text>
                </View>
              )}

              {/* Expense Info */}
              <View style={styles.expenseSection}>
                <View style={styles.expenseItem}>
                  <Text style={styles.expenseLabel}>Total Expenses</Text>
                  <Text style={styles.expenseAmount}>${ride.totalExpense.toFixed(2)}</Text>
                </View>
                <View style={styles.expenseDivider} />
                <View style={styles.expenseItem}>
                  <Text style={styles.expenseLabel}>Your Share</Text>
                  <Text style={[styles.expenseAmount, styles.yourShareAmount]}>
                    ${ride.yourShare.toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Action Hint */}
              <View style={styles.actionHint}>
                <Text style={styles.actionHintText}>Tap to open group →</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8e8e93',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  backText: {
    fontSize: 32,
    fontWeight: '300',
    color: '#000000',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.4,
  },
  placeholder: {
    width: 40,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f7f7f7',
  },
  filterTabActive: {
    backgroundColor: '#000000',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8e8e93',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 15,
    color: '#8e8e93',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  rideCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f7f7f7',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000000',
  },
  unreadBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff3b30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  routeSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  routeHeader: {
    flexDirection: 'row',
  },
  routeColumn: {
    width: 70,
    marginRight: 16,
  },
  timeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 2,
  },
  dateTextSmall: {
    fontSize: 12,
    color: '#8e8e93',
  },
  routeVisualization: {
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotFrom: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000000',
    marginRight: 10,
  },
  dotTo: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000000',
    marginRight: 10,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#d1d1d6',
    marginLeft: 3,
    marginVertical: 3,
  },
  locationText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  participantsSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 16,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  participantIcon: {
    fontSize: 14,
  },
  participantText: {
    fontSize: 14,
    color: '#8e8e93',
  },
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f9f9f9',
    gap: 8,
  },
  messageIcon: {
    fontSize: 14,
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    color: '#000000',
  },
  expenseSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
  },
  expenseItem: {
    flex: 1,
    alignItems: 'center',
  },
  expenseDivider: {
    width: 1,
    backgroundColor: '#e5e5e5',
    marginHorizontal: 12,
  },
  expenseLabel: {
    fontSize: 12,
    color: '#8e8e93',
    marginBottom: 4,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  yourShareAmount: {
    color: '#34c759',
  },
  actionHint: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionHintText: {
    fontSize: 13,
    color: '#8e8e93',
    fontWeight: '500',
  },
});
