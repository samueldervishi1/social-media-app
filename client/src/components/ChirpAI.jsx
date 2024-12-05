import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import bot from "../assets/bot.svg";
import user from "../assets/user.svg";
import send from "../assets/send.svg";
import loaderGif from "../assets/ZKZg.gif";
import { FaRegPenToSquare } from "react-icons/fa6";
import styles from "../styles/ai.module.css";

const ChirpAI = () => {
  const navigate = useNavigate();
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const chatContainerRef = useRef(null);
  const [isThinking, setIsThinking] = useState(false);
  const [hideHeading, setHideHeading] = useState(false);

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
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const resetChat = () => {
    const newSessionId = uuidv4();
    localStorage.setItem("sessionId", newSessionId);
    setChatMessages([]);
    setUserInput("");
    setHideHeading(false);
  };

  useEffect(() => {
    resetChat();
  }, []);

  //handle the limit for the model
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

  //format the code block provided by the model
  const formatCodeBlocks = (text) => {
    const codeBlockRegex = /```(.*?)(\n([\s\S]*?))?```/gs;

    const formattedText = text
      .replace(codeBlockRegex, (match, lang, _, code) => {
        const escapedCode = code
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");

        return `
              <div class="terminal_block">
                <div class="terminal_header">${
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

  //send the question to the model
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userInput.trim()) {
      return;
    }

    setHideHeading(true);

    if (isRateLimited) return;

    if (userInput.length > 4000) {
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

    console.log("Sending ping request to backend...");

    try {
      const token = localStorage.getItem("token");
      await axios.get(`http://localhost:5000/api/v2/ping`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      setIsLoading(false);
      setIsThinking(false);
      const errorMessage = "Check your internet connection.";
      console.error("Error during ping request: ", error);
      setTimeout(() => {
        const errorResponse = {
          content: errorMessage,
          isUser: false,
        };
        setChatMessages((prevMessages) => [...prevMessages, errorResponse]);
      }, 5000);
      return;
    }

    console.log("Sending question to backend...");

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `http://localhost:5000/api/v2/ask`,
        {
          message: userInput,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        const responseData = response.data.answer;
        simulateTypingEffect(responseData);
        setIsThinking(false);

        const userId = getUserIdFromToken();
        const sessionId = getSessionId();
        await axios.post(
          `http://localhost:5000/api/v2/history/save/${userId}/session/${sessionId}`,
          {
            message: userInput,
            answer: responseData,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
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
        setIsThinking(false);
      }
    }

    setIsLoading(false);
  };

  //simulate a typing effect
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

  return (
    <div className={styles.sidebar1_container}>
      <div
        className={styles.button_container}
        style={{ display: "flex", margin: "6px 0", background: "#1c1c1d" }}
      >
        {/* <div style={{ position: "relative"}}>
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
          New chat
        </button>
      </div> */}
      </div>

      <div className={styles.main_content_ai}>
        {!hideHeading && (
          <h1 className={styles.heading_center}>What do you need help with?</h1>
        )}
        <div
          id={styles.chat_container}
          ref={chatContainerRef}
          style={{ flex: 1, overflowY: "auto" }}
        >
          {chatMessages.map((message, index) => (
            <div
              key={index}
              className={`${styles.wrapper} ${
                !message.isUser ? styles.ai : styles.user
              }`}
            >
              <div className={styles.chat}>
                <div className={styles.profile}>
                  <img src={!message.isUser ? bot : user} alt="bot" />
                </div>
                <div
                  className={styles.message}
                  dangerouslySetInnerHTML={{
                    __html: formatCodeBlocks(message.content),
                  }}
                ></div>
              </div>
            </div>
          ))}
          {isThinking && (
            <div className={`${styles.wrapper} ${styles.ai}`}>
              <div className={styles.chat}>
                <div className={styles.profile}>
                  <img src={bot} alt="bot" />
                </div>
                <div
                  className={styles.message + " " + styles.thinking_placeholder}
                >
                  Thinking
                  <span className={styles.dot}>.</span>
                  <span className={styles.dot}>.</span>
                  <span className={styles.dot}>.</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <form className={styles.ai_form} onSubmit={handleSubmit}>
          <textarea
            className={styles.ai_textArea}
            name="message"
            rows="1"
            cols="1"
            placeholder="Ask AЯYHƆ..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyUp={handleKeyUp}
            disabled={isRateLimited || isThinking}
            maxLength={4000}
          ></textarea>
          <button
            className={styles.ai_submit}
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
        <p className={styles.info_text}>
          {isRateLimited
            ? `You have reached your limit. It will be reset after ${countdown} seconds.`
            : "AЯYHƆ can make mistakes. Check important info."}
        </p>
      </div>
    </div>
  );
};

export default ChirpAI;