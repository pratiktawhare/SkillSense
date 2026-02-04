/**
 * Local Embedding Generator using Transformers.js
 * Runs on the server - no API key needed, no CORS issues!
 */

let extractor = null;

/**
 * Initialize the embedding pipeline (lazy loading)
 */
async function initializePipeline() {
    if (extractor) return extractor;

    console.log('🔄 Loading embedding model (first time may take a moment)...');

    // Dynamic import for ESM module
    const { pipeline } = await import('@huggingface/transformers');

    // Use a small, fast model for embeddings
    extractor = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2',
        { device: 'cpu' }
    );

    console.log('✅ Embedding model loaded successfully!');
    return extractor;
}

/**
 * Generate embeddings locally using Transformers.js
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - 384-dimensional embedding vector
 */
async function generateEmbedding(text) {
    const pipe = await initializePipeline();

    // Truncate text to model limit
    const truncatedText = text.substring(0, 512);

    // Generate embedding
    const output = await pipe(truncatedText, {
        pooling: 'mean',
        normalize: true
    });

    // Convert to regular array
    const embedding = Array.from(output.data);

    return embedding;
}

/**
 * Generate embeddings with retry logic
 */
async function generateEmbeddingWithRetry(text, maxRetries = 3) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await generateEmbedding(text);
        } catch (error) {
            lastError = error;
            console.log(`Embedding attempt ${attempt} failed: ${error.message}`);

            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }

    throw lastError;
}

/**
 * Compute cosine similarity between two vectors
 */
function cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) {
        return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
        return 0;
    }

    return dotProduct / (normA * normB);
}

module.exports = {
    generateEmbedding,
    generateEmbeddingWithRetry,
    cosineSimilarity,
    initializePipeline
};
