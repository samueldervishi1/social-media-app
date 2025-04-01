import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getUserIdFromServer } from '../auth/authUtils';
import { FaUsers } from 'react-icons/fa';
import loader from '../assets/377.gif';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const UserCommunities = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const result = await getUserIdFromServer();
      setUserId(result);
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchCommunities = async () => {
      if (!userId) return;
      try {
        const response = await axios.get(`${API_URL}cyber-user/${userId}`, {
          withCredentials: true,
          headers: {
            'X-App-Version': import.meta.env.VITE_APP_VERSION,
          },
        });

        if (response.status === 204) {
          console.log('Server returned 204 No Content');
          setCommunities([]);
          return;
        }

        if (response.data && response.data.length > 0) {
          setCommunities(response.data);
        } else {
          console.log('No communities data in response:', response);
          setCommunities([]);
        }
      } catch (err) {
        console.error('Error fetching communities:', err);
        setError(err.response?.data?.message || 'Failed to fetch communities.');
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 2000);
      }
    };

    fetchCommunities();
  }, [userId]);

  if (loading)
    return (
      <div style={styles.loaderContainer}>
        <img src={loader} alt='Loading...' style={styles.loader} />
      </div>
    );

  if (error)
    return (
      <div style={styles.errorContainer}>
        <h3>Oops!</h3>
        <p>{error}</p>
      </div>
    );

  return (
    <div style={styles.fadeIn}>
      <h2 style={styles.heading}>Your Communities</h2>
      <div style={styles.container}>
        {communities.length > 0 ? (
          communities.map((community) => (
            <div
              key={`${community.id}-${community.name}`}
              style={styles.card}
              className='community-card'
            >
              <div style={styles.cardHeader}>
                <Link
                  to={`/c/community/${community.name}`}
                  style={styles.communityLink}
                >
                  <h3 style={styles.communityName}>{community.name}</h3>
                </Link>
              </div>
              <p style={styles.description}>{community.description}</p>
              <div style={styles.memberCount}>
                <FaUsers style={styles.userIcon} />
                <span>{community.userIds.length} members</span>
              </div>
            </div>
          ))
        ) : (
          <div style={styles.emptyState}>
            <FaUsers size={50} style={{ marginBottom: '20px' }} />
            <p>You are not part of any communities yet.</p>
            <p>Join some communities to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  fadeIn: {
    opacity: 0,
    animation: 'fadeIn 0.3s forwards',
  },
  heading: {
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
    color: 'black',
    fontSize: '2.5rem',
    fontWeight: 'bold',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
  },
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '25px',
    padding: '20px',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  card: {
    border: 'none',
    borderRadius: '15px',
    padding: '20px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    maxWidth: '500px',
  },
  cardHeader: {
    borderBottom: '2px solid #f0f0f0',
    marginBottom: '15px',
    paddingBottom: '10px',
  },
  communityLink: {
    textDecoration: 'none',
  },
  communityName: {
    color: '#1a73e8',
    margin: 0,
    fontSize: '1.4rem',
  },
  description: {
    color: '#555',
    fontSize: '1rem',
    lineHeight: '1.5',
    margin: '15px 0',
  },
  memberCount: {
    display: 'flex',
    alignItems: 'center',
    color: '#666',
    fontSize: '0.9rem',
    marginTop: '15px',
  },
  userIcon: {
    marginRight: '8px',
    color: '#1a73e8',
  },
  loaderContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50vh',
  },
  loader: {
    width: '30px',
    height: '30px',
  },
  errorContainer: {
    textAlign: 'center',
    padding: '40px',
    color: '#dc3545',
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '50px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '15px',
    color: '#666',
  },
};
const css = `
  .community-card:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }

  @keyframes fadeIn {
    to {
      opacity: 1;
    }
  }
`;

const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.innerText = css;
document.head.appendChild(styleSheet);

export default UserCommunities;