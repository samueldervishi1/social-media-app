import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/modelUpdates.module.css';

const ModelUpdates = () => {
  const [modelUpdates, setModelUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchModelUpdates = async () => {
      try {
        // Use axios to fetch data with credentials
        const apiEndpoint = `${import.meta.env.VITE_API_URL}model-updates`;
        const response = await axios.get(apiEndpoint, {
          withCredentials: true,
        });

        setModelUpdates(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching model updates:', err);
        setError(err.message || 'Failed to fetch model updates');
        setLoading(false);
      }
    };

    fetchModelUpdates();
  }, []);

  // Format date to a more readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get status badge class based on status
  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'current':
        return styles.current;
      case 'deprecated':
        return styles.deprecated;
      case 'beta':
        return styles.beta;
      default:
        return '';
    }
  };

  // Sort model updates with current first, then beta, then deprecated
  const sortedModelUpdates = [...modelUpdates].sort((a, b) => {
    // Status priority: current (1) > beta (2) > deprecated (3) > others (4)
    const statusPriority = {
      current: 1,
      beta: 2,
      deprecated: 3,
    };

    const priorityA = statusPriority[a.status.toLowerCase()] || 4;
    const priorityB = statusPriority[b.status.toLowerCase()] || 4;

    // Sort by status priority first
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // If same status, sort by version (descending)
    return b.version.localeCompare(a.version, undefined, { numeric: true });
  });

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading model updates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error Loading Model Updates</h2>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className={styles.retryButton}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>AI Model Update History</h1>
      <p className={styles.subtitle}>
        Track the evolution of our AI models and their capabilities
      </p>

      <div className={styles.timeline}>
        {sortedModelUpdates.map((update) => (
          <div
            key={update.id}
            className={`${styles.card} ${update.status === 'current' ? styles.highlightedCard : ''}`}
          >
            <div className={styles.cardHeader}>
              <h2 className={styles.modelName}>{update.modelName}</h2>
              <div className={styles.versionBadge}>v{update.version}</div>
              <div
                className={`${styles.statusBadge} ${getStatusBadgeClass(update.status)}`}
              >
                {update.status}
              </div>
            </div>

            <div className={styles.cardDate}>{formatDate(update.dateTime)}</div>

            <div className={styles.cardContent}>
              <p>{update.changes}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModelUpdates;