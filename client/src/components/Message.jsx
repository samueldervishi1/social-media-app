import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import styles from "../styles/inbox.module.css";

const MessageComponent = ({ senderId, receiverId }) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const ws = useRef(null);

  const wsBaseUrl = "ws://localhost:8001/ws/chat";

  // Manage the connection to the WebSocket server for real-time messaging
  useEffect(() => {
    ws.current = new WebSocket(`${wsBaseUrl}/${senderId}/${receiverId}`);
    ws.current.onopen = () => console.log("WebSocket connected");
    ws.current.onclose = () => console.log("WebSocket disconnected");

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    return () => {
      ws.current.close();
    };
  }, [senderId, receiverId, wsBaseUrl]);

  const sendMessage = () => {
    if (!messageInput.trim()) return;

    const messageData = {
      sender_id: senderId,
      receiver_id: receiverId,
      message: messageInput.trim(),
    };

    ws.current.send(JSON.stringify(messageData));

    setMessageInput("");
  };

  useEffect(() => {
    console.log(messages);
  }, [messages]);

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
          type="text"
          className={styles.message_input}
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type a message..."
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