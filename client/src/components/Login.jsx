import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Snackbar } from "@mui/material";
import customLoadingGif from "../assets/ZKZg.gif";
import "../styles/login.css";
import { getUserIdFromToken } from "../auth/authUtils";

const LoginScript = () => {
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

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState("success");

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setLoading(true);

    const username = event.target.username.value;
    const password = event.target.password.value;

    try {
      const response = await fetch(`http://localhost:5000/api/v2/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.text();

        if (data && data.startsWith("eyJhbGciOi")) {
          const token = data;
          localStorage.setItem("token", token);

          const userId = getUserIdFromToken();

          navigate("/home");
        } else {
          setError("Unexpected response from the server.");
          setLoading(false);
        }
      } else {
        const errorMessage = await response.text();
        setError(errorMessage || "Login failed. Please try again.");
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
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/v2/users/update-password?username=${username}&newPassword=${newPassword}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setPasswordUpdateSuccess(true);
        setSnackbarMessage("Password updated successfully!");
        setSnackbarType("success");
        setOpenSnackbar(true);
        setShowModal(false);

        setTimeout(() => {
          setUsername("");
          setNewPassword("");
          setConfirmPassword("");
          setPasswordUpdateMessage("");
          setPasswordUpdateSuccess(false);
        }, 5000);
      } else {
        const errorMessage = await response.text();
        setPasswordUpdateMessage(errorMessage);
        setSnackbarMessage(errorMessage);
        setSnackbarType("error");
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error("Error updating password:", error.message);
      setPasswordUpdateMessage(
        "An error occurred while updating the password."
      );
      setSnackbarMessage("An error occurred while updating the password.");
      setSnackbarType("error");
      setOpenSnackbar(true);
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
                  Don&apos;t have an account?{" "}
                  <Link to="/register">Sign up</Link>.
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
              <p
                className={
                  passwordUpdateSuccess ? "text-success" : "text-danger"
                }
              >
                {passwordUpdateMessage}
              </p>
            )}
            <button
              type="submit"
              disabled={loadingUpdate}
              className="btn btn-primary"
            >
              {loadingUpdate ? (
                <img
                  src={customLoadingGif}
                  className="custom-login-loader"
                  alt="Loading..."
                />
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        </Modal.Body>
      </Modal>

      <Snackbar
        open={openSnackbar}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        message={snackbarMessage}
        autoHideDuration={5000}
        ContentProps={{
          style: {
            backgroundColor: snackbarType === "success" ? "green" : "red",
          },
        }}
      />
    </div>
  );
};

export default LoginScript;