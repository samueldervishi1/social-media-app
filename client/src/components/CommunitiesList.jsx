import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import placeHolderImage from "../assets/placeholder.png";
import placeHolderLogo from "../assets/logo-placeholder-image.png";
import loader from "../assets/ZKZg.gif";
import styles from "../styles/communitiesList.module.css";

import { getUserIdFromToken } from "../auth/authUtils";

import { Snackbar, Alert } from "@mui/material";

const CommunitiesList = () => {
  const [communities, setCommunities] = useState([]);
  const [membersCounts, setMembersCounts] = useState({});
  const [error, setError] = useState(null);
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

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
        setSnackbarMessage("User is not authenticated.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
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
        setSnackbarMessage("You joined the community successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      }
    } catch (err) {
      setError(err.message);
      setSnackbarMessage("Something went wrong. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const toggleDropdown = (communityId) => {
    setDropdownVisible(dropdownVisible === communityId ? null : communityId);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Popular Communities</h1>
      {error && (
        <p className={styles.error}>
          Something went wrong. Please try again later.
        </p>
      )}

      {loading ? (
        <div className={styles.loading_community}>
          <img
            src={loader}
            alt="Loading..."
            className={styles.spinner_community}
          />
        </div>
      ) : (
        <div className={styles.card_container}>
          {communities.map((community) => {
            const userId = getUserIdFromToken();
            const isUserJoined =
              community.userIds && community.userIds.includes(userId);

            return (
              <div
                key={community.communityId}
                className={styles.card}
                onClick={() => navigate(`/c/community/${community.name}`)}
              >
                <div className={styles.banner}>
                  <img
                    src={placeHolderImage}
                    alt={`${community.name} banner`}
                    className={styles.banner_img}
                  />
                  <img
                    src={placeHolderLogo}
                    alt={`${community.name} profile`}
                    className={styles.profile_img}
                  />
                  <button
                    className={styles.join_button}
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
                    className={styles.menu_button}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDropdown(community.communityId);
                    }}
                  >
                    &#8230;
                  </button>

                  {dropdownVisible === community.communityId && (
                    <div className={styles.dropdown_community}>
                      <a href="#">Add to favourites</a>
                      <a href="#">Add to custom feed</a>
                      <a href="#">Share community</a>
                    </div>
                  )}
                </div>

                <div className={styles.card_content}>
                  <h2>
                    c/{community.name} <span>-</span>
                    <span className={styles.members_count}>
                      {membersCounts[community.name] !== undefined
                        ? getMemberText(membersCounts[community.name])
                        : "Loading..."}
                    </span>
                  </h2>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default CommunitiesList;