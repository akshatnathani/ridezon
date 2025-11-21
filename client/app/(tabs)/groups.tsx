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
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { Card, Badge, EmptyState, SectionHeader } from '@/components/ui/primitives';

interface JoinRequest {
  id: string;
  user: {
    name: string;
    gender: string;
    rating: number;
  };
  ride: {
    id: string;
    from: string;
    to: string;
    date: string;
    time: string;
  };
  requestedAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface MyRide {
  id: string;
  from: string;
  to: string;
  date: string;
  time: string;
  status: 'active' | 'completed' | 'cancelled';
  role: 'driver' | 'passenger';
  participants: number;
  unreadMessages: number;
  lastMessage?: string;
  totalExpenses: number;
  yourShare: number;
}

export default function GroupsScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<'rides' | 'requests'>('rides');

  // Mock data
  const [myRides] = useState<MyRide[]>([
    {
      id: '1',
      from: 'University Campus',
      to: 'Downtown Mall',
      date: '2025-11-18',
      time: '3:00 PM',
      status: 'active',
      role: 'driver',
      participants: 3,
      unreadMessages: 2,
      lastMessage: 'See you at 3!',
      totalExpenses: 450,
      yourShare: 150,
    },
    {
      id: '2',
      from: 'Airport',
      to: 'City Center',
      date: '2025-11-15',
      time: '10:00 AM',
      status: 'completed',
      role: 'passenger',
      participants: 4,
      unreadMessages: 0,
      totalExpenses: 800,
      yourShare: 200,
    },
  ]);

  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([
    {
      id: '1',
      user: {
        name: 'Emily Davis',
        gender: 'Female',
        rating: 4.8,
      },
      ride: {
        id: '1',
        from: 'University Campus',
        to: 'Downtown Mall',
        date: '2025-11-18',
        time: '3:00 PM',
      },
      requestedAt: '2 hours ago',
      status: 'pending',
    },
    {
      id: '2',
      user: {
        name: 'John Smith',
        gender: 'Male',
        rating: 4.5,
      },
      ride: {
        id: '1',
        from: 'University Campus',
        to: 'Downtown Mall',
        date: '2025-11-18',
        time: '3:00 PM',
      },
      requestedAt: '5 hours ago',
      status: 'pending',
    },
  ]);

