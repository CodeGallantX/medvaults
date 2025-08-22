import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Animated, Dimensions, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { styled } from 'styled-components/native';
import { MessageCircle, X, Send, Bot, User as UserIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface FloatingChatWidgetProps {
  visible?: boolean;
}

const FloatingContainer = styled(Animated.View)`
  position: absolute;
  bottom: 100px;
  right: 20px;
  z-index: 1000;
`;

const ChatButton = styled(TouchableOpacity)<{ isExpanded: boolean }>`
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background-color: ${({ isExpanded }) => isExpanded ? '#E63946' : '#0076D6'};
  justify-content: center;
  align-items: center;
  shadow-color: ${({ isExpanded }) => isExpanded ? '#E63946' : '#0076D6'};
  shadow-offset: 0px 4px;
  shadow-opacity: 0.3;
  shadow-radius: 8px;
  elevation: 8;
`;

const MiniChatContainer = styled(Animated.View)`
  position: absolute;
  bottom: 70px;
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
  overflow: hidden;
`;

const MiniChatHeader = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #0076D6;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
`;

const HeaderTitle = styled(Text)`
  font-family: 'Figtree-SemiBold';
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
`;

const HeaderButton = styled(TouchableOpacity)`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: rgba(255, 255, 255, 0.2);
  justify-content: center;
  align-items: center;
`;

const ChatContent = styled(View)`
  flex: 1;
  background-color: #f8f9fa;
`;

const MessagesContainer = styled(ScrollView)`
  flex: 1;
  padding: 16px;
`;

const MessageBubble = styled(View)<{ isUser: boolean }>`
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 18px;
  margin-bottom: 8px;
  align-self: ${({ isUser }) => isUser ? 'flex-end' : 'flex-start'};
  background-color: ${({ isUser }) => isUser ? '#0076D6' : '#ffffff'};
  shadow-color: #000000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.1;
  shadow-radius: 2px;
  elevation: 2;
`;

const MessageText = styled(Text)<{ isUser: boolean }>`
  font-family: 'Figtree';
  font-size: 14px;
  color: ${({ isUser }) => isUser ? '#ffffff' : '#333333'};
  line-height: 20px;
`;

const MessageHeader = styled(View)`
  flex-direction: row;
  align-items: center;
  margin-bottom: 4px;
`;

const MessageSender = styled(Text)<{ isUser: boolean }>`
  font-family: 'Figtree-Medium';
  font-size: 12px;
  font-weight: 500;
  color: ${({ isUser }) => isUser ? 'rgba(255,255,255,0.8)' : '#666666'};
  margin-left: 6px;
`;

const InputContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  padding: 12px 16px;
  background-color: #ffffff;
  border-top-width: 1px;
  border-top-color: #e5e7eb;
`;

const ChatInput = styled(TextInput)`
  flex: 1;
  background-color: #f3f4f6;
  border-radius: 20px;
  padding: 10px 16px;
  font-family: 'Figtree';
  font-size: 14px;
  color: #333333;
  margin-right: 8px;
  max-height: 80px;
`;

const SendButton = styled(TouchableOpacity)<{ disabled: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${({ disabled }) => disabled ? '#d1d5db' : '#0076D6'};
  justify-content: center;
  align-items: center;
`;

const TypingIndicator = styled(View)`
  flex-direction: row;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 8px;
`;

const TypingDot = styled(Animated.View)`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: #9ca3af;
  margin-right: 4px;
`;

const WelcomeMessage = styled(View)`
  align-items: center;
  padding: 20px;
  margin-bottom: 16px;
`;

const WelcomeText = styled(Text)`
  font-family: 'Figtree';
  font-size: 14px;
  color: #6b7280;
  text-align: center;
  line-height: 20px;
`;

export const FloatingChatWidget: React.FC<FloatingChatWidgetProps> = ({
  visible = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  // Typing animation values
  const [dot1] = useState(new Animated.Value(0));
  const [dot2] = useState(new Animated.Value(0));
  const [dot3] = useState(new Animated.Value(0));

  useEffect(() => {
    if (isTyping) {
      startTypingAnimation();
    }
  }, [isTyping]);

  const startTypingAnimation = () => {
    const animateDot = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    Animated.parallel([
      animateDot(dot1, 0),
      animateDot(dot2, 200),
      animateDot(dot3, 400),
    ]).start();
  };

  const toggleExpanded = () => {
    const toValue = isExpanded ? 0 : 1;
    
    Animated.spring(animation, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
    
    setIsExpanded(!isExpanded);

    // Add welcome message when first opened
    if (!isExpanded && messages.length === 0) {
      setTimeout(() => {
        addBotMessage("Hello! I'm your AI medical assistant. How can I help you today? 🩺");
      }, 500);
    }
  };

  const addBotMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: false,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    setTimeout(() => scrollToBottom(), 100);
  };

  const addUserMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    setTimeout(() => scrollToBottom(), 100);
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const handleSend = () => {
    if (inputText.trim()) {
      addUserMessage(inputText.trim());
      setInputText('');
      
      // Simulate bot typing
      setIsTyping(true);
      fetchMockBotResponse(inputText.trim());
    }
  };

  const fetchMockBotResponse = async (userMessage: string) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock API response based on user input
      const lowerMessage = userMessage.toLowerCase();
      let responseText = "";

      if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        responseText = "Hello! I'm here to help with your health questions. What would you like to know?";
      } else if (lowerMessage.includes('symptom') || lowerMessage.includes('pain')) {
        responseText = "I understand you're experiencing symptoms. Can you describe them in more detail? Remember, for serious concerns, please consult a healthcare professional.";
      } else if (lowerMessage.includes('medication') || lowerMessage.includes('medicine')) {
        responseText = "For medication questions, I recommend consulting with your doctor or pharmacist. They can provide personalized advice based on your medical history.";
      } else if (lowerMessage.includes('emergency')) {
        responseText = "If this is a medical emergency, please call emergency services immediately. For non-emergency health concerns, I'm here to help guide you.";
      } else if (lowerMessage.includes('allergy') || lowerMessage.includes('allergic')) {
        responseText = "Allergies can be serious. You can use our food scanner feature to check for allergens in your meals. Would you like me to guide you to that feature?";
      } else {
        responseText = "Thank you for your question. While I can provide general health information, please remember that I'm not a replacement for professional medical advice. How else can I assist you?";
      }

      addBotMessage(responseText);
    } catch (error) {
      console.error("Error fetching mock bot response:", error);
      addBotMessage("Oops! Something went wrong. Please try again later.");
    } finally {
      setIsTyping(false);
    }
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
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Bot size={20} color="#ffffff" />
            <HeaderTitle style={{ marginLeft: 8 }}>AI Medical Assistant</HeaderTitle>
          </View>
          <HeaderButton onPress={toggleExpanded}>
            <X size={16} color="#ffffff" />
          </HeaderButton>
        </MiniChatHeader>
        
        <ChatContent>
          <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <MessagesContainer
              ref={scrollViewRef}
              showsVerticalScrollIndicator={false}
            >
              {messages.length === 0 && !isTyping && (
                <WelcomeMessage>
                  <Bot size={40} color="#0076D6" style={{ marginBottom: 12 }} />
                  <WelcomeText>
                    Welcome to your AI Medical Assistant!{'\n'}
                    Ask me about symptoms, medications, or general health questions.
                  </WelcomeText>
                </WelcomeMessage>
              )}

              {messages.map((message) => (
                <View key={message.id}>
                  <MessageBubble isUser={message.isUser}>
                    <MessageHeader>
                      {message.isUser ? (
                        <UserIcon size={12} color="rgba(255,255,255,0.8)" />
                      ) : (
                        <Bot size={12} color="#666666" />
                      )}
                      <MessageSender isUser={message.isUser}>
                        {message.isUser ? 'You' : 'AI Assistant'}
                      </MessageSender>
                    </MessageHeader>
                    <MessageText isUser={message.isUser}>
                      {message.text}
                    </MessageText>
                  </MessageBubble>
                </View>
              ))}

              {isTyping && (
                <TypingIndicator>
                  <Bot size={12} color="#9ca3af" />
                  <Text style={{ 
                    fontFamily: 'Figtree', 
                    fontSize: 12, 
                    color: '#9ca3af',
                    marginLeft: 6,
                    marginRight: 8
                  }}>
                    AI is typing
                  </Text>
                  <TypingDot style={{ opacity: dot1 }} />
                  <TypingDot style={{ opacity: dot2 }} />
                  <TypingDot style={{ opacity: dot3 }} />
                </TypingIndicator>
              )}
            </MessagesContainer>

            <InputContainer>
              <ChatInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type your health question..."
                placeholderTextColor="#9ca3af"
                multiline
                onSubmitEditing={handleSend}
                returnKeyType="send"
              />
              <SendButton 
                disabled={!inputText.trim() || isTyping}
                onPress={handleSend}
              >
                <Send size={18} color="#ffffff" />
              </SendButton>
            </InputContainer>
          </KeyboardAvoidingView>
        </ChatContent>
      </MiniChatContainer>

      {/* Floating Chat Button */}
      <ChatButton 
        isExpanded={isExpanded}
        onPress={toggleExpanded} 
        activeOpacity={0.8}
      >
        {isExpanded ? (
          <X size={28} color="#ffffff" />
        ) : (
          <MessageCircle size={28} color="#ffffff" />
        )}
      </ChatButton>
    </FloatingContainer>
  );
};