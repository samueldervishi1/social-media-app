import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import ChripAIHistory from "./ChripAIHistory";
import bot from "../assets/bot.svg";
import user from "../assets/user.svg";
import send from "../assets/send.svg";
import loaderGif from "/home/samuel/Documents/social-media-app/socialApp-client/src/assets/ZKZg.gif";
import { FaRegPenToSquare, FaBarsStaggered } from "react-icons/fa6";
import "../styles/ai.css";

const ChirpAI = () => {
  const navigate = useNavigate();
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const chatContainerRef = useRef(null);
  const [isThinking, setIsThinking] = useState(false);
  const [headingText, setHeadingText] = useState("");
  const [hideHeading, setHideHeading] = useState(false);
  const [isChatHistoryVisible, setChatHistoryVisible] = useState(true);

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

  const resetChat = () => {
    const newSessionId = uuidv4();
    localStorage.setItem("sessionId", newSessionId);
    setChatMessages([]);
    setUserInput("");
    setHideHeading(false);
  };

  const toggleChatHistory = () => {
    setChatHistoryVisible((prev) => !prev);
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

  useEffect(() => {
    const fullHeading = "Ask anything you want!";
    let currentIndex = 0;

    const typeHeading = () => {
      if (currentIndex < fullHeading.length) {
        setHeadingText((prev) => prev + fullHeading[currentIndex]);
        currentIndex++;
        setTimeout(typeHeading, 100);
      }
    };

    typeHeading();
  }, []);

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
    const codeBlockRegex = /```(.*?)(\n([\s\S]*?))?```/gs;

    const formattedText = text
      .replace(codeBlockRegex, (match, lang, _, code) => {
        const escapedCode = code
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");

        return `
              <div class="terminal-block">
                <div class="terminal-header">${
                  lang ? lang.trim() : "code"
                }</div>
                <pre><code>${escapedCode}</code></pre>
              </div>
            `;
      })
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .split("\n")
      .map((line) =>
        line.startsWith("- ") ? `<li>${line.substring(2)}</li>` : line
      )
      .join("<br />")
      .replace(/(<li>.*<\/li>\s*){2,}/g, "<ul>$&</ul>");

    return formattedText.includes("<li>")
      ? `<ul>${formattedText}</ul>`
      : formattedText;
  };

  const getSessionId = () => {
    return localStorage.getItem("sessionId");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    setHideHeading(true);

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
      await axios.get(`http://localhost:5000/api/v2/ping`);
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
      const response = await axios.post(`http://localhost:5000/api/v2/ask`, {
        message: userInput,
      });

      if (response.status === 200) {
        const responseData = response.data.answer;
        simulateTypingEffect(responseData);
        setIsThinking(false);

        const userId = getUserIdFromToken();
        const sessionId = getSessionId();
        const historyResponse = await axios.post(
          `http://localhost:5000/api/v2/history/save/${userId}/session/${sessionId}`,
          {
            message: userInput,
            answer: responseData,
          }
        );

        console.log("History saved response: ", historyResponse);
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
    <div className="sidebar1-container">
      <div
        className="sidebar1"
        style={{ display: isChatHistoryVisible ? "block" : "none" }}
      >
        <ChripAIHistory />
      </div>
      <div
        className="button-container"
        style={{ display: "flex", margin: "10px 0" }}
      >
        <div style={{ position: "relative" }}>
          <button
            style={{
              border: "none",
              background: "transparent",
              padding: 10,
              borderRadius: 200,
              height: 35,
              textAlign: "center",
              color: "white",
              cursor: "pointer",
            }}
            onClick={toggleChatHistory}
            onMouseEnter={(e) =>
              (e.currentTarget.querySelector(".tooltip").style.display =
                "block")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.querySelector(".tooltip").style.display = "none")
            }
          >
            <FaBarsStaggered />
            <span
              className="tooltip"
              style={{
                display: "none",
                position: "absolute",
                background: "black",
                color: "white",
                borderRadius: 5,
                padding: "5px",
                top: "35px",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              Toggle Chat History
            </span>
          </button>
        </div>
        <div style={{ position: "relative", marginLeft: "10px" }}>
          <button
            style={{
              border: "none",
              background: "transparent",
              padding: 10,
              borderRadius: 200,
              height: 35,
              textAlign: "center",
              color: "white",
              textDecoration: "underline",
              cursor: "pointer",
            }}
            onClick={resetChat}
            onMouseEnter={(e) =>
              (e.currentTarget.querySelector(".tooltip").style.display =
                "block")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.querySelector(".tooltip").style.display = "none")
            }
          >
            <FaRegPenToSquare />
            <span
              className="tooltip"
              style={{
                display: "none",
                position: "absolute",
                background: "black",
                color: "white",
                borderRadius: 5,
                padding: "5px",
                top: "35px",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              New Chat
            </span>
          </button>
        </div>
      </div>

      <div className="main-content-ai">
        {!hideHeading && (
          <h1 className="heading-center">What do you need help with?</h1>
        )}
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
            disabled={isRateLimited || isThinking}
            maxLength={4000}
          ></textarea>
          <button
            className="ai-submit"
            type="submit"
            disabled={isRateLimited || isThinking}
          >
            {isThinking ? (
              <img
                src={loaderGif}
                alt="Loading"
                style={{ width: "20px", height: "20px" }}
              />
            ) : (
              <img src={send} alt="Send" />
            )}
          </button>
        </form>
        <p className="info-text">
          {isRateLimited
            ? `You have reached your limit. It will be reset after ${countdown} seconds.`
            : "ChirpAI can make mistakes. Check important info."}
          <button
            style={{
              border: "none",
              background: "transparent",
              padding: 10,
              borderRadius: 200,
              marginLeft: 10,
              height: 35,
              textAlign: "center",
              color: "white",
              textDecoration: "underline",
            }}
            onClick={navigatehome}
          >
            Go Home
          </button>
        </p>
      </div>
    </div>
  );
};

export default ChirpAI;
