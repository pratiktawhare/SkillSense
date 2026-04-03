import React, { createContext, useContext, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'info', duration = 4000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const success = (msg, duration) => addToast(msg, 'success', duration);
    const error = (msg, duration) => addToast(msg, 'error', duration);
    const info = (msg, duration) => addToast(msg, 'info', duration);
    const warning = (msg, duration) => addToast(msg, 'warning', duration);

    return (
        <ToastContext.Provider value={{ success, error, info, warning }}>
            {children}
            {typeof window !== 'undefined' && createPortal(
                <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
                    {toasts.map(toast => (
                        <Toast
                            key={toast.id}
                            toast={toast}
                            onClose={() => removeToast(toast.id)}
                        />
                    ))}
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
};

// Internal Toast component for rendering individual messages
const Toast = ({ toast, onClose }) => {
    const { id, message, type } = toast;

    const getStyles = () => {
        switch (type) {
            case 'success': return { bg: 'var(--success)', icon: '✓', color: 'white' };
            case 'error': return { bg: 'var(--error)', icon: '✕', color: 'white' };
            case 'warning': return { bg: 'var(--warning)', icon: '!', color: '#1A1814' };
            case 'info': default: return { bg: 'var(--info)', icon: 'i', color: 'white' };
        }
    };

    const styles = getStyles();

    return (
        <div
            className="flex items-start gap-3 p-4 rounded-xl shadow-lg pointer-events-auto transform transition-all duration-300 animate-[slideIn_0.3s_ease-out]"
            style={{
                backgroundColor: 'var(--bg-secondary)',
                borderLeft: `4px solid ${styles.bg}`,
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
            }}
        >
            <div
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mt-0.5"
                style={{ backgroundColor: styles.bg, color: styles.color }}
            >
                {styles.icon}
            </div>

            <div className="flex-1 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {message}
            </div>

            <button
                onClick={onClose}
                className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity"
                style={{ color: 'var(--text-secondary)' }}
            >
                ✕
            </button>
        </div>
    );
};
