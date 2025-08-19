import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { styled } from 'styled-components/native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const StyledButton = styled(TouchableOpacity)<{
  variant: string;
  size: string;
  disabled: boolean;
}>`
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  
  ${({ variant }) => {
    switch (variant) {
      case 'primary':
        return `
          background-color: #0076D6;
          border-width: 0;
        `;
      case 'secondary':
        return `
          background-color: #1CBF73;
          border-width: 0;
        `;
      case 'outline':
        return `
          background-color: transparent;
          border-width: 1px;
          border-color: #0076D6;
        `;
      case 'ghost':
        return `
          background-color: transparent;
          border-width: 0;
        `;
      default:
        return `
          background-color: #0076D6;
          border-width: 0;
        `;
    }
  }}
  
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `
          padding: 8px 16px;
          min-height: 36px;
        `;
      case 'lg':
        return `
          padding: 16px 24px;
          min-height: 56px;
        `;
      default:
        return `
          padding: 12px 20px;
          min-height: 48px;
        `;
    }
  }}
  
  ${({ disabled }) => disabled && `
    opacity: 0.5;
  `}
`;

const StyledText = styled(Text)<{
  variant: string;
  size: string;
}>`
  font-family: 'Figtree-Medium';
  font-weight: 600;
  
  ${({ variant }) => {
    switch (variant) {
      case 'primary':
      case 'secondary':
        return `color: #ffffff;`;
      case 'outline':
        return `color: #0076D6;`;
      case 'ghost':
        return `color: #0076D6;`;
      default:
        return `color: #ffffff;`;
    }
  }}
  
  ${({ size }) => {
    switch (size) {
      case 'sm':
        return `font-size: 14px;`;
      case 'lg':
        return `font-size: 18px;`;
      default:
        return `font-size: 16px;`;
    }
  }}
`;

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      disabled={disabled || loading}
      onPress={onPress}
      style={style}
      activeOpacity={0.8}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? '#0076D6' : '#ffffff'}
          style={{ marginRight: 8 }}
        />
      )}
      <StyledText variant={variant} size={size} style={textStyle}>
        {title}
      </StyledText>
    </StyledButton>
  );
};