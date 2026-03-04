/**
 * Ranking Engine
 * Produces stable, multi-factor rankings combining match score, credibility, and recency
 */

const Match = require('../models/Match');
const Resume = require('../models/Resume');

// Ranking weights
const RANKING_WEIGHTS = {
    matchScore: 0.60,    // 60% — core match score
    credibility: 0.25,   // 25% — credibility/trust score
    recency: 0.15        // 15% — resume freshness
};

/**
 * Calculate recency score based on resume upload date
 * More recent = higher score (0-1)
 */
function calculateRecencyScore(uploadedAt) {
    if (!uploadedAt) return 0.5;
    const now = new Date();
    const daysSinceUpload = (now - new Date(uploadedAt)) / (1000 * 60 * 60 * 24);

    if (daysSinceUpload <= 7) return 1.0;       // This week
    if (daysSinceUpload <= 30) return 0.9;      // This month
    if (daysSinceUpload <= 90) return 0.7;      // Last 3 months
    if (daysSinceUpload <= 180) return 0.5;     // Last 6 months
    if (daysSinceUpload <= 365) return 0.3;     // Last year
    return 0.1;                                  // Older
}

/**
 * Rank candidates for a given job
 * @param {string} jobId - Job ID to rank candidates for
 * @returns {Array} Ranked candidates with composite scores
 */
async function rankCandidatesForJob(jobId) {
    // Get all matches for this job
    const matches = await Match.find({ jobId })
        .sort({ 'scores.final': -1 });

    if (!matches.length) return [];

    // Get resume data for credibility and recency
    const resumeIds = matches.map(m => m.resumeId);
    const resumes = await Resume.find({ _id: { $in: resumeIds } })
        .select('credibility uploadedAt candidateName');

    const resumeMap = new Map();
    for (const r of resumes) {
        resumeMap.set(r._id.toString(), r);
    }

    // Calculate composite scores
    const ranked = matches.map((match, index) => {
        const resume = resumeMap.get(match.resumeId.toString());
        const credScore = resume?.credibility?.score ?? 80; // Default 80 if not analyzed
        const recencyScore = calculateRecencyScore(resume?.uploadedAt);

        const compositeScore = (
            (match.scores.final / 100) * RANKING_WEIGHTS.matchScore +
            (credScore / 100) * RANKING_WEIGHTS.credibility +
            recencyScore * RANKING_WEIGHTS.recency
        ) * 100;

        return {
            matchId: match._id,
            resumeId: match.resumeId,
            candidateName: match.candidateName,
            jobTitle: match.jobTitle,
            // Individual scores
            matchScore: match.scores.final,
            credibilityScore: credScore,
            credibilityTrust: resume?.credibility?.trustLevel || 'unknown',
            recencyScore: Math.round(recencyScore * 100),
            // Composite
            compositeScore: Math.round(compositeScore * 10) / 10,
            // Match details
            scores: match.scores,
            interpretation: match.interpretation,
            status: match.status,
            matchedSkillCount: match.matchedSkills?.length || 0,
            missingSkillCount: match.missingSkills?.length || 0,
            bonusSkillCount: match.bonusSkills?.length || 0,
            calculatedAt: match.calculatedAt
        };
    });

    // Sort by composite score descending
    ranked.sort((a, b) => b.compositeScore - a.compositeScore);

    // Assign ranks with movement indicators
    return ranked.map((candidate, index) => ({
        ...candidate,
        rank: index + 1,
        tier: getRankTier(index + 1, ranked.length)
    }));
}

/**
 * Get rank tier label
 */
function getRankTier(rank, total) {
    const percentile = (rank / total) * 100;
    if (percentile <= 10) return 'top';        // Top 10%
    if (percentile <= 25) return 'strong';     // Top 25%
    if (percentile <= 50) return 'average';    // Top 50%
    return 'below';                             // Bottom 50%
}

/**
 * Sensitivity analysis — "What if" scenario
 * Tests how rank changes if a candidate adds a specific skill
 */
async function sensitivityAnalysis(jobId, resumeId, hypotheticalSkill) {
    const ranked = await rankCandidatesForJob(jobId);
    const currentCandidate = ranked.find(r => r.resumeId.toString() === resumeId);

    if (!currentCandidate) {
        return { error: 'Candidate not found in rankings' };
    }

    // Simulate adding the skill — rough estimate of score boost
    const skillBoostEstimate = 3; // ~3 points per added skill
    const simulatedScore = Math.min(100, currentCandidate.compositeScore + skillBoostEstimate);

    // Find new rank
    const newRanked = [...ranked];
    const candidateIndex = newRanked.findIndex(r => r.resumeId.toString() === resumeId);
    newRanked[candidateIndex] = { ...newRanked[candidateIndex], compositeScore: simulatedScore };
    newRanked.sort((a, b) => b.compositeScore - a.compositeScore);

    const newRank = newRanked.findIndex(r => r.resumeId.toString() === resumeId) + 1;

    return {
        currentRank: currentCandidate.rank,
        currentScore: currentCandidate.compositeScore,
        simulatedScore,
        newRank,
        rankChange: currentCandidate.rank - newRank,
        hypotheticalSkill,
        impact: newRank < currentCandidate.rank ? 'positive' : 'neutral'
    };
}

module.exports = {
    rankCandidatesForJob,
    sensitivityAnalysis,
    RANKING_WEIGHTS
};
