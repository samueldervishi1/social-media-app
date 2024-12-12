import React, { useState, useEffect } from "react";
import axios from "axios";
import { Alert } from "react-bootstrap";

const HealthCheck = () => {
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState("");
  const [emoji, setEmoji] = useState("");

  useEffect(() => {
    const fetchHealthStatus = async () => {
      try {
        const response = await axios.get("http://localhost:5130/api/v2/health");

        if (response.data.status === "Server is running smoothly!") {
          setStatus("success");
          setMessage("Server is running smoothly!");
          setEmoji("😊");
        } else {
          setStatus("warning");
          setMessage("Server responded with an unexpected result.");
          setEmoji("🤔");
        }
      } catch (error) {
        if (error.code === "ERR_NETWORK") {
          setStatus("info");
          setMessage(
            "Server might be running, but the status checker is down!"
          );
          setEmoji("😶");
        } else {
          setStatus("danger");
          setMessage(
            "Server is experiencing an outage right now. We are working to bring it up  as soon as possible. Please be patient!"
          );
          setEmoji("😢");
        }
      }
    };

    fetchHealthStatus();
  }, []);

  return (
    <div className="container text-center mt-5">
      <h1>Server Health Check</h1>
      {status && (
        <Alert className={`alert alert-${status} mt-4`}>
          <div style={{ fontSize: "3rem" }}>{emoji}</div>
          <p className="mt-3">{message}</p>
        </Alert>
      )}
    </div>
  );
};

export default HealthCheck;