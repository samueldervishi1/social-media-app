import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Modal } from "react-bootstrap";
import { IoCreateOutline } from "react-icons/io5";
import { TiArrowDownThick, TiArrowUpThick } from "react-icons/ti";
import placeHolderImage from "../assets/placeholder.png";
import placeHolderLogo from "../assets/logo-placeholder-image.png";
import defaultUserIcon from "../assets/user.webp";
import loader from "../assets/ZKZg.gif";
import styles from "../styles/communityDetails.module.css";

import { getUserIdFromToken } from "../auth/authUtils";
const API_URL = import.meta.env.VITE_API_URL;

const CommunityDetails = () => {
  const { name } = useParams();
  const [community, setCommunity] = useState(null);
  const [membersCount, setMembersCount] = useState(null);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [viewDropdownVisible, setViewDropdownVisible] = useState(false);
  const [sortDropdownVisible, setSortDropdownVisible] = useState(false);
  const [currentView, setCurrentView] = useState("Feed");
  const [loading, setLoading] = useState(true);
  const [likeStatus, setLikeStatus] = useState({});
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [likeCount, setLikeCount] = useState(0);

  const [showPostModal, setShowPostModal] = useState(false);
  const [postContent, setPostContent] = useState("");
  const navigate = useNavigate();

  const dropdownRef = useRef(null);
  const viewDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);

  const getMemberText = (count) => {
    if (count === 1) return "1 member";
    if (count >= 0) return `${count} members`;
    return "Loading...";
  };

  //fetch community details
  useEffect(() => {
    const fetchCommunityDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${API_URL}/api/v2/communities/${name}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCommunity(response.data);
        fetchPosts(response.data.postIds);
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

  //fetch posts per community
  const fetchPosts = async (postIds) => {
    if (!postIds || postIds.length === 0) return;

    try {
      const token = localStorage.getItem("token");
      const postDetailsPromises = postIds.map(async (postId) => {
        try {
          const postResponse = await axios.get(
            `${API_URL}/api/v2/communities/post/${postId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const post = postResponse.data;

          try {
            const likesResponse = await axios.get(
              `${API_URL}/api/v2/communities/count/${postId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            post.likesCount = likesResponse.data;
          } catch (likesError) {
            console.error(
              `Failed to fetch likes count for postId ${postId}:`,
              likesError.message
            );
            post.likesCount = 0;
          }

          try {
            const userResponse = await axios.get(
              `${API_URL}/api/v2/users/${post.ownerId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            post.author = userResponse.data.username;
          } catch (userError) {
            console.error(
              `Failed to fetch user details for ownerId ${post.ownerId}:`,
              userError.message
            );
            post.author = "Unknown";
          }

          return post;
        } catch (err) {
          if (err.response && err.response.status === 404) {
            console.error("Post not found for postId:", postId);
            return null;
          } else {
            console.error("Error fetching post details:", err.message);
            return null;
          }
        }
      });

      const postDetails = await Promise.all(postDetailsPromises);
      const validPosts = postDetails.filter((post) => post !== null);

      if (validPosts.length === 0) {
        setError("No posts found.");
      } else {
        setPosts(validPosts);
      }
    } catch (err) {
      console.error("Error fetching posts:", err.message);
      setError("Failed to load posts.");
      setPosts([]);
    }
  };

  //fetch members count for communities
  useEffect(() => {
    const fetchMembersCount = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${API_URL}/api/v2/communities/c/count/${encodeURIComponent(
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

  //join community
  const handleJoinCommunity = async (communityId) => {
    try {
      const token = localStorage.getItem("token");
      const userId = getUserIdFromToken();

      if (!userId) {
        alert("User is not authenticated");
        return;
      }

      const response = await axios.post(
        `${API_URL}/api/v2/communities/join/${communityId}/${userId}`,
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

  //handle create community post
  const handleCreatePost = async () => {
    const token = localStorage.getItem("token");
    const userId = getUserIdFromToken();

    if (!postContent.trim()) {
      alert("Post content cannot be empty");
      return;
    }

    const postData = {
      content: postContent,
      ownerId: userId,
    };

    try {
      const response = await axios.post(
        `${API_URL}/api/v2/communities/${name}/posts`,
        postData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        alert("Post created successfully!");
        setPostContent("");
        setShowPostModal(false);
        window.location.reload();
      }
    } catch (err) {
      alert("Error creating post: " + err.message);
    }
  };

  const handleProfileLinkClick = (e) => {
    e.stopPropagation();
    const loggedInUserId = getUserIdFromToken();
    if (userId === loggedInUserId) {
      navigate("/profile");
    } else {
      navigate(`/users/${userId}`);
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

  //calculate time of the post
  const timeSincePost = (createTime) => {
    const postDateTime = new Date(createTime);
    const seconds = Math.floor((new Date() - postDateTime) / 1000);
    let interval = Math.floor(seconds / 31536000);

    if (interval >= 1) return interval + "y ago";
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return interval + "mo ago";
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval + "d ago";
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval + "h ago";
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval + "min ago";
    return seconds < 10 ? "just now" : seconds + "s ago";
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", options);
  };

  const handleLike = async (postId) => {
    const token = localStorage.getItem("token");
    const userId = getUserIdFromToken(token);
    const communityName = name;

    try {
      const likeResponse = await axios.get(
        `{{url}}api/v2/communities/${communityName}/posts/${postId}/like?userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (likeResponse.status === 200) {
        setLikeCount(likeResponse.data);
        setLikeStatus((prev) => ({
          ...prev,
          [postId]: prev[postId] === "like" ? null : "like",
        }));
      }
    } catch (error) {
      console.error("Error toggling like:", error.message);
    }
  };

  const handleDislike = (postId) => {
    setLikeStatus((prev) => ({
      ...prev,
      [postId]: prev[postId] === "dislike" ? null : "dislike",
    }));
  };

  const toggleAnswer = (index) => {
    setActiveQuestion(activeQuestion === index ? null : index);
  };

  const questionsAndAnswers = [
    {
      question: "No songs from the Hall of Fame",
      answer:
        "Songs listed in our Hall of Fame will be automatically removed. ",
    },
    {
      question: "No discussions `about, of, or` for the author",
      answer:
        "Please ensure that all discussion posts are `for` the community. Sharing your own story is fine, so long as it's part of a larger discussion post that's conducive to discussion.",
    },
    {
      question: "Don't post your own music ",
      answer:
        "It is your responsibility to read and understand Reddit's guidelines on self-promotion before submitting your own music. Famous musical celebrities are exempt. For verification, contact the staff privately. For original music, double-check your submission after 2-3 minutes. Ensure the flair is set to 'I Made This'",
    },
  ];

  if (error) return <div>Error: {error}</div>;

  if (loading) {
    return (
      <div className={styles.loading_details}>
        <img src={loader} alt="Loading..." className={styles.spinner_details} />
      </div>
    );
  }

  if (!community) return <div>Loading...</div>;

  const userId = getUserIdFromToken();
  const isUserJoined = community.userIds && community.userIds.includes(userId);

  return (
    <div className={styles.community_details_container}>
      <div className={styles.community_banner}>
        <img
          src={placeHolderImage}
          alt={`${community.name} banner`}
          className={styles.community_banner_img}
        />
        <img
          src={placeHolderLogo}
          alt={`${community.name} profile`}
          className={styles.community_profile_img}
        />
      </div>

      <div className={styles.community_info}>
        <h2 className={styles.community_name}>
          c/{community.name} <span>-</span>
          <span className={styles.members_count}>
            {membersCount !== null ? getMemberText(membersCount) : "Loading..."}
          </span>
        </h2>

        <button
          className={styles.community_post_button}
          onClick={() => setShowPostModal(true)}
        >
          <IoCreateOutline />
        </button>

        <button
          className={styles.community_action_button}
          onClick={() => handleJoinCommunity(community.communityId)}
          disabled={isUserJoined}
        >
          {isUserJoined ? "Joined" : "Join"}
        </button>

        <button
          className={styles.community_menu_button}
          onClick={toggleDropdown}
        >
          &#8230;
        </button>

        {dropdownVisible && (
          <div ref={dropdownRef} className={styles.community_dropdown_menu}>
            <a href="#">Add to favourites</a>
            <a href="#">Add to custom feed</a>
            <a href="#">Share community</a>
          </div>
        )}
      </div>

      <div className={styles.community_actions}>
        <div className={styles.community_buttons}>
          <button
            className={styles.feed_button}
            onClick={() => setCurrentView("Feed")}
          >
            Feed
          </button>
        </div>
        <div className={styles.community_dropdowns}>
          <div className={styles.view_dropdown}>
            <button onClick={toggleViewDropdown} ref={viewDropdownRef}>
              View &#x25BC;
            </button>
            {viewDropdownVisible && (
              <div className={styles.view_dropdown_menu}>
                <a href="#">View 1</a>
                <a href="#">View 2</a>
              </div>
            )}
          </div>
          <div className={styles.sort_dropdown}>
            <button onClick={toggleSortDropdown} ref={sortDropdownRef}>
              Sort &#x25BC;
            </button>
            {sortDropdownVisible && (
              <div className={styles.sort_dropdown_menu}>
                <a href="#">Sort A-Z</a>
                <a href="#">Sort Z-A</a>
              </div>
            )}
          </div>
        </div>
      </div>
      <hr className={styles.divider} />

      <div className={styles.content_container}>
        <div className={styles.left_side}>
          {error ? (
            <div className={styles.no_posts_message}>Error: {error}</div>
          ) : currentView === "Feed" && posts.length === 0 ? (
            <div className={styles.no_posts_message}>
              No posts found in this community.
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className={`${styles.post_community_card} ${
                  likeStatus[post.id] === "like"
                    ? "liked"
                    : likeStatus[post.id] === "dislike"
                    ? "disliked"
                    : ""
                }`}
              >
                <div onClick={handleProfileLinkClick}>
                  <img
                    src={defaultUserIcon}
                    alt="User Icon"
                    className={styles.user_community_icon}
                  />
                  @{post.author}{" "}
                  <span className={styles.post_community_time}>
                    • {timeSincePost(post.createTime)}
                  </span>
                </div>
                <h3>{post.title}</h3>
                <p className={styles.community_content}>{post.content}</p>
                <div className={styles.community_action}>
                  <div
                    className={`${styles.like_buttons} ${
                      likeStatus[post.id] === "like"
                        ? "liked"
                        : likeStatus[post.id] === "dislike"
                        ? "disliked"
                        : ""
                    }`}
                  >
                    <button
                      className={`${styles.like_button} ${
                        likeStatus[post.id] === "like" ? "active" : ""
                      }`}
                      onClick={() => handleLike(post.id)}
                    >
                      <TiArrowUpThick />
                    </button>
                    <span className={styles.community_count}>
                      {post.likesCount || 0}
                    </span>
                    <button
                      className={`${styles.dislike_button} ${
                        likeStatus[post.id] === "dislike" ? "active" : ""
                      }`}
                      onClick={() => handleDislike(post.id)}
                    >
                      <TiArrowDownThick />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.right_side}>
          <div className={styles.community_card}>
            <div className={styles.community_description}>
              <h3>{community.name}</h3>
              <p>{community.about}</p>
            </div>

            <div className={styles.community_info_details}>
              <div className={styles.community_created}>
                <strong>Created on:</strong> {formatDate(community.createTime)}
              </div>
              <div className={styles.community_members}>
                <strong>Members:</strong>{" "}
                {membersCount !== null
                  ? getMemberText(membersCount)
                  : "Loading..."}
              </div>
            </div>
            <div className={styles.community_faq}>
              <h4>Frequently Asked Questions</h4>
              {questionsAndAnswers.map((qa, index) => (
                <div key={index} className={styles.faq_item}>
                  <div
                    className={styles.faq_question}
                    onClick={() => toggleAnswer(index)}
                  >
                    <strong>{qa.question}</strong>
                    <span>{activeQuestion === index ? "−" : "+"}</span>{" "}
                  </div>
                  {activeQuestion === index && (
                    <div className={styles.faq_answer}>
                      <p>{qa.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal show={showPostModal} onHide={() => setShowPostModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <textarea
            className="form-control"
            rows="5"
            placeholder="What's on your mind?"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
          ></textarea>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-primary" onClick={handleCreatePost}>
            Post
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setShowPostModal(false)}
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CommunityDetails;