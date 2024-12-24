import React, { useState, useEffect } from "react";
import styles from "../styles/discount.module.css";

const Discount = () => {
  const [daysRemaining, setDaysRemaining] = useState(6);

  useEffect(() => {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 6);

    const interval = setInterval(() => {
      const currentDate = new Date();
      const difference = expirationDate - currentDate;
      const daysLeft = Math.floor(difference / (1000 * 60 * 60 * 24));

      if (daysLeft <= 0) {
        setDaysRemaining(0);
        clearInterval(interval);
      } else {
        setDaysRemaining(daysLeft);
      }
    }, 1000 * 60 * 60 * 24);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.box}>
      <div>
        <div className={styles.boxInner}></div>
      </div>

      <h3>Limited Time Offer!</h3>
      <p>
        Premium+ ${10} only for {daysRemaining} Days!
      </p>
    </div>
  );
};

export default Discount;