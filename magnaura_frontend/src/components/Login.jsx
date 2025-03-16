// src/components/Login.jsx - Updated
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './Login.css';

const Login = ({ onSuccess, switchToRegister }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useContext(AuthContext);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await login(formData.username, formData.password);
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.message || 'Failed to login. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container byzantine-scroll">
            <h2>Enter the Magnaura School</h2>
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
                    <label htmlFor="password">Secret Scroll Password</label>
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
                <button
                    type="submit"
                    className="byzantine-button"
                    disabled={isLoading}
                >
                    {isLoading ? "Authenticating..." : "Enter the School"}
                </button>
            </form>
            <div className="auth-switch">
                <p>New scholar? <button className="text-button" onClick={switchToRegister}>Register</button></p>
            </div>
        </div>
    );
};

export default Login;