// src/components/Register.jsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './Login.css'; // Reuse the same styles

const Register = ({ onSuccess, switchToLogin }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useContext(AuthContext);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            const userData = {
                username: formData.username,
                email: formData.email,
                password: formData.password
            };

            await register(userData);
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.message || 'Failed to register. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container byzantine-scroll">
            <h2>Join the Magnaura School</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username">Scholar Name</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="byzantine-input"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Scholar Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="byzantine-input"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Create Secret Scroll Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="byzantine-input"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Secret Scroll Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="byzantine-input"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="byzantine-button"
                    disabled={isLoading}
                >
                    {isLoading ? "Creating Scholar..." : "Join the School"}
                </button>
            </form>
            <div className="auth-switch">
                <p>Already a scholar? <button className="text-button" onClick={switchToLogin}>Login</button></p>
            </div>
        </div>
    );
};

export default Register;