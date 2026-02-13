/**
 * Skill Overlap Service
 * Separated from matchingEngine for reuse in exaggeration detection and ranking.
 * Re-exports the skill overlap logic from matchingEngine.
 */

const { calculateSkillOverlap } = require('./matchingEngine');

/**
 * Normalize skill name for comparison
 * Strips punctuation, spaces, and lowercases
 */
function normalizeSkillName(name) {
    return name.toLowerCase().replace(/[.\-_/\s]+/g, '').trim();
}

/**
 * Group skills by category for matrix visualization
 * @param {Object} overlapResult - Result from calculateSkillOverlap
 * @returns {Object} Skills grouped by category
 */
function groupSkillsByCategory(overlapResult) {
    const categories = {};

    const addToCategory = (skill, type) => {
        const cat = skill.category || 'other';
        if (!categories[cat]) {
            categories[cat] = { matched: [], missing: [], bonus: [] };
        }
        categories[cat][type].push(skill);
    };

    (overlapResult.matchedSkills || []).forEach(s => addToCategory(s, 'matched'));
    (overlapResult.missingSkills || []).forEach(s => addToCategory(s, 'missing'));
    (overlapResult.bonusSkills || []).forEach(s => addToCategory(s, 'bonus'));

    return categories;
}

/**
 * Calculate detailed coverage breakdown per category
 * @param {Object} overlapResult - Result from calculateSkillOverlap
 * @returns {Array} Coverage per category
 */
function getCategoryCoverage(overlapResult) {
    const grouped = groupSkillsByCategory(overlapResult);

    return Object.entries(grouped).map(([category, skills]) => {
        const total = skills.matched.length + skills.missing.length;
        const coverage = total > 0
            ? Math.round((skills.matched.length / total) * 100)
            : 100;

        return {
            category,
            matched: skills.matched.length,
            missing: skills.missing.length,
            bonus: skills.bonus.length,
            total,
            coverage
        };
    }).sort((a, b) => b.total - a.total);
}

module.exports = {
    calculateSkillOverlap,
    normalizeSkillName,
    groupSkillsByCategory,
    getCategoryCoverage
};
