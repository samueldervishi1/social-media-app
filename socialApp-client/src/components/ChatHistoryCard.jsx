import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Modal } from "react-bootstrap";
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
    let lastFetchTime = Date.now();
    const fetchHistory = async () => {
      const userId = getUserIdFromToken();
      if (userId) {
        try {
          const response = await axios.get(
            `http://localhost:5000/api/v2/history/get/${userId}`
          );
          const data = response.data;
          if (data && data.questionAnswerPairs.length > 0) {
            setFirstQuestion(data.questionAnswerPairs[0].question);
            setSessionId(data.sessionId);
            lastFetchTime = Date.now();
          } else {
            setFirstQuestion(null);
            setSessionId("");
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

    const intervalId = setInterval(fetchHistory, 60000);

    const noNewHistoryTimer = setInterval(() => {
      if (Date.now() - lastFetchTime >= 120000) {
        console.log("No new history");
      }
    }, 10000);

    return () => {
      clearTimeout(timer);
      clearInterval(intervalId);
      clearInterval(noNewHistoryTimer);
    };
  }, [apiUrl]);

  const fetchFullHistory = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/v2/history/get/sessionId/${sessionId}`
      );
      if (
        response.data &&
        response.data.questionAnswerPairs &&
        response.data.questionAnswerPairs.length > 0
      ) {
        setHistory(response.data);
      } else {
        console.log("No history available.");
        setHistory(null);
      }
    } catch (error) {
      console.error("Error fetching full chat history:", error.message);
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

  const handleDeleteHistory = async () => {
    const userId = getUserIdFromToken();
    if (userId && sessionId) {
      try {
        await axios.delete(
          `http://localhost:5000/api/v2/history/delete/${sessionId}`
        );
        setHistory(null);
        setFirstQuestion(null);
        setSessionId("");
        setShowDeleteModal(false);
        console.log("Chat history deleted successfully");
      } catch (error) {
        console.error("Error deleting chat history:", error);
      }
    }
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <div style={{ flexGrow: 1 }}>
        <div className="h1-ac-button">
          <h1 className="ac-pg" style={{ color: "white" }}>
            ChirpAI History
          </h1>
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
                  <h4 style={{ textAlign: "center" }}>Full Chat History</h4>
                  {history && history.questionAnswerPairs.length > 0 ? (
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
                    <p>No full history available.</p>
                  )}
                </div>
              ) : (
                <p>{firstQuestion ? firstQuestion : "No History Available"}</p>
              )}
            </div>
          </div>
        )}
      </div>
      <div
        style={{ marginTop: "20px", textAlign: "center", marginBottom: "20px" }}
      >
        <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
          Delete History
        </Button>
      </div>
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete your chat history?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteHistory}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ChatHistoryCard;
