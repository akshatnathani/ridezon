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
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { theme } from '@/constants/theme';
import { ScreenContainer, Card, Button, SectionHeader, BottomActionBar } from '@/components/ui/primitives';
import { rideService } from '@/services/mock/rideService';
import { LocationPicker } from '@/components/ui/LocationPicker';
import { DateTimePicker } from '@/components/ui/DateTimePicker';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function CreateRideScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    from: '',
    to: '',
    departureDate: new Date(),
    arrivalDate: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // Default 2 hours later
    seats: '3',
    price: '',
    description: '',
    femaleOnly: false,
  });

  // Picker States
  const [showPickupPicker, setShowPickupPicker] = useState(false);
  const [showDropoffPicker, setShowDropoffPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [dateMode, setDateMode] = useState<'departure' | 'arrival'>('departure');

  const handleCreateRide = async () => {
    // Validation
    if (!formData.from || !formData.to) {
      Alert.alert('Missing Information', 'Please fill in pickup and dropoff locations');
      return;
    }

    if (!formData.price) {
      Alert.alert('Missing Information', 'Please fill in the price');
      return;
    }

    const seatsNum = parseInt(formData.seats);
    if (isNaN(seatsNum) || seatsNum < 1 || seatsNum > 8) {
      Alert.alert('Invalid Seats', 'Please enter a valid number of seats (1-8)');
      return;
    }

    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum < 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price');
      return;
    }

    try {
      const rideData = {
        start_location_name: formData.from,
        destination_name: formData.to,
        scheduled_start_time: formData.departureDate.toISOString(),
        total_seats: seatsNum,
        price_per_seat: priceNum,
        description: formData.description,
        is_female_only: formData.femaleOnly,
      };

      const response = await rideService.createRide(rideData);

      if (response.error) {
        Alert.alert('Error', response.error);
        return;
      }

      Alert.alert(
        'Ride Created!',
        'Your ride has been posted successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Failed to create ride:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  const openDatePicker = (mode: 'departure' | 'arrival') => {
    setDateMode(mode);
    setShowDatePicker(true);
  };

  const openTimePicker = (mode: 'departure' | 'arrival') => {
    setDateMode(mode);
    setShowTimePicker(true);
  };

  const handleDateSelect = (date: Date) => {
    if (dateMode === 'departure') {
      // Preserve time
      const newDate = new Date(date);
      newDate.setHours(formData.departureDate.getHours());
      newDate.setMinutes(formData.departureDate.getMinutes());
      setFormData({ ...formData, departureDate: newDate });
    } else {
      const newDate = new Date(date);
      newDate.setHours(formData.arrivalDate.getHours());
      newDate.setMinutes(formData.arrivalDate.getMinutes());
      setFormData({ ...formData, arrivalDate: newDate });
    }
  };

  const handleTimeSelect = (date: Date) => {
    if (dateMode === 'departure') {
      setFormData({ ...formData, departureDate: date });
    } else {
      setFormData({ ...formData, arrivalDate: date });
    }
  };

  return (
    <ScreenContainer edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Ride</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Route Section */}
          <Card shadow="sm" style={styles.card}>
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <IconSymbol name="mappin.circle.fill" size={16} color={theme.colors.primary} />
                <Text style={styles.label}>Pickup</Text>
              </View>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowPickupPicker(true)}
              >
                <Text style={[styles.pickerText, !formData.from && styles.placeholderText]}>
                  {formData.from || 'Select pickup location'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.routeLine} />

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <IconSymbol name="mappin.circle.fill" size={16} color={theme.colors.textPrimary} />
                <Text style={styles.label}>Dropoff</Text>
              </View>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowDropoffPicker(true)}
              >
                <Text style={[styles.pickerText, !formData.to && styles.placeholderText]}>
                  {formData.to || 'Select dropoff location'}
                </Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Schedule Section */}
          <Card shadow="sm" style={styles.card}>
            <SectionHeader title="Schedule" />

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.subLabel}>Date</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => openDatePicker('departure')}
                >
                  <Text style={styles.pickerText}>
                    {formData.departureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                  <IconSymbol name="calendar" size={16} color={theme.colors.textTertiary} />
                </TouchableOpacity>
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.subLabel}>Time</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => openTimePicker('departure')}
                >
                  <Text style={styles.pickerText}>
                    {formData.departureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <IconSymbol name="clock" size={16} color={theme.colors.textTertiary} />
                </TouchableOpacity>
              </View>
            </View>
          </Card>

          {/* Capacity & Price Section */}
          <Card shadow="sm" style={styles.card}>
            <SectionHeader title="Details" />

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.subLabel}>Seats</Text>
                <TextInput
                  style={styles.input}
                  placeholder="3"
                  placeholderTextColor={theme.colors.textTertiary}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={formData.seats}
                  onChangeText={(text) => setFormData({ ...formData, seats: text })}
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.subLabel}>Price (₹)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor={theme.colors.textTertiary}
                  keyboardType="decimal-pad"
                  value={formData.price}
                  onChangeText={(text) => setFormData({ ...formData, price: text })}
                />
              </View>
            </View>

            <View style={styles.divider} />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add notes (optional)..."
              placeholderTextColor={theme.colors.textTertiary}
              multiline
              numberOfLines={3}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
            />
          </Card>

          {/* Preferences Section */}
          <Card shadow="sm" style={styles.card}>
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Text style={styles.switchText}>Female Only Ride</Text>
                <Text style={styles.switchSubtext}>
                  Visible only to female passengers
                </Text>
              </View>
              <Switch
                value={formData.femaleOnly}
                onValueChange={(value) => setFormData({ ...formData, femaleOnly: value })}
                trackColor={{ false: theme.colors.gray200, true: theme.colors.primary }}
                thumbColor="#ffffff"
                ios_backgroundColor={theme.colors.gray200}
              />
            </View>
          </Card>

          <View style={styles.spacer} />
        </ScrollView>

        {/* Fixed Bottom Button */}
        <BottomActionBar>
          <Button
            title="Publish Ride"
            variant="primary"
            onPress={handleCreateRide}
            fullWidth
            size="lg"
          />
        </BottomActionBar>
      </KeyboardAvoidingView>

      {/* Modals */}
      <LocationPicker
        visible={showPickupPicker}
        onClose={() => setShowPickupPicker(false)}
        onSelect={(loc) => setFormData({ ...formData, from: loc })}
        placeholder="Search pickup location"
      />
      <LocationPicker
        visible={showDropoffPicker}
        onClose={() => setShowDropoffPicker(false)}
        onSelect={(loc) => setFormData({ ...formData, to: loc })}
        placeholder="Search dropoff location"
      />

      <DateTimePicker
        visible={showDatePicker}
        mode="date"
        value={dateMode === 'departure' ? formData.departureDate : formData.arrivalDate}
        onClose={() => setShowDatePicker(false)}
        onSelect={handleDateSelect}
      />

      <DateTimePicker
        visible={showTimePicker}
        mode="time"
        value={dateMode === 'departure' ? formData.departureDate : formData.arrivalDate}
        onClose={() => setShowTimePicker(false)}
        onSelect={handleTimeSelect}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingTop: Platform.OS === 'ios' ? 60 : theme.spacing.md,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  backText: {
    ...theme.typography.headingL,
    color: theme.colors.textPrimary,
  },
  headerTitle: {
    ...theme.typography.headingS,
    color: theme.colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.gray50,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: 100,
  },
  card: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  inputGroup: {
    marginBottom: theme.spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  label: {
    ...theme.typography.bodyS,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subLabel: {
    ...theme.typography.captionM,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  pickerButton: {
    backgroundColor: theme.colors.gray100,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    ...theme.typography.bodyM,
    color: theme.colors.textPrimary,
  },
  placeholderText: {
    color: theme.colors.textTertiary,
  },
  input: {
    backgroundColor: theme.colors.gray100,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    ...theme.typography.bodyM,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: theme.colors.gray300,
    marginLeft: 7, // Align with icons
    marginVertical: 2,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: theme.spacing.sm,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  switchText: {
    ...theme.typography.bodyM,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  switchSubtext: {
    ...theme.typography.captionM,
    color: theme.colors.textSecondary,
  },
  spacer: {
    height: 40,
  },
});
