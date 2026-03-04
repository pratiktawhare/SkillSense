import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

const Settings = () => {
    const { settings, updateSettings } = useSettings();
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { success, error } = useToast();

    // Local State
    const [weights, setWeights] = useState(settings.matchingWeights);
    const [notifications, setNotifications] = useState(settings.notifications);
    const [profile, setProfile] = useState({ name: user.name, email: user.email });

    const [isSaving, setIsSaving] = useState(false);

    const handleWeightChange = (e, type) => {
        const val = parseInt(e.target.value);
        setWeights(prev => ({ ...prev, [type]: val }));
    };

    const handleNotificationChange = (type) => {
        setNotifications(prev => ({ ...prev, [type]: !prev[type] }));
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            await updateSettings({ userName: profile.name, userEmail: profile.email });
            success('Profile updated successfully');
        } catch (err) {
            error('Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveWeights = async () => {
        const sum = weights.skills + weights.experience + weights.semantic;
        if (sum !== 100) {
            error(`Weights must sum to 100%. Current sum: ${sum}%`);
            return;
        }
        setIsSaving(true);
        try {
            await updateSettings({ matchingWeights: weights });
            success('Algorithm weights updated');
        } catch (err) {
            error('Failed to update weights');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveNotifications = async () => {
        setIsSaving(true);
        try {
            await updateSettings({ notifications });
            success('Notification preferences saved');
        } catch (err) {
            error('Failed to update preferences');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Account Settings
            </h1>

            {/* Profile Settings */}
            <div className="card p-6">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    Profile Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
                        <input
                            type="text"
                            className="input-field"
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
                        <input
                            type="email"
                            className="input-field"
                            value={profile.email}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        />
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={handleSaveProfile} disabled={isSaving} className="btn-primary">
                        {isSaving ? 'Saving...' : 'Save Profile'}
                    </button>
                </div>
            </div>

            {/* Algorithm Weights */}
            <div className="card p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>
                            Matching Algorithm Tuning
                        </h3>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Adjust the importance of factors when ranking candidates. Total must equal 100%.</p>
                    </div>
                    <div className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{ backgroundColor: 'var(--bg-tertiary)', color: (weights.skills + weights.experience + weights.semantic) === 100 ? 'var(--success)' : 'var(--error)' }}>
                        Sum: {weights.skills + weights.experience + weights.semantic}%
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Skills Weight */}
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span style={{ color: 'var(--text-secondary)' }}>Skill Overlap (Keywords & Concepts)</span>
                            <span className="font-medium" style={{ color: 'var(--accent-primary)' }}>{weights.skills}%</span>
                        </div>
                        <input
                            type="range" min="0" max="100" value={weights.skills} onChange={(e) => handleWeightChange(e, 'skills')}
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                            style={{ backgroundColor: 'var(--border-secondary)', accentColor: 'var(--accent-primary)' }}
                        />
                    </div>
                    {/* Experience Weight */}
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span style={{ color: 'var(--text-secondary)' }}>Experience Timeline Fit</span>
                            <span className="font-medium" style={{ color: 'var(--accent-primary)' }}>{weights.experience}%</span>
                        </div>
                        <input
                            type="range" min="0" max="100" value={weights.experience} onChange={(e) => handleWeightChange(e, 'experience')}
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                            style={{ backgroundColor: 'var(--border-secondary)', accentColor: 'var(--accent-primary)' }}
                        />
                    </div>
                    {/* Semantic Weight */}
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span style={{ color: 'var(--text-secondary)' }}>Overall Semantic Similarity (AI Context)</span>
                            <span className="font-medium" style={{ color: 'var(--accent-primary)' }}>{weights.semantic}%</span>
                        </div>
                        <input
                            type="range" min="0" max="100" value={weights.semantic} onChange={(e) => handleWeightChange(e, 'semantic')}
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                            style={{ backgroundColor: 'var(--border-secondary)', accentColor: 'var(--accent-primary)' }}
                        />
                    </div>
                </div>
                <div className="mt-8 flex justify-end">
                    <button onClick={handleSaveWeights} disabled={isSaving} className="btn-primary">
                        Save Weights
                    </button>
                </div>
            </div>

            {/* Preferences & Notifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Theme Options */}
                <div className="card p-6">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        Display Theme
                    </h3>

                    <div className="flex gap-4">
                        <button
                            onClick={toggleTheme}
                            className={`flex-1 py-3 px-4 rounded-xl border-2 transition-colors ${theme === 'light' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-transparent'}`}
                            style={{ backgroundColor: theme !== 'light' ? 'var(--bg-tertiary)' : undefined, color: 'var(--text-primary)' }}
                        >
                            <span className="text-lg mb-2 block">☀️</span>
                            <span className="text-sm font-medium">Light</span>
                        </button>
                        <button
                            onClick={toggleTheme}
                            className={`flex-1 py-3 px-4 rounded-xl border-2 transition-colors ${theme === 'dark' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-transparent'}`}
                            style={{ backgroundColor: theme !== 'dark' ? 'var(--bg-tertiary)' : undefined, color: 'var(--text-primary)' }}
                        >
                            <span className="text-lg mb-2 block">🌙</span>
                            <span className="text-sm font-medium">Dark</span>
                        </button>
                    </div>
                </div>

                {/* Notification Toggles */}
                <div className="card p-6">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                        Alert Preferences
                    </h3>

                    <div className="space-y-4">
                        {[
                            { key: 'applications', label: 'New Application Received', desc: 'Get notified when candidates apply' },
                            { key: 'matches', label: 'Matching Complete', desc: 'Alert when job matching finishes' },
                            { key: 'push', label: 'Push Notifications', desc: 'Browser push alerts' },
                            { key: 'email', label: 'Email Digest', desc: 'Daily summary via email' },
                        ].map(({ key, label, desc }) => (
                            <div key={key}
                                className="flex items-center justify-between py-2 cursor-pointer"
                                onClick={() => handleNotificationChange(key)}
                            >
                                <div>
                                    <span className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</span>
                                    <span className="block text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{desc}</span>
                                </div>
                                {/* Custom Toggle */}
                                <div
                                    className="relative flex-shrink-0 inline-flex items-center rounded-full transition-colors duration-200 cursor-pointer"
                                    style={{
                                        width: '44px',
                                        height: '24px',
                                        backgroundColor: notifications[key] ? 'var(--accent-primary)' : 'var(--border-secondary)',
                                    }}
                                >
                                    <span
                                        className="inline-block rounded-full bg-white shadow-sm transition-transform duration-200"
                                        style={{
                                            width: '20px',
                                            height: '20px',
                                            transform: notifications[key] ? 'translateX(22px)' : 'translateX(2px)',
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button onClick={handleSaveNotifications} disabled={isSaving} className="btn-secondary w-full text-sm">
                            Save Preferences
                        </button>
                    </div>
                </div>
            </div>

            <br />
        </div>
    );
};

export default Settings;
