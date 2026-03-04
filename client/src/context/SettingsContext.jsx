import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';

const SettingsContext = createContext(null);

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) throw new Error('useSettings must be used within SettingsProvider');
    return context;
};

export const SettingsProvider = ({ children }) => {
    const { user, ...authContext } = useAuth(); // Need authContext to maybe update user state if email/name changes
    const { toggleTheme } = useTheme();

    const [settings, setSettings] = useState({
        theme: 'system',
        notifications: { email: true, push: true, matches: true, applications: true },
        matchingWeights: { skills: 50, experience: 25, semantic: 25 }
    });

    // Derived values to easily access matching weights
    const [weights, setWeights] = useState({ skills: 50, experience: 25, semantic: 25 });

    // Fetch settings on login
    useEffect(() => {
        const fetchSettings = async () => {
            if (user) {
                try {
                    const res = await api.get('/settings');
                    const { settings: fetchedSettings, user: userInfo } = res.data;
                    if (fetchedSettings) {
                        setSettings(fetchedSettings);
                        setWeights(fetchedSettings.matchingWeights);
                        // If they specifically requested a theme, sync it here if we want (for now part 6 theme handles its own local storage, but this handles cross-device sync)
                    }
                } catch (err) {
                    console.error('Failed to load settings');
                }
            }
        };

        fetchSettings();
    }, [user]);

    const updateSettings = async (updates) => {
        try {
            const res = await api.put('/settings', updates);
            setSettings(res.data.settings);
            setWeights(res.data.settings.matchingWeights);
            return res.data;
        } catch (err) {
            console.error('Failed to update settings');
            throw err;
        }
    };

    return (
        <SettingsContext.Provider value={{
            settings,
            weights,
            updateSettings
        }}>
            {children}
        </SettingsContext.Provider>
    );
};
