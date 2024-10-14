import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/post.css";

const PostForm = () => {
  const [postContent, setPostContent] = useState("");
  const navigate = useNavigate();
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

  const handlePostContentChange = (event) => {
    setPostContent(event.target.value);
  };

  const handlePostSubmit = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token not found in localStorage.");
      return;
    }

    const username = getUsernameFromToken(token);

    const postData = {
      content: postContent,
    };

    try {
      const response = await axios.post(
        `http://localhost:5000/api/v1/posts/create/${username}`,
        postData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        alert("Post created successfully!");
        localStorage.removeItem("cachedPosts");
        window.location.reload();
      }
      setPostContent("");
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
        <textarea
          placeholder={placeholderText}
          value={postContent}
          onChange={handlePostContentChange}
          rows={4}
          required
        />
        <button type="submit" className="post-the-post">
          Post
        </button>
      </form>
    </div>
  );
};

export default PostForm;
