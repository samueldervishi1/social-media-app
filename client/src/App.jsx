import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import LoginScript from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import Profile from "./components/Profile";
import UserDetails from "./components/UserDetails";
import NotFound from "./components/NotFound";
import PremiumPage from "./components/PremiumPage";
import Inbox from "./components/Inbox";
import TermsAndServices from "./components/Terms";
import About from "./components/About";
import Contact from "./components/Contact";
import ChirpAI from "./components/ChirpAI";
import Footer from "./components/Footer";

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
        {isAuthenticated() && <Navbar />}
        <Routes>
          <Route path="/login" element={<LoginScript />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/home"
            element={isAuthenticated() ? <Home /> : <LoginScript />}
          />
          <Route
            path="/profile"
            element={isAuthenticated() ? <Profile /> : <LoginScript />}
          />
          <Route
            path="/users/:userId"
            element={isAuthenticated() ? <UserDetails /> : <LoginScript />}
          />
          <Route
            path="/messages"
            element={isAuthenticated() ? <Inbox /> : <LoginScript />}
          />
          <Route
            path="/chirp"
            element={isAuthenticated() ? <ChirpAI /> : <LoginScript />}
          />
          <Route path="/terms" element={<TermsAndServices />} />
          <Route path="/premium" element={<PremiumPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Routes>
        {!isAuthenticated() && <Footer />}
      </div>
    </Router>
  );
};

export default App;
