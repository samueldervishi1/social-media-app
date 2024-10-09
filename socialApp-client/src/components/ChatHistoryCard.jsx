import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { IoIosArrowRoundBack } from "react-icons/io";
import loaderImage from "/home/samuel/Documents/social-media-app/socialApp-client/src/assets/ZKZg.gif";
import "../styles/chat-history-card.css";

const formatCodeBlocks = (text) => {
  let formattedText = text
    .replace(/```(.*?)```/gs, "<pre class='terminal'><code>$1</code></pre>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .split("\n")
    .map((line) =>
      line.startsWith("- ") ? `<li>${line.substring(2)}</li>` : `<p>${line}</p>`
    )
    .join("\n")
    .replace(/(<li>.*<\/li>\s*){2,}/g, "<ul>$&</ul>");

  return formattedText;
};

const ChatHistoryCard = () => {
  const [firstQuestion, setFirstQuestion] = useState(null);
  const [sessionId, setSessionId] = useState("");
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [history, setHistory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [delayOver, setDelayOver] = useState(false);
  const navigate = useNavigate();

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
    const fetchHistory = async () => {
      const userId = getUserIdFromToken();
      if (userId) {
        try {
          const response = await axios.get(
            `http://localhost:5000/api/v1/history/get/${userId}`
          );
          const data = response.data;
          if (data.questionAnswerPairs.length > 0) {
            setFirstQuestion(data.questionAnswerPairs[0].question);
            setSessionId(data.sessionId);
          }
        } catch (error) {
          console.error("Error fetching chat history:", error);
        }
      }
    };

    fetchHistory();

    const timer = setTimeout(() => {
      setDelayOver(true);
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [apiUrl]);

  const fetchFullHistory = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/history/get/sessionId/${sessionId}`
      );
      setHistory(response.data);
    } catch (error) {
      console.error("Error fetching full chat history:", error);
    }
  };

  const handleCardClick = () => {
    if (!showFullHistory) {
      fetchFullHistory();
    }
    setShowFullHistory((prev) => !prev);
  };

  const handleBackHome = () => {
    navigate("/home");
  };

  console.log("isLoading:", isLoading);
  console.log("delayOver:", delayOver);

  return (
    <div>
      <div className="h1-ac-button">
        <h1 className="ac-pg" style={{color:"white"}}>ChirpAI History</h1>
      </div>
      {isLoading || !delayOver ? (
        <div className="text-lader">
          <img src={loaderImage} alt="Loading..." style={{ width: 30 }} />
        </div>
      ) : (
        <div className="chat-history-card" onClick={handleCardClick}>
          <div className="card-content">
            {showFullHistory ? (
              <div className="full-history">
                <h4>Full Chat History</h4>
                {history ? (
                  history.questionAnswerPairs.map((pair, index) => (
                    <div key={index}>
                      <div>
                        <p>
                          <strong>Question:</strong>
                        </p>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: formatCodeBlocks(pair.question),
                          }}
                        />
                      </div>
                      <div>
                        <p>
                          <strong>Answer:</strong>
                        </p>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: formatCodeBlocks(pair.answer),
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Loading...</p>
                )}
              </div>
            ) : (
              <p>{firstQuestion ? firstQuestion : "No History Available"}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHistoryCard;
