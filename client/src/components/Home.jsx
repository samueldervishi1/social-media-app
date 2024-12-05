import React from "react";
import styles from "../styles/home.module.css";

const Post = React.lazy(() => import("./Post"));
const PostList = React.lazy(() => import("./PostList"));
const TrendingList = React.lazy(() => import("./TrendingList"));

const Home = () => {
  return (
    <div className={styles.home_container}>
      <div className={styles.main_content}>
        <React.Suspense fallback={<div>Loading...</div>}>
          <Post />
          <PostList />
        </React.Suspense>
      </div>
      <div className={styles.sidebar}>
        <React.Suspense fallback={<div>Loading...</div>}>
          <TrendingList />
        </React.Suspense>
      </div>
    </div>
  );
};

export default Home;