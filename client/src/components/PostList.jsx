import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PostCard from "./PostCard";
import loaderImage from "../assets/ZKZg.gif";

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [delayOver, setDelayOver] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setDelayOver(true), 2000);
    fetchPosts();
    return () => clearTimeout(timer);
  }, []);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("token");

      const userPostsResponse = await axios.get(
        `http://localhost:5000/api/v2/posts/all`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const allPosts = [...userPostsResponse.data];

      const filteredPosts = allPosts.filter((post) => !post.deleted);

      filteredPosts.sort((a, b) => {
        const dateA = new Date(a.createTime || `${a.postDate}T${a.postTime}`);
        const dateB = new Date(b.createTime || `${b.postDate}T${b.postTime}`);
        return dateB - dateA;
      });

      setPosts(filteredPosts);
    } catch (error) {
      console.error("Error fetching posts:", error.message);
      setError("Something went wrong. Please try again later.");
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
        <p style={{ color: "black" }}>No more posts.</p>
      </div>
    );
  }

  return (
    <div className="post-list" style={{ marginBottom: 15 }}>
      {posts.map((post) => (
        <div key={post.id} className="post-card-wrapper">
          <PostCard
            id={post.id}
            content={post.content}
            commentsList={post.commentsList}
            postDate={post.postDate}
            postTime={post.postTime}
            userId={post.ownerId || post.userId}
            imageUrl={post.imageUrl}
          />
        </div>
      ))}
    </div>
  );
};

export default PostList;