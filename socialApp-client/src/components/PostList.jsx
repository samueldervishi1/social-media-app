import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PostCard from "./PostCard";
import loaderImage from "/home/samuel/Documents/social-media-app/socialApp-client/src/assets/ZKZg.gif";

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [delayOver, setDelayOver] = useState(false);
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

  useEffect(() => {
    const timer = setTimeout(() => setDelayOver(true), 2000);
    fetchPosts();
    return () => clearTimeout(timer);
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/v2/posts/all`
      );

      const postsWithValidDateAndTime = response.data.filter(
        (post) =>
          typeof post.postDate === "string" && typeof post.postTime === "string"
      );

      const postsWithoutValidDateAndTime = response.data.filter(
        (post) =>
          !post.postDate ||
          typeof post.postDate !== "string" ||
          !post.postTime ||
          typeof post.postTime !== "string"
      );

      postsWithValidDateAndTime.sort((a, b) => {
        const dateA = new Date(`${a.postDate}T${a.postTime}`);
        const dateB = new Date(`${b.postDate}T${b.postTime}`);
        return dateB - dateA;
      });

      const sortedPosts = [
        ...postsWithValidDateAndTime,
        ...postsWithoutValidDateAndTime,
      ];

      setPosts(sortedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error.message);
      setError(
        "Something went wrong. Please check your internet connection or try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
      </div>
    );
  }

  if (isLoading || !delayOver) {
    return (
      <div className="text-loader">
        <img
          src={loaderImage}
          alt="Loading..."
          className="list-loader"
          style={{ width: 30 }}
        />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div
        className="no-posts-message"
        style={{ textAlign: "center", marginTop: "20px", color: "white" }}
      >
        <p>No more posts.</p>
      </div>
    );
  }

  return (
    <div className="post-list" style={{ marginBottom: 15 }}>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          id={post.id}
          content={post.content}
          commentsList={post.commentsList}
          postDate={post.postDate}
          postTime={post.postTime}
          userId={post.userId}
          imageUrl={post.imageUrl}
        />
      ))}
    </div>
  );
};

export default PostList;
