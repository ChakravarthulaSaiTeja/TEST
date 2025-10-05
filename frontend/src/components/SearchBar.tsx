'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  debounceMs?: number;
  showSuggestions?: boolean;
  suggestions?: string[];
  loading?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search stocks, companies...",
  onSearch,
  className = "",
  debounceMs = 300,
  showSuggestions = true,
  suggestions = [],
  loading = false
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Debounce the search query
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
      if (onSearch && query.trim()) {
        onSearch(query.trim());
      }
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, debounceMs, onSearch]);

  // Filter suggestions based on query
  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setShowSuggestionsList(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestionsList(false);
    if (onSearch) {
      onSearch(suggestion);
    }
  };

  const handleClear = () => {
    setQuery('');
    setShowSuggestionsList(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      setShowSuggestionsList(false);
      if (onSearch) {
        onSearch(query.trim());
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className={`relative transition-all duration-200 ${
        isFocused ? 'scale-105' : ''
      }`}>
        <div className={`relative flex items-center h-12 px-4 rounded-full glass-surface border transition-all duration-200 ${
          isFocused 
            ? 'border-primary shadow-glow ring-2 ring-primary/20' 
            : 'border-white/10 hover:border-white/20'
        }`}>
          {/* Search Icon */}
          <Search className={`h-5 w-5 transition-colors duration-200 ${
            isFocused ? 'text-primary' : 'text-muted'
          }`} />
          
          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              // Delay hiding suggestions to allow clicks
              setTimeout(() => setShowSuggestionsList(false), 150);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 ml-3 bg-transparent text-white placeholder-muted focus:outline-none text-sm font-medium"
            aria-label="Search stocks and companies"
          />
          
          {/* Loading Spinner */}
          {loading && (
            <Loader2 className="h-4 w-4 text-primary animate-spin" />
          )}
          
          {/* Clear Button */}
          {query && !loading && (
            <button
              onClick={handleClear}
              className="ml-2 p-1 rounded-full hover:bg-white/10 transition-colors duration-200"
              aria-label="Clear search"
            >
              <X className="h-4 w-4 text-muted hover:text-white" />
            </button>
          )}
        </div>
        
        {/* Focus Glow Effect */}
        {isFocused && (
          <div className="absolute inset-0 rounded-full bg-primary-gradient opacity-20 blur-xl -z-10" />
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && showSuggestionsList && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-surface rounded-xl shadow-floating border border-white/10 animate-slide-down z-50">
          <div className="p-2">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors duration-200 text-sm text-muted hover:text-white flex items-center space-x-2"
              >
                <Search className="h-4 w-4" />
                <span>{suggestion}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Helper Text */}
      {isFocused && (
        <div className="absolute top-full left-0 right-0 mt-2 text-xs text-muted animate-fade-in">
          <p className="text-center">
            Press <kbd className="px-1 py-0.5 rounded bg-white/10 text-white">Enter</kbd> to search
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
