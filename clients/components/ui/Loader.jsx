import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Image
} from 'react-native';
import { Stethoscope, Lock, CheckCircle } from 'lucide-react-native';

const MedVaultLoader = ({ message = "Securing your health data..." }) => {
  // Animation values
  const [progress] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [vaultOpenAnim] = useState(new Animated.Value(0));
  const [dnaAnim] = useState(new Animated.Value(0));

  // Start all animations
  useEffect(() => {
    // Progress bar animation (left to right loop)
    Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: false
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false
        })
      ])
    ).start();

    // Pulsing effect for vault
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true
        })
      ])
    ).start();

    // Vault door opening/closing
    Animated.loop(
      Animated.sequence([
        Animated.timing(vaultOpenAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.ease,
          useNativeDriver: true
        }),
        Animated.timing(vaultOpenAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.ease,
          useNativeDriver: true
        })
      ])
    ).start();

    // DNA strand wave animation
    Animated.loop(
      Animated.timing(dnaAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true
      })
    ).start();
  }, []);

  // Interpolated values
  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  const vaultRotation = vaultOpenAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-15deg']
  });

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1.05]
  });

  const dnaWave = dnaAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1, 0]
  });

  // Create animated DNA nodes
  const renderDnaNodes = () => {
    const nodes = [];
    for (let i = 0; i < 10; i++) {
      const nodePosition = dnaWave.interpolate({
        inputRange: [0, 1],
        outputRange: [0, i % 2 === 0 ? -10 : 10]
      });

      nodes.push(
        <Animated.View
          key={i}
          style={[
            styles.dnaNode,
            {
              transform: [
                { translateY: nodePosition }
              ],
              backgroundColor: i % 2 === 0 ? '#7c3aed' : '#a78bfa'
            }
          ]}
        />
      );
    }
    return nodes;
  };

  return (
    <View style={styles.container}>
      {/* Main Content */}
      <View style={styles.content}>
        {/* Animated MedVault */}
        <Animated.View style={[styles.vaultContainer, { transform: [{ scale: pulseScale }] }]}>
          <View style={styles.vaultBody}>
            <Stethoscope size={60} color="#7c3aed" />
            <Animated.View style={[
              styles.vaultDoor, 
              { 
                transform: [
                  { rotateY: vaultRotation },
                  { perspective: 1000 } // Needed for 3D effect
                ] 
              }
            ]}>
              <Lock size={30} color="#fff" />
            </Animated.View>
          </View>
        </Animated.View>

        <Text style={styles.title}>MedVault</Text>
        <Text style={styles.subtitle}>{message}</Text>

        {/* DNA Animation */}
        <View style={styles.dnaContainer}>
          {renderDnaNodes()}
          <View style={styles.dnaStrand} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
        </View>

        <Text style={styles.hint}>
          <CheckCircle size={16} color="#10b981" /> 
          {" "}Your health data is encrypted
        </Text>
      </View>

      {/* Optional: Medical pattern background */}
      <View style={styles.bgPattern} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f14',
  },
  content: {
    width: '80%',
    alignItems: 'center',
    zIndex: 2,
  },
  vaultContainer: {
    marginBottom: 30,
    position: 'relative',
  },
  vaultBody: {
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(124, 58, 237, 0.3)',
    position: 'relative',
    overflow: 'hidden',
  },
  vaultDoor: {
    position: 'absolute',
    backgroundColor: 'rgba(31, 41, 55, 0.9)',
    width: 60,
    height: 100,
    right: 0,
    top: 10,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    borderWidth: 2,
    borderColor: 'rgba(124, 58, 237, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    transformOrigin: 'left center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 30,
    textAlign: 'center',
  },
  progressBarContainer: {
    height: 6,
    width: '100%',
    backgroundColor: 'rgba(156, 163, 175, 0.2)',
    borderRadius: 3,
    marginTop: 30,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#7c3aed',
    borderRadius: 3,
  },
  dnaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    height: 40,
    position: 'relative',
  },
  dnaStrand: {
    position: 'absolute',
    height: 2,
    width: '100%',
    backgroundColor: 'rgba(124, 58, 237, 0.5)',
    zIndex: -1,
  },
  dnaNode: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 8,
  },
  hint: {
    marginTop: 20,
    color: '#9ca3af',
    fontSize: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bgPattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#0f0f14',
    opacity: 0.95,
    zIndex: 1,
  },
});

export default MedVaultLoader;
