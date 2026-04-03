import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Landing = () => {
    const { theme, toggleTheme } = useTheme();

    const features = [
        {
            icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                </svg>
            ),
            title: 'AI-Powered Matching',
            desc: 'Semantic similarity + skill analysis powered by Transformers.js for intelligent resume-to-job matching.'
        },
        {
            icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                </svg>
            ),
            title: 'Smart Skill Extraction',
            desc: 'Automatically extract and normalize skills from resumes and job descriptions with intelligent profiling.'
        },
        {
            icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
            ),
            title: 'Credibility Scoring',
            desc: 'Detect exaggerated claims and produce trust scores to ensure fair and reliable candidate evaluation.'
        }
    ];

    const steps = [
        { num: '01', title: 'Upload Resumes', desc: 'Drop PDF resumes and let AI extract skills, experience, and education automatically.' },
        { num: '02', title: 'Define Roles', desc: 'Create job descriptions with required skills, experience levels, and custom weights.' },
        { num: '03', title: 'Match & Rank', desc: 'Get instant AI-driven match scores, rankings, and side-by-side candidate comparisons.' }
    ];

    const techStack = ['React', 'Node.js', 'MongoDB', 'Transformers.js', 'Express', 'Tailwind CSS'];

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b"
                style={{ backgroundColor: 'color-mix(in srgb, var(--bg-primary) 80%, transparent)', borderColor: 'var(--border-primary)' }}>
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: 'var(--accent-gradient)' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>SkillSense</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={toggleTheme} className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--bg-tertiary)]"
                            style={{ color: 'var(--text-secondary)' }}>
                            {theme === 'dark' ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                                </svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                </svg>
                            )}
                        </button>
                        <Link to="/login" className="btn-secondary text-sm">Sign In</Link>
                        <Link to="/register" className="btn-primary text-sm">Get Started</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                {/* Background gradient orbs */}
                <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl animate-float"
                    style={{ background: 'var(--accent-primary)' }} />
                <div className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl animate-float"
                    style={{ background: 'var(--accent-secondary)', animationDelay: '3s' }} />

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="animate-slide-up stagger-1">
                        <span className="badge badge-info text-sm px-4 py-1 mb-6 inline-block">
                            AI-Driven Recruitment Platform
                        </span>
                    </div>
                    <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight mb-6 animate-slide-up stagger-2"
                        style={{ color: 'var(--text-primary)' }}>
                        Find the Perfect
                        <span className="block" style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Candidate Match
                        </span>
                    </h1>
                    <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 animate-slide-up stagger-3"
                        style={{ color: 'var(--text-secondary)' }}>
                        Upload resumes, define roles, and let AI-powered matching find the best candidates.
                        No API keys required — runs entirely locally with Transformers.js.
                    </p>
                    <div className="flex items-center justify-center gap-4 animate-slide-up stagger-4">
                        <Link to="/register" className="btn-primary text-base px-8 py-3">
                            Start Matching
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                            </svg>
                        </Link>
                        <Link to="/login" className="btn-secondary text-base px-8 py-3">
                            Sign In
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                            Intelligent Recruitment Tools
                        </h2>
                        <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                            Everything you need to streamline your hiring process with AI-powered insights.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {features.map((f, i) => (
                            <div key={i} className="card group cursor-default">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                                    style={{ background: 'color-mix(in srgb, var(--accent-primary) 15%, transparent)', color: 'var(--accent-primary)' }}>
                                    {f.icon}
                                </div>
                                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                                    {f.title}
                                </h3>
                                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                    {f.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 px-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                            How It Works
                        </h2>
                        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                            Three simple steps to smarter hiring
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {steps.map((step, i) => (
                            <div key={i} className="text-center">
                                <div className="text-5xl font-extrabold mb-4" style={{ color: 'color-mix(in srgb, var(--accent-primary) 30%, transparent)' }}>
                                    {step.num}
                                </div>
                                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                                    {step.title}
                                </h3>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    {step.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tech Stack */}
            <section className="py-16 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-sm font-medium uppercase tracking-wide mb-6" style={{ color: 'var(--text-tertiary)' }}>
                        Built with modern technologies
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        {techStack.map(tech => (
                            <span key={tech} className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                style={{
                                    backgroundColor: 'var(--bg-tertiary)',
                                    color: 'var(--text-secondary)',
                                    border: '1px solid var(--border-primary)'
                                }}>
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t py-8 px-6" style={{ borderColor: 'var(--border-primary)' }}>
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded flex items-center justify-center"
                            style={{ background: 'var(--accent-gradient)' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                            SkillSense &copy; {new Date().getFullYear()}
                        </span>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                        AI-Driven Resume-to-Role Matching Platform
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
