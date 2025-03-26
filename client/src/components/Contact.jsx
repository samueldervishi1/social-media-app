import React from 'react';
import { FaInstagram } from 'react-icons/fa';
import styles from '../styles/contact.module.css';
import { Link } from 'react-router-dom';

const token = localStorage.getItem('token');

const Contact = () => {
  return (
    <div className={styles.contact_container}>
      {!token && (
        <div className={styles.login_link}>
          <Link to='/login'>Login to get started</Link>
        </div>
      )}
      <div className={styles.h1_container}>
        <h1>Contact Us</h1>
      </div>

      <div className={styles.contact_info}>
        <p style={{ color: '#1da1f2' }}>
          You can contact us via the following platforms:
        </p>

        <div className={styles.social_icons}>
          <a
            href='https://www.instagram.com/samueldervishi_'
            target='_blank'
            rel='noopener noreferrer'
          >
            <FaInstagram className={styles.social_icon} />
          </a>
        </div>

        <div className={styles.email}>
          <p style={{ color: '#1da1f2' }}>
            Email us at:{' '}
            <a href='mailto:support@chyra.com'>support@chyra.com</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;