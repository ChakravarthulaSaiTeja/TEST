'use client';

import React, { useState } from 'react';
import { Search, Bell, Settings, User, Menu, X } from 'lucide-react';
import SearchBar from './SearchBar';

interface HeaderProps {
  onSearch?: (query: string) => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  notifications?: number;
}

const Header: React.FC<HeaderProps> = ({ 
  onSearch, 
  user = { name: 'Demo User', email: 'demo@forecaster.ai' },
  notifications = 3 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="glass sticky top-0 z-50 border-b border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-gradient shadow-glow">
              <div className="h-6 w-6 text-white font-bold text-lg">F</div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gradient">Forecaster AI</h1>
              <p className="text-xs text-muted">Trading Intelligence</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <SearchBar 
              placeholder="Search stocks, companies..."
              onSearch={onSearch}
              className="w-full"
            />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Notifications */}
            <button className="relative p-2 rounded-lg glass-surface hover:bg-white/10 transition-all duration-200 group">
              <Bell className="h-5 w-5 text-muted group-hover:text-white transition-colors" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-danger text-white text-xs flex items-center justify-center font-medium">
                  {notifications > 9 ? '9+' : notifications}
                </span>
              )}
            </button>

            {/* Settings */}
            <button className="p-2 rounded-lg glass-surface hover:bg-white/10 transition-all duration-200 group">
              <Settings className="h-5 w-5 text-muted group-hover:text-white transition-colors" />
            </button>

            {/* Profile */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg glass-surface hover:bg-white/10 transition-all duration-200 group"
              >
                <div className="h-8 w-8 rounded-full bg-primary-gradient flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-muted">{user.email}</p>
                </div>
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 glass-surface rounded-xl shadow-floating animate-slide-down">
                  <div className="p-4 border-b border-white/10">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-full bg-primary-gradient flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-sm text-muted">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm text-muted hover:text-white">
                      Profile Settings
                    </button>
                    <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm text-muted hover:text-white">
                      Billing & Plans
                    </button>
                    <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm text-muted hover:text-white">
                      API Keys
                    </button>
                    <hr className="my-2 border-white/10" />
                    <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm text-danger hover:text-danger">
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg glass-surface hover:bg-white/10 transition-all duration-200"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5 text-white" />
              ) : (
                <Menu className="h-5 w-5 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <SearchBar 
            placeholder="Search stocks, companies..."
            onSearch={onSearch}
            className="w-full"
          />
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden glass-surface rounded-xl mt-4 p-4 animate-slide-down">
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm text-muted hover:text-white">
                Dashboard
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm text-muted hover:text-white">
                Analysis
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm text-muted hover:text-white">
                Portfolio
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm text-muted hover:text-white">
                Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
