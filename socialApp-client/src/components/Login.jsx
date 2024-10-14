import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import checkMarkgif from "/home/samuel/Documents/social-media-app/socialApp-client/src/assets/check.gif";
import customLoadingGif from "/home/samuel/Documents/social-media-app/socialApp-client/src/assets/ZKZg.gif";
import "../styles/login.css";

const LoginScript = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordUpdateMessage, setPasswordUpdateMessage] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setLoading(true);

    const username = event.target.username.value;
    const password = event.target.password.value;

    try {
      const response = await fetch(`http://localhost:5000/api/v1/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const token = await response.text();
        localStorage.setItem("token", token);
        setTimeout(() => {
          setLoading(false);
          window.location.href = "/home";
        }, 3000);
      } else {
        const errorMessage = await response.text();
        setError(errorMessage);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error during login:", error.message);
      setError(
        "An unexpected error occurred. Please check your internet connection or try again later."
      );
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (event) => {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      setPasswordUpdateMessage("Passwords do not match.");
      return;
    }

    setLoadingUpdate(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/v1/users/update-password?username=${username}&newPassword=${newPassword}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setPasswordUpdateSuccess(true);
        setPasswordUpdateMessage("Password updated successfully!");
        setTimeout(() => {
          setShowModal(false);
          setUsername("");
          setNewPassword("");
          setConfirmPassword("");
          setPasswordUpdateMessage("");
          setPasswordUpdateSuccess(false);
        }, 2000);
      } else {
        const errorMessage = await response.text();
        setPasswordUpdateMessage(errorMessage);
      }
    } catch (error) {
      console.error("Error updating password:", error.message);
      setPasswordUpdateMessage(
        "An error occurred while updating the password."
      );
    } finally {
      setLoadingUpdate(false);
    }
  };

  useEffect(() => {
    document.body.classList.add("login-page");
    return () => {
      document.body.classList.remove("login-page");
    };
  }, []);

  return (
    <div>
      <form id="loginForm" onSubmit={handleSubmit}>
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
                <p className="fill">Enter username and password to login.</p>
                <hr />
                {error && <p className="error-message-login">{error}</p>}

                <label htmlFor="username">
                  <b className="username-login">Username</b>
                </label>
                <input
                  type="text"
                  placeholder="Enter Username"
                  name="username"
                  id="username"
                  required
                />

                <label htmlFor="password">
                  <b className="password-login">Password</b>
                </label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter Password"
                    name="password"
                    id="password"
                    required
                  />
                  <span
                    className="password-toggle-icon"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </span>
                </div>

                <p
                  className="forgot-password"
                  onClick={() => setShowModal(true)}
                  style={{
                    cursor: "pointer",
                    color:
                      "rgba(var(--bs-link-color-rgb),var(--bs-link-opacity,1))",
                    padding: "8px 16px",
                    borderRadius: "20px",
                    textDecoration: "underline",
                  }}
                >
                  Forgot Password?
                </p>

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
                  type="submit"
                >
                  Login
                </button>

                <p className="signup">
                  Don't have an account? <a href="/register">Sign up</a>.
                </p>
              </div>
            </div>
          </div>
        )}
      </form>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handlePasswordUpdate}>
            <div className="mb-3">
              <label htmlFor="modalUsername" className="form-label">
                Username:
              </label>
              <input
                type="text"
                id="modalUsername"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="form-control"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="modalNewPassword" className="form-label">
                New Password:
              </label>
              <div className="password-input-container">
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="modalNewPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="form-control"
                />
                <span
                  className="password-toggle-icon"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                >
                  {showNewPassword ? <VisibilityOff /> : <Visibility />}
                </span>
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="modalConfirmPassword" className="form-label">
                Confirm Password:
              </label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="modalConfirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="form-control"
                />
                <span
                  className="password-toggle-icon"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </span>
              </div>
            </div>
            {passwordUpdateMessage && (
              <p className="password-update-message">{passwordUpdateMessage}</p>
            )}
            {passwordUpdateSuccess && (
              <div className="logout-loader">
                <div className="logout-box">
                  <img src={checkMarkgif} alt="Update successful!" />
                  <p>Password updated successfully!</p>
                </div>
              </div>
            )}
          </form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={handlePasswordUpdate}
            disabled={loadingUpdate}
          >
            {loadingUpdate ? "Updating..." : "Update Password"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default LoginScript;
