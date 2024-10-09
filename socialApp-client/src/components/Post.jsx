import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/post.css";

const PostForm = () => {
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        const expirationTime = decodedToken.exp * 1000;
        return Date.now() < expirationTime;
      } catch (error) {
        console.error("Error decoding token: ", error.message);
        return false;
      }
    } else {
      return false;
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  const handlePostTitleChange = (event) => {
    setPostTitle(event.target.value);
  };

  const handlePostContentChange = (event) => {
    setPostContent(event.target.value);
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handlePostSubmit = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token not found in localStorage.");
      return;
    }

    const username = getUsernameFromToken(token);

    // Prepare form data to include file
    const formData = new FormData();
    formData.append("title", postTitle);
    formData.append("content", postContent);
    formData.append("file", selectedFile);

    try {
      const response = await axios.post(
        `http://localhost:5000/api/v1/posts/create/${username}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        alert("Post created successfully!");
        localStorage.removeItem("cachedPosts");
        window.location.reload();
      }

      setPostTitle("");
      setPostContent("");
      setSelectedFile(null); // Clear file input after submission
    } catch (error) {
      console.error("Error creating post:", error.message);
    }
  };

  const getUsernameFromToken = (token) => {
    try {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      return decodedToken.sub;
    } catch (error) {
      console.error("Error decoding token:", error.message);
      return null;
    }
  };

  const placeholderText = `What's on your mind, today ${getUsernameFromToken(
    localStorage.getItem("token")
  )} ?`;

  return (
    <div className="post-form">
      <form onSubmit={handlePostSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={postTitle}
          onChange={handlePostTitleChange}
          required
        />
        <textarea
          placeholder={placeholderText}
          value={postContent}
          onChange={handlePostContentChange}
          rows={4}
          required
        />
        <input type="file" onChange={handleFileChange} />
        <button type="submit" className="post-the-post">
          Post
        </button>
      </form>
    </div>
  );
};

export default PostForm;
