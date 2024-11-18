import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import placeHolderImage from "../assets/placeholder.png";
import placeHolderLogo from "../assets/logo-placeholder-image.png";
import loader from "../assets/ZKZg.gif";
import "../styles/communityDetails.css";
import { getUserIdFromToken } from "../auth/authUtils";

const CommunityDetails = () => {
  const { name } = useParams();
  const [community, setCommunity] = useState(null);
  const [membersCount, setMembersCount] = useState(null);
  const [error, setError] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [viewDropdownVisible, setViewDropdownVisible] = useState(false);
  const [sortDropdownVisible, setSortDropdownVisible] = useState(false);
  const [currentView, setCurrentView] = useState("Feed");
  const [loading, setLoading] = useState(true);

  const dropdownRef = useRef(null);
  const viewDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);

  const getMemberText = (count) => {
    if (count === 1) return "1 member";
    if (count >= 0) return `${count} members`;
    return "Loading...";
  };

  useEffect(() => {
    const fetchCommunityDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/api/v2/communities/${name}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCommunity(response.data);
      } catch (err) {
        setError("Failed to fetch community details");
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 2000);
      }
    };

    fetchCommunityDetails();
  }, [name]);

  useEffect(() => {
    const fetchMembersCount = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/api/v2/communities/c/count/${encodeURIComponent(
            name
          )}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setMembersCount(response.data);
      } catch (err) {
        console.error("Error fetching member count:", err.message);
        setMembersCount("N/A");
      }
    };

    if (name) {
      fetchMembersCount();
    }
  }, [name]);

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
        alert("You joined the community successfully!");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const toggleViewDropdown = () => {
    setViewDropdownVisible(!viewDropdownVisible);
    if (sortDropdownVisible) setSortDropdownVisible(false);
  };

  const toggleSortDropdown = () => {
    setSortDropdownVisible(!sortDropdownVisible);
    if (viewDropdownVisible) setViewDropdownVisible(false);
  };

  const closeDropdowns = (e) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target) &&
      viewDropdownRef.current &&
      !viewDropdownRef.current.contains(e.target) &&
      sortDropdownRef.current &&
      !sortDropdownRef.current.contains(e.target)
    ) {
      setDropdownVisible(false);
      setViewDropdownVisible(false);
      setSortDropdownVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", closeDropdowns);

    return () => {
      document.removeEventListener("click", closeDropdowns);
    };
  }, []);

  if (error) return <div>Error: {error}</div>;

  if (loading) {
    return (
      <div className="loading-details">
        <img src={loader} alt="Loading..." className="spinner-details" />
      </div>
    );
  }

  if (!community) return <div>Loading...</div>;

  const userId = getUserIdFromToken();
  const isUserJoined = community.userIds && community.userIds.includes(userId);

  return (
    <div className="community-details-container">
      <div className="community-banner">
        <img
          src={placeHolderImage}
          alt={`${community.name} banner`}
          className="community-banner-img"
        />
        <img
          src={placeHolderLogo}
          alt={`${community.name} profile`}
          className="community-profile-img"
        />
      </div>

      <div className="community-info">
        <h2 className="community-name">
          c/{community.name} <span>-</span>
          <span className="members-count">
            {membersCount !== null ? getMemberText(membersCount) : "Loading..."}
          </span>
        </h2>

        <button
          className="community-action-button"
          onClick={() => handleJoinCommunity(community.communityId)}
          disabled={isUserJoined}
        >
          {isUserJoined ? "Joined" : "Join"}
        </button>

        <button className="community-menu-button" onClick={toggleDropdown}>
          &#8230;
        </button>

        {dropdownVisible && (
          <div ref={dropdownRef} className="community-dropdown-menu">
            <a href="#">Add to favourites</a>
            <a href="#">Add to custom feed</a>
            <a href="#">Share community</a>
          </div>
        )}
      </div>
      <div className="community-actions">
        <div className="community-buttons">
          <button
            className="feed-button"
            onClick={() => setCurrentView("Feed")}
          >
            Feed
          </button>
          <button
            className="about-button"
            onClick={() => setCurrentView("About")}
          >
            About
          </button>
        </div>
        <div className="community-dropdowns">
          <div className="view-dropdown">
            <button onClick={toggleViewDropdown} ref={viewDropdownRef}>
              View &#x25BC;
            </button>
            {viewDropdownVisible && (
              <div className="view-dropdown-menu">
                <a href="#">View 1</a>
                <a href="#">View 2</a>
              </div>
            )}
          </div>
          <div className="sort-dropdown">
            <button onClick={toggleSortDropdown} ref={sortDropdownRef}>
              Sort &#x25BC;
            </button>
            {sortDropdownVisible && (
              <div className="sort-dropdown-menu">
                <a href="#">Sort A-Z</a>
                <a href="#">Sort Z-A</a>
              </div>
            )}
          </div>
        </div>
      </div>
      <hr className="divider" />
      <div className="content-container">
        {currentView === "Feed" ? (
          <div>
            <h1 style={{ color: "white" }}>Feed Content</h1>
          </div>
        ) : (
          <div>
            <h1 style={{ color: "white" }}>About Content</h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityDetails;
