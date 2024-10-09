import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMusic } from "@fortawesome/free-solid-svg-icons";
import "./FooterLeft.css";

export default function FooterLeft(props) {
  const { username, description, song, tags } = props;

  return (
    <div className="footer-container">
      <div className="footer-left">
        <div className="text">
          <h3>@{username}</h3>
          <p>{description}</p>
          <div className="tags">
            {tags && tags.length > 0
              ? tags.map((tag, index) => (
                  <span key={index} className="tag">
                    #{tag}{" "}
                  </span>
                ))
              : null}
          </div>
          <div className="ticker">
            <FontAwesomeIcon icon={faMusic} style={{ width: "30px" }} />
            <span>{song}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
