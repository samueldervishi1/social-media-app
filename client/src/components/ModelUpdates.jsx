import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/modelUpdates.module.css';

const ModelUpdates = () => {
  const [modelUpdates, setModelUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});

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
    // Handle MongoDB date format
    if (dateString && typeof dateString === 'object' && dateString.$date) {
      const date = new Date(dateString.$date);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
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
      case 'stable':
        return styles.stable;
      case 'deprecated':
        return styles.deprecated;
      case 'beta':
        return styles.beta;
      case 'alpha':
        return styles.alpha;
      case 'end-of-life':
        return styles.endOfLife;
      case 'legacy':
        return styles.legacy;
      default:
        return '';
    }
  };

  // Toggle card expansion
  const toggleCardExpansion = (id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Sort model updates by dateTime (latest first)
  const sortedModelUpdates = [...modelUpdates].sort((a, b) => {
    // Handle MongoDB date format: { $date: "2024-07-11T15:42:35.850Z" }
    const getDateValue = (dateTime) => {
      if (dateTime && typeof dateTime === 'object' && dateTime.$date) {
        return new Date(dateTime.$date);
      }
      return new Date(dateTime);
    };

    const dateA = getDateValue(a.dateTime);
    const dateB = getDateValue(b.dateTime);

    // Sort by dateTime descending (latest first)
    return dateB - dateA;
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
      <p className={styles.subtitle}>
        Track the evolution of our AI models and their capabilities
      </p>

      <div className={styles.timeline}>
        {sortedModelUpdates.map((update, index) => (
          <div
            key={update._id?.$oid || update.id || index}
            className={`${styles.card} ${update.status === 'current' ? styles.highlightedCard : ''}`}
          >
            <div className={styles.cardHeader}>
              <h2 className={styles.modelName}>
                {update.modelName}
                {update.modelId && (
                  <span className={styles.modelId}> - {update.modelId}</span>
                )}
              </h2>
              <div className={styles.versionBadge}>v{update.version}</div>
              <div
                className={`${styles.statusBadge} ${getStatusBadgeClass(update.status)}`}
              >
                {update.status}
              </div>
            </div>

            <div className={styles.cardDate}>{formatDate(update.dateTime)}</div>

            <div className={styles.cardContent}>
              <div
                className={
                  expandedCards[update._id?.$oid || update.id || index]
                    ? styles.expandedText
                    : styles.truncatedText
                }
                dangerouslySetInnerHTML={{ __html: update.changes }}
              />
              {update.changes.length > 150 && (
                <button
                  className={styles.readMoreButton}
                  onClick={() =>
                    toggleCardExpansion(update._id?.$oid || update.id || index)
                  }
                >
                  {expandedCards[update._id?.$oid || update.id || index]
                    ? 'Show Less'
                    : 'Read More'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModelUpdates;
