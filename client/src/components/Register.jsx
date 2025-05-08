import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Snackbar, Alert } from '@mui/material';
import { CiCircleInfo } from 'react-icons/ci';
import styles from '../styles/register.module.css';

const API_URL = import.meta.env.VITE_API_URL;

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
  });

  const [errorMessages, setErrorMessages] = useState({
    email: '',
    username: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    setErrorMessages((prev) => ({
      ...prev,
      [name]: '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dynamicQueries = [
      {
        username: formData.username,
        operator: 'A=1 | A=2 | A=3',
      },
      {
        email: formData.email,
        operator: 'A=1 | A=2 | A=3',
      },
      {
        fullname: formData.fullName,
        operator: 'A=1 | A=2 | A=3',
      },
      {
        password: formData.password,
        operator: 'A=1 | A=2 | A=3',
      },
    ];

    const fullRequestBody = {
      queries: [
        ...dynamicQueries,
        { query: '$.channelId=selfcare', operator: null },
        { query: 'A=1 | A=2 | A=3', operator: 'AND' },
        { query: '$.category=qr', operator: null },
        { query: 'A=1 | A=2 | A=3', operator: 'AND' },
        { query: '$.id=2DE002B9A6154288E0634E5C12C67F0B', operator: null },
        { query: 'A=1 | A=2 | A=3', operator: 'AND' },
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
      const response = await axios.post(`${API_URL}register`, fullRequestBody, {
        headers: {
          'Content-Type': 'application/json',
          'X-App-Version': import.meta.env.VITE_APP_VERSION,
        },
      });

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
            setError('An unexpected error occurred. Please try again later.');
          }
        }
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    }
  };

  useEffect(() => {
    document.body.classList.add('register-page');
    return () => {
      document.body.classList.remove('register-page');
    };
  }, []);

  const healthLinkStyle = {
    position: 'fixed', // Changed from absolute to fixed
    top: '20px',
    right: '20px',
    color: '#0072ff',
    textDecoration: 'none',
    fontSize: '14px',
    zIndex: 1000, // Ensure it stays on top
  };

  return (
    <div id='main' style={{ minHeight: '100vh', paddingBottom: '40px' }}>
      <div className={styles.screen}>
        <Link to='http://localhost:9090/index.html' style={healthLinkStyle}>
          Server Health
        </Link>
        <form id='registrationForm' onSubmit={handleSubmit}>
          <div className={styles.container_sign}>
            <p className={styles.fill}>Chattr</p>
            <hr />
            {error && <p className={styles.error_message_register}>{error}</p>}

            <label htmlFor='fullName'>
              <b className={styles.name_register}>Full Name</b>
            </label>
            <input
              type='text'
              placeholder='Enter Full Name'
              name='fullName'
              id='fullName'
              value={formData.fullName}
              onChange={handleChange}
              required
            />

            <label htmlFor='email'>
              <b className={styles.name_register}>Email</b>
            </label>
            <input
              type='text'
              placeholder='Enter Email'
              name='email'
              id='email'
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errorMessages.email && (
              <p className={errorMessages.email ? styles.input_error : ''}>
                {errorMessages.email}
              </p>
            )}

            <label htmlFor='username'>
              <b className={styles.name_register}>Username</b>
            </label>
            <input
              type='text'
              placeholder='Enter Username'
              name='username'
              id='username'
              value={formData.username}
              onChange={handleChange}
              required
            />
            {errorMessages.username && (
              <p className={errorMessages.username ? styles.input_error : ''}>
                {errorMessages.username}
              </p>
            )}

            <label htmlFor='password'>
              <b className={styles.name_register}>Password</b>
            </label>
            <div className={styles.password_input_container}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder='Enter Password'
                name='password'
                id='password'
                value={formData.password}
                onChange={handleChange}
                required
              />
              <span
                className={styles.password_toggle_icon}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </span>
            </div>
            {errorMessages.password && (
              <p className={styles.error_message}>{errorMessages.password}</p>
            )}

            <button
              type='submit'
              style={{
                background: 'linear-gradient(to right, #0072ff, #00c6ff)',
                color: 'white',
                padding: '16px 20px',
                margin: '8px 0',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                opacity: '0.9',
              }}
            >
              Register
            </button>
            <p className={styles.signin}>
              Already have an account? <Link to='/login'>Sign in</Link>.
            </p>
          </div>
        </form>
      </div>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity='success' sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Register;