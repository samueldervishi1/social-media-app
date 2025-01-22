import React from 'react';
import styles from '../styles/not-found.module.css';

const NotFound = () => {
  return (
    <div id='container' className={styles.container}>
      <h1 className={styles.title}>404</h1>
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