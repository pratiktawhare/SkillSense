/**
 * Credibility Calculator
 * Produces a 0-100 credibility score based on exaggeration detection results
 */

const { detectExaggerations, SEVERITY, PENALTY_VALUES } = require('./exaggerationDetector');

/**
 * Calculate credibility score for a resume
 * @param {Object} resume - Resume document with profile and rawText
 * @returns {Object} - Credibility report
 */
function calculateCredibility(resume) {
    // Run exaggeration detection
    const flags = detectExaggerations(resume);

    // Start with base score of 100
    let score = 100;
    let totalPenalty = 0;

    // Group penalties by severity
    const penaltySummary = {
        minor: { count: 0, totalDeduction: 0 },
        moderate: { count: 0, totalDeduction: 0 },
        severe: { count: 0, totalDeduction: 0 }
    };

    for (const flag of flags) {
        const penalty = PENALTY_VALUES[flag.severity] || 0;
        totalPenalty += penalty;

        if (penaltySummary[flag.severity]) {
            penaltySummary[flag.severity].count++;
            penaltySummary[flag.severity].totalDeduction += penalty;
        }
    }

    // Apply penalties (cap at 100)
    score = Math.max(0, Math.min(100, score - totalPenalty));

    // Determine trust level
    let trustLevel;
    if (score >= 80) {
        trustLevel = 'high';
    } else if (score >= 50) {
        trustLevel = 'medium';
    } else {
        trustLevel = 'low';
    }

    return {
        score,
        trustLevel,
        totalPenalty,
        flagCount: flags.length,
        flags,
        penaltySummary,
        analyzedAt: new Date()
    };
}

/**
 * Get a human-readable label for the trust level
 */
function getTrustLabel(trustLevel) {
    const labels = {
        high: 'High Trust',
        medium: 'Medium Trust',
        low: 'Low Trust'
    };
    return labels[trustLevel] || 'Unknown';
}

/**
 * Get color associated with trust level
 */
function getTrustColor(trustLevel) {
    const colors = {
        high: '#10b981',    // green
        medium: '#f59e0b',  // amber
        low: '#ef4444'      // red
    };
    return colors[trustLevel] || '#6b7280';
}

module.exports = {
    calculateCredibility,
    getTrustLabel,
    getTrustColor
};
