import React, { useEffect, useState } from "react";
import termsData from "../assets/terms.json";
import styles from "../styles/terms.module.css";

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
    <div className={styles.terms_container}>
      <div className={styles.h1_container}>
        <h1 style={{ color: "black" }}>Terms of Service</h1>
      </div>
      {terms.map((term) => (
        <div key={term.id} className={styles.term_section}>
          <h2 className={styles.term_title}>{term.title}</h2>
          <div className={styles.term_content}>
            {formatContent(term.content)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TermsAndServices;