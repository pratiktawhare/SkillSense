import { useState } from 'react';
import { jobAPI } from '../api';

// Embedding status badge component
const EmbeddingBadge = ({ status, onGenerate, isGenerating }) => {
    const statusConfig = {
        ready: {
            color: 'bg-green-500/20 text-green-400 border-green-500/30',
            icon: '🧠',
            label: 'AI Ready'
        },
        processing: {
            color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            icon: '⏳',
            label: 'Processing...'
        },
        pending: {
            color: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
            icon: '○',
            label: 'Pending'
        },
        failed: {
            color: 'bg-red-500/20 text-red-400 border-red-500/30',
            icon: '⚠️',
            label: 'Failed'
        }
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
                    onClick={onGenerate}
                    disabled={isGenerating}
                    className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 
                             rounded border border-purple-500/30 transition disabled:opacity-50"
                >
                    {isGenerating ? '...' : '🔄 Generate'}
                </button>
            )}
        </div>
    );
};

// Skill tag component for displaying extracted skills
const SkillTag = ({ skill, variant = 'default' }) => {
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

    // Required skills get a stronger style
    const baseColors = categoryColors[skill.category] || categoryColors.other;
    const colorClass = variant === 'required'
        ? baseColors.replace('/20', '/30').replace('/30', '/50')
        : baseColors;

    return (
        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded border ${colorClass}`}>
            {skill.name}
            {variant === 'required' && <span className="ml-1 text-yellow-400">★</span>}
        </span>
    );
};

const JobList = ({ jobs, onDelete, onRefresh }) => {
    const [generatingIds, setGeneratingIds] = useState(new Set());

    const handleGenerateEmbedding = async (jobId) => {
        setGeneratingIds(prev => new Set([...prev, jobId]));

        try {
            await jobAPI.generateEmbedding(jobId);
            // Refresh the jobs list to show updated status
            if (onRefresh) {
                onRefresh();
            }
        } catch (error) {
            console.error('Failed to generate embedding:', error);
        } finally {
            setGeneratingIds(prev => {
                const next = new Set(prev);
                next.delete(jobId);
                return next;
            });
        }
    };

    if (jobs.length === 0) {
        return (
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 text-center">
                <span className="text-4xl">💼</span>
                <h3 className="text-lg font-medium text-white mt-4">No jobs yet</h3>
                <p className="text-slate-400 mt-2">Create your first job description to get started</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
                Job Descriptions ({jobs.length})
            </h3>

            <div className="grid gap-4">
                {jobs.map((job) => (
                    <div
                        key={job.id}
                        className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h4 className="text-white font-medium truncate">{job.title}</h4>
                                    <EmbeddingBadge
                                        status={job.embeddingStatus}
                                        onGenerate={() => handleGenerateEmbedding(job.id)}
                                        isGenerating={generatingIds.has(job.id)}
                                    />
                                </div>

                                {/* Experience requirement */}
                                {job.profile?.totalYearsRequired > 0 && (
                                    <p className="text-purple-400 text-sm mt-1">
                                        Requires {job.profile.totalYearsRequired}+ years experience
                                    </p>
                                )}

                                <p className="text-slate-500 text-xs mt-1">
                                    {new Date(job.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                            <button
                                onClick={() => onDelete(job.id)}
                                className="ml-4 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition"
                                title="Delete"
                            >
                                🗑️
                            </button>
                        </div>

                        {/* Required Skills */}
                        {job.profile?.requiredSkills?.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-700">
                                <p className="text-slate-400 text-xs mb-2 font-medium">Required Skills:</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {job.profile.requiredSkills.slice(0, 6).map((skill, idx) => (
                                        <SkillTag key={idx} skill={skill} variant="required" />
                                    ))}
                                    {job.profile.requiredSkills.length > 6 && (
                                        <span className="text-slate-500 text-xs px-2 py-1">
                                            +{job.profile.requiredSkills.length - 6} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Preferred Skills */}
                        {job.profile?.preferredSkills?.length > 0 && (
                            <div className="mt-2">
                                <p className="text-slate-500 text-xs mb-1">Nice to have:</p>
                                <div className="flex flex-wrap gap-1">
                                    {job.profile.preferredSkills.slice(0, 4).map((skill, idx) => (
                                        <SkillTag key={idx} skill={skill} />
                                    ))}
                                    {job.profile.preferredSkills.length > 4 && (
                                        <span className="text-slate-500 text-xs px-2 py-1">
                                            +{job.profile.preferredSkills.length - 4} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default JobList;
