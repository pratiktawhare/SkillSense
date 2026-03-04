import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getTimeAgo = (date) => {
        const diff = Date.now() - new Date(date).getTime();
        const m = Math.floor(diff / 60000);
        if (m < 60) return `${m}m ago`;
        const h = Math.floor(m / 60);
        if (h < 24) return `${h}h ago`;
        return `${Math.floor(h / 24)}d ago`;
    };

    const getIconColor = (type) => {
        switch (type) {
            case 'success': return 'var(--success)';
            case 'error': return 'var(--error)';
            case 'warning': return 'var(--warning)';
            default: return 'var(--info)';
        }
    };

    const handleActionClick = (notification) => {
        markAsRead(notification._id);
        setIsOpen(false);
        if (notification.actionLink) {
            navigate(notification.actionLink);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                style={{ color: 'var(--text-secondary)' }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 border-2 rounded-full"
                        style={{ borderColor: 'var(--bg-secondary)', backgroundColor: 'var(--error)' }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl shadow-xl overflow-hidden z-50 animate-[slideIn_0.2s_ease-out]"
                    style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>

                    {/* Header */}
                    <div className="px-4 py-3 border-b flex justify-between items-center" style={{ borderColor: 'var(--border-primary)' }}>
                        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs hover:underline"
                                style={{ color: 'var(--accent-primary)' }}
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                                No notifications yet.
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n._id}
                                    className={`p-4 border-b flex gap-3 group transition-colors cursor-pointer ${!n.read ? 'bg-black/5 dark:bg-white/5' : ''}`}
                                    style={{ borderColor: 'var(--border-secondary)' }}
                                    onClick={() => handleActionClick(n)}
                                >
                                    {/* Icon */}
                                    <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: `color-mix(in srgb, ${getIconColor(n.type)} 15%, transparent)`, color: getIconColor(n.type) }}>
                                        {n.type === 'success' ? '✓' : n.type === 'error' ? '✕' : n.type === 'warning' ? '!' : 'i'}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate mb-0.5" style={{ color: 'var(--text-primary)' }}>
                                            {n.title}
                                        </p>
                                        <p className="text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                                            {n.message}
                                        </p>
                                        <p className="text-[10px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
                                            {getTimeAgo(n.createdAt)}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col items-end justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteNotification(n._id); }}
                                            className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
                                            style={{ color: 'var(--text-secondary)' }}
                                            title="Delete"
                                        >
                                            ✕
                                        </button>
                                        {!n.read && (
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent-primary)' }}></div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
