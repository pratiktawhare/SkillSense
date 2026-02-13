import { useState } from 'react';
import { resumeAPI } from '../api';

// Skill tag component for displaying extracted skills
const SkillTag = ({ skill }) => {
    const categoryColors = {
        programming: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        frontend: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        backend: 'bg-green-500/20 text-green-300 border-green-500/30',
        database: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
        cloud: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
        ai_ml: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
        tools: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
        other: 'bg-slate-500/20 text-slate-300 border-slate-500/30'
    };

    const colorClass = categoryColors[skill.category] || categoryColors.other;

    return (
        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded border ${colorClass}`}>
            {skill.name}
            {skill.confidence >= 0.8 && <span className="ml-1 opacity-60">★</span>}
        </span>
    );
};

// Embedding status badge
const EmbeddingBadge = ({ status, onGenerate, isGenerating }) => {
    const statusConfig = {
        ready: { label: 'AI Ready', icon: '🧠', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
        processing: { label: 'Processing...', icon: '⏳', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
        pending: { label: 'Pending', icon: '⚪', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
        failed: { label: 'Failed', icon: '⚠️', color: 'bg-red-500/20 text-red-300 border-red-500/30' }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
        <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded border ${config.color}`}>
                <span>{config.icon}</span>
                <span>{config.label}</span>
            </span>
            {(status === 'pending' || status === 'failed') && (
                <button
                    onClick={(e) => { e.stopPropagation(); onGenerate(); }}
                    disabled={isGenerating}
                    className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded hover:bg-purple-500/30 transition disabled:opacity-50"
                >
                    {isGenerating ? '...' : '🔄 Generate'}
                </button>
            )}
        </div>
    );
};

// Profile completeness meter
const CompletenessMeter = ({ score }) => {
    const getColor = (s) => {
        if (s >= 80) return { bar: 'bg-emerald-500', text: 'text-emerald-400' };
        if (s >= 50) return { bar: 'bg-yellow-500', text: 'text-yellow-400' };
        return { bar: 'bg-red-500', text: 'text-red-400' };
    };

    const colors = getColor(score);

    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden max-w-[80px]">
                <div
                    className={`h-full ${colors.bar} rounded-full transition-all duration-500`}
                    style={{ width: `${score}%` }}
                />
            </div>
            <span className={`text-xs font-medium ${colors.text}`}>{score}%</span>
        </div>
    );
};

