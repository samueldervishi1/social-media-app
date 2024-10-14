import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginScript from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import Profile from "./components/Profile";
import PostDetail from "./components/PostDetails";
import UserDetails from "./components/UserDetails";
import NotFound from "./components/NotFound";
// import SavedPosts from "./components/SavedPosts";
import PremiumPage from "./components/PremiumPage";
import UserCard from "./components/MessageUserCard";
import QRCodePage from "./components/QrCode";
import TermsAndServices from "./components/Terms";
import About from "./components/About";
import Contact from "./components/Contact";
// import ActivityPage from "./components/ActivityPage";
import AiChat from "./components/AiChat";
import ChatHistoryCard from "./components/ChatHistoryCard";

const App = () => {
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
    }
    return false;
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<LoginScript />} />
          <Route path="/register" element={<Register />} />
          <Route path="/terms" element={<TermsAndServices />} />

          <Route
            path="/home"
            element={isAuthenticated() ? <Home /> : <LoginScript />}
          />
          <Route
            path="/profile"
            element={isAuthenticated() ? <Profile /> : <LoginScript />}
          />
          <Route
            path="/posts/:postId"
            element={isAuthenticated() ? <PostDetail /> : <LoginScript />}
          />
          <Route
            path="/users/:userId"
            element={isAuthenticated() ? <UserDetails /> : <LoginScript />}
          />
          {/* <Route
            path="/bookmarks"
            element={isAuthenticated() ? <SavedPosts /> : <LoginScript />}
          /> */}
          <Route
            path="/messages"
            element={isAuthenticated() ? <UserCard /> : <LoginScript />}
          />
          <Route
            path="/qrcode/:username"
            element={isAuthenticated() ? <QRCodePage /> : <LoginScript />}
          />
          {/* <Route
            path="/activity"
            element={isAuthenticated() ? <ActivityPage /> : <LoginScript />}
          /> */}
          <Route
            path="/ai"
            element={isAuthenticated() ? <AiChat /> : <LoginScript />}
          />
          <Route
            path="/history"
            element={isAuthenticated() ? <ChatHistoryCard /> : <LoginScript />}
          />
          <Route path="/premium" element={<PremiumPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
