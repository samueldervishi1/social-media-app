/**
 * @fileoverview About component that displays information about the application
 * Renders formatted content sections with support for bold text using * markers
 */

import { useMemo, memo } from 'react';
import PropTypes from 'prop-types';
import { aboutApp } from '../constants/about';
import styles from '../styles/about.module.css';

/**
 * @typedef {Object} AboutSection
 * @property {string} id - Unique identifier for the section
 * @property {string} title - Title of the section
 * @property {string} content - Content of the section, can contain * for bold text
 */

/**
 * Formats content by converting *text* patterns to bold spans
 * @param {string} content - The content string containing * markers for bold text
 * @returns {JSX.Element} Formatted paragraph with bold text spans
 */
const formatContent = (content) => (
  <p>
    {content.split('*').map((part, index) =>
      index % 2 === 1 ? (
        <span className={styles.bold_text} key={`bold-${index}`}>
          {part}
        </span>
      ) : (
        part
      )
    )}
  </p>
);

formatContent.displayName = 'FormatContent';

/**
 * About section component that renders a single section
 * @param {Object} props - Component props
 * @param {AboutSection} props.section - Section data to render
 * @returns {JSX.Element} Rendered section
 */
const AboutSection = memo(({ section }) => (
  <div className={styles.about_section}>
    <h2 className={styles.about_title}>{section.title}</h2>
    <div className={styles.about_content}>{formatContent(section.content)}</div>
  </div>
));

AboutSection.displayName = 'AboutSection';
AboutSection.propTypes = {
  section: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
  }).isRequired,
};

/**
 * About component that displays information about the application
 * Renders multiple sections with formatted content
 * @returns {JSX.Element} The About page component
 */
const About = () => {
  // Memoize the formatted sections to prevent unnecessary re-renders
  const formattedSections = useMemo(
    () =>
      aboutApp.map((section) => (
        <AboutSection key={section.id} section={section} />
      )),
    []
  );

  return (
    <div className={styles.about_container}>
      <div className={styles.h1_container}>
        <h1>About Us</h1>
      </div>

      <div className={styles.about_card}>
        <div className={styles.about_sections}>{formattedSections}</div>
      </div>
    </div>
  );
};

About.propTypes = {
  aboutData: PropTypes.shape({
    aboutApp: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
      })
    ).isRequired,
  }),
};

About.displayName = 'About';

// Memoize the entire component to prevent unnecessary re-renders
export default memo(About);