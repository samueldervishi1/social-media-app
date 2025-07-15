import React, { useState, lazy, Suspense } from 'react';
import styles from '../styles/healthcheck.module.css';

const HealthCheck = lazy(() => import('./HealthCheck'));

const ServerHealthDashboard = () => {
  const [viewMode, setViewMode] = useState('component');

  return (
    <div className={styles.container}>
      <Suspense
        fallback={
          <div className={styles.loader}>
            <div className={styles.spinner}></div>
            <p>Loading health dashboard...</p>
          </div>
        }
      >
        {viewMode === 'component' && <HealthCheck />}
      </Suspense>
    </div>
  );
};

export default ServerHealthDashboard;
