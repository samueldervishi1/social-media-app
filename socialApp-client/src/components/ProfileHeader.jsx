import React, { useState, useEffect } from "react";
import axios from "axios";
import { Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaRegTrashCan } from "react-icons/fa6";
import {
  FaGithub,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaLinkedin,
  FaFacebook,
  FaReddit,
  FaLink,
} from "react-icons/fa";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import PostCard from "./PostCard";
import profileImage from "/home/samuel/Documents/social-media-app/socialApp-client/src/user.webp";
import placeHolderImage from "/home/samuel/Documents/social-media-app/socialApp-client/src/assets/placeholder.png";
import "../styles/profile-header.css";

const ProfileHeader = ({ followers, following, posts, profile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [bioInput, setBioInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [linksInput, setLinksInput] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [givenNameInput, setGivenNameInput] = useState("");
  const [familyNameInput, setFamilyNameInput] = useState("");
  const [error, setError] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isEditingLinks, setIsEditingLinks] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
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
      setLinksInput(profile.links);
      setFamilyNameInput(profile.familyName);
      setGivenNameInput(profile.givenName);
      setEmailInput(profile.email);
    }
  }, [profile]);

  const handleShowModal = () => {
    setBioInput(profile.bio);
    setTitleInput(profile.title);
    setEmailInput(profile.email);
    setLinksInput(profile.links);
    setIsEditingLinks(false);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleShowPostModal = () => {
    fetchUserPosts();
    setShowPostModal(true);
  };

  const handleEditLinks = () => {
    setIsEditingLinks(true);
  };

  const handleSaveLinks = () => {
    setIsEditingLinks(false);
    handleUpdateProfile();
  };

  const handleClosePostModal = () => setShowPostModal(false);

  const { username, title, bio, links } = profile;

  const getServiceIcon = (url) => {
    const trustedDomains = {
      "github.com": <FaGithub />,
      "instagram.com": <FaInstagram />,
      "twitter.com": <FaTwitter />,
      "youtube.com": <FaYoutube />,
      "linkedin.com": <FaLinkedin />,
      "facebook.com": <FaFacebook />,
      "reddit.com": <FaReddit />,
    };

    if (url.startsWith("https://")) {
      const domain = new URL(url).hostname;
      return trustedDomains[domain] || <FaLink />;
      s;
    }

    return <FaLink />;
  };

  const handleFollowersClick = () => {
    const userId = getUserIdFromToken();
    navigate(`http://localhost:5000/api/v1/users/${userId}/followers`);
  };

  const handleFollowingClick = () => {
    const userId = getUserIdFromToken();
    navigate(`http://localhost:5000/api/v1/users/${userId}/following`);
  };

  useEffect(() => {
    const fetchPostCount = async () => {
      const userId = getUserIdFromToken();
      if (!userId) {
        console.error("User ID not found in token.");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:5000/api/v1/posts/list/count/${userId}`
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
      const response = await axios.get(
        `http://localhost:5000/api/v1/posts/list/${userId}`
      );
      if (response.status === 200) {
        const sortedPosts = response.data.sort((a, b) => {
          const dateA = new Date(`${a.postDate}T${a.postTime}`);
          const dateB = new Date(`${b.postDate}T${b.postTime}`);
          return dateB - dateA; // Newest posts first
        });
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
      givenName: givenNameInput,
      familyName: familyNameInput,
      bio: bioInput,
      title: titleInput,
      email: emailInput,
      links: linksInput.filter((link) => link.trim() !== ""),
    };

    try {
      const response = await axios.put(
        `http://localhost:5000/api/v1/users/update/${userId}`, // Updated endpoint
        updateData
      );
      console.log("Profile update response:", response);
      if (response.status === 200) {
        console.log("Profile updated successfully.");
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

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    console.log(`Input change - Name: ${name}, Value: ${value}`);
    if (name === "bio") {
      setBioInput(value);
    } else if (name === "title") {
      setTitleInput(value);
    } else if (name === "email") {
      setEmailInput(value);
    }
  };

  const handleLinksChange = (event) => {
    const linksArray = event.target.value
      .split(",")
      .map((link) => link.trim())
      .filter((link) => link !== "");
    console.log("Links changed:", linksArray);
    setLinksInput(linksArray);
  };

  const handleLinkDelete = (index) => {
    const updatedLinks = linksInput.filter((_, i) => i !== index);
    setLinksInput(updatedLinks);
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

  const fetchFollowers = async () => {
    const userId = getUserIdFromToken();
    if (!userId) {
      console.error("User ID not found in token.");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/users/${userId}/followers/count`
      );
      if (response.status === 200) {
        setFollowersCount(response.data.count);
        console.log(response.data);
      } else {
        console.error("Failed to fetch followers.");
        setError("Failed to fetch followers.");
      }
    } catch (error) {
      console.error("Error fetching followers:", error.message);
      setError("Error fetching followers. Please try again later.");
    }
  };

  const fetchFollowing = async () => {
    const userId = getUserIdFromToken();
    if (!userId) {
      console.error("User ID not found in token.");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/users/${userId}/following/count`
      );
      if (response.status === 200) {
        setFollowing(response.data);
      } else {
        console.error("Failed to fetch following.");
        setError("Failed to fetch following.");
      }
    } catch (error) {
      console.error("Error fetching following:", error.message);
      setError("Error fetching following. Please try again later.");
    }
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
        top: 30,
        position: "relative",
        boxShadow: "0 8px 12px rgba(0, 0, 0, 0.2)",
        background: "#14170a",
        color: "white",
        marginBottom: 40,
        right: "7%",
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
        <h6>{profile.title}</h6>
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
      <div style={{ marginTop: "20px" }}>
        {links.length > 0 && (
          <div
            style={{
              marginBottom: "20px",
              justifyContent: "center",
              display: "flex",
            }}
          >
            {links.map((link, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "10px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    marginRight: "10px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {getServiceIcon(link)}
                  {new URL(link).hostname}
                </a>
              </div>
            ))}
          </div>
        )}
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
              name="givenName"
              value={givenNameInput}
              onChange={(e) => setGivenNameInput(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="formFamilyName">
            <Form.Label>Family Name</Form.Label>
            <Form.Control
              type="text"
              name="familyName"
              value={familyNameInput}
              onChange={(e) => setFamilyNameInput(e.target.value)}
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
          <Form.Group controlId="formLinks">
            <Form.Label>Links</Form.Label>
            {isEditingLinks ? (
              <Form.Control
                as="textarea"
                rows={3}
                name="links"
                value={linksInput.join(", ")}
                onChange={handleLinksChange}
              />
            ) : (
              <div>
                {links.length > 0 ? (
                  links.map((link, index) => (
                    <div
                      key={index}
                      style={{ marginBottom: "10px", display: "flex" }}
                    >
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          marginRight: "10px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {getServiceIcon(link)}
                        {new URL(link).hostname}
                      </a>
                      <Button
                        variant="link"
                        onClick={() => handleLinkDelete(index)}
                        style={{ marginLeft: "auto", color: "red", width: 50 }}
                      >
                        <FaRegTrashCan />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p>No links available.</p>
                )}
                <Button variant="link" onClick={handleEditLinks}>
                  Edit Links
                </Button>
              </div>
            )}
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          {isEditingLinks ? (
            <>
              <Button variant="secondary" onClick={handleSaveLinks}>
                Save Links
              </Button>
              <Button variant="danger" onClick={() => setIsEditingLinks(false)}>
                Cancel Editing
              </Button>
            </>
          ) : (
            <Button variant="danger" onClick={handleUpdateProfile}>
              Update
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProfileHeader;
