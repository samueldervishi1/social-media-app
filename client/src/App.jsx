import React, { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import Navbar from "./components/Navbar";

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
const ChatAI = lazy(() => import("./components/ChatAI"));
const CommunitiesList = lazy(() => import("./components/CommunitiesList"));
const CommunityDetails = lazy(() => import("./components/CommunityDetails"));
const UserCommunities = lazy(() => import("./components/UserCommunities"));
const Enable2FA = lazy(() => import("./components/Enable2FA"));
const HealthCheck = lazy(() => import("./components/HealthCheck"));
const FAQ = lazy(() => import("./components/FAQ"));
const SavedPosts = lazy(() => import("./components/SavedPosts"));
const Friends = lazy(() => import("./components/Friends"));
const Events = lazy(() => import("./components/Events"));

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <div className="App">
        {isAuthenticated && <Navbar />}

        <Suspense
          fallback={<div style={{ textAlign: "center" }}>Loading...</div>}
        >
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginScript />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/home"
              element={isAuthenticated ? <Home /> : <LoginScript />}
            />
            <Route
              path="/u/profile"
              element={isAuthenticated ? <Profile /> : <LoginScript />}
            />
            <Route
              path="/u/users/:userId"
              element={isAuthenticated ? <UserDetails /> : <LoginScript />}
            />
            <Route
              path="/messages"
              element={isAuthenticated ? <Inbox /> : <LoginScript />}
            />
            <Route
              path="/chat"
              element={isAuthenticated ? <ChatAI /> : <LoginScript />}
            />
            <Route
              path="/u/:userId"
              element={isAuthenticated ? <UserDetails /> : <LoginScript />}
            />
            <Route
              path="/c/communities"
              element={isAuthenticated ? <CommunitiesList /> : <LoginScript />}
            />
            <Route
              path="/c/community/:name"
              element={isAuthenticated ? <CommunityDetails /> : <LoginScript />}
            />
            <Route
              path="/c/user/communities"
              element={isAuthenticated ? <UserCommunities /> : <LoginScript />}
            />
            <Route
              path="/security/2fa/enable"
              element={isAuthenticated ? <Enable2FA /> : <LoginScript />}
            />
            <Route
              path="/user/saved"
              element={isAuthenticated ? <SavedPosts /> : <LoginScript />}
            />
            <Route
              path="/user/friends"
              element={isAuthenticated ? <Friends /> : <LoginScript />}
            />

<Route
              path="/c/events"
              element={isAuthenticated ? <Events /> : <LoginScript />}
            />

            {/* Static Pages */}
            <Route path="/terms" element={<TermsAndServices />} />
            <Route path="/premium" element={<PremiumPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/health" element={<HealthCheck />} />
            <Route path="/faq" element={<FAQ />} />

            {/* Not Found Route */}
            <Route path="*" element={<NotFound />} />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/home" replace />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
};

export default App;