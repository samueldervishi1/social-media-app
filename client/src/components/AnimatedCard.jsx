import styles from '../styles/animatedCard.module.css';

const AnimatedCard = () => {
  return (
    <div className={styles.card_container}>
      <div className={styles.wave_background}>
        <div className={styles.particles}></div>
      </div>

      <div className={styles.content}>
        <div className={styles.glow_effect}></div>
        <div className={styles.card_badge}>NEW</div>
        <h2>Experience Our Latest AI Model</h2>
        <p className={styles.subtitle}>
          Discover the power of Chattr Ultra - Smarter conversations await
        </p>

        <div className={styles.buttons_wrapper}>
          <a href='/chat' className={styles.main_button_link}>
            <button className={styles.glowing_button}>Explore Now</button>
          </a>

          <a href='/settings?section=models' className={styles.secondary_link}>
            <span className={styles.learn_more}>View Model Updates</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default AnimatedCard;
