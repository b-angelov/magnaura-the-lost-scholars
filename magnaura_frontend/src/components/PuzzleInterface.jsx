// src/components/PuzzleInterface.jsx
import React, { useState } from 'react';
import './PuzzleInterface.css';

const PuzzleInterface = ({ puzzle, onSolve }) => {
    const [answer, setAnswer] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSolve(answer);
    };

    return (
        <>
            {gameState.activePuzzle && (
                <div className="puzzle-overlay">
                    <PuzzleInterface
                        puzzle={gameState.activePuzzle}
                        onSolve={handlePuzzleSolve}
                    />
                </div>
            )}



        <div className="puzzle-overlay">
            <div className="puzzle-container byzantine-scroll">
                <h3>{puzzle.title}</h3>
                <div className="puzzle-description">
                    <p>{puzzle.description}</p>
                    {puzzle.image && <img src={puzzle.image} alt="Puzzle clue" />}
                </div>

                {puzzle.type === 'text' && (
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Enter your answer..."
                            className="byzantine-input"
                        />
                        <button type="submit" className="byzantine-button">Submit Answer</button>
                    </form>
                )}

                {puzzle.type === 'choice' && (
                    <div className="choices">
                        {puzzle.choices.map((choice, index) => (
                            <button
                                key={index}
                                onClick={() => onSolve(choice)}
                                className="byzantine-button choice-button"
                            >
                                {choice}
                            </button>
                        ))}
                    </div>
                )}

                {puzzle.feedback && (
                    <div className={`feedback ${puzzle.correct ? 'correct' : 'incorrect'}`}>
                        {puzzle.feedback}
                    </div>
                )}
            </div>
        </div>
    </>);
};

export default PuzzleInterface;