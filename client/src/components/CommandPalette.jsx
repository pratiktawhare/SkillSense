import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';

export const CommandPalette = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const inputRef = useRef(null);
    const navigate = useNavigate();

    // Built-in navigation commands
    const commands = [
        { id: 'dash', title: 'Go to Dashboard', path: '/dashboard', icon: '🏠' },
        { id: 'jobs', title: 'Manage Jobs', path: '/dashboard/jobs', icon: '💼' },
        { id: 'resumes', title: 'View Candidates', path: '/dashboard/resumes', icon: '📄' },
        { id: 'match', title: 'Run Job Matching', path: '/dashboard/matching', icon: '🎯' },
        { id: 'analytics', title: 'View Analytics', path: '/dashboard/analytics', icon: '📊' },
        { id: 'settings', title: 'Account Settings', path: '/dashboard/settings', icon: '⚙️' },
    ];

    const filtered = commands.filter(cmd =>
        cmd.title.toLowerCase().includes(query.toLowerCase())
    );

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
            setQuery('');
        }
    }, [isOpen]);

    const handleSelect = (path) => {
        navigate(path);
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
            onClick={() => setIsOpen(false)}>

            <div
                className="w-full max-w-xl rounded-xl shadow-2xl overflow-hidden mx-4 animate-[slideDown_0.2s_ease-out]"
                style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Search Input */}
                <div className="flex items-center px-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)' }}>
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search or jump to..."
                        className="w-full p-4 bg-transparent outline-none text-lg"
                        style={{ color: 'var(--text-primary)' }}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <kbd className="hidden sm:inline-block px-2 py-1 text-xs rounded" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                        ESC
                    </kbd>
                </div>

                {/* Results List */}
                <div className="max-h-80 overflow-y-auto p-2">
                    {filtered.length === 0 ? (
                        <div className="p-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                            No results found for "{query}"
                        </div>
                    ) : (
                        filtered.map((cmd) => (
                            <button
                                key={cmd.id}
                                onClick={() => handleSelect(cmd.path)}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus:outline-none focus:bg-black/10 dark:focus:bg-white/10"
                            >
                                <span className="text-xl">{cmd.icon}</span>
                                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{cmd.title}</span>
                                <span className="ml-auto text-xs" style={{ color: 'var(--text-tertiary)' }}>Jump to</span>
                            </button>
                        ))
                    )}
                </div>

                {/* Footer Hint */}
                <div className="px-4 py-2 text-xs border-t flex justify-between" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                    <span>Use <kbd className="font-bold">Ctrl+K</kbd> to open anytime</span>
                    <span>Pro-tip: Try searching "matching"</span>
                </div>
            </div>
        </div>,
        document.body
    );
};
