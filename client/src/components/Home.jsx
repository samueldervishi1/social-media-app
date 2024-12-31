import React, { useEffect, useState } from "react";
import styles from "../styles/home.module.css";

const Post = React.lazy(() => import("./Post"));
const PostList = React.lazy(() => import("./PostList"));
const TrendingList = React.lazy(() => import("./TrendingList"));
const Discount = React.lazy(() => import("./Discount"));
const Menu = React.lazy(() => import("./Menu"));

const Home = () => {
  const [refreshPostList, setRefreshPostList] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRefreshPostList((prev) => !prev);
    }, 300000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className={styles.home_container}>
      <div className={styles.menu}>
        <React.Suspense fallback={<div>Loading Menu...</div>}>
          <Menu />
        </React.Suspense>
      </div>
      <div className={styles.main_content}>
        <React.Suspense fallback={<div>Loading...</div>}>
          <Post />
          <PostList key={refreshPostList} />
        </React.Suspense>
      </div>
      <div className={styles.sidebar}>
        <React.Suspense fallback={<div>Loading...</div>}>
          <Discount />
          <TrendingList />
        </React.Suspense>
      </div>
    </div>
  );
};

export default Home;