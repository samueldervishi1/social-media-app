import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { faqs } from '../constants/faq';
import styles from '../styles/faq.module.css';

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

  return (
    <div className={styles.faq_container}>
      <div className={styles.h1_container}>
        <h1>FAQ</h1>
      </div>

      <div className={styles.faq_card}>
        {faqs.map((faq, index) => (
          <div key={index} className={styles.faq_item}>
            <div
              onClick={() => toggleQuestion(index)}
              className={styles.question}
            >
              {activeIndex === index ? (
                <FaChevronUp className={`${styles.icon} ${styles.rotate}`} />
              ) : (
                <FaChevronDown className={styles.icon} />
              )}
              {faq.question}
            </div>
            <div
              className={`${styles.answer} ${
                activeIndex !== index ? styles.answer_hidden : ''
              }`}
            >
              <p>{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.contact_section}>
        <h2 className={styles.contact_title}>Still have questions?</h2>
        <div className={styles.form_container}>
          {formState.isSubmitted ? (
            <div className={styles.success_message}>
              Thank you for your message! We will get back to you soon.
            </div>
          ) : (
            <form onSubmit={handleFormSubmit}>
              <div className={styles.form_group}>
                <label htmlFor='email' className={styles.form_label}>
                  Email address
                </label>
                <input
                  id='email'
                  name='email'
                  type='email'
                  required
                  value={formState.email}
                  onChange={handleInputChange}
                  placeholder='Enter your email'
                  className={styles.form_input}
                />
                {formState.error && (
                  <div className={styles.error_message}>{formState.error}</div>
                )}
              </div>
              <div className={styles.form_group}>
                <label htmlFor='message' className={styles.form_label}>
                  Message
                </label>
                <textarea
                  id='message'
                  name='message'
                  rows='4'
                  required
                  value={formState.message}
                  onChange={handleInputChange}
                  placeholder='Enter your message'
                  className={styles.form_input}
                />
              </div>
              <button type='submit' className={styles.submit_button}>
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default FAQ;