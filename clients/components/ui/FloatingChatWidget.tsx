import React, { useState } from 'react';
import { View, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { styled } from 'styled-components/native';
import { MessageCircle, X, Minimize2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface FloatingChatWidgetProps {
  visible?: boolean;
}

const FloatingContainer = styled(Animated.View)`
  position: absolute;
  bottom: 100px;
  right: 20px;
  z-index: 1000;
`;

const ChatButton = styled(TouchableOpacity)`
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background-color: #0076D6;
  justify-content: center;
  align-items: center;
  shadow-color: #0076D6;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.3;
  shadow-radius: 8px;
  elevation: 8;
`;

const MiniChatContainer = styled(Animated.View)`
  position: absolute;
  bottom: 0;
  right: 0;
  width: ${screenWidth - 40}px;
  height: 400px;
  background-color: #ffffff;
  border-radius: 16px;
  shadow-color: #000000;
  shadow-offset: 0px 8px;
  shadow-opacity: 0.2;
  shadow-radius: 16px;
  elevation: 12;
`;

const MiniChatHeader = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom-width: 1px;
  border-bottom-color: #e5e7eb;
`;

const HeaderTitle = styled(Text)`
  font-family: 'Figtree-SemiBold';
  font-size: 16px;
  font-weight: 600;
  color: #111827;
`;

const HeaderActions = styled(View)`
  flex-direction: row;
  gap: 8px;
`;

const HeaderButton = styled(TouchableOpacity)`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: #f3f4f6;
  justify-content: center;
  align-items: center;
`;

export const FloatingChatWidget: React.FC<FloatingChatWidgetProps> = ({
  visible = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const router = useRouter();

  const toggleExpanded = () => {
    const toValue = isExpanded ? 0 : 1;
    
    Animated.spring(animation, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
    
    setIsExpanded(!isExpanded);
  };

  const openFullChat = () => {
    setIsExpanded(false);
    animation.setValue(0);
    router.push('/AIDoctor');
  };

  if (!visible) return null;

  return (
    <FloatingContainer>
      {/* Mini Chat Window */}
      <MiniChatContainer
        style={{
          transform: [
            {
              scale: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
            },
          ],
          opacity: animation,
        }}
      >
        <MiniChatHeader>
          <HeaderTitle>AI Doctor</HeaderTitle>
          <HeaderActions>
            <HeaderButton onPress={openFullChat}>
              <Minimize2 size={16} color="#6b7280" />
            </HeaderButton>
            <HeaderButton onPress={toggleExpanded}>
              <X size={16} color="#6b7280" />
            </HeaderButton>
          </HeaderActions>
        </MiniChatHeader>
        
        <View style={{ flex: 1, padding: 16 }}>
          {/* Mini chat content would go here */}
          <Text style={{
            fontFamily: 'Figtree',
            fontSize: 14,
            color: '#6b7280',
            textAlign: 'center',
            marginTop: 40,
          }}>
            Tap to expand for full chat experience
          </Text>
        </View>
      </MiniChatContainer>

      {/* Floating Chat Button */}
      <ChatButton onPress={toggleExpanded} activeOpacity={0.8}>
        <MessageCircle size={28} color="#ffffff" />
      </ChatButton>
    </FloatingContainer>
  );
};