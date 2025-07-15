import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import customLoadingGif from '../assets/377.gif';
import styles from '../styles/register.module.css';

const API_URL = import.meta.env.VITE_API_URL;

const Register = () => {
  const [formState, setFormState] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    error: null,
    loading: false,
    showPassword: false,
  });

  const [errorMessages, setErrorMessages] = useState({
    email: '',
    username: '',
    password: '',
  });

  const navigate = useNavigate();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrorMessages((prev) => ({
      ...prev,
      [name]: '',
    }));
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      showPassword: !prev.showPassword,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (formState.loading) return;

      setFormState((prev) => ({ ...prev, loading: true, error: null }));
      setErrorMessages({ email: '', username: '', password: '' });

      const dynamicQueries = [
        {
          username: formState.username,
          operator: 'A=1 | A=2 | A=3',
        },
        {
          email: formState.email,
          operator: 'A=1 | A=2 | A=3',
        },
        {
          fullname: formState.fullName,
          operator: 'A=1 | A=2 | A=3',
        },
        {
          password: formState.password,
          operator: 'A=1 | A=2 | A=3',
        },
      ];

      const fullRequestBody = {
        queries: [
          ...dynamicQueries,
          { query: '$.channelId=onboard-ux', operator: null },
          { query: 'A=1 | A=2 | A=3', operator: 'AND' },
          { query: '$.category=qr', operator: null },
        ],
        queryOptions: {
          fields: '',
          filter: '',
          pagination: {
            count: 10,
            limit: 0,
          },
          sorting: '',
        },
      };

      try {
        const response = await axios.post(
          `${API_URL}auth/register`,
          fullRequestBody,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.status === 200) {
          setSnackbarMessage('User registered successfully!');
          setSnackbarOpen(true);
          setTimeout(() => navigate('/login'), 2000);
        } else {
          console.log('Unexpected response status:', response);
        }
      } catch (error) {
        console.error('Error registering user:', error);

        if (error.response && error.response.data) {
          const { message } = error.response.data;

          if (message?.toLowerCase().includes('email')) {
            setErrorMessages((prev) => ({
              ...prev,
              email: message,
            }));
          } else if (message?.toLowerCase().includes('username')) {
            setErrorMessages((prev) => ({
              ...prev,
              username: message,
            }));
          } else if (message?.toLowerCase().includes('password')) {
            setErrorMessages((prev) => ({
              ...prev,
              password: message,
            }));
          } else {
            if (!error.response || error.response.status >= 500 || !message) {
              setFormState((prev) => ({
                ...prev,
                error: 'An unexpected error occurred. Please try again later.',
              }));
            }
          }
        } else {
          setFormState((prev) => ({
            ...prev,
            error: 'An unexpected error occurred. Please try again later.',
          }));
        }
      } finally {
        setFormState((prev) => ({ ...prev, loading: false }));
      }
    },
    [
      formState.loading,
      formState.fullName,
      formState.email,
      formState.username,
      formState.password,
      navigate,
    ]
  );

  useEffect(() => {
    document.body.classList.add('register_page');
    return () => document.body.classList.remove('register_page');
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
            <h2>Join the conversation.</h2>
            <div className={styles.dots}>
              <span></span>
              <span className={styles.active}></span>
              <span></span>
            </div>
          </div>
        </div>

        <div className={styles.auth_right}>
          <div className={styles.auth_form}>
            <h1>Create your account</h1>
            <p className={styles.login_link}>
              Already have an account? <Link to='/login'>Sign in</Link>
            </p>

            <form onSubmit={handleSubmit}>
              {formState.error && (
                <p className={styles.error_message}>{formState.error}</p>
              )}

              <div className={styles.form_group}>
                <input
                  type='text'
                  placeholder='Full Name'
                  name='fullName'
                  value={formState.fullName}
                  onChange={handleInputChange}
                  required
                  className={styles.form_input}
                />
              </div>

              <div className={styles.form_group}>
                <input
                  type='email'
                  placeholder='Email'
                  name='email'
                  value={formState.email}
                  onChange={handleInputChange}
                  required
                  className={styles.form_input}
                />
                {errorMessages.email && (
                  <p className={styles.error_message}>{errorMessages.email}</p>
                )}
              </div>

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
                {errorMessages.username && (
                  <p className={styles.error_message}>
                    {errorMessages.username}
                  </p>
                )}
              </div>

              <div className={styles.form_group}>
                <input
                  type={formState.showPassword ? 'text' : 'password'}
                  placeholder='Password'
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
                {errorMessages.password && (
                  <p className={styles.error_message}>
                    {errorMessages.password}
                  </p>
                )}
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
                  'Create Account'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
