import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';
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
    background: 'linear-gradient(to right, #0072ff, #00c6ff)',
    color: 'white',
    padding: '16px 20px',
    margin: '8px 0',
    border: 'none',
    cursor: formState.loading ? 'not-allowed' : 'pointer',
    width: '100%',
    opacity: formState.loading ? '0.7' : '0.9',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  return (
    <div className={styles.form_container}>
      <form onSubmit={handleSubmit} className={styles.login_form}>
        <div className={styles.container_login}>
          <p className={styles.fill}>Chattr</p>
          <hr />
          {formState.error && (
            <p className={styles.error_message_login}>{formState.error}</p>
          )}

          <input
            type='text'
            placeholder='Username'
            name='username'
            value={formState.username}
            onChange={handleInputChange}
            required
            className={styles.input}
          />

          <div className={styles.password_input_container}>
            <input
              type={formState.showPassword ? 'text' : 'password'}
              placeholder='Password'
              name='password'
              value={formState.password}
              onChange={handleInputChange}
              required
              className={styles.input}
            />
            <span
              className={styles.password_toggle_icon}
              onClick={togglePasswordVisibility}
            >
              {formState.showPassword ? <VisibilityOff /> : <Visibility />}
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
              'Login'
            )}
          </button>

          <p className={styles.signup}>
            Don&apos;t have an account? <Link to='/register'>Sign up</Link>.
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginScript;