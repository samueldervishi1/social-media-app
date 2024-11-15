import React, { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const LoginScript = lazy(() => import("./components/Login"));
const Register = lazy(() => import("./components/Register"));
const Home = lazy(() => import("./components/Home"));
const Profile = lazy(() => import("./components/Profile"));
const UserDetails = lazy(() => import("./components/UserDetails"));
const NotFound = lazy(() => import("./components/NotFound"));
const PremiumPage = lazy(() => import("./components/PremiumPage"));
const Inbox = lazy(() => import("./components/Inbox"));
const TermsAndServices = lazy(() => import("./components/Terms"));
const About = lazy(() => import("./components/About"));
const Contact = lazy(() => import("./components/Contact"));
const ChirpAI = lazy(() => import("./components/ChirpAI"));
const CommunitiesList = lazy(() => import("./components/CommunitiesList"));
const CommunityDetails = lazy(() => import("./components/CommunityDetails"));

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

        <Suspense fallback={<div>Loading...</div>}>
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
            <Route
              path="/u/:userId"
              element={isAuthenticated() ? <UserDetails /> : <LoginScript />}
            />
            <Route
              path="/c/communities"
              element={
                isAuthenticated() ? <CommunitiesList /> : <LoginScript />
              }
            />
            <Route
              path="/c/community/:name"
              element={
                isAuthenticated() ? <CommunityDetails /> : <LoginScript />
              }
            />
            <Route path="/terms" element={<TermsAndServices />} />
            <Route path="/premium" element={<PremiumPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/" element={<Navigate to="/home" replace />} />
          </Routes>
        </Suspense>

        {!isAuthenticated() && <Footer />}
      </div>
    </Router>
  );
};

export default App;
