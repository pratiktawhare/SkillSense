import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('recruiter');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const data = await register(name, email, password, role);
            navigate(data.user.role === 'candidate' ? '/candidate' : '/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
            {/* Background gradient orbs */}
            <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl animate-float"
                style={{ background: 'var(--accent-primary)', pointerEvents: 'none' }} />
            <div className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl animate-float"
                style={{ background: 'var(--accent-secondary)', animationDelay: '3s', pointerEvents: 'none' }} />

            <div className="w-full max-w-md animate-fade-in-up relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                            style={{
                                background: 'var(--accent-gradient)',
                                boxShadow: '0 10px 15px -3px color-mix(in srgb, var(--accent-primary) 20%, transparent)'
                            }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        SkillSense
                    </h1>
                    <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Create your account</p>
                </div>

                {/* Card */}
                <div className="backdrop-blur-xl border rounded-2xl p-8 shadow-2xl"
                    style={{
                        backgroundColor: 'var(--bg-card)',
                        borderColor: 'var(--border-primary)'
                    }}>
                    <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Get started</h2>

                    {/* Role Picker */}
                    <div className="flex gap-3 mb-6">
                        <button
                            type="button"
                            onClick={() => setRole('recruiter')}
                            className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all`}
                            style={{
                                borderColor: role === 'recruiter' ? 'var(--accent-primary)' : 'var(--border-primary)',
                                backgroundColor: role === 'recruiter' ? 'color-mix(in srgb, var(--accent-primary) 10%, transparent)' : 'var(--bg-input)',
                                color: role === 'recruiter' ? 'var(--text-primary)' : 'var(--text-secondary)'
                            }}
                        >
                            <div className="flex flex-col items-center gap-1.5">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={role === 'recruiter' ? 'var(--accent-primary)' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                </svg>
                                Recruiter
                            </div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('candidate')}
                            className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all`}
                            style={{
                                borderColor: role === 'candidate' ? 'var(--accent-primary)' : 'var(--border-primary)',
                                backgroundColor: role === 'candidate' ? 'color-mix(in srgb, var(--accent-primary) 10%, transparent)' : 'var(--bg-input)',
                                color: role === 'candidate' ? 'var(--text-primary)' : 'var(--text-secondary)'
                            }}
                        >
                            <div className="flex flex-col items-center gap-1.5">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={role === 'candidate' ? 'var(--accent-primary)' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                                Candidate
                            </div>
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition border"
                                style={{
                                    backgroundColor: 'var(--bg-input)',
                                    borderColor: 'var(--border-primary)',
                                    color: 'var(--text-primary)',
                                    '--tw-ring-color': 'var(--accent-primary)'
                                }}
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition border"
                                style={{
                                    backgroundColor: 'var(--bg-input)',
                                    borderColor: 'var(--border-primary)',
                                    color: 'var(--text-primary)',
                                    '--tw-ring-color': 'var(--accent-primary)'
                                }}
                                placeholder="you@company.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition border pr-10"
                                    style={{
                                        backgroundColor: 'var(--bg-input)',
                                        borderColor: 'var(--border-primary)',
                                        color: 'var(--text-primary)',
                                        '--tw-ring-color': 'var(--accent-primary)'
                                    }}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    {showPassword ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition border pr-10"
                                    style={{
                                        backgroundColor: 'var(--bg-input)',
                                        borderColor: 'var(--border-primary)',
                                        color: 'var(--text-primary)',
                                        '--tw-ring-color': 'var(--accent-primary)'
                                    }}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    {showConfirmPassword ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-2"
                            style={{
                                background: 'var(--accent-primary)',
                                boxShadow: '0 10px 15px -3px color-mix(in srgb, var(--accent-primary) 25%, transparent)'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'var(--accent-primary-hover)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'var(--accent-primary)'}
                        >
                            {loading ? 'Creating account...' : `Create ${role} account`}
                        </button>
                    </form>

                    <p className="mt-6 text-center" style={{ color: 'var(--text-tertiary)' }}>
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium hover:underline transition-all" style={{ color: 'var(--accent-primary)' }}>
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
