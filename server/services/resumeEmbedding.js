/**
 * Resume Embedding Service
 * Prepares resume text and generates semantic embeddings
 */

const { generateEmbeddingWithRetry } = require('./huggingFaceClient');

/**
 * Prepare resume text for embedding
 * Combines structured profile data with raw text for rich semantic representation
 * @param {Object} resume - Resume document with profile
 * @returns {string} - Prepared text for embedding
 */
function prepareResumeTextForEmbedding(resume) {
    const parts = [];

    // Candidate name context
    if (resume.candidateName) {
        parts.push(`Candidate Profile`);
    }

    // Skills (high importance for matching)
    if (resume.profile?.skills?.length > 0) {
        const skillNames = resume.profile.skills.map(s => s.name).join(', ');
        parts.push(`Skills: ${skillNames}`);
    }

    // Experience titles
    if (resume.profile?.experience?.length > 0) {
        const titles = resume.profile.experience.map(e => {
            let str = e.title || '';
            if (e.company) str += ` at ${e.company}`;
            if (e.years) str += ` (${e.years} years)`;
            return str;
        }).filter(Boolean).join(', ');
        if (titles) parts.push(`Experience: ${titles}`);
    }

    // Total experience
    if (resume.profile?.totalYearsExperience > 0) {
        parts.push(`Total Experience: ${resume.profile.totalYearsExperience}+ years`);
    }

    // Education
    if (resume.profile?.education?.length > 0) {
        const education = resume.profile.education.map(e => {
            let str = e.level || '';
            if (e.field) str += ` in ${e.field}`;
            if (e.institution) str += ` from ${e.institution}`;
            return str;
        }).filter(Boolean).join(', ');
        if (education) parts.push(`Education: ${education}`);
    }

    // Summary from profiler
    if (resume.profile?.summary) {
        parts.push(`Summary: ${resume.profile.summary}`);
    }

    // Raw text excerpt for additional context
    if (resume.rawText) {
        const excerpt = resume.rawText.substring(0, 400).trim();
        parts.push(`Details: ${excerpt}`);
    }

    return parts.join('\n');
}

/**
 * Calculate profile completeness score (0-100%)
 * @param {Object} resume - Resume document with profile
 * @returns {Object} - Completeness score with breakdown
 */
function calculateProfileCompleteness(resume) {
    const breakdown = {
        hasSkills: (resume.profile?.skills?.length > 0) ? 25 : 0,
        hasExperience: (resume.profile?.experience?.length > 0) ? 25 : 0,
        hasEducation: (resume.profile?.education?.length > 0) ? 20 : 0,
        hasSummary: (resume.profile?.summary?.length > 50) ? 15 : 0,
        hasEmbedding: (resume.embeddingStatus === 'ready') ? 15 : 0
    };

    const total = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

    return {
        score: total,
        breakdown,
        label: total >= 80 ? 'Complete' : total >= 50 ? 'Partial' : 'Incomplete',
        color: total >= 80 ? 'green' : total >= 50 ? 'yellow' : 'red',
        suggestions: generateSuggestions(breakdown)
    };
}

/**
 * Generate improvement suggestions
 */
function generateSuggestions(breakdown) {
    const suggestions = [];
    if (breakdown.hasSkills === 0) suggestions.push('Add technical skills to improve matching');
    if (breakdown.hasExperience === 0) suggestions.push('Include work experience details');
    if (breakdown.hasEducation === 0) suggestions.push('Add education background');
    if (breakdown.hasSummary === 0) suggestions.push('Include a professional summary');
    if (breakdown.hasEmbedding === 0) suggestions.push('Generate AI embedding for semantic matching');
    return suggestions;
}

/**
 * Generate embedding for a resume
 * @param {Object} resume - Resume document
 * @returns {Promise<Object>} - Embedding result with vector and metadata
 */
async function generateResumeEmbedding(resume) {
    const textForEmbedding = prepareResumeTextForEmbedding(resume);

    if (!textForEmbedding || textForEmbedding.length < 10) {
        throw new Error('Insufficient resume content for embedding generation');
    }

    const startTime = Date.now();
    const embedding = await generateEmbeddingWithRetry(textForEmbedding);
    const duration = Date.now() - startTime;

    return {
        embedding,
        dimensions: embedding.length,
        textLength: textForEmbedding.length,
        generatedAt: new Date(),
        generationTimeMs: duration
    };
}

module.exports = {
    prepareResumeTextForEmbedding,
    calculateProfileCompleteness,
    generateResumeEmbedding
};
