import { useMemo, memo } from 'react';
import PropTypes from 'prop-types';
import { aboutApp } from '../constants/about';
import styles from '../styles/about.module.css';

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

const About = () => {
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

export default memo(About);
