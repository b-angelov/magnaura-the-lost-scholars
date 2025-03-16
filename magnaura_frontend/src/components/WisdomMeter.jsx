// src/components/WisdomMeter.jsx
import React from 'react';
import './WisdomMeter.css';

const WisdomMeter = ({ value }) => {
    // Calculate percentage (assuming 100 is max wisdom)
    const percentage = Math.min(Math.max(value, 0), 100);

    // Wisdom levels
    const getWisdomLevel = () => {
        if (percentage < 20) return "Novice";
        if (percentage < 40) return "Apprentice";
        if (percentage < 60) return "Scholar";
        if (percentage < 80) return "Sage";
        return "Master";
    };

    return (
        <div className="wisdom-meter">
            <h3>Wisdom</h3>
            <div className="meter-container">
                <div
                    className="meter-fill"
                    style={{ width: `${percentage}%` }}
                ></div>
                <div className="meter-label">{getWisdomLevel()}</div>
            </div>
            <div className="wisdom-value">{value}/100</div>
        </div>
    );
};

export default WisdomMeter;