/**
 * Resume and Job Profiler
 * Extracts structured information from raw text
 */

const { normalizeSkill, getSkillCategory, getAllSkillPatterns } = require('./skillNormalizer');

/**
 * Extract skills from text with normalization
 * @param {string} text - Raw text content
 * @returns {Array} - Array of skill objects with name, category, confidence
 */
function extractSkills(text) {
    if (!text) return [];

    const lowerText = text.toLowerCase();
    const skills = new Map(); // Use map to deduplicate

    // Get all skill patterns sorted by length
    const patterns = getAllSkillPatterns();

    for (const pattern of patterns) {
        // Create word-boundary aware regex
        const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedPattern}\\b`, 'gi');

        if (regex.test(lowerText)) {
            const normalized = normalizeSkill(pattern);
            if (normalized && !skills.has(normalized)) {
                // Count occurrences for confidence
                const matches = lowerText.match(regex) || [];
                const confidence = Math.min(0.5 + (matches.length * 0.1), 1.0);

                skills.set(normalized, {
                    name: normalized,
                    category: getSkillCategory(normalized),
                    confidence: parseFloat(confidence.toFixed(2)),
                    matchCount: matches.length
                });
            }
        }
    }

    // Sort by confidence descending
    return Array.from(skills.values())
        .sort((a, b) => b.confidence - a.confidence);
}

/**
 * Extract experience information from text
 * @param {string} text - Raw text content
 * @returns {Object} - Experience data with roles and total years
 */
function extractExperience(text) {
    if (!text) return { roles: [], totalYears: 0 };

    const roles = [];
    const lines = text.split('\n');

    // Patterns for job titles
    const titlePatterns = [
        /(?:senior|junior|lead|principal|staff|chief|head)?\s*(?:software|web|frontend|backend|full[- ]?stack|mobile|devops|data|ml|ai)?\s*(?:engineer|developer|architect|scientist|analyst|manager|director|consultant)/gi,
        /(?:cto|ceo|vp|vice president|technical lead|team lead|tech lead)/gi
    ];

    // Pattern for years of experience
    const yearsPatterns = [
        /(\d+)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+(?:experience|exp)/gi,
        /(?:experience|exp)(?:\s*:)?\s*(\d+)\+?\s*(?:years?|yrs?)/gi,
        /(\d+)\+?\s*(?:years?|yrs?)\s+(?:in|as|of)/gi
    ];

    // Extract roles from text
    for (const pattern of titlePatterns) {
        const matches = text.match(pattern) || [];
        for (const match of matches) {
            const title = match.trim().replace(/\s+/g, ' ');
            if (title.length > 3 && !roles.some(r => r.title.toLowerCase() === title.toLowerCase())) {
                roles.push({ title, raw: match });
            }
        }
    }

    // Extract years of experience
    let maxYears = 0;
    for (const pattern of yearsPatterns) {
        let match;
        const regex = new RegExp(pattern.source, pattern.flags);
        while ((match = regex.exec(text)) !== null) {
            const years = parseInt(match[1], 10);
            if (years > 0 && years < 50) { // Sanity check
                maxYears = Math.max(maxYears, years);
            }
        }
    }

    // Try to extract company names near roles
    const companyPattern = /(?:at|@|with)\s+([A-Z][A-Za-z0-9\s&.,-]+?)(?:\s+as|\s+from|\s+for|\.|,|\n)/g;
    let companyMatch;
    while ((companyMatch = companyPattern.exec(text)) !== null) {
        const company = companyMatch[1].trim();
        if (company.length > 2 && company.length < 50) {
            // Try to associate with nearest role
            if (roles.length > 0 && !roles[roles.length - 1].company) {
                roles[roles.length - 1].company = company;
            }
        }
    }

    return {
        roles: roles.slice(0, 10), // Limit to 10 roles
        totalYears: maxYears
    };
}

/**
 * Extract education information from text
 * @param {string} text - Raw text content
 * @returns {Array} - Array of education objects
 */
function extractEducation(text) {
    if (!text) return [];

    const education = [];

    // Degree patterns
    const degreePatterns = [
        { pattern: /\b(?:ph\.?d\.?|doctor(?:ate)?)\s*(?:in|of)?\s*([A-Za-z\s]+)/gi, level: 'doctorate' },
        { pattern: /\b(?:m\.?s\.?|m\.?sc\.?|master'?s?)\s*(?:in|of)?\s*([A-Za-z\s]+)/gi, level: 'masters' },
        { pattern: /\b(?:mba|m\.?b\.?a\.?)\b/gi, level: 'masters', field: 'Business Administration' },
        { pattern: /\b(?:b\.?s\.?|b\.?sc\.?|bachelor'?s?)\s*(?:in|of)?\s*([A-Za-z\s]+)/gi, level: 'bachelors' },
        { pattern: /\b(?:b\.?tech\.?|b\.?e\.?)\s*(?:in|of)?\s*([A-Za-z\s]+)/gi, level: 'bachelors' },
        { pattern: /\b(?:computer science|cs|information technology|it|software engineering)\b/gi, level: 'bachelors', field: 'Computer Science' }
    ];

    for (const { pattern, level, field: defaultField } of degreePatterns) {
        let match;
        const regex = new RegExp(pattern.source, pattern.flags);
        while ((match = regex.exec(text)) !== null) {
            const field = match[1]?.trim() || defaultField || 'Unknown';
            // Clean up field
            const cleanField = field.replace(/\s+/g, ' ').substring(0, 50);

            if (!education.some(e => e.level === level && e.field.toLowerCase() === cleanField.toLowerCase())) {
                education.push({
                    level,
                    field: cleanField,
                    raw: match[0]
                });
            }
        }
    }

    return education.slice(0, 5); // Limit to 5 education entries
}

/**
 * Extract summary/objective from text
 * @param {string} text - Raw text content
 * @returns {string} - Extracted summary
 */
function extractSummary(text) {
    if (!text) return '';

    // Look for summary/objective section
    const summaryPatterns = [
        /(?:summary|objective|about|profile)[\s:]*\n?([\s\S]{50,500}?)(?:\n\n|experience|education|skills|work)/i,
        /^([\s\S]{50,300}?)(?:\n\n|experience|education|skills)/i
    ];

    for (const pattern of summaryPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            return match[1].trim().replace(/\s+/g, ' ').substring(0, 500);
        }
    }

    // Fallback: first 200 chars
    return text.substring(0, 200).trim().replace(/\s+/g, ' ');
}

/**
 * Generate complete profile from text
 * @param {string} text - Raw text content
 * @param {string} type - 'resume' or 'job'
 * @returns {Object} - Complete profile object
 */
function generateProfile(text, type = 'resume') {
    const skills = extractSkills(text);
    const experience = extractExperience(text);
    const education = extractEducation(text);
    const summary = extractSummary(text);

    const profile = {
        skills,
        experience: experience.roles,
        totalYearsExperience: experience.totalYears,
        education,
        summary,
        profiledAt: new Date()
    };

    // For jobs, add required skills categorization
    if (type === 'job') {
        profile.requiredSkills = skills.filter(s => s.confidence >= 0.7);
        profile.preferredSkills = skills.filter(s => s.confidence < 0.7 && s.confidence >= 0.5);
    }

    return profile;
}

module.exports = {
    extractSkills,
    extractExperience,
    extractEducation,
    extractSummary,
    generateProfile
};
