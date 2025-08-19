import React from 'react';
import { FlatList, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import Message from './Message';
import EmptyChat from './EmptyChat';

const MessageList = ({ messages, isTyping }) => {
  if (messages.length === 0 && !isTyping) {
    return <EmptyChat />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={({ item }) => <Message message={item.text} isUser={item.isUser} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.chatContainer}
      />
      {isTyping && (
        <View style={styles.typingIndicator}>
          <ActivityIndicator size="small" color="#9ca3af" />
          <Text style={styles.typingText}>AI is typing...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

export default MessageList;
