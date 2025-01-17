import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { Image } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { FaGithub, FaLinkedin, FaTwitter, FaGlobe } from 'react-icons/fa';
import { IoIosCalendar } from 'react-icons/io';
import profileImage from '../assets/user.webp';
import placeHolderImage from '../assets/placeholder.png';
import styles from '../styles/profile-header.module.css';

const PostCard = React.lazy(() => import('./PostCard'));
import { getUserIdFromToken } from '../auth/authUtils';
const API_URL = import.meta.env.VITE_API_URL;

const ProfileHeader = ({ followers, following, profile }) => {
  const [showModal, setShowModal] = useState(false);
  const [bioInput, setBioInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [userPosts, setUserPosts] = useState([]);
  const [fullNameInput, setFullNameInput] = useState('');
  const [error, setError] = useState(null);
  const [emailInput, setEmailInput] = useState('');
  const [postCount, setPostCount] = useState(0);
  const [activeTab, setActiveTab] = useState('posts');
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [accountCreationDate, setAccountCreationDate] = useState('');

  useEffect(() => {
    if (profile) {
      setBioInput(profile.bio);
      setTitleInput(profile.title);
      setFullNameInput(profile.fullName);
      setEmailInput(profile.email);
      setAccountCreationDate(
        new Date(profile.accountCreationDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      );
    }
  }, [profile]);

  const handleShowModal = () => {
    setBioInput(profile.bio);
    setTitleInput(profile.title);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);
  const handleShowUsernameModal = () => setShowUsernameModal(true);
  const handleCloseUsernameModal = () => setShowUsernameModal(false);

  const fetchPostCount = useCallback(async () => {
    const userId = getUserIdFromToken();
    if (!userId) {
      console.error('User ID not found in token.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/v2/posts/list/count/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setPostCount(response.data);
      }
    } catch (error) {
      console.error('Error fetching post count:', error.message);
    }
  }, []);

  useEffect(() => {
    fetchPostCount();
  }, [fetchPostCount]);

  const fetchUserPosts = useCallback(async () => {
    const userId = getUserIdFromToken();
    if (!userId) {
      console.error('User ID not found in token.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/v2/posts/list/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        const filteredPosts = response.data
          .filter((post) => !post.deleted)
          .sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

        setUserPosts(filteredPosts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error.message);
      setError('Error fetching posts. Please try again later.');
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'posts') {
      fetchUserPosts();
    }
  }, [activeTab, fetchUserPosts]);

  const handleUpdateProfile = async () => {
    const userId = getUserIdFromToken();
    if (!userId) {
      console.error('User ID not found in token.');
      return;
    }

    const updateData = {
      fullName: fullNameInput,
      bio: bioInput,
      title: titleInput,
      email: emailInput,
    };

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/api/v2/users/update/${userId}`,
        updateData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        handleCloseModal();
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating profile:', error.message);
      setError('Error updating profile. Please try again later.');
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    const inputSetters = {
      bio: setBioInput,
      title: setTitleInput,
      email: setEmailInput,
    };

    inputSetters[name]?.(value);
  };

  if (!profile) {
    return <div style={{ marginTop: 150 }}>Loading profile...</div>;
  }

  const linkIconMapping = {
    github: <FaGithub />,
    linkedin: <FaLinkedin />,
    twitter: <FaTwitter />,
    default: <FaGlobe />,
  };

  const getLinkIcon = (url) => {
    try {
      const { hostname } = new URL(url);
      if (hostname.includes('github.com')) return linkIconMapping.github;
      if (hostname.includes('linkedin.com')) return linkIconMapping.linkedin;
      if (hostname.includes('twitter.com')) return linkIconMapping.twitter;
      return linkIconMapping.default;
    } catch {
      return linkIconMapping.default;
    }
  };

  return (
    <div
      className={styles.constructor_container}
      style={{
        border: '0.2px solid lightgrey',
        position: 'relative',
        boxShadow: '0 8px 12px rgba(0, 0, 0, 0.2)',
        background: 'white',
        color: 'black',
        marginBottom: 40,
        marginTop: 20,
        borderRadius: 20,
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '300px' }}>
        <img
          src={placeHolderImage}
          alt='Cover'
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: 20,
          }}
        />
        <div style={{ position: 'absolute', bottom: '-50px', left: '20px' }}>
          <Image
            src={profileImage}
            roundedCircle
            style={{
              width: '120px',
              height: '120px',
              border: '4px solid white',
            }}
          />
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: '80px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h3
            style={{ margin: 0, cursor: 'pointer' }}
            onClick={handleShowUsernameModal}
          >
            {profile.username}
          </h3>
          <Button
            className={`${styles.light} ${styles.me_1} ${styles.button_edit}`}
            onClick={handleShowModal}
            style={{ marginLeft: '10px' }}
          >
            Edit
          </Button>
        </div>
        <h6 style={{ color: 'grey', fontSize: 14 }}>{profile.title}</h6>
        <p>{profile.bio}</p>
        <div style={{ display: 'flex', gap: '20px' }}>
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
        <div style={{ marginTop: '20px' }}>
          {profile.links?.length > 0 && (
            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
              {profile.links.map((link, index) => (
                <a
                  key={index}
                  href={link}
                  target='_blank'
                  rel='noreferrer'
                  style={{
                    color: 'black',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ marginRight: '5px' }}>
                    {getLinkIcon(link)}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
      <div
        onClick={() => setActiveTab('posts')}
        style={{
          fontWeight: activeTab === 'posts' ? 'bold' : 'normal',
          padding: '10px',
          borderBottom: activeTab === 'posts' ? '2px solid #1c1c1d' : 'none',
          cursor: 'pointer',
          textAlign: 'center',
          marginTop: '20px',
        }}
      >
        Posts
      </div>
      <div style={{ marginTop: '20px' }} className={styles.pst_lst}>
        {activeTab === 'posts' && (
          <div className={styles.post_list1}>
            {userPosts.length > 0 ? (
              userPosts.map((post) => <PostCard key={post.id} {...post} />)
            ) : (
              <p style={{ textAlign: 'center' }}>No posts available.</p>
            )}
          </div>
        )}
      </div>
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Update your profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId='formGivenName'>
            <Form.Label>Given Name</Form.Label>
            <Form.Control
              type='text'
              name='fullName'
              value={fullNameInput}
              onChange={(e) => setFullNameInput(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId='formBio'>
            <Form.Label>Bio</Form.Label>
            <Form.Control
              type='text'
              name='bio'
              value={bioInput}
              onChange={handleInputChange}
            />
          </Form.Group>
          <Form.Group controlId='formTitle'>
            <Form.Label>Title</Form.Label>
            <Form.Control
              type='text'
              name='title'
              value={titleInput}
              onChange={handleInputChange}
            />
          </Form.Group>
          <Form.Group controlId='formEmail'>
            <Form.Label>Email</Form.Label>
            <Form.Control
              type='email'
              name='email'
              value={emailInput}
              onChange={handleInputChange}
              placeholder='Enter your email'
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant='secondary' onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant='danger' onClick={handleUpdateProfile}>
            Update
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showUsernameModal} onHide={handleCloseUsernameModal}>
        <Modal.Header>
          <Modal.Title
            className={`${styles.text_center} ${styles.constructor_container}`}
          >
            Account Information
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ textAlign: 'center' }}>
          <p>
            To help keep our community authentic, we’re showing information
            about accounts on AЯYHƆ. People can see this by tapping on the
            username on your profile.
            <a
              href='/importance'
              style={{ color: 'blue', textDecoration: 'underline' }}
            >
              {' '}
              See why this information is important.
            </a>
          </p>
          <p
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
            }}
          >
            <IoIosCalendar style={{ marginRight: '5px' }} />
            <span style={{ color: 'gray' }}>
              Joined Date {accountCreationDate}
            </span>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={handleCloseUsernameModal}>
            Close
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
    accountCreationDate: PropTypes.string.isRequired,
  }).isRequired,
};

export default ProfileHeader;