import React, { useState, useEffect } from "react";
import axios from "axios";
import PostCard from "./PostCard";
import loaderImage from "../assets/ZKZg.gif";

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [delayOver, setDelayOver] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDelayOver(true), 2000);
    fetchPosts();
    return () => clearTimeout(timer);
  }, []);

  // Fetches posts from the server and processes them
  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/v2/posts/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Filters out deleted posts
      const filteredPosts = response.data.filter(
        (post) => post.deleted !== true
      );

      // Separates posts with valid date and time from those without
      const postsWithValidDateAndTime = filteredPosts.filter(
        (post) =>
          typeof post.postDate === "string" && typeof post.postTime === "string"
      );

      const postsWithoutValidDateAndTime = filteredPosts.filter(
        (post) =>
          !post.postDate ||
          typeof post.postDate !== "string" ||
          !post.postTime ||
          typeof post.postTime !== "string"
      );

      // Sorts posts with valid dates and times in descending order
      postsWithValidDateAndTime.sort((a, b) => {
        const dateA = new Date(`${a.postDate}T${a.postTime}`);
        const dateB = new Date(`${b.postDate}T${b.postTime}`);
        return dateB - dateA;
      });

      // Combines sorted posts with those lacking valid date and time
      const sortedPosts = [
        ...postsWithValidDateAndTime,
        ...postsWithoutValidDateAndTime,
      ];

      setPosts(sortedPosts); // Updates the state with sorted posts
    } catch (error) {
      console.error("Error fetching posts:", error.message);
      setError(
        "Something went wrong. Please check your internet connection or try again later."
      );
    } finally {
      setIsLoading(false); // Ends the loading state
    }
  };

  // Renders an error message if there's an error
  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
      </div>
    );
  }

  // Renders a loading spinner if data is still being fetched or during the delay
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

  // Renders a message if no posts are available
  if (posts.length === 0) {
    return (
      <div
        className="no-posts-message"
        style={{ textAlign: "center", marginTop: "20px", color: "white" }}
      >
        <p style={{color: "black"}}>No more posts.</p>
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
