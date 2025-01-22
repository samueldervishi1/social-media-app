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

    try {
      const response = await axios.post(
        `${API_URL}/api/v2/users/auth/register`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        setSnackbarMessage('User registered successfully!');
        setSnackbarOpen(true);

        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        console.log('Unexpected response status:', response);
      }
    } catch (error) {
      console.error('Error registering user:', error);

      if (error.response && error.response.data) {
        console.log('Backend Error Response:', error.response.data);

        const { message } = error.response.data;

        if (message === 'Email already exists') {
          setErrorMessages((prev) => ({
            ...prev,
            email: 'This email is already registered.',
          }));
        } else if (message === 'Username already exists') {
          setErrorMessages((prev) => ({
            ...prev,
            username: 'This username is already taken.',
          }));
        } else if (message === 'Invalid password format') {
          setErrorMessages((prev) => ({
            ...prev,
            password:
              'Password must be at least 8 characters long, including one letter, one symbol, and one number.',
          }));
        } else {
          setError('An unexpected error occurred. Please try again later.');
        }
      }
    }
  };

  useEffect(() => {
    document.body.classList.add('register-page');
    return () => {
      document.body.classList.remove('register-page');
    };
  }, []);

  return (
    <div id='main'>
      <div className={styles.screen}>
        <p className={styles.info_register}>
          <CiCircleInfo className={styles.info_register_info} />
          <span className={styles.info_text}>
            For your privacy, we recommend using a username that does not
            include your real name. This will help keep your identity secure
            while interacting with others.
          </span>
        </p>

        <form id='registrationForm' onSubmit={handleSubmit}>
          <div className={styles.container_sign}>
            <p className={styles.fill}>AЯYHƆ</p>
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
              <p className={styles.error_message}>{errorMessages.email}</p>
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
              <p className={styles.error_message}>{errorMessages.username}</p>
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