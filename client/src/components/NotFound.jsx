import { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/not-found.module.css';
import L404 from '../assets/hanging_404.gif';

const NavigationButton = memo(({ type, onClick, children }) => (
  <button
    onClick={onClick}
    className={`${styles.actionButton} ${
      type === 'back' ? styles.backButton : styles.homeButton
    }`}
    type='button'
    aria-label={`${children} button`}
  >
    {children}
  </button>
));

NavigationButton.displayName = 'NavigationButton';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleGoHome = useCallback(() => {
    navigate('/', { replace: true });
  }, [navigate]);

  return (
    <div className={styles.container} role='main'>
      <div className={styles.content_wrapper}>
        <h1 className={styles.title} aria-label='404 Error'>
          404
        </h1>
        <img
          src={L404}
          alt='404 Error Animation'
          className={styles.gif}
          width='200'
          height='200'
          loading='eager'
        />
        <p className={styles.message}>
          Oops! The page you're looking for doesn't exist.
        </p>
        <p className={styles.submessage}>
          It might have been moved or deleted, or perhaps you mistyped the URL.
        </p>
        <div
          className={styles.buttons_container}
          role='group'
          aria-label='Navigation options'
        >
          <NavigationButton type='back' onClick={handleGoBack}>
            Go Back
          </NavigationButton>
          <NavigationButton type='home' onClick={handleGoHome}>
            Go to Homepage
          </NavigationButton>
        </div>
      </div>
    </div>
  );
};

NotFound.displayName = 'NotFound';

export default memo(NotFound);
