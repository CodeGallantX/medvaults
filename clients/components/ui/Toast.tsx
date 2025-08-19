import React from 'react';
import { View, Text } from 'react-native';
import { styled } from 'styled-components/native';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react-native';

interface ToastProps {
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message?: string;
}

const ToastContainer = styled(View)<{ type: string }>`
  flex-direction: row;
  align-items: flex-start;
  padding: 16px;
  border-radius: 12px;
  margin: 8px 16px;
  shadow-color: #000000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.1;
  shadow-radius: 8px;
  elevation: 4;
  
  ${({ type }) => {
    switch (type) {
      case 'success':
        return `
          background-color: #f0fdf4;
          border-left-width: 4px;
          border-left-color: #1CBF73;
        `;
      case 'warning':
        return `
          background-color: #fffbeb;
          border-left-width: 4px;
          border-left-color: #F59E0B;
        `;
      case 'error':
        return `
          background-color: #fef2f2;
          border-left-width: 4px;
          border-left-color: #E63946;
        `;
      default:
        return `
          background-color: #eff6ff;
          border-left-width: 4px;
          border-left-color: #0076D6;
        `;
    }
  }}
`;

const IconContainer = styled(View)`
  margin-right: 12px;
  margin-top: 2px;
`;

const ContentContainer = styled(View)`
  flex: 1;
`;

const Title = styled(Text)`
  font-family: 'Figtree-SemiBold';
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 2px;
`;

const Message = styled(Text)`
  font-family: 'Figtree';
  font-size: 13px;
  color: #6b7280;
  line-height: 18px;
`;

export const Toast: React.FC<ToastProps> = ({ type, title, message }) => {
  const getIcon = () => {
    const iconProps = { size: 20 };
    
    switch (type) {
      case 'success':
        return <CheckCircle {...iconProps} color="#1CBF73" />;
      case 'warning':
        return <AlertTriangle {...iconProps} color="#F59E0B" />;
      case 'error':
        return <XCircle {...iconProps} color="#E63946" />;
      default:
        return <Info {...iconProps} color="#0076D6" />;
    }
  };

  return (
    <ToastContainer type={type}>
      <IconContainer>{getIcon()}</IconContainer>
      <ContentContainer>
        <Title>{title}</Title>
        {message && <Message>{message}</Message>}
      </ContentContainer>
    </ToastContainer>
  );
};