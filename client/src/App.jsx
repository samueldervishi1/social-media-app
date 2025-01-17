import React, { lazy, Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { useAuth } from './auth/AuthContext';

const Login = lazy(() => import('./components/Login'));
const Register = lazy(() => import('./components/Register'));
const Home = lazy(() => import('./components/Home'));
const Profile = lazy(() => import('./components/Profile'));
const UserDetails = lazy(() => import('./components/UserDetails'));
const UserCommunities = lazy(() => import('./components/UserCommunities'));
const SavedPosts = lazy(() => import('./components/SavedPosts'));
const Activity = lazy(() => import('./components/Activity'));
const Navbar = lazy(() => import('./components/Navbar'));
const Inbox = lazy(() => import('./components/Inbox'));
const ChatAI = lazy(() => import('./components/ChatAI'));
const Friends = lazy(() => import('./components/Friends'));
const CommunitiesList = lazy(() => import('./components/CommunitiesList'));
const CommunityDetails = lazy(() => import('./components/CommunityDetails'));
const Enable2FA = lazy(() => import('./components/Enable2FA'));
const Events = lazy(() => import('./components/Events'));
const TermsAndServices = lazy(() => import('./components/Terms'));
const About = lazy(() => import('./components/About'));
const Contact = lazy(() => import('./components/Contact'));
const NotFound = lazy(() => import('./components/NotFound'));
const PremiumPage = lazy(() => import('./components/PremiumPage'));
const HealthCheck = lazy(() => import('./components/HealthCheck'));
const FAQ = lazy(() => import('./components/FAQ'));

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <div className='App'>
        {isAuthenticated && <Navbar />}

        <Suspense
          fallback={<div style={{ textAlign: 'center' }}>Loading...</div>}
        >
          <Routes>
            {/* Public Routes */}
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />

            {/* Protected Routes */}
            <Route path='/home' element={isAuthenticated ? <Home /> : <Login />} />
            <Route path='/u/profile' element={isAuthenticated ? <Profile /> : <Login />} />
            <Route path='/u/users/:userId' element={isAuthenticated ? <UserDetails /> : <Login />} />
            <Route path='/messages' element={isAuthenticated ? <Inbox /> : <Login />} />
            <Route path='/chat' element={isAuthenticated ? <ChatAI /> : <Login />} />
            <Route path='/u/:userId' element={isAuthenticated ? <UserDetails /> : <Login />} />
            <Route path='/c/communities' element={isAuthenticated ? <CommunitiesList /> : <Login />} />
            <Route path='/c/community/:name' element={isAuthenticated ? <CommunityDetails /> : <Login />} />
            <Route path='/c/user/communities' element={isAuthenticated ? <UserCommunities /> : <Login />} />
            <Route path='/security/2fa/enable' element={isAuthenticated ? <Enable2FA /> : <Login />} />
            <Route path='/user/saved' element={isAuthenticated ? <SavedPosts /> : <Login />} />
            <Route path='/user/friends' element={isAuthenticated ? <Friends /> : <Login />} />
            <Route path='/c/events' element={isAuthenticated ? <Events /> : <Login />} />
            <Route path='/c/activity' element={isAuthenticated ? <Activity /> : <Login />} />

            {/* Static Pages */}
            <Route path='/terms' element={<TermsAndServices />} />
            <Route path='/premium' element={<PremiumPage />} />
            <Route path='/about' element={<About />} />
            <Route path='/contact' element={<Contact />} />
            <Route path='/health' element={<HealthCheck />} />
            <Route path='/faq' element={<FAQ />} />

            {/* Not Found Route */}
            <Route path='*' element={<NotFound />} />

            {/* Default Route */}
            <Route path='/' element={<Navigate to='/home' replace />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
};

export default App;