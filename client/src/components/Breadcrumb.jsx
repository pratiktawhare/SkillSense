import { Link, useLocation } from 'react-router-dom';

const routeLabels = {
    'dashboard': 'Dashboard',
    'resumes': 'Resumes',
    'jobs': 'Jobs',
    'matching': 'Matching',
    'analytics': 'Analytics',
    'settings': 'Settings',
};

const Breadcrumb = () => {
    const location = useLocation();
    const parts = location.pathname.split('/').filter(Boolean);

    if (parts.length <= 1) return null;

    return (
        <div className="breadcrumb mb-6">
            {parts.map((part, i) => {
                const path = '/' + parts.slice(0, i + 1).join('/');
                const isLast = i === parts.length - 1;
                const label = routeLabels[part] || part.charAt(0).toUpperCase() + part.slice(1);

                return (
                    <span key={path} className="flex items-center gap-2">
                        {i > 0 && (
                            <span className="separator">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </span>
                        )}
                        {isLast ? (
                            <span className="current">{label}</span>
                        ) : (
                            <Link to={path}>{label}</Link>
                        )}
                    </span>
                );
            })}
        </div>
    );
};

export default Breadcrumb;
