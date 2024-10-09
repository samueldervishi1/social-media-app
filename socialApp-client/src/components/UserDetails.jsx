import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import PostCard from "./PostCard";
import { Image } from "react-bootstrap";
import ChatHistory from "./ChatHistory";
import Button from "react-bootstrap/Button";
import profileImage from "/home/samuel/Documents/GitHub/social-media-app/socialApp-client/src/user.webp";
import placeHolderImage from "/home/samuel/Documents/GitHub/social-media-app/socialApp-client/src/assets/placeholder.png";
import loaderImage from "/home/samuel/Documents/GitHub/social-media-app/socialApp-client/src/assets/ZKZg.gif";
import "../styles/user-details.css";

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
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    } else {
      setCurrentUserId(getUserIdFromToken());
    }
  }, [navigate]);

  useEffect(() => {
    fetchUserDetails();
    checkIfFollowing();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/users/${userId}`
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
      const response = await axios.get(
        `http://localhost:5000/api/v1/posts/list/${userId}`
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

  const fetchUserFollowers = async () => {
    if (userId) {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/v1/users/${userId}/followers/count`
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
        const response = await axios.get(
          `http://localhost:5000/api/v1/users/${userId}/following/count`
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
        const response = await axios.get(
          `http://localhost:5000/api/v1/users/${loggedInUserId}/following`
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
        const apiEndpoint = isFollowing
          ? `http://localhost:5000/api/v1/users/${loggedInUserId}/unfollow/${userId}`
          : `http://localhost:5000/api/v1/users/follow/${loggedInUserId}/follow/${userId}`;

        const response = await axios.post(apiEndpoint);
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
      <ChatHistory />
      {isLoading ? (
        <div className="loader-overlay">
          <img src={loaderImage} alt="Loading..." className="loader-image" />
        </div>
      ) : (
        <div
          style={{
            width: "80%",
            maxWidth: "1200px",
            margin: "30px auto",
            border: "1px solid #e0e0e0",
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
                className="light me-1 button-edit"
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
                <strong>{user?.postsCount || 0}</strong> Posts
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
              borderBottom: activeTab === "posts" ? "2px solid black" : "none",
              cursor: "pointer",
              textAlign: "center",
              marginTop: "20px",
            }}
          >
            Posts
          </div>
          <div style={{ marginTop: "20px" }}>
            {activeTab === "posts" && (
              <div className="post-list">
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
