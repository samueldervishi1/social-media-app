import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { createContext } from "react";
import { Container } from "react-bootstrap";
import Navbar from "./Navbar";
import ProfileHeader from "./ProfileHeader";
import loaderImage from "/home/samuel/Documents/social-media-app/socialApp-client/src/assets/ZKZg.gif";
import "../styles/profile.css";

export const ProfileContext = createContext(null);

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);
  const [error, setError] = useState(null);
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
    if (!isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const fetchData = async () => {
    try {
      const username = getUsernameFromToken();
      if (username) {
        const profileResponse = await axios.get(
          `http://localhost:5000/api/v2/users/info/${username}`
        );
        if (profileResponse.status === 200) {
          setProfileData(profileResponse.data);
        } else {
          console.error("Failed to fetch profile data");
        }
      } else {
        console.error("Token not found in localStorage or invalid");
      }

      const userId = getUserIdFromToken();
      if (userId) {
        const followersFollowingResponse = await axios.get(
          `http://localhost:5000/api/v2/users/list/${userId}`
        );
        if (followersFollowingResponse.status === 200) {
          const { followerId = [], followingId = [] } =
            followersFollowingResponse.data;
          setFollowersCount(followerId.length);
          setFollowingCount(followingId.length);
        } else {
          console.error("Failed to fetch followers and following counts");
        }

        const userPostsResponse = await axios.get(
          `http://localhost:5000/api/v2/posts/list/${userId}`
        );
        if (userPostsResponse.status === 200) {
          setPostsCount(userPostsResponse.data.length);
        } else {
          console.error("Failed to fetch user posts");
        }
      } else {
        console.error("Token not found in localStorage or invalid");
      }
    } catch (error) {
      console.error("Error fetching data:", error.message);
      setError(
        "Something went wrong. Please check your internet connection or try again later."
      );
    }
  };

  const getUsernameFromToken = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        return decodedToken.sub;
      } catch (error) {
        console.error("Error decoding token:", error.message);
        return null;
      }
    }
    return null;
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

  return (
    <ProfileContext.Provider value={profileData}>
      <div className="profile-layout">
        <div className="menu">
          <Navbar />
        </div>
        <div className="main-content">
          {isLoading ? (
            <div className="loader-overlay">
              <img
                src={loaderImage}
                alt="Loading..."
                className="loader-image"
              />
            </div>
          ) : (
            <Container className="classname">
              {profileData ? (
                <ProfileHeader
                  followers={followersCount}
                  following={followingCount}
                  posts={postsCount}
                  profile={profileData}
                />
              ) : (
                <div className="profile-error">
                  {error || "Profile data could not be loaded"}
                </div>
              )}
            </Container>
          )}
        </div>
      </div>
    </ProfileContext.Provider>
  );
};

export default Profile;
