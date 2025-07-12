import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import { getUserIdFromServer, getUsernameFromServer } from '../auth/authUtils';
import bot from '../assets/image2vector.svg';
import user from '../assets/reshot-icon-user-G3RUDHZMQ6.svg';
import loaderGif from '../assets/377.gif';
import { FaRegPenToSquare } from 'react-icons/fa6';
import { LuSendHorizontal } from 'react-icons/lu';
import styles from '../styles/ai.module.css';

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
  const [, setIsMobileView] = useState();
  const [, setShowContinueMessage] = useState(false);
  const [userId, setUserId] = useState(null);
  const [, setIsTypingFinished] = useState(true);
  const [isProcessingResponse, setIsProcessingResponse] = useState(false);
  const [isNearLimit, setIsNearLimit] = useState(false);
  const [username, setUsername] = useState('');
  const [predefinedQuestions, setPredefinedQuestions] = useState([]);
  const [, setLoadingUsername] = useState(true);

  useEffect(() => {
    const fetchUserId = async () => {
      const result = await getUserIdFromServer();
      setUserId(result);
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchUsername = async () => {
      const result = await getUsernameFromServer();
      if (result) {
        const formattedUsername =
          result.charAt(0).toUpperCase() + result.slice(1);
        setUsername(formattedUsername);
      } else {
        setUsername(result);
      }
      setLoadingUsername(false);
    };

    fetchUsername();
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
      const language = lang?.trim() || 'plaintext';
      const cleanLanguage = language.split(':')[0];

      return `
        <div class="${styles.terminal_block}">
          <pre><code class="${cleanLanguage}">${code}</code></pre>
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
        /^[*-] /.test(line) ? `<li>${line.substring(2)}</li>` : line
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

  const formatTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getGreetingByTime = () => {
    const hour = new Date().getHours();
    let greeting = '';

    if (hour >= 5 && hour < 12) {
      greeting = 'Good morning';
    } else if (hour >= 12 && hour < 18) {
      greeting = 'Good afternoon';
    } else {
      greeting = 'Good evening';
    }

    return `${greeting}, ${username}! How can I help you today?`;
  };

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
        timestamp: formatTimestamp(),
      };
      setChatMessages((prevMessages) => [...prevMessages, errorResponse]);
      return;
    }

    setIsLoading(true);
    setIsThinking(true);
    setIsProcessingResponse(true);

    const message = {
      content: userInput,
      isUser: true,
      timestamp: formatTimestamp(),
    };
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
        `${API_URL}chatbot/query`,
        {
          message: userInput,
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
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
          `${API_URL}history/save/${userId}/session/${sessionId}`,
          {
            content: [{ message: userInput }],
            answer: responseData,
          },
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
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
          timestamp: formatTimestamp(),
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
          timestamp: formatTimestamp(),
        };
        setChatMessages((prevMessages) => [...prevMessages, errorResponse]);
        setIsThinking(false);
      }
      setIsProcessingResponse(false);
    }

    setIsLoading(false);
  };

  const simulateTypingEffect = (text) => {
    setIsTypingFinished(false);
    const chunks = text.split(/(\s+)/);
    let currentContent = '';
    const interval = 20;
    const batchSize = 3;
    const timestamp = formatTimestamp();

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);

      setTimeout(
        () => {
          currentContent += batch.join('');
          const formattedContent = formatCodeBlocks(currentContent);

          setChatMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            const lastIndex = updatedMessages.length - 1;

            if (lastIndex >= 0 && !updatedMessages[lastIndex].isUser) {
              updatedMessages[lastIndex].content = formattedContent;
              updatedMessages[lastIndex].timestamp = timestamp;
            } else {
              updatedMessages.push({
                content: formattedContent,
                isUser: false,
                timestamp: timestamp,
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
        },
        interval * (i / batchSize)
      );
    }
  };

  const autoResizeTextarea = (e) => {
    const textarea = e.target;
    const text = textarea.value;

    if (text.length > 4000) {
      setUserInput(text.substring(0, 4000));

      if (toast) {
        toast.warning('Text has been truncated to 4000 characters');
      } else {
        setIsNearLimit(true);
        setTimeout(() => setIsNearLimit(false), 3000);
      }
    } else {
      setUserInput(text);

      setIsNearLimit(text.length > 3800);
    }

    textarea.style.height = 'auto';

    const lineHeight = 24;
    const maxInitialLines = 3;
    const newHeight = Math.min(
      Math.max(lineHeight, textarea.scrollHeight),
      lineHeight * maxInitialLines
    );

    textarea.style.height = `${newHeight}px`;
  };

  const handlePaste = (e) => {
    const clipboardData = e.clipboardData || window.clipboardData;
    const pastedText = clipboardData.getData('text');

    const cursorPosition = e.target.selectionStart;
    const currentText = userInput;
    const newText =
      currentText.substring(0, cursorPosition) +
      pastedText +
      currentText.substring(e.target.selectionEnd);

    if (newText.length > 4000) {
      e.preventDefault();

      const availableSpace =
        4000 - (currentText.length - (e.target.selectionEnd - cursorPosition));

      if (availableSpace <= 0) {
        if (toast) {
          toast.error('Character limit reached. Cannot paste more text.');
        }
        return;
      }

      const truncatedPaste = pastedText.substring(0, availableSpace);

      const truncatedText =
        currentText.substring(0, cursorPosition) +
        truncatedPaste +
        currentText.substring(e.target.selectionEnd);

      setUserInput(truncatedText);

      if (toast) {
        toast.warning(
          'Pasted text has been truncated to fit the 4000 character limit'
        );
      } else {
        setIsNearLimit(true);
        setTimeout(() => setIsNearLimit(false), 3000);
      }

      setTimeout(() => {
        const textarea = e.target;
        textarea.style.height = 'auto';
        const lineHeight = 24;
        const maxInitialLines = 3;
        const newHeight = Math.min(
          Math.max(lineHeight, textarea.scrollHeight),
          lineHeight * maxInitialLines
        );
        textarea.style.height = `${newHeight}px`;
      }, 0);
    }
  };

  const scrollToBottom = () => {
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isLoading]);

  useEffect(() => {
    const fetchPredefinedQuestions = async () => {
      try {
        const response = await axios.get(`${API_URL}questions`, {
          withCredentials: true,
        });

        if (response.data && Array.isArray(response.data)) {
          setPredefinedQuestions(response.data);
          localStorage.setItem(
            'predefinedQuestions',
            JSON.stringify(response.data)
          );
        }
      } catch (error) {
        console.error('Error fetching predefined questions:', error);
        setPredefinedQuestions([]);
      }
    };
    const cached = localStorage.getItem('predefinedQuestions');
    if (cached) {
      setPredefinedQuestions(JSON.parse(cached));
    }
    fetchPredefinedQuestions();
  }, []);

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
          title='New Chat'
        >
          <FaRegPenToSquare />
          <span>New Chat</span>
        </button>
      </div>

      <div className={styles.main_content_ai}>
        {!hideHeading && (
          <div className={styles.welcome_section}>
            <h1 className={styles.heading_center}>{getGreetingByTime()}</h1>
            <div className={styles.predefined_questions}>
              {predefinedQuestions.map((question, index) => (
                <button
                  key={index}
                  className={styles.predefined_button}
                  onClick={() =>
                    handleClickPredefinedQuestion(question.question)
                  }
                >
                  <img
                    src={question.iconUrl}
                    alt={question.question}
                    width='24'
                    height='24'
                    className={styles.icon_svg}
                  />
                  {question.question}
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
                {!message.isUser && (
                  <div className={styles.profile}>
                    <img src={bot} alt='bot' className={styles.botImage} />
                  </div>
                )}
                <div>
                  <div
                    className={styles.message}
                    dangerouslySetInnerHTML={{
                      __html: formatCodeBlocks(message.content),
                    }}
                  ></div>
                  {message.timestamp && (
                    <div className={styles.message_time}>
                      {message.timestamp}
                    </div>
                  )}
                </div>
                {message.isUser && (
                  <div className={styles.profile}>
                    <img src={user} alt='user' className={styles.userImage} />
                  </div>
                )}
              </div>
            </div>
          ))}

          {isThinking && (
            <div className={`${styles.wrapper} ${styles.ai}`}>
              <div className={styles.chat}>
                <div className={styles.profile}>
                  <img className={styles.botImage} src={bot} alt='bot' />
                </div>
                <div className={styles.thinking_placeholder}>
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
              placeholder='Ask Chattr Ultra...'
              value={userInput}
              onChange={autoResizeTextarea}
              onPaste={handlePaste}
              onKeyUp={(e) => {
                if (e.keyCode === 13 && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                } else {
                  autoResizeTextarea(e);
                }
              }}
              onKeyDown={(e) => {
                if (e.keyCode === 13 && !e.shiftKey) {
                  e.preventDefault();
                }
              }}
              disabled={isRateLimited || isThinking || isProcessingResponse}
              maxLength={4000}
            />
            <div
              className={`${styles.char_counter} ${
                userInput.length > 500 ? styles.visible : ''
              } ${userInput.length > 3800 ? styles.near_limit : ''} ${
                userInput.length >= 4000 ? styles.at_limit : ''
              }`}
            >
              {userInput.length}/4000
            </div>
            {isNearLimit && (
              <div
                className={`${styles.limit_warning} ${
                  isNearLimit ? styles.visible : ''
                }`}
              >
                You are approaching or have reached the 4000 character limit
              </div>
            )}
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
              : 'Chattr Ultra can make mistakes. Check important info.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatAI;
