import React, { useState } from 'react';
import { FaPlus, FaMinus } from 'react-icons/fa';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [formState, setFormState] = useState({
    isSubmitted: false,
    email: '',
    message: '',
    error: '',
  });

  const faqs = [
    {
      question: 'What are the main features of CHYRA?',
      answer:
        'CHYRA offers text posts, images, videos, group creation, topic following, and robust privacy controls to ensure a personalized and safe experience for its users.',
    },
    {
      question: 'How can I create and join communities on CHYRA?',
      answer:
        'On CHYRA, users can create communities based on shared interests and join existing communities to participate in discussions and connect with other members.',
    },
    {
      question: 'Can I follow topics on CHYRA?',
      answer:
        'Yes, CHYRA allows users to follow topics of interest, ensuring that your content feed is tailored to your preferences.',
    },
    {
      question: 'How does CHYRA foster a culture of kindness and respect?',
      answer:
        'By promoting healthy interactions, discouraging harmful behavior, and encouraging users to engage in thoughtful conversations, CHYRA ensures a supportive and positive environment.',
    },
    {
      question: 'How does CHYRA protect my privacy?',
      answer:
        'CHYRA employs cutting-edge security measures to protect your personal data and gives you full control over your information and privacy settings.',
    },
    {
      question: 'What security measures does CHYRA have in place?',
      answer:
        'CHYRA utilizes advanced encryption and data protection techniques to ensure the safety of your personal information and prevent unauthorized access.',
    },
    {
      question: 'Can I control who sees my posts on CHYRA?',
      answer:
        'Yes, CHYRA provides robust privacy controls that allow you to manage who can view your posts and personal information.',
    },
  ];

  const toggleQuestion = (index) =>
    setActiveIndex(activeIndex === index ? null : index);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!validateEmail(formState.email)) {
      setFormState((prev) => ({
        ...prev,
        error: 'Please enter a valid email address.',
      }));
      return;
    }

    setFormState((prev) => ({ ...prev, isSubmitted: true }));

    setTimeout(() => {
      setFormState({
        isSubmitted: false,
        email: '',
        message: '',
        error: '',
      });
    }, 2000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const styles = {
    container: {
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '20px',
    },
    faqItem: {
      marginBottom: '20px',
      borderBottom: '1px solid #ddd',
      paddingBottom: '15px',
    },
    question: {
      cursor: 'pointer',
      fontWeight: 'bold',
      color: '#007bff',
      marginBottom: '5px',
      display: 'flex',
      alignItems: 'center',
    },
    answer: {
      maxHeight: '200px',
      overflow: 'hidden',
      paddingLeft: '20px',
      transition: 'max-height 0.3s ease-in-out',
    },
    answerHidden: {
      maxHeight: 0,
    },
    form: {
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      padding: '20px',
      width: '100%',
      margin: '0 auto',
    },
    input: {
      width: '100%',
      padding: '10px',
      marginBottom: '10px',
      borderRadius: '5px',
      border: '1px solid #ccc',
    },
    button: {
      width: '100%',
      padding: '10px',
      backgroundColor: '#007bff',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
    },
  };

  return (
    <div style={styles.container}>
      <section>
        <div>
          <h2>FAQ</h2>
          {faqs.map((faq, index) => (
            <div key={index} style={styles.faqItem}>
              <p onClick={() => toggleQuestion(index)} style={styles.question}>
                {activeIndex === index ? (
                  <FaMinus style={{ marginRight: '10px' }} />
                ) : (
                  <FaPlus style={{ marginRight: '10px' }} />
                )}
                {faq.question}
              </p>
              <div
                style={{
                  ...styles.answer,
                  ...(activeIndex !== index && styles.answerHidden),
                }}
              >
                <p style={{ color: '#555' }}>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '40px' }}>
          <h3>Still have questions? Contact us!</h3>
          <div style={styles.form}>
            {formState.isSubmitted ? (
              <div style={{ color: 'green', fontWeight: 'bold' }}>
                Thank you for your message! We will get back to you soon.
              </div>
            ) : (
              <form onSubmit={handleFormSubmit}>
                <div>
                  <label htmlFor='email'>Email address:</label>
                  <input
                    id='email'
                    name='email'
                    type='email'
                    required
                    value={formState.email}
                    onChange={handleInputChange}
                    placeholder='Enter your email'
                    style={styles.input}
                  />
                  {formState.error && (
                    <div style={{ color: 'red', fontSize: '12px' }}>
                      {formState.error}
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor='message'>Message:</label>
                  <textarea
                    id='message'
                    name='message'
                    rows='4'
                    required
                    value={formState.message}
                    onChange={handleInputChange}
                    placeholder='Enter your message'
                    style={styles.input}
                  />
                </div>
                <button type='submit' style={styles.button}>
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

export default FAQ;