import React, {
  useState,
  lazy,
  Suspense,
  useCallback,
  useMemo,
  memo,
  useEffect,
} from 'react';
import axios from 'axios';
import {
  FaInfoCircle,
  FaFileContract,
  FaEnvelope,
  FaQuestionCircle,
  FaServer,
  FaTrash,
  FaPauseCircle,
  FaRobot,
} from 'react-icons/fa';
import styles from '../styles/settings.module.css';
import { useAuth } from '../auth/AuthContext';
import { getUserIdFromServer } from '../auth/authUtils';

const About = lazy(() => import('./About'));
const TermsAndServices = lazy(() => import('./Terms'));
const Contact = lazy(() => import('./Contact'));
const FAQ = lazy(() => import('./FAQ'));
const ServerHealthDashboard = lazy(() => import('./ServerHealthDashboard'));
const ModelUpdates = lazy(() => import('./ModelUpdates'));

const API_URL = import.meta.env.VITE_API_URL;

const LoadingFallback = memo(() => (
  <div className={styles.loading_fallback}>
    <p>Loading content...</p>
  </div>
));
LoadingFallback.displayName = 'LoadingFallback';

const ErrorMessage = memo(({ message }) =>
  message ? <div className={styles.error_message}>{message}</div> : null
);
ErrorMessage.displayName = 'ErrorMessage';

