import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
  Animated
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Image as ImageIcon, Type, X, Utensils, Lightbulb, Scan, AlertTriangle, CheckCircle, AlertCircle, HelpCircle, Camera, Upload, Sparkles } from 'lucide-react-native';
import { router } from 'expo-router';
import api from '@/assets/api';

const { width } = Dimensions.get('window');

const ScanFoodScreen = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState('image'); // 'image' or 'text'
  const [foodName, setFoodName] = useState('');
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanAnimation] = useState(new Animated.Value(0));

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert("Permission required", "We need access to your photos to select images");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
      setResult(null);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert("Permission required", "We need access to your camera to take photos");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
      setResult(null);
    }
  };

  const startScanAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnimation, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopScanAnimation = () => {
    scanAnimation.stopAnimation();
    scanAnimation.setValue(0);
  };

  const submitScan = async () => {
    if ((activeTab === 'image' && !image) || (activeTab === 'text' && !foodName.trim())) {
      Alert.alert("Missing Input", activeTab === 'image' 
        ? "Please select an image or take a photo" 
        : "Please enter food name");
      return;
    }

    const formData = new FormData();
    if (activeTab === 'text') {
      formData.append("food_name", foodName);
    } else {
      formData.append("food_image", {
        uri: image.uri,
        name: "food.jpg",
        type: "image/jpeg",
      });
    }

    try {
      setLoading(true);
      startScanAnimation();
      
      const response = await api.post("/scan-food/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      setResult(response.data);
      
      // Success feedback
      Alert.alert(
        "Analysis Complete! ✅", 
        `Food analyzed successfully. ${response.data.risk_level === 'high' ? '⚠️ High risk detected!' : 'Results are ready to view.'}`
      );
    } catch (error) {
      console.error(error);
      Alert.alert("Analysis Failed", "Could not analyze food. Please try again or check your connection.");
    } finally {
      setLoading(false);
      stopScanAnimation();
    }
  };

  const getRiskColor = (riskLevel) => {
    if (!riskLevel) return '#6b7280';
    const lower = riskLevel.toLowerCase();
    if (lower.includes('high')) return '#ef4444';
    if (lower.includes('medium')) return '#f59e0b';
    if (lower.includes('low')) return '#10b981';
    if (lower.includes('no') || lower.includes('safe')) return '#10b981';
    return '#6b7280';
  };

  const getRiskIcon = (riskLevel) => {
    if (!riskLevel) return <HelpCircle size={20} color="#6b7280" />;
    const lower = riskLevel.toLowerCase();
    if (lower.includes('high')) return <AlertCircle size={20} color="#ef4444" />;
    if (lower.includes('medium')) return <AlertTriangle size={20} color="#f59e0b" />;
    if (lower.includes('low') || lower.includes('no') || lower.includes('safe')) return <CheckCircle size={20} color="#10b981" />;
    return <HelpCircle size={20} color="#6b7280" />;
  };

  const formatRiskText = (riskLevel) => {
    if (!riskLevel) return 'Unknown Risk';
    if (riskLevel.includes('there are no allergy')) return 'No Allergens Detected ✅';
    return riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Sparkles size={24} color="#F59E0B" />
          <Text style={styles.headerTitle}>AI Food Scanner</Text>
        </View>
        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'image' && styles.activeTab
          ]}
          onPress={() => setActiveTab('image')}
        >
          <ImageIcon 
            size={20} 
            color={activeTab === 'image' ? '#a855f7' : '#6b7280'} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'image' && styles.activeTabText
          ]}>
            Image Scan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'text' && styles.activeTab
          ]}
          onPress={() => setActiveTab('text')}
        >
          <Type 
            size={20} 
            color={activeTab === 'text' ? '#a855f7' : '#6b7280'} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'text' && styles.activeTabText
          ]}>
            Text Input
          </Text>
        </TouchableOpacity>
      </View>

      {/* Image Tab Content */}
      {activeTab === 'image' && (
        <View style={styles.tabContent}>
          <View style={styles.imageButtonsContainer}>
            <TouchableOpacity style={styles.imageActionButton} onPress={takePhoto}>
              <Camera size={24} color="#10b981" />
              <Text style={[styles.imageActionButtonText, { color: '#10b981' }]}>
                Take Photo
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.imageActionButton} onPress={pickImage}>
              <Upload size={24} color="#3b82f6" />
              <Text style={[styles.imageActionButtonText, { color: '#3b82f6' }]}>
                Choose from Gallery
              </Text>
            </TouchableOpacity>
          </View>

          {image && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: image.uri }} style={styles.imagePreview} />
              <TouchableOpacity 
                style={styles.removeImageButton} 
                onPress={() => setImage(null)}
              >
                <X size={20} color="white" />
              </TouchableOpacity>
              
              {loading && (
                <Animated.View 
                  style={[
                    styles.scanningOverlay,
                    {
                      opacity: scanAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 0.8],
                      }),
                    }
                  ]}
                >
                  <View style={styles.scanningIndicator}>
                    <Sparkles size={32} color="#F59E0B" />
                    <Text style={styles.scanningText}>Analyzing...</Text>
                  </View>
                </Animated.View>
              )}
            </View>
          )}
        </View>
      )}

      {/* Text Tab Content */}
      {activeTab === 'text' && (
        <View style={styles.tabContent}>
          <View style={styles.inputContainer}>
            <View style={styles.inputLabelContainer}>
              <Utensils size={20} color="#6b7280" />
              <Text style={styles.inputLabel}>DESCRIBE YOUR MEAL</Text>
            </View>
            <TextInput
              style={styles.inputField}
              placeholder="e.g., Peanut butter sandwich with whole wheat bread, or Chicken curry with rice and vegetables"
              placeholderTextColor="#4b5563"
              value={foodName}
              onChangeText={setFoodName}
              multiline
            />
          </View>
          <View style={styles.inputHint}>
            <Lightbulb size={14} color="#f59e0b" />
            <Text style={styles.inputHintText}>
              Be as detailed as possible for better analysis
            </Text>
          </View>
        </View>
      )}

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          styles.scanButton,
          ((activeTab === 'image' && !image) || 
           (activeTab === 'text' && !foodName.trim()) || 
           loading) && styles.scanButtonDisabled
        ]}
        onPress={submitScan}
        disabled={
          (activeTab === 'image' && !image) || 
          (activeTab === 'text' && !foodName.trim()) || 
          loading
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="white" />
            <Text style={styles.scanButtonText}>Analyzing with AI...</Text>
          </View>
        ) : (
          <View style={styles.scanButtonContent}>
            <Scan size={24} color="white" />
            <Text style={styles.scanButtonText}>
              {activeTab === 'image' ? 'Analyze Image' : 'Analyze Description'}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Results Section */}
      {result && (
        <View style={styles.resultsSection}>
          <View style={styles.resultHeader}>
            <Sparkles size={24} color="#10b981" />
            <Text style={styles.resultTitle}>Analysis Results</Text>
          </View>

          {/* Food Name Card */}
          <View style={styles.resultCard}>
            <View style={styles.resultCardHeader}>
              <Utensils size={20} color="#3b82f6" />
              <Text style={styles.resultCardTitle}>IDENTIFIED FOOD</Text>
            </View>
            <Text style={styles.foodName}>{result.food_name || 'Unknown Food'}</Text>
          </View>

          {/* Risk Level Card */}
          <View style={[styles.resultCard, { borderLeftColor: getRiskColor(result.risk_level) }]}>
            <View style={styles.resultCardHeader}>
              {getRiskIcon(result.risk_level)}
              <Text style={styles.resultCardTitle}>SAFETY ASSESSMENT</Text>
            </View>
            <View style={styles.riskContainer}>
              <Text style={[styles.riskLevel, { color: getRiskColor(result.risk_level) }]}>
                {formatRiskText(result.risk_level)}
              </Text>
              {result.confidence && (
                <View style={styles.confidenceContainer}>
                  <Text style={styles.confidenceLabel}>Confidence: </Text>
                  <Text style={styles.confidenceValue}>
                    {Math.round(result.confidence * 100)}%
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Allergens Card */}
          {result.detected_allergen && !result.risk_level?.includes('no allergy') && (
            <View style={styles.resultCard}>
              <View style={styles.resultCardHeader}>
                <AlertTriangle size={20} color="#f59e0b" />
                <Text style={styles.resultCardTitle}>DETECTED ALLERGENS</Text>
              </View>
              <View style={styles.allergensContainer}>
                {result.detected_allergen.split(', ').map((allergen, index) => (
                  <View key={index} style={styles.allergenTag}>
                    <AlertTriangle size={16} color="#ef4444" />
                    <Text style={styles.allergenText}>{allergen.trim()}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Recommendations Card */}
          <View style={[styles.resultCard, { backgroundColor: '#f0f9ff' }]}>
            <View style={styles.resultCardHeader}>
              <Lightbulb size={20} color="#0ea5e9" />
              <Text style={styles.resultCardTitle}>RECOMMENDATIONS</Text>
            </View>
            <Text style={styles.recommendationText}>
              {result.risk_level?.includes('high') 
                ? "⚠️ Avoid this food due to high allergy risk. Consult your doctor if you've already consumed it."
                : result.risk_level?.includes('medium')
                ? "⚡ Exercise caution. Monitor for any allergic reactions."
                : "✅ This food appears safe based on your allergy profile. Enjoy your meal!"
              }
            </Text>
          </View>
        </View>
      )}

      {/* Tips Section */}
      <View style={styles.tipsSection}>
        <Text style={styles.tipsTitle}>
          {activeTab === 'image' ? '📸 Photo Tips' : '📝 Description Tips'}
        </Text>
        <View style={styles.tipsList}>
          {activeTab === 'image' ? (
            <>
              <Text style={styles.tipItem}>• Use clear, well-lit food photos</Text>
              <Text style={styles.tipItem}>• Capture the entire dish from above</Text>
              <Text style={styles.tipItem}>• Avoid blurry or dark images</Text>
              <Text style={styles.tipItem}>• Include all visible ingredients</Text>
            </>
          ) : (
            <>
              <Text style={styles.tipItem}>• List all ingredients you know</Text>
              <Text style={styles.tipItem}>• Mention cooking methods (fried, baked, etc.)</Text>
              <Text style={styles.tipItem}>• Include sauces and seasonings</Text>
              <Text style={styles.tipItem}>• Specify brands if relevant</Text>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f14',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  headerRightPlaceholder: {
    width: 44,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#111827',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#a855f7',
  },
  tabContent: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  imageActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f2937',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    gap: 8,
  },
  imageActionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainer: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
    textTransform: 'uppercase',
    marginLeft: 8,
  },
  inputField: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    padding: 0,
    marginTop: 4,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 8,
    gap: 6,
  },
  inputHintText: {
    color: '#f59e0b',
    fontSize: 12,
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 250,
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0076D6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanningIndicator: {
    alignItems: 'center',
    gap: 12,
  },
  scanningText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  scanButton: {
    backgroundColor: '#a855f7',
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 24,
    marginBottom: 24,
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  scanButtonDisabled: {
    opacity: 0.5,
  },
  scanButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  resultsSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  resultCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#374151',
  },
  resultCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  resultCardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  foodName: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  riskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  riskLevel: {
    fontSize: 16,
    fontWeight: '700',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  allergensContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergenTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    gap: 4,
  },
  allergenText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
  },
  recommendationText: {
    fontSize: 14,
    color: '#0369a1',
    lineHeight: 20,
  },
  tipsSection: {
    paddingHorizontal: 24,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 12,
  },
  tipsList: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
  },
  tipItem: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
    marginBottom: 4,
  },
});

export default ScanFoodScreen;