import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import customLoadingGif from '../assets/ZKZg.gif';
import styles from '../styles/login.module.css';

import { useAuth } from '../auth/AuthContext';

const LoginScript = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setLoading(true);

    const username = event.target.username.value;
    const password = event.target.password.value;

    try {
      const response = await fetch(`http://localhost:8080/api/v2/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const token = await response.text();

        if (token && token.startsWith('eyJhbGciOi')) {
          login(token);

          const decodedToken = JSON.parse(atob(token.split('.')[1]));

          if (decodedToken.twoFa !== undefined) {
            if (decodedToken.twoFa === true) {
              // navigate("/security/2fa/verify");
              navigate('/home');
            } else {
              navigate('/home');
            }
          } else {
            console.log('twoFa field is not present in the token.');
          }
        } else {
          setError('Unexpected response from the server.');
          setLoading(false);
        }
      } else {
        const errorMessage = await response.text();
        setError(errorMessage || 'Login failed. Please try again.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error during login:', error.message);
      setError(
        'An unexpected error occurred. Please check your internet connection or try again later.'
      );
      setLoading(false);
    }
  };
  useEffect(() => {
    document.body.classList.add('login_page');
    return () => {
      document.body.classList.remove('login_page');
    };
  }, []);

  return (
    <div className={styles.form_container}>
      <form
        id='loginForm'
        onSubmit={handleSubmit}
        className={styles.login_form}
      >
        <div className={styles.container_login}>
          <p className={styles.fill}>AЯYHƆ</p>
          <hr />
          {error && <p className={styles.error_message_login}>{error}</p>}

          <label htmlFor='username'></label>
          <input
            type='text'
            placeholder='Username'
            name='username'
            id='username'
            required
            className={styles.input}
          />

          <label htmlFor='password'></label>
          <div className={styles.password_input_container}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder='Password'
              name='password'
              id='password'
              required
              className={styles.input}
            />
            <span
              className={styles.password_toggle_icon}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </span>
          </div>

          <button
            style={{
              background: 'linear-gradient(to right, #0072ff, #00c6ff)',
              color: 'white',
              padding: '16px 20px',
              margin: '8px 0',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              width: '100%',
              opacity: loading ? '0.7' : '0.9',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            type='submit'
            disabled={loading}
          >
            {loading ? (
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