import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import aboutData from '../assets/about.json';
import styles from '../styles/about.module.css';

const token = localStorage.getItem('token');
const About = () => {
  const { about_container, about_section, about_title, about_content, login_link, h1_container } = styles;

  const loginSection = useMemo(() => (
    !token && (
      <div className={login_link}>
        <Link to='/login'>Login to get started</Link>
      </div>
    )
  ), [token]);

  const formattedSections = useMemo(() => {
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

    return aboutData.aboutApp.map((section) => (
      <div key={section.id} className={about_section}>
        <h2 style={{color: 'white'}} className={about_title}>{section.title}</h2>
        <div className={about_content}>
          {formatContent(section.content)}
        </div>
      </div>
    ));
  }, []);

  return (
    <div className={about_container}>
      {loginSection}
      <div className={h1_container}>
        <h1 className={about_title}>About Us</h1>
      </div>
      {formattedSections}
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