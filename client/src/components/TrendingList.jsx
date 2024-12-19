import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import loaderGif from "../assets/ZKZg.gif";
import styles from "../styles/trending.module.css";

import { getUserIdFromToken } from "../auth/authUtils";

const TrendingList = () => {
  const [loading, setLoading] = useState(true);
  const [communities, setCommunities] = useState([]);
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [membersCounts, setMembersCounts] = useState({});
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const userId = getUserIdFromToken();

  const getMemberText = (count) => {
    if (count === 1) return "1 member";
    if (count >= 1000000) {
      return `${Math.floor(count / 1000000)}M members`;
    }
    if (count >= 1000) {
      return `${Math.floor(count / 1000)}k members`;
    }
    return `${count} members`;
  };

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/v2/communities/list",
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
        setError("Something went wrong. Please try again later.");
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
                `http://localhost:8080/api/v2/communities/c/count/${encodeURIComponent(
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
        `http://localhost:8080/api/v2/communities/join/${communityId}/${userId}`,
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
    <div className={styles.trending_list}>
      <h3 style={{ textAlign: "center" }}>Trending communities</h3>
      <div className={styles.trend_card}>
        {loading ? (
          <div className={styles.loader_container}>
            <img src={loaderGif} alt="Loading..." className={styles.loader} />
          </div>
        ) : error ? (
          <p className={styles.error_message}>{error}</p>
        ) : communities.length > 0 ? (
          <>
            {communities.slice(0, 6).map((community) => (
              <div
                key={community.communityId}
                className={styles.trending_card}
                onClick={() => navigate(`/c/community/${community.name}`)}
              >
                <span className={styles.trend_hashtag}>c/{community.name}</span> -
                <span className={styles.members_count}>
                  {membersCounts[community.name] !== undefined
                    ? getMemberText(membersCounts[community.name])
                    : "Loading..."}{" "}
                </span>
                <button
                  className={styles.join_home_button}
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
              className={styles.show_more_button}
              onClick={() => navigate("/c/communities")}
            >
              Show More
            </button>
          </>
        ) : (
          <p className={styles.no_data}>No communities available</p>
        )}
      </div>
    </div>
  );
};

export default TrendingList;