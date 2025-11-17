import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AddExpenseModal from './add-expense-modal';

type TabType = 'chat' | 'expenses';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isPinned?: boolean;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  paidByName: string;
  splitAmong: string[];
  splits?: { [key: string]: number };
  splitType?: string;
  date: string;
  category: 'fuel' | 'toll' | 'parking' | 'food' | 'accommodation' | 'shopping' | 'entertainment' | 'other';
  timestamp: string;
}

interface Settlement {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
}

interface Poll {
  id: string;
  question: string;
  options: { text: string; votes: number; voters: string[] }[];
  createdBy: string;
  createdByName: string;
}

export default function RideDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const rideId = params.id as string;

  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [showAddExpense, setShowAddExpense] = useState(false);

  // Current user (mock)
  const currentUserId = 'user1';
  const currentUserName = 'You';
  const isAdmin = true; // Mock - should check if user is ride creator

  // Ride info (mock)
  const rideInfo = {
    from: 'University Campus',
    to: 'Downtown Mall',
    date: 'Nov 20, 2025',
    time: '3:00 PM',
    participants: [
      { id: 'user1', name: 'You' },
      { id: 'user2', name: 'Sarah Johnson' },
      { id: 'user3', name: 'Mike Chen' },
      { id: 'user4', name: 'Emma Davis' },
    ],
  };

  useEffect(() => {
    loadRideData();
  }, []);

  const loadRideData = async () => {
    // TODO: Fetch from Supabase
    const mockMessages: Message[] = [
      {
        id: '1',
        senderId: 'user2',
        senderName: 'Sarah Johnson',
        text: 'Hey everyone! Looking forward to the ride!',
        timestamp: '10:30 AM',
      },
      {
        id: '2',
        senderId: 'user1',
        senderName: 'You',
        text: 'Great! Meeting at the main parking lot',
        timestamp: '10:32 AM',
        isPinned: true,
      },
      {
        id: '3',
        senderId: 'user3',
        senderName: 'Mike Chen',
        text: 'Can we leave 5 mins early?',
        timestamp: '11:15 AM',
      },
    ];

    const mockExpenses: Expense[] = [
      {
        id: '1',
        description: 'Gas for the trip',
        amount: 60,
        paidBy: 'user1',
        paidByName: 'You',
        splitAmong: ['user1', 'user2', 'user3', 'user4'],
        date: 'Nov 20',
        category: 'fuel',
      },
      {
        id: '2',
        description: 'Highway toll',
        amount: 25,
        paidBy: 'user1',
        paidByName: 'You',
        splitAmong: ['user1', 'user2', 'user3', 'user4'],
        date: 'Nov 20',
        category: 'toll',
      },
      {
        id: '3',
        description: 'Parking at mall',
        amount: 15,
        paidBy: 'user2',
        paidByName: 'Sarah Johnson',
        splitAmong: ['user1', 'user2', 'user3', 'user4'],
        date: 'Nov 20',
        category: 'parking',
      },
    ];

    setMessages(mockMessages);
    setExpenses(mockExpenses);
  };

  const handleAddExpenseComplete = (expense: Expense) => {
    setExpenses([...expenses, expense]);
    Alert.alert('Success', 'Expense added successfully!');
  };

  const handleDeleteExpense = (expenseId: string) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setExpenses(expenses.filter(e => e.id !== expenseId));
            Alert.alert('Deleted', 'Expense removed successfully');
          },
        },
      ]
    );
  };

  const calculateSettlements = (): Settlement[] => {
    const { balances } = calculateExpenseSummary();
    const settlements: Settlement[] = [];
    
    const creditors = Object.entries(balances)
      .filter(([_, balance]) => balance > 0.01)
      .sort((a, b) => b[1] - a[1]);
    
    const debtors = Object.entries(balances)
      .filter(([_, balance]) => balance < -0.01)
      .sort((a, b) => a[1] - b[1]);
    
    const creditorsCopy = creditors.map(([id, amount]) => ({ id, amount }));
    const debtorsCopy = debtors.map(([id, amount]) => ({ id, amount: Math.abs(amount) }));
    
    for (const debtor of debtorsCopy) {
      let remaining = debtor.amount;
      
      for (const creditor of creditorsCopy) {
        if (remaining <= 0.01) break;
        if (creditor.amount <= 0.01) continue;
        
        const settleAmount = Math.min(remaining, creditor.amount);
        
        settlements.push({
          from: debtor.id,
          fromName: rideInfo.participants.find(p => p.id === debtor.id)?.name || 'Unknown',
          to: creditor.id,
          toName: rideInfo.participants.find(p => p.id === creditor.id)?.name || 'Unknown',
          amount: settleAmount,
        });
        
        remaining -= settleAmount;
        creditor.amount -= settleAmount;
      }
    }
    
    return settlements;
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      senderName: currentUserName,
      text: messageText,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };

    setMessages([...messages, newMessage]);
    setMessageText('');
  };

  const handlePinMessage = (messageId: string) => {
    if (!isAdmin) {
      Alert.alert('Permission Denied', 'Only the ride creator can pin messages');
      return;
    }

    setMessages(messages.map(msg =>
      msg.id === messageId ? { ...msg, isPinned: !msg.isPinned } : msg
    ));
  };

  const handleCreatePoll = () => {
    Alert.alert('Create Poll', 'Poll creation feature coming soon!');
  };

  const handleAddExpense = () => {
    setShowAddExpense(true);
  };

  const calculateExpenseSummary = () => {
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const perPersonShare = totalExpenses / rideInfo.participants.length;

    const balances: { [key: string]: number } = {};
    rideInfo.participants.forEach(p => {
      balances[p.id] = 0;
    });

    expenses.forEach(expense => {
      const sharePerPerson = expense.amount / expense.splitAmong.length;
      balances[expense.paidBy] += expense.amount;
      expense.splitAmong.forEach(userId => {
        balances[userId] -= sharePerPerson;
      });
    });

    return { totalExpenses, perPersonShare, balances };
  };

  const { totalExpenses, perPersonShare, balances } = calculateExpenseSummary();
  const currentUserBalance = balances[currentUserId];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fuel': return '⛽';
      case 'toll': return '🛣️';
      case 'parking': return '🅿️';
      case 'food': return '🍔';
      case 'accommodation': return '🏨';
      case 'shopping': return '🛍️';
      case 'entertainment': return '🎉';
      default: return '💰';
    }
  };

  const settlements = calculateSettlements();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {rideInfo.from} → {rideInfo.to}
          </Text>
          <Text style={styles.headerSubtitle}>
            {rideInfo.date} • {rideInfo.participants.length} members
          </Text>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuText}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'chat' && styles.tabActive]}
          onPress={() => setActiveTab('chat')}
        >
          <Text style={[styles.tabText, activeTab === 'chat' && styles.tabTextActive]}>
            💬 Chat
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'expenses' && styles.tabActive]}
          onPress={() => setActiveTab('expenses')}
        >
          <Text style={[styles.tabText, activeTab === 'expenses' && styles.tabTextActive]}>
            💸 Expenses
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'chat' ? (
        <>
          {/* Pinned Messages */}
          {messages.filter(m => m.isPinned).length > 0 && (
            <View style={styles.pinnedSection}>
              <Text style={styles.pinnedLabel}>📌 PINNED</Text>
              {messages.filter(m => m.isPinned).map(msg => (
                <View key={msg.id} style={styles.pinnedMessage}>
                  <Text style={styles.pinnedMessageText} numberOfLines={1}>
                    {msg.senderName}: {msg.text}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Messages */}
          <ScrollView
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message) => {
              const isCurrentUser = message.senderId === currentUserId;
              return (
                <TouchableOpacity
                  key={message.id}
                  style={[
                    styles.messageBubble,
                    isCurrentUser ? styles.messageBubbleRight : styles.messageBubbleLeft,
                  ]}
                  onLongPress={() => handlePinMessage(message.id)}
                  activeOpacity={0.7}
                >
                  {!isCurrentUser && (
                    <Text style={styles.messageSender}>{message.senderName}</Text>
                  )}
                  <Text style={[
                    styles.messageText,
                    isCurrentUser && styles.messageTextRight,
                  ]}>
                    {message.text}
                  </Text>
                  <Text style={[
                    styles.messageTime,
                    isCurrentUser && styles.messageTimeRight,
                  ]}>
                    {message.timestamp}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* Poll Section */}
            {polls.length > 0 && polls.map(poll => (
              <View key={poll.id} style={styles.pollContainer}>
                <Text style={styles.pollQuestion}>{poll.question}</Text>
                {poll.options.map((option, index) => (
                  <TouchableOpacity key={index} style={styles.pollOption}>
                    <Text style={styles.pollOptionText}>{option.text}</Text>
                    <Text style={styles.pollVotes}>{option.votes} votes</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>

          {/* Message Input */}
          <View style={styles.inputContainer}>
            {isAdmin && (
              <TouchableOpacity
                style={styles.pollButton}
                onPress={handleCreatePoll}
              >
                <Text style={styles.pollButtonText}>📊</Text>
              </TouchableOpacity>
            )}
            <TextInput
              style={styles.messageInput}
              placeholder="Type a message..."
              placeholderTextColor="#8e8e93"
              value={messageText}
              onChangeText={setMessageText}
              multiline
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
              disabled={!messageText.trim()}
            >
              <Text style={styles.sendButtonText}>➤</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          {/* Expense Summary */}
          <View style={styles.expenseSummary}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Expenses</Text>
              <Text style={styles.summaryAmount}>${totalExpenses.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Per Person</Text>
              <Text style={styles.summaryAmount}>${perPersonShare.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Your Balance</Text>
              <Text style={[
                styles.summaryAmount,
                currentUserBalance > 0 ? styles.positiveBalance : styles.negativeBalance,
              ]}>
                {currentUserBalance > 0 ? '+' : ''}${Math.abs(currentUserBalance).toFixed(2)}
              </Text>
              <Text style={styles.balanceHint}>
                {currentUserBalance > 0 ? 'You are owed' : currentUserBalance < 0 ? 'You owe' : 'Settled'}
              </Text>
            </View>
          </View>

          {/* Expenses List */}
          <ScrollView
            style={styles.expensesContainer}
            contentContainerStyle={styles.expensesContent}
            showsVerticalScrollIndicator={false}
          >
            {expenses.length === 0 ? (
              <View style={styles.emptyExpenses}>
                <Text style={styles.emptyExpensesIcon}>💸</Text>
                <Text style={styles.emptyExpensesText}>No expenses yet</Text>
                <Text style={styles.emptyExpensesSubtext}>Tap below to add your first expense</Text>
              </View>
            ) : (
              expenses.map((expense) => {
                let yourShare = 0;
                if (expense.splits && expense.splits[currentUserId]) {
                  yourShare = expense.splits[currentUserId];
                } else {
                  yourShare = expense.amount / expense.splitAmong.length;
                }
                
                return (
                  <TouchableOpacity
                    key={expense.id}
                    style={styles.expenseCard}
                    onLongPress={() => expense.paidBy === currentUserId && handleDeleteExpense(expense.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.expenseHeader}>
                      <View style={styles.expenseCategory}>
                        <Text style={styles.categoryIcon}>{getCategoryIcon(expense.category)}</Text>
                        <View>
                          <Text style={styles.expenseDescription}>{expense.description}</Text>
                          <Text style={styles.expenseDate}>{expense.date}</Text>
                        </View>
                      </View>
                      <View style={styles.expenseAmountContainer}>
                        <Text style={styles.expenseAmount}>${expense.amount.toFixed(2)}</Text>
                        {expense.paidBy === currentUserId && (
                          <Text style={styles.youPaidBadge}>You paid</Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.expenseDetails}>
                      <Text style={styles.expenseDetailText}>
                        Paid by <Text style={styles.expenseDetailBold}>{expense.paidByName}</Text>
                      </Text>
                      {expense.splitType && expense.splitType !== 'equal' ? (
                        <Text style={styles.expenseDetailText}>
                          Split {expense.splitType} • Your share: ${yourShare.toFixed(2)}
                        </Text>
                      ) : (
                        <Text style={styles.expenseDetailText}>
                          Split equally • ${yourShare.toFixed(2)} each
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}

            {/* Settlement Instructions */}
            {settlements.length > 0 && (
              <View style={styles.settlementSection}>
                <Text style={styles.settlementTitle}>💳 Settlement Instructions</Text>
                <Text style={styles.settlementSubtitle}>
                  Simplified payments to settle all expenses:
                </Text>
                {settlements.map((settlement, index) => (
                  <View key={index} style={styles.settlementCard}>
                    <View style={styles.settlementFlow}>
                      <View style={styles.settlementPerson}>
                        <Text style={styles.settlementPersonName}>{settlement.fromName}</Text>
                        <Text style={styles.settlementLabel}>pays</Text>
                      </View>
                      <View style={styles.settlementArrow}>
                        <Text style={styles.settlementAmountBig}>${settlement.amount.toFixed(2)}</Text>
                        <Text style={styles.settlementArrowIcon}>→</Text>
                      </View>
                      <View style={styles.settlementPerson}>
                        <Text style={styles.settlementLabel}>to</Text>
                        <Text style={styles.settlementPersonName}>{settlement.toName}</Text>
                      </View>
                    </View>
                    {(settlement.from === currentUserId || settlement.to === currentUserId) && (
                      <TouchableOpacity style={styles.markSettledButton}>
                        <Text style={styles.markSettledText}>✓ Mark as Settled</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Balance Summary */}
            <View style={styles.settlementSection}>
              <Text style={styles.settlementTitle}>Balance Summary</Text>
              {rideInfo.participants.map(participant => {
                const balance = balances[participant.id];
                if (Math.abs(balance) < 0.01) return null;
                return (
                  <View key={participant.id} style={styles.settlementItem}>
                    <Text style={styles.settlementName}>{participant.name}</Text>
                    <Text style={[
                      styles.settlementAmount,
                      balance > 0 ? styles.positiveBalance : styles.negativeBalance,
                    ]}>
                      {balance > 0 ? '+' : ''}${Math.abs(balance).toFixed(2)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {/* Add Expense Button */}
          <TouchableOpacity
            style={styles.addExpenseButton}
            onPress={handleAddExpense}
          >
            <Text style={styles.addExpenseButtonText}>+ Add Expense</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Add Expense Modal */}
      <AddExpenseModal
        visible={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        onSave={handleAddExpenseComplete}
        participants={rideInfo.participants}
        currentUserId={currentUserId}
      />
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
  headerInfo: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#8e8e93',
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    fontSize: 24,
    color: '#000000',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f7f7f7',
  },
  tabActive: {
    backgroundColor: '#000000',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8e8e93',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  pinnedSection: {
    backgroundColor: '#fff9e6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pinnedLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8e8e93',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  pinnedMessage: {
    marginBottom: 4,
  },
  pinnedMessageText: {
    fontSize: 14,
    color: '#000000',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 40,
  },
  messageBubble: {
    maxWidth: '80%',
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
  },
  messageBubbleLeft: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
  },
  messageBubbleRight: {
    alignSelf: 'flex-end',
    backgroundColor: '#000000',
  },
  messageSender: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8e8e93',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#000000',
    lineHeight: 20,
  },
  messageTextRight: {
    color: '#ffffff',
  },
  messageTime: {
    fontSize: 11,
    color: '#8e8e93',
    marginTop: 4,
  },
  messageTimeRight: {
    color: '#d1d1d6',
  },
  pollContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  pollQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  pollOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    marginBottom: 8,
  },
  pollOptionText: {
    fontSize: 15,
    color: '#000000',
  },
  pollVotes: {
    fontSize: 13,
    color: '#8e8e93',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 8,
  },
  pollButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7f7f7',
    borderRadius: 18,
  },
  pollButtonText: {
    fontSize: 18,
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    color: '#000000',
  },
  sendButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    borderRadius: 18,
  },
  sendButtonText: {
    fontSize: 18,
    color: '#ffffff',
  },
  expenseSummary: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginBottom: 12,
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#8e8e93',
    marginBottom: 4,
    fontWeight: '500',
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
  },
  positiveBalance: {
    color: '#34c759',
  },
  negativeBalance: {
    color: '#ff3b30',
  },
  balanceHint: {
    fontSize: 13,
    color: '#8e8e93',
    marginTop: 4,
  },
  expensesContainer: {
    flex: 1,
  },
  expensesContent: {
    padding: 16,
    paddingBottom: 100,
  },
  expenseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  expenseCategory: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 12,
  },
  categoryIcon: {
    fontSize: 24,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  expenseDate: {
    fontSize: 13,
    color: '#8e8e93',
  },
  expenseAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  expenseDetails: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  expenseDetailText: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 4,
  },
  expenseDetailBold: {
    fontWeight: '600',
    color: '#000000',
  },
  emptyExpenses: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyExpensesIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyExpensesText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  emptyExpensesSubtext: {
    fontSize: 15,
    color: '#8e8e93',
    textAlign: 'center',
  },
  expenseAmountContainer: {
    alignItems: 'flex-end',
  },
  youPaidBadge: {
    fontSize: 11,
    color: '#34c759',
    fontWeight: '600',
    marginTop: 4,
  },
  settlementSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  settlementTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  settlementSubtitle: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 16,
    lineHeight: 20,
  },
  settlementCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  settlementFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  settlementPerson: {
    flex: 1,
    alignItems: 'center',
  },
  settlementPersonName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  settlementLabel: {
    fontSize: 12,
    color: '#8e8e93',
  },
  settlementArrow: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  settlementAmountBig: {
    fontSize: 20,
    fontWeight: '700',
    color: '#34c759',
    marginBottom: 4,
  },
  settlementArrowIcon: {
    fontSize: 20,
    color: '#8e8e93',
  },
  markSettledButton: {
    backgroundColor: '#34c759',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  markSettledText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  settlementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settlementName: {
    fontSize: 15,
    color: '#000000',
  },
  settlementAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  addExpenseButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  addExpenseButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
  },
});
