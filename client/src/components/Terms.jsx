import React, { useMemo } from 'react';
import { termsAndServices } from '../constants/terms';
import styles from '../styles/terms.module.css';

/**
 * Formats the content string by making text between asterisks (*) bold.
 * Example: "This is *important* text." → "This is <span>important</span> text."
 *
 * @param {string} content - The content string to format
 * @returns {JSX.Element[]} - Array of JSX elements
 */
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

/**
 * Renders a single section of the Terms and Services content.
 *
 * @param {Object} term - The term object
 * @param {string|number} term.id - Unique ID of the term
 * @param {string} term.title - Title of the term section
 * @param {string} term.content - Content of the term section
 * @returns {JSX.Element}
 */
const TermSection = ({ id, title, content }) => (
  <section key={id} className={styles.term_section}>
    <h2 className={styles.term_title}>{title}</h2>
    <div className={styles.term_content}>
      <p>{formatContent(content)}</p>
    </div>
  </section>
);

/**
 * TermsAndServices Component
 * Displays a list of terms and services with styled sections.
 *
 * @returns {JSX.Element}
 */
const TermsAndServices = () => {
  // Memoize the sections to avoid recomputing on each render
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