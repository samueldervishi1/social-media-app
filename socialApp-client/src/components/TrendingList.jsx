import React from "react";
import "../styles/trending.css";

const TrendingList = () => {
  const trends = [
    { name: "Samsung", posts: "30k" },
    { name: "One UI ", posts: "2k" },
    { name: "Memes", posts: "150k" },
    { name: "Apple", posts: 900 },
    { name: "Elon Musk", posts: "5k" },
    { name: "Mars", posts: "30k" },
    { name: "GTA VI ", posts: "2k" },
    { name: "USA", posts: "150k" },
    { name: "NBA", posts: 900 },
  ];

  const handleHashtagClick = (name) => {
    console.log(`Clicked on hashtag: #${name}`);
  };

  const handleShowMoreClick = () => {
    console.log("Show more clicked!");
  };

  return (
    <div className="trending-list">
      <h3>Trends for you</h3>
      <div className="trend-card">
        {trends.map((trend, index) => (
          <div key={index} className="trend-item">
            <p
              className="trend-text"
              onClick={() => handleHashtagClick(trend.name)}
            >
              <span className="trend-hashtag">#{trend.name}</span>
            </p>
            <p className="post-count">{trend.posts} posts</p>
          </div>
        ))}
      </div>
      <a className="show-more-button" onClick={handleShowMoreClick}>
        Show More
      </a>
    </div>
  );
};

export default TrendingList;
