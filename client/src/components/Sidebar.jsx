import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Sidebar = ({ collapsed, onToggle }) => {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();

    const navItems = [
        {
            path: '/dashboard',
            label: 'Dashboard',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
            )
        },
        {
            path: '/dashboard/resumes',
            label: 'Resumes',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
                </svg>
            )
        },
        {
            path: '/dashboard/jobs',
            label: 'Jobs',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
            )
        },
        {
            path: '/dashboard/matching',
            label: 'Matching',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                </svg>
            )
        }
    ];

    return (
        <>
            {/* Mobile overlay */}
            <div
                className={`sidebar-overlay lg:hidden ${!collapsed ? 'active' : ''}`}
                onClick={onToggle}
            />

            <aside
                className={`sidebar fixed top-0 left-0 h-full z-50 flex flex-col border-r
                    ${collapsed ? 'w-[72px] -translate-x-full lg:translate-x-0' : 'w-[260px] translate-x-0'}`}
                style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-primary)',
                    transition: 'width 0.3s ease, transform 0.3s ease'
                }}
            >
                {/* Logo area */}
                <div className="flex items-center h-16 px-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: 'var(--accent-gradient)' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="none">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className={`sidebar-label font-bold text-lg whitespace-nowrap`}
                            style={{ color: 'var(--text-primary)' }}>
                            SkillSense
                        </span>
                    </div>

                    {/* Collapse toggle - desktop only */}
                    <button
                        onClick={onToggle}
                        className="hidden lg:flex ml-auto items-center justify-center w-7 h-7 rounded-md hover:bg-[var(--bg-tertiary)] transition"
                        style={{ color: 'var(--text-tertiary)' }}
                        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>
                            <polyline points="11 17 6 12 11 7" /><polyline points="18 17 13 12 18 7" />
                        </svg>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                    {navItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/dashboard'}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => {
                                // Close sidebar on mobile after navigation
                                if (window.innerWidth < 1024) onToggle();
                            }}
                            title={collapsed ? item.label : undefined}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="sidebar-label whitespace-nowrap">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom section */}
                <div className="border-t px-3 py-3 space-y-2" style={{ borderColor: 'var(--border-primary)' }}>
                    {/* Theme toggle */}
                    <button
                        onClick={toggleTheme}
                        className="nav-item w-full"
                        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        <span className="nav-icon">
                            {theme === 'dark' ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                    className="theme-toggle-icon">
                                    <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" />
                                    <line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" />
                                    <line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                                </svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                    className="theme-toggle-icon">
                                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                </svg>
                            )}
                        </span>
                        <span className="sidebar-label whitespace-nowrap">
                            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                        </span>
                    </button>

                    {/* User info */}
                    <div className="nav-item cursor-default">
                        <span className="nav-icon">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                style={{ background: 'var(--accent-gradient)' }}>
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                        </span>
                        <div className="sidebar-label overflow-hidden">
                            <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                                {user?.name || 'User'}
                            </p>
                            <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
                                {user?.email || ''}
                            </p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
