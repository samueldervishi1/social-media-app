import React from 'react';
import styles from '../styles/not-found.module.css';
import L404 from '../assets/hanging_404.gif';

const NotFound = () => {
  return (
    <div id='container' className={styles.container}>
      <img
        src={L404}
        alt='404 Error'
        className={styles.gif}
      />
      <p className={styles.message}>
        Oops! The page you're looking for doesn't exist.
      </p>
      <a href='/' className={styles.homeButton}>
        Go to Homepage
      </a>
    </div>
  );
};

export default NotFound;