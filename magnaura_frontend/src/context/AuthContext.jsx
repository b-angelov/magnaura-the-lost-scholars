// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Safely parse user data from localStorage
    const getUserFromStorage = () => {
        try {
            const userData = localStorage.getItem('user');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error parsing user data from localStorage:', error);
            // Clear invalid data
            localStorage.removeItem('user');
            return null;
        }
    };

    const [auth, setAuth] = useState({
        token: localStorage.getItem('authToken') || null,
        user: getUserFromStorage(),
        isAuthenticated: !!localStorage.getItem('authToken')
    });

    // Add this function to the AuthProvider component before the return statement
    const authFetch = async (url, options = {}) => {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (auth.token) {
            headers['Authorization'] = `Token ${auth.token}`;
        }

        return fetch(url, {
            ...options,
            headers
        });
    };


    // Login function
    const login = async (username, password) => {
        try {
            const response = await fetch('http://localhost:8000/api/auth/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.detail || 'Login failed');

            // Save to state and localStorage
            const authData = {
                token: data.token,
                user: data.user,
                isAuthenticated: true
            };

            setAuth(authData);
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    // Register function
    const register = async (userData) => {
        try {
            const response = await fetch('http://localhost:8000/api/auth/register/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.detail || 'Registration failed');

            return data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    };

    // Logout function
    const logout = async () => {
        try {
            if (auth.token) {
                await fetch('http://localhost:8000/api/auth/logout/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${auth.token}`
                    }
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear authentication data
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setAuth({ token: null, user: null, isAuthenticated: false });
        }
    };

    return (
        <AuthContext.Provider value={{ auth, login, logout, register, authFetch }}>
            {children}
        </AuthContext.Provider>
    );
};