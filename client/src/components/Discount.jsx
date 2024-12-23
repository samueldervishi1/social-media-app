import React, { useState } from "react";
import styles from "../styles/discount.module.css";

const Discount = () => {
  const [discountPrice, setDiscountPrice] = useState(10);

  return (
    <div className={styles.box}>
      <div>
        <div className={styles.boxInner}></div>
      </div>

      <h3>Limited Time Offer!</h3>
      <p>Premium+ ${discountPrice} only for 6 Days!</p>
    </div>
  );
};

export default Discount;