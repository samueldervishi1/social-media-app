import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import customLoadingGif from "../assets/ZKZg.gif";

import { getUserIdFromToken } from "../auth/authUtils";

const Verify2FA = () => {
  const [twoFACode, setTwoFACode] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const userId = getUserIdFromToken();

  const handleVerify2FA = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const response = await axios.post(
        `http://localhost:5130/totp/verify/${userId}`,
        { code: twoFACode }
      );

      if (response.data.valid) {
        navigate("/home");
      } else {
        setError("Invalid 2FA code. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying 2FA code:", error);
      setError("Failed to verify 2FA code.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleVerify2FA();
    }
  };

  return (
    <div className="container">
      <h3 style={{ textAlign: "center", marginTop: 20 }}>
        Verify Your 2FA Code
      </h3>
      {loading ? (
        <div className="spinner-container">
          <img
            src={customLoadingGif}
            className="custom-login-loader"
            alt="Loading..."
          />
        </div>
      ) : (
        <div className="screen">
          <div className="glass-effect">
            <div className="container-login">
              <label htmlFor="twoFACode">Enter the 2FA code</label>
              <input
                type="text"
                id="twoFACode"
                value={twoFACode}
                onChange={(e) => setTwoFACode(e.target.value)}
                onKeyDown={handleKeyDown}
                required
                className="form-control"
              />

              {error && <p className="error-message-login">{error}</p>}

              <button
                style={{
                  background: "linear-gradient(to right, #0072ff, #00c6ff)",
                  color: "white",
                  padding: "16px 20px",
                  margin: "8px 0",
                  border: "none",
                  cursor: "pointer",
                  width: "100%",
                  opacity: "0.9",
                  borderRadius: "20px",
                }}
                onClick={handleVerify2FA}
              >
                Verify Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Verify2FA;