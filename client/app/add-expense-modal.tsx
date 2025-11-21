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
import { theme } from '../constants/theme';

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
          Alert.alert('Invalid Split', `Split amounts must total ₹${totalAmount.toFixed(2)}`);
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
          <Text style={styles.currencySymbol}>₹</Text>
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
        <Text style={styles.modalSubtitle}>Total: ₹{totalAmount.toFixed(2)}</Text>

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
                        <Text style={styles.customInputUnit}>₹</Text>
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
                      ₹{shareAmount.toFixed(2)}
                    </Text>
                  </View>
                )}

                {isSelected && splitType === 'equal' && (
                  <Text style={styles.shareAmount}>
                    ₹{shareAmount.toFixed(2)}
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
                ₹{(totalAmount / selectedParticipants.length).toFixed(2)} each
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
    backgroundColor: theme.colors.background,
  },
  modalContent: {
    flex: 1,
    padding: theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  backButtonModal: {
    marginBottom: theme.spacing.md,
  },
  backTextModal: {
    ...theme.typography.bodyLarge,
    color: theme.colors.text,
    fontWeight: '500',
  },
  modalTitle: {
    ...theme.typography.heading1,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  modalSubtitle: {
    ...theme.typography.bodyLarge,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
  },
  inputGroup: {
    marginBottom: theme.spacing.xl,
  },
  inputLabel: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    ...theme.typography.bodyLarge,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
    marginRight: theme.spacing.xs,
  },
  amountField: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
    paddingVertical: theme.spacing.sm,
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.xl,
    marginRight: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryChipActive: {
    backgroundColor: theme.colors.text,
    borderColor: theme.colors.text,
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: theme.spacing.xs,
  },
  categoryLabel: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '500',
  },
  categoryLabelActive: {
    color: theme.colors.surface,
  },
  paidByContainer: {
    gap: theme.spacing.sm,
  },
  paidByOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  paidByOptionActive: {
    borderColor: theme.colors.text,
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
    marginRight: theme.spacing.sm,
  },
  radioOuterActive: {
    borderColor: theme.colors.text,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.text,
  },
  paidByText: {
    ...theme.typography.bodyLarge,
    color: theme.colors.text,
  },
  paidByTextActive: {
    fontWeight: '600',
  },
  splitTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  splitTypeButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  splitTypeButtonActive: {
    backgroundColor: theme.colors.text,
    borderColor: theme.colors.text,
  },
  splitTypeText: {
    ...theme.typography.body,
    fontWeight: '500',
    color: theme.colors.text,
  },
  splitTypeTextActive: {
    color: theme.colors.surface,
  },
  participantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
    marginRight: theme.spacing.sm,
  },
  checkboxActive: {
    backgroundColor: theme.colors.text,
    borderColor: theme.colors.text,
  },
  checkmark: {
    fontSize: 14,
    color: theme.colors.surface,
    fontWeight: '700',
  },
  participantName: {
    ...theme.typography.bodyLarge,
    color: theme.colors.text,
  },
  participantRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  customInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.sm,
  },
  customInput: {
    ...theme.typography.bodyLarge,
    color: theme.colors.text,
    paddingVertical: theme.spacing.xs,
    minWidth: 60,
    textAlign: 'center',
  },
  customInputUnit: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  sharePreview: {
    ...theme.typography.body,
    color: theme.colors.success,
    fontWeight: '600',
  },
  shareAmount: {
    ...theme.typography.bodyMedium,
    fontWeight: '600',
    color: theme.colors.text,
  },
  splitSummary: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    marginTop: theme.spacing.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  summaryValue: {
    ...theme.typography.bodyLarge,
    fontWeight: '600',
    color: theme.colors.text,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  cancelButtonText: {
    ...theme.typography.bodyLarge,
    fontWeight: '600',
    color: theme.colors.text,
  },
  nextButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    backgroundColor: theme.colors.text,
  },
  nextButtonText: {
    ...theme.typography.bodyLarge,
    fontWeight: '600',
    color: theme.colors.surface,
  },
  saveButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    backgroundColor: theme.colors.success,
  },
  saveButtonText: {
    ...theme.typography.bodyLarge,
    fontWeight: '600',
    color: theme.colors.surface,
  },
});
