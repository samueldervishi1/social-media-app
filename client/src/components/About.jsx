import React, { useEffect, useState } from "react";
import aboutData from "../assets/about.json";
import styles from "../styles/about.module.css";

const About = () => {
  const [about, setAbout] = useState([]);

  useEffect(() => {
    setAbout(aboutData.aboutApp);
  }, []);

  const formatContent = (content) => {
    const parts = content.split("*").map((part, index) =>
      index % 2 === 1 ? (
        <span className="bold-text" key={index}>
          {part}
        </span>
      ) : (
        part
      )
    );
    return <p>{parts}</p>;
  };

  return (
    <div className={styles.about_container}>
      <div className={styles.h1_container}>
        <h1 style={{ color: "black" }}>About Us</h1>
      </div>
      {about.map((section) => (
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