/**
 * Exaggeration Detector
 * Detects unrealistic or exaggerated claims in resumes
 */

// Technology release years for age validation
const TECH_RELEASE_YEARS = {
    'react': 2013,
    'vue': 2014,
    'angular': 2016,     // Angular 2+
    'svelte': 2016,
    'next.js': 2016,
    'nuxt': 2016,
    'typescript': 2012,
    'kotlin': 2011,
    'swift': 2014,
    'flutter': 2017,
    'docker': 2013,
    'kubernetes': 2014,
    'graphql': 2015,
    'rust': 2010,
    'go': 2009,
    'tensorflow': 2015,
    'pytorch': 2016,
    'aws': 2006,
    'azure': 2010,
    'gcp': 2008,
    'node.js': 2009,
    'mongodb': 2009,
    'redis': 2009,
    'elasticsearch': 2010,
    'tailwindcss': 2017,
    'deno': 2018,
    'bun': 2022,
    'chatgpt': 2022,
    'openai': 2020,
    'langchain': 2022,
    'vite': 2020
};

// Severity levels
const SEVERITY = {
    MINOR: 'minor',       // -5 points
    MODERATE: 'moderate', // -15 points
    SEVERE: 'severe'      // -30 points
};

const PENALTY_VALUES = {
    [SEVERITY.MINOR]: 5,
    [SEVERITY.MODERATE]: 15,
    [SEVERITY.SEVERE]: 30
};

/**
 * Check for technology age exaggeration
 * e.g., "15 years of React experience" when React was released in 2013
 */
function detectTechAgeExaggeration(profile, rawText) {
    const flags = [];
    const currentYear = new Date().getFullYear();
    const lowerText = rawText.toLowerCase();

    for (const [tech, releaseYear] of Object.entries(TECH_RELEASE_YEARS)) {
        const maxPossibleYears = currentYear - releaseYear;

        // Check if the resume mentions years of experience with this tech
        const patterns = [
            new RegExp(`(\\d+)\\+?\\s*(?:years?|yrs?)\\s*(?:of\\s+)?(?:experience\\s+(?:in|with)\\s+)?${tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'gi'),
            new RegExp(`${tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]{0,30}?(\\d+)\\+?\\s*(?:years?|yrs?)`, 'gi')
        ];

        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(lowerText)) !== null) {
                const claimedYears = parseInt(match[1], 10);
                if (claimedYears > maxPossibleYears + 1) { // +1 year tolerance
                    flags.push({
                        type: 'tech_age_exaggeration',
                        severity: claimedYears > maxPossibleYears + 5 ? SEVERITY.SEVERE : SEVERITY.MODERATE,
                        message: `Claims ${claimedYears} years of ${tech} experience, but ${tech} was released in ${releaseYear} (max possible: ~${maxPossibleYears} years)`,
                        detail: { tech, claimedYears, releaseYear, maxPossibleYears }
                    });
                }
            }
        }
    }

    return flags;
}

/**
 * Check for expert overload
 * Flagging resumes where too many skills are claimed at expert/advanced level
 */
function detectExpertOverload(profile, rawText) {
    const flags = [];
    const lowerText = rawText.toLowerCase();

    // Count expert-level claims in raw text
    const expertPatterns = [
        /expert\s+(?:in|at|with)/gi,
        /(?:advanced|proficient|mastery)\s+(?:in|at|with|knowledge)/gi,
        /(?:deep|extensive|comprehensive)\s+(?:knowledge|experience|expertise)/gi
    ];

    let expertClaimCount = 0;
    for (const pattern of expertPatterns) {
        const matches = lowerText.match(pattern) || [];
        expertClaimCount += matches.length;
    }

    if (expertClaimCount >= 10) {
        flags.push({
            type: 'expert_overload',
            severity: SEVERITY.MODERATE,
            message: `Resume contains ${expertClaimCount} expert-level claims, which is unusually high`,
            detail: { expertClaimCount }
        });
    } else if (expertClaimCount >= 6) {
        flags.push({
            type: 'expert_overload',
            severity: SEVERITY.MINOR,
            message: `Resume contains ${expertClaimCount} expert-level claims`,
            detail: { expertClaimCount }
        });
    }

    return flags;
}

/**
 * Check for skill-experience mismatch
 * Claiming many advanced skills with very little total experience
 */
function detectSkillExperienceMismatch(profile) {
    const flags = [];

    if (!profile) return flags;

    const totalYears = profile.totalYearsExperience || 0;
    const skillCount = profile.skills?.length || 0;

    // Junior (<2 years) claiming 15+ skills
    if (totalYears < 2 && skillCount > 15) {
        flags.push({
            type: 'skill_experience_mismatch',
            severity: SEVERITY.MODERATE,
            message: `Claims ${skillCount} skills with only ${totalYears} year(s) of experience`,
            detail: { totalYears, skillCount }
        });
    }

    // Very junior (<1 year) claiming 10+ skills
    if (totalYears < 1 && skillCount > 10) {
        flags.push({
            type: 'skill_experience_mismatch',
            severity: SEVERITY.MINOR,
            message: `Claims ${skillCount} skills with less than 1 year of experience`,
            detail: { totalYears, skillCount }
        });
    }

    return flags;
}

/**
 * Check for skill count anomaly
 * Too many skills listed can indicate padding
 */
function detectSkillCountAnomaly(profile) {
    const flags = [];

    if (!profile) return flags;

    const skillCount = profile.skills?.length || 0;

    if (skillCount > 30) {
        flags.push({
            type: 'skill_count_anomaly',
            severity: SEVERITY.MODERATE,
            message: `Resume lists ${skillCount} different skills — possible resume padding`,
            detail: { skillCount }
        });
    } else if (skillCount > 20) {
        flags.push({
            type: 'skill_count_anomaly',
            severity: SEVERITY.MINOR,
            message: `Resume lists ${skillCount} different skills — unusually high`,
            detail: { skillCount }
        });
    }

    return flags;
}

/**
 * Run all exaggeration detection checks on a resume
 * @param {Object} resume - Resume document with profile and rawText
 * @returns {Array} - Array of red flag objects
 */
function detectExaggerations(resume) {
    const profile = resume.profile;
    const rawText = resume.rawText || '';

    const allFlags = [
        ...detectTechAgeExaggeration(profile, rawText),
        ...detectExpertOverload(profile, rawText),
        ...detectSkillExperienceMismatch(profile),
        ...detectSkillCountAnomaly(profile)
    ];

    // Deduplicate by type (keep highest severity)
    const flagMap = new Map();
    for (const flag of allFlags) {
        const key = `${flag.type}_${flag.detail?.tech || ''}`;
        if (!flagMap.has(key) || PENALTY_VALUES[flag.severity] > PENALTY_VALUES[flagMap.get(key).severity]) {
            flagMap.set(key, flag);
        }
    }

    return Array.from(flagMap.values());
}

module.exports = {
    detectExaggerations,
    SEVERITY,
    PENALTY_VALUES,
    TECH_RELEASE_YEARS
};
