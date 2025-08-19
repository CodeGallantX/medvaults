import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSocket } from '@/hooks/useSocket';
import { useChat } from '@/hooks/useChat';
import ChatHeader from '@/components/ChatHeader';
import MessageList from '@/components/MessageList';
import ChatInput from '@/components/ChatInput';

export default function AIDoctor() {
  const socket = useSocket();
  const { messages, isTyping, handleSend } = useChat(socket);
  const [inputText, setInputText] = useState('');

  return (
    <View style={styles.container}>
      <ChatHeader title="AI Doctor" />
      <MessageList messages={messages} isTyping={isTyping} />
      <ChatInput inputText={inputText} setInputText={setInputText} handleSend={() => handleSend(inputText, setInputText)} />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f14',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  chatContainer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  typingText: {
    marginLeft: 10,
    color: '#9ca3af',
  },
});
