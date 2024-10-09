import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import "../styles/video-feed.css";
import loaderImage from "/home/samuel/Documents/GitHub/social-media-app/socialApp-client/src/assets/ZKZg.gif";
import placeHolderImage from "/home/samuel/Documents/GitHub/social-media-app/socialApp-client/src/user.webp";
import VideoCard from "../components/video/VideoCard";
import { CopyToClipboard } from "react-copy-to-clipboard"; // For copy to clipboard functionality

const videoUrls = [
  { localUrl: "/videos/Snaptik.app_7399220345623809312.mp4" },
  { localUrl: "/videos/Snaptik.app_7409637156597058821.mp4" },
  { localUrl: "/videos/Snaptik.app_7409727657690221830.mp4" },
  { localUrl: "/videos/Snaptik.app_7409859905378618666.mp4" },
  { localUrl: "/videos/Snaptik.app_7386811699652742406.mp4" },
  { localUrl: "/videos/Snaptik.app_7408563112049134855.mp4" },
  { localUrl: "/videos/Snaptik.app_7410903803769179397.mp4" },
];

const VideoFeed = () => {
  const [videos, setVideos] = useState([]);
  const [usernames, setUsernames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const videoRefs = useRef([]);
  const prevIndex = useRef(null);

  const getUserIdFromToken = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        return decodedToken.userId;
      } catch (error) {
        console.error("Error decoding token:", error.message);
        return null;
      }
    }
    return null;
  };

  const fetchUsernames = async (userId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/users/${userId}`
      );
      const { username } = response.data;
      setUsernames((prevUsernames) => ({
        ...prevUsernames,
        [userId]: username,
      }));
    } catch (err) {
      console.error(`Failed to fetch username for userId: ${userId}`, err);
    }
  };

  const fetchRecommendedVideos = async (userId) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/api/v1/videos/recommendations/${userId}`
      );
      const fetchedVideos = response.data;
      console.log("Fetched Recommended Videos:", fetchedVideos);

      const combinedVideos = fetchedVideos.map((video, index) => ({
        ...video,
        localUrl: videoUrls[index % videoUrls.length].localUrl,
      }));
      console.log("Combined Videos with Local URLs:", combinedVideos);

      setVideos(combinedVideos);

      fetchedVideos.forEach((video) => fetchUsernames(video.creatorId));
    } catch (err) {
      setError("Failed to fetch recommended videos.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllVideos = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/v1/videos/all"
      );
      const fetchedVideos = response.data;
      const combinedVideos = fetchedVideos.map((video, index) => ({
        ...video,
        localUrl: videoUrls[index % videoUrls.length].localUrl,
      }));

      setVideos(combinedVideos);

      fetchedVideos.forEach((video) => fetchUsernames(video.creatorId));
    } catch (err) {
      setError("Failed to fetch all videos.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkUserVideos = async (userId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/videos/user/${userId}/videos`
      );
      const { savedVideos, likedVideos } = response.data;

      if (savedVideos.length > 0 || likedVideos.length > 0) {
        fetchRecommendedVideos(userId);
      } else {
        fetchAllVideos();
      }
    } catch (err) {
      fetchAllVideos();
    }
  };

  const handleCommentSubmit = async () => {
    // Replace with your comment submission logic
    console.log("New Comment:", newComment);
    setNewComment(""); // Clear input after submission
  };

  const toggleShareMenu = () => setShareMenuOpen((prev) => !prev);

  useEffect(() => {
    const userId = getUserIdFromToken();
    if (userId) {
      checkUserVideos(userId);
    } else {
      fetchAllVideos();
    }
  }, []);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.8,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const index = videoRefs.current.indexOf(entry.target);
        if (entry.isIntersecting) {
          entry.target.play();
          if (prevIndex.current !== null && prevIndex.current !== index) {
            videoRefs.current[prevIndex.current]?.pause();
          }
          prevIndex.current = index;
          setSelectedVideo(videos[index]); // Update selected video when it comes into view
        } else {
          entry.target.pause();
        }
      });
    }, observerOptions);

    videoRefs.current.forEach((videoRef) => {
      if (videoRef) {
        observer.observe(videoRef);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [videos]);

  return (
    <div className="video-feed">
      {loading ? (
        <img
          src={loaderImage}
          alt="Loading..."
          style={{ width: 30, marginTop: "100%", marginLeft: "50%" }}
        />
      ) : error ? (
        <p>{error}</p>
      ) : (
        <>
          <div className="video-list">
            {videos.map((video, index) => (
              <div key={index} className="video-item">
                <video
                  ref={(ref) => (videoRefs.current[index] = ref)}
                  src={video.localUrl}
                  controls
                />
              </div>
            ))}
          </div>
          <div className="profile-comment-section">
            {selectedVideo && (
              <>
                <div className="profile-info">
                  <img src={placeHolderImage} alt="Profile" />
                  <h3>{usernames[selectedVideo.creatorId]}</h3>
                </div>
                <div className="video-details">
                  <div className="video-tags">
                    {selectedVideo.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="video-url">
                    <input
                      type="text"
                      value={selectedVideo.localUrl}
                      readOnly
                    />
                    <CopyToClipboard text={selectedVideo.localUrl}>
                      <button className="copy-button">Copy</button>
                    </CopyToClipboard>
                    <button className="share-button" onClick={toggleShareMenu}>
                      Share
                    </button>
                    {shareMenuOpen && (
                      <div className="share-menu">
                        <a
                          href={`https://facebook.com/sharer/sharer.php?u=${selectedVideo.localUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Facebook
                        </a>
                        <a
                          href={`https://twitter.com/intent/tweet?url=${selectedVideo.localUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Twitter
                        </a>
                        <a
                          href={`https://linkedin.com/shareArticle?mini=true&url=${selectedVideo.localUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          LinkedIn
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                <div className="comment-section">
                  <h4>Comments:</h4>
                  {/* Render comments here */}
                </div>
                <div className="comment-input">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                  />
                  <button
                    onClick={handleCommentSubmit}
                    className="submit-button"
                  >
                    Submit
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default VideoFeed;
