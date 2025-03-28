import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import bot from '../assets/bot.png';
import user from '../assets/reshot-icon-user-G3RUDHZMQ6.svg';
import loaderGif from '../assets/377.gif';
import { FaRegPenToSquare } from 'react-icons/fa6';
import { LuSendHorizontal } from 'react-icons/lu';
import styles from '../styles/ai.module.css';

import { getUserIdFromServer } from '../auth/authUtils';

const API_URL = import.meta.env.VITE_API_URL;

const ChatAI = () => {
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const chatContainerRef = useRef(null);
  const [isThinking, setIsThinking] = useState(false);
  const [hideHeading, setHideHeading] = useState(false);
  const [isMobileView, setIsMobileView] = useState();
  const [showContinueMessage, setShowContinueMessage] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isTypingFinished, setIsTypingFinished] = useState(true);
  const [isProcessingResponse, setIsProcessingResponse] = useState(false);

  useEffect(() => {
    const fetchUserId = async () => {
      const result = await getUserIdFromServer();
      setUserId(result);
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const resetChat = () => {
    const newSessionId = uuidv4();
    localStorage.setItem('sessionId', newSessionId);
    setChatMessages([]);
    setUserInput('');
    setHideHeading(false);
  };

  useEffect(() => {
    resetChat();
  }, []);

  //format the code block provided by the model
  const formatCodeBlocks = (text) => {
    const codeBlockRegex = /```(.*?)(\n([\s\S]*?))?```/gs;

    let formattedText = text.replace(codeBlockRegex, (match, lang, _, code) => {
      const escapedCode = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      return `
        <div class="${styles.terminal_block}">
          <div class="${styles.terminal_header}">
            ${lang ? lang.trim() : 'code'}
          </div>
          <pre><code>${escapedCode}</code></pre>
        </div>
      `;
    });
    formattedText = formattedText.replace(
      /\*\*(.*?)\*\*/g,
      '<strong>$1</strong>'
    );

    formattedText = formattedText
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>');

    formattedText = formattedText
      .split('\n')
      .map((line) =>
        line.startsWith('- ') ? `<li>${line.substring(2)}</li>` : line
      )
      .join('<br />')
      .replace(/(<li>.*<\/li>\s*){2,}/g, '<ul>$&</ul>');

    return formattedText.includes('<li>')
      ? `<ul>${formattedText}</ul>`
      : formattedText;
  };

  const getSessionId = () => {
    return localStorage.getItem('sessionId');
  };

  //send the question to the model
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userInput.trim()) {
      return;
    }

    setHideHeading(true);

    if (isRateLimited || isProcessingResponse) return;

    if (userInput.length > 4000) {
      const errorResponse = {
        content: 'Your input exceeds the 4000 character limit.',
        isUser: false,
      };
      setChatMessages((prevMessages) => [...prevMessages, errorResponse]);
      return;
    }

    setIsLoading(true);
    setIsThinking(true);
    setIsProcessingResponse(true);

    const message = { content: userInput, isUser: true };
    setChatMessages((prevMessages) => [...prevMessages, message]);
    setUserInput('');

    console.log('Sending question to backend...');

    const handleRateLimit = () => {
      setIsRateLimited(true);
      setCountdown(30);
      setShowContinueMessage(false);

      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setIsRateLimited(false);
            setCountdown(0);
            setShowContinueMessage(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    try {
      const response = await axios.post(
        `${API_URL}quantum-query`,
        {
          message: userInput,
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'X-App-Version': import.meta.env.VITE_APP_VERSION,
          },
        }
      );

      if (response.status === 200) {
        const responseData = response.data.answer || 'No response.';

        setChatMessages((prevMessages) => [
          ...prevMessages,
          { content: '', isUser: false },
        ]);

        simulateTypingEffect(responseData);
        setIsThinking(false);

        const sessionId = getSessionId();
        await axios.post(
          `${API_URL}data-cast/${userId}/session/${sessionId}`,
          {
            message: userInput,
            answer: responseData,
          },
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
              'X-App-Version': import.meta.env.VITE_APP_VERSION,
            },
          }
        );
      } else {
        console.error('Error: ', response.statusText);
        setIsThinking(false);
        setIsProcessingResponse(false);
      }
    } catch (error) {
      if (error.response?.status === 405) {
        handleRateLimit();
        const errorMessage =
          'You have reached your request limit. Please wait 30 seconds before trying again.';
        const errorResponse = {
          content: errorMessage,
          isUser: false,
        };
        setIsThinking(false);
        setChatMessages((prevMessages) => [...prevMessages, errorResponse]);
      } else {
        console.error('Error: ', error.message);
        const errorMessage =
          'Something went wrong. Please check your internet connection or try again later.';
        const errorResponse = {
          content: errorMessage,
          isUser: false,
        };
        setChatMessages((prevMessages) => [...prevMessages, errorResponse]);
        setIsThinking(false);
      }
      setIsProcessingResponse(false);
    }

    setIsLoading(false);
  };

  //simulate a typing effect
  const simulateTypingEffect = (text) => {
    setIsTypingFinished(false);
    const chunks = text.split(/(\s+)/);
    let currentContent = '';
    const interval = 20;
    const batchSize = 3;

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);

      setTimeout(() => {
        currentContent += batch.join('');
        const formattedContent = formatCodeBlocks(currentContent);

        setChatMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          const lastIndex = updatedMessages.length - 1;

          if (lastIndex >= 0 && !updatedMessages[lastIndex].isUser) {
            updatedMessages[lastIndex].content = formattedContent;
          } else {
            updatedMessages.push({
              content: formattedContent,
              isUser: false,
            });
          }

          return updatedMessages;
        });

        if (i + batchSize >= chunks.length) {
          setIsThinking(false);
          setIsTypingFinished(true);
          setIsProcessingResponse(false);
          scrollToBottom();
        }
      }, interval * (i / batchSize));
    }
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

  const predefinedQuestions = [
    'Summarize text',
    'Help me write',
    'Surprise me',
    'Make a plan',
  ];

  const handleClickPredefinedQuestion = (question) => {
    setUserInput(question);
    setHideHeading(true);
  };

  return (
    <div className={styles.chat_container_wrapper}>
      <div className={styles.chat_header}>
        <button
          className={styles.new_chat_button}
          onClick={resetChat}
          title="New Chat"
        >
          <FaRegPenToSquare />
          <span>New Chat</span>
        </button>
      </div>

      <div className={styles.main_content_ai}>
        {!hideHeading && (
          <div className={styles.welcome_section}>
            <h1 className={styles.heading_center}>
              What do you need help with?
            </h1>
            <div className={styles.predefined_questions}>
              {predefinedQuestions.map((question, index) => (
                <button
                  key={index}
                  className={styles.predefined_button}
                  onClick={() => handleClickPredefinedQuestion(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div
          id={styles.chat_container}
          ref={chatContainerRef}
          className={hideHeading ? styles.chat_active : ''}
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
                  <img
                    src={!message.isUser ? bot : user}
                    alt={!message.isUser ? 'bot' : 'user'}
                    className={
                      !message.isUser ? styles.botImage : styles.userImage
                    }
                  />
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
                  <img className={styles.botImage} src={bot} alt='bot' />
                </div>
                <div
                  className={styles.message + ' ' + styles.thinking_placeholder}
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
        
        <div className={styles.chat_input_area}>
          <form className={styles.ai_form} onSubmit={handleSubmit}>
            <textarea
              className={styles.ai_textArea}
              name='message'
              rows='1'
              cols='1'
              placeholder='Ask Sypher...'
              value={userInput}
              onChange={(e) => {
                setUserInput(e.target.value);
              }}
              onKeyUp={handleKeyUp}
              disabled={isRateLimited || isThinking || isProcessingResponse}
              maxLength={4000}
            />
            <button
              className={styles.ai_submit}
              type='submit'
              disabled={isRateLimited || isThinking || isProcessingResponse}
            >
              {isThinking || isProcessingResponse ? (
                <img
                  src={loaderGif}
                  alt='Loading'
                  className={styles.loader_icon}
                />
              ) : (
                <LuSendHorizontal />
              )}
            </button>
          </form>
          <p className={styles.info_text}>
            {isRateLimited
              ? countdown > 0
                ? `Too many requests. Please wait ${countdown} seconds before trying again.`
                : 'You can continue now.'
              : 'Sypher can make mistakes. Check important info.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatAI;