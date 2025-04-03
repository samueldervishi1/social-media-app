import React from 'react';
import { termsAndServices } from '../constants/terms';
import styles from '../styles/terms.module.css';

const TermsAndServices = () => {
  const formatContent = (content) => (
    <p>
      {content.split('*').map((part, index) =>
        index % 2 === 1 ? (
          <span className={styles.bold_text} key={index}>
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
      <div className={styles.h1_container}>
        <h1>Terms of Service</h1>
      </div>

      <div className={styles.terms_card}>
        <div className={styles.terms_sections}>
          {termsAndServices.map((term) => (
            <div key={term.id} className={styles.term_section}>
              <h2 className={styles.term_title}>{term.title}</h2>
              <div className={styles.term_content}>
                {formatContent(term.content)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TermsAndServices;