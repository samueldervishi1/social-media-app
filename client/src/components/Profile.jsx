import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { createContext } from 'react';
import { Container } from 'react-bootstrap';
import loaderImage from '../assets/logo.gif';
import styles from '../styles/profile.module.css';

import { getUsernameFromToken } from '../auth/authUtils';
const ProfileHeader = React.lazy(() => import('./ProfileHeader'));
const API_URL = import.meta.env.VITE_API_URL;
const username = getUsernameFromToken();

export const ProfileContext = createContext(null);

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [postsCount, setPostsCount] = useState(0);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');

      if (username) {
        const profileResponse = await axios.get(
          `${API_URL}/api/v2/users/info/${username}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (profileResponse.status === 200) {
          setProfileData(profileResponse.data);
        } else {
          console.error('Failed to fetch profile data');
        }
      } else {
        console.error('Token not found in localStorage or invalid');
      }
    } catch (error) {
      console.error('Error fetching data:', error.message);
      setError(
        'Something went wrong. Please check your internet connection or try again later.'
      ); // Sets an error message for display
    }
  };

  return (
    <ProfileContext.Provider value={profileData}>
      <div className={styles.profile_layout}>
        <div className={styles.main_content}>
          {isLoading ? (
            <div className={styles.loader_overlay}>
              <img
                src={loaderImage}
                alt='Loading...'
                className={styles.loader_image}
              />
            </div>
          ) : (
            <Container className={styles.classname}>
              {profileData ? (
                <ProfileHeader posts={postsCount} profile={profileData} />
              ) : (
                <div className={styles.profile_error}>
                  {error || 'Profile data could not be loaded'}
                </div>
              )}
            </Container>
          )}
        </div>
      </div>
    </ProfileContext.Provider>
  );
};

export default Profile;