import React, { useState, useEffect, useRef, useCallback } from 'react';
import './LocationAutocomplete.css';

const rawAPI = import.meta.env.VITE_API_URL || "";
const API_URL = rawAPI.endsWith("/api") ? rawAPI : `${rawAPI}/api`;
const DEBOUNCE_DELAY = 400;

const LocationAutocomplete = ({ placeholder, value, onChange, onSelect }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [error, setError] = useState("");
    const debounceTimer = useRef(null);
    const dropdownRef = useRef(null);
    const listRef = useRef(null);
    const inputRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Scroll the active item into view when navigating with arrow keys
    useEffect(() => {
        if (activeIndex >= 0 && listRef.current) {
            const activeEl = listRef.current.querySelector('.suggestion-item.active');
            if (activeEl) {
                activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }, [activeIndex]);

    const fetchSuggestions = useCallback(async (query) => {
        if (query.trim().length < 3) {
            setSuggestions([]);
            setShowDropdown(false);
            setError("");
            return;
        }

        setLoading(true);
        setError("");
        try {
            const url = `${API_URL}/location/search?q=${encodeURIComponent(query)}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            const results = Array.isArray(data) ? data : [];
            setSuggestions(results);
            setShowDropdown(true);
            setActiveIndex(-1);
        } catch (err) {
            console.error('Autocomplete error:', err);
            setSuggestions([]);
            setError("Unable to fetch suggestions. Please try again.");
            setShowDropdown(true);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleInputChange = (e) => {
        const val = e.target.value;
        onChange(val);
        setError("");

        clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            fetchSuggestions(val);
        }, DEBOUNCE_DELAY);
    };

    const handleKeyDown = (e) => {
        if (!showDropdown || suggestions.length === 0) {
            if (e.key === 'Escape') setShowDropdown(false);
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
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
        setSuggestions([]);
        setShowDropdown(false);
        setActiveIndex(-1);
    };

    // Escape special regex characters to prevent errors
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const highlightMatch = (text, query) => {
        if (!query || query.trim().length < 1) return text;
        try {
            const escaped = escapeRegex(query.trim());
            const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
            return parts.map((part, i) =>
                part.toLowerCase() === query.trim().toLowerCase()
                    ? <span key={i} className="highlight">{part}</span>
                    : part
            );
        } catch {
            return text;
        }
    };

    const handleFocus = () => {
        if (suggestions.length > 0) {
            setShowDropdown(true);
        } else if (value.length >= 3) {
            fetchSuggestions(value);
        }
    };

    // Clean up debounce timer on unmount
    useEffect(() => {
        return () => clearTimeout(debounceTimer.current);
    }, []);

    return (
        <div className="autocomplete-wrapper" ref={dropdownRef}>
            <input
                ref={inputRef}
                type="text"
                className="autocomplete-field"
                placeholder={placeholder}
                value={value}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                autoComplete="off"
                role="combobox"
                aria-expanded={showDropdown}
                aria-haspopup="listbox"
                aria-autocomplete="list"
                aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
            />
            {loading && <div className="autocomplete-spinner"></div>}

            {showDropdown && (
                <ul className="suggestions-list" ref={listRef} role="listbox">
                    {error ? (
                        <li className="no-results error-result">
                            <span className="error-icon">⚠️</span> {error}
                        </li>
                    ) : suggestions.length > 0 ? (
                        suggestions.map((item, index) => {
                            const mainName = item.display_name.split(',')[0];
                            const subText = item.display_name.split(',').slice(1).join(',').trim();
                            return (
                                <li
                                    id={`suggestion-${index}`}
                                    key={item.place_id || index}
                                    className={`suggestion-item ${index === activeIndex ? 'active' : ''}`}
                                    onClick={() => handleSelect(item)}
                                    onMouseEnter={() => setActiveIndex(index)}
                                    role="option"
                                    aria-selected={index === activeIndex}
                                >
                                    <span className="location-icon">📍</span>
                                    <div className="suggestion-content">
                                        <div className="main-text">
                                            {highlightMatch(mainName, value)}
                                        </div>
                                        {subText && (
                                            <div className="sub-text">{subText}</div>
                                        )}
                                    </div>
                                </li>
                            );
                        })
                    ) : (
                        <li className="no-results">
                            <span className="no-results-icon">🔍</span>
                            No results found for "{value}"
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
};

export default LocationAutocomplete;
