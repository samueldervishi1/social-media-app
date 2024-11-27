import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import loaderGif from "../assets/ZKZg.gif";
import "../styles/trending.css";

import { getUserIdFromToken } from "../auth/authUtils";

const TrendingList = () => {
  const [loading, setLoading] = useState(true);
  const [communities, setCommunities] = useState([]);
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [membersCounts, setMembersCounts] = useState({});
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const userId = getUserIdFromToken();

  const getMemberText = (count) => {
    if (count === 1) return "1 member";
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return `${count} members`;
  };

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/v2/communities/list",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setCommunities(response.data || []);
        setTimeout(() => {
          setLoading(false);
        }, 2000);
      } catch (error) {
        console.error("Error fetching communities:", error);
        setTimeout(() => {
          setLoading(false);
        }, 2000);
      }
    };

    fetchCommunities();
  }, [token]);

  useEffect(() => {
    const fetchMembersCount = async () => {
      try {
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
  }, [communities, token]);

  const handleJoinCommunity = async (communityId) => {
    try {
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
      console.error("Failed to join community:", err.message);
    }
  };

  const hasUserJoined = (userIds) => userIds?.includes(userId);

  return (
    <div className="trending-list">
      <h3 style={{ textAlign: "center" }}>Trending communities</h3>
      <div className="trend-card">
        {loading ? (
          <div className="loader-container">
            <img src={loaderGif} alt="Loading..." className="loader" />
          </div>
        ) : communities.length > 0 ? (
          <>
            {communities.slice(0, 6).map((community) => (
              <div
                key={community.communityId}
                className="trending-card"
                onClick={() => navigate(`/c/community/${community.name}`)}
              >
                <span className="trend-hashtag">{community.name}</span> -
                <span className="members-count">
                  {membersCounts[community.name] !== undefined
                    ? getMemberText(membersCounts[community.name])
                    : "Loading..."}{" "}
                  members
                </span>
                <button
                  className="join-home-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!hasUserJoined(community.userIds)) {
                      handleJoinCommunity(community.communityId);
                    }
                  }}
                  disabled={hasUserJoined(community.userIds)}
                >
                  {hasUserJoined(community.userIds) ? "Joined" : "Join"}
                </button>
              </div>
            ))}
            <button
              className="show-more-button"
              onClick={() => navigate("/c/communities")}
            >
              Show More
            </button>
          </>
        ) : (
          <p className="no-data">No communities available</p>
        )}
      </div>
    </div>
  );
};

export default TrendingList;