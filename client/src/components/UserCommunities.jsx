import React, { useState, useEffect } from "react";
import axios from "axios";
import { getUserIdFromToken } from "../auth/authUtils";

const UserCommunities = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCommunities = async () => {
      const userId = getUserIdFromToken();

      if (!userId) {
        setError("User ID not found in token.");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:8080/api/v2/communities/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCommunities(response.data);
      } catch (err) {
        setError("Failed to fetch communities.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2 style={{ textAlign: "center", marginTop: 10 }}>Your Communities</h2>
      <div style={styles.container}>
        {communities.length > 0 ? (
          communities.map((community) => (
            <div key={`${community.id}-${community.name}`} style={styles.card}>
              <h3>{community.name}</h3>
              <p>{community.description}</p>
              <small>Members: {community.userIds.length}</small>
            </div>
          ))
        ) : (
          <div>You are not part of any communities.</div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    padding: "20px",
    textAlign: "center",
  },
  card: {
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "15px",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#fff",
  },
};

export default UserCommunities;