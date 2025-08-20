import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
  RefreshControl,
  Animated
} from 'react-native';
import { AlertTriangle, Clock, ArrowLeft, RefreshCcw, Info, CheckCircle, AlertCircle, HelpCircle, Filter, Search } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../../assets/api';

const ScanHistoryScreen = () => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState('all'); // 'all', 'high', 'medium', 'low', 'safe'
  const [fadeAnim] = useState(new Animated.Value(0));
  const navigation = useNavigation();

  useEffect(() => {
    fetchScanHistory();
  }, []);

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchScanHistory = async () => {
    try {
      const res = await api.get('/your_scan_history/');
      // Sort scans by created_at in descending order (newest first)
      const sortedScans = [...res.data].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      setScans(sortedScans);
    } catch (err) {
      console.error('Error fetching scan history:', err);
      Alert.alert('Error', 'Failed to load scan history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchScanHistory();
  };

  const getRiskLevelColor = (riskLevel) => {
    if (!riskLevel) return '#6b7280';
    const lowerCaseRisk = riskLevel.toLowerCase();
    if (lowerCaseRisk.includes('high')) return '#ef4444';
    if (lowerCaseRisk.includes('medium')) return '#f59e0b';
    if (lowerCaseRisk.includes('low')) return '#10b981';
    if (lowerCaseRisk.includes('no') || lowerCaseRisk.includes('safe')) return '#10b981';
    return '#6b7280';
  };

  const getRiskIcon = (riskLevel) => {
    if (!riskLevel) return <HelpCircle size={18} color="#6b7280" />;
    const lowerCaseRisk = riskLevel.toLowerCase();
    if (lowerCaseRisk.includes('high')) return <AlertCircle size={18} color="#ef4444" />;
    if (lowerCaseRisk.includes('medium')) return <AlertTriangle size={18} color="#f59e0b" />;
    if (lowerCaseRisk.includes('low') || lowerCaseRisk.includes('no') || lowerCaseRisk.includes('safe')) return <CheckCircle size={18} color="#10b981" />;
    return <HelpCircle size={18} color="#6b7280" />;
  };

  const formatRiskLevelText = (riskLevel) => {
    if (!riskLevel) return 'Unknown';
    if (riskLevel.includes('there are no allergy')) return 'Safe';
    return riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1);
  };

  const getFilteredScans = () => {
    if (filterType === 'all') return scans;
    
    return scans.filter(scan => {
      const risk = scan.risk_level?.toLowerCase() || '';
      switch (filterType) {
        case 'high':
          return risk.includes('high');
        case 'medium':
          return risk.includes('medium');
        case 'low':
          return risk.includes('low');
        case 'safe':
          return risk.includes('no') || risk.includes('safe');
        default:
          return true;
      }
    });
  };

  const getFilterStats = () => {
    const high = scans.filter(s => s.risk_level?.toLowerCase().includes('high')).length;
    const medium = scans.filter(s => s.risk_level?.toLowerCase().includes('medium')).length;
    const low = scans.filter(s => s.risk_level?.toLowerCase().includes('low')).length;
    const safe = scans.filter(s => s.risk_level?.toLowerCase().includes('no') || s.risk_level?.toLowerCase().includes('safe')).length;
    
    return { high, medium, low, safe, total: scans.length };
  };

  const renderScanItem = ({ item, index }) => (
    <Animated.View 
      style={[
        styles.scanCard,
        {
          opacity: fadeAnim,
          transform: [{
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }),
          }],
        }
      ]}
    >
      <View style={styles.scanHeader}>
        <View style={styles.scanTitleContainer}>
          <Text style={styles.scanFoodName}>{item.food_name}</Text>
          <View style={styles.scanMeta}>
            <Clock size={12} color="#6b7280" />
            <Text style={styles.scanTime}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View style={[
          styles.riskBadge, 
          { backgroundColor: getRiskLevelColor(item.risk_level) + '20' }
        ]}>
          {getRiskIcon(item.risk_level)}
          <Text style={[
            styles.riskBadgeText,
            { color: getRiskLevelColor(item.risk_level) }
          ]}>
            {formatRiskLevelText(item.risk_level)}
          </Text>
        </View>
      </View>

      {item.food_image && (
        <Image 
          source={{ uri: item.food_image }} 
          style={styles.foodImage}
          resizeMode="cover"
        />
      )}

      <View style={styles.scanDetails}>
        {item.detected_allergen && !item.risk_level?.includes('no allergy') && (
          <View style={styles.detailRow}>
            <AlertTriangle size={16} color="#ef4444" />
            <Text style={styles.detailText}>
              Allergen: {item.detected_allergen}
            </Text>
          </View>
        )}

        {item.confidence && (
          <View style={styles.detailRow}>
            <Info size={16} color="#3b82f6" />
            <Text style={styles.detailText}>
              Confidence: {Math.round(item.confidence * 100)}%
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );

  const FilterButton = ({ type, label, count, isActive, onPress }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        isActive && styles.filterButtonActive
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.filterButtonText,
        isActive && styles.filterButtonTextActive
      ]}>
        {label}
      </Text>
      {count > 0 && (
        <View style={[
          styles.filterBadge,
          isActive && styles.filterBadgeActive
        ]}>
          <Text style={[
            styles.filterBadgeText,
            isActive && styles.filterBadgeTextActive
          ]}>
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#a855f7" />
        <Text style={styles.loadingText}>Loading scan history...</Text>
      </View>
    );
  }

  const filteredScans = getFilteredScans();
  const stats = getFilterStats();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Scan History</Text>
          <Text style={styles.headerSubtitle}>{stats.total} total scans</Text>
        </View>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={onRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color="#a855f7" />
          ) : (
            <RefreshCcw size={20} color="#a855f7" />
          )}
        </TouchableOpacity>
      </View>

      {/* Filter Section */}
      <View style={styles.filterSection}>
        <View style={styles.filterHeader}>
          <Filter size={16} color="#9ca3af" />
          <Text style={styles.filterTitle}>Filter by Risk Level</Text>
        </View>
        <View style={styles.filterButtons}>
          <FilterButton
            type="all"
            label="All"
            count={stats.total}
            isActive={filterType === 'all'}
            onPress={() => setFilterType('all')}
          />
          <FilterButton
            type="safe"
            label="Safe"
            count={stats.safe}
            isActive={filterType === 'safe'}
            onPress={() => setFilterType('safe')}
          />
          <FilterButton
            type="low"
            label="Low"
            count={stats.low}
            isActive={filterType === 'low'}
            onPress={() => setFilterType('low')}
          />
          <FilterButton
            type="medium"
            label="Medium"
            count={stats.medium}
            isActive={filterType === 'medium'}
            onPress={() => setFilterType('medium')}
          />
          <FilterButton
            type="high"
            label="High"
            count={stats.high}
            isActive={filterType === 'high'}
            onPress={() => setFilterType('high')}
          />
        </View>
      </View>

      {/* Content */}
      <FlatList
        data={filteredScans}
        renderItem={renderScanItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#a855f7']}
            tintColor="#a855f7"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Search size={48} color="#6b7280" />
            <Text style={styles.emptyText}>
              {filterType === 'all' ? 'No scan history found' : `No ${filterType} risk scans found`}
            </Text>
            <Text style={styles.emptySubtext}>
              {filterType === 'all' 
                ? 'Scan some food to see your history here' 
                : 'Try adjusting your filter or scan more food'
              }
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#0f0f14',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterSection: {
    backgroundColor: '#1f2937',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: '#a855f7',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  filterBadge: {
    backgroundColor: '#4b5563',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#d1d5db',
  },
  filterBadgeTextActive: {
    color: '#ffffff',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  scanCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  scanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  scanTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  scanFoodName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  scanMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scanTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 4,
  },
  riskBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  foodImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#374151',
  },
  scanDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#9ca3af',
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default ScanHistoryScreen;