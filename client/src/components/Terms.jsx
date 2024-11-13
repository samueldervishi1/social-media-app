import React, { useEffect, useState } from "react";
import termsData from "../assets/terms.json";
import "../styles/terms.css";

const TermsAndServices = () => {
  const [terms, setTerms] = useState([]);

  useEffect(() => {
    setTerms(termsData.termsAndServices);
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
    <div className="terms-container">
      <div className="h1-container">
        <h1 style={{ color: "black" }}>Terms of Service</h1>
      </div>
      {terms.map((term) => (
        <div key={term.id} className="term-section">
          <h2 className="term-title">{term.title}</h2>
          <div className="term-content">{formatContent(term.content)}</div>
        </div>
      ))}
    </div>
  );
};

export default TermsAndServices;