  const handleAcceptRequest = (requestId: string) => {
    Alert.alert(
      'Accept Request',
      'Are you sure you want to accept this request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: () => {
            setJoinRequests((prev) =>
              prev.map((req) =>
                req.id === requestId ? { ...req, status: 'accepted' } : req
              )
            );
            Alert.alert('Success', 'Request accepted! The user has been notified.');
          },
        },
      ]
    );
  };

  const handleRejectRequest = (requestId: string) => {
    Alert.alert(
      'Reject Request',
      'Are you sure you want to reject this request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            setJoinRequests((prev) =>
              prev.map((req) =>
                req.id === requestId ? { ...req, status: 'rejected' } : req
              )
            );
            Alert.alert('Request rejected');
          },
        },
      ]
    );
  };

  const handleOpenRide = (rideId: string) => {
    router.push(`/ride-details/${rideId}?tab=chat` as any);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge text="Active" variant="success" />;
      case 'completed':
        return <Badge text="Completed" variant="neutral" />;
      case 'cancelled':
        return <Badge text="Cancelled" variant="error" />;
      default:
        return null;
    }
  };

  const pendingRequests = joinRequests.filter((req) => req.status === 'pending');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Groups</Text>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'rides' && styles.tabActive]}
          onPress={() => setSelectedTab('rides')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, selectedTab === 'rides' && styles.tabTextActive]}>
            My Rides
          </Text>
          {myRides.length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{myRides.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'requests' && styles.tabActive]}
          onPress={() => setSelectedTab('requests')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, selectedTab === 'requests' && styles.tabTextActive]}>
            Join Requests
          </Text>
          {pendingRequests.length > 0 && (
            <View style={[styles.tabBadge, styles.tabBadgeAlert]}>
              <Text style={styles.tabBadgeText}>{pendingRequests.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {selectedTab === 'rides' ? (
          <>
            {/* My Rides Section */}
            {myRides.length === 0 ? (
              <EmptyState
                icon={<Text style={styles.emptyIcon}>🚗</Text>}
                title="No rides yet"
                subtitle="Join or create a ride to see it here"
              />
            ) : (
              myRides.map((ride) => (
                <Card
                  key={ride.id}
                  style={styles.rideCard}
                  shadow="md"
                  onPress={() => handleOpenRide(ride.id)}
                >
                  {/* Header with Status and Role */}
                  <View style={styles.rideCardHeader}>
                    <View style={styles.statusRow}>
                      {getStatusBadge(ride.status)}
                      <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>
                          {ride.role === 'driver' ? '🚗 Driver' : '👤 Passenger'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Route Info */}
                  <View style={styles.routeInfo}>
                    <Text style={styles.timeDate}>
                      {ride.time} • {ride.date}
                    </Text>
                    <View style={styles.routeRow}>
                      <View style={styles.routeDots}>
                        <View style={styles.dotGreen} />
                        <View style={styles.routeLineSmall} />
                        <View style={styles.dotBlack} />
                      </View>
                      <View style={styles.routeTexts}>
                        <Text style={styles.routeLocation} numberOfLines={1}>
                          {ride.from}
                        </Text>
                        <Text style={styles.routeLocation} numberOfLines={1}>
                          {ride.to}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Participants */}
                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>👥 {ride.participants} participants</Text>
                    {ride.unreadMessages > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>
                          {ride.unreadMessages} new message{ride.unreadMessages > 1 ? 's' : ''}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Last Message */}
                  {ride.lastMessage && (
                    <Text style={styles.lastMessage} numberOfLines={1}>
                      💬 {ride.lastMessage}
                    </Text>
                  )}

                  {/* Expenses Summary */}
                  <View style={styles.expensesRow}>
                    <View style={styles.expenseItem}>
                      <Text style={styles.expenseLabel}>Total Expenses</Text>
                      <Text style={styles.expenseAmount}>₹{ride.totalExpenses}</Text>
                    </View>
                    <View style={styles.expenseDivider} />
                    <View style={styles.expenseItem}>
                      <Text style={styles.expenseLabel}>Your Share</Text>
                      <Text style={styles.expenseAmountHighlight}>₹{ride.yourShare}</Text>
                    </View>
                  </View>

                  {/* Tap Hint */}
                  <Text style={styles.tapHint}>Tap to open group →</Text>
                </Card>
              ))
            )}
          </>
        ) : (
          <>
            {/* Join Requests Section */}
            {pendingRequests.length === 0 ? (
              <EmptyState
                icon={<Text style={styles.emptyIcon}>📬</Text>}
                title="No pending requests"
                subtitle="Join requests for your rides will appear here"
              />
            ) : (
              pendingRequests.map((request) => (
                <Card key={request.id} style={styles.requestCard} shadow="md">
                  {/* User Info */}
                  <View style={styles.requestHeader}>
                    <View style={styles.userAvatar}>
                      <Text style={styles.userAvatarText}>
                        {request.user.name.substring(0, 1)}
                      </Text>
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{request.user.name}</Text>
                      <View style={styles.userMeta}>
                        <Text style={styles.userMetaText}>{request.user.gender}</Text>
                        <Text style={styles.metaDot}>•</Text>
                        <Text style={styles.userMetaText}>⭐ {request.user.rating}</Text>
                      </View>
                    </View>
                    <Text style={styles.requestTime}>{request.requestedAt}</Text>
                  </View>

                  {/* Ride Info */}
                  <View style={styles.requestRideInfo}>
                    <Text style={styles.requestLabel}>Wants to join your ride</Text>
                    <View style={styles.requestRoute}>
                      <Text style={styles.requestRouteText}>
                        {request.ride.from} → {request.ride.to}
                      </Text>
                      <Text style={styles.requestDateTime}>
                        {request.ride.date} • {request.ride.time}
                      </Text>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.requestActions}>
                    <TouchableOpacity
                      style={styles.rejectButton}
                      onPress={() => handleRejectRequest(request.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.rejectButtonText}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.acceptButton}
                      onPress={() => handleAcceptRequest(request.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.acceptButtonText}>Accept</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },

  // Header
  header: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.base,
    paddingTop: Platform.OS === 'ios' ? theme.spacing.xxxxl : theme.spacing.lg,
    paddingBottom: theme.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    ...theme.typography.headingXL,
    color: theme.colors.textPrimary,
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.base,
    paddingTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: theme.spacing.xs,
  },
  tabActive: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    ...theme.typography.bodyM,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: theme.colors.primary,
  },
  tabBadge: {
    backgroundColor: theme.colors.gray200,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeAlert: {
    backgroundColor: theme.colors.error,
  },
  tabBadgeText: {
    ...theme.typography.captionS,
    color: theme.colors.white,
    fontWeight: '600',
  },

  // Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.base,
    paddingBottom: 100,
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
  rideCardHeader: {
    marginBottom: theme.spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  roleBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.gray100,
    borderRadius: theme.radius.full,
  },
  roleText: {
    ...theme.typography.captionL,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },

  // Route
  routeInfo: {
    marginBottom: theme.spacing.md,
  },
  timeDate: {
    ...theme.typography.captionL,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  routeRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  routeDots: {
    width: 16,
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  dotGreen: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  routeLineSmall: {
    width: 2,
    flex: 1,
    backgroundColor: theme.colors.gray200,
    marginVertical: theme.spacing.xs,
  },
  dotBlack: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.gray900,
  },
  routeTexts: {
    flex: 1,
    justifyContent: 'space-between',
  },
  routeLocation: {
    ...theme.typography.bodyM,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },

  // Meta
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  metaText: {
    ...theme.typography.bodyS,
    color: theme.colors.textSecondary,
  },
  unreadBadge: {
    backgroundColor: theme.colors.error,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
  },
  unreadText: {
    ...theme.typography.captionS,
    color: theme.colors.white,
    fontWeight: '600',
  },

  // Last Message
  lastMessage: {
    ...theme.typography.bodyS,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },

  // Expenses
  expensesRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.gray50,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  expenseItem: {
    flex: 1,
    alignItems: 'center',
  },
  expenseDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.md,
  },
  expenseLabel: {
    ...theme.typography.captionM,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  expenseAmount: {
    ...theme.typography.bodyM,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  expenseAmountHighlight: {
    ...theme.typography.bodyM,
    color: theme.colors.primary,
    fontWeight: '600',
  },

  // Tap Hint
  tapHint: {
    ...theme.typography.captionL,
    color: theme.colors.textTertiary,
    textAlign: 'center',
  },

  // Request Card
  requestCard: {
    marginBottom: theme.spacing.base,
    padding: theme.spacing.base,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  userAvatarText: {
    ...theme.typography.headingM,
    color: theme.colors.white,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...theme.typography.bodyL,
    color: theme.colors.textPrimary,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userMetaText: {
    ...theme.typography.captionL,
    color: theme.colors.textSecondary,
  },
  metaDot: {
    ...theme.typography.captionL,
    color: theme.colors.gray300,
    marginHorizontal: theme.spacing.xs,
  },
  requestTime: {
    ...theme.typography.captionM,
    color: theme.colors.textTertiary,
  },

  // Request Ride Info
  requestRideInfo: {
    backgroundColor: theme.colors.gray50,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  requestLabel: {
    ...theme.typography.captionL,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  requestRoute: {
    gap: theme.spacing.xs,
  },
  requestRouteText: {
    ...theme.typography.bodyM,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  requestDateTime: {
    ...theme.typography.captionL,
    color: theme.colors.textSecondary,
  },

  // Action Buttons
  requestActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: theme.colors.gray100,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  rejectButtonText: {
    ...theme.typography.bodyM,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  acceptButtonText: {
    ...theme.typography.bodyM,
    color: theme.colors.white,
    fontWeight: '600',
  },
});
