import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Post from "./Post";
import PostList from "./PostList";
import SearchBar from "./SearchBar";
import TrendingList from "./TrendingList";
import Offer from "./Offer";
import "../styles/home.css";

const Home = () => {
  const navigate = useNavigate();

  const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        const expirationTime = decodedToken.exp * 1000;
        return Date.now() < expirationTime;
      } catch (error) {
        console.error("Error decoding token: ", error.message);
        return false;
      }
    } else {
      return false;
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="home-container">
      <div className="content-wrapper">
        <div className="main-content">
          <Post />
          <PostList />
        </div>
        <div className="sidebar-search">
          <SearchBar />
          <Offer />
          <TrendingList />
        </div>
      </div>
      <div className="chat-history">
        <Navbar />
      </div>
    </div>
  );
};

export default Home;
