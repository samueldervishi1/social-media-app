import React, { useRef, useEffect, useState } from "react";
import FooterLeft from "./FooterLeft";
import FooterRight from "./FooterRight";
import "./VideoCard.css";

const VideoCard = (props) => {
  const {
    title,
    description,
    localUrl,
    username,
    song,
    tags,
    likes,
    shares,
    comments,
    saves,
    profilePic,
    setVideoRef,
    index,
    currentIndex,
  } = props;

  const videoRef = useRef(null);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    if (setVideoRef) {
      setVideoRef(videoRef.current);
    }
  }, [setVideoRef]);

  useEffect(() => {
    if (videoRef.current) {
      if (index === currentIndex) {
        videoRef.current.play().catch(() => setVideoError(true));
      } else {
        if (prevIndex !== undefined && prevIndex !== index) {
          const prevVideoRef = videoRefs.current[prevIndex];
          if (prevVideoRef) {
            prevVideoRef.pause();
          }
        }
        videoRef.current.pause();
      }
      prevIndex = index;
    }
  }, [currentIndex, index]);

  let prevIndex = undefined;

  const onVideoPress = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => setVideoError(true));
      } else {
        videoRef.current.pause();
      }
    }
  };

  return (
    <div className="video">
      <video
        className="player"
        onClick={onVideoPress}
        ref={(ref) => {
          videoRef.current = ref;
          setVideoRef(ref);
        }}
        loop
        src={localUrl}
        onError={() => setVideoError(true)}
      >
        Your browser does not support the video tag.
      </video>
      {/* {videoError && <p className="video-error">Video could not be loaded.</p>} */}
      <div className="bottom-controls">
        <div className="footer-left">
          <FooterLeft
            username={username}
            description={description}
            tags={tags}
            song={song}
          />
        </div>
        <div className="footer-right">
          <FooterRight
            likes={likes}
            shares={shares}
            comments={comments}
            saves={saves}
            profilePic={profilePic}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
