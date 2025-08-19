import React, { useState, useRef } from 'react';
import { View, Text, Dimensions, TouchableOpacity, StatusBar } from 'react-native';
import { styled } from 'styled-components/native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FlatList } from 'react-native';
import { 
  Shield, 
  Scan, 
  MessageCircle, 
  Wallet,
  ChevronRight,
  ArrowRight 
} from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    icon: <Shield size={80} color="#ffffff" />,
    title: 'Emergency Profile',
    description: 'Store your medical information securely and share it instantly with healthcare providers through QR codes.',
    color: '#0076D6',
  },
  {
    id: '2',
    icon: <Scan size={80} color="#ffffff" />,
    title: 'AI Food Scanner',
    description: 'Scan food and medications to detect allergens and get personalized risk assessments based on your profile.',
    color: '#1CBF73',
  },
  {
    id: '3',
    icon: <MessageCircle size={80} color="#ffffff" />,
    title: 'AI Doctor Chat',
    description: 'Get instant medical advice and health guidance from our AI-powered virtual doctor assistant.',
    color: '#F59E0B',
  },
  {
    id: '4',
    icon: <Wallet size={80} color="#ffffff" />,
    title: 'Health Wallet',
    description: 'Manage your healthcare funds securely with easy deposits, withdrawals, and transaction tracking.',
    color: '#E63946',
  },
];

const Container = styled(View)`
  flex: 1;
  background-color: #ffffff;
`;

const SlideContainer = styled(View)<{ color: string }>`
  width: ${screenWidth}px;
  flex: 1;
  background-color: ${({ color }) => color};
  justify-content: center;
  align-items: center;
  padding: 40px 32px;
`;

const IconContainer = styled(View)`
  width: 140px;
  height: 140px;
  border-radius: 70px;
  background-color: rgba(255, 255, 255, 0.15);
  justify-content: center;
  align-items: center;
  margin-bottom: 48px;
`;

const Title = styled(Text)`
  font-family: 'Figtree-SemiBold';
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  text-align: center;
  margin-bottom: 16px;
  letter-spacing: -0.5px;
`;

const Description = styled(Text)`
  font-family: 'Figtree';
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  line-height: 24px;
  max-width: 300px;
`;

const BottomContainer = styled(View)`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  padding: 32px;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
`;

const PaginationContainer = styled(View)`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-bottom: 32px;
`;

const PaginationDot = styled(View)<{ active: boolean }>`
  width: ${({ active }) => active ? '24px' : '8px'};
  height: 8px;
  border-radius: 4px;
  background-color: ${({ active }) => active ? '#0076D6' : '#e5e7eb'};
  margin: 0 4px;
`;

const ButtonsContainer = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const SkipButton = styled(TouchableOpacity)`
  padding: 12px 0;
`;

const SkipText = styled(Text)`
  font-family: 'Figtree-Medium';
  font-size: 16px;
  color: #6b7280;
`;

const NextButton = styled(TouchableOpacity)<{ isLast: boolean }>`
  flex-direction: row;
  align-items: center;
  background-color: ${({ isLast }) => isLast ? '#0076D6' : 'transparent'};
  padding: ${({ isLast }) => isLast ? '16px 24px' : '12px 0'};
  border-radius: ${({ isLast }) => isLast ? '8px' : '0px'};
`;

const NextText = styled(Text)<{ isLast: boolean }>`
  font-family: 'Figtree-Medium';
  font-size: 16px;
  font-weight: 600;
  color: ${({ isLast }) => isLast ? '#ffffff' : '#0076D6'};
  margin-right: 8px;
`;

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      router.replace('/login');
    } catch (error) {
      console.error('Failed to save onboarding state:', error);
      router.replace('/login');
    }
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <SlideContainer color={item.color}>
      <IconContainer>
        {item.icon}
      </IconContainer>
      <Title>{item.title}</Title>
      <Description>{item.description}</Description>
    </SlideContainer>
  );

  const onViewableItemsChanged = ({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  };

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <Container>
      <StatusBar barStyle="light-content" backgroundColor={slides[currentIndex]?.color} />
      
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
      />

      <BottomContainer>
        <PaginationContainer>
          {slides.map((_, index) => (
            <PaginationDot key={index} active={index === currentIndex} />
          ))}
        </PaginationContainer>

        <ButtonsContainer>
          <SkipButton onPress={handleSkip}>
            <SkipText>Skip</SkipText>
          </SkipButton>

          <NextButton isLast={isLastSlide} onPress={handleNext}>
            <NextText isLast={isLastSlide}>
              {isLastSlide ? 'Get Started' : 'Next'}
            </NextText>
            {isLastSlide ? (
              <ArrowRight size={20} color="#ffffff" />
            ) : (
              <ChevronRight size={20} color="#0076D6" />
            )}
          </NextButton>
        </ButtonsContainer>
      </BottomContainer>
    </Container>
  );
}