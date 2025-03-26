import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import placeHolderImage from '../assets/placeholder.png';
import placeHolderLogo from '../assets/logo-placeholder-image.png';
import loader from '../assets/loadingg.gif';
import { Snackbar, Alert } from '@mui/material';
import { Modal, Button, Form } from 'react-bootstrap';
import styles from '../styles/communitiesList.module.css';

import { getUserIdFromToken } from '../auth/authUtils';
const API_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem('token');
const userId = getUserIdFromToken();

const CommunitiesList = () => {
  const [communities, setCommunities] = useState([]);
  const [membersCounts, setMembersCounts] = useState({});
  const [error, setError] = useState(null);
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [communityName, setCommunityName] = useState('');
  const [communityDescription, setCommunityDescription] = useState('');
  const [faqs, setFaqs] = useState([{ question: '', answer: '' }]);

  const navigate = useNavigate();

  const getMemberText = (count) => {
    if (count === 1) return '1 member';
    if (count >= 0) return `${count} members`;
    return 'Loading...';
  };

  const handleFaqChange = (index, field, value) => {
    const newFaqs = [...faqs];
    newFaqs[index][field] = value;
    setFaqs(newFaqs);
  };

  const addFaq = () => {
    setFaqs([...faqs, { question: '', answer: '' }]);
  };

  const removeFaq = (index) => {
    const newFaqs = faqs.filter((_, i) => i !== index);
    setFaqs(newFaqs);
  };

  const isValidCommunityName = (name) => {
    return !name.includes(' ');
  };

  useEffect(() => {
    const fetchCommunities = async () => {
      console.log('Fetching communities...');

      try {
        const response = await axios.get(`${API_URL}data-flux`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-App-Version': '2.2.10',
          },
        });

        console.log('Communities fetched successfully:', response.data);
        setCommunities(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error('Error fetching communities:', err.message);
        setError(err.message);
      } finally {
        setTimeout(() => {
          setLoading(false);
          console.log('Community fetch process completed.');
        }, 2000);
      }
    };

    fetchCommunities();
  }, []);

  useEffect(() => {
    const fetchMembersCount = async () => {
      console.log('Fetching member counts for communities:', communities);

      try {
        const counts = await Promise.all(
          communities.map(async (community) => {
            try {
              console.log(`Fetching count for community: ${community.name}`);
              const response = await axios.get(
                `${API_URL}sector-metrics/${encodeURIComponent(
                  community.name
                )}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                  'X-App-Version': '2.2.10',
                }
              );

              console.log(`Count for ${community.name}:`, response.data);
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

        console.log('Final member counts:', countsMap);
        setMembersCounts(countsMap);
      } catch (err) {
        console.error('Failed to fetch member counts:', err.message);
      }
    };

    if (communities.length > 0) {
      fetchMembersCount();
    } else {
      console.log('No communities found, skipping member count fetch.');
    }
  }, [communities]);

  const handleJoinCommunity = async (communityId) => {
    try {
      if (!userId) {
        setSnackbarMessage('User is not authenticated.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      const response = await axios.post(
        `${API_URL}link-up/${communityId}/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-App-Version': '2.2.10',
          },
        }
      );

      if (response.status === 200) {
        setJoinedCommunities((prev) => [...prev, communityId]);
        setSnackbarMessage('You joined the community successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      }
    } catch (err) {
      setError(err.message);
      setSnackbarMessage('Something went wrong. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleCreateCommunity = async () => {
    if (!isValidCommunityName(communityName)) {
      setSnackbarMessage('Community name cannot contain spaces.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      const requestData = {
        name: communityName,
        description: communityDescription,
        faqs: faqs,
      };

      const response = await axios.post(
        `${API_URL}deploy/${userId}`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-App-Version': '2.2.10',
          },
        }
      );

      if (response.status === 201) {
        setSnackbarMessage('Community created successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);

        setShowCreateModal(false);
        setCommunityName('');
        setCommunityDescription('');
        setFaqs([{ question: '', answer: '' }]);

        setCommunities((prevCommunities) => [
          ...prevCommunities,
          response.data,
        ]);

        window.location.reload();
      }
    } catch (err) {
      setSnackbarMessage('Failed to create community.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      console.log(err);
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
      <div className={styles.header}>
        <h1 className={styles.title}>Popular Communities</h1>
        <div>
          <Button
            className={styles.create_button}
            onClick={() => setShowCreateModal(true)}
          >
            Create New Community
          </Button>
        </div>
      </div>

      {error && (
        <p className={styles.error}>
          Something went wrong. Please try again later.
        </p>
      )}

      {loading ? (
        <div className={styles.loading_community}>
          <img
            src={loader}
            alt='Loading...'
            className={styles.spinner_community}
          />
        </div>
      ) : (
        <>
          {communities.length > 0 ? (
            <div className={styles.card_container}>
              {communities.map((community) => {
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
                        {isUserJoined ? 'Joined' : 'Join'}
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
                          <a href='#'>Add to favourites</a>
                          <a href='#'>Add to custom feed</a>
                          <a href='#'>Share community</a>
                        </div>
                      )}
                    </div>

                    <div className={styles.card_content}>
                      <h2>
                        c/{community.name} <span>-</span>
                        <span className={styles.members_count}>
                          {membersCounts[community.name] !== undefined
                            ? getMemberText(membersCounts[community.name])
                            : 'Loading...'}
                        </span>
                      </h2>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className={styles.no_communities}>No communities available. </p>
          )}
        </>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Create Community Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header style={{ backgroundColor: 'black', color: 'white' }}>
          <Modal.Title>Create New Community</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: 'black', color: 'white' }}>
          <Form>
            <Form.Group className='mb-3'>
              <Form.Label style={{ color: 'white' }}>Community Name</Form.Label>
              <Form.Control
                type='text'
                value={communityName}
                onChange={(e) => setCommunityName(e.target.value)}
                style={{ color: 'white', backgroundColor: '#333' }}
              />
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label style={{ color: 'white' }}>Description</Form.Label>
              <Form.Control
                as='textarea'
                rows={3}
                value={communityDescription}
                onChange={(e) => setCommunityDescription(e.target.value)}
                style={{ color: 'white', backgroundColor: '#333' }}
              />
            </Form.Group>
            <div>
              <h5 style={{ color: 'white' }}>FAQs</h5>
              {faqs.map((faq, index) => (
                <div key={index}>
                  <Form.Group className='mb-3'>
                    <Form.Label style={{ color: 'white' }}>
                      Question {index + 1}
                    </Form.Label>
                    <Form.Control
                      type='text'
                      value={faq.question}
                      onChange={(e) =>
                        handleFaqChange(index, 'question', e.target.value)
                      }
                      style={{ color: 'white', backgroundColor: '#333' }}
                    />
                  </Form.Group>
                  <Form.Group className='mb-3'>
                    <Form.Label style={{ color: 'white' }}>Answer</Form.Label>
                    <Form.Control
                      type='text'
                      value={faq.answer}
                      onChange={(e) =>
                        handleFaqChange(index, 'answer', e.target.value)
                      }
                      style={{ color: 'white', backgroundColor: '#333' }}
                    />
                  </Form.Group>
                  <div className={styles.button_row}>
                    <Button variant='danger' onClick={() => removeFaq(index)}>
                      Remove FAQ
                    </Button>
                    <Button variant='primary' onClick={addFaq}>
                      Add FAQ
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Form>
        </Modal.Body>

        <Modal.Footer style={{ backgroundColor: 'black' }}>
          <Button variant='secondary' onClick={() => setShowCreateModal(false)}>
            Close
          </Button>
          <Button
            variant='primary'
            onClick={handleCreateCommunity}
            disabled={!communityName || !communityDescription}
          >
            Create
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CommunitiesList;