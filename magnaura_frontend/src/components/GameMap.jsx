// // src/components/GameMap.jsx
// import React from 'react';
// import './GameMap.css';
//
// const GameMap = ({ mapData, playerPosition }) => {
//     // Cell types: 'wall', 'floor', 'scroll', 'relic', 'door', 'npc'
//     const renderCell = (cell, x, y) => {
//         const isPlayerHere = playerPosition.x === x && playerPosition.y === y;
//
//         let cellClass = `cell cell-${cell.type}`;
//         if (isPlayerHere) cellClass += ' cell-player';
//
//         return (
//             <div key={`${x}-${y}`} className={cellClass}>
//                 {isPlayerHere && <div className="player"></div>}
//                 {cell.type === 'scroll' && <div className="scroll-icon">📜</div>}
//                 {cell.type === 'relic' && <div className="relic-icon">🏺</div>}
//                 {cell.type === 'npc' && <div className="npc-icon">👤</div>}
//             </div>
//         );
//     };
//
//     return (
//         <div className="game-map byzantine-border">
//             {mapData.map((row, y) => (
//                 <div key={y} className="map-row">
//                     {row.map((cell, x) => renderCell(cell, x, y))}
//                 </div>
//             ))}
//         </div>
//     );
// };
//
// export default GameMap;

// src/components/GameMap.jsx
import React from 'react';
import './GameMap.css';

const GameMap = ({ mapData, playerPosition }) => {
    if (!mapData) return <div className="loading-map">Loading map...</div>;

    // Cell rendering function
    const renderCell = (cell, x, y) => {
        const isPlayerHere = playerPosition.x === x && playerPosition.y === y;

        let cellClass = `cell cell-${cell.type}`;
        if (isPlayerHere) cellClass += ' cell-player';

        return (
            <div key={`${x}-${y}`} className={cellClass}>
                {isPlayerHere && <div className="player-marker">🧙</div>}

                {/* Render different cell contents based on type */}
                {cell.type === 'wall' && <div className="wall-icon">🧱</div>}
                {cell.type === 'scroll' && <div className="scroll-icon">📜</div>}
                {cell.type === 'relic' && <div className="relic-icon">🏺</div>}
                {cell.type === 'door' && <div className="door-icon">🚪</div>}
                {cell.type === 'npc' && (
                    <div className="npc-icon">{cell.npcType === 'scholar' ? '👨‍🏫' : '🧙‍♂️'}</div>
                )}
            </div>
        );
    };

    return (
        <div className="game-map-container byzantine-border">
            <div className="game-map">
                {mapData.map((row, y) => (
                    <div key={y} className="map-row">
                        {row.map((cell, x) => renderCell(cell, x, y))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GameMap;