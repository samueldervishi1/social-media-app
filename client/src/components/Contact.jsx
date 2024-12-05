import React from "react";
import { FaInstagram } from "react-icons/fa";
import styles from "../styles/contact.module.css";

const Contact = () => {
  return (
    <div className={styles.contact_container}>
      <div className={styles.h1_container}>
        <h1>Contact Us</h1>
      </div>

      <div className={styles.contact_info}>
        <p style={{ color: "black" }}>
          You can contact us via the following platforms:
        </p>

        <div className={styles.social_icons}>
          <a
            href="https://www.instagram.com/samueldervishi_"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram className={styles.social_icon} />
          </a>
        </div>

        <div className={styles.email}>
          <p style={{ color: "black" }}>
            Email us at: <a href="mailto:shefi1@proton.me">shefi1@proton.me</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;