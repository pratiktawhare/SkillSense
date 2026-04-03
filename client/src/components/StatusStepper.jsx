const STEPS = [
    { key: 'applied', label: 'Applied', icon: '📋' },
    { key: 'screening', label: 'Screening', icon: '🔍' },
    { key: 'shortlisted', label: 'Shortlisted', icon: '⭐' },
    { key: 'interview', label: 'Interview', icon: '💬' },
    { key: 'offered', label: 'Offered', icon: '🎉' },
    { key: 'hired', label: 'Hired', icon: '✅' }
];

const StatusStepper = ({ currentStatus }) => {
    const isRejected = currentStatus === 'rejected';
    const currentIndex = STEPS.findIndex(s => s.key === currentStatus);

    return (
        <div className="flex items-center gap-1 overflow-x-auto py-2">
            {STEPS.map((step, i) => {
                const isCompleted = !isRejected && i <= currentIndex;
                const isCurrent = step.key === currentStatus;

                return (
                    <div key={step.key} className="flex items-center">
                        {/* Step circle */}
                        <div className="flex flex-col items-center gap-1">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${isRejected
                                        ? 'border-red-500/50 bg-red-500/10 text-red-400'
                                        : isCompleted
                                            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                                            : 'border-slate-600 bg-slate-700/30 text-slate-500'
                                    } ${isCurrent && !isRejected ? 'ring-2 ring-emerald-500/30 scale-110' : ''}`}
                            >
                                {isRejected ? '✗' : isCompleted ? '✓' : i + 1}
                            </div>
                            <span className={`text-[10px] whitespace-nowrap ${isRejected
                                    ? 'text-red-400'
                                    : isCurrent
                                        ? 'font-semibold'
                                        : ''
                                }`}
                                style={{ color: isCurrent && !isRejected ? 'var(--text-primary)' : 'var(--text-tertiary)' }}
                            >
                                {step.label}
                            </span>
                        </div>

                        {/* Connector line */}
                        {i < STEPS.length - 1 && (
                            <div
                                className={`w-6 h-0.5 mx-1 mb-4 rounded ${!isRejected && i < currentIndex
                                        ? 'bg-emerald-500'
                                        : 'bg-slate-600'
                                    }`}
                            />
                        )}
                    </div>
                );
            })}

            {/* Rejected badge */}
            {isRejected && (
                <div className="flex flex-col items-center gap-1 ml-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 border-red-500 bg-red-500/20 text-red-400">
                        ✗
                    </div>
                    <span className="text-[10px] text-red-400 font-semibold whitespace-nowrap">Rejected</span>
                </div>
            )}
        </div>
    );
};

export default StatusStepper;
