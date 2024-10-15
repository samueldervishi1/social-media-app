import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../styles/search.css";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [showNoResults, setShowNoResults] = useState(false);
  const searchBarRef = useRef(null);

  const searchUsers = async (username) => {
    if (!username) {
      setResults([]);
      setShowNoResults(false);
      return;
    }
    try {
      const response = await axios.get(
        `http://localhost:5000/api/v2/search/users?username=${username}`
      );
      const data = response.data;
      if (data.length === 0) {
        setShowNoResults(true);
      } else {
        setResults(data);
        setShowNoResults(false); 
      }
    } catch (error) {
      console.error("Error searching users: ", error.message);
      setResults([]);
      setShowNoResults(true);
    }
  };

  useEffect(() => {
    if (query.trim() === "") {
      setShowDropdown(false);
      return;
    }

    if (typingTimeout) clearTimeout(typingTimeout);

    const timeout = setTimeout(() => {
      searchUsers(query);
      setShowDropdown(true);
    }, 0); // No delay

    setTypingTimeout(timeout);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="search-bar-container" ref={searchBarRef}>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowDropdown(true)}
        />
      </div>

      {showDropdown && (
        <div className="drp">
          {showNoResults ? (
            <p className="drp-hld">Nothing found</p>
          ) : results.length === 0 ? (
            <p className="drp-hld">Search for friends and more...</p>
          ) : (
            <ul className="drp-rsl">
              {results.map((user) => (
                <li key={user.id} className="drp-t">
                  {user.username}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
