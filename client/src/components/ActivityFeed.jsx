const ActivityFeed = ({ activities }) => {

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.round(diffMs / 60000);
        const diffHours = Math.round(diffMs / 3600000);
        const diffDays = Math.round(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="card flex flex-col p-6 w-full h-full max-h-[400px]">
            <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
                Recent Activity
            </h3>

            {activities && activities.length > 0 ? (
                <div className="flex-grow overflow-y-auto pr-2 space-y-5">
                    {activities.map((item, index) => (
                        <div key={item.id} className="flex gap-4 relative">
                            {/* Connector Line */}
                            {index !== activities.length - 1 && (
                                <div className="absolute left-[19px] top-10 bottom-[-20px] w-0.5"
                                    style={{ backgroundColor: 'var(--border-secondary)' }} />
                            )}

                            {/* Icon */}
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 relative z-10 shadow-sm"
                                style={{
                                    backgroundColor: item.type === 'match' ? 'color-mix(in srgb, var(--accent-primary) 15%, var(--bg-primary))' : 'color-mix(in srgb, var(--info) 15%, var(--bg-primary))',
                                    color: item.type === 'match' ? 'var(--accent-primary)' : 'var(--info)'
                                }}>
                                {item.icon}
                            </div>

                            {/* Content */}
                            <div className="flex-1 mt-0.5">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                                        {item.title}
                                    </h4>
                                    <span className="text-xs whitespace-nowrap ml-2" style={{ color: 'var(--text-tertiary)' }}>
                                        {formatTime(item.time)}
                                    </span>
                                </div>
                                <p className="text-sm leading-snug" style={{ color: 'var(--text-secondary)' }}>
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex-grow flex items-center justify-center">
                    <p style={{ color: 'var(--text-tertiary)' }}>No recent activity to show.</p>
                </div>
            )}
        </div>
    );
};

export default ActivityFeed;
