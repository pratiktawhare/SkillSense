/**
 * Job Embedding Service
 * Prepares job text and generates semantic embeddings
 */

const { generateEmbeddingWithRetry } = require('./huggingFaceClient');

/**
 * Prepare job text for embedding
 * Combines structured profile data with raw description for rich semantic representation
 * @param {Object} job - Job document with profile
 * @returns {string} - Prepared text for embedding
 */
function prepareJobTextForEmbedding(job) {
    const parts = [];

    // Job title (important for semantic meaning)
    if (job.title) {
        parts.push(`Job Title: ${job.title}`);
    }

    // Required skills (high importance)
    if (job.profile?.requiredSkills?.length > 0) {
        const skillNames = job.profile.requiredSkills.map(s => s.name).join(', ');
        parts.push(`Required Skills: ${skillNames}`);
    }

    // Preferred skills
    if (job.profile?.preferredSkills?.length > 0) {
        const skillNames = job.profile.preferredSkills.map(s => s.name).join(', ');
        parts.push(`Preferred Skills: ${skillNames}`);
    }

    // Experience requirement
    if (job.profile?.totalYearsRequired > 0) {
        parts.push(`Experience Required: ${job.profile.totalYearsRequired}+ years`);
    }

    // Job description summary (first 500 chars)
    if (job.rawText) {
        const summary = job.rawText.substring(0, 500).trim();
        parts.push(`Description: ${summary}`);
    }

    return parts.join('\n');
}

/**
 * Generate embedding for a job
 * @param {Object} job - Job document
 * @returns {Promise<Object>} - Embedding result with vector and metadata
 */
async function generateJobEmbedding(job) {
    const textForEmbedding = prepareJobTextForEmbedding(job);

    if (!textForEmbedding || textForEmbedding.length < 10) {
        throw new Error('Insufficient job content for embedding generation');
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
    prepareJobTextForEmbedding,
    generateJobEmbedding
};
