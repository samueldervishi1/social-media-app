import React from 'react';
import {
  FaInstagram,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
} from 'react-icons/fa';
import styles from '../styles/contact.module.css';

const Contact = () => {
  return (
    <div className={styles.contact_container}>
      <div className={styles.h1_container}>
        <h1>Contact Us</h1>
      </div>

      <div className={styles.contact_card}>
        <h2>We're here to help</h2>

        <div className={styles.contact_methods_container}>
          <div className={styles.contact_method}>
            <FaEnvelope className={styles.method_icon} />
            <h3>Email</h3>
            <a href='mailto:support@chattr.com'>support@chattr.com</a>
          </div>

          <div className={styles.contact_method}>
            <FaPhone className={styles.method_icon} />
            <h3>Phone</h3>
            <p>(123) 456-7890</p>
          </div>

          <div className={styles.contact_method}>
            <FaMapMarkerAlt className={styles.method_icon} />
            <h3>Location</h3>
            <p>123 Chat Street, Digital City</p>
          </div>
        </div>

        <div className={styles.social_section}>
          <h3>Connect with us</h3>
          <div className={styles.social_icons}>
            <a
              href='https://www.instagram.com/samueldervishi_'
              target='_blank'
              rel='noopener noreferrer'
              className={styles.social_link}
            >
              <FaInstagram className={styles.social_icon} />
              <span>Instagram</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;