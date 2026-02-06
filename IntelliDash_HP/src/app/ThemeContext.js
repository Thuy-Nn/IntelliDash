'use client';

import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

const DEFAULT_THEME = {
    dashboardName: '',
    dashboardDesc: '',

    // Primary colors
    primaryColor: '#60a5fa',
    primaryDark: '#3b82f6',
    secondaryColor: '#a78bfa',
    accentColor: '#f87171',
    
    // Text colors
    textColor: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.6)',
    
    // Font styles
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    fontSize: 'normal', // normal, large, small
    fontWeight: 'normal', // normal, bold, light
};

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(DEFAULT_THEME);
    const [mounted, setMounted] = useState(false);

    // Load theme from localStorage on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('dashboardTheme');
        if (savedTheme) {
            try {
                setTheme(JSON.parse(savedTheme));
            } catch (error) {
                console.error('Error loading theme:', error);
            }
        }
        setMounted(true);
    }, []);

    // Save theme to localStorage whenever it changes
    useEffect(() => {
        if (mounted) {
            localStorage.setItem('dashboardTheme', JSON.stringify(theme));
        }
    }, [theme, mounted]);

    const updateTheme = (updates) => {
        setTheme(prev => ({ ...prev, ...updates }));
    };

    const resetTheme = () => {
        setTheme(DEFAULT_THEME);
    };

    return (
        <ThemeContext.Provider value={{ theme, updateTheme, resetTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = React.useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}
