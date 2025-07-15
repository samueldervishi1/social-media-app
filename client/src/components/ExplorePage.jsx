import { useState, useEffect } from 'react';
import styles from '../styles/ExplorePage.module.css';

const ExplorePage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const apiUrl = `${import.meta.env.VITE_NEWS_BASE_URL}/top-headlines?country=us&apiKey=${import.meta.env.VITE_NEWS_API_KEY}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let data;
      try {
        const rawText = await response.text();
        data = JSON.parse(rawText);
      } catch (jsonError) {
        throw new Error('Unable to parse response. Please try again later.');
      }

      if (!data || !Array.isArray(data.articles)) {
        throw new Error('Invalid response format. Please try again later.');
      }
      setArticles(data.articles);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openArticle = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className={styles.explorePage}>
        <div className={styles.loading}>Loading news...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.explorePage}>
        <div className={styles.error}>Error: {error}</div>
      </div>
    );
  }

  return (
    <div className={styles.explorePage}>
      <div className={styles.exploreHeader}>
        <h1>Explore News</h1>
        <p>Stay updated with the latest headlines</p>
      </div>

      <div className={styles.postsContainer}>
        {articles.length === 0 ? (
          <div className={styles.noPosts}>No news articles found</div>
        ) : (
          articles.map((article, index) => (
            <div key={index} className={styles.postCard}>
              <div className={styles.postHeader}>
                <div className={styles.postMeta}>
                  <span className={styles.postDate}>
                    {formatDate(article.publishedAt)}
                  </span>
                  {article.source && (
                    <span className={styles.source}>{article.source.name}</span>
                  )}
                </div>
              </div>

              {article.urlToImage && (
                <div className={styles.articleImage}>
                  <img
                    src={article.urlToImage}
                    alt={article.title}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className={styles.postContent}>
                <h3 className={styles.articleTitle}>{article.title}</h3>
                {article.description && (
                  <p className={styles.articleDescription}>
                    {article.description}
                  </p>
                )}
                {article.author && (
                  <p className={styles.articleAuthor}>By {article.author}</p>
                )}
              </div>

              <div className={styles.postActions}>
                <button
                  className={`${styles.actionBtn} ${styles.readBtn}`}
                  onClick={() => openArticle(article.url)}
                >
                  <span className={styles.icon}>Read Full Article</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
