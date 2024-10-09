import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import "../styles/login.css";

const LoginScript = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const apiUrl = import.meta.env.VITE_API_BASE_URL;

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

  useEffect(() => {
    document.body.classList.add("login-page");
    return () => {
      document.body.classList.remove("login-page");
    };
  }, []);

  return (
    <form id="loginForm" onSubmit={handleSubmit}>
      {loading ? (
        <div className="spinner-container">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
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
  );
};

export default LoginScript;
