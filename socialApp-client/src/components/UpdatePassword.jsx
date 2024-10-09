import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import loaderImage from "../assets/ZKZg.gif";
import "../styles/password.css";

const UpdatePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [oldPasswordVisible, setOldPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ oldPassword: "", newPassword: "", confirmPassword: "" });

    if (newPassword !== confirmPassword) {
      setErrors({ ...errors, confirmPassword: "New passwords don't match" });
      return;
    }

    setLoading(true);
    try {
      const userId = getUserIdFromToken();
      await axios.put(
        `http://localhost:5000/api/v1/users/update/update-password/${userId}`,
        {
          oldPassword,
          newPassword,
        }
      );
      setMessage("Password updated successfully");
      setTimeout(() => navigate("/profile"), 2000);
    } catch (error) {
      console.error("Error updating password:", error);
      if (error.response?.status === 400) {
        setErrors({
          ...errors,
          oldPassword:
            error.response?.data?.message || "Incorrect old password",
        });
      } else {
        alert("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <div className="update-password-card">
      <h2>Update Password</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formOldPassword">
          <Form.Label>Old Password</Form.Label>
          <div className="password-field">
            <Form.Control
              type={oldPasswordVisible ? "text" : "password"}
              placeholder="Enter old password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              isInvalid={!!errors.oldPassword}
            />
            <span
              className="eye-icon"
              onClick={() => setOldPasswordVisible(!oldPasswordVisible)}
            >
              {oldPasswordVisible ? <FaEyeSlash /> : <FaEye />}
            </span>
            <Form.Control.Feedback type="invalid">
              {errors.oldPassword}
            </Form.Control.Feedback>
          </div>
        </Form.Group>
        <Form.Group controlId="formNewPassword">
          <Form.Label>New Password</Form.Label>
          <div className="password-field">
            <Form.Control
              type={newPasswordVisible ? "text" : "password"}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              isInvalid={!!errors.newPassword}
            />
            <span
              className="eye-icon"
              onClick={() => setNewPasswordVisible(!newPasswordVisible)}
            >
              {newPasswordVisible ? <FaEyeSlash /> : <FaEye />}
            </span>
            <Form.Control.Feedback type="invalid">
              {errors.newPassword}
            </Form.Control.Feedback>
          </div>
        </Form.Group>
        <Form.Group controlId="formConfirmPassword">
          <Form.Label>Confirm New Password</Form.Label>
          <div className="password-field">
            <Form.Control
              type={confirmPasswordVisible ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              isInvalid={!!errors.confirmPassword}
            />
            <span
              className="eye-icon"
              onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
            >
              {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
            </span>
            <Form.Control.Feedback type="invalid">
              {errors.confirmPassword}
            </Form.Control.Feedback>
          </div>
        </Form.Group>
        <Button
          variant="primary"
          type="submit"
          disabled={loading}
          className="submit-button"
        >
          {loading ? (
            <img
              src={loaderImage}
              style={{ width: 20, marginRight: 10 }}
              alt="Loading..."
            />
          ) : (
            "Update Password"
          )}
        </Button>
        <Button
          variant="secondary"
          type="button"
          onClick={handleCancel}
          className="cancel-button"
        >
          Cancel
        </Button>
      </Form>
    </div>
  );
};

export default UpdatePassword;
