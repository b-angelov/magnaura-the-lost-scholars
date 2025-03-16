// src/components/DialogueBox.jsx
import React from 'react';
import './DialogueBox.css';

const DialogueBox = ({ dialogue, onClose }) => {
    return (
        <div className="dialogue-overlay">
            <div className="dialogue-container byzantine-scroll">
                <div className="dialogue-header">
                    <h3>{dialogue.speakerName}</h3>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                <div className="dialogue-content">
                    {dialogue.speakerImage && (
                        <div className="speaker-portrait">
                            <img src={dialogue.speakerImage} alt={dialogue.speakerName} />
                        </div>
                    )}
                    <div className="dialogue-text">
                        <p>{dialogue.text}</p>

                        {dialogue.choices && (
                            <div className="dialogue-choices">
                                {dialogue.choices.map((choice, index) => (
                                    <button
                                        key={index}
                                        className="byzantine-button choice-button"
                                        onClick={() => choice.action && choice.action()}
                                    >
                                        {choice.text}
                                    </button>
                                ))}
                            </div>
                        )}

                        {!dialogue.choices && (
                            <button
                                className="byzantine-button continue-button"
                                onClick={onClose}
                            >
                                Continue
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DialogueBox;