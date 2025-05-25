import React from 'react';
import styles from '../styles/animatedCard.module.css';

const AnimatedCard = () => {
  return (
    <div className={styles.card_container}>
      <div className={styles.wave_background}></div>
      <div className={styles.content}>
        <h2>Try Our Latest Model: Eido</h2>
        <a href="/chat"><button className={styles.glowing_button}>Explore Now</button></a>
      </div>
    </div>
  );
};

export default AnimatedCard;