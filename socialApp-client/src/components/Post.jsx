import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CiImageOn, CiLocationArrow1 } from "react-icons/ci";
import { MdOutlineEmojiEmotions } from "react-icons/md";
// import Picker from "emoji-picker-react";
import "../styles/post.css";

const PostForm = () => {
  const [postContent, setPostContent] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
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
    const postData = { content: postContent };

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
      setSelectedImage(null);
    } catch (error) {
      console.error("Error creating post:", error.message);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEmojiClick = (event, emojiObject) => {
    console.log("Selected emoji object:", emojiObject);
    if (emojiObject && emojiObject.emoji) {
      setPostContent((prevContent) => prevContent + emojiObject.emoji);
      setShowEmojiPicker(false);
    } else {
      console.error("No valid emoji selected:", emojiObject);
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
        {selectedImage && (
          <img src={selectedImage} alt="Selected" className="preview-image" />
        )}
        <textarea
          placeholder={placeholderText}
          value={postContent}
          onChange={handlePostContentChange}
          rows={4}
          required
        />

        <div className="post-form-actions">
          <div className="icons-container">
            <label htmlFor="image-upload">
              <CiImageOn className="icon" title="Image" />
              <input
                type="file"
                id="image-upload"
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
            <MdOutlineEmojiEmotions
              className="icon"
              title="Emoji"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
            />
            <CiLocationArrow1 className="icon" title="Location" />
          </div>
          <button type="submit" className="post-the-post">
            Post
          </button>
        </div>
        {showEmojiPicker && (
          <div className="emoji-picker">
            <Picker onEmojiClick={handleEmojiClick} />
          </div>
        )}
      </form>
    </div>
  );
};

export default PostForm;
