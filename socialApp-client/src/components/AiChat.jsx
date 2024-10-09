import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ChatHistory from "./ChatHistory";
import bot from "../assets/bot.svg";
import user from "../assets/user.svg";
import send from "../assets/send.svg";
import "../styles/ai.css";

const AiChat = () => {
  const navigate = useNavigate();
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const chatContainerRef = useRef(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const getUserIdFromToken = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        return decodedToken.userId;
      } catch (error) {
        console.error("Error decoding token:", error.message);
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        const expirationTime = decodedToken.exp * 1000;
        return Date.now() < expirationTime;
      } catch (error) {
        console.error("Error decoding token:", error.message);
        return false;
      }
    } else {
      return false;
    }
  };

  const handleRateLimit = () => {
    setIsRateLimited(true);
    setCountdown(120);

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setIsRateLimited(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatCodeBlocks = (text) => {
    let formattedText = text
      .replace(/```(.*?)```/gs, "<pre><code>$1</code></pre>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .split("\n")
      .map((line) =>
        line.startsWith("- ")
          ? `<li>${line.substring(2)}</li>`
          : `<p>${line}</p>`
      )
      .join("\n")
      .replace(/(<li>.*<\/li>\s*){2,}/g, "<ul>$&</ul>");

    return formattedText;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    if (isRateLimited) return;

    if (userInput.length > 4000) {
      // Check if the input exceeds the character limit
      const errorResponse = {
        content: "Your input exceeds the 4000 character limit.",
        isUser: false,
      };
      setChatMessages((prevMessages) => [...prevMessages, errorResponse]);
      return;
    }

    setIsLoading(true);
    setIsThinking(true); 

    const message = { content: userInput, isUser: true };
    setChatMessages((prevMessages) => [...prevMessages, message]);
    setUserInput("");

    try {
      await axios.get(`http://localhost:5000/api/v1/ping`);
    } catch (error) {
      setIsLoading(false);
      const errorMessage = "Check your internet connection.";
      setTimeout(() => {
        const errorResponse = {
          content: errorMessage,
          isUser: false,
        };
        setChatMessages((prevMessages) => [...prevMessages, errorResponse]);
        setIsLoading(false);
      }, 5000);
      return;
    }

    try {
      const response = await axios.post(`http://localhost:5000/api/v1/ask`, {
        message: userInput,
      });

      if (response.status === 200) {
        const responseData = response.data.answer;
        simulateTypingEffect(responseData);
        setIsThinking(false);

        const userId = getUserIdFromToken();
        if (userId) {
          await axios.post(
            `http://localhost:5000/api/v1/history/save/${userId}`,
            {
              message: userInput,
              answer: responseData,
            }
          );
        }
      } else {
        console.error("Error: ", response.statusText);
        setIsThinking(false);
      }
    } catch (error) {
      if (error.response?.status === 408) {
        handleRateLimit();
        const errorMessage =
          "You have reached your limit. It will be reset after 2 minutes.";
        const errorResponse = {
          content: errorMessage,
          isUser: false,
        };
        setChatMessages((prevMessages) => [...prevMessages, errorResponse]);
      } else {
        console.error("Error: ", error.message);
        const errorMessage =
          "Something went wrong. Please check your internet connection or try again later.";
        const errorResponse = {
          content: errorMessage,
          isUser: false,
        };
        setChatMessages((prevMessages) => [...prevMessages, errorResponse]);
      }
    }

    setIsLoading(false);
  };

  const simulateTypingEffect = (text) => {
    const chunks = text.split(/(\s+)/);
    let currentContent = "";
    const interval = 35;

    chunks.forEach((chunk, index) => {
      setTimeout(() => {
        currentContent += chunk;
        const formattedContent = formatCodeBlocks(currentContent);
        setChatMessages((prevMessages) => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          if (!lastMessage || lastMessage.isUser) {
            return [
              ...prevMessages,
              { content: formattedContent, isUser: false },
            ];
          } else {
            const updatedMessages = [...prevMessages];
            updatedMessages[updatedMessages.length - 1].content =
              formattedContent;
            return updatedMessages;
          }
        });

        if (index === chunks.length - 1) {
          scrollToBottom();
        }
      }, interval * index);
    });
  };

  const handleKeyUp = (e) => {
    if (e.keyCode === 13) {
      handleSubmit(e);
    }
  };

  const scrollToBottom = () => {
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isLoading]);

  const navigatehome = () => {
    navigate("/home");
  };

  return (
    <div className="sideb-bar-container">
      {/* <div className="sidebar" style={{ width: 215 }}>
        {!showSidebar && <ChatHistory />}
      </div> */}
      <div id="app" className="main-content-ai">
        <div
          id="chat_container"
          ref={chatContainerRef}
          style={{ flex: 1, overflowY: "auto" }}
        >
          {chatMessages.map((message, index) => (
            <div
              key={index}
              className={`wrapper ${!message.isUser ? "ai" : "user"}`}
            >
              <div className="chat">
                <div className="profile">
                  <img src={!message.isUser ? bot : user} alt="bot" />
                </div>
                <div
                  className="message"
                  dangerouslySetInnerHTML={{
                    __html: formatCodeBlocks(message.content),
                  }}
                ></div>
              </div>
            </div>
          ))}
          {isThinking && (
  <div className={`wrapper ai`}>
    <div className="chat">
      <div className="profile">
        <img src={bot} alt="bot" />
      </div>
      <div className="message thinking-placeholder">
        Thinking
        <span className="dot">.</span>
        <span className="dot">.</span>
        <span className="dot">.</span>
      </div>
    </div>
  </div>
)}
        </div>
        <form className="ai-form" onSubmit={handleSubmit}>
          <textarea
            className="ai-textArea"
            name="message"
            rows="1"
            cols="1"
            placeholder="Ask ChirpAI..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyUp={handleKeyUp}
            disabled={isRateLimited}
            maxLength={4000} // Set a maximum character length
          ></textarea>
          <button className="ai-submit" type="submit" disabled={isRateLimited}>
            <img src={send} alt="Send" />
          </button>
        </form>
        <p className="info-text">
          {isRateLimited
            ? `You have reached your limit. It will be reset after ${countdown} seconds.`
            : "ChirpAI can make mistakes. Check important info."}
          <button
            style={{
              border: "none",
              background: "white",
              padding: 10,
              borderRadius: 200,
              marginLeft: 10,
              height: 35,
              textAlign: "center",
              color: "black",
              textDecoration: "underline"
            }}
            onClick={navigatehome}
          >
            {" "}
            Go Home
          </button>
        </p>
      </div>
    </div>
  );
};

export default AiChat;
