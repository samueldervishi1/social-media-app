import React, { useEffect, useState } from "react";
import "../styles/premiumCard.css";
import { useNavigate } from "react-router-dom";

const GlassCard = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const countdownDuration = 35 * 60 * 60 * 1000;

  useEffect(() => {
    const endTime = localStorage.getItem("countdownEndTime");
    const currentTime = Date.now();

    if (endTime) {
      const remainingTime = parseInt(endTime) - currentTime;
      if (remainingTime > 0) {
        updateTimer(remainingTime);
      } else {
        resetTimer();
      }
    } else {
      const newEndTime = currentTime + countdownDuration;
      localStorage.setItem("countdownEndTime", newEndTime);
      updateTimer(countdownDuration);
    }

    const intervalId = setInterval(() => {
      const remainingTime =
        parseInt(localStorage.getItem("countdownEndTime")) - Date.now();
      if (remainingTime > 0) {
        updateTimer(remainingTime);
      } else {
        clearInterval(intervalId);
        resetTimer();
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const updateTimer = (remainingTime) => {
    const hours = Math.floor(
      (remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor(
      (remainingTime % (1000 * 60 * 60)) / (1000 * 60)
    );
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
    setTimeLeft({ hours, minutes, seconds });
  };

  const resetTimer = () => {
    localStorage.removeItem("countdownEndTime");
    setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
  };

  const navigateToPremium = () => {
    navigate("/premium");
  };

  return (
    <div className="glass-card">
      <h3 className="card-title">Expiring Soon!</h3>
      <p className="card-description">Get up to 40% off Chirp Premium</p>
      {timeLeft.hours === 0 &&
      timeLeft.minutes === 0 &&
      timeLeft.seconds === 0 ? (
        <p className="expired">Offer has expired!</p>
      ) : (
        <p className="timer">
          {`${String(timeLeft.hours).padStart(2, "0")} hours : ${String(
            timeLeft.minutes
          ).padStart(2, "0")} minutes : ${String(timeLeft.seconds).padStart(
            2,
            "0"
          )} seconds`}
        </p>
      )}
      <button
        className="card-button"
        onClick={navigateToPremium}
        disabled={
          timeLeft.hours === 0 &&
          timeLeft.minutes === 0 &&
          timeLeft.seconds === 0
        }
      >
        Click Me
      </button>
    </div>
  );
};

export default GlassCard;
