const StatsCard = ({ title, value, previousValue, trend, trendLabel, icon, color = 'var(--accent-primary)' }) => {
    const isPositive = trend?.startsWith('+') || parseFloat(trend) > 0;
    const isNegative = trend?.startsWith('-') || parseFloat(trend) < 0;
    const trendColor = isPositive ? 'var(--success)' : isNegative ? 'var(--error)' : 'var(--text-secondary)';

    return (
        <div className="card p-5 relative overflow-hidden h-full flex flex-col justify-between group">
            <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 blur-2xl transition-transform duration-500 group-hover:scale-150"
                style={{ backgroundColor: color }} />

            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{title}</h3>
                    <div className="text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{value}</div>
                </div>
                {icon && (
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl text-xl"
                        style={{ backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`, color }}>
                        {icon}
                    </div>
                )}
            </div>

            {(trend || previousValue !== undefined) && (
                <div className="flex items-center gap-2 text-xs mt-auto pt-2">
                    {trend && (
                        <span className="font-semibold flex items-center gap-1 px-1.5 py-0.5 rounded"
                            style={{ color: trendColor, backgroundColor: `color-mix(in srgb, ${trendColor} 15%, transparent)` }}>
                            {isPositive ? '↑' : isNegative ? '↓' : '→'} {Math.abs(parseFloat(trend))}{(trend.includes('%') ? '%' : '')}
                        </span>
                    )}
                    <span style={{ color: 'var(--text-tertiary)' }}>{trendLabel || 'vs previous period'}</span>
                </div>
            )}
        </div>
    );
};

export default StatsCard;
