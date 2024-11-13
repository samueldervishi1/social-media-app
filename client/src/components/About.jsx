import React, { useEffect, useState } from "react";
import aboutData from "../assets/about.json";
import "../styles/about.css";

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
    <div className="about-container">
      <div className="h1-container">
        <h1 style={{ color: "black" }}>About Us</h1>
      </div>
      {about.map((section) => (
        <div key={section.id} className="about-section">
          <h2 className="about-title">{section.title}</h2>
          <div className="about-content">{formatContent(section.content)}</div>
        </div>
      ))}
    </div>
  );
};

export default About;
