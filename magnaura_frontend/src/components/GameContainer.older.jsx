// src/components/GameContainer.jsx - Modified version
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
    });

    useEffect(() => {
        // Load level data
        fetchLevelData();
    }, [gameState.currentLevel]);

    const fetchLevelData = async () => {
        try {
            const response = await authFetch(`http://localhost:8000/api/get_level/?level=${gameState.currentLevel}`);
            const data = await response.json();

            if (response.ok) {
                setGameState(prev => ({
                    ...prev,
                    mapData: data.mapData,
                    playerPosition: data.startPosition,
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

        // Validate movement with backend
        try {
            const response = await authFetch('http://localhost:8000/api/move/', {
                method: 'POST',
                body: JSON.stringify({
                    level: gameState.currentLevel,
                    position: { x: newX, y: newY }
                })
            });

            const data = await response.json();

            if (response.ok && data.valid) {
                setGameState(prev => ({
                    ...prev,
                    playerPosition: { x: newX, y: newY },
                    activePuzzle: data.puzzle || null,
                    activeDialogue: data.dialogue || null,
                }));

                if (data.newItem) {
                    addToInventory(data.newItem);
                }

                if (data.wisdomGained) {
                    increaseWisdom(data.wisdomGained);
                }
            }
        } catch (error) {
            console.error('Movement error:', error);
        }
    };

    const handlePuzzleSolve = async (answer) => {
        try {
            const response = await authFetch('http://localhost:8000/api/solve_puzzle/', {
                method: 'POST',
                body: JSON.stringify({
                    puzzle: gameState.activePuzzle.id,
                    answer
                })
            });

            const data = await response.json();

            if (response.ok) {
                if (data.correct) {
                    setGameState(prev => ({
                        ...prev,
                        activePuzzle: null,
                        wisdom: prev.wisdom + data.wisdomGained
                    }));
                } else {
                    // Wrong answer feedback
                    setGameState(prev => ({
                        ...prev,
                        activePuzzle: {
                            ...prev.activePuzzle,
                            feedback: data.feedback
                        }
                    }));
                }
            }
        } catch (error) {
            console.error('Puzzle solve error:', error);
        }
    };

    const increaseWisdom = (amount) => {
        setGameState(prev => ({
            ...prev,
            wisdom: prev.wisdom + amount
        }));
    };

    if (gameState.isLoading) {
        return <div className="loading">Deciphering ancient texts...</div>;
    }

    return (
        <div className="game-container">
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
    );
};

export default GameContainer;