const Settings = () => {
  const [activeSection, setActiveSection] = useState('about');
  const [deleteAccountState, setDeleteAccountState] = useState({
    password: '',
    reason: '',
    agreeToDelete: false,
    isDeleting: false,
    error: '',
  });

  const [deactivateAccountState, setDeactivateAccountState] = useState({
    password: '',
    reason: '',
    agreeToDeactivate: false,
    isDeactivating: false,
    error: '',
  });

  const [userId, setUserId] = useState(null);
  const { logout } = useAuth();

  React.useEffect(() => {
    let isMounted = true;

    const fetchUserId = async () => {
      try {
        const result = await getUserIdFromServer();
        if (isMounted) {
          setUserId(result);
        }
      } catch (error) {
        console.error('Failed to fetch user ID:', error);
      }
    };

    fetchUserId();
    return () => {
      isMounted = false;
    };
  }, []);

  // Read section from URL on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const section = params.get('section');
    if (section) {
      setActiveSection(section);
    }
  }, []);

  // Update URL when section changes
  const handleSectionChange = useCallback((section) => {
    setActiveSection(section);
    // Update URL without full page reload
    const url = new URL(window.location);
    url.searchParams.set('section', section);
    window.history.pushState({}, '', url);
  }, []);

  const clearCookies = useCallback(() => {
    document.cookie.split(';').forEach((cookie) => {
      const [name] = cookie.trim().split('=');
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
  }, []);

  const handleDeleteAccount = useCallback(
    async (e) => {
      e.preventDefault();
      const { password, reason, agreeToDelete } = deleteAccountState;

      if (!password || !reason || !agreeToDelete) {
        setDeleteAccountState((prev) => ({
          ...prev,
          error: 'Please fill in all required fields and confirm deletion.',
        }));
        return;
      }

      setDeleteAccountState((prev) => ({
        ...prev,
        isDeleting: true,
        error: '',
      }));

      try {
        await axios.delete(`${API_URL}profiles/${userId}/delete`, {
          withCredentials: true,
        });

        clearCookies();
        await logout();
        window.location.href = '/login';
      } catch (error) {
        console.error('Error deleting account:', error);
        setDeleteAccountState((prev) => ({
          ...prev,
          error: 'Failed to delete account. Please try again later.',
          isDeleting: false,
        }));
      }
    },
    [userId, logout, deleteAccountState, clearCookies]
  );

  const handleDeactivateAccount = useCallback(
    async (e) => {
      e.preventDefault();
      const { password, reason, agreeToDeactivate } = deactivateAccountState;

      if (!password || !reason || !agreeToDeactivate) {
        setDeactivateAccountState((prev) => ({
          ...prev,
          error: 'Please fill in all required fields and confirm deactivation.',
        }));
        return;
      }

      setDeactivateAccountState((prev) => ({
        ...prev,
        isDeactivating: true,
        error: '',
      }));

      try {
        await axios.put(
          `${API_URL}profile/${userId}/deactivate`,
          { password, reason },
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        clearCookies();
        await logout();
        window.location.href = '/login';
      } catch (error) {
        console.error('Error deactivating account:', error);
        setDeactivateAccountState((prev) => ({
          ...prev,
          error:
            error.response?.data?.message ||
            'Failed to deactivate account. Please try again later.',
          isDeactivating: false,
        }));
      }
    },
    [userId, logout, deactivateAccountState, clearCookies]
  );

  const sidebarMenuItems = useMemo(
    () => [
      { id: 'about', icon: FaInfoCircle, label: 'About' },
      { id: 'terms', icon: FaFileContract, label: 'Terms of Service' },
      { id: 'contact', icon: FaEnvelope, label: 'Contact Us' },
      { id: 'help', icon: FaQuestionCircle, label: 'Help & Support' },
      { id: 'server', icon: FaServer, label: 'Server Health' },
      { id: 'models', icon: FaRobot, label: 'Model Updates' },
      { id: 'deactivate', icon: FaPauseCircle, label: 'Deactivate Account' },
      { id: 'delete', icon: FaTrash, label: 'Delete Account' },
    ],
    []
  );

  const renderContent = useCallback(() => {
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
      case 'models':
        return (
          <div className={styles.content_section}>
            <h2>AI Model Updates</h2>
            <Suspense fallback={<LoadingFallback />}>
              <ModelUpdates />
            </Suspense>
          </div>
        );
      case 'server':
        return (
          <div className={styles.content_section}>
            <div className={styles.section_header}>
              <h2>Server Health</h2>
              <button className={styles.subscribe_button}>
                Subscribe for Updates
              </button>
            </div>
            <Suspense fallback={<LoadingFallback />}>
              <ServerHealthDashboard />
            </Suspense>
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
            <ErrorMessage message={deactivateAccountState.error} />
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
                  value={deactivateAccountState.password}
                  onChange={(e) =>
                    setDeactivateAccountState((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                />
              </div>
              <div className={styles.form_group}>
                <label htmlFor='deactivateReason'>
                  Please tell us why you're deactivating:
                </label>
                <select
                  id='deactivateReason'
                  value={deactivateAccountState.reason}
                  onChange={(e) =>
                    setDeactivateAccountState((prev) => ({
                      ...prev,
                      reason: e.target.value,
                    }))
                  }
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
                    checked={deactivateAccountState.agreeToDeactivate}
                    onChange={(e) =>
                      setDeactivateAccountState((prev) => ({
                        ...prev,
                        agreeToDeactivate: e.target.checked,
                      }))
                    }
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
                disabled={deactivateAccountState.isDeactivating}
              >
                {deactivateAccountState.isDeactivating
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
            <ErrorMessage message={deleteAccountState.error} />
            <form className={styles.delete_form} onSubmit={handleDeleteAccount}>
              <div className={styles.form_group}>
                <label htmlFor='password'>
                  Enter your password to confirm:
                </label>
                <input
                  type='password'
                  id='password'
                  value={deleteAccountState.password}
                  onChange={(e) =>
                    setDeleteAccountState((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                />
              </div>
              <div className={styles.form_group}>
                <label htmlFor='reason'>
                  Please tell us why you're leaving:
                </label>
                <select
                  id='reason'
                  value={deleteAccountState.reason}
                  onChange={(e) =>
                    setDeleteAccountState((prev) => ({
                      ...prev,
                      reason: e.target.value,
                    }))
                  }
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
                    checked={deleteAccountState.agreeToDelete}
                    onChange={(e) =>
                      setDeleteAccountState((prev) => ({
                        ...prev,
                        agreeToDelete: e.target.checked,
                      }))
                    }
                  />
                  <span className={styles.checkbox_label}>
                    I understand this action is permanent and cannot be undone
                  </span>
                </label>
              </div>
              <button
                type='submit'
                className={styles.delete_button}
                disabled={deleteAccountState.isDeleting}
              >
                {deleteAccountState.isDeleting
                  ? 'Deleting Account...'
                  : 'Permanently Delete Account'}
              </button>
            </form>
          </div>
        );
      default:
        return <div>Select a section from the sidebar</div>;
    }
  }, [
    activeSection,
    handleDeleteAccount,
    handleDeactivateAccount,
    deleteAccountState,
    deactivateAccountState,
  ]);

  return (
    <div className={styles.settings_container}>
      <div className={styles.settings_sidebar}>
        <h2 className={styles.sidebar_title}>Settings</h2>
        <ul className={styles.sidebar_menu}>
          {sidebarMenuItems.map(({ id, icon: Icon, label }) => (
            <li
              key={id}
              className={activeSection === id ? styles.active : ''}
              onClick={() => handleSectionChange(id)}
            >
              <Icon /> {label}
            </li>
          ))}
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

export default memo(Settings);
