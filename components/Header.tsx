import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from './Icon';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onSettingsClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSettingsClick }) => {
  const { theme, toggleTheme } = useTheme();
  const { logout, role } = useAuth();
  const linkClass = "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-brand-text-secondary hover:text-brand-text hover:bg-brand-surface transition-colors";
  const activeLinkClass = "bg-brand-primary text-brand-text-inverse";

  const handleLogout = async () => {
    try {
        await logout();
    } catch(error) {
        console.error("Error logging out:", error);
    }
  };

  return (
    <header className="bg-brand-bg/80 backdrop-blur-sm border-b border-brand-surface px-4 py-2 sticky top-0 z-50">
      <nav className="flex justify-between items-center">
        <NavLink to="/" className="flex items-center gap-3 text-xl font-bold text-brand-text">
          <Icon name="book" className="text-brand-primary w-6 h-6" />
          <span>LOVVG MORTAL</span>
        </NavLink>
        <div className="flex items-center gap-2">
          <NavLink 
            to="/" 
            className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : ''}`}
          >
            <Icon name="briefcase" className="w-4 h-4" />
            Work
          </NavLink>
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : ''}`}
          >
            <Icon name="dashboard" className="w-4 h-4" />
            Dashboard
          </NavLink>
          <NavLink 
            to="/edit" 
            className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : ''}`}
          >
            <Icon name="edit" className="w-4 h-4" />
            Editor
          </NavLink>
          <NavLink 
            to="/tutorial" 
            className={({ isActive }) => `${linkClass} ${isActive ? activeLinkClass : ''}`}
          >
            <Icon name="compass" className="w-4 h-4" />
            Tutorial
          </NavLink>
           <button 
            onClick={toggleTheme} 
            className={`${linkClass}`}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            <Icon name={theme === 'light' ? 'moon' : 'sun'} className="w-4 h-4" />
          </button>
           <button 
            onClick={onSettingsClick} 
            className={`${linkClass}`}
            aria-label="Settings"
          >
            <Icon name="settings" className="w-4 h-4" />
          </button>
          <button onClick={handleLogout} className={linkClass}>
            Logout
          </button>
        </div>
      </nav>
    </header>
  );
};