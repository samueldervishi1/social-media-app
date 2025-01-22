import React, { lazy, Suspense, useEffect } from 'react';
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
const UserCommunities = lazy(() => import('./components/UserCommunities'));
const Navbar = lazy(() => import('./components/Navbar'));
const ChatAI = lazy(() => import('./components/ChatAI'));
const CommunitiesList = lazy(() => import('./components/CommunitiesList'));
const CommunityDetails = lazy(() => import('./components/CommunityDetails'));
const Enable2FA = lazy(() => import('./components/Enable2FA'));
const TermsAndServices = lazy(() => import('./components/Terms'));
const About = lazy(() => import('./components/About'));
const Contact = lazy(() => import('./components/Contact'));
const NotFound = lazy(() => import('./components/NotFound'));
const HealthCheck = lazy(() => import('./components/HealthCheck'));
const FAQ = lazy(() => import('./components/FAQ'));

const App = () => {
  const { isAuthenticated } = useAuth();
  let devToolsLogged = false;

  const detectDevTools = () => {
    if (devToolsLogged) return;
    const devTools = /./;
    devTools.toString = function() {
      devToolsLogged = true;
      console.log(
        `%c
 oooooooo8 ooooo  oooo oooooooooo         ooooooo8  
888         888    88   888    888      o888    88  
 888oooooo  888    88   888oooo88       888    oooo 
        888 888    88   888             888o    88  
o88oooo888   888oo88   o888o             888ooo888  
                                                     `,
        'font-size: 10px; color: white; text-transform: uppercase;'
      );
    };
    devTools.toString();
  };

  useEffect(() => {
    detectDevTools();
  }, []);

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
            <Route
              path='/home'
              element={isAuthenticated ? <Home /> : <Login />}
            />
            <Route
              path='/u/profile'
              element={isAuthenticated ? <Profile /> : <Login />}
            />
            <Route
              path='/chat'
              element={isAuthenticated ? <ChatAI /> : <Login />}
            />
            <Route
              path='/c/communities'
              element={isAuthenticated ? <CommunitiesList /> : <Login />}
            />
            <Route
              path='/c/community/:name'
              element={isAuthenticated ? <CommunityDetails /> : <Login />}
            />
            <Route
              path='/c/user/communities'
              element={isAuthenticated ? <UserCommunities /> : <Login />}
            />
            <Route
              path='/security/2fa/enable'
              element={isAuthenticated ? <Enable2FA /> : <Login />}
            />

            {/* Static Pages */}
            <Route path='/terms' element={<TermsAndServices />} />
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