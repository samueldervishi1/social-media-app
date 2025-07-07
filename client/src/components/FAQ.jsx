import { useState, memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { faqs } from '../constants/faq';
import styles from '../styles/faq.module.css';

const FAQItem = memo(({ question, answer, isActive, onToggle }) => (
  <div className={styles.faq_item}>
    <div
      onClick={onToggle}
      className={styles.question}
      role='button'
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onToggle()}
      aria-expanded={isActive}
    >
      {isActive ? (
        <FaChevronUp className={`${styles.icon} ${styles.rotate}`} />
      ) : (
        <FaChevronDown className={styles.icon} />
      )}
      {question}
    </div>
    <div
      className={`${styles.answer} ${!isActive ? styles.answer_hidden : ''}`}
      aria-hidden={!isActive}
    >
      <p>{answer}</p>
    </div>
  </div>
));

FAQItem.displayName = 'FAQItem';
FAQItem.propTypes = {
  question: PropTypes.string.isRequired,
  answer: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

const ContactForm = memo(({ formState, onSubmit, onChange }) => (
  <div className={styles.form_container}>
    {formState.isSubmitted ? (
      <div className={styles.success_message} role='alert'>
        Thank you for your message! We will get back to you soon.
      </div>
    ) : (
      <form onSubmit={onSubmit}>
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
            onChange={onChange}
            placeholder='Enter your email'
            className={styles.form_input}
            aria-invalid={!!formState.error}
          />
          {formState.error && (
            <div className={styles.error_message} role='alert'>
              {formState.error}
            </div>
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
            onChange={onChange}
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
));

ContactForm.displayName = 'ContactForm';
ContactForm.propTypes = {
  formState: PropTypes.shape({
    isSubmitted: PropTypes.bool.isRequired,
    email: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    error: PropTypes.string.isRequired,
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [formState, setFormState] = useState({
    isSubmitted: false,
    email: '',
    message: '',
    error: '',
  });

  const toggleQuestion = useCallback(
    (index) => {
      setActiveIndex(activeIndex === index ? null : index);
    },
    [activeIndex]
  );

  const validateEmail = useCallback(
    (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    []
  );

  const handleFormSubmit = useCallback(
    (e) => {
      e.preventDefault();

      if (!validateEmail(formState.email)) {
        setFormState((prev) => ({
          ...prev,
          error: 'Please enter a valid email address.',
        }));
        return;
      }

      setFormState((prev) => ({ ...prev, isSubmitted: true, error: '' }));

      // Reset form after delay
      setTimeout(() => {
        setFormState({
          isSubmitted: false,
          email: '',
          message: '',
          error: '',
        });
      }, 2000);
    },
    [formState.email, validateEmail]
  );

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
      error: name === 'email' ? '' : prev.error,
    }));
  }, []);

  return (
    <div className={styles.faq_container}>
      <div className={styles.h1_container}>
        <h1>FAQ</h1>
      </div>

      <div className={styles.faq_card}>
        {faqs.map((faq, index) => (
          <FAQItem
            key={index}
            question={faq.question}
            answer={faq.answer}
            isActive={activeIndex === index}
            onToggle={() => toggleQuestion(index)}
          />
        ))}
      </div>

      <div className={styles.contact_section}>
        <h2 className={styles.contact_title}>Still have questions?</h2>
        <ContactForm
          formState={formState}
          onSubmit={handleFormSubmit}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
};

FAQ.displayName = 'FAQ';

export default memo(FAQ);
