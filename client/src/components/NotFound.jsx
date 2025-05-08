import React from 'react';
import styles from '../styles/not-found.module.css';
import L404 from '../assets/hanging_404.gif';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.content_wrapper}>
        <h1 className={styles.title}>404</h1>
        <img src={L404} alt='404 Error' className={styles.gif} />
        <p className={styles.message}>
          Oops! The page you're looking for doesn't exist.
        </p>
        <p className={styles.submessage}>
          It might have been moved or deleted, or perhaps you mistyped the URL.
        </p>
        <div className={styles.buttons_container}>
          <button
            onClick={() => navigate(-1)}
            className={`${styles.actionButton} ${styles.backButton}`}
          >
            Go Back
          </button>
          <a href='/' className={`${styles.actionButton} ${styles.homeButton}`}>
            Go to Homepage
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;