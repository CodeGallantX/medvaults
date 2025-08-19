import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ChatBubble from './ChatBubble';

const Message = ({ message, isUser }) => {
  return (
    <View style={styles.container}>
      <ChatBubble message={message} isUser={isUser} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
  },
});

export default Message;
