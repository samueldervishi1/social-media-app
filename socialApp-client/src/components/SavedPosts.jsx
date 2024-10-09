import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { IoIosArrowRoundBack } from "react-icons/io";
import loaderImage from "/home/samuel/Documents/GitHub/social-media-app/socialApp-client/src/assets/ZKZg.gif";
import "../styles/saved-posts.css";

const SavedPosts = () => {
  const [savedPosts, setSavedPosts] = useState([]);
  const [postsDetails, setPostsDetails] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    const fetchSavedPosts = async () => {
      const userId = getUserIdFromToken();
      if (!userId) {
        console.error("User not authenticated or token invalid");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:5000/api/v1/save/posts/${userId}`
        );
        if (response.status === 200) {
          setSavedPosts(response.data.postIds);
        }
      } catch (error) {
        setError(
          "Something went wrong. Please check your internet connection or try again later."
        );
        console.error("Error fetching saved posts: ", error.message);
      }
    };

    fetchSavedPosts();

    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, [apiUrl, navigate]);

  useEffect(() => {
    const fetchPostsDetails = async () => {
      try {
        const postsDetailsPromises = savedPosts.map(async (postId) => {
          const response = await axios.get(
            `http://localhost:5000/api/v1/posts/${postId}`
          );
          return response.data;
        });

        const postsDetails = await Promise.all(postsDetailsPromises);
        setPostsDetails(postsDetails);
      } catch (error) {
        setError(
          "Something went wrong while fetching post details. Please try again later."
        );
        console.error("Error fetching posts details: ", error.message);
      }
    };

    if (savedPosts.length > 0) {
      fetchPostsDetails();
    }
  }, [savedPosts, apiUrl]);

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

  const handleBackHome = () => {
    navigate("/home");
  };

  const handleCardClick = (postId) => {
    navigate(`/posts/${postId}`);
  };

  return (
    <div className="saved-posts">
      <div className="h1-ac-button">
        <button className="backB" onClick={handleBackHome}>
          <IoIosArrowRoundBack className="back-icon" />
        </button>
        <h6 className="ac-pg" style={{ fontSize: 35 }}>
          Saved posts
        </h6>
      </div>
      {isLoading && (
        <div className="loading-container">
          <img src={loaderImage} alt="Loading..." style={{ width: 30 }} />
        </div>
      )}
      {!isLoading && error && <div className="error-message">{error}</div>}
      {!isLoading && postsDetails.length > 0 ? (
        <div className="saved-posts-list">
          {postsDetails.map((post) => (
            <div
              key={post.id}
              className="posts-card"
              onClick={() => handleCardClick(post.id)}
            >
              <h2 className="post-title">{post.title}</h2>
              <p className="post-content">{post.content}</p>
            </div>
          ))}
        </div>
      ) : (
        !isLoading &&
        !error && (
          <div className="no-saved-posts-message">
            You don’t have any saved posts. Save some to be shown here later.
          </div>
        )
      )}
    </div>
  );
};

export default SavedPosts;
