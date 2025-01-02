import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "../styles/postsPage.module.css";

const Menu = React.lazy(() => import("./Menu"));
import { getUserIdFromToken } from "../auth/authUtils";

const userId = getUserIdFromToken();
const token = localStorage.getItem("token");

const PostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        if (!token) {
          setError("No token found!");
          return;
        }

        const response = await axios.get(
          `http://localhost:8080/api/v2/save/posts/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setPosts(response.data);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError(
            "You have not saved any posts. Save something to show it here."
          );
        } else {
          setError(`Error fetching posts: ${err.message}`);
        }
      }
    };

    fetchPosts();
  }, [token, userId]);

  return (
    <div className={styles.postsPageContainer}>
      <div className={styles.postsContentContainer}>
        <h1 className={styles.saved_posts_title}>Saved Posts</h1>

        {error && <p className={styles.errorMessage}>{error}</p>}

        {posts.length > 0 ? (
          <ul className={styles.postsList}>
            {posts.map((post, index) => (
              <li key={index} className={styles.postsListItem}>
                {post.title}
              </li>
            ))}
          </ul>
        ) : (
          !error && <p className={styles.noPostsMessage}>No posts available.</p>
        )}
      </div>
    </div>
  );
};

export default PostsPage;