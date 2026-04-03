import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const NotificationContext = createContext(null);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotifications must be used within NotificationProvider');
    return context;
};

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const { info, success } = useToast();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async (showToast = false) => {
        if (!user) return;
        try {
            const res = await api.get('/notifications');
            const data = res.data;

            // Check if we have new unread notifications that we didn't have before
            if (showToast) {
                const newUnread = data.filter(n => !n.read);
                const oldUnread = notifications.filter(n => !n.read);
                if (newUnread.length > oldUnread.length) {
                    const newNotification = newUnread[0];
                    if (newNotification.type === 'success') success(newNotification.title);
                    else info(newNotification.title || 'New Notification Received');
                }
            }

            setNotifications(data);
            setUnreadCount(data.filter(n => !n.read).length);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications(false);
            // Poll every 30 seconds for new notifications
            const interval = setInterval(() => fetchNotifications(true), 30000);
            return () => clearInterval(interval);
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [user]);

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark notification as read');
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all/now');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all as read');
        }
    };

    const deleteNotification = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n._id !== id));
            // Recalculate unread
            setUnreadCount(prev => {
                const isUnread = notifications.find(n => n._id === id && !n.read);
                return isUnread ? Math.max(0, prev - 1) : prev;
            });
        } catch (err) {
            console.error('Failed to delete notification');
        }
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            markAsRead,
            markAllAsRead,
            deleteNotification,
            refresh: () => fetchNotifications(false)
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
