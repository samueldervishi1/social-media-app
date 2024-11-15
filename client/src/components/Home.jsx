import React from "react";
import Post from "./Post";
import PostList from "./PostList";
import TrendingList from "./TrendingList";
import "../styles/home.css";

const Home = () => {
  return (
    <div className="home-container">
      <div className="main-content">
        <Post />
        <PostList />
      </div>
      <div className="sidebar">
        <TrendingList />
      </div>
    </div>
  );
};

export default Home;
