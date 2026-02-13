/**
 * Matching Engine - Core matching orchestration
 * Combines semantic similarity, skill overlap, and experience fit
 * to produce a weighted match score with human-readable interpretation
 */

const { cosineSimilarity } = require('./huggingFaceClient');

// ─── SKILL OVERLAP ANALYSIS ────────────────────────────────────────────────

/**
 * Normalize skill name for comparison
 */
function normalizeSkillName(name) {
    return name.toLowerCase().replace(/[.\-_/\s]+/g, '').trim();
}

/**
 * Calculate skill overlap between a resume and job
 * Returns exact matches, missing skills, and bonus skills
 */
function calculateSkillOverlap(resumeSkills, requiredSkills, preferredSkills = []) {
    const resumeSkillMap = new Map();
    (resumeSkills || []).forEach(s => {
        resumeSkillMap.set(normalizeSkillName(s.name), s);
    });

    const matchedSkills = [];
    const missingSkills = [];
    const matchedNames = new Set();

    // Check required skills
    (requiredSkills || []).forEach(reqSkill => {
        const normalizedReq = normalizeSkillName(reqSkill.name);
        if (resumeSkillMap.has(normalizedReq)) {
            matchedSkills.push({
                name: reqSkill.name,
                category: reqSkill.category || 'other',
                type: 'exact',
                similarity: 1.0
            });
            matchedNames.add(normalizedReq);
        } else {
            missingSkills.push({
                name: reqSkill.name,
                category: reqSkill.category || 'other',
                type: 'exact',
                similarity: 0
            });
        }
    });

    // Check preferred skills
    (preferredSkills || []).forEach(prefSkill => {
        const normalizedPref = normalizeSkillName(prefSkill.name);
        if (resumeSkillMap.has(normalizedPref) && !matchedNames.has(normalizedPref)) {
            matchedSkills.push({
                name: prefSkill.name,
                category: prefSkill.category || 'other',
                type: 'exact',
                similarity: 0.8  // Preferred matches weighted slightly less
            });
            matchedNames.add(normalizedPref);
        }
    });

    // Bonus skills (candidate has but not required/preferred)
    const bonusSkills = [];
    resumeSkillMap.forEach((skill, normalizedName) => {
        if (!matchedNames.has(normalizedName)) {
            bonusSkills.push({
                name: skill.name,
                category: skill.category || 'other',
                type: 'exact',
                similarity: 1.0
            });
        }
    });

    // Calculate overlap score: matched / total required
    const totalRequired = (requiredSkills || []).length;
    const matchedRequired = matchedSkills.filter(s => {
        return (requiredSkills || []).some(r => normalizeSkillName(r.name) === normalizeSkillName(s.name));
    }).length;

    const skillScore = totalRequired > 0
        ? matchedRequired / totalRequired
        : (matchedSkills.length > 0 ? 0.5 : 0);  // Partial credit if no required skills

    return {
        score: Math.min(skillScore, 1.0),
        matchedSkills,
        missingSkills,
        bonusSkills,
        matchedCount: matchedRequired,
        totalRequired
    };
}

// ─── EXPERIENCE FIT ────────────────────────────────────────────────────────

/**
 * Calculate experience fit score
 * @returns {number} 0-1.2 (can exceed 1.0 for overqualified)
 */
function calculateExperienceFit(candidateYears, requiredYears) {
    if (!requiredYears || requiredYears === 0) {
        // No experience requirement - give partial credit
        return candidateYears > 0 ? 0.8 : 0.5;
    }

    if (!candidateYears || candidateYears === 0) {
        return 0.1;  // No experience data - minimal score
    }

    // Ratio capped at 1.2 (overqualified still good but diminishing returns)
    const ratio = Math.min(candidateYears / requiredYears, 1.2);

    return ratio;
}

// ─── INTERPRETATION GENERATOR ──────────────────────────────────────────────

/**
 * Generate human-readable match interpretation
 */
