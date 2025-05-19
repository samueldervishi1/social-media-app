import React, { useState, useEffect } from 'react';
import axios from 'axios';
import loaderImage from '../assets/377.gif';

const PostCard = React.lazy(() => import('./PostCard'));
const API_URL = import.meta.env.VITE_API_URL;

const PostList = ({ onPostRefresh }) => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [delayOver, setDelayOver] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDelayOver(true);
      setIsLoading(false);
    }, 1500);

    fetchPosts();
    return () => clearTimeout(timer);
  }, []);

  const fetchPosts = async () => {
    try {
      const userPostsResponse = await axios.get(`${API_URL}posts/all`, {
        withCredentials: true,
        headers: {
          'X-App-Version': import.meta.env.VITE_APP_VERSION,
        },
      });

      const allPosts = [...userPostsResponse.data];

      const filteredPosts = allPosts.filter(
        (post) => !post.deleted && !post.reported
      );

      const postsWithUsernames = await Promise.all(
        filteredPosts.map(async (post) => {
          if (!post.userId) {
            return { ...post, username: 'User Deleted' };
          }

          try {
            const usernameResponse = await axios.get(
              `${API_URL}users/lookup/find?userId=${post.userId}`,
              {
                withCredentials: true,
                headers: {
                  'X-App-Version': import.meta.env.VITE_APP_VERSION,
                },
              }
            );

            const username = usernameResponse.data;
            return { ...post, username };
          } catch (err) {
            return { ...post, username: 'User Deleted' };
          }
        })
      );

      postsWithUsernames.sort((a, b) => {
        const dateA = new Date(a.createTime || `${a.postDate}T${a.postTime}`);
        const dateB = new Date(b.createTime || `${b.postDate}T${b.postTime}`);
        return dateB - dateA;
      });

      setPosts(postsWithUsernames);
    } catch (error) {
      setError('Something went wrong. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className='error-message'>
        <p>{error}</p>
      </div>
    );
  }

  if (isLoading || !delayOver) {
    return (
      <div className='text-loader'>
        <img
          src={loaderImage}
          alt='Loading...'
          className='list-loader'
          style={{ width: 30, position: 'relative', left: '45%' }}
        />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div
        className='no-posts-message'
        style={{ textAlign: 'center', marginTop: '20px', color: 'white' }}
      >
        <p style={{ color: 'black' }}>No more posts.</p>
      </div>
    );
  }

  return (
    <div className='post-list' style={{ marginBottom: 15 }}>
      {posts.map((post) => (
        <div key={post.id} className='post-card-wrapper'>
          <PostCard
            id={post.id}
            content={post.content}
            commentsList={post.commentsList}
            postDate={new Date(
              post.createTime || `${post.postDate}T${post.postTime}`
            ).toLocaleDateString()}
            postTime={new Date(
              post.createTime || `${post.postDate}T${post.postTime}`
            ).toLocaleTimeString()}
            userId={post.userId}
            username={post.username}
            imageUrl={post.imageUrl}
            onPostRefresh={onPostRefresh}
            onPostDeleted={(deletedId) => {
              setPosts((prevPosts) =>
                prevPosts.filter((p) => p.id !== deletedId)
              );
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default PostList;