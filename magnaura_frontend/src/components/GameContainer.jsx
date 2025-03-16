// src/components/GameContainer.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import GameMap from './GameMap';
import DialogueBox from './DialogueBox';
import PuzzleInterface from './PuzzleInterface';
import WisdomMeter from './WisdomMeter';
import Inventory from './Inventory';
import './GameContainer.css';

const GameContainer = ({ playerData }) => {
    const { authFetch } = useContext(AuthContext);
    const [gameState, setGameState] = useState({
        currentLevel: 1,
        playerPosition: { x: 0, y: 0 },
        mapData: null,
        activePuzzle: null,
        activeDialogue: null,
        wisdom: 0,
        inventory: [],
        isLoading: true,
        currentRoom: null,
        message: null
    });

    // Fix the initialization flow in GameContainer.jsx
    useEffect(() => {
        // Initial game setup
        startGame();
    }, []);

// Modified startGame function
    const startGame = async () => {
        try {
            const response = await authFetch('http://localhost:8000/api/start_game/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            });

            const data = await response.json();

            if (response.ok) {
                const { room } = data;
                setGameState(prev => ({
                    ...prev,
                    currentRoom: room,
                    playerPosition: { x: room.x_coordinate, y: room.y_coordinate },
                    // Don't set isLoading to false here yet
                }));

                // Immediately fetch level data after starting the game
                const levelResponse = await authFetch(`http://localhost:8000/api/get_level/?level=1`);
                const levelData = await levelResponse.json();

                if (levelResponse.ok) {
                    setGameState(prev => ({
                        ...prev,
                        currentLevel: 1,
                        mapData: levelData.mapData,
                        playerPosition: {
                            x: room.x_coordinate,
                            y: room.y_coordinate
                        },
                        isLoading: false // Now set loading to false
                    }));
                } else {
                    throw new Error(levelData.detail || 'Failed to load level');
                }
            } else {
                throw new Error(data.detail || 'Failed to start game');
            }
        } catch (error) {
            console.error('Failed to start game:', error);
            // Set loading to false even on error, maybe show an error message
            setGameState(prev => ({
                ...prev,
                isLoading: false,
                error: error.message
            }));
        }
    };

    const fetchLevelData = async () => {
        try {
            const response = await authFetch(`http://localhost:8000/api/get_level/?level=${gameState.currentLevel}`);
            const data = await response.json();

            if (response.ok) {
                setGameState(prev => ({
                    ...prev,
                    mapData: data.mapData,
                    playerPosition: {
                        x: prev.currentRoom?.x_coordinate || data.startPosition.x,
                        y: prev.currentRoom?.y_coordinate || data.startPosition.y
                    },
                    isLoading: false
                }));
            } else {
                throw new Error(data.detail || 'Failed to load level');
            }
        } catch (error) {
            console.error('Failed to load level data:', error);
        }
    };

    const handleMovement = async (direction) => {
        const { x, y } = gameState.playerPosition;
        let newX = x, newY = y;

        switch (direction) {
            case 'up': newY = y - 1; break;
            case 'down': newY = y + 1; break;
            case 'left': newX = x - 1; break;
            case 'right': newX = x + 1; break;
            default: break;
        }

        try {
            setGameState(prev => ({
                ...prev,
                message: null // Clear previous messages
            }));

            const response = await authFetch('http://localhost:8000/api/move/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    position: { x: newX, y: newY }
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Update with room information from API
                setGameState(prev => ({
                    ...prev,
                    currentRoom: data.room,
                    playerPosition: { x: data.room.x_coordinate, y: data.room.y_coordinate },
                    message: data.message || "Moved successfully"
                }));

                // Check for puzzles in the new room
                fetchPuzzlesInRoom();
            } else {
                // Display error message to the user
                setGameState(prev => ({
                    ...prev,
                    message: data.message || "Movement failed"
                }));
                console.error('Movement error:', data.message || 'Failed to move');
            }
        } catch (error) {
            console.error('Movement error:', error);
            setGameState(prev => ({
                ...prev,
                message: "Error connecting to server"
            }));
        }
    };

    const fetchPuzzlesInRoom = async () => {
        try {
            const response = await authFetch('http://localhost:8000/api/get_puzzle/');
            const data = await response.json();

            if (response.ok && data.puzzles && data.puzzles.length > 0) {
                setGameState(prev => ({
                    ...prev,
                    activePuzzle: data.puzzles[0]
                }));
            }
        } catch (error) {
            console.error('Failed to fetch puzzles:', error);
        }
    };

    const handlePuzzleSolve = async (answer) => {
        try {
            console.log("Attempting to solve puzzle:", gameState.activePuzzle.id, "with answer:", answer);

            const response = await authFetch('http://localhost:8000/api/solve_puzzle/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    puzzle_id: gameState.activePuzzle.id,
                    answer
                })
            });

            const data = await response.json();
            console.log("Puzzle solve response:", data);

            if (response.ok) {
                if (data.success) {
                    setGameState(prev => ({
                        ...prev,
                        activePuzzle: null,
                        wisdom: data.wisdom_points, // Use the new total from server
                        message: `Correct! ${data.message}`
                    }));
                } else {
                    // Wrong answer feedback
                    setGameState(prev => ({
                        ...prev,
                        message: data.message,
                        activePuzzle: {
                            ...prev.activePuzzle,
                            feedback: data.message
                        }
                    }));
                }
            }
        } catch (error) {
            console.error('Puzzle solve error:', error);
            setGameState(prev => ({
                ...prev,
                message: "Failed to submit answer"
            }));
        }
    };

    // Helper function to add items to inventory
    const addToInventory = (item) => {
        setGameState(prev => ({
            ...prev,
            inventory: [...prev.inventory, item]
        }));
    };

    if (gameState.isLoading) {
        return <div className="loading">Deciphering ancient texts...</div>;
    }

    const mess = (gameState.message && (<><div className="game-message">{gameState.message}</div></>))

    return (
        <>
        {mess}
        <div className="game-container">
            {gameState.currentRoom && (
                <div className="room-info">
                    <h2>{gameState.currentRoom.name}</h2>
                    <p>{gameState.currentRoom.description}</p>
                </div>
            )}

            <div className="game-interface">
                <WisdomMeter value={gameState.wisdom} />

                <GameMap
                    mapData={gameState.mapData}
                    playerPosition={gameState.playerPosition}
                />

                <div className="controls">
                    <button onClick={() => handleMovement('up')}>Up</button>
                    <button onClick={() => handleMovement('down')}>Down</button>
                    <button onClick={() => handleMovement('left')}>Left</button>
                    <button onClick={() => handleMovement('right')}>Right</button>
                </div>

                <Inventory items={gameState.inventory} />
            </div>

            {gameState.activePuzzle && (
                <PuzzleInterface
                    puzzle={gameState.activePuzzle}
                    onSolve={handlePuzzleSolve}
                />
            )}

            {gameState.activeDialogue && (
                <DialogueBox
                    dialogue={gameState.activeDialogue}
                    onClose={() => setGameState(prev => ({ ...prev, activeDialogue: null }))}
                />
            )}
        </div>
            </>
    );
};

export default GameContainer;