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
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';

interface Participant {
  id: string;
  name: string;
}

interface AddExpenseProps {
  visible: boolean;
  onClose: () => void;
  onSave: (expense: any) => void;
  participants: Participant[];
  currentUserId: string;
}

type SplitType = 'equal' | 'unequal' | 'percentage' | 'shares' | 'custom';
type Category = 'fuel' | 'toll' | 'parking' | 'food' | 'accommodation' | 'shopping' | 'entertainment' | 'other';

const CATEGORIES: { value: Category; label: string; icon: string }[] = [
  { value: 'fuel', label: 'Fuel', icon: '⛽' },
  { value: 'toll', label: 'Toll', icon: '🛣️' },
  { value: 'parking', label: 'Parking', icon: '🅿️' },
  { value: 'food', label: 'Food', icon: '🍔' },
  { value: 'accommodation', label: 'Stay', icon: '🏨' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'entertainment', label: 'Fun', icon: '🎉' },
  { value: 'other', label: 'Other', icon: '💰' },
];

export default function AddExpenseModal({ visible, onClose, onSave, participants, currentUserId }: AddExpenseProps) {
  const [step, setStep] = useState<'details' | 'split'>('details');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('other');
  const [paidBy, setPaidBy] = useState(currentUserId);
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    participants.map(p => p.id)
  );
  const [customSplits, setCustomSplits] = useState<{ [key: string]: string }>({});

  const handleClose = () => {
    // Reset form
    setStep('details');
    setDescription('');
    setAmount('');
    setCategory('other');
    setPaidBy(currentUserId);
    setSplitType('equal');
    setSelectedParticipants(participants.map(p => p.id));
    setCustomSplits({});
    onClose();
  };

  const toggleParticipant = (participantId: string) => {
    if (selectedParticipants.includes(participantId)) {
      if (selectedParticipants.length === 1) {
        Alert.alert('Error', 'At least one person must be included');
        return;
      }
      setSelectedParticipants(selectedParticipants.filter(id => id !== participantId));
    } else {
      setSelectedParticipants([...selectedParticipants, participantId]);
    }
  };

  const handleNext = () => {
    if (!description.trim()) {
      Alert.alert('Missing Field', 'Please enter a description');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }
    setStep('split');
  };

  const calculateSplits = () => {
    const totalAmount = parseFloat(amount);
    const splits: { [key: string]: number } = {};

    switch (splitType) {
      case 'equal':
        const equalShare = totalAmount / selectedParticipants.length;
        selectedParticipants.forEach(id => {
          splits[id] = equalShare;
        });
        break;

      case 'unequal':
      case 'custom':
        let totalCustom = 0;
        selectedParticipants.forEach(id => {
          const customAmount = parseFloat(customSplits[id] || '0');
          splits[id] = customAmount;
          totalCustom += customAmount;
        });
        if (Math.abs(totalCustom - totalAmount) > 0.01) {
          Alert.alert('Invalid Split', `Split amounts must total $${totalAmount.toFixed(2)}`);
          return null;
        }
        break;

      case 'percentage':
        let totalPercentage = 0;
        selectedParticipants.forEach(id => {
          const percentage = parseFloat(customSplits[id] || '0');
          totalPercentage += percentage;
        });
        if (Math.abs(totalPercentage - 100) > 0.01) {
          Alert.alert('Invalid Percentage', 'Percentages must total 100%');
          return null;
        }
        selectedParticipants.forEach(id => {
          const percentage = parseFloat(customSplits[id] || '0');
          splits[id] = (totalAmount * percentage) / 100;
        });
        break;

      case 'shares':
        let totalShares = 0;
        selectedParticipants.forEach(id => {
          totalShares += parseFloat(customSplits[id] || '1');
        });
        selectedParticipants.forEach(id => {
          const shares = parseFloat(customSplits[id] || '1');
          splits[id] = (totalAmount * shares) / totalShares;
        });
        break;
    }

    return splits;
  };

  const handleSave = () => {
    const splits = calculateSplits();
    if (!splits) return;

    const expense = {
      id: Date.now().toString(),
      description,
      amount: parseFloat(amount),
      category,
      paidBy,
      paidByName: participants.find(p => p.id === paidBy)?.name || 'Unknown',
      splitAmong: selectedParticipants,
      splits,
      splitType,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      timestamp: new Date().toISOString(),
    };

    onSave(expense);
    handleClose();
  };

  const renderDetails = () => (
    <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.modalTitle}>Add Expense</Text>

      {/* Description */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Description *</Text>
        <TextInput
          style={styles.input}
          placeholder="What was this expense for?"
          placeholderTextColor="#8e8e93"
          value={description}
          onChangeText={setDescription}
        />
      </View>

      {/* Amount */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Amount *</Text>
        <View style={styles.amountInput}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.amountField}
            placeholder="0.00"
            placeholderTextColor="#8e8e93"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />
        </View>
      </View>

      {/* Category */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              style={[styles.categoryChip, category === cat.value && styles.categoryChipActive]}
              onPress={() => setCategory(cat.value)}
            >
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text style={[styles.categoryLabel, category === cat.value && styles.categoryLabelActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Paid By */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Paid by</Text>
        <View style={styles.paidByContainer}>
          {participants.map((participant) => (
            <TouchableOpacity
              key={participant.id}
              style={[styles.paidByOption, paidBy === participant.id && styles.paidByOptionActive]}
              onPress={() => setPaidBy(participant.id)}
            >
              <View style={[styles.radioOuter, paidBy === participant.id && styles.radioOuterActive]}>
                {paidBy === participant.id && <View style={styles.radioInner} />}
              </View>
              <Text style={[styles.paidByText, paidBy === participant.id && styles.paidByTextActive]}>
                {participant.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderSplit = () => {
    const totalAmount = parseFloat(amount) || 0;
    
    return (
      <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => setStep('details')} style={styles.backButtonModal}>
          <Text style={styles.backTextModal}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.modalTitle}>Split Expense</Text>
        <Text style={styles.modalSubtitle}>Total: ${totalAmount.toFixed(2)}</Text>

        {/* Split Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Split Method</Text>
          <View style={styles.splitTypeContainer}>
            <TouchableOpacity
              style={[styles.splitTypeButton, splitType === 'equal' && styles.splitTypeButtonActive]}
              onPress={() => setSplitType('equal')}
            >
              <Text style={[styles.splitTypeText, splitType === 'equal' && styles.splitTypeTextActive]}>
                = Equally
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.splitTypeButton, splitType === 'unequal' && styles.splitTypeButtonActive]}
              onPress={() => setSplitType('unequal')}
            >
              <Text style={[styles.splitTypeText, splitType === 'unequal' && styles.splitTypeTextActive]}>
                ≠ Unequally
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.splitTypeButton, splitType === 'percentage' && styles.splitTypeButtonActive]}
              onPress={() => setSplitType('percentage')}
            >
              <Text style={[styles.splitTypeText, splitType === 'percentage' && styles.splitTypeTextActive]}>
                % Percentage
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.splitTypeButton, splitType === 'shares' && styles.splitTypeButtonActive]}
              onPress={() => setSplitType('shares')}
            >
              <Text style={[styles.splitTypeText, splitType === 'shares' && styles.splitTypeTextActive]}>
                ⚖️ Shares
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Participants Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Split with</Text>
          {participants.map((participant) => {
            const isSelected = selectedParticipants.includes(participant.id);
            let shareAmount = 0;

            if (splitType === 'equal' && isSelected) {
              shareAmount = totalAmount / selectedParticipants.length;
            } else if (splitType === 'percentage' && customSplits[participant.id]) {
              shareAmount = (totalAmount * parseFloat(customSplits[participant.id])) / 100;
            } else if (splitType === 'shares' && customSplits[participant.id]) {
              const totalShares = selectedParticipants.reduce((sum, id) => 
                sum + parseFloat(customSplits[id] || '1'), 0);
              shareAmount = (totalAmount * parseFloat(customSplits[participant.id])) / totalShares;
            } else if ((splitType === 'unequal' || splitType === 'custom') && customSplits[participant.id]) {
              shareAmount = parseFloat(customSplits[participant.id]);
            }

            return (
              <View key={participant.id} style={styles.participantRow}>
                <TouchableOpacity
                  style={styles.participantLeft}
                  onPress={() => toggleParticipant(participant.id)}
                >
                  <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.participantName}>{participant.name}</Text>
                </TouchableOpacity>

                {isSelected && splitType !== 'equal' && (
                  <View style={styles.participantRight}>
                    {splitType === 'percentage' && (
                      <View style={styles.customInputContainer}>
                        <TextInput
                          style={styles.customInput}
                          placeholder="0"
                          placeholderTextColor="#8e8e93"
                          keyboardType="decimal-pad"
                          value={customSplits[participant.id] || ''}
                          onChangeText={(text) => setCustomSplits({ ...customSplits, [participant.id]: text })}
                        />
                        <Text style={styles.customInputUnit}>%</Text>
                      </View>
                    )}
                    {splitType === 'shares' && (
                      <TextInput
                        style={styles.customInput}
                        placeholder="1"
                        placeholderTextColor="#8e8e93"
                        keyboardType="decimal-pad"
                        value={customSplits[participant.id] || ''}
                        onChangeText={(text) => setCustomSplits({ ...customSplits, [participant.id]: text })}
                      />
                    )}
                    {(splitType === 'unequal' || splitType === 'custom') && (
                      <View style={styles.customInputContainer}>
                        <Text style={styles.customInputUnit}>$</Text>
                        <TextInput
                          style={styles.customInput}
                          placeholder="0.00"
                          placeholderTextColor="#8e8e93"
                          keyboardType="decimal-pad"
                          value={customSplits[participant.id] || ''}
                          onChangeText={(text) => setCustomSplits({ ...customSplits, [participant.id]: text })}
                        />
                      </View>
                    )}
                    <Text style={styles.sharePreview}>
                      ${shareAmount.toFixed(2)}
                    </Text>
                  </View>
                )}

                {isSelected && splitType === 'equal' && (
                  <Text style={styles.shareAmount}>
                    ${shareAmount.toFixed(2)}
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Summary */}
        <View style={styles.splitSummary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Selected: {selectedParticipants.length} people</Text>
            {splitType === 'equal' && (
              <Text style={styles.summaryValue}>
                ${(totalAmount / selectedParticipants.length).toFixed(2)} each
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <StatusBar barStyle="dark-content" />

        {step === 'details' ? renderDetails() : renderSplit()}

        {/* Bottom Actions */}
        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          {step === 'details' ? (
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Expense</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  modalContent: {
    flex: 1,
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  backButtonModal: {
    marginBottom: 16,
  },
  backTextModal: {
    fontSize: 17,
    color: '#000000',
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 17,
    color: '#8e8e93',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginRight: 8,
  },
  amountField: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    paddingVertical: 14,
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  categoryChipActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  categoryLabel: {
    fontSize: 15,
    color: '#000000',
    fontWeight: '500',
  },
  categoryLabelActive: {
    color: '#ffffff',
  },
  paidByContainer: {
    gap: 12,
  },
  paidByOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  paidByOptionActive: {
    borderColor: '#000000',
    borderWidth: 2,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#d1d1d6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioOuterActive: {
    borderColor: '#000000',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#000000',
  },
  paidByText: {
    fontSize: 17,
    color: '#000000',
  },
  paidByTextActive: {
    fontWeight: '600',
  },
  splitTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  splitTypeButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  splitTypeButtonActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  splitTypeText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
  },
  splitTypeTextActive: {
    color: '#ffffff',
  },
  participantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  participantLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d1d6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  checkmark: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '700',
  },
  participantName: {
    fontSize: 17,
    color: '#000000',
  },
  participantRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  customInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  customInput: {
    fontSize: 17,
    color: '#000000',
    paddingVertical: 8,
    minWidth: 60,
    textAlign: 'center',
  },
  customInputUnit: {
    fontSize: 15,
    color: '#8e8e93',
    fontWeight: '600',
  },
  sharePreview: {
    fontSize: 15,
    color: '#34c759',
    fontWeight: '600',
  },
  shareAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  splitSummary: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 15,
    color: '#8e8e93',
  },
  summaryValue: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  nextButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#34c759',
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
  },
});
