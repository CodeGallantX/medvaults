import React from 'react';
import { View, ViewStyle } from 'react-native';
import { styled } from 'styled-components/native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  variant?: 'default' | 'elevated' | 'outlined';
}

const StyledCard = styled(View)<{
  variant: string;
  padding: number;
}>`
  border-radius: 16px;
  background-color: #ffffff;
  
  ${({ variant }) => {
    switch (variant) {
      case 'elevated':
        return `
          shadow-color: #000000;
          shadow-offset: 0px 4px;
          shadow-opacity: 0.1;
          shadow-radius: 8px;
          elevation: 4;
        `;
      case 'outlined':
        return `
          border-width: 1px;
          border-color: #e5e7eb;
        `;
      default:
        return `
          shadow-color: #000000;
          shadow-offset: 0px 2px;
          shadow-opacity: 0.05;
          shadow-radius: 4px;
          elevation: 2;
        `;
    }
  }}
  
  padding: ${({ padding }) => padding}px;
`;

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 16,
  variant = 'default',
}) => {
  return (
    <StyledCard variant={variant} padding={padding} style={style}>
      {children}
    </StyledCard>
  );
};