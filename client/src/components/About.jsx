import React from 'react';
import { Link } from 'react-router-dom';
import aboutData from '../assets/about.json';
import styles from '../styles/about.module.css';

const formatContent = (content) => {
  return (
    <p>
      {content.split('*').map((part, index) =>
        index % 2 === 1 ? (
          <span className='bold-text' key={index}>
            {part}
          </span>
        ) : (
          part
        )
      )}
    </p>
  );
};

const About = () => {
  const token = localStorage.getItem('token');

  return (
    <div className={styles.about_container}>
      {!token && (
        <div className={styles.login_link}>
          <Link to='/login'>Login to get started</Link>
        </div>
      )}
      <div className={styles.h1_container}>
        <h1 className={styles.about_title}>About Us</h1>
      </div>
      {aboutData.aboutApp.map((section) => (
        <div key={section.id} className={styles.about_section}>
          <h2 className={styles.about_title}>{section.title}</h2>
          <div className={styles.about_content}>
            {formatContent(section.content)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default About;