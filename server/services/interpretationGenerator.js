/**
 * Interpretation Generator Service
 * Generates human-readable match explanations.
 * Separated from matchingEngine for reuse in ranking and candidate detail views.
 */

const { generateInterpretation } = require('./matchingEngine');

/**
 * Generate a detailed interpretation with actionable insights
 * @param {Object} scores - { semantic, skillMatch, experience, final }
 * @param {Object} skillAnalysis - { matchedSkills, missingSkills, bonusSkills, matchedCount, totalRequired }
 * @returns {Object} { label, summary, tier, strengths, concerns, recommendation }
 */
function generateDetailedInterpretation(scores, skillAnalysis) {
    // Base interpretation
    const base = generateInterpretation(scores, skillAnalysis);

    // Build strengths list
    const strengths = [];
    if (scores.semantic >= 0.8) {
        strengths.push('Strong semantic alignment with job description');
    } else if (scores.semantic >= 0.6) {
        strengths.push('Good overall profile alignment');
    }

    if (skillAnalysis.matchedCount > 0) {
        const pct = skillAnalysis.totalRequired > 0
            ? Math.round((skillAnalysis.matchedCount / skillAnalysis.totalRequired) * 100)
            : 0;
        if (pct >= 90) {
            strengths.push(`Covers ${pct}% of required skills`);
        } else if (pct >= 70) {
            strengths.push(`Covers ${pct}% of required skills`);
        }
    }

    if (scores.experience >= 1.0) {
        strengths.push('Meets or exceeds experience requirements');
    }

    if ((skillAnalysis.bonusSkills || []).length >= 3) {
        strengths.push(`Brings ${skillAnalysis.bonusSkills.length} additional skills`);
    }

    // Build concerns list
    const concerns = [];
    if (scores.semantic < 0.5) {
        concerns.push('Low semantic alignment — profile may focus on different domain');
    }

    if ((skillAnalysis.missingSkills || []).length > 0) {
        const missingNames = (skillAnalysis.missingSkills || [])
            .slice(0, 3)
            .map(s => s.name);
        if (missingNames.length > 0) {
            concerns.push(`Missing key skills: ${missingNames.join(', ')}`);
        }
    }

    if (scores.experience < 0.5) {
        concerns.push('Significantly below experience requirement');
    } else if (scores.experience < 0.7) {
        concerns.push('Slightly under experience requirement');
    }

    // Recommendation
    let recommendation;
    const finalPercent = Math.round(scores.final);
    if (finalPercent >= 85) {
        recommendation = 'Strongly recommended for interview';
    } else if (finalPercent >= 70) {
        recommendation = 'Recommended for further review';
    } else if (finalPercent >= 50) {
        recommendation = 'Consider if other candidates are limited';
    } else {
        recommendation = 'May not be a strong fit for this role';
    }

    return {
        ...base,
        strengths,
        concerns,
        recommendation
    };
}

module.exports = {
    generateInterpretation,
    generateDetailedInterpretation
};
