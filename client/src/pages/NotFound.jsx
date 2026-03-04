import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <div className="text-center max-w-lg">
                {/* Glitch-style 404 */}
                <div className="relative mb-8">
                    <h1 className="text-[120px] font-black leading-none tracking-tighter"
                        style={{
                            color: 'var(--accent-primary)',
                            opacity: 0.15
                        }}>
                        404
                    </h1>
                    <h1 className="text-[120px] font-black leading-none tracking-tighter absolute inset-0 flex items-center justify-center"
                        style={{ color: 'var(--accent-primary)' }}>
                        404
                    </h1>
                </div>

                <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                    Page Not Found
                </h2>
                <p className="text-base mb-8" style={{ color: 'var(--text-secondary)' }}>
                    The page you're looking for doesn't exist or has been moved.
                    Let's get you back on track.
                </p>

                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="btn-secondary px-6 py-2.5"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-2"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                        Go Back
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="btn-primary px-6 py-2.5"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                        Dashboard
                    </button>
                </div>

                {/* Decorative dots */}
                <div className="mt-12 flex justify-center gap-2">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-2 h-2 rounded-full animate-pulse"
                            style={{
                                backgroundColor: 'var(--accent-primary)',
                                opacity: 0.3 + (i * 0.15),
                                animationDelay: `${i * 200}ms`
                            }} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NotFound;
