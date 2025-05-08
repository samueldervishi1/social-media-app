import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { aboutApp } from '../constants/about';
import styles from '../styles/about.module.css';

const About = () => {
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

  const formattedSections = useMemo(() => {
    return aboutApp.map((section) => (
      <div key={section.id} className={styles.about_section}>
        <h2 className={styles.about_title}>{section.title}</h2>
        <div className={styles.about_content}>
          {formatContent(section.content)}
        </div>
      </div>
    ));
  }, []);

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

export default About;