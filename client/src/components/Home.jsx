import React, { useEffect, useState, Suspense } from 'react';
import styles from '../styles/home.module.css';
import { useAuth } from '../auth/AuthContext';

const Post = React.lazy(() => import('./Post'));
const PostList = React.lazy(() => import('./PostList'));
const Menu = React.lazy(() => import('./Menu'));

const REFRESH_INTERVAL = 300000;

const Home = () => {
  const { validateToken, logout } = useAuth();
  const [refreshPostList, setRefreshPostList] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!validateToken()) {
        logout();
        return;
      }
      setRefreshPostList((prev) => !prev);
    }, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [validateToken, logout]);

  return (
    <div className={styles.home_container}>
      <div className={styles.menu}>
        <Suspense fallback={<div>Loading Menu...</div>}>
          <Menu />
        </Suspense>
      </div>
      <div className={styles.main_content}>
        <Suspense fallback={<div>Loading...</div>}>
          <Post />
          <PostList key={refreshPostList} />
        </Suspense>
      </div>
    </div>
  );
};

export default Home;