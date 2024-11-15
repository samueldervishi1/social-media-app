import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import placeHolderImage from "../assets/placeholder.png";
import placeHolderLogo from "../assets/logo-placeholder-image.png";
import "../styles/communitiesList.css";

import { getUserIdFromToken } from "../auth/authUtils";

const CommunitiesList = () => {
  const [communities, setCommunities] = useState([]);
  const [error, setError] = useState(null);
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/v2/communities/list",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCommunities(response.data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchCommunities();
  }, []);

  const handleJoinCommunity = async (communityId) => {
    try {
      const token = localStorage.getItem("token");
      const userId = getUserIdFromToken();

      if (!userId) {
        alert("User is not authenticated");
        return;
      }

      const response = await axios.post(
        `http://localhost:5000/api/v2/communities/join/${communityId}/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setJoinedCommunities((prev) => [...prev, communityId]);
        alert("You joined the community successfully!");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleDropdown = (communityId) => {
    setDropdownVisible(dropdownVisible === communityId ? null : communityId);
  };

  return (
    <div className="container">
      <h1 className="title">Popular Communities</h1>
      {error && <p className="error">Error: {error}</p>}
      <div className="card-container">
        {communities.map((community) => {
          const userId = getUserIdFromToken();
          const isUserJoined =
            community.userIds && community.userIds.includes(userId);

          return (
            <div
              key={community.communityId}
              className="card"
              onClick={() => navigate(`/c/community/${community.name}`)}
            >
              <div className="banner">
                <img
                  src={placeHolderImage}
                  alt={`${community.name} banner`}
                  className="banner-img"
                />
                <img
                  src={placeHolderLogo}
                  alt={`${community.name} profile`}
                  className="profile-img"
                />
                <button
                  className="join-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isUserJoined) {
                      handleJoinCommunity(community.communityId);
                    }
                  }}
                  disabled={isUserJoined}
                >
                  {isUserJoined ? "Joined" : "Join"}
                </button>

                <button
                  className="menu-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDropdown(community.communityId);
                  }}
                >
                  &#8230;
                </button>

                {dropdownVisible === community.communityId && (
                  <div className="dropdown-community">
                    <a href="#">Add to favourites</a>
                    <a href="#">Add to custom feed</a>
                    <a href="#">Share community</a>
                  </div>
                )}
              </div>

              <div className="card-content">
                <h2>
                  c/{community.name} <span>-</span>
                  <span className="members-count">5,013,134 members</span>
                </h2>
                <p>{community.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CommunitiesList;