// Expanded detail panel for a resume
const ResumeDetail = ({ resume }) => {
    return (
        <div className="mt-4 pt-4 border-t border-slate-600 space-y-4 animate-in">
            {/* All Skills - grouped by category */}
            {resume.profile?.skills?.length > 0 && (
                <div>
                    <h5 className="text-sm font-semibold text-slate-300 mb-2">All Skills ({resume.profile.skills.length})</h5>
                    <div className="space-y-2">
                        {Object.entries(
                            resume.profile.skills.reduce((groups, skill) => {
                                const cat = skill.category || 'other';
                                if (!groups[cat]) groups[cat] = [];
                                groups[cat].push(skill);
                                return groups;
                            }, {})
                        ).map(([category, skills]) => (
                            <div key={category}>
                                <span className="text-xs text-slate-500 uppercase tracking-wider">{category.replace('_', '/')}</span>
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                    {skills.map((skill, idx) => (
                                        <SkillTag key={idx} skill={skill} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Experience Details */}
            {resume.profile?.experience?.length > 0 && (
                <div>
                    <h5 className="text-sm font-semibold text-slate-300 mb-2">Experience</h5>
                    <div className="space-y-2">
                        {resume.profile.experience.map((exp, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                                <span className="text-purple-400">💼</span>
                                <span className="text-white">{exp.title || 'Role'}</span>
                                {exp.company && <span className="text-slate-400">at {exp.company}</span>}
                                {exp.years && <span className="text-slate-500">({exp.years} yrs)</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Education Details */}
            {resume.profile?.education?.length > 0 && (
                <div>
                    <h5 className="text-sm font-semibold text-slate-300 mb-2">Education</h5>
                    <div className="space-y-2">
                        {resume.profile.education.map((edu, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                                <span className="text-purple-400">🎓</span>
                                <span className="text-white capitalize">{edu.level || 'Degree'}</span>
                                {edu.field && <span className="text-slate-400">in {edu.field}</span>}
                                {edu.institution && <span className="text-slate-500">from {edu.institution}</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Summary */}
            {resume.profile?.summary && (
                <div>
                    <h5 className="text-sm font-semibold text-slate-300 mb-1">Summary</h5>
                    <p className="text-slate-400 text-sm leading-relaxed">{resume.profile.summary}</p>
                </div>
            )}

            {/* Text Preview */}
            {resume.textPreview && (
                <div>
                    <h5 className="text-sm font-semibold text-slate-300 mb-1">Extracted Text (Preview)</h5>
                    <p className="text-slate-500 text-xs font-mono bg-slate-900/50 p-3 rounded-lg leading-relaxed">
                        {resume.textPreview}
                    </p>
                </div>
            )}
        </div>
    );
};

const ResumeList = ({ resumes, onDelete, onRefresh }) => {
    const [generatingIds, setGeneratingIds] = useState(new Set());
    const [expandedId, setExpandedId] = useState(null);

    const handleGenerateEmbedding = async (resumeId) => {
        setGeneratingIds(prev => new Set([...prev, resumeId]));
        try {
            await resumeAPI.generateEmbedding(resumeId);
            if (onRefresh) {
                await onRefresh();
            }
        } catch (error) {
            console.error('Failed to generate embedding:', error);
        } finally {
            setGeneratingIds(prev => {
                const next = new Set(prev);
                next.delete(resumeId);
                return next;
            });
        }
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    if (resumes.length === 0) {
        return (
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 text-center">
                <span className="text-4xl">📄</span>
                <h3 className="text-lg font-medium text-white mt-4">No resumes yet</h3>
                <p className="text-slate-400 mt-2">Upload your first resume to get started</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
                Uploaded Resumes ({resumes.length})
            </h3>

            <div className="grid gap-4">
                {resumes.map((resume) => (
                    <div
                        key={resume.id}
                        className={`bg-slate-800/50 backdrop-blur-xl border rounded-xl p-4 transition cursor-pointer ${expandedId === resume.id
                                ? 'border-purple-500/50 shadow-lg shadow-purple-500/10'
                                : 'border-slate-700 hover:border-slate-600'
                            }`}
                        onClick={() => toggleExpand(resume.id)}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h4 className="text-white font-medium truncate">
                                        {resume.candidateName}
                                    </h4>
                                    <EmbeddingBadge
                                        status={resume.embeddingStatus}
                                        onGenerate={() => handleGenerateEmbedding(resume.id)}
                                        isGenerating={generatingIds.has(resume.id)}
                                    />
                                </div>
                                <p className="text-slate-400 text-sm mt-1">{resume.fileName}</p>

                                {/* Experience + Profile Completeness row */}
                                <div className="flex items-center gap-4 mt-1">
                                    {resume.profile?.totalYearsExperience > 0 && (
                                        <p className="text-purple-400 text-sm">
                                            {resume.profile.totalYearsExperience}+ years experience
                                        </p>
                                    )}
                                    <div className="flex items-center gap-1">
                                        <span className="text-slate-500 text-xs">Profile:</span>
                                        <CompletenessMeter score={resume.profileCompleteness || 0} />
                                    </div>
                                </div>

                                <p className="text-slate-500 text-xs mt-2">
                                    {new Date(resume.uploadedAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 ml-4">
                                <span className={`text-slate-400 transition-transform duration-200 ${expandedId === resume.id ? 'rotate-180' : ''}`}>
                                    ▼
                                </span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(resume.id); }}
                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition"
                                    title="Delete"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>

                        {/* Collapsed: Show first 8 skills */}
                        {expandedId !== resume.id && resume.profile?.skills?.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-700">
                                <div className="flex flex-wrap gap-1.5">
                                    {resume.profile.skills.slice(0, 8).map((skill, idx) => (
                                        <SkillTag key={idx} skill={skill} />
                                    ))}
                                    {resume.profile.skills.length > 8 && (
                                        <span className="text-purple-400 text-xs px-2 py-1 bg-purple-500/10 rounded border border-purple-500/20 cursor-pointer hover:bg-purple-500/20 transition">
                                            +{resume.profile.skills.length - 8} more — click to expand
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Collapsed: Education one-liner */}
                        {expandedId !== resume.id && resume.profile?.education?.length > 0 && (
                            <div className="mt-2">
                                <p className="text-slate-400 text-xs">
                                    🎓 {resume.profile.education.map(e => e.field).join(', ')}
                                </p>
                            </div>
                        )}

                        {/* Expanded: Full Detail Panel */}
                        {expandedId === resume.id && (
                            <ResumeDetail resume={resume} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ResumeList;
