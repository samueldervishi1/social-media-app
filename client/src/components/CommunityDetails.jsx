import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import { IoCreateOutline } from 'react-icons/io5';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import { TiArrowDownThick, TiArrowUpThick } from 'react-icons/ti';
import { FiShare2 } from 'react-icons/fi';
import { BsThreeDots } from 'react-icons/bs';
import { BiCalendar, BiGroup } from 'react-icons/bi';
import placeHolderImage from '../assets/placeholder.png';
import placeHolderLogo from '../assets/logo-placeholder-image.png';
import defaultUserIcon from '../assets/user.webp';
import loader from '../assets/377.gif';
import Snackbar from '@mui/material/Snackbar';
import styles from '../styles/communityDetails.module.css';
import { getUserIdFromServer, getUsernameFromServer } from '../auth/authUtils';

const API_URL = import.meta.env.VITE_API_URL;

const CommunityDetails = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [community, setCommunity] = useState(null);
  const [membersCount, setMembersCount] = useState(null);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likeStatus, setLikeStatus] = useState({});
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const [showShareModal, setShowShareModal] = useState(false);
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const result = await getUserIdFromServer();
      setUserId(result);
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchUsername = async () => {
      const result = await getUsernameFromServer();
      setUsername(result);
    };

    fetchUsername();
  }, []);

  const getMemberText = (count) => {
    if (count === 1) return '1 member';
    if (count >= 0) return `${count} members`;
    return 'Loading...';
  };

  //fetch community details
  useEffect(() => {
    const fetchCommunityDetails = async () => {
      try {
        const response = await axios.get(`${API_URL}access-node/${name}`, {
          withCredentials: true,
          headers: {
            'X-App-Version': import.meta.env.VITE_APP_VERSION,
          },
        });
        setCommunity(response.data);
        fetchPosts(response.data.postIds);
      } catch (err) {
        setError('Failed to fetch community details');
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
      const postDetailsPromises = postIds.map(async (postId) => {
        try {
          const postResponse = await axios.get(
            `${API_URL}data-stream/${postId}`,
            {
              withCredentials: true,
              headers: {
                'X-App-Version': import.meta.env.VITE_APP_VERSION,
              },
            }
          );
          const post = postResponse.data;

          if (!post.id) {
            return null;
          }

          return post;
        } catch {
          return null;
        }
      });

      const postDetails = await Promise.all(postDetailsPromises);
      setPosts(postDetails.filter((post) => post !== null));
    } catch (err) {
      setError('Failed to load posts.');
    }
  };

  //fetch members count for communities
  useEffect(() => {
    const fetchMembersCount = async () => {
      try {
        const response = await axios.get(
          `${API_URL}sector-metrics/${encodeURIComponent(name)}`,
          {
            withCredentials: true,
            headers: {
              'X-App-Version': import.meta.env.VITE_APP_VERSION,
            },
          }
        );

        setMembersCount(response.data);
      } catch (err) {
        console.error('Error fetching member count:', err.message);
        setMembersCount('N/A');
      }
    };

    if (name) {
      fetchMembersCount();
    }
  }, [name]);

  //join community
  const handleJoinCommunity = async (communityId) => {
    try {
      if (!userId) {
        setSnackbarMessage('User is not authenticated');
        setSnackbarOpen(true);
        return;
      }

      const response = await axios.post(
        `${API_URL}link-up/${communityId}/${userId}`,
        {},
        {
          withCredentials: true,
          headers: {
            'X-App-Version': import.meta.env.VITE_APP_VERSION,
          },
        }
      );

      if (response.status === 200) {
        setSnackbarMessage('You joined the community successfully!');
        setSnackbarOpen(true);
      }
    } catch (err) {
      setSnackbarMessage(err.message);
      setSnackbarOpen(true);
    }
  };

  //handle create community post
  const handleCreatePost = async () => {
    if (!postContent.trim()) {
      setSnackbarMessage('Post content cannot be empty');
      setSnackbarOpen(true);
      return;
    }

    const postData = {
      content: postContent,
      ownerId: userId,
    };

    try {
      const response = await axios.post(
        `${API_URL}${name}/uplink-posts`,
        postData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'X-App-Version': import.meta.env.VITE_APP_VERSION,
          },
        }
      );

      if (response.status === 200) {
        setSnackbarMessage('Post created successfully!');
        setSnackbarOpen(true);
        setPostContent('');
        setShowPostModal(false);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (err) {
      setSnackbarMessage('Error creating post: ' + err.message);
      setSnackbarOpen(true);
    }
  };

  //calculate time of the post
  const timeSincePost = (createTime) => {
    const postDateTime = new Date(createTime);
    const seconds = Math.floor((new Date() - postDateTime) / 1000);
    let interval = Math.floor(seconds / 31536000);

    if (interval >= 1) return interval + 'y ago';
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return interval + 'mo ago';
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval + 'd ago';
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval + 'h ago';
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval + 'min ago';
    return seconds < 10 ? 'just now' : seconds + 's ago';
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
  };

  const formatTime = (timeString) => {
    const options = { hour: 'numeric', minute: 'numeric' };
    const time = new Date(timeString);
    return time.toLocaleTimeString('en-US', options);
  };

  const toggleAnswer = (index) => {
    setActiveQuestion(activeQuestion === index ? null : index);
  };

  if (error) return <div>Error: {error}</div>;

  if (loading) {
    return (
      <div className={styles.loading_details}>
        <img src={loader} alt='Loading...' className={styles.spinner_details} />
      </div>
    );
  }

  if (!community) return <div>Loading...</div>;

  const isUserJoined = community.userIds && community.userIds.includes(userId);

  return (
    <div className={styles.community_details_container}>
      <button className={styles.back_button} onClick={() => navigate('/c/communities')}>
        Back to Communities
      </button>
      {loading ? (
        <div className={styles.loading_container}>
          <img src={loader} alt='Loading...' className={styles.spinner} />
        </div>
      ) : (
        <>
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

          <div className={styles.community_header}>
            <h2 className={styles.community_name}>c/{community.name}</h2>

            <div className={styles.community_buttons}>
              <button
                className={`${styles.join_button} ${
                  isUserJoined ? styles.joined : ''
                }`}
                onClick={() => {
                  if (!isUserJoined) {
                    handleJoinCommunity(community.communityId);
                  }
                }}
              >
                {isUserJoined ? 'Joined' : 'Join'}
              </button>

              <button
                className={styles.create_post_button}
                onClick={() => setShowPostModal(true)}
              >
                <IoCreateOutline /> Create Post
              </button>

              <button
                className={styles.share_button}
                onClick={() => setShowShareModal(true)}
              >
                <FiShare2 /> Share
              </button>
            </div>
          </div>
          <hr />
          <div className={styles.content_container}>
            <div className={styles.left_side}>
              {posts.length === 0 ? (
                <div className={styles.no_posts_message}>
                  <p>No posts in this community yet.</p>
                  <p>Be the first to create a post!</p>
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className={styles.post_community_card}>
                    <div className={styles.post_header}>
                      <div className={styles.post_user_info}>
                        <img
                          src={defaultUserIcon}
                          alt='User'
                          className={styles.user_community_icon}
                        />
                        <div className={styles.userMetadata}>
                          <span className={styles.post_username}>
                            {userId || 'Anonymous'}
                          </span>
                          <span className={styles.bullet}>•</span>
                          <span className={styles.post_community_time}>
                            {timeSincePost(post.createTime)}
                          </span>
                        </div>
                      </div>

                      <button
                        className={styles.community_menu_button}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDropdownVisible(
                            post.id === dropdownVisible ? null : post.id
                          );
                        }}
                      >
                        <BsThreeDots />
                      </button>

                      {dropdownVisible === post.id && (
                        <div className={styles.community_dropdown_menu}>
                          <a href='#' onClick={() => handleReportPost(post.id)}>
                            Report
                          </a>
                        </div>
                      )}
                    </div>

                    <p className={styles.community_content}>{post.content}</p>

                    <div className={styles.community_action}>
                      <div className={styles.like_buttons_container}>
                        <button
                          className={`${styles.like_button} ${
                            likeStatus[post.id] === 'like' ? styles.active : ''
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
                            likeStatus[post.id] === 'dislike'
                              ? styles.active
                              : ''
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
                  <h3>About c/{community.name}</h3>
                  <p>{community.about}</p>
                </div>

                <div className={styles.community_info_details}>
                  <div className={styles.community_created}>
                    <BiCalendar />
                    <span>
                      <strong>Created:</strong>{' '}
                      {formatDate(community.createTime)}
                    </span>
                  </div>
                  <div className={styles.community_members}>
                    <BiGroup />
                    <span>
                      <strong>Members:</strong>{' '}
                      {membersCount !== null
                        ? getMemberText(membersCount)
                        : 'Loading...'}
                    </span>
                  </div>
                </div>

                <div className={styles.community_faq}>
                  <h4>Frequently Asked Questions</h4>
                  {community.faqs.map((qa, index) => (
                    <div key={index} className={styles.faq_item}>
                      <div
                        className={styles.faq_question}
                        onClick={() => toggleAnswer(index)}
                      >
                        <span className={styles.question_text}>
                          {qa.question}
                        </span>
                        <span>{activeQuestion === index ? '−' : '+'}</span>
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
        </>
      )}

      <Modal show={showPostModal} onHide={() => setShowPostModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <textarea
            className='form-control'
            rows='5'
            placeholder="What's on your mind?"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
          ></textarea>
        </Modal.Body>
        <Modal.Footer>
          <button className='btn btn-primary' onClick={handleCreatePost}>
            Post
          </button>
          <button
            className='btn btn-secondary'
            onClick={() => setShowPostModal(false)}
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>

      <Modal show={showShareModal} onHide={() => setShowShareModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Share Community</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Share this community using the links below:</p>
          <div className={styles.share_links}>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.origin}/c/community/${community.name}`}
              target='_blank'
              rel='noopener noreferrer'
            >
              <FaFacebook /> Facebook
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${window.location.origin}/c/community/${community.name}&text=Check out this community:`}
              target='_blank'
              rel='noopener noreferrer'
            >
              <FaTwitter /> Twitter
            </a>
            <a
              href={`https://www.instagram.com/?url=${window.location.origin}/c/community/${community.name}`}
              target='_blank'
              rel='noopener noreferrer'
            >
              <FaInstagram /> Instagram
            </a>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            className='btn btn-secondary'
            onClick={() => setShowShareModal(false)}
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      />
    </div>
  );
};

export default CommunityDetails;