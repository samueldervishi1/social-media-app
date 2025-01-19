import React from 'react';
import styles from '../styles/premium.module.css';

const PremiumPage = () => {
  return (
    <div className={styles.premium_page}>
      <div className={styles.background}>
        <h1 className={styles.plan_title}>Choose the best plan for you</h1>
        <div className={styles.container_p}>
          <div className={styles.panel}>
            <div className={styles.pricing_plan}>
              <h2 className={styles.pricing_header}>Premium</h2>
              <ul className={styles.pricing_features}>
                <li className={styles.pricing_features_item}>
                  <span className={styles.tick}>✔</span> Half Ads in For You and
                  Following
                </li>
                <li className={styles.pricing_features_item}>
                  <span className={styles.tick}>✔</span> Larger reply boost
                </li>
                <li className={styles.pricing_features_item}>
                  <span className={styles.tick}>✔</span> Get paid to post
                </li>
                <li className={styles.pricing_features_item}>
                  <span className={styles.tick}>✔</span> Checkmark
                </li>
                <li className={styles.pricing_features_item}>
                  <span className={styles.tick}>✔</span> Creator Subscription
                </li>
              </ul>
              <div className={styles.pricing_price_container}>
                <span className={styles.new_price}>$15</span>
              </div>
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
                  <span className={styles.tick}>✔</span> Everything in Premium,
                  and
                </li>
                <li className={styles.pricing_features_item}>
                  <span className={styles.tick}>✔</span> No Ads in For You and
                  Following
                </li>
                <li className={styles.pricing_features_item}>
                  <span className={styles.tick}>✔</span> Largest reply boost
                </li>
                <li className={styles.pricing_features_item}>
                  <span className={styles.tick}>✔</span> AЯYHƆ's Pro, Analytics,
                  Media Studio
                </li>
                <li className={styles.pricing_features_item}>
                  <span className={styles.tick}>✔</span> Write articles
                </li>
              </ul>
              <div className={styles.pricing_price_container}>
                <span className={styles.old_price}>$25</span>
                <span className={styles.new_price}>$10</span>
              </div>
              <button
                className={`${styles.pricing_button} ${styles.is_featured}`}
              >
                Select & Pay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumPage;