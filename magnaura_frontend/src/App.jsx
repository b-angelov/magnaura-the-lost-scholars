// src/App.jsx
import React, { useState, useEffect, useContext } from 'react';
import GameContainer from './components/GameContainer';
import Login from './components/Login';
import { AuthContext, AuthProvider } from './context/AuthContext';
import './App.css';
import Register from "./components/Register.jsx";

// Main App Component
const AppContent = () => {
    const { auth } = useContext(AuthContext);
    const { authFetch } = useContext(AuthContext);
    const [authMode, setAuthMode] = useState('login');
    const [gameState, setGameState] = useState({
        isLoading: true,
        isGameStarted: false,
        playerData: null,
    });

    useEffect(() => {
        if (auth.isAuthenticated) {
            fetchGameData();
        } else {
            setGameState({
                isLoading: false,
                isGameStarted: false
            });
        }
    }, [auth.isAuthenticated]);

    const fetchGameData = async () => {
        try {
            const response = await authFetch('http://localhost:8000/api/start_game/', {
                method: 'POST',  // Change to POST request
                // Include any data if required by your backend
                // body: JSON.stringify({ /* any data needed */ })
            });
            const data = await response.json();

            if (response.ok) {
                setGameState({
                    isLoading: false,
                    isGameStarted: true,
                    playerData: data.playerData,
                });
            } else {
                throw new Error(data.detail || 'Failed to start game');
            }
        } catch (error) {
            console.error('Failed to initialize game:', error);
            setGameState({
                isLoading: false,
                isGameStarted: false,
                error: 'Failed to connect to the game server'
            });
        }
    };

    if (!auth.isAuthenticated) {
        return authMode === 'login' ? (
            <Login
                onSuccess={() => setGameState({ isLoading: true })}
                switchToRegister={() => setAuthMode('register')}
            />
        ) : (
            <Register
                onSuccess={() => setAuthMode('login')}
                switchToLogin={() => setAuthMode('login')}
            />
        );
    }

    return (
        <div className="app">
            <header className="app-header">
                <h1>Magnaura: The Lost Scholars</h1>
            </header>
            {gameState.isLoading ? (
                <div className="loading">Loading the ancient scrolls...</div>
            ) : gameState.isGameStarted ? (
                <GameContainer playerData={gameState.playerData} />
            ) : (
                <div className="start-screen">
                    <h2>Welcome to the Magnaura School</h2>
                    <button onClick={fetchGameData} className="byzantine-button">
                        Begin Your Scholar's Journey
                    </button>
                    {gameState.error && <p className="error">{gameState.error}</p>}
                </div>
            )}
        </div>
    );
};

// Wrap with AuthProvider
function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;