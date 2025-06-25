import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Alert,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import api from '@/assets/api'; // Ensure path is correct to your Axios instance

const QRCodeComponent = () => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQRCode();
  }, []);

  const fetchQRCode = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/get-qrcode/');
      if (response.data?.qr_image_url) {
        setQrData(response.data);
      } else {
        setError("No QR code available.");
      }
    } catch (err) {
      console.error("API Error:", err);
      setError("Failed to fetch QR code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveQRCode = async () => {
    if (!qrData?.qr_image_url) return;

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Required", "Allow access to save the QR code.");
        return;
      }

      const localUri = FileSystem.documentDirectory + 'qr_code.png';
      const downloadRes = await FileSystem.downloadAsync(qrData.qr_image_url, localUri);

      await MediaLibrary.saveToLibraryAsync(downloadRes.uri);
      Alert.alert("✅ Saved", "QR code saved to your gallery!");
    } catch (err) {
      console.error("Save Error:", err);
      Alert.alert("❌ Error", "Failed to save QR code.");
    }
  };

  const shareQRCode = async () => {
    if (!qrData?.qr_image_url) return;

    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("Sharing not supported on this device.");
        return;
      }

      const localUri = FileSystem.documentDirectory + 'qr_code_share.png';
      const downloadRes = await FileSystem.downloadAsync(qrData.qr_image_url, localUri);

      await Sharing.shareAsync(downloadRes.uri, {
        dialogTitle: 'Share Your QR Code',
      });
    } catch (err) {
      console.error("Share Error:", err);
      Alert.alert("❌ Error", "Failed to share QR code.");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.text}>Loading QR Code...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchQRCode} style={styles.button}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {qrData?.qr_image_url && (
        <>
          <Image
            source={{ uri: qrData.qr_image_url }}
            style={styles.qrCode}
            resizeMode="contain"
          />
          <Text style={styles.qrText}>{qrData.qr_image_url}</Text>

          <TouchableOpacity onPress={saveQRCode} style={styles.button}>
            <Text style={styles.buttonText}>💾 Save QR Code</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={shareQRCode} style={styles.button}>
            <Text style={styles.buttonText}>📤 Share QR Code</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrCode: {
    width: 250,
    height: 250,
    marginBottom: 30,
  },
  qrText: {
    marginBottom: 16,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  text: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default QRCodeComponent;
