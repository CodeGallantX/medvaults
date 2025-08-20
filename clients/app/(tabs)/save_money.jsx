import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
  Linking,
  Animated
} from 'react-native';
import { Wallet, RefreshCcw, EyeOff, Eye, ArrowDown, ArrowUp, Info, X, TrendingUp, DollarSign, CreditCard } from 'lucide-react-native';
import api from '../../assets/api';

const WalletScreen = () => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [balanceVisible, setBalanceVisible] = useState(false);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [balanceAnimation] = useState(new Animated.Value(0));
  
  // Deposit states
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositPin, setDepositPin] = useState('');
  const [isProcessingDeposit, setIsProcessingDeposit] = useState(false);

  // Withdraw states
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawPin, setWithdrawPin] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [description, setDescription] = useState('');
  const [isProcessingWithdraw, setIsProcessingWithdraw] = useState(false);

  useEffect(() => {
    fetchWallet();
  }, []);

  useEffect(() => {
    // Balance reveal animation
    Animated.timing(balanceAnimation, {
      toValue: balanceVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [balanceVisible]);

  const fetchWallet = async () => {
    try {
      setRefreshing(true);
      const res = await api.get('/wallet/wallet/');
      setWallet(res.data);
      fetchTransactions();
    } catch (err) {
      console.log('Error fetching wallet:', err);
      Alert.alert('Error', 'Failed to load wallet data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/wallet/transactions_list/');
      setTransactions(res.data);
    } catch (err) {
      console.log('Error fetching transactions:', err);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || isNaN(depositAmount) || !depositPin) {
      Alert.alert('Error', 'Please enter valid amount and PIN');
      return;
    }

    if (parseFloat(depositAmount) < 100) {
      Alert.alert('Minimum Amount', 'Minimum deposit amount is ₦100');
      return;
    }

    setIsProcessingDeposit(true);
    try {
      const response = await api.post('/wallet/deposit_money/', {
        pin: Number(depositPin),
        amount: Number(depositAmount)
      });

      if (response.data?.authorization_url) {
        const supported = await Linking.canOpenURL(response.data.authorization_url);
        if (supported) {
          await Linking.openURL(response.data.authorization_url);
          Alert.alert(
            'Payment Initialized', 
            'Please complete the payment in your browser',
            [
              { 
                text: 'OK', 
                onPress: () => {
                  setDepositModalVisible(false);
                  fetchWallet();
                }
              }
            ]
          );
        } else {
          Alert.alert('Error', 'Unable to open payment link');
        }
      }
    } catch (err) {
      if (err.response?.data?.detail === 'Invalid PIN.') {
        Alert.alert('Invalid PIN', 'The PIN you entered is incorrect');
      } 
      else if (err.response?.data?.detail === 'You can only deposit once a week. Please try again later.') {
        Alert.alert(
          'Weekly Limit Reached',
          'You can only make one deposit per week. Please try again later.'
        );
      }
      else if (err.response?.data?.detail === 'PIN needed.') {
        Alert.alert('PIN Required', 'Please enter your 4-digit PIN');
      }
      else {
        Alert.alert(
          'Deposit Failed', 
          err.response?.data?.message || 'An error occurred while processing your deposit'
        );
      }
    } finally {
      setIsProcessingDeposit(false);
      setDepositAmount('');
      setDepositPin('');
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || isNaN(withdrawAmount) || !withdrawPin || 
        !bankName || !accountNumber || !accountName) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    if (parseFloat(withdrawAmount) < 500) {
      Alert.alert('Minimum Amount', 'Minimum withdrawal amount is ₦500');
      return;
    }

    setIsProcessingWithdraw(true);
    try {
      const response = await api.post('/wallet/withdraw_money/', {
        pin: Number(withdrawPin),
        amount: Number(withdrawAmount),
        bank_name: bankName,
        account_number: accountNumber,
        account_name: accountName,
        description: description || 'Withdrawal'
      });

      Alert.alert(
        'Success', 
        `₦${withdrawAmount} withdrawal initiated successfully. Your transfer is being processed.`,
        [
          { 
            text: 'OK', 
            onPress: () => {
              setWithdrawModalVisible(false);
              fetchWallet();
            }
          }
        ]
      );
    } catch (err) {
      if (err.response?.data?.detail === 'Invalid PIN.') {
        Alert.alert('Invalid PIN', 'The PIN you entered is incorrect');
      } 
      else if (err.response?.data?.detail === 'Insufficient balance.') {
        Alert.alert(
          'Insufficient Balance',
          'You do not have enough funds to complete this withdrawal'
        );
      }
      else if (err.response?.data?.detail?.includes('bank_name, account_number')) {
        Alert.alert(
          'Bank Details Required',
          'Please provide all bank account details'
        );
      }
      else {
        Alert.alert(
          'Withdrawal Failed', 
          err.response?.data?.detail || 'An error occurred while processing your withdrawal'
        );
      }
    } finally {
      setIsProcessingWithdraw(false);
      setWithdrawAmount('');
      setWithdrawPin('');
      setBankName('');
      setAccountNumber('');
      setAccountName('');
      setDescription('');
    }
  };

  const toggleBalanceVisibility = () => {
    setBalanceVisible(!balanceVisible);
  };

  const groupTransactionsByMonth = (transactions) => {
    const sorted = [...transactions].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    const grouped = sorted.reduce((acc, tx) => {
      const date = new Date(tx.created_at);
      const month = date.toLocaleString('default', {
        month: 'long',
        year: 'numeric',
      });

      if (!acc[month]) acc[month] = [];
      acc[month].push(tx);
      return acc;
    }, {});

    return Object.keys(grouped).map((month) => ({
      month,
      data: grouped[month],
    }));
  };

  const getTransactionStats = () => {
    const totalDeposits = transactions
      .filter(tx => tx.transaction_type === 'credit' && tx.status === 'success')
      .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
    
    const totalWithdrawals = transactions
      .filter(tx => tx.transaction_type === 'debit' && tx.status === 'success')
      .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

    return { totalDeposits, totalWithdrawals };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#a855f7" />
        <Text style={styles.loadingText}>Loading wallet...</Text>
      </View>
    );
  }

  if (!wallet) {
    return (
      <View style={styles.emptyWalletContainer}>
        <Wallet size={48} color="#6b7280" />
        <Text style={styles.emptyWalletText}>No wallet found</Text>
      </View>
    );
  }

  const displayedTransactions = showFullHistory 
    ? groupTransactionsByMonth(transactions) 
    : groupTransactionsByMonth(transactions).slice(0, 2);

  const { totalDeposits, totalWithdrawals } = getTransactionStats();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Wallet</Text>
          <Text style={styles.headerSubtitle}>Account: {wallet.wallet_name}</Text>
        </View>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={fetchWallet}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color="#a855f7" />
          ) : (
            <RefreshCcw size={20} color="#a855f7" />
          )}
        </TouchableOpacity>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <TouchableOpacity onPress={toggleBalanceVisibility}>
            {balanceVisible ? (
              <EyeOff size={20} color="#9ca3af" />
            ) : (
              <Eye size={20} color="#9ca3af" />
            )}
          </TouchableOpacity>
        </View>
        
        <Animated.View style={{ opacity: balanceAnimation }}>
          {balanceVisible ? (
            <Text style={styles.balanceAmount}>₦{parseFloat(wallet.user_balance).toLocaleString()}</Text>
          ) : (
            <View style={styles.hiddenBalance}>
              <Text style={styles.balanceAmount}>••••••</Text>
            </View>
          )}
        </Animated.View>
        
        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <TrendingUp size={16} color="#10b981" />
            <Text style={styles.statLabel}>Total In</Text>
            <Text style={styles.statValue}>₦{totalDeposits.toLocaleString()}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ArrowUp size={16} color="#ef4444" />
            <Text style={styles.statLabel}>Total Out</Text>
            <Text style={styles.statValue}>₦{totalWithdrawals.toLocaleString()}</Text>
          </View>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.depositButton]}
            onPress={() => setDepositModalVisible(true)}
          >
            <ArrowDown size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Deposit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.withdrawButton]}
            onPress={() => setWithdrawModalVisible(true)}
          >
            <ArrowUp size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Withdraw</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Transactions */}
      <ScrollView style={styles.transactionsContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          <TouchableOpacity onPress={() => setShowFullHistory(!showFullHistory)}>
            <Text style={styles.viewAllText}>
              {showFullHistory ? 'Show Less' : 'View All'}
            </Text>
          </TouchableOpacity>
        </View>

        {transactions.length > 0 ? (
          <FlatList
            scrollEnabled={false}
            data={displayedTransactions}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.monthSection}>
                <Text style={styles.monthHeader}>{item.month}</Text>
                {item.data.map((tx) => (
                  <View key={tx.id} style={[
                    styles.transactionCard,
                    tx.transaction_type === 'credit' ? styles.creditCard : styles.debitCard
                  ]}>
                    <View style={styles.transactionHeader}>
                      <View style={[
                        styles.transactionIconContainer,
                        { backgroundColor: tx.transaction_type === 'credit' ? '#d1fae5' : '#fee2e2' }
                      ]}>
                        {tx.transaction_type === 'credit' ? (
                          <ArrowDown size={16} color="#10b981" />
                        ) : (
                          <ArrowUp size={16} color="#ef4444" />
                        )}
                      </View>
                      <View style={styles.transactionInfo}>
                        <Text style={styles.transactionType}>
                          {tx.transaction_type === 'credit' ? 'Deposit' : 'Withdrawal'}
                        </Text>
                        <Text style={styles.transactionDate}>
                          {new Date(tx.created_at).toLocaleDateString()}
                        </Text>
                        {tx.description && (
                          <Text style={styles.transactionDescription}>
                            {tx.description}
                          </Text>
                        )}
                        <View style={styles.statusContainer}>
                          <View style={[
                            styles.statusBadge,
                            { backgroundColor: tx.status === 'success' ? '#d1fae5' : '#fef3c7' }
                          ]}>
                            <Text style={[
                              styles.statusText,
                              { color: tx.status === 'success' ? '#10b981' : '#f59e0b' }
                            ]}>
                              {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    <Text style={[
                      styles.transactionAmount,
                      tx.transaction_type === 'credit' ? styles.creditAmount : styles.debitAmount
                    ]}>
                      {tx.transaction_type === 'credit' ? '+' : '-'}₦{parseFloat(tx.amount).toLocaleString()}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          />
        ) : (
          <View style={styles.emptyState}>
            <Info size={24} color="#6b7280" />
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        )}
      </ScrollView>

      {/* Enhanced Deposit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={depositModalVisible}
        onRequestClose={() => setDepositModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <DollarSign size={24} color="#10b981" />
              </View>
              <Text style={styles.modalTitle}>Deposit Funds</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setDepositModalVisible(false)}
              >
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalInputContainer}>
              <Text style={styles.modalInputLabel}>Amount (₦)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Minimum ₦100"
                placeholderTextColor="#6b7280"
                keyboardType="numeric"
                value={depositAmount}
                onChangeText={setDepositAmount}
              />
            </View>

            <View style={styles.modalInputContainer}>
              <Text style={styles.modalInputLabel}>PIN</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter your 4-digit PIN"
                placeholderTextColor="#6b7280"
                keyboardType="numeric"
                secureTextEntry
                maxLength={4}
                value={depositPin}
                onChangeText={setDepositPin}
              />
            </View>

            <View style={styles.infoBox}>
              <Info size={16} color="#3b82f6" />
              <Text style={styles.infoText}>
                You can only deposit once per week. Minimum amount is ₦100.
              </Text>
            </View>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.depositButton]}
              onPress={handleDeposit}
              disabled={isProcessingDeposit}
            >
              {isProcessingDeposit ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.modalButtonText}>Proceed to Payment</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Enhanced Withdraw Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={withdrawModalVisible}
        onRequestClose={() => setWithdrawModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { paddingBottom: 30 }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <CreditCard size={24} color="#ef4444" />
              </View>
              <Text style={styles.modalTitle}>Withdraw Funds</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setWithdrawModalVisible(false)}
              >
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalInputContainer}>
                <Text style={styles.modalInputLabel}>Amount (₦)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Minimum ₦500"
                  placeholderTextColor="#6b7280"
                  keyboardType="numeric"
                  value={withdrawAmount}
                  onChangeText={setWithdrawAmount}
                />
              </View>

              <View style={styles.modalInputContainer}>
                <Text style={styles.modalInputLabel}>Bank Name</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. First Bank"
                  placeholderTextColor="#6b7280"
                  value={bankName}
                  onChangeText={setBankName}
                />
              </View>

              <View style={styles.modalInputContainer}>
                <Text style={styles.modalInputLabel}>Account Number</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="0123456789"
                  placeholderTextColor="#6b7280"
                  keyboardType="numeric"
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                />
              </View>

              <View style={styles.modalInputContainer}>
                <Text style={styles.modalInputLabel}>Account Name</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="John Doe"
                  placeholderTextColor="#6b7280"
                  value={accountName}
                  onChangeText={setAccountName}
                />
              </View>

              <View style={styles.modalInputContainer}>
                <Text style={styles.modalInputLabel}>Description (Optional)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. For medical bills"
                  placeholderTextColor="#6b7280"
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              <View style={styles.modalInputContainer}>
                <Text style={styles.modalInputLabel}>PIN</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter your 4-digit PIN"
                  placeholderTextColor="#6b7280"
                  keyboardType="numeric"
                  secureTextEntry
                  maxLength={4}
                  value={withdrawPin}
                  onChangeText={setWithdrawPin}
                />
              </View>

              <View style={styles.infoBox}>
                <Info size={16} color="#f59e0b" />
                <Text style={styles.infoText}>
                  Minimum withdrawal is ₦500. Processing may take 1-3 business days.
                </Text>
              </View>
            </ScrollView>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.withdrawButton]}
              onPress={handleWithdraw}
              disabled={isProcessingWithdraw}
            >
              {isProcessingWithdraw ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.modalButtonText}>Withdraw Funds</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f14',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f14',
  },
  loadingText: {
    color: '#b9b9e3',
    marginTop: 16,
  },
  emptyWalletContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f14',
  },
  emptyWalletText: {
    color: '#9ca3af',
    fontSize: 18,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#0f0f14',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    marginBottom: 16,
  },
  hiddenBalance: {
    height: 48,
    justifyContent: 'center',
    marginBottom: 16,
  },
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#374151',
    marginHorizontal: 16,
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
  },
  depositButton: {
    backgroundColor: '#10b981',
  },
  withdrawButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  transactionsContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  viewAllText: {
    color: '#a855f7',
    fontSize: 14,
    fontWeight: '600',
  },
  monthSection: {
    marginBottom: 16,
  },
  monthHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#b9b9e3',
    marginBottom: 12,
  },
  transactionCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  creditCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  debitCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  transactionDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  transactionDescription: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
    fontStyle: 'italic',
  },
  statusContainer: {
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
  },
  creditAmount: {
    color: '#10b981',
  },
  debitAmount: {
    color: '#ef4444',
  },
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#1f2937',
    borderRadius: 12,
  },
  emptyText: {
    color: '#9ca3af',
    marginLeft: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    flex: 1,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalInputContainer: {
    marginBottom: 16,
  },
  modalInputLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    color: 'white',
    fontSize: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#9ca3af',
    flex: 1,
    lineHeight: 16,
  },
  modalButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WalletScreen;