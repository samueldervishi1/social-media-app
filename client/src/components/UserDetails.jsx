import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Image } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import profileImage from "../assets/user.webp";
import placeHolderImage from "../assets/placeholder.png";
import loaderImage from "../assets/ZKZg.gif";
import styles from "../styles/user-details.module.css";

const PostCard = React.lazy(() => import("./PostCard"));
import { getUserIdFromToken } from "../auth/authUtils";
const API_URL = import.meta.env.VITE_API_URL;

const UserDetail = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [userPosts, setUserPosts] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [postCount, setPostCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchUserDetails();
    checkIfFollowing();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/api/v2/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        setUser(response.data);
        fetchUserFollowers();
        fetchUserFollowing();
        if (userId === currentUserId) {
          fetchUserPosts();
        }
      } else {
        setError("Failed to fetch user details");
      }
    } catch (error) {
      console.error("Error fetching user details:", error.message);
      setError(
        "Something went wrong. Please check your internet connection or try again later."
      );
    }
  };

  useEffect(() => {
    const loggedInUserId = getUserIdFromToken();
    if (loggedInUserId) {
      const userToFetch = userId === loggedInUserId ? loggedInUserId : userId;
      fetchUserDetails();
      fetchUserPosts(userToFetch);
      checkIfFollowing();
    }
  }, [userId]);

  const fetchUserPosts = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/api/v2/posts/list/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        const sortedPosts = response.data.sort(
          (a, b) =>
            new Date(b.postDate + " " + b.postTime) -
            new Date(a.postDate + " " + a.postTime)
        );
        setUserPosts(sortedPosts);
      } else {
        console.error("Failed to fetch user posts");
      }
    } catch (error) {
      console.error("Error fetching user posts:", error.message);
    }
  };

  useEffect(() => {
    const fetchPostCount = async () => {
      if (!userId) {
        console.error("User ID not found in token.");
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${API_URL}/api/v2/posts/list/count/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Backend response:", response.data);

        if (response.status === 200) {
          setPostCount(response.data);
        } else {
          console.error("Failed to fetch post count.");
        }
      } catch (error) {
        console.error("Error fetching post count:", error.message);
      }
    };

    fetchPostCount();
  }, []);

  const fetchUserFollowers = async () => {
    if (userId) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${API_URL}/api/v2/users/${userId}/followers/count`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 200) {
          setFollowersCount(response.data);
        } else {
          console.error("Failed to fetch followers count");
        }
      } catch (error) {
        console.error("Error fetching followers:", error.message);
      }
    }
  };

  const fetchUserFollowing = async () => {
    if (userId) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${API_URL}/api/v2/users/${userId}/following/count`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 200) {
          setFollowingCount(response.data);
        } else {
          console.error("Failed to fetch following count");
        }
      } catch (error) {
        console.error("Error fetching following:", error.message);
      }
    }
  };

  const checkIfFollowing = async () => {
    const loggedInUserId = getUserIdFromToken();
    if (loggedInUserId && userId) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${API_URL}/api/v2/users/${loggedInUserId}/following`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 200) {
          const isFollowing = response.data.includes(userId);
          setIsFollowing(isFollowing);
        } else {
          console.error("Failed to check following status");
        }
      } catch (error) {
        console.error("Error checking following status:", error.message);
      }
    }
  };

  const handleFollowToggle = async () => {
    const loggedInUserId = getUserIdFromToken();
    if (loggedInUserId && userId) {
      try {
        const token = localStorage.getItem("token");
        const apiEndpoint = isFollowing
          ? `${API_URL}/api/v2/users/${loggedInUserId}/unfollow/${userId}`
          : `${API_URL}/api/v2/users/follow/${loggedInUserId}/follow/${userId}`;

        const response = await axios.post(
          apiEndpoint,
          {},
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          setIsFollowing(!isFollowing);
          fetchUserFollowers();
        } else {
          console.error("Failed to update follow status");
        }
      } catch (error) {
        console.error("Error updating follow status:", error.message);
      }
    }
  };

  const getServiceIcon = (url) => {
    const serviceIcons = {
      "github.com": "GitHubIcon",
      "instagram.com": "InstagramIcon",
      "twitter.com": "TwitterIcon",
      "youtube.com": "YouTubeIcon",
      "linkedin.com": "LinkedInIcon",
      "facebook.com": "FacebookIcon",
      "reddit.com": "RedditIcon",
    };
    const domain = new URL(url).hostname;
    return serviceIcons[domain] || "UnknownIcon";
  };

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  return (
    <>
      {isLoading ? (
        <div className="loader-overlay">
          <img
            src={loaderImage}
            alt="Loading..."
            className={styles.loader_image}
          />
        </div>
      ) : (
        <div
          style={{
            width: "80%",
            maxWidth: "1200px",
            margin: "30px auto",
            padding: 15,
            top: 50,
            position: "relative",
            boxShadow: "0 8px 12px rgba(0, 0, 0, 0.2)",
            background: "white",
          }}
        >
          <div style={{ position: "relative", width: "100%", height: "300px" }}>
            <img
              src={placeHolderImage}
              alt="Cover"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div
              style={{ position: "absolute", bottom: "-50px", left: "20px" }}
            >
              <Image
                src={profileImage}
                roundedCircle
                style={{
                  width: "120px",
                  height: "120px",
                  border: "4px solid white",
                }}
              />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginTop: "80px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <h3 style={{ margin: 0 }}>{user?.username}</h3>
              <Button
                className={`${styles.light} ${styles.me_1} ${styles.button_edit}`}
                onClick={handleFollowToggle}
                style={{ marginLeft: "10px" }}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
            </div>
            <h6>{user?.title}</h6>
            <p>{user?.bio}</p>
            <div style={{ display: "flex", gap: "20px" }}>
              <div>
                <strong>{postCount}</strong> Posts
              </div>
              <div>
                <strong>{followersCount}</strong> Followers
              </div>
              <div>
                <strong>{followingCount}</strong> Following
              </div>
            </div>
          </div>
          <div style={{ marginTop: "20px" }}>
            {user?.links?.length > 0 && (
              <div
                style={{
                  marginBottom: "20px",
                  justifyContent: "center",
                  display: "flex",
                }}
              >
                {user.links.map((link, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: "10px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        marginRight: "10px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {getServiceIcon(link)}
                      {new URL(link).hostname}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div
            onClick={() => setActiveTab("posts")}
            style={{
              fontWeight: activeTab === "posts" ? "bold" : "normal",
              padding: "10px",
              borderBottom:
                activeTab === "posts" ? "2px solid #1c1c1d;" : "none",
              cursor: "pointer",
              textAlign: "center",
              marginTop: "20px",
            }}
          >
            Posts
          </div>
          <div style={{ marginTop: "20px" }}>
            {activeTab === "posts" && (
              <div className={styles.post_list}>
                {userPosts.length > 0 ? (
                  userPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      id={post.id}
                      title={post.title}
                      content={post.content}
                      postDate={post.postDate}
                      postTime={post.postTime}
                      userId={post.userId}
                      imageUrl={post.imageUrl}
                    />
                  ))
                ) : (
                  <p>
                    {userId === currentUserId
                      ? "You haven’t created any posts yet. Share something interesting!"
                      : "This user hasn’t posted anything yet!"}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default UserDetail;