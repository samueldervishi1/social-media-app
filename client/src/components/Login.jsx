import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Modal } from "react-bootstrap";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { Snackbar } from "@mui/material";
import customLoadingGif from "../assets/ZKZg.gif";
import styles from "../styles/login.module.css";

import { useAuth } from "../auth/AuthContext";

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
  const [serverStatus, setServerStatus] = useState(null);
  const [healthMessage, setHealthMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState("success");

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHealthStatus = async () => {
      try {
        const response = await axios.get("http://localhost:5130/api/v2/health");
        if (response.data.status === "Server is running smoothly!") {
          setServerStatus("healthy");
          setHealthMessage("Server is running smoothly");
        } else {
          setServerStatus("unhealthy");
          setHealthMessage("Unexpected server status");
        }
      } catch (error) {
        if (error.code === "ERR_NETWORK") {
          setServerStatus("info");
          setHealthMessage(
            "Server might be running, but the status checker is down!"
          );
        } else {
          setServerStatus("danger");
          setHealthMessage(
            "Server is experiencing an outage right now. We are working to bring it up  as soon as possible. Please be patient!"
          );
        }
      }
    };

    fetchHealthStatus();

    const intervalId = setInterval(fetchHealthStatus, 120000);

    return () => clearInterval(intervalId);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setLoading(true);

    const username = event.target.username.value;
    const password = event.target.password.value;

    try {
      const response = await fetch(`http://localhost:8080/api/v2/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const token = await response.text();

        if (token && token.startsWith("eyJhbGciOi")) {
          login(token);

          const decodedToken = JSON.parse(atob(token.split(".")[1]));

          if (decodedToken.twoFa !== undefined) {
            if (decodedToken.twoFa === true) {
              // navigate("/security/2fa/verify");
              navigate("/home");
            } else {
              navigate("/home");
            }
          } else {
            console.log("twoFa field is not present in the token.");
          }
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
      const response = await fetch(
        `http://localhost:8080/api/v2/users/update-password?username=${username}&newPassword=${newPassword}`,
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
    document.body.classList.add("login_page");
    return () => {
      document.body.classList.remove("login_page");
    };
  }, []);

  const toggleMessage = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <div
        className={`${styles.text_center} ${styles.my_3} ${styles.emoji_tooltip_container}`}
      >
        <div
          className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ""}`}
          onClick={toggleMessage}
        >
          {isOpen ? <ArrowForwardIosIcon /> : <ArrowBackIosIcon />}
        </div>
        <div
          className={`${styles.message} ${isOpen ? styles.messageOpen : ""} 
          ${serverStatus === "healthy" ? styles.healthy : ""}
          ${serverStatus === "danger" ? styles.danger : ""}
          ${serverStatus === "unhealthy" ? styles.info : ""}
          ${serverStatus === "info" ? styles.info : ""}`}
        >
          {healthMessage}
        </div>
      </div>

      <form
        id="loginForm"
        onSubmit={handleSubmit}
        className={styles.login_form}
      >
        {loading ? (
          <div className={styles.spinner_container}>
            <img
              src={customLoadingGif}
              className={styles.custom_login_loader}
              alt="Loading..."
            />
          </div>
        ) : (
          <div className={styles.screen}>
            <div className={styles.glass_effect}>
              <div className={styles.container_login}>
                <p className={styles.fill}>
                  Enter username and password to login.
                </p>
                <hr />
                {error && <p className={styles.error_message_login}>{error}</p>}

                <label htmlFor="username">
                  <b className={styles.username_login}>Username</b>
                </label>
                <input
                  type="text"
                  placeholder="Enter Username"
                  name="username"
                  id="username"
                  required
                  className={styles.input}
                />

                <label htmlFor="password">
                  <b className={styles.password_login}>Password</b>
                </label>
                <div className={styles.password_input_container}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter Password"
                    name="password"
                    id="password"
                    required
                    className={styles.input}
                  />
                  <span
                    className={styles.password_toggle_icon}
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </span>
                </div>

                <p
                  className={styles.forgot_password}
                  onClick={() => setShowModal(true)}
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

                <p className={styles.signup}>
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
              <div className={styles.password_input_container}>
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="modalNewPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="form-control"
                />
                <span
                  className={styles.password_toggle_icon}
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
              <div className={styles.password_input_container}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="modalConfirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="form-control"
                />
                <span
                  className={styles.password_toggle_icon}
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </span>
              </div>
            </div>
            {passwordUpdateMessage && (
              <p
                className={
                  passwordUpdateSuccess
                    ? styles.text_success
                    : styles.text_danger
                }
              >
                {passwordUpdateMessage}
              </p>
            )}
            <button
              type="submit"
              disabled={loadingUpdate}
              className={styles.custom_update_password_btn}
            >
              {loadingUpdate ? (
                <img
                  src={customLoadingGif}
                  className={styles.custom_login_loader}
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