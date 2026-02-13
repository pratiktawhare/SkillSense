const EmptyState = ({ icon, title, description, action }) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                style={{
                    background: 'color-mix(in srgb, var(--accent-primary) 10%, transparent)',
                    color: 'var(--accent-primary)'
                }}>
                {icon || (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                        <polyline points="13 2 13 9 20 9" />
                    </svg>
                )}
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                {title || 'No data yet'}
            </h3>
            <p className="text-sm max-w-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                {description || 'Get started by adding some data.'}
            </p>
            {action && (
                <button onClick={action.onClick} className="btn-primary">
                    {action.label}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
