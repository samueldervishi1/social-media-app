import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/discount.module.css";

const Discount = () => {
  const [daysRemaining, setDaysRemaining] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const storedExpirationDate = localStorage.getItem("expirationDate");
    let expirationDate;

    if (storedExpirationDate) {
      expirationDate = new Date(storedExpirationDate);
    } else {
      expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 6);
      localStorage.setItem("expirationDate", expirationDate.toISOString());
    }

    const updateDaysRemaining = () => {
      const currentDate = new Date();
      const difference = expirationDate - currentDate;
      const daysLeft = Math.max(
        Math.floor(difference / (1000 * 60 * 60 * 24)),
        0
      );

      setDaysRemaining(daysLeft);
    };

    updateDaysRemaining();
    const interval = setInterval(updateDaysRemaining, 1000 * 60 * 60 * 24);

    return () => clearInterval(interval);
  }, []);

  const handleCardClick = () => {
    if (daysRemaining > 0) {
      navigate("/premium");
    }
  };

  return (
    <div
      className={styles.box}
      onClick={handleCardClick}
      style={{ cursor: "pointer" }}
    >
      <div>
        <div className={styles.boxInner}></div>
      </div>

      {daysRemaining > 0 ? (
        <>
          <h3>Limited Time Offer!</h3>
          <p>
            Premium+ ${10} only for {daysRemaining} Day
            {daysRemaining > 1 ? "s" : ""}!
          </p>
        </>
      ) : (
        <h3>The offer has ended!</h3>
      )}
    </div>
  );
};

export default Discount;