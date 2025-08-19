import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { styled } from 'styled-components/native';

interface QuickActionCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onPress: () => void;
  color: string;
  variant?: 'default' | 'large';
}

const CardContainer = styled(TouchableOpacity)<{ 
  color: string; 
  variant: string;
}>`
  background-color: ${({ color }) => color};
  border-radius: 16px;
  padding: 20px;
  shadow-color: ${({ color }) => color};
  shadow-offset: 0px 4px;
  shadow-opacity: 0.2;
  shadow-radius: 8px;
  elevation: 6;
  
  ${({ variant }) => variant === 'large' ? `
    flex: 1;
    min-height: 140px;
  ` : `
    width: 160px;
    height: 120px;
  `}
`;

const IconContainer = styled(View)`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.15);
  justify-content: center;
  align-items: center;
  margin-bottom: 12px;
`;

const Title = styled(Text)`
  font-family: 'Figtree-SemiBold';
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
`;

const Subtitle = styled(Text)`
  font-family: 'Figtree';
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 18px;
`;

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  subtitle,
  icon,
  onPress,
  color,
  variant = 'default',
}) => {
  return (
    <CardContainer 
      color={color} 
      variant={variant}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <IconContainer>
        {icon}
      </IconContainer>
      <Title>{title}</Title>
      <Subtitle>{subtitle}</Subtitle>
    </CardContainer>
  );
};