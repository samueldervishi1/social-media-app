import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChatHistory from "./ChatHistory";
import Post from "./Post";
import PostList from "./PostList";
import RecentNews from "./News";
// import ActivityPage from "./ActivityPage";
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
        {/* <div className="left-content">
          <ActivityPage />
        </div> */}
        <div className="main-content">
          <Post />
          <PostList />
        </div>
        <div className="side-content">
          <RecentNews />
        </div>
      </div>
      <div className="chat-history">
        <ChatHistory />
      </div>
    </div>
  );
};

export default Home;
