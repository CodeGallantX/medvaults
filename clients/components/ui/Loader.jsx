import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { Stethoscope, Lock, CheckCircle, Sparkles, Activity } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const MedVaultLoader = ({ 
  message = "Securing your health data...", 
  type = "default", // "default", "scanning", "analyzing"
  progress = null 
}) => {
  // Animation values
  const [progressAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [vaultOpenAnim] = useState(new Animated.Value(0));
  const [sparkleAnim] = useState(new Animated.Value(0));
  const [rotateAnim] = useState(new Animated.Value(0));

  // Start all animations
  useEffect(() => {
    // Progress bar animation
    if (progress !== null) {
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 1000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false
      }).start();
    } else {
      // Continuous progress animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(progressAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.linear,
            useNativeDriver: false
          }),
          Animated.timing(progressAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false
          })
        ])
      ).start();
    }

    // Pulsing effect
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

    // Vault door animation
    if (type === "default") {
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
    }

    // Sparkle animation for scanning/analyzing
    if (type === "scanning" || type === "analyzing") {
      Animated.loop(
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true
        })
      ).start();
    }

    // Rotation animation for analyzing
    if (type === "analyzing") {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true
        })
      ).start();
    }
  }, [type, progress]);

  // Interpolated values
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  const vaultRotation = vaultOpenAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-15deg']
  });

  const sparkleOpacity = sparkleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1, 0.3]
  });

  const sparkleScale = sparkleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.8, 1.2, 0.8]
  });

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const getMainIcon = () => {
    switch (type) {
      case "scanning":
        return (
          <Animated.View style={{
            transform: [
              { scale: sparkleScale },
              { rotate: rotation }
            ],
            opacity: sparkleOpacity
          }}>
            <Sparkles size={60} color="#F59E0B" />
          </Animated.View>
        );
      case "analyzing":
        return (
          <Animated.View style={{
            transform: [{ rotate: rotation }]
          }}>
            <Activity size={60} color="#0076D6" />
          </Animated.View>
        );
      default:
        return <Stethoscope size={60} color="#7c3aed" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case "scanning":
        return "AI Scanner";
      case "analyzing":
        return "Analyzing Food";
      default:
        return "MedVault";
    }
  };

  const getColors = () => {
    switch (type) {
      case "scanning":
        return {
          primary: "#F59E0B",
          secondary: "#FEF3C7",
          accent: "#D97706"
        };
      case "analyzing":
        return {
          primary: "#0076D6",
          secondary: "#DBEAFE",
          accent: "#1D4ED8"
        };
      default:
        return {
          primary: "#7c3aed",
          secondary: "#f3e8ff",
          accent: "#6d28d9"
        };
    }
  };

  const colors = getColors();

  return (
    <View style={styles.container}>
      {/* Main Content */}
      <View style={styles.content}>
        {/* Animated Icon Container */}
        <Animated.View style={[
          styles.iconContainer, 
          { 
            transform: [{ scale: pulseAnim }],
            backgroundColor: colors.secondary,
            borderColor: colors.primary + '30'
          }
        ]}>
          <View style={styles.iconBody}>
            {getMainIcon()}
            
            {type === "default" && (
              <Animated.View style={[
                styles.vaultDoor, 
                { 
                  transform: [
                    { rotateY: vaultRotation },
                    { perspective: 1000 }
                  ] 
                }
              ]}>
                <Lock size={30} color="#fff" />
              </Animated.View>
            )}
          </View>
        </Animated.View>

        <Text style={[styles.title, { color: colors.primary }]}>
          {getTitle()}
        </Text>
        <Text style={styles.subtitle}>{message}</Text>

        {/* Enhanced Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressBarContainer}>
            <Animated.View style={[
              styles.progressBar, 
              { 
                width: progressWidth,
                backgroundColor: colors.primary
              }
            ]} />
            <Animated.View style={[
              styles.progressGlow,
              {
                width: progressWidth,
                backgroundColor: colors.primary + '40'
              }
            ]} />
          </View>
          
          {progress !== null && (
            <Text style={[styles.progressText, { color: colors.primary }]}>
              {Math.round(progress * 100)}%
            </Text>
          )}
        </View>

        {/* Floating particles for scanning/analyzing */}
        {(type === "scanning" || type === "analyzing") && (
          <View style={styles.particlesContainer}>
            {[...Array(6)].map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.particle,
                  {
                    backgroundColor: colors.primary,
                    opacity: sparkleOpacity,
                    transform: [
                      { 
                        translateX: sparkleAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, (index % 2 === 0 ? 20 : -20)]
                        })
                      },
                      { 
                        translateY: sparkleAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, (index % 3 === 0 ? -15 : 15)]
                        })
                      },
                      { scale: sparkleScale }
                    ]
                  }
                ]}
              />
            ))}
          </View>
        )}

        <View style={styles.hintContainer}>
          <CheckCircle size={16} color="#10b981" />
          <Text style={styles.hint}>
            Your health data is encrypted and secure
          </Text>
        </View>
      </View>

      {/* Background pattern */}
      <View style={[styles.bgPattern, { backgroundColor: colors.secondary + '10' }]} />
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
  iconContainer: {
    marginBottom: 30,
    position: 'relative',
    borderRadius: 60,
    borderWidth: 2,
  },
  iconBody: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
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
  progressSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBarContainer: {
    height: 6,
    width: '100%',
    backgroundColor: 'rgba(156, 163, 175, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  progressGlow: {
    height: 12,
    borderRadius: 6,
    position: 'absolute',
    left: 0,
    top: -3,
    opacity: 0.6,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  particlesContainer: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  hint: {
    color: '#9ca3af',
    fontSize: 14,
  },
  bgPattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.05,
    zIndex: 1,
  },
});

export default MedVaultLoader;