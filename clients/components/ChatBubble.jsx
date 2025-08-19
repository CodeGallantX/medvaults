import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ChatBubble = ({ message, isUser }) => {
  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.botContainer]}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: '80%',
  },
  userContainer: {
    backgroundColor: '#3b82f6',
    alignSelf: 'flex-end',
  },
  botContainer: {
    backgroundColor: '#4b5563',
    alignSelf: 'flex-start',
  },
  text: {
    color: 'white',
  },
});

export default ChatBubble;
