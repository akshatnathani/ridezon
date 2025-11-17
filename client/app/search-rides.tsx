import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  StatusBar,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { Button, Tag, BottomActionBar } from '@/components/ui/primitives';

const POPULAR_LOCATIONS = [
  'University Campus',
  'Downtown Mall',
  'Airport',
  'Train Station',
  'Tech Park',
  'City Center',
];

const DATE_OPTIONS = [
  { label: 'Any day', value: '' },
  { label: 'Today', value: 'today' },
  { label: 'Tomorrow', value: 'tomorrow' },
  { label: 'This Week', value: 'week' },
];

export default function SearchRidesScreen() {
  const router = useRouter();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const handleLocationSelect = (location: string) => {
    if (!from) {
      setFrom(location);
    } else if (!to) {
      setTo(location);
    }
  };

  const handleSearch = () => {
    if (!from || !to) {
      Alert.alert('Missing Information', 'Please enter both pickup and destination locations');
      return;
    }

    Alert.alert(
      'Searching',
      `Finding rides from ${from} to ${to}${selectedDate ? ` (${selectedDate})` : ''}`,
      [
        {
          text: 'OK',
          onPress: () => {
            setTimeout(() => {
              router.back();
            }, 500);
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search rides</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Location Inputs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Route</Text>
          
          <View style={styles.inputCard}>
            <View style={styles.inputRow}>
              <View style={styles.inputIcon}>
                <View style={styles.dotFrom} />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Pickup location</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Where are you leaving from?"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={from}
                  onChangeText={setFrom}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.inputDivider} />

            <View style={styles.inputRow}>
              <View style={styles.inputIcon}>
                <View style={styles.dotTo} />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Destination</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Where are you going?"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={to}
                  onChangeText={setTo}
                  autoCapitalize="words"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Date Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>When</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContainer}
          >
            {DATE_OPTIONS.map((option) => (
              <Tag
                key={option.value}
                text={option.label}
                selected={selectedDate === option.value}
                onPress={() => setSelectedDate(option.value)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Popular Locations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular locations</Text>
          <Text style={styles.sectionSubtitle}>
            Tap to quickly fill in locations
          </Text>
          <View style={styles.popularGrid}>
            {POPULAR_LOCATIONS.map((location) => (
              <TouchableOpacity
                key={location}
                style={styles.popularChip}
                onPress={() => handleLocationSelect(location)}
                activeOpacity={0.7}
              >
                <Text style={styles.popularChipIcon}>📍</Text>
                <Text style={styles.popularChipText}>{location}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsIcon}>💡</Text>
          <View style={styles.tipsContent}>
            <Text style={styles.tipsTitle}>Search tip</Text>
            <Text style={styles.tipsText}>
              Try searching for nearby landmarks or popular locations for more results
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <BottomActionBar>
        <Button
          title="Search rides"
          onPress={handleSearch}
          variant="primary"
          size="lg"
          fullWidth
        />
      </BottomActionBar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xs,
    paddingTop: Platform.OS === 'ios' ? theme.spacing.xxxxl + 8 : theme.spacing.base,
    paddingBottom: theme.spacing.base,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 28,
    color: theme.colors.textPrimary,
  },
  headerTitle: {
    ...theme.typography.headingM,
    color: theme.colors.textPrimary,
  },
  headerSpacer: {
    width: 44,
  },

  // Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.base,
    paddingBottom: 120,
  },

  // Sections
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.headingS,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  sectionSubtitle: {
    ...theme.typography.bodyS,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },

  // Input Card
  inputCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    ...theme.shadows.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.base,
  },
  inputIcon: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  dotFrom: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
  },
  dotTo: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.gray900,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    ...theme.typography.captionL,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  input: {
    ...theme.typography.bodyM,
    color: theme.colors.textPrimary,
    padding: 0,
  },
  inputDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginLeft: 64,
  },

  // Chips
  chipsContainer: {
    gap: theme.spacing.sm,
  },

  // Popular Locations
  popularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  popularChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  popularChipIcon: {
    fontSize: theme.iconSize.sm,
    marginRight: theme.spacing.sm,
  },
  popularChipText: {
    ...theme.typography.bodyS,
    color: theme.colors.textPrimary,
  },

  // Tips
  tipsCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primaryLight,
    padding: theme.spacing.base,
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.base,
  },
  tipsIcon: {
    fontSize: theme.iconSize.lg,
    marginRight: theme.spacing.md,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    ...theme.typography.bodyM,
    color: theme.colors.textPrimary,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  tipsText: {
    ...theme.typography.bodyS,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
});
