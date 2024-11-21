import React, { useEffect, useState } from "react";
import axios from "axios";
import { createContext } from "react";
import { Container } from "react-bootstrap";
import ProfileHeader from "./ProfileHeader";
import loaderImage from "../assets/ZKZg.gif";
import "../styles/profile.css";

import { getUserIdFromToken, getUsernameFromToken } from "../auth/authUtils";

export const ProfileContext = createContext(null);

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Runs on component mount to fetch data and manage loading state
  useEffect(() => {
    fetchData(); // Fetches profile, followers, and posts data
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Fetches user profile, followers, following, and posts data
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const username = getUsernameFromToken();

      // Fetches user profile information
      if (username) {
        const profileResponse = await axios.get(
          `http://localhost:5000/api/v2/users/info/${username}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
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

      // Fetches followers and following counts
      if (userId) {
        const followersFollowingResponse = await axios.get(
          `http://localhost:5000/api/v2/users/list/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (followersFollowingResponse.status === 200) {
          const { followerId = [], followingId = [] } =
            followersFollowingResponse.data;
          setFollowersCount(followerId.length);
          setFollowingCount(followingId.length);
        } else {
          console.error("Failed to fetch followers and following counts");
        }

        // Fetches the count of user's posts
        const userPostsResponse = await axios.get(
          `http://localhost:5000/api/v2/posts/list/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
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
      ); // Sets an error message for display
    }
  };

  return (
    <ProfileContext.Provider value={profileData}>
      <div className="profile-layout">
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