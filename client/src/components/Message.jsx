import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import "../styles/inbox.css";

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

    const token = localStorage.getItem("token");

    axios
      .post(
        `http://localhost:5000/api/v2/message/${senderId}/${receiverId}`,
        messageData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        setMessages((prevMessages) => [...prevMessages, response.data]);
      })
      .catch((error) => {
        console.error("Error sending message:", error);
      });

    setMessageInput("");
  };

  return (
    <div className="message-component">
      <div className="message-list">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message-item ${
              msg.sender_id === senderId ? "sent" : "received"
            }`}
          >
            {msg.message}
          </div>
        ))}
      </div>

      <div className="message-input-container">
        <input
          type="text"
          className="message-input"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} className="send-button">
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