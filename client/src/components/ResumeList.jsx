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

const ResumeList = ({ resumes, onDelete }) => {
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
                        className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                                <h4 className="text-white font-medium truncate">
                                    {resume.candidateName}
                                </h4>
                                <p className="text-slate-400 text-sm mt-1">{resume.fileName}</p>

                                {/* Experience summary */}
                                {resume.profile?.totalYearsExperience > 0 && (
                                    <p className="text-purple-400 text-sm mt-1">
                                        {resume.profile.totalYearsExperience}+ years experience
                                    </p>
                                )}

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
                            <button
                                onClick={() => onDelete(resume.id)}
                                className="ml-4 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition"
                                title="Delete"
                            >
                                🗑️
                            </button>
                        </div>

                        {/* Skills tags */}
                        {resume.profile?.skills?.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-700">
                                <div className="flex flex-wrap gap-1.5">
                                    {resume.profile.skills.slice(0, 8).map((skill, idx) => (
                                        <SkillTag key={idx} skill={skill} />
                                    ))}
                                    {resume.profile.skills.length > 8 && (
                                        <span className="text-slate-500 text-xs px-2 py-1">
                                            +{resume.profile.skills.length - 8} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Education */}
                        {resume.profile?.education?.length > 0 && (
                            <div className="mt-2">
                                <p className="text-slate-400 text-xs">
                                    🎓 {resume.profile.education.map(e => e.field).join(', ')}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ResumeList;
