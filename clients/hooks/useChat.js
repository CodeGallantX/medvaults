import { useState, useEffect } from 'react';

export const useChat = (socket) => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (socket) {
      socket.on('connect', () => {
        setIsTyping(true);
        setTimeout(() => {
          setMessages([
            { id: '1', text: 'Hello! How can I help you today?', isUser: false },
          ]);
          setIsTyping(false);
        }, 2000);
      });

      socket.on('message', (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
        setIsTyping(false);
      });

      socket.on('typing', () => {
        setIsTyping(true);
      });

      socket.on('stop-typing', () => {
        setIsTyping(false);
      });
    }
  }, [socket]);

  const handleSend = (inputText, setInputText) => {
    if (inputText.trim().length > 0) {
      const newMessage = { id: Date.now().toString(), text: inputText, isUser: true };
      socket.emit('message', newMessage);
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setInputText('');
    }
  };

  return { messages, isTyping, handleSend };
};
