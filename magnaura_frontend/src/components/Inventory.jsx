// src/components/Inventory.jsx
import React, { useState } from 'react';
import './Inventory.css';

const Inventory = ({ items }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const toggleInventory = () => {
        setIsOpen(!isOpen);
        setSelectedItem(null);
    };

    const selectItem = (item) => {
        setSelectedItem(item);
    };

    return (
        <div className="inventory-container">
            <button
                className="inventory-toggle byzantine-button"
                onClick={toggleInventory}
            >
                {isOpen ? "Close Scrolls" : "Open Scrolls"} ({items.length})
            </button>

            {isOpen && (
                <div className="inventory-panel byzantine-scroll">
                    <h3>Your Collected Items</h3>

                    <div className="items-grid">
                        {items.length === 0 ? (
                            <p className="empty-message">Your satchel is empty. Find ancient items!</p>
                        ) : (
                            items.map((item, index) => (
                                <div
                                    key={index}
                                    className={`inventory-item ${selectedItem === item ? 'selected' : ''}`}
                                    onClick={() => selectItem(item)}
                                >
                                    <div className="item-icon">{item.icon || '📜'}</div>
                                    <div className="item-name">{item.name}</div>
                                </div>
                            ))
                        )}
                    </div>

                    {selectedItem && (
                        <div className="item-details">
                            <h4>{selectedItem.name}</h4>
                            <p>{selectedItem.description}</p>
                            {selectedItem.wisdomValue && (
                                <p className="wisdom-value">Wisdom: +{selectedItem.wisdomValue}</p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Inventory;