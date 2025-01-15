import React, { useEffect, useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/inbox.module.css';

const MessageComponent = ({ senderId, receiverId }) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const ws = useRef(null);

  const wsBaseUrl = 'ws://localhost:8001/ws/chat';

  // Handle WebSocket connection
  useEffect(() => {
    const socket = new WebSocket(`${wsBaseUrl}/${senderId}/${receiverId}`);
    ws.current = socket;

    const handleMessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prev) => [...prev, message]);
    };

    socket.onopen = () => console.log('WebSocket connected');
    socket.onclose = () => console.log('WebSocket disconnected');
    socket.onmessage = handleMessage;

    return () => {
      socket.close();
    };
  }, [senderId, receiverId]);

  // Memoize send message handler
  const sendMessage = useCallback(() => {
    const trimmedMessage = messageInput.trim();
    if (!trimmedMessage || !ws.current) return;

    const messageData = {
      sender_id: senderId,
      receiver_id: receiverId,
      message: trimmedMessage,
    };

    ws.current.send(JSON.stringify(messageData));
    setMessageInput('');
  }, [messageInput, senderId, receiverId]);

  // Handle enter key press
  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    },
    [sendMessage]
  );

  return (
    <div className={styles.message_component}>
      <div className={styles.message_list}>
        {messages.map(
          (msg, index) =>
            msg.content !== null && (
              <div
                key={index}
                className={`${styles.message_item} ${
                  msg.sender_id === senderId ? styles.sent : styles.received
                }`}
              >
                {msg.message}
              </div>
            )
        )}
      </div>

      <div className={styles.message_input_container}>
        <input
          type='text'
          className={styles.message_input}
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder='Type a message...'
        />
        <button onClick={sendMessage} className={styles.send_button}>
          Send
        </button>
      </div>
    </div>
  );
};

MessageComponent.propTypes = {
  senderId: PropTypes.string.isRequired,
  receiverId: PropTypes.string.isRequired,
};

export default MessageComponent;