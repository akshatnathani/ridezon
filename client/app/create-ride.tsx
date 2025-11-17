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

export default function CreateRideScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    departureDate: '',
    departureTime: '',
    arrivalDate: '',
    arrivalTime: '',
    seats: '',
    price: '',
    description: '',
    femaleOnly: false,
  });

  const [itinerary, setItinerary] = useState<string[]>(['']);

  const handleAddItineraryStop = () => {
    setItinerary([...itinerary, '']);
  };

  const handleRemoveItineraryStop = (index: number) => {
    const updated = itinerary.filter((_, i) => i !== index);
    setItinerary(updated);
  };

  const handleItineraryChange = (index: number, value: string) => {
    const updated = [...itinerary];
    updated[index] = value;
    setItinerary(updated);
  };

  const handleCreateRide = () => {
    // Validation
    if (!formData.from || !formData.to) {
      Alert.alert('Missing Information', 'Please fill in pickup and dropoff locations');
      return;
    }

    if (!formData.departureDate || !formData.departureTime) {
      Alert.alert('Missing Information', 'Please fill in departure date and time');
      return;
    }

    if (!formData.arrivalDate || !formData.arrivalTime) {
      Alert.alert('Missing Information', 'Please fill in arrival date and time');
      return;
    }

    if (!formData.seats || !formData.price) {
      Alert.alert('Missing Information', 'Please fill in seats and price');
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

    // Filter out empty itinerary items
    const validItinerary = itinerary.filter(stop => stop.trim() !== '');

    // TODO: Save ride to Supabase
    const rideData = {
      ...formData,
      itinerary: validItinerary,
      createdBy: user?.id,
      createdAt: new Date().toISOString(),
    };

    console.log('Creating ride:', rideData);

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
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Ride</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Route Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚗 Route Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>From</Text>
            <TextInput
              style={styles.input}
              placeholder="Pickup location"
              placeholderTextColor="#8e8e93"
              value={formData.from}
              onChangeText={(text) => setFormData({ ...formData, from: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>To</Text>
            <TextInput
              style={styles.input}
              placeholder="Dropoff location"
              placeholderTextColor="#8e8e93"
              value={formData.to}
              onChangeText={(text) => setFormData({ ...formData, to: text })}
            />
          </View>
        </View>

        {/* Itinerary Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Route Itinerary (Optional)</Text>
          <Text style={styles.sectionDescription}>
            Add stops along the way to help passengers find your ride
          </Text>

          {itinerary.map((stop, index) => (
            <View key={index} style={styles.itineraryItem}>
              <TextInput
                style={styles.itineraryInput}
                placeholder={`Stop ${index + 1}`}
                placeholderTextColor="#8e8e93"
                value={stop}
                onChangeText={(text) => handleItineraryChange(index, text)}
              />
              {itinerary.length > 1 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveItineraryStop(index)}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          <TouchableOpacity
            style={styles.addStopButton}
            onPress={handleAddItineraryStop}
          >
            <Text style={styles.addStopButtonText}>+ Add Stop</Text>
          </TouchableOpacity>
        </View>

        {/* Schedule Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🕐 Departure</Text>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#8e8e93"
                value={formData.departureDate}
                onChangeText={(text) => setFormData({ ...formData, departureDate: text })}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Time</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:MM AM/PM"
                placeholderTextColor="#8e8e93"
                value={formData.departureTime}
                onChangeText={(text) => setFormData({ ...formData, departureTime: text })}
              />
            </View>
          </View>
        </View>

        {/* Arrival Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏁 Arrival</Text>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#8e8e93"
                value={formData.arrivalDate}
                onChangeText={(text) => setFormData({ ...formData, arrivalDate: text })}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Time</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:MM AM/PM"
                placeholderTextColor="#8e8e93"
                value={formData.arrivalTime}
                onChangeText={(text) => setFormData({ ...formData, arrivalTime: text })}
              />
            </View>
          </View>
        </View>

        {/* Capacity & Price Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💺 Capacity & Cost</Text>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Available Seats</Text>
              <TextInput
                style={styles.input}
                placeholder="1-8"
                placeholderTextColor="#8e8e93"
                keyboardType="number-pad"
                maxLength={1}
                value={formData.seats}
                onChangeText={(text) => setFormData({ ...formData, seats: text })}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Price per Seat ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor="#8e8e93"
                keyboardType="decimal-pad"
                value={formData.price}
                onChangeText={(text) => setFormData({ ...formData, price: text })}
              />
            </View>
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add any additional details about your ride..."
            placeholderTextColor="#8e8e93"
            multiline
            numberOfLines={4}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
          />
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Preferences</Text>

          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Text style={styles.switchText}>Female Only</Text>
              <Text style={styles.switchSubtext}>
                Only female passengers can request this ride
              </Text>
            </View>
            <Switch
              value={formData.femaleOnly}
              onValueChange={(value) => setFormData({ ...formData, femaleOnly: value })}
              trackColor={{ false: '#d1d1d6', true: '#000000' }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            ℹ️ Your name and phone number will be visible to passengers who request to join your ride.
          </Text>
        </View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomContainer}>
        <View style={styles.separator} />
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateRide}
        >
          <Text style={styles.createButtonText}>Create Ride</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
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
    fontSize: 28,
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
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8e8e93',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionDescription: {
    fontSize: 15,
    color: '#8e8e93',
    marginBottom: 16,
    lineHeight: 21,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 17,
    color: '#000000',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  itineraryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itineraryInput: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 17,
    color: '#000000',
  },
  removeButton: {
    width: 32,
    height: 32,
    backgroundColor: '#000000',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  removeButtonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '400',
  },
  addStopButton: {
    backgroundColor: '#f7f7f7',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  addStopButtonText: {
    fontSize: 17,
    fontWeight: '400',
    color: '#000000',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  switchLabel: {
    flex: 1,
    marginRight: 16,
  },
  switchText: {
    fontSize: 17,
    fontWeight: '400',
    color: '#000000',
    marginBottom: 4,
  },
  switchSubtext: {
    fontSize: 15,
    color: '#8e8e93',
    lineHeight: 20,
  },
  infoBox: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#8e8e93',
    lineHeight: 21,
  },
  bottomContainer: {
    backgroundColor: '#ffffff',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e5e5',
  },
  createButton: {
    backgroundColor: '#000000',
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: -0.4,
  },
});
