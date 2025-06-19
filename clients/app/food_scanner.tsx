import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import CameraScanner from '@/components/CameraScanner';

const { width, height } = Dimensions.get('window');

interface ScanResult {
  id: number;
  user: number;
  food_name: string;
  food_image: string;
  detected_allergen: string;
  confidence: number;
  risk_level: 'low' | 'medium' | 'high';
  created_at: string;
}

export default function FoodScanScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [uploadUri, setUploadUri] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(true);

  // Handle image from camera
  useEffect(() => {
    if (uploadUri) {
      setSelectedImage(uploadUri);
      setShowCamera(false); // Hide camera after capturing
      setShowResult(false);
      setScanResult(null);
    }
  }, [uploadUri]);

  // Mock function to simulate API call
  const analyzeFoodImage = async (imageUri: string): Promise<ScanResult> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: Math.floor(Math.random() * 1000),
          user: 1,
          food_name: "Chicken Caesar Salad",
          food_image: imageUri,
          detected_allergen: "Dairy, Eggs, Gluten",
          confidence: 0.87,
          risk_level: "medium",
          created_at: new Date().toISOString(),
        });
      }, 3000);
    });
  };

  const handleImageCapture = () => {
    // Show camera for capturing new image
    setShowCamera(true);
    setSelectedImage(null);
    setShowResult(false);
    setScanResult(null);
  };

  const handleScanFood = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please capture or select an image first');
      return;
    }

    setIsScanning(true);
    setShowResult(false);

    try {
      const result = await analyzeFoodImage(selectedImage);
      setScanResult(result);
      setShowResult(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze food. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleNewScan = () => {
    setSelectedImage(null);
    setScanResult(null);
    setShowResult(false);
    setShowCamera(true);
    setUploadUri(null);
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'check-circle';
      case 'medium': return 'warning';
      case 'high': return 'dangerous';
      default: return 'help';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (showCamera) {
    return (
      <View style={styles.container}>
        {/* Header for camera view */}
        <View style={styles.cameraHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Capture Food</Text>
          <View style={styles.placeholder} />
        </View>
        
        {/* Embedded Camera */}
        <View style={styles.cameraContainer}>
          <CameraScanner setUploadUri={setUploadUri} />
        </View>
        
        {/* Camera instructions */}
        <View style={styles.cameraInstructions}>
          <Text style={styles.instructionsTitle}>Position your food in the frame</Text>
          <Text style={styles.instructionsText}>Make sure the food is well-lit and clearly visible</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Food Scanner</Text>
        <TouchableOpacity style={styles.historyButton}>
          <MaterialIcons name="history" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Camera/Upload Section */}
      <View style={styles.cameraSection}>
        {selectedImage ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: selectedImage }} style={styles.capturedImage} />
            <TouchableOpacity style={styles.retakeButton} onPress={handleNewScan}>
              <MaterialIcons name="refresh" size={20} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.cameraPlaceholder} onPress={handleImageCapture}>
            <View style={styles.cameraIcon}>
              <MaterialIcons name="camera-alt" size={48} color="#a855f7" />
            </View>
            <Text style={styles.cameraText}>Tap to capture food</Text>
            <Text style={styles.cameraSubtext}>or upload from gallery</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.galleryButton} onPress={handleImageCapture}>
          <MaterialIcons name="photo-library" size={24} color="#a855f7" />
          <Text style={styles.galleryButtonText}>Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.scanButton,
            (!selectedImage || isScanning) && styles.scanButtonDisabled
          ]}
          onPress={handleScanFood}
          disabled={!selectedImage || isScanning}
        >
          {isScanning ? (
            <View style={styles.scanningContainer}>
              <ActivityIndicator size="small" color="white" />
              <Text style={styles.scanButtonText}>Analyzing...</Text>
            </View>
          ) : (
            <>
              <MaterialIcons name="scanner" size={24} color="white" />
              <Text style={styles.scanButtonText}>Scan Food</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Scanning Progress */}
      {isScanning && (
        <View style={styles.scanningProgress}>
          <View style={styles.progressCard}>
            <View style={styles.progressIcon}>
              <MaterialIcons name="psychology" size={32} color="#a855f7" />
            </View>
            <Text style={styles.progressTitle}>AI is analyzing your food...</Text>
            <Text style={styles.progressSubtitle}>Detecting allergens and ingredients</Text>
            <View style={styles.progressBar}>
              <View style={styles.progressBarFill} />
            </View>
          </View>
        </View>
      )}

      {/* Results Section */}
      {showResult && scanResult && (
        <View style={styles.resultsSection}>
          <View style={styles.resultHeader}>
            <MaterialIcons name="science" size={24} color="#10b981" />
            <Text style={styles.resultTitle}>Analysis Complete</Text>
          </View>

          {/* Food Name */}
          <View style={styles.resultCard}>
            <View style={styles.resultCardHeader}>
              <MaterialIcons name="restaurant" size={20} color="#3b82f6" />
              <Text style={styles.resultCardTitle}>Detected Food</Text>
            </View>
            <Text style={styles.foodName}>{scanResult.food_name}</Text>
          </View>

          {/* Risk Level */}
          <View style={[styles.resultCard, { borderLeftColor: getRiskColor(scanResult.risk_level) }]}>
            <View style={styles.resultCardHeader}>
              <MaterialIcons 
                name={getRiskIcon(scanResult.risk_level)} 
                size={20} 
                color={getRiskColor(scanResult.risk_level)} 
              />
              <Text style={styles.resultCardTitle}>Risk Level</Text>
            </View>
            <View style={styles.riskContainer}>
              <Text style={[styles.riskLevel, { color: getRiskColor(scanResult.risk_level) }]}>
                {scanResult.risk_level.toUpperCase()}
              </Text>
              <View style={styles.confidenceContainer}>
                <Text style={styles.confidenceLabel}>Confidence: </Text>
                <Text style={styles.confidenceValue}>
                  {Math.round(scanResult.confidence * 100)}%
                </Text>
              </View>
            </View>
          </View>

          {/* Allergens */}
          <View style={styles.resultCard}>
            <View style={styles.resultCardHeader}>
              <MaterialIcons name="warning" size={20} color="#f59e0b" />
              <Text style={styles.resultCardTitle}>Detected Allergens</Text>
            </View>
            <View style={styles.allergensContainer}>
              {scanResult.detected_allergen.split(', ').map((allergen, index) => (
                <View key={index} style={styles.allergenTag}>
                  <MaterialIcons name="report-problem" size={16} color="#ef4444" />
                  <Text style={styles.allergenText}>{allergen.trim()}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Timestamp */}
          <View style={styles.timestampCard}>
            <MaterialIcons name="schedule" size={16} color="#6b7280" />
            <Text style={styles.timestampText}>
              Scanned on {formatDate(scanResult.created_at)}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.resultActions}>
            <TouchableOpacity style={styles.saveButton}>
              <MaterialIcons name="bookmark" size={20} color="white" />
              <Text style={styles.saveButtonText}>Save Result</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.shareButton}>
              <MaterialIcons name="share" size={20} color="#a855f7" />
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Tips Section */}
      <View style={styles.tipsSection}>
        <Text style={styles.tipsTitle}>📸 Scanning Tips</Text>
        <View style={styles.tipsList}>
          <Text style={styles.tipItem}>• Ensure good lighting for better results</Text>
          <Text style={styles.tipItem}>• Capture the entire food item</Text>
          <Text style={styles.tipItem}>• Keep the camera steady</Text>
          <Text style={styles.tipItem}>• Avoid blurry or dark images</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f14',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  // Camera-specific styles
  cameraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#0f0f14',
    zIndex: 10,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraInstructions: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 10,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  placeholder: {
    width: 44,
    height: 44,
  },
  // Existing styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  historyButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  cameraPlaceholder: {
    height: 300,
    borderRadius: 20,
    backgroundColor: '#1f2937',
    borderWidth: 2,
    borderColor: '#374151',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cameraText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  cameraSubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
  },
  capturedImage: {
    width: '100%',
    height: 300,
    borderRadius: 20,
  },
  retakeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 15,
    marginBottom: 30,
  },
  galleryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f2937',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#a855f7',
    gap: 8,
  },
  galleryButtonText: {
    color: '#a855f7',
    fontSize: 16,
    fontWeight: '600',
  },
  scanButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#a855f7',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  scanButtonDisabled: {
    opacity: 0.5,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  scanningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scanningProgress: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  progressCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  progressIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 20,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '60%',
    height: '100%',
    backgroundColor: '#a855f7',
  },
  resultsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
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
    fontSize: 14,
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
  timestampCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  timestampText: {
    fontSize: 12,
    color: '#6b7280',
  },
  resultActions: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#a855f7',
    gap: 8,
  },
  shareButtonText: {
    color: '#a855f7',
    fontSize: 14,
    fontWeight: '600',
  },
  tipsSection: {
    paddingHorizontal: 20,
    marginTop: 20,
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