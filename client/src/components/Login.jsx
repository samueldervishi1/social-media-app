import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import customLoadingGif from '../assets/ZKZg.gif';
import styles from '../styles/login.module.css';
import { useAuth } from '../auth/AuthContext';

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
        const response = await fetch(`${API_URL}/api/v2/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: formState.username,
            password: formState.password,
          }),
        });

        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error('You are offline. Please try again later.');
        }

        const token = await response.text();

        if (!token?.startsWith('eyJhbGciOi')) {
          throw new Error('Unexpected response from the server.');
        }

        login(token);
        const decodedToken = JSON.parse(atob(token.split('.')[1]));

        if (decodedToken.twoFa === undefined) {
          console.log('twoFa field is not present in the token.');
        }

        navigate('/home');
      } catch (error) {
        console.error('Error during login:', error.message);
        setFormState((prev) => ({
          ...prev,
          error:
            error.message ||
            'Something went wrong, please check your internet connection or try again later.',
          loading: false,
        }));
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
          <p className={styles.fill}>AЯYHƆ</p>
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