import React, { useEffect, useState } from "react";
import loaderGif from "../assets/ZKZg.gif";
import "../styles/trending.css";

const TrendingList = () => {
  const [loading, setLoading] = useState(true);
  const [trends, setTrends] = useState([]);

  useEffect(() => {
    const fetchData = () => {
      setTimeout(() => {
        const fetchedTrends = [
          { name: "Samsung", posts: "30k" },
          { name: "One UI", posts: "2k" },
          { name: "Memes", posts: "150k" },
          { name: "Apple", posts: 900 },
          { name: "Elon Musk", posts: "5k" },
          { name: "Mars", posts: "30k" },
          { name: "GTA VI", posts: "2k" },
          { name: "USA", posts: "150k" },
          { name: "NBA", posts: 900 },
        ];
        setTrends(fetchedTrends);
        setLoading(false);
      }, 2000);
    };

    fetchData();
  }, []);

  return (
    <div className="trending-list">
      <h3>Trends for you</h3>
      <div className="trend-card">
        {loading ? (
          <div className="loader-container">
            <img src={loaderGif} alt="Loading..." className="loader" />
          </div>
        ) : (
          trends.map((trend, index) => (
            <div key={index} className="trend-item">
              <a
                className="trend-text"
                href={`https://x.com/search?q=${encodeURIComponent(
                  trend.name
                )}&src=trend_click&vertical=trends`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="trend-hashtag">#{trend.name}</span>
              </a>
              <p className="post-count">{trend.posts} posts</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TrendingList;
