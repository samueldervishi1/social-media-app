import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import customLoadingGif from '../assets/377.gif';
import styles from '../styles/login.module.css';

import { useAuth } from '../auth/AuthContext';
import { isUserDeactivated } from '../auth/authUtils';
const API_URL = import.meta.env.VITE_API_URL;

const LoginScript = () => {
  const [formState, setFormState] = useState({
    error: null,
    loading: false,
    showPassword: false,
    username: '',
    password: '',
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (formState.loading) return;

      setFormState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const requestBody = {
          details: {
            'credential-type': {
              $: 'client_credentials',
              '@list-agency-name': 'Chattr',
            },
          },
          parts: {
            specification: {
              'characteristics-value': [
                {
                  '@characteristic-name': 'username',
                  value: {
                    $: formState.username,
                  },
                },
                {
                  '@characteristic-name': 'password',
                  value: {
                    $: formState.password,
                  },
                },
              ],
            },
          },
        };

        const response = await fetch(`${API_URL}auth/login`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          let errorMessage = 'Invalid credentials. Please try again.';
          try {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const errorResponse = await response.json();
              errorMessage = errorResponse.message || errorMessage;
            } else {
              const text = await response.text();
              console.warn('Non-JSON error response:', text);
            }
          } catch (parseError) {
            console.warn('Error parsing response:', parseError);
          }

          setFormState((prev) => ({
            ...prev,
            error: errorMessage,
            loading: false,
          }));
          return;
        }

        console.log('Login successful - checking account status');

        await new Promise((resolve) => setTimeout(resolve, 400));

        const deactivated = await isUserDeactivated(formState.username);

        if (deactivated) {
          console.log('Account is deactivated, redirecting...');
          navigate('/account-deactivated');
        } else {
          login();
          console.log('Account is active, navigating to home');
          navigate('/home');
        }
      } catch (error) {
        console.error('Error during login:', error);

        const isNetworkError =
          error.message === 'Failed to fetch' ||
          error.message.includes('NetworkError');
        const generalErrorMessage = isNetworkError
          ? 'Unable to connect to the server. Please check your internet connection or try again later.'
          : error.message || 'Something went wrong. Please try again.';

        setFormState((prev) => ({
          ...prev,
          error: generalErrorMessage,
          loading: false,
        }));
      } finally {
        setFormState((prev) => ({ ...prev, loading: false }));
      }
    },
    [formState.loading, formState.username, formState.password, login, navigate]
  );

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      showPassword: !prev.showPassword,
    }));
  }, []);

  useEffect(() => {
    document.body.classList.add('login_page');
    return () => document.body.classList.remove('login_page');
  }, []);

  const buttonStyle = {
    background: '#3498db',
    color: 'white',
    padding: '12px',
    margin: '8px 0',
    border: 'none',
    borderRadius: '4px',
    cursor: formState.loading ? 'not-allowed' : 'pointer',
    width: '100%',
    opacity: formState.loading ? '0.7' : '1',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '16px',
    fontWeight: '500',
  };

  return (
    <div className={styles.auth_container}>
      <div className={styles.auth_card}>
        <div className={styles.auth_left}>
          <div className={styles.logo}>𝓒𝓱𝓪𝓽𝓽𝓻</div>
          <div className={styles.back_link}></div>
          <div className={styles.hero_content}>
            <h2>Where true voices connect.</h2>
            <div className={styles.dots}>
              <span></span>
              <span></span>
              <span className={styles.active}></span>
            </div>
          </div>
        </div>

        <div className={styles.auth_right}>
          <div className={styles.auth_form}>
            <h1>Log in to your account</h1>
            <p className={styles.login_link}>
              Don't have an account? <Link to='/register'>Sign up</Link>
            </p>

            <form onSubmit={handleSubmit}>
              {formState.error && (
                <p className={styles.error_message}>{formState.error}</p>
              )}

              <div className={styles.form_group}>
                <input
                  type='text'
                  placeholder='Username'
                  name='username'
                  value={formState.username}
                  onChange={handleInputChange}
                  required
                  className={styles.form_input}
                />
              </div>

              <div className={styles.form_group}>
                <input
                  type={formState.showPassword ? 'text' : 'password'}
                  placeholder='Enter your password'
                  name='password'
                  value={formState.password}
                  onChange={handleInputChange}
                  required
                  className={styles.form_input}
                />
                <span
                  className={styles.password_toggle_icon}
                  onClick={togglePasswordVisibility}
                >
                  {formState.showPassword ? (
                    <svg
                      width='20'
                      height='20'
                      viewBox='0 0 24 24'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M12 9C11.2044 9 10.4413 9.31607 9.87868 9.87868C9.31607 10.4413 9 11.2044 9 12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.7956 15 13.5587 14.6839 14.1213 14.1213C14.6839 13.5587 15 12.7956 15 12C15 11.2044 14.6839 10.4413 14.1213 9.87868C13.5587 9.31607 12.7956 9 12 9ZM12 17C10.6739 17 9.40215 16.4732 8.46447 15.5355C7.52678 14.5979 7 13.3261 7 12C7 10.6739 7.52678 9.40215 8.46447 8.46447C9.40215 7.52678 10.6739 7 12 7C13.3261 7 14.5979 7.52678 15.5355 8.46447C16.4732 9.40215 17 10.6739 17 12C17 13.3261 16.4732 14.5979 15.5355 15.5355C14.5979 16.4732 13.3261 17 12 17ZM12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5Z'
                        fill='#777'
                      />
                    </svg>
                  ) : (
                    <svg
                      width='20'
                      height='20'
                      viewBox='0 0 24 24'
                      fill='none'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path
                        d='M12 9C11.2044 9 10.4413 9.31607 9.87868 9.87868C9.31607 10.4413 9 11.2044 9 12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.7956 15 13.5587 14.6839 14.1213 14.1213C14.6839 13.5587 15 12.7956 15 12C15 11.2044 14.6839 10.4413 14.1213 9.87868C13.5587 9.31607 12.7956 9 12 9ZM12 17C10.6739 17 9.40215 16.4732 8.46447 15.5355C7.52678 14.5979 7 13.3261 7 12C7 10.6739 7.52678 9.40215 8.46447 8.46447C9.40215 7.52678 10.6739 7 12 7C13.3261 7 14.5979 7.52678 15.5355 8.46447C16.4732 9.40215 17 10.6739 17 12C17 13.3261 16.4732 14.5979 15.5355 15.5355C14.5979 16.4732 13.3261 17 12 17ZM1 12C2.73 7.61 7 4.5 12 4.5C17 4.5 21.27 7.61 23 12C21.27 16.39 17 19.5 12 19.5C7 19.5 2.73 16.39 1 12ZM12.5 12C12.5 11.8674 12.4473 11.7402 12.3536 11.6464C12.2598 11.5527 12.1326 11.5 12 11.5C11.8674 11.5 11.7402 11.5527 11.6464 11.6464C11.5527 11.7402 11.5 11.8674 11.5 12C11.5 12.1326 11.5527 12.2598 11.6464 12.3536C11.7402 12.4473 11.8674 12.5 12 12.5C12.1326 12.5 12.2598 12.4473 12.3536 12.3536C12.4473 12.2598 12.5 12.1326 12.5 12Z'
                        fill='#777'
                      />
                      <path
                        d='M2 4L22 20'
                        stroke='#777'
                        strokeWidth='2'
                        strokeLinecap='round'
                      />
                    </svg>
                  )}
                </span>
              </div>

              <button
                style={buttonStyle}
                type='submit'
                disabled={formState.loading}
              >
                {formState.loading ? (
                  <img
                    src={customLoadingGif}
                    alt='Loading...'
                    style={{ width: '20px', height: '20px' }}
                  />
                ) : (
                  'Log in'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScript;
