import React from "react";
import styles from "../styles/premium.module.css";

const PremiumPage = () => {
  return (
    <div className={styles.premium_page}>
      <div className={styles.background}>
        <h1
          className={styles.plan_title}
          style={{ top: 10, textAlign: "center" }}
        >
          Choose the best plan for you
        </h1>
        <div className={styles.container_p}>
          <div className={styles.panel}>
            <div className={styles.pricing_plan}>
              <h2 className={styles.pricing_header}>Premium</h2>
              <ul className={styles.pricing_features}>
                <li className={styles.pricing_features_item}>
                  Half Ads in For You and Following
                </li>
                <li className={styles.pricing_features_item}>
                  Larger reply boost
                </li>
                <li className={styles.pricing_features_item}>
                  Get paid to post
                </li>
                <li className={styles.pricing_features_item}>Checkmark</li>
                <li className={styles.pricing_features_item}>
                  Creator Subscription
                </li>
              </ul>
              <span className={styles.pricing_price}>$7</span>
              <button
                className={`${styles.pricing_button} ${styles.is_featured}`}
              >
                Select & Pay
              </button>
            </div>

            <div className={styles.pricing_plan}>
              <h2 className={styles.pricing_header}>Premium +</h2>
              <ul className={styles.pricing_features}>
                <li className={styles.pricing_features_item}>
                  Everything in Premium, and
                </li>
                <li className={styles.pricing_features_item}>
                  No Ads in For You and Following
                </li>
                <li className={styles.pricing_features_item}>
                  Largest reply boost
                </li>
                <li className={styles.pricing_features_item}>
                  Chirps Pro, Analytics, Media Studio
                </li>
                <li className={styles.pricing_features_item}>Write articles</li>
              </ul>
              <span className={styles.pricing_price}>$14</span>
              <button
                className={`${styles.pricing_button} ${styles.is_featured}`}
              >
                Select & Pay
              </button>
            </div>
          </div>
          <div className={styles.terms_check}>
            <a href="/terms">Check Terms & Services for more information.</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumPage;