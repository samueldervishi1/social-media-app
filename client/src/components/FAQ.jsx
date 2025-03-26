import React, { useState } from 'react';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import background from '../assets/background.jpg';
import faqData from '../assets/faq.json';

const token = localStorage.getItem('token');

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [formState, setFormState] = useState({
    isSubmitted: false,
    email: '',
    message: '',
    error: '',
  });

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

    setFormState((prev) => ({ ...prev, isSubmitted: true, error: '' }));

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
    setFormState((prev) => ({
      ...prev,
      [name]: value,
      error: name === 'email' ? '' : prev.error,
    }));
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
      color: 'black',
    },
    answerHidden: {
      maxHeight: 0,
      color: 'black',
    },
    form: {
      backgroundColor: 'white',
      color: 'black',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgb(2, 2, 2)',
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
      backgroundColor: 'white',
      color: 'black',
    },
    button: {
      width: '100%',
      padding: '10px',
      backgroundColor: '#007bff',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      '&:hover': {
        backgroundColor: '#0056b3',
      },
    },
    title: {
      textAlign: 'center',
      margin: '0 auto 40px auto',
      backgroundImage: `url(${background})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      padding: '40px',
      borderRadius: '4px',
      fontSize: 70,
      fontWeight: 700,
    },
    successMessage: {
      color: 'green',
      fontWeight: 'bold',
      textAlign: 'center',
    },
    errorMessage: {
      color: 'red',
      fontSize: '12px',
    },
  };

  return (
    <div style={styles.container}>
      {!token && (
        <div className={styles.login_link}>
          <Link to='/login'>Login to get started</Link>
        </div>
      )}
      <section>
        <div>
          <h2 style={styles.title}>FAQ</h2>
          {faqData.map((faq, index) => (
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
                <p style={{ color: 'black' }}>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '40px' }}>
          <h3 style={{ textAlign: 'center', color: 'white' }}>
            Still have questions? Contact us!
          </h3>
          <div style={styles.form}>
            {formState.isSubmitted ? (
              <div style={styles.successMessage}>
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
                    <div style={styles.errorMessage}>{formState.error}</div>
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