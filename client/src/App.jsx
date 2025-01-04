import React, { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./auth/AuthContext";

// Authentication components
const Login = lazy(() => import("./components/Login"));
const Register = lazy(() => import("./components/Register"));

// User profile and related pages (Profile, UserDetails, UserCommunities, SavedPosts)
const Home = lazy(() => import("./components/Home"));
const Profile = lazy(() => import("./components/Profile"));
const UserDetails = lazy(() => import("./components/UserDetails"));
const UserCommunities = lazy(() => import("./components/UserCommunities"));
const SavedPosts = lazy(() => import("./components/SavedPosts"));

// Layout components (Navbar, Header, Footer, etc.)
const Navbar = lazy(() => import("./components/Navbar"));

// Messaging and communication components (Inbox, ChatAI, Friends)
const Inbox = lazy(() => import("./components/Inbox"));
const ChatAI = lazy(() => import("./components/ChatAI"));
const Friends = lazy(() => import("./components/Friends"));

// Community-related components (CommunitiesList, CommunityDetails)
const CommunitiesList = lazy(() => import("./components/CommunitiesList"));
const CommunityDetails = lazy(() => import("./components/CommunityDetails"));

// Security and settings components (Enable2FA)
const Enable2FA = lazy(() => import("./components/Enable2FA"));

// Event-related components (Events)
const Events = lazy(() => import("./components/Events"));

// General information components for static pages
const TermsAndServices = lazy(() => import("./components/Terms"));
const About = lazy(() => import("./components/About"));
const Contact = lazy(() => import("./components/Contact"));
const NotFound = lazy(() => import("./components/NotFound"));
const PremiumPage = lazy(() => import("./components/PremiumPage"));
const HealthCheck = lazy(() => import("./components/HealthCheck"));
const FAQ = lazy(() => import("./components/FAQ"));

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
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/home"
              element={isAuthenticated ? <Home /> : <Login />}
            />
            <Route
              path="/u/profile"
              element={isAuthenticated ? <Profile /> : <Login />}
            />
            <Route
              path="/u/users/:userId"
              element={isAuthenticated ? <UserDetails /> : <Login />}
            />
            <Route
              path="/messages"
              element={isAuthenticated ? <Inbox /> : <Login />}
            />
            <Route
              path="/chat"
              element={isAuthenticated ? <ChatAI /> : <Login />}
            />
            <Route
              path="/u/:userId"
              element={isAuthenticated ? <UserDetails /> : <Login />}
            />
            <Route
              path="/c/communities"
              element={isAuthenticated ? <CommunitiesList /> : <Login />}
            />
            <Route
              path="/c/community/:name"
              element={isAuthenticated ? <CommunityDetails /> : <Login />}
            />
            <Route
              path="/c/user/communities"
              element={isAuthenticated ? <UserCommunities /> : <Login />}
            />
            <Route
              path="/security/2fa/enable"
              element={isAuthenticated ? <Enable2FA /> : <Login />}
            />
            <Route
              path="/user/saved"
              element={isAuthenticated ? <SavedPosts /> : <Login />}
            />
            <Route
              path="/user/friends"
              element={isAuthenticated ? <Friends /> : <Login />}
            />

            <Route
              path="/c/events"
              element={isAuthenticated ? <Events /> : <Login />}
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