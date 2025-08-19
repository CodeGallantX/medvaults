import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MessageSquare } from 'lucide-react-native';

const EmptyChat = () => {
  return (
    <View style={styles.container}>
      <MessageSquare size={100} color="#4b5563" />
      <Text style={styles.text}>No messages yet</Text>
      <Text style={styles.subtext}>Send a message to start the conversation</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9ca3af',
  },
  subtext: {
    marginTop: 10,
    fontSize: 14,
    color: '#6b7280',
  },
});

export default EmptyChat;