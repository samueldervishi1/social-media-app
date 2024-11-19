import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import placeHolderImage from "../assets/placeholder.png";
import placeHolderLogo from "../assets/logo-placeholder-image.png";
import loader from "../assets/ZKZg.gif";
import "../styles/communitiesList.css";

import { getUserIdFromToken } from "../auth/authUtils";

const CommunitiesList = () => {
  const [communities, setCommunities] = useState([]);
  const [membersCounts, setMembersCounts] = useState({});
  const [error, setError] = useState(null);
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getMemberText = (count) => {
    if (count === 1) return "1 member";
    if (count >= 0) return `${count} members`;
    return "Loading...";
  };

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
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 2000);
      }
    };

    fetchCommunities();
  }, []);

  useEffect(() => {
    const fetchMembersCount = async () => {
      try {
        const token = localStorage.getItem("token");

        const counts = await Promise.all(
          communities.map(async (community) => {
            try {
              const response = await axios.get(
                `http://localhost:5000/api/v2/communities/c/count/${encodeURIComponent(
                  community.name
                )}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              const count = response.data !== undefined ? response.data : 0;
              return { name: community.name, count };
            } catch (err) {
              console.error(
                `Error fetching count for ${community.name}:`,
                err.message
              );
              return { name: community.name, count: 0 };
            }
          })
        );

        const countsMap = counts.reduce((acc, { name, count }) => {
          acc[name] = count;
          return acc;
        }, {});

        setMembersCounts(countsMap);
      } catch (err) {
        console.error("Failed to fetch member counts:", err.message);
      }
    };

    if (communities.length > 0) {
      fetchMembersCount();
    } else {
      console.log("No communities available to fetch counts.");
    }
  }, [communities]);

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

      {loading ? (
        <div className="loading-community">
          <img src={loader} alt="Loading..." className="spinner-community" />
        </div>
      ) : (
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
                    <span className="members-count">
                      {membersCounts[community.name] !== undefined
                        ? getMemberText(membersCounts[community.name])
                        : "Loading..."}
                    </span>
                  </h2>
                  <p>{community.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CommunitiesList;
