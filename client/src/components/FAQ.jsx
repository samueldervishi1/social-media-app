import React, { useState } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";

const FAQWithCollapsibleAnswers = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const faqs = [
    {
      question: "What are the main features of CHYRA?",
      answer:
        "CHYRA offers text posts, images, videos, group creation, topic following, and robust privacy controls to ensure a personalized and safe experience for its users.",
    },
    {
      question: "How can I create and join communities on CHYRA?",
      answer:
        "On CHYRA, users can create communities based on shared interests and join existing communities to participate in discussions and connect with other members.",
    },
    {
      question: "Can I follow topics on CHYRA?",
      answer:
        "Yes, CHYRA allows users to follow topics of interest, ensuring that your content feed is tailored to your preferences.",
    },
    {
      question: "How does CHYRA foster a culture of kindness and respect?",
      answer:
        "By promoting healthy interactions, discouraging harmful behavior, and encouraging users to engage in thoughtful conversations, CHYRA ensures a supportive and positive environment.",
    },
    {
      question: "How does CHYRA protect my privacy?",
      answer:
        "CHYRA employs cutting-edge security measures to protect your personal data and gives you full control over your information and privacy settings.",
    },
    {
      question: "What security measures does CHYRA have in place?",
      answer:
        "CHYRA utilizes advanced encryption and data protection techniques to ensure the safety of your personal information and prevent unauthorized access.",
    },
    {
      question: "Can I control who sees my posts on CHYRA?",
      answer:
        "Yes, CHYRA provides robust privacy controls that allow you to manage who can view your posts and personal information.",
    },
  ];

  const handleQuestionClick = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsFormSubmitted(true);

    setTimeout(() => {
      setEmail("");
      setMessage("");
      setIsFormSubmitted(false);
      window.location.reload();
    }, 2000);
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
      <section>
        <div>
          <h2>FAQ</h2>
          {faqs.map((faq, index) => (
            <div
              key={index}
              style={{
                marginBottom: "20px",
                borderBottom: "1px solid #ddd",
                paddingBottom: "15px",
              }}
            >
              <p
                onClick={() => handleQuestionClick(index)}
                style={{
                  cursor: "pointer",
                  fontWeight: "bold",
                  color: "#007bff",
                  marginBottom: "5px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {activeIndex === index ? (
                  <FaMinus style={{ marginRight: "10px" }} />
                ) : (
                  <FaPlus style={{ marginRight: "10px" }} />
                )}
                {faq.question}
              </p>
              <div
                style={{
                  maxHeight: activeIndex === index ? "200px" : "0",
                  overflow: "hidden",
                  paddingLeft: "20px",
                }}
              >
                <p style={{ color: "#555" }}>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "40px" }}>
          <h3>Still have questions? Contact us!</h3>
          <div
            style={{
              backgroundColor: "#f9f9f9",
              borderRadius: "8px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              padding: "20px",
              width: "100%",
              margin: "0 auto",
            }}
          >
            {isFormSubmitted ? (
              <div style={{ color: "green", fontWeight: "bold" }}>
                Thank you for your message! We will get back to you soon.
              </div>
            ) : (
              <form onSubmit={handleFormSubmit}>
                <div style={{ marginBottom: "10px" }}>
                  <label
                    htmlFor="email"
                    style={{ display: "block", marginBottom: "5px" }}
                  >
                    Email address:
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    style={{
                      width: "100%",
                      padding: "10px",
                      marginBottom: "10px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                    }}
                  />
                  {error && (
                    <div style={{ color: "red", fontSize: "12px" }}>
                      {error}
                    </div>
                  )}
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <label
                    htmlFor="message"
                    style={{ display: "block", marginBottom: "5px" }}
                  >
                    Message:
                  </label>
                  <textarea
                    id="message"
                    rows="4"
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your message"
                    style={{
                      width: "100%",
                      padding: "10px",
                      marginBottom: "10px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                    }}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                  }}
                >
                  Send
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQWithCollapsibleAnswers;