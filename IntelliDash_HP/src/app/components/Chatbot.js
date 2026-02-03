'use client';

import React, { useState } from 'react';
import styles from '../styles/Chatbot.module.css';

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      // Add user message
      setMessages([...messages, { type: 'user', text: inputValue }]);
      setInputValue('');

      // Simulate bot response
      setTimeout(() => {
        setMessages((prev) => [...prev, { type: 'bot', text: 'Response from bot...' }]);
      }, 500);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={styles.chatbotContainer}>
      {/* Chat Header */}
      <div className={styles.chatHeader}>
        <h3>Chat Assistant</h3>
        <button
          className={styles.closeBtn}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? '✕' : '○'}
        </button>
      </div>

      {/* Messages Display */}
      {isOpen && (
        <>
          <div className={styles.messagesContainer}>
            {messages.length === 0 ? (
              <div className={styles.emptyState}>
                <p>Start a conversation...</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={styles[`message-${msg.type}`]}>
                  <p>{msg.text}</p>
                </div>
              ))
            )}
          </div>

          {/* Input Area */}
          <div className={styles.inputContainer}>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              rows="2"
            />
            <button onClick={handleSendMessage} className={styles.sendBtn}>
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
}
