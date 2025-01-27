import React from 'react';
import termsData from '../assets/terms.json';
import styles from '../styles/terms.module.css';
import { Link } from 'react-router-dom';
const token = localStorage.getItem('token');

const TermsAndServices = () => {
  const formatContent = (content) => (
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

  return (
    <div className={styles.terms_container}>
      {!token && (
        <div className={styles.login_link}>
          <Link to='/login'>Login to get started</Link>
        </div>
      )}
      <div className={styles.h1_container}>
        <h1 style={{ color: 'black' }}>Terms of Service</h1>
      </div>
      {termsData.termsAndServices.map((term) => (
        <div key={term.id} className={styles.term_section}>
          <h2 style={{color: 'white'}} className={styles.term_title}>{term.title}</h2>
          <div className={styles.term_content}>
            {formatContent(term.content)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TermsAndServices;