import React, { useState } from "react";
import axios from "axios";
import { CiImageOn, CiLocationArrow1 } from "react-icons/ci";
import { MdOutlineEmojiEmotions } from "react-icons/md";
import Picker from "emoji-picker-react";
import "../styles/post.css";

import { getUsernameFromToken } from "../auth/authUtils";

const PostForm = () => {
  const [postContent, setPostContent] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Submits a new post to the server
  const handlePostSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token not found in localStorage.");
      setIsSubmitting(false);
      return;
    }

    const username = getUsernameFromToken(token);
    const postData = { content: postContent };

    try {
      const response = await axios.post(
        `http://localhost:5000/api/v2/posts/create/${username}`,
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
      console.error(
        "Error creating post:",
        error.response?.data || error.message
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handles changes to the post content input field
  const handlePostContentChange = (event) => {
    setPostContent(event.target.value);
  };

  // Handles image selection for the post
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

  // Adds a selected emoji to the post content
  const handleEmojiClick = (emojiData) => {
    if (emojiData && emojiData.emoji) {
      setPostContent((prevContent) => prevContent + emojiData.emoji);
      setShowEmojiPicker(false);
    } else {
      console.error("No valid emoji selected:", emojiData);
    }
  };

  // Retrieves the user's location and adds it to the post content
  const handleLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await axios.get(
            "https://nominatim.openstreetmap.org/reverse",
            {
              params: {
                lat: latitude,
                lon: longitude,
                format: "json",
              },
              headers: {
                "Accept-Language": "en",
              },
            }
          );

          const address = response.data.address;
          const city =
            address.city ||
            address.town ||
            address.village ||
            address.hamlet ||
            "Unknown City";
          const country = address.country || "Unknown Country";

          const locationString = `📍 Location: ${city}, ${country}`;
          setPostContent((prevContent) => `${prevContent} ${locationString}`);
        } catch (error) {
          console.error("Error fetching address:", error.message);
          const locationString = `📍 Location: (${latitude.toFixed(
            4
          )}, ${longitude.toFixed(4)})`;
          setPostContent((prevContent) => `${prevContent} ${locationString}`);
        }
      },
      (error) => {
        console.error("Error fetching location:", error.message);
        alert("Unable to retrieve your location.");
      }
    );
  };

  // Clears the currently selected image
  const clearSelectedImage = () => {
    setSelectedImage(null);
  };

  const placeholderText = `What's on your mind, ${getUsernameFromToken()} ?`;

  return (
    <div className="post-form">
      <form onSubmit={handlePostSubmit}>
        {selectedImage && (
          <div className="selected-image-container">
            <img src={selectedImage} alt="Selected" className="preview-image" />
            <button
              type="button"
              className="clear-image-button"
              onClick={clearSelectedImage}
              title="Clear Image"
            >
              Clear image
            </button>
          </div>
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
            <label htmlFor="image-upload" className="icon-label">
              <CiImageOn className="icon" title="Add Image" />
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
              title="Add Emoji"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
            />
            <CiLocationArrow1
              className="icon"
              title="Add Location"
              onClick={handleLocation}
            />
          </div>
          <button
            type="submit"
            className="post-the-post"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Posting..." : "Post"}
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