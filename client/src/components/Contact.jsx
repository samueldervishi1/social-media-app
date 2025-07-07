import { memo } from 'react';
import PropTypes from 'prop-types';
import {
  FaInstagram,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
} from 'react-icons/fa';
import styles from '../styles/contact.module.css';

const CONTACT_INFO = {
  email: 'support@chattr.com',
  phone: '(123) 456-7890',
  address: '123 Chat Street, Digital City',
  instagram: 'https://www.instagram.com/samueldervishi_',
};

const ContactMethod = memo(({ Icon, title, content, href }) => (
  <div className={styles.contact_method}>
    <Icon className={styles.method_icon} />
    <h3>{title}</h3>
    {href ? (
      <a
        href={href}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel='noopener noreferrer'
      >
        {content}
      </a>
    ) : (
      <p>{content}</p>
    )}
  </div>
));

ContactMethod.displayName = 'ContactMethod';
ContactMethod.propTypes = {
  Icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  href: PropTypes.string,
};

const SocialLink = memo(({ Icon, platform, href }) => (
  <a
    href={href}
    target='_blank'
    rel='noopener noreferrer'
    className={styles.social_link}
    aria-label={`Follow us on ${platform}`}
  >
    <Icon className={styles.social_icon} />
    <span>{platform}</span>
  </a>
));

SocialLink.displayName = 'SocialLink';
SocialLink.propTypes = {
  Icon: PropTypes.elementType.isRequired,
  platform: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
};

const Contact = () => {
  const contactMethods = [
    {
      Icon: FaEnvelope,
      title: 'Email',
      content: CONTACT_INFO.email,
      href: `mailto:${CONTACT_INFO.email}`,
    },
    {
      Icon: FaPhone,
      title: 'Phone',
      content: CONTACT_INFO.phone,
    },
    {
      Icon: FaMapMarkerAlt,
      title: 'Location',
      content: CONTACT_INFO.address,
    },
  ];

  return (
    <div className={styles.contact_container}>
      <div className={styles.h1_container}>
        <h1>Contact Us</h1>
      </div>

      <div className={styles.contact_card}>
        <h2>We're here to help</h2>

        <div className={styles.contact_methods_container}>
          {contactMethods.map((method) => (
            <ContactMethod
              key={method.title}
              Icon={method.Icon}
              title={method.title}
              content={method.content}
              href={method.href}
            />
          ))}
        </div>

        <div className={styles.social_section}>
          <h3>Connect with us</h3>
          <div className={styles.social_icons}>
            <SocialLink
              Icon={FaInstagram}
              platform='Instagram'
              href={CONTACT_INFO.instagram}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

Contact.displayName = 'Contact';

export default memo(Contact);
