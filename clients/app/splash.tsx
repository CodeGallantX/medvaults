import React, { useEffect } from 'react';
import { View, Text, Image, StatusBar } from 'react-native';
import { styled } from 'styled-components/native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stethoscope } from 'lucide-react-native';

const Container = styled(View)`
  flex: 1;
  background-color: #0076D6;
  justify-content: center;
  align-items: center;
  padding: 40px;
`;

const LogoContainer = styled(View)`
  align-items: center;
  margin-bottom: 40px;
`;

const LogoCircle = styled(View)`
  width: 120px;
  height: 120px;
  border-radius: 60px;
  background-color: rgba(255, 255, 255, 0.15);
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
`;

const AppName = styled(Text)`
  font-family: 'Figtree-SemiBold';
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
`;

const Tagline = styled(Text)`
  font-family: 'Figtree';
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  line-height: 24px;
`;

const LoadingContainer = styled(View)`
  position: absolute;
  bottom: 80px;
  align-items: center;
`;

const LoadingDot = styled(View)<{ delay: number }>`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.6);
  margin: 0 4px;
`;

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      // Simulate loading time for better UX
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const token = await AsyncStorage.getItem('access_token');
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      
      if (token) {
        // User is authenticated, go to main app
        router.replace('/(tabs)');
      } else if (hasSeenOnboarding) {
        // User has seen onboarding but not authenticated
        router.replace('/login');
      } else {
        // First time user, show onboarding
        router.replace('/onboarding');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.replace('/onboarding');
    }
  };

  return (
    <Container>
      <StatusBar barStyle="light-content" backgroundColor="#0076D6" />
      
      <LogoContainer>
        <LogoCircle>
          <Stethoscope size={60} color="#ffffff" />
        </LogoCircle>
        <AppName>MedVault</AppName>
        <Tagline>Your health, secured and accessible{'\n'}when it matters most</Tagline>
      </LogoContainer>

      <LoadingContainer>
        <View style={{ flexDirection: 'row' }}>
          <LoadingDot delay={0} />
          <LoadingDot delay={200} />
          <LoadingDot delay={400} />
        </View>
      </LoadingContainer>
    </Container>
  );
}