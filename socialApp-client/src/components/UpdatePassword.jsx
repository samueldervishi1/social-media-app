import React, { useState } from "react";

const UpdatePassword = () => {
    const [username, setUsername] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        const response = await fetch(`http://localhost:5000/api/v1/users/update-password?username=${username}&newPassword=${newPassword}`, {
            method: "PUT",
        });

        if (response.ok) {
            setMessage("Password updated successfully!");
        } else {
            const errorMessage = await response.text();
            setMessage(`Error: ${errorMessage}`);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Update Password</h2>
            <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
            />
            <button type="submit">Update Password</button>
            {message && <p>{message}</p>}
        </form>
    );
};

export default UpdatePassword;
