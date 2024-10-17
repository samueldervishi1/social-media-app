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

const ChripAIHistory = () => {
  const [firstQuestion, setFirstQuestion] = useState(null);
  const [sessionId, setSessionId] = useState("");
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [history, setHistory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [delayOver, setDelayOver] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [histories, setHistories] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const navigate = useNavigate();

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

  const fetchHistories = async () => {
    const userId = getUserIdFromToken();
    if (userId) {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/v2/history/get/${userId}`
        );
        setHistories(response.data);
      } catch (error) {
        console.error("Error fetching chat histories:", error);
      }
    }
  };

  useEffect(() => {
    let lastFetchTime = Date.now();
    fetchHistories();

    const timer = setTimeout(() => {
      setDelayOver(true);
      setIsLoading(false);
    }, 2000);

    const intervalId = setInterval(fetchHistories, 60000);

    return () => {
      clearTimeout(timer);
      clearInterval(intervalId);
    };
  }, []);

  const fetchFullHistory = async (sessionId) => {
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

  const handleCardClick = (sessionId) => {
    if (!showFullHistory) {
      fetchFullHistory(sessionId);
      setSelectedSessionId(sessionId);
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
          <h1
            className="ac-pg"
            style={{
              color: "white",
              display: "flex",
              justifyContent: "space-evenly",
              alignItems: "center",
            }}
          >
            ChirpAI History
            <Button variant="secondary" onClick={fetchHistories}>
              Refresh
            </Button>
          </h1>
        </div>

        {isLoading || !delayOver ? (
          <div className="text-lader">
            <img src={loaderImage} alt="Loading..." style={{ width: 30 }} />
          </div>
        ) : (
          <div>
            {histories.length > 0 ? (
              histories.map((historyItem) => (
                <div
                  key={historyItem.sessionId}
                  className="chat-history-card"
                  onClick={() => handleCardClick(historyItem.sessionId)}
                >
                  <div className="card-content">
                    {historyItem.questionAnswerPairs.map((pair, index) => (
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
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p>No History Available</p>
            )}
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

export default ChripAIHistory;
