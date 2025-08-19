import React, { useState } from 'react';
import { TextInput, View, Text, TextInputProps, ViewStyle } from 'react-native';
import { styled } from 'styled-components/native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  variant?: 'default' | 'outlined' | 'filled';
}

const Container = styled(View)`
  margin-bottom: 16px;
`;

const Label = styled(Text)`
  font-family: 'Figtree-Medium';
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
`;

const StyledInput = styled(TextInput)<{
  variant: string;
  hasError: boolean;
  isFocused: boolean;
}>`
  border-radius: 8px;
  font-family: 'Figtree';
  font-size: 16px;
  color: #111827;
  padding: 12px 16px;
  min-height: 48px;
  
  ${({ variant, hasError, isFocused }) => {
    const borderColor = hasError ? '#E63946' : isFocused ? '#0076D6' : '#d1d5db';
    
    switch (variant) {
      case 'outlined':
        return `
          background-color: transparent;
          border-width: 1px;
          border-color: ${borderColor};
        `;
      case 'filled':
        return `
          background-color: #f9fafb;
          border-width: 1px;
          border-color: ${borderColor};
        `;
      default:
        return `
          background-color: #ffffff;
          border-width: 1px;
          border-color: ${borderColor};
        `;
    }
  }}
`;

const ErrorText = styled(Text)`
  font-family: 'Figtree';
  font-size: 12px;
  color: #E63946;
  margin-top: 4px;
`;

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  variant = 'default',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Container style={containerStyle}>
      {label && <Label>{label}</Label>}
      <StyledInput
        variant={variant}
        hasError={!!error}
        isFocused={isFocused}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        placeholderTextColor="#9ca3af"
        {...props}
      />
      {error && <ErrorText>{error}</ErrorText>}
    </Container>
  );
};