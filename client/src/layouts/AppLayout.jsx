import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

const AppLayout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    // Initialize states based on window width
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.innerWidth < 1024);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Handle resize events
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);

            // Auto-collapse on mobile if not already
            if (mobile && !sidebarCollapsed) {
                setSidebarCollapsed(true);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [sidebarCollapsed]);

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* Main area */}
            <div
                className="transition-all duration-300"
                style={{
                    marginLeft: isMobile ? '0' : (sidebarCollapsed ? '72px' : '260px')
                }}
            >
                {/* Header */}
                <header
                    className="h-16 flex items-center justify-between px-6 border-b"
                    style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderColor: 'var(--border-primary)',
                    }}
                >
                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg transition"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>

                    <div className="hidden lg:block" />

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleLogout}
                            className="btn-secondary text-sm"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6 page-enter">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
