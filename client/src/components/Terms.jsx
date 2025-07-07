import React, { useMemo } from 'react';
import { termsAndServices } from '../constants/terms';
import styles from '../styles/terms.module.css';

const formatContent = (content) =>
  content.split('*').map((part, index) =>
    index % 2 === 1 ? (
      <span key={index} className={styles.bold_text}>
        {part}
      </span>
    ) : (
      part
    )
  );

const TermSection = ({ id, title, content }) => (
  <section key={id} className={styles.term_section}>
    <h2 className={styles.term_title}>{title}</h2>
    <div className={styles.term_content}>
      <p>{formatContent(content)}</p>
    </div>
  </section>
);

const TermsAndServices = () => {
  const renderedSections = useMemo(
    () =>
      termsAndServices.map((term) => <TermSection key={term.id} {...term} />),
    []
  );

  return (
    <main className={styles.terms_container}>
      <header className={styles.h1_container}>
        <h1>Terms of Service</h1>
      </header>

      <article className={styles.terms_card}>
        <div className={styles.terms_sections}>{renderedSections}</div>
      </article>
    </main>
  );
};

export default TermsAndServices;
