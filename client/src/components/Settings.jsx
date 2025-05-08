import React, { useState, lazy, Suspense, useCallback } from 'react';
import axios from 'axios';
import {
  FaInfoCircle,
  FaFileContract,
  FaEnvelope,
  FaQuestionCircle,
  FaServer,
  FaTrash,
  FaPauseCircle,
} from 'react-icons/fa';
import styles from '../styles/settings.module.css';
import { useAuth } from '../auth/AuthContext';
import { getUserIdFromServer } from '../auth/authUtils';

const About = lazy(() => import('./About'));
const TermsAndServices = lazy(() => import('./Terms'));
const Contact = lazy(() => import('./Contact'));
const FAQ = lazy(() => import('./FAQ'));

const API_URL = import.meta.env.VITE_API_URL;

const Settings = () => {
  const [activeSection, setActiveSection] = useState('about');
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [agreeToDelete, setAgreeToDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const [deactivatePassword, setDeactivatePassword] = useState('');
  const [deactivateReason, setDeactivateReason] = useState('');
  const [agreeToDeactivate, setAgreeToDeactivate] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState('');

  const [userId, setUserId] = useState(null);
  const { logout } = useAuth();

  React.useEffect(() => {
    const fetchUserId = async () => {
      const result = await getUserIdFromServer();
      setUserId(result);
    };

    fetchUserId();
  }, []);

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const handleDeleteAccount = useCallback(
    async (e) => {
      e.preventDefault();

      if (!password) {
        setError('Please enter your password to confirm.');
        return;
      }

      if (!reason) {
        setError('Please select a reason for leaving.');
        return;
      }

      if (!agreeToDelete) {
        setError(
          'Please confirm that you understand this action is permanent.'
        );
        return;
      }

      setError('');
      setIsDeleting(true);

      try {
        await axios.delete(`${API_URL}profiles/${userId}/delete`, {
          withCredentials: true,
          headers: {
            'X-App-Version': import.meta.env.VITE_APP_VERSION,
          },
        });

        document.cookie.split(';').forEach((cookie) => {
          const [name] = cookie.trim().split('=');
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });

        await logout();
        window.location.href = '/login';
      } catch (error) {
        console.error('Error deleting account:', error);
        setError('Failed to delete account. Please try again later.');
        setIsDeleting(false);
      }
    },
    [userId, logout, password, reason, agreeToDelete]
  );

  const handleDeactivateAccount = useCallback(
    async (e) => {
      e.preventDefault();

      if (!deactivatePassword) {
        setDeactivateError('Please enter your password to confirm.');
        return;
      }

      if (!deactivateReason) {
        setDeactivateError('Please select a reason for deactivating.');
        return;
      }

      if (!agreeToDeactivate) {
        setDeactivateError('Please confirm that you understand this action.');
        return;
      }

      setDeactivateError('');
      setIsDeactivating(true);

      try {
        await axios.put(
          `${API_URL}profiles/${userId}/deactivate`,
          {
            password: deactivatePassword,
            reason: deactivateReason,
          },
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
              'X-App-Version': import.meta.env.VITE_APP_VERSION,
            },
          }
        );

        document.cookie.split(';').forEach((cookie) => {
          const [name] = cookie.trim().split('=');
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });

        await logout();
        window.location.href = '/login';
      } catch (error) {
        console.error('Error deactivating account:', error);
        setDeactivateError(
          error.response?.data?.message ||
            'Failed to deactivate account. Please try again later.'
        );
        setIsDeactivating(false);
      }
    },
    [userId, logout, deactivatePassword, deactivateReason, agreeToDeactivate]
  );

  const renderContent = () => {
    const LoadingFallback = () => (
      <div className={styles.loading_fallback}>
        <p>Loading content...</p>
      </div>
    );

    switch (activeSection) {
      case 'about':
        return (
          <div className={styles.content_section}>
            <h2>About Us</h2>
            <Suspense fallback={<LoadingFallback />}>
              <About />
            </Suspense>
          </div>
        );
      case 'terms':
        return (
          <div className={styles.content_section}>
            <h2>Terms of Service</h2>
            <Suspense fallback={<LoadingFallback />}>
              <TermsAndServices />
            </Suspense>
          </div>
        );
      case 'contact':
        return (
          <div className={styles.content_section}>
            <h2>Contact Us</h2>
            <Suspense fallback={<LoadingFallback />}>
              <Contact />
            </Suspense>
          </div>
        );
      case 'help':
        return (
          <div className={styles.content_section}>
            <h2>Help & Support</h2>
            <Suspense fallback={<LoadingFallback />}>
              <FAQ />
            </Suspense>
          </div>
        );
      case 'server':
        return (
          <div className={styles.content_section}>
            <h2>Server Health</h2>
            <div className={styles.iframe_container}>
              <iframe
                src='http://localhost:9090/index.html'
                title='Server Health Dashboard'
                className={styles.server_health_iframe}
                frameBorder='0'
                allowFullScreen
              />
            </div>
          </div>
        );
      case 'deactivate':
        return (
          <div className={styles.content_section}>
            <h2>Deactivate Account</h2>
            <div className={styles.warning_box}>
              <h3>Temporarily Deactivate Your Account</h3>
              <p>Deactivating your account will:</p>
              <ul>
                <li>Hide your profile from other users</li>
                <li>Temporarily remove your content from view</li>
                <li>Preserve your data for when you return</li>
              </ul>
              <p>
                You can reactivate your account at any time by logging in again.
              </p>
            </div>
            {deactivateError && (
              <div className={styles.error_message}>{deactivateError}</div>
            )}
            <form
              className={styles.delete_form}
              onSubmit={handleDeactivateAccount}
            >
              <div className={styles.form_group}>
                <label htmlFor='deactivatePassword'>
                  Enter your password to confirm:
                </label>
                <input
                  type='password'
                  id='deactivatePassword'
                  value={deactivatePassword}
                  onChange={(e) => setDeactivatePassword(e.target.value)}
                />
              </div>
              <div className={styles.form_group}>
                <label htmlFor='deactivateReason'>
                  Please tell us why you're deactivating:
                </label>
                <select
                  id='deactivateReason'
                  value={deactivateReason}
                  onChange={(e) => setDeactivateReason(e.target.value)}
                >
                  <option value=''>Select a reason</option>
                  <option value='break'>Taking a break</option>
                  <option value='privacy'>Privacy concerns</option>
                  <option value='experience'>Poor user experience</option>
                  <option value='time'>
                    Spending too much time on social media
                  </option>
                  <option value='other'>Other</option>
                </select>
              </div>
              <div className={styles.form_group}>
                <label className={styles.checkbox_container}>
                  <input
                    type='checkbox'
                    checked={agreeToDeactivate}
                    onChange={(e) => setAgreeToDeactivate(e.target.checked)}
                  />
                  <span className={styles.checkbox_label}>
                    I understand that my account will be deactivated until I log
                    in again
                  </span>
                </label>
              </div>
              <button
                type='submit'
                className={styles.deactivate_button}
                disabled={isDeactivating}
              >
                {isDeactivating
                  ? 'Deactivating Account...'
                  : 'Deactivate Account'}
              </button>
            </form>
          </div>
        );
      case 'delete':
        return (
          <div className={styles.content_section}>
            <h2>Delete Account</h2>
            <div className={styles.warning_box}>
              <h3>Warning: This action cannot be undone</h3>
              <p>
                Deleting your account will permanently remove all your data,
                including:
              </p>
              <ul>
                <li>Your profile information</li>
                <li>All posts and comments</li>
                <li>Messages and conversations</li>
                <li>Community memberships</li>
              </ul>
              <p>
                If you'd prefer to take a break, consider temporarily
                deactivating your account instead.
              </p>
            </div>
            {error && <div className={styles.error_message}>{error}</div>}
            <form className={styles.delete_form} onSubmit={handleDeleteAccount}>
              <div className={styles.form_group}>
                <label htmlFor='password'>
                  Enter your password to confirm:
                </label>
                <input
                  type='password'
                  id='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className={styles.form_group}>
                <label htmlFor='reason'>
                  Please tell us why you're leaving:
                </label>
                <select
                  id='reason'
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                >
                  <option value=''>Select a reason</option>
                  <option value='privacy'>Privacy concerns</option>
                  <option value='experience'>Poor user experience</option>
                  <option value='alternative'>
                    Found an alternative platform
                  </option>
                  <option value='time'>
                    Spending too much time on social media
                  </option>
                  <option value='other'>Other</option>
                </select>
              </div>
              <div className={styles.form_group}>
                <label className={styles.checkbox_container}>
                  <input
                    type='checkbox'
                    checked={agreeToDelete}
                    onChange={(e) => setAgreeToDelete(e.target.checked)}
                  />
                  <span className={styles.checkbox_label}>
                    I understand this action is permanent and cannot be undone
                  </span>
                </label>
              </div>
              <button
                type='submit'
                className={styles.delete_button}
                disabled={isDeleting}
              >
                {isDeleting
                  ? 'Deleting Account...'
                  : 'Permanently Delete Account'}
              </button>
            </form>
          </div>
        );
      default:
        return <div>Select a section from the sidebar</div>;
    }
  };

  return (
    <div className={styles.settings_container}>
      <div className={styles.settings_sidebar}>
        <h2 className={styles.sidebar_title}>Settings</h2>
        <ul className={styles.sidebar_menu}>
          <li
            className={activeSection === 'about' ? styles.active : ''}
            onClick={() => handleSectionChange('about')}
          >
            <FaInfoCircle /> About
          </li>
          <li
            className={activeSection === 'terms' ? styles.active : ''}
            onClick={() => handleSectionChange('terms')}
          >
            <FaFileContract /> Terms of Service
          </li>
          <li
            className={activeSection === 'contact' ? styles.active : ''}
            onClick={() => handleSectionChange('contact')}
          >
            <FaEnvelope /> Contact Us
          </li>
          <li
            className={activeSection === 'help' ? styles.active : ''}
            onClick={() => handleSectionChange('help')}
          >
            <FaQuestionCircle /> Help & Support
          </li>
          <li
            className={activeSection === 'server' ? styles.active : ''}
            onClick={() => handleSectionChange('server')}
          >
            <FaServer /> Server Health
          </li>
          <li
            className={activeSection === 'deactivate' ? styles.active : ''}
            onClick={() => handleSectionChange('deactivate')}
          >
            <FaPauseCircle /> Deactivate Account
          </li>
          <li
            className={activeSection === 'delete' ? styles.active : ''}
            onClick={() => handleSectionChange('delete')}
          >
            <FaTrash /> Delete Account
          </li>
        </ul>
      </div>
      <div className={styles.settings_content}>
        <div className={`${styles.content_panel} ${styles.slide_in}`}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;