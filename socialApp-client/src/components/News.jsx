import React, { useState, useEffect } from "react";
import "../styles/news.css";
import placeholderImg from "../assets/placeholder.png";
import loaderImage from "../assets/ZKZg.gif";

const truncateText = (text, maxLength) => {
  if (text.length > maxLength) {
    return text.slice(0, maxLength) + "...";
  }
  return text;
};

const RecentNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(
          "https://newsapi.org/v2/top-headlines?sources=techcrunch&apiKey=6a2c8c65277a4bb397fe4fb8f571aa3c"
        );
        const data = await response.json();
        const fetchedNews = data.articles.map((article) => ({
          title: article.title,
          url: article.url,
          image: article.urlToImage || placeholderImg,
        }));
        setNews(fetchedNews);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 2000);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="recent-news-container">
      <div className="news-header">
        <h1>Recent News</h1>
      </div>
      {loading ? (
        <div className="loader-container">
          <img src={loaderImage} alt="Loading..." className="loader" />
        </div>
      ) : (
        <ul className="news-list">
          {news.map((item, index) => (
            <li key={index} className="news-item">
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                <img src={item.image} alt={item.title} className="news-image" />
                <span className="news-title">
                  {truncateText(item.title, 30)}{" "}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentNews;
