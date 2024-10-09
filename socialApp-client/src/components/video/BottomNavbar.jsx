import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faUserFriends, faInbox, faUser } from '@fortawesome/free-solid-svg-icons';
import "../../styles/bottom.css";

function BottomNavbar() {
  return (
    <div className="bottom-navbar">
      <Link to="/home" className="nav-item">
        <FontAwesomeIcon icon={faHouse} className="icon active" />
        <span className="item-name active">Home</span>
      </Link>
      <Link to="/friends" className="nav-item">
        <FontAwesomeIcon icon={faUserFriends} className="icon" />
        <span className="item-name">Friends</span>
      </Link>
      <Link to="/inbox" className="nav-item">
        <FontAwesomeIcon icon={faInbox} className="icon" />
        <span className="item-name">Inbox</span>
      </Link>
      <Link to="/profile" className="nav-item">
        <FontAwesomeIcon icon={faUser} className="icon" />
        <span className="item-name">Profile</span>
      </Link>
    </div>
  );
}

export default BottomNavbar;
