import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import "../styles/register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    givenName: "",
    familyName: "",
    email: "",
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `http://localhost:5000/api/v1/users/register`,
        formData
      );
      if (response.status === 200) {
        alert("User registered successfully!");
        navigate("/home");
      }
    } catch (error) {
      console.error("Error registering user:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message);
      } else {
        setError("An unexpected error occurred. Please try again later.");
      }
    }
  };

  useEffect(() => {
    document.body.classList.add("register-page");
    return () => {
      document.body.classList.remove("register-page");
    };
  }, []);

  return (
    <div id="main">
      <div className="screen">
        <form id="registrationForm" onSubmit={handleSubmit}>
          <div className="container-sign">
            <p className="fill">Enter details below to create an account.</p>
            <hr />

            {error && <p className="error-message-register">{error}</p>}

            <label htmlFor="givenName">
              <b className="name-register">Given Name</b>
            </label>
            <input
              type="text"
              placeholder="Enter Given Name"
              name="givenName"
              id="givenName"
              value={formData.givenName}
              onChange={handleChange}
              required
            />

            <label htmlFor="familyName">
              <b className="name-register">Family Name</b>
            </label>
            <input
              type="text"
              placeholder="Enter Family Name"
              name="familyName"
              id="familyName"
              value={formData.familyName}
              onChange={handleChange}
              required
            />

            <label htmlFor="email">
              <b className="name-register">Email</b>
            </label>
            <input
              type="text"
              placeholder="Enter Email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label htmlFor="username">
              <b className="name-register">Username</b>
            </label>
            <input
              type="text"
              placeholder="Enter Username"
              name="username"
              id="username"
              value={formData.username}
              onChange={handleChange}
              required
            />

            <label htmlFor="password">
              <b className="name-register">Password</b>
            </label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
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
              Register
            </button>
            <p className="signin">
              Already have an account? <Link to="/login">Sign in</Link>.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
