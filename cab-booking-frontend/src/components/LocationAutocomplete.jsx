import React, { useState, useEffect, useRef } from 'react';
import './LocationAutocomplete.css';

const API_URL = import.meta.env.VITE_API_URL;
const DEBOUNCE_DELAY = 400;

const LocationAutocomplete = ({ placeholder, value, onChange, onSelect }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const debounceTimer = useRef(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchSuggestions = async (query) => {
        if (query.trim().length < 3) {
            setSuggestions([]);
            setShowDropdown(false);
            return;
        }

        setLoading(true);
        try {
            const url = `${API_URL}/location/search?q=${encodeURIComponent(query)}`;
            const response = await fetch(url);
            const data = await response.json();
            setSuggestions(Array.isArray(data) ? data : []);
            setShowDropdown(true);
            setActiveIndex(-1);
        } catch (error) {
            console.error('Autocomplete error:', error);
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        onChange(val);

        clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            fetchSuggestions(val);
        }, DEBOUNCE_DELAY);
    };

    const handleKeyDown = (e) => {
        if (!showDropdown) return;

        if (e.key === 'ArrowDown') {
            setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === 'Enter') {
            if (activeIndex >= 0 && activeIndex < suggestions.length) {
                handleSelect(suggestions[activeIndex]);
            }
        } else if (e.key === 'Escape') {
            setShowDropdown(false);
        }
    };

    const handleSelect = (suggestion) => {
        const label = suggestion.display_name;
        const latLng = [parseFloat(suggestion.lat), parseFloat(suggestion.lon)];
        onSelect(label, latLng);
        setShowDropdown(false);
    };

    const highlightMatch = (text, query) => {
        if (!query) return text;
        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return parts.map((part, i) =>
            part.toLowerCase() === query.toLowerCase()
                ? <span key={i} className="highlight">{part}</span>
                : part
        );
    };

    return (
        <div className="autocomplete-wrapper" ref={dropdownRef}>
            <input
                type="text"
                className="autocomplete-field"
                placeholder={placeholder}
                value={value}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => value.length >= 3 && setShowDropdown(true)}
            />
            {loading && <div className="autocomplete-spinner"></div>}

            {showDropdown && (
                <ul className="suggestions-list">
                    {suggestions.length > 0 ? (
                        suggestions.map((item, index) => (
                            <li
                                key={item.place_id}
                                className={`suggestion-item ${index === activeIndex ? 'active' : ''}`}
                                onClick={() => handleSelect(item)}
                            >
                                <span className="location-icon">📍</span>
                                <div className="suggestion-content">
                                    <div className="main-text">
                                        {highlightMatch(item.display_name.split(',')[0], value)}
                                    </div>
                                    <div className="sub-text">{item.display_name}</div>
                                </div>
                            </li>
                        ))
                    ) : (
                        <li className="no-results">No results found</li>
                    )}
                </ul>
            )}
        </div>
    );
};

export default LocationAutocomplete;
