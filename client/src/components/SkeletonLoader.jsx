const SkeletonLoader = ({ type = 'card', count = 3 }) => {
    if (type === 'card') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="card">
                        <div className="skeleton h-4 w-3/4 mb-4" />
                        <div className="skeleton h-3 w-full mb-2" />
                        <div className="skeleton h-3 w-5/6 mb-4" />
                        <div className="flex gap-2">
                            <div className="skeleton h-6 w-16 rounded-full" />
                            <div className="skeleton h-6 w-20 rounded-full" />
                            <div className="skeleton h-6 w-14 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (type === 'list') {
        return (
            <div className="space-y-3">
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="card flex items-center gap-4">
                        <div className="skeleton w-10 h-10 rounded-full flex-shrink-0" />
                        <div className="flex-1">
                            <div className="skeleton h-4 w-1/3 mb-2" />
                            <div className="skeleton h-3 w-2/3" />
                        </div>
                        <div className="skeleton h-8 w-20 rounded-lg" />
                    </div>
                ))}
            </div>
        );
    }

    if (type === 'text') {
        return (
            <div className="space-y-3">
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="skeleton h-4" style={{ width: `${70 + Math.random() * 30}%` }} />
                ))}
            </div>
        );
    }

    return null;
};

export default SkeletonLoader;
