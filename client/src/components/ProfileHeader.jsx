import React, { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import PostCard from "./PostCard";
import profileImage from "../assets/user.webp";
import placeHolderImage from "../assets/placeholder.png";
import "../styles/profile-header.css";

const ProfileHeader = ({ followers, following, profile }) => {
  const [showModal, setShowModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [bioInput, setBioInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [userPosts, setUserPosts] = useState([]);
  const [fullNameInput, setFullNameInput] = useState("");
  const [error, setError] = useState(null);
  const [emailInput, setEmailInput] = useState("");
  const [postCount, setPostCount] = useState(0);
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
    if (profile) {
      setBioInput(profile.bio);
      setTitleInput(profile.title);
      setFullNameInput(profile.fullName);
      setEmailInput(profile.email);
    }
  }, [profile]);

  const handleShowModal = () => {
    setBioInput(profile.bio);
    setTitleInput(profile.title);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  useEffect(() => {
    const fetchPostCount = async () => {
      const userId = getUserIdFromToken();
      if (!userId) {
        console.error("User ID not found in token.");
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/api/v2/posts/list/count/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 200) {
          setPostCount(response.data);
        } else {
          console.error("Failed to fetch post count.");
        }
      } catch (error) {
        console.error("Error fetching post count:", error.message);
      }
    };

    fetchPostCount();
  }, []);

  const fetchUserPosts = async () => {
    const userId = getUserIdFromToken();

    if (!userId) {
      console.error("User ID not found in token.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/v2/posts/list/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        const filteredPosts = response.data.filter(
          (post) => post.deleted !== true
        );
        const sortedPosts = filteredPosts.sort(
          (a, b) => new Date(b.postDate) - new Date(a.postDate)
        );

        setUserPosts(sortedPosts);
      } else {
        console.error("Failed to fetch posts.");
        setError("Failed to fetch posts.");
      }
    } catch (error) {
      console.error("Error fetching posts:", error.message);
      setError("Error fetching posts. Please try again later.");
    }
  };

  const handleUpdateProfile = async () => {
    const userId = getUserIdFromToken();
    if (!userId) {
      console.error("User ID not found in token.");
      return;
    }

    const updateData = {
      fullName: fullNameInput,
      bio: bioInput,
      title: titleInput,
      email: emailInput,
    };

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/v2/users/update/${userId}`,
        updateData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        handleCloseModal();
        window.location.reload();
      } else {
        console.error("Failed to update profile.");
        setError("Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error.message);
      setError("Error updating profile. Please try again later.");
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === "bio") {
      setBioInput(value);
    } else if (name === "title") {
      setTitleInput(value);
    } else if (name === "email") {
      setEmailInput(value);
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

  const [activeTab, setActiveTab] = useState("posts");

  if (!profile) {
    return <div style={{ marginTop: 150 }}>Loading profile...</div>;
  }

  useEffect(() => {
    if (activeTab === "posts") {
      fetchUserPosts();
    }
  }, [activeTab]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div
      className="constructor-container"
      style={{
        border: ".2px solid lightgrey",
        position: "relative",
        boxShadow: "0 8px 12px rgba(0, 0, 0, 0.2)",
        background: "#14170a",
        color: "white",
        marginBottom: 40,
      }}
    >
      <div style={{ position: "relative", width: "100%", height: "300px" }}>
        <img
          src={placeHolderImage}
          alt="Cover"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", bottom: "-50px", left: "20px" }}>
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
          <h3 style={{ margin: 0 }}>{profile.username}</h3>
          <Button
            className="light me-1 button-edit"
            onClick={handleShowModal}
            style={{ marginLeft: "10px" }}
          >
            Edit
          </Button>
        </div>
        <h6 style={{ color: "grey", fontSize: 14 }}>{profile.title}</h6>
        <p>{profile.bio}</p>
        <div style={{ display: "flex", gap: "20px" }}>
          <div>
            <strong>{postCount}</strong> Posts
          </div>
          <div>
            <strong>{followers}</strong> Followers
          </div>
          <div>
            <strong>{following}</strong> Following
          </div>
        </div>
      </div>
      <div
        onClick={() => handleTabClick("posts")}
        style={{
          fontWeight: activeTab === "posts" ? "bold" : "normal",
          padding: "10px",
          borderBottom: activeTab === "posts" ? "2px solid grey" : "none",
          cursor: "pointer",
          textAlign: "center",
          marginTop: "20px",
        }}
      >
        Posts
      </div>
      <div style={{ marginTop: "20px" }} className="pst-lst">
        {activeTab === "posts" && (
          <div className="post-list1">
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
              <p>No posts available.</p>
            )}
          </div>
        )}
      </div>
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Update your profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="formGivenName">
            <Form.Label>Given Name</Form.Label>
            <Form.Control
              type="text"
              name="fullName"
              value={fullNameInput}
              onChange={(e) => setFullNameInput(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formBio">
            <Form.Label>Bio</Form.Label>
            <Form.Control
              type="text"
              name="bio"
              value={bioInput}
              onChange={handleInputChange}
            />
          </Form.Group>
          <Form.Group controlId="formTitle">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={titleInput}
              onChange={handleInputChange}
            />
          </Form.Group>
          <Form.Group controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={emailInput}
              onChange={handleInputChange}
              placeholder="Enter your email"
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleUpdateProfile}>
            Update
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

ProfileHeader.propTypes = {
  followers: PropTypes.number.isRequired,
  following: PropTypes.number.isRequired,
  profile: PropTypes.shape({
    bio: PropTypes.string,
    title: PropTypes.string,
    fullName: PropTypes.string,
    email: PropTypes.string,
    username: PropTypes.string,
    links: PropTypes.array,
  }).isRequired,
};

export default ProfileHeader;
