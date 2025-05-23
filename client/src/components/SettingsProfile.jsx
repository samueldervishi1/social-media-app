import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../styles/settingsProfile.module.css';
import { getUsernameFromServer, getUserIdFromServer } from '../auth/authUtils';

const API_URL = import.meta.env.VITE_API_URL;

const SettingsProfile = () => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    title: '',
    links: [],
    isPrivate: true,
  });
  const [error, setError] = useState('');
  const { username } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const loggedInUsername = await getUsernameFromServer();
        if (username !== loggedInUsername) {
          navigate('/profile');
          return;
        }

        const response = await axios.get(`${API_URL}users/lookup/${username}`, {
          withCredentials: true,
        });
        const profileData = response.data;
        setProfile(profileData);
        setFormData({
          bio: profileData.bio || '',
          title: profileData.title || '',
          links: profileData.links || [],
          isPrivate: profileData.isPrivate,
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [username, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? !checked : value,
    }));
  };

  const handleLinkChange = (index, value) => {
    setFormData((prev) => {
      const newLinks = [...prev.links];
      newLinks[index] = value;
      return { ...prev, links: newLinks };
    });
  };

  const addLink = () => {
    setFormData((prev) => ({
      ...prev,
      links: [...prev.links, ''],
    }));
  };

  const removeLink = (index) => {
    setFormData((prev) => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const userId = await getUserIdFromServer();
      const response = await axios.put(
        `${API_URL}profile/${userId}/update`,
        formData,
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        navigate('/profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  if (isLoading) {
    return <div className={styles.loadingContainer}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.errorContainer}>{error}</div>;
  }

  return (
    <div className={styles.settingsProfileContainer}>
      <h1 className={styles.title}>Profile Settings</h1>
      <form onSubmit={handleSubmit} className={styles.settingsForm}>
        <div className={styles.formGroup}>
          <label htmlFor='bio'>Bio</label>
          <textarea
            id='bio'
            name='bio'
            value={formData.bio}
            onChange={handleInputChange}
            className={styles.textArea}
            placeholder='Tell us about yourself'
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor='title'>Title</label>
          <input
            type='text'
            id='title'
            name='title'
            value={formData.title}
            onChange={handleInputChange}
            className={styles.input}
            placeholder='Your title or occupation'
          />
        </div>

        <div className={styles.formGroup}>
          <label>Social Links</label>
          <div className={styles.linksContainer}>
            {formData.links.map((link, index) => (
              <div key={index} className={styles.linkInput}>
                <input
                  type='url'
                  value={link}
                  onChange={(e) => handleLinkChange(index, e.target.value)}
                  className={styles.input}
                  placeholder='https://'
                />
                <button
                  type='button'
                  onClick={() => removeLink(index)}
                  className={styles.removeLinkButton}
                  aria-label='Remove link'
                >
                  &times;
                </button>
              </div>
            ))}
            <button
              type='button'
              onClick={addLink}
              className={styles.addLinkButton}
            >
              + Add Link
            </button>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>
            <input
              type='checkbox'
              name='isPrivate'
              checked={!formData.isPrivate}
              onChange={handleInputChange}
              className={styles.checkbox}
            />
            Make profile public
          </label>
        </div>

        <div className={styles.buttonGroup}>
          <button
            type='submit'
            className={styles.saveButton}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type='button'
            onClick={handleCancel}
            className={styles.cancelButton}
            disabled={isSaving}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsProfile;