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
    ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AddExpenseModal from '../add-expense-modal';
import { theme } from '@/constants/theme';
import { rideService } from '@/services/mock/rideService';
import { chatService } from '@/services/mock/chatService';
import { expenseService } from '@/services/mock/expenseService';
import { authService } from '@/services/mock/authService';
import { Ride, RideParticipant } from '@/types/ride';
import { ChatMessage, Poll } from '@/types/chat';
import { Expense } from '@/types/expense';
import { User } from '@/types/user';

type TabType = 'details' | 'chat' | 'expenses';

interface Settlement {
    from: string;
    fromName: string;
    to: string;
    toName: string;
    amount: number;
}

export default function RideDetailsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const rideId = params.id as string;

    const activeTabParam = params.tab as TabType;
    const [activeTab, setActiveTab] = useState<TabType>(activeTabParam || 'details');
    const [messageText, setMessageText] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [polls, setPolls] = useState<Poll[]>([]);
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [ride, setRide] = useState<Ride | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [rideId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [userRes, rideRes, messagesRes, expensesRes] = await Promise.all([
                authService.getCurrentUser(),
                rideService.getRideById(rideId),
                chatService.getMessages(rideId),
                expenseService.getExpenses(rideId),
            ]);

            if (userRes.data) setCurrentUser(userRes.data);
            if (rideRes.data) setRide(rideRes.data);
            if (messagesRes.data) setMessages(messagesRes.data);
            if (expensesRes.data) setExpenses(expensesRes.data);

        } catch (error) {
            console.error('Error loading ride data:', error);
            Alert.alert('Error', 'Failed to load ride details');
        } finally {
            setLoading(false);
        }
    };

    const isAdmin = ride?.organizer_id === currentUser?.id;
    const isParticipant = ride?.participants?.some(p => p.user_id === currentUser?.id);

    const handleJoinRide = async () => {
        if (!ride || !currentUser) return;

        Alert.alert(
            'Join Ride',
            `Are you sure you want to join this ride for ₹${ride.price_per_seat}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Join',
                    onPress: async () => {
                        const response = await rideService.joinRide(ride.id);
                        if (response.error) {
                            Alert.alert('Error', response.error);
                        } else {
                            Alert.alert('Success', 'You have joined the ride!');
                            loadData(); // Reload to update UI
                        }
                    },
                },
            ]
        );
    };

    const handleAddExpenseComplete = async (expenseData: any) => {
        if (!currentUser || !ride) return;

        const newExpense: Partial<Expense> = {
            ...expenseData,
            ride_id: ride.id,
            payer_id: expenseData.paidBy, // Map from modal data
            currency: ride.currency,
        };

        const response = await expenseService.addExpense(newExpense as Omit<Expense, 'id' | 'created_at' | 'updated_at'>);

        if (response.data) {
            setExpenses([...expenses, response.data]);
            Alert.alert('Success', 'Expense added successfully!');
        } else {
            Alert.alert('Error', response.error || 'Failed to add expense');
        }
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
                        // In a real app, call service to delete
                        setExpenses(expenses.filter(e => e.id !== expenseId));
                        Alert.alert('Deleted', 'Expense removed successfully');
                    },
                },
            ]
        );
    };

    const calculateSettlements = (): Settlement[] => {
        if (!ride || !ride.participants) return [];
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

                const debtorName = ride.participants.find(p => p.user_id === debtor.id)?.user?.full_name || 'Unknown';
                const creditorName = ride.participants.find(p => p.user_id === creditor.id)?.user?.full_name || 'Unknown';

                settlements.push({
                    from: debtor.id,
                    fromName: debtorName,
                    to: creditor.id,
                    toName: creditorName,
                    amount: settleAmount,
                });

                remaining -= settleAmount;
                creditor.amount -= settleAmount;
            }
        }

        return settlements;
    };

    const handleSendMessage = async () => {
        if (!messageText.trim() || !currentUser || !ride) return;

        const response = await chatService.sendMessage(ride.id, messageText);

        if (response.data) {
            setMessages([...messages, response.data]);
            setMessageText('');
        } else {
            Alert.alert('Error', 'Failed to send message');
        }
    };

    const handlePinMessage = (messageId: string) => {
        if (!isAdmin) {
            Alert.alert('Permission Denied', 'Only the ride organizer can pin messages');
            return;
        }

        // Mock pinning logic - in real app call service
        setMessages(messages.map(msg =>
            msg.id === messageId ? { ...msg, is_pinned: !msg.is_pinned } : msg
        ));
    };

    const handleCreatePoll = () => {
        Alert.alert('Create Poll', 'Poll creation feature coming soon!');
    };

    const handleAddExpense = () => {
        setShowAddExpense(true);
    };

    const calculateExpenseSummary = () => {
        if (!ride || !ride.participants) return { totalExpenses: 0, perPersonShare: 0, balances: {} };

        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const perPersonShare = totalExpenses / ride.participants.length;

        const balances: { [key: string]: number } = {};
        ride.participants.forEach(p => {
            balances[p.user_id] = 0;
        });

        expenses.forEach(expense => {
            if (expense.splits && expense.splits.length > 0) {
                expense.splits.forEach(split => {
                    if (balances[expense.payer_id] !== undefined) balances[expense.payer_id] += split.amount_owed;
                    if (balances[split.user_id] !== undefined) balances[split.user_id] -= split.amount_owed;
                });
            } else {
                // Fallback to equal split
                const sharePerPerson = expense.amount / ride.participants!.length;
                if (balances[expense.payer_id] !== undefined) balances[expense.payer_id] += expense.amount;
                ride.participants!.forEach(p => {
                    if (balances[p.user_id] !== undefined) balances[p.user_id] -= sharePerPerson;
                });
            }
        });

        return { totalExpenses, perPersonShare, balances };
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!ride || !currentUser) {
        return (
            <View style={[styles.container, styles.center]}>
                <Text>Ride not found</Text>
            </View>
        );
    }

    const { totalExpenses, perPersonShare, balances } = calculateExpenseSummary();
    const currentUserBalance = balances[currentUser.id] || 0;

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'FUEL': return '⛽';
            case 'TOLL': return '🛣️';
            case 'PARKING': return '🅿️';
            case 'FOOD': return '🍔';
            case 'ACCOMMODATION': return '🏨';
            case 'SHOPPING': return '🛍️';
            case 'ENTERTAINMENT': return '🎉';
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
                        {ride.start_location_name} → {ride.destination_name}
                    </Text>
                    <Text style={styles.headerSubtitle}>
                        {new Date(ride.scheduled_start_time).toLocaleDateString()} • {ride.participants?.length || 0} members
                    </Text>
                </View>
                <TouchableOpacity style={styles.menuButton}>
                    <Text style={styles.menuText}>⋮</Text>
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'details' && styles.tabActive]}
                    onPress={() => setActiveTab('details')}
                >
                    <Text style={[styles.tabText, activeTab === 'details' && styles.tabTextActive]}>
                        ℹ️ Details
                    </Text>
                </TouchableOpacity>

                {isParticipant && (
                    <>
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
                    </>
                )}
            </View>

            {/* Content */}
            {activeTab === 'details' ? (
                <View style={styles.joinContainer}>
                    <View style={styles.joinInfoCard}>
                        <Text style={styles.joinTitle}>Trip Details</Text>
                        <View style={styles.joinRow}>
                            <Text style={styles.joinLabel}>Price per seat</Text>
                            <Text style={styles.joinValue}>₹{ride.price_per_seat}</Text>
                        </View>
                        <View style={styles.joinRow}>
                            <Text style={styles.joinLabel}>Available Seats</Text>
                            <Text style={styles.joinValue}>{ride.available_seats}</Text>
                        </View>
                        <View style={styles.joinRow}>
                            <Text style={styles.joinLabel}>Description</Text>
                            <Text style={styles.joinValue}>{ride.description || 'No description'}</Text>
                        </View>
                    </View>

                    {!isParticipant && (
                        <TouchableOpacity
                            style={[styles.joinButton, ride.available_seats === 0 && styles.joinButtonDisabled]}
                            onPress={handleJoinRide}
                            disabled={ride.available_seats === 0}
                        >
                            <Text style={styles.joinButtonText}>
                                {ride.available_seats === 0 ? 'Ride Full' : 'Join Ride'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            ) : activeTab === 'chat' ? (
                <>
                    {/* Pinned Messages */}
                    {messages.filter(m => m.is_pinned).length > 0 && (
                        <View style={styles.pinnedSection}>
                            <Text style={styles.pinnedLabel}>📌 PINNED</Text>
                            {messages.filter(m => m.is_pinned).map(msg => (
                                <View key={msg.id} style={styles.pinnedMessage}>
                                    <Text style={styles.pinnedMessageText} numberOfLines={1}>
                                        {msg.sender?.full_name}: {msg.content}
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
                            const isCurrentUser = message.sender_id === currentUser.id;
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
                                        <Text style={styles.messageSender}>{message.sender?.full_name}</Text>
                                    )}
                                    <Text style={[
                                        styles.messageText,
                                        isCurrentUser && styles.messageTextRight,
                                    ]}>
                                        {message.content}
                                    </Text>
                                    <Text style={[
                                        styles.messageTime,
                                        isCurrentUser && styles.messageTimeRight,
                                    ]}>
                                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                                        <Text style={styles.pollVotes}>{option.votes?.length || 0} votes</Text>
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
                            <Text style={styles.summaryAmount}>₹{totalExpenses.toFixed(2)}</Text>
                        </View>
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryLabel}>Per Person</Text>
                            <Text style={styles.summaryAmount}>₹{perPersonShare.toFixed(2)}</Text>
                        </View>
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryLabel}>Your Balance</Text>
                            <Text style={[
                                styles.summaryAmount,
                                currentUserBalance > 0 ? styles.positiveBalance : styles.negativeBalance,
                            ]}>
                                {currentUserBalance > 0 ? '+' : ''}₹{Math.abs(currentUserBalance).toFixed(2)}
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
                                // Calculate your share based on splits if available
                                let yourShare = 0;
                                if (expense.splits) {
                                    const mySplit = expense.splits.find(s => s.user_id === currentUser.id);
                                    yourShare = mySplit ? mySplit.amount_owed : 0;
                                } else {
                                    // Fallback
                                    yourShare = expense.amount / (ride.participants?.length || 1);
                                }

                                return (
                                    <TouchableOpacity
                                        key={expense.id}
                                        style={styles.expenseCard}
                                        onLongPress={() => expense.payer_id === currentUser.id && handleDeleteExpense(expense.id)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.expenseHeader}>
                                            <View style={styles.expenseCategory}>
                                                <Text style={styles.categoryIcon}>{getCategoryIcon(expense.category)}</Text>
                                                <View>
                                                    <Text style={styles.expenseDescription}>{expense.description}</Text>
                                                    <Text style={styles.expenseDate}>{new Date(expense.created_at).toLocaleDateString()}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.expenseAmountContainer}>
                                                <Text style={styles.expenseAmount}>₹{expense.amount.toFixed(2)}</Text>
                                                {expense.payer_id === currentUser.id && (
                                                    <Text style={styles.youPaidBadge}>You paid</Text>
                                                )}
                                            </View>
                                        </View>
                                        <View style={styles.expenseDetails}>
                                            <Text style={styles.expenseDetailText}>
                                                Paid by <Text style={styles.expenseDetailBold}>{expense.payer?.full_name}</Text>
                                            </Text>
                                            <Text style={styles.expenseDetailText}>
                                                Your share: ₹{yourShare.toFixed(2)}
                                            </Text>
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
                                                <Text style={styles.settlementAmountBig}>₹{settlement.amount.toFixed(2)}</Text>
                                                <Text style={styles.settlementArrowIcon}>→</Text>
                                            </View>
                                            <View style={styles.settlementPerson}>
                                                <Text style={styles.settlementLabel}>to</Text>
                                                <Text style={styles.settlementPersonName}>{settlement.toName}</Text>
                                            </View>
                                        </View>
                                        {(settlement.from === currentUser.id || settlement.to === currentUser.id) && (
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
                            {ride.participants?.map(participant => {
                                const balance = balances[participant.user_id];
                                if (Math.abs(balance) < 0.01) return null;
                                return (
                                    <View key={participant.user_id} style={styles.settlementItem}>
                                        <Text style={styles.settlementName}>{participant.user?.full_name}</Text>
                                        <Text style={[
                                            styles.settlementAmount,
                                            balance > 0 ? styles.positiveBalance : styles.negativeBalance,
                                        ]}>
                                            {balance > 0 ? '+' : ''}₹{Math.abs(balance).toFixed(2)}
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
            {ride && currentUser && (
                <AddExpenseModal
                    visible={showAddExpense}
                    onClose={() => setShowAddExpense(false)}
                    onSave={handleAddExpenseComplete}
                    participants={ride.participants?.map(p => ({ id: p.user_id, name: p.user?.full_name || 'Unknown' })) || []}
                    currentUserId={currentUser.id}
                />
            )}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    center: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        paddingTop: Platform.OS === 'ios' ? 60 : theme.spacing.lg,
        paddingBottom: theme.spacing.md,
        backgroundColor: theme.colors.surface,
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
        fontWeight: '300',
    },
    headerInfo: {
        flex: 1,
        marginLeft: theme.spacing.xs,
    },
    headerTitle: {
        ...theme.typography.bodyM,
        color: theme.colors.textPrimary,
        marginBottom: 2,
    },
    headerSubtitle: {
        ...theme.typography.captionM,
        color: theme.colors.textSecondary,
    },
    menuButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuText: {
        fontSize: 24,
        color: theme.colors.textPrimary,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        paddingHorizontal: theme.spacing.lg,
        gap: theme.spacing.xs,
        paddingBottom: theme.spacing.sm,
    },
    tab: {
        flex: 1,
        paddingVertical: theme.spacing.sm,
        alignItems: 'center',
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.background,
    },
    tabActive: {
        backgroundColor: theme.colors.textPrimary,
    },
    tabText: {
        ...theme.typography.bodyM,
        fontWeight: '500',
        color: theme.colors.textSecondary,
    },
    tabTextActive: {
        color: theme.colors.surface,
    },
    pinnedSection: {
        backgroundColor: '#fff9e6',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    pinnedLabel: {
        ...theme.typography.captionS,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
    },
    pinnedMessage: {
        marginBottom: theme.spacing.xs,
    },
    pinnedMessageText: {
        ...theme.typography.bodyS,
        color: theme.colors.textPrimary,
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        padding: theme.spacing.md,
        paddingBottom: 40,
    },
    messageBubble: {
        maxWidth: '80%',
        marginBottom: theme.spacing.sm,
        padding: theme.spacing.sm,
        borderRadius: theme.radius.lg,
    },
    messageBubbleLeft: {
        alignSelf: 'flex-start',
        backgroundColor: theme.colors.surface,
    },
    messageBubbleRight: {
        alignSelf: 'flex-end',
        backgroundColor: theme.colors.textPrimary,
    },
    messageSender: {
        ...theme.typography.captionM,
        fontWeight: '600',
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
    },
    messageText: {
        ...theme.typography.bodyM,
        color: theme.colors.textPrimary,
        lineHeight: 20,
    },
    messageTextRight: {
        color: theme.colors.surface,
    },
    messageTime: {
        ...theme.typography.captionS,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.xs,
    },
    messageTimeRight: {
        color: '#d1d1d6',
    },
    pollContainer: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.md,
        marginVertical: theme.spacing.xs,
    },
    pollQuestion: {
        ...theme.typography.bodyM,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.sm,
    },
    pollOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        gap: theme.spacing.xs,
    },
    pollOptionText: {
        ...theme.typography.bodyM,
        color: theme.colors.textPrimary,
    },
    pollVotes: {
        ...theme.typography.captionM,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        gap: theme.spacing.xs,
    },
    pollButton: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.background,
        borderRadius: theme.radius.full,
    },
    pollButtonText: {
        fontSize: 18,
    },
    messageInput: {
        flex: 1,
        backgroundColor: theme.colors.background,
        borderRadius: theme.radius.xl,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        ...theme.typography.bodyM,
        maxHeight: 100,
        color: theme.colors.textPrimary,
    },
    sendButton: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        // disabled: { // This was not valid style
        //     opacity: 0.5
        // }
    },
    sendButtonText: {
        fontSize: 20,
        color: theme.colors.primary,
    },
    expenseSummary: {
        flexDirection: 'row',
        padding: theme.spacing.md,
        gap: theme.spacing.sm,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.sm,
        borderRadius: theme.radius.md,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    summaryLabel: {
        ...theme.typography.captionM,
        color: theme.colors.textSecondary,
        marginBottom: 4,
    },
    balanceHint: {
        fontSize: 10,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    expensesContainer: {
        flex: 1,
    },
    expensesContent: {
        padding: theme.spacing.md,
        paddingBottom: 100,
    },
    emptyExpenses: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.xl,
    },
    emptyExpensesIcon: {
        fontSize: 48,
        marginBottom: theme.spacing.md,
    },
    emptyExpensesText: {
        ...theme.typography.bodyL,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.xs,
    },
    emptyExpensesSubtext: {
        ...theme.typography.bodyM,
        color: theme.colors.textSecondary,
    },
    expenseCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    expenseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: theme.spacing.sm,
    },
    expenseCategory: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
    },
    categoryIcon: {
        fontSize: 24,
    },
    expenseDescription: {
        ...theme.typography.bodyM,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    expenseDate: {
        ...theme.typography.captionM,
        borderRadius: 4,
        marginTop: 2,
    },
    expenseDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: theme.spacing.sm,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    expenseDetailText: {
        ...theme.typography.captionM,
        color: theme.colors.textSecondary,
    },
    expenseDetailBold: {
        color: theme.colors.textPrimary,
        fontWeight: '600',
    },
    settlementSection: {
        marginTop: theme.spacing.lg,
        marginBottom: theme.spacing.md,
    },
    settlementTitle: {
        ...theme.typography.headingS,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.xs,
    },
    settlementSubtitle: {
        ...theme.typography.bodyM,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.md,
    },
    settlementCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    settlementFlow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.sm,
    },
    settlementPerson: {
        alignItems: 'center',
        flex: 1,
    },
    settlementPersonName: {
        ...theme.typography.bodyM,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    settlementLabel: {
        ...theme.typography.captionM,
        color: theme.colors.textSecondary,
    },
    settlementArrow: {
        alignItems: 'center',
        flex: 1,
    },
    settlementAmountBig: {
        ...theme.typography.headingS,
        color: theme.colors.primary,
    },
    settlementArrowIcon: {
        fontSize: 20,
        color: theme.colors.textSecondary,
    },
    markSettledButton: {
        backgroundColor: theme.colors.success,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.radius.md,
        alignItems: 'center',
    },
    markSettledText: {
        ...theme.typography.bodyS,
        fontWeight: '600',
        color: theme.colors.surface,
    },
    settlementItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    settlementName: {
        ...theme.typography.bodyM,
        color: theme.colors.textPrimary,
    },
    settlementAmount: {
        ...theme.typography.bodyM,
        fontWeight: '600',
    },
    addExpenseButton: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        backgroundColor: theme.colors.textPrimary,
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.radius.full,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    addExpenseButtonText: {
        ...theme.typography.bodyL,
        fontWeight: '600',
        color: theme.colors.surface,
    },
    joinContainer: {
        flex: 1,
        padding: theme.spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    joinInfoCard: {
        width: '100%',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.lg,
        borderRadius: theme.radius.lg,
        marginBottom: theme.spacing.xl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    joinTitle: {
        ...theme.typography.headingM,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.md,
        textAlign: 'center',
    },
    joinRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.sm,
    },
    joinLabel: {
        ...theme.typography.bodyM,
        color: theme.colors.textSecondary,
    },
    joinValue: {
        ...theme.typography.bodyM,
        fontWeight: '600',
        color: theme.colors.textPrimary,
    },
    joinButton: {
        width: '100%',
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.radius.lg,
        alignItems: 'center',
    },
    joinButtonDisabled: {
        backgroundColor: theme.colors.gray400,
    },
    joinButtonText: {
        ...theme.typography.button,
        color: theme.colors.white,
    },
    summaryAmount: {
        ...theme.typography.bodyM,
        fontWeight: '700',
        color: theme.colors.textPrimary,
    },
    positiveBalance: {
        color: theme.colors.success,
    },
    negativeBalance: {
        color: theme.colors.error,
    },
    expenseAmountContainer: {
        alignItems: 'flex-end',
    },
    expenseAmount: {
        ...theme.typography.bodyL,
        fontWeight: '700',
        color: theme.colors.textPrimary,
    },
    youPaidBadge: {
        fontSize: 10,
        fontWeight: '600',
        color: theme.colors.primary,
        backgroundColor: theme.colors.primaryLight,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 2,
    },
});
