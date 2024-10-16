import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/user-cards.css";

const MessageComponent = ({ senderId, receiverId }) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const ws = useRef(null);
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL;

  const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        const expirationTime = decodedToken.exp * 1000;
        return Date.now() < expirationTime;
      } catch (error) {
        console.error("Error decoding token: ", error.message);
        return false;
      }
    } else {
      return false;
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    // WebSocket setup
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
  }, [senderId, receiverId]);

  const sendMessage = () => {
    if (!messageInput.trim()) return;

    const messageData = {
      sender_id: senderId,
      receiver_id: receiverId,
      message: messageInput.trim(),
    };

    ws.current.send(JSON.stringify(messageData));

    axios
      .post(
        `http://localhost:5000/api/v2/message/${senderId}/${receiverId}`,
        messageData
      )
      .then((response) => {
        console.log("Message sent:", response.data);
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
          style={{ borderRadius: "20px 0 0 20px" }}
        />
        <button onClick={sendMessage} className="send-btn">
          Send
        </button>
      </div>
    </div>
  );
};

export default MessageComponent;
