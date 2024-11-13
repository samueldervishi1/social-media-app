import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/premium.css";

const PremiumPage = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);

  const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

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

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    handleCheckout(plan);
  };

  const handleCheckout = async (plan) => {
    if (!plan) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/v2/checkout/create-checkout-session?amount=${plan.amount}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
            
          },
        }
      );

      const session = await response.json();

      if (session.error) {
        console.error("Checkout error:", session.error);
      } else if (session.id) {
        const stripe = window.Stripe(stripePublicKey);
        const { error } = await stripe.redirectToCheckout({
          sessionId: session.id,
        });
        if (error) {
          console.error("Error redirecting to checkout:", error.message);
        }
      }
    } catch (error) {
      console.error("Error during checkout:", error);
    }
  };

  return (
    <div className="premium-page">
      <div className="background">
        <h1 className="-plan-title" style={{ top: 10, textAlign: "center" }}>
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
              <button
                className="pricing-button is-featured"
                onClick={() =>
                  handlePlanSelect({ name: "Premium", amount: 700 })
                }
              >
                Select & Pay
              </button>
            </div>

            <div className="pricing-plan">
              <h2 className="pricing-header">Premium +</h2>
              <ul className="pricing-features">
                <li className="pricing-features-item">
                  Everything in Premium, and
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
              <button
                className="pricing-button is-featured"
                onClick={() =>
                  handlePlanSelect({ name: "Premium+", amount: 1400 })
                }
              >
                Select & Pay
              </button>
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
