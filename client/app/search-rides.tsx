import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { ScreenContainer, Card, Button, EmptyState } from '@/components/ui/primitives';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LocationPicker } from '@/components/ui/LocationPicker';
import { DateTimePicker } from '@/components/ui/DateTimePicker';
import { rideService } from '@/services/mock/rideService';
import { Ride } from '@/types/ride';
import { RideCard } from '@/components/RideCard';

export default function SearchRidesScreen() {
  const router = useRouter();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Pickers
  const [showPickupPicker, setShowPickupPicker] = useState(false);
  const [showDropoffPicker, setShowDropoffPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const response = await rideService.getAvailableRides({
        from,
        to,
        date: date ? date.toISOString() : undefined,
      });
      setRides(response.data || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-search when filters change
  useEffect(() => {
    if (from || to || date) {
      const timer = setTimeout(handleSearch, 500);
      return () => clearTimeout(timer);
    }
  }, [from, to, date]);

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="arrow.left" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Find a Ride</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchInputs}>
        {/* From */}
        <TouchableOpacity
          style={styles.inputButton}
          onPress={() => setShowPickupPicker(true)}
        >
          <IconSymbol name="mappin.circle.fill" size={20} color={theme.colors.primary} />
          <Text style={[styles.inputText, !from && styles.placeholderText]}>
            {from || 'Leaving from...'}
          </Text>
        </TouchableOpacity>

        {/* To */}
        <TouchableOpacity
          style={styles.inputButton}
          onPress={() => setShowDropoffPicker(true)}
        >
          <IconSymbol name="mappin.circle.fill" size={20} color={theme.colors.textPrimary} />
          <Text style={[styles.inputText, !to && styles.placeholderText]}>
            {to || 'Going to...'}
          </Text>
        </TouchableOpacity>

        {/* Date */}
        <TouchableOpacity
          style={styles.inputButton}
          onPress={() => setShowDatePicker(true)}
        >
          <IconSymbol name="calendar" size={20} color={theme.colors.textSecondary} />
          <Text style={[styles.inputText, !date && styles.placeholderText]}>
            {date ? date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Any date'}
          </Text>
          {date && (
            <TouchableOpacity onPress={() => setDate(null)} style={styles.clearDate}>
              <IconSymbol name="xmark.circle.fill" size={16} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScreenContainer edges={['top']} backgroundColor={theme.colors.backgroundSecondary}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <FlatList
        data={rides}
        renderItem={({ item }) => (
          <RideCard
            ride={item}
            onPress={() => router.push(`/ride-details/${item.id}` as any)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          !loading && searched ? (
            <EmptyState
              icon={<Text style={{ fontSize: 40 }}>🔍</Text>}
              title="No rides found"
              subtitle="Try changing your search filters"
            />
          ) : !loading && !searched ? (
            <View style={styles.initialState}>
              <Text style={styles.initialText}>Enter a location to start searching</Text>
            </View>
          ) : null
        }
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}

      {/* Modals */}
      <LocationPicker
        visible={showPickupPicker}
        onClose={() => setShowPickupPicker(false)}
        onSelect={(loc) => setFrom(loc)}
        placeholder="Search pickup location"
      />
      <LocationPicker
        visible={showDropoffPicker}
        onClose={() => setShowDropoffPicker(false)}
        onSelect={(loc) => setTo(loc)}
        placeholder="Search dropoff location"
      />
      <DateTimePicker
        visible={showDatePicker}
        mode="date"
        value={date || new Date()}
        onClose={() => setShowDatePicker(false)}
        onSelect={(d) => setDate(d)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: theme.colors.white,
    paddingBottom: theme.spacing.md,
    borderBottomLeftRadius: theme.radius.xl,
    borderBottomRightRadius: theme.radius.xl,
    ...theme.shadows.sm,
    marginBottom: theme.spacing.md,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingTop: Platform.OS === 'ios' ? 10 : theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  title: {
    ...theme.typography.headingS,
    color: theme.colors.textPrimary,
  },
  searchInputs: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  inputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray100,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    gap: theme.spacing.md,
  },
  inputText: {
    flex: 1,
    ...theme.typography.bodyM,
    color: theme.colors.textPrimary,
  },
  placeholderText: {
    color: theme.colors.textTertiary,
  },
  clearDate: {
    padding: 4,
  },
  listContent: {
    paddingBottom: 100,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 250,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  initialState: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  initialText: {
    ...theme.typography.bodyM,
    color: theme.colors.textSecondary,
  },
});
