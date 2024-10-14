import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import "../styles/premium.css";

const PremiumPage = () => {
  const navigate = useNavigate();

  const handleBackHome = () => {
    navigate("/home");
  };

  const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        const expirationTime = decodedToken.exp * 1000;
        return Date.now() < expirationTime;
      } catch (error) {
        console.error("Error decoding token: ", error.message);
        return false;
      }
    } else {
      return false;
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="premium-page">
      <div className="background">
        <h1 className="-plan-title" style={{ top: 10, textAlign: "center" }}>
          <IoIosArrowRoundBack
            className="back-icon1"
            onClick={handleBackHome}
            style={{
              backgroundColor: "lightgrey",
              borderRadius: "50%",
              width: 30,
              height: 30,
              gap: 20,
              transition: "background-color 0.3s ease",
            }}
          />{" "}
          Choose the best plan for you
        </h1>
        <div className="container-p">
          <div className="panel pricing-table">
            <div className="pricing-plan">
              <h2 className="pricing-header">Premium</h2>
              <ul className="pricing-features">
                <li className="pricing-features-item">
                  Half Ads in For You and Following
                </li>
                <li className="pricing-features-item">Larger reply boost</li>
                <li className="pricing-features-item">Get paid to post</li>
                <li className="pricing-features-item">Checkmark</li>
                <li className="pricing-features-item">Creator Subscription</li>
              </ul>
              <span className="pricing-price">$7</span>
              <a href="/pay" className="pricing-button is-featured">
                Subscribe & Pay
              </a>
            </div>

            <div className="pricing-plan">
              <h2 className="pricing-header">Premium +</h2>
              <ul className="pricing-features">
                <li className="pricing-features-item">
                  Evrithing in Premium, and
                </li>
                <li className="pricing-features-item">
                  No Ads in For You and Following
                </li>
                <li className="pricing-features-item">Largest reply boost</li>
                <li className="pricing-features-item">
                  Chirps Pro, Analytics, Media Studio
                </li>
                <li className="pricing-features-item">Write articles</li>
              </ul>
              <span className="pricing-price">$14</span>
              <a href="/pay" className="pricing-button">
                Subscribe & Pay
              </a>
            </div>
          </div>
          <div className="terms-check">
            <a href="/terms">Check Terms & Services for more information.</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumPage;