function generateInterpretation(scores, skillAnalysis) {
    const finalPercent = Math.round(scores.final);

    let tier, label, summary;

    if (finalPercent >= 85) {
        tier = 'excellent';
        label = 'Excellent Match';
    } else if (finalPercent >= 70) {
        tier = 'good';
        label = 'Good Match';
    } else if (finalPercent >= 50) {
        tier = 'partial';
        label = 'Partial Match';
    } else {
        tier = 'weak';
        label = 'Weak Match';
    }

    // Build summary
    const parts = [];

    // Skill coverage
    if (skillAnalysis.totalRequired > 0) {
        const coverage = Math.round((skillAnalysis.matchedCount / skillAnalysis.totalRequired) * 100);
        if (coverage >= 90) {
            parts.push('Strong skill alignment');
        } else if (coverage >= 60) {
            parts.push(`Covers ${coverage}% of required skills`);
        } else {
            parts.push(`Only ${coverage}% skill coverage`);
        }
    }

    // Missing skills note
    if (skillAnalysis.missingSkills.length > 0 && skillAnalysis.missingSkills.length <= 3) {
        const missingNames = skillAnalysis.missingSkills.map(s => s.name).join(', ');
        parts.push(`missing ${missingNames}`);
    } else if (skillAnalysis.missingSkills.length > 3) {
        parts.push(`missing ${skillAnalysis.missingSkills.length} required skills`);
    }

    // Bonus skills
    if (skillAnalysis.bonusSkills.length > 2) {
        parts.push(`${skillAnalysis.bonusSkills.length} bonus skills`);
    }

    // Experience
    if (scores.experience >= 1.0) {
        parts.push('meets experience requirement');
    } else if (scores.experience >= 0.7) {
        parts.push('slightly under experience requirement');
    } else if (scores.experience < 0.5) {
        parts.push('limited experience');
    }

    summary = parts.length > 0 ? parts.join('. ') + '.' : 'See score breakdown for details.';
    // Capitalize first letter
    summary = summary.charAt(0).toUpperCase() + summary.slice(1);

    return { label, summary, tier };
}

// ─── MAIN MATCHING FUNCTION ────────────────────────────────────────────────

/**
 * Match a single resume against a job
 * @param {Object} resume - Resume document with profile and embedding
 * @param {Object} job - Job document with profile and embedding
 * @returns {Object} Match result with scores and analysis
 */
function matchResumeToJob(resume, job) {
    // 1. Semantic similarity (embedding cosine similarity)
    let semanticScore = 0;
    if (resume.embedding && job.embedding &&
        resume.embedding.length > 0 && job.embedding.length > 0) {
        semanticScore = cosineSimilarity(resume.embedding, job.embedding);
        // Normalize from cosine range (-1 to 1) to (0 to 1)
        semanticScore = Math.max(0, (semanticScore + 1) / 2);
        // Amplify differences (cosine scores tend to cluster 0.5-0.9)
        semanticScore = Math.pow(semanticScore, 0.7);
    }

    // 2. Skill overlap
    const skillAnalysis = calculateSkillOverlap(
        resume.profile?.skills || [],
        job.profile?.requiredSkills || [],
        job.profile?.preferredSkills || []
    );

    // 3. Experience fit
    const experienceScore = calculateExperienceFit(
        resume.profile?.totalYearsExperience || 0,
        job.profile?.totalYearsRequired || 0
    );

    // 4. Weighted final score (0-100)
    const WEIGHTS = { semantic: 0.4, skill: 0.4, experience: 0.2 };

    const finalScore =
        (semanticScore * WEIGHTS.semantic +
            skillAnalysis.score * WEIGHTS.skill +
            Math.min(experienceScore, 1.0) * WEIGHTS.experience) * 100;

    const scores = {
        semantic: Math.round(semanticScore * 100) / 100,
        skillMatch: Math.round(skillAnalysis.score * 100) / 100,
        experience: Math.round(experienceScore * 100) / 100,
        final: Math.round(finalScore * 10) / 10
    };

    // 5. Generate interpretation
    const interpretation = generateInterpretation(scores, skillAnalysis);

    return {
        scores,
        matchedSkills: skillAnalysis.matchedSkills,
        missingSkills: skillAnalysis.missingSkills,
        bonusSkills: skillAnalysis.bonusSkills,
        interpretation,
        candidateName: resume.candidateName,
        jobTitle: job.title
    };
}

module.exports = {
    matchResumeToJob,
    calculateSkillOverlap,
    calculateExperienceFit,
    generateInterpretation
};
