/**
 * Skill Normalizer
 * Maps various skill name variations to normalized canonical forms
 */

// Comprehensive skill alias map
const skillAliases = {
    // Programming Languages
    'javascript': ['js', 'javascript', 'es6', 'es2015', 'ecmascript', 'vanilla js'],
    'typescript': ['ts', 'typescript'],
    'python': ['python', 'python3', 'py'],
    'java': ['java', 'core java', 'j2ee', 'j2se'],
    'csharp': ['c#', 'csharp', 'c sharp', '.net c#'],
    'cpp': ['c++', 'cpp', 'c plus plus'],
    'c': ['c programming', 'c language'],
    'go': ['go', 'golang'],
    'rust': ['rust', 'rustlang'],
    'ruby': ['ruby', 'ruby on rails', 'ror'],
    'php': ['php', 'php7', 'php8'],
    'swift': ['swift', 'swiftui'],
    'kotlin': ['kotlin', 'kt'],
    'scala': ['scala'],
    'r': ['r programming', 'r language', 'rstats'],

    // Frontend
    'react': ['react', 'reactjs', 'react.js', 'react js'],
    'angular': ['angular', 'angularjs', 'angular.js', 'ng'],
    'vue': ['vue', 'vuejs', 'vue.js', 'vue3'],
    'nextjs': ['next', 'nextjs', 'next.js'],
    'svelte': ['svelte', 'sveltekit'],
    'html': ['html', 'html5'],
    'css': ['css', 'css3', 'cascading style sheets'],
    'sass': ['sass', 'scss'],
    'tailwind': ['tailwind', 'tailwindcss', 'tailwind css'],
    'bootstrap': ['bootstrap', 'bootstrap5'],
    'jquery': ['jquery', 'jquery ui'],

    // Backend
    'nodejs': ['node', 'nodejs', 'node.js', 'node js'],
    'express': ['express', 'expressjs', 'express.js'],
    'django': ['django', 'django rest'],
    'flask': ['flask'],
    'fastapi': ['fastapi', 'fast api'],
    'spring': ['spring', 'spring boot', 'springboot'],
    'dotnet': ['.net', 'dotnet', '.net core', 'asp.net'],
    'laravel': ['laravel'],
    'rails': ['rails', 'ruby on rails', 'ror'],

    // Databases
    'mongodb': ['mongodb', 'mongo', 'mongo db'],
    'postgresql': ['postgresql', 'postgres', 'psql', 'pgsql'],
    'mysql': ['mysql', 'my sql'],
    'redis': ['redis'],
    'elasticsearch': ['elasticsearch', 'elastic search', 'es'],
    'sqlite': ['sqlite', 'sqlite3'],
    'oracle': ['oracle', 'oracle db', 'oracledb'],
    'sqlserver': ['sql server', 'mssql', 'ms sql'],
    'dynamodb': ['dynamodb', 'dynamo db', 'aws dynamodb'],
    'firebase': ['firebase', 'firestore'],

    // Cloud & DevOps
    'aws': ['aws', 'amazon web services', 'amazon aws'],
    'azure': ['azure', 'microsoft azure', 'ms azure'],
    'gcp': ['gcp', 'google cloud', 'google cloud platform'],
    'docker': ['docker', 'containerization'],
    'kubernetes': ['kubernetes', 'k8s', 'kube'],
    'jenkins': ['jenkins', 'jenkins ci'],
    'gitlab': ['gitlab', 'gitlab ci'],
    'github_actions': ['github actions', 'gh actions'],
    'terraform': ['terraform', 'tf'],
    'ansible': ['ansible'],
    'linux': ['linux', 'unix', 'ubuntu', 'centos', 'debian'],

    // AI/ML
    'machine_learning': ['machine learning', 'ml', 'deep learning', 'dl'],
    'tensorflow': ['tensorflow', 'tf'],
    'pytorch': ['pytorch', 'torch'],
    'nlp': ['nlp', 'natural language processing'],
    'computer_vision': ['computer vision', 'cv', 'image processing'],
    'data_science': ['data science', 'data analytics'],
    'pandas': ['pandas'],
    'numpy': ['numpy'],
    'scikit_learn': ['scikit-learn', 'sklearn', 'scikit learn'],

    // Tools & Others
    'git': ['git', 'version control', 'github', 'gitlab', 'bitbucket'],
    'rest_api': ['rest', 'restful', 'rest api', 'restful api'],
    'graphql': ['graphql', 'graph ql'],
    'websocket': ['websocket', 'websockets', 'socket.io'],
    'agile': ['agile', 'scrum', 'kanban'],
    'jira': ['jira', 'atlassian jira'],
    'figma': ['figma'],
    'testing': ['testing', 'unit testing', 'jest', 'mocha', 'pytest'],
    'ci_cd': ['ci/cd', 'cicd', 'continuous integration', 'continuous deployment']
};

// Build reverse lookup map for O(1) normalization
const normalizeMap = new Map();
for (const [canonical, aliases] of Object.entries(skillAliases)) {
    for (const alias of aliases) {
        normalizeMap.set(alias.toLowerCase(), canonical);
    }
}

// Skill categories
const skillCategories = {
    programming: ['javascript', 'typescript', 'python', 'java', 'csharp', 'cpp', 'c', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'r'],
    frontend: ['react', 'angular', 'vue', 'nextjs', 'svelte', 'html', 'css', 'sass', 'tailwind', 'bootstrap', 'jquery'],
    backend: ['nodejs', 'express', 'django', 'flask', 'fastapi', 'spring', 'dotnet', 'laravel', 'rails'],
    database: ['mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch', 'sqlite', 'oracle', 'sqlserver', 'dynamodb', 'firebase'],
    cloud: ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'gitlab', 'github_actions', 'terraform', 'ansible', 'linux'],
    ai_ml: ['machine_learning', 'tensorflow', 'pytorch', 'nlp', 'computer_vision', 'data_science', 'pandas', 'numpy', 'scikit_learn'],
    tools: ['git', 'rest_api', 'graphql', 'websocket', 'agile', 'jira', 'figma', 'testing', 'ci_cd']
};

// Build category lookup
const categoryMap = new Map();
for (const [category, skills] of Object.entries(skillCategories)) {
    for (const skill of skills) {
        categoryMap.set(skill, category);
    }
}

/**
 * Normalize a skill name to its canonical form
 * @param {string} skillName - Raw skill name from text
 * @returns {string|null} - Normalized skill name or null if not recognized
 */
function normalizeSkill(skillName) {
    if (!skillName) return null;
    const lower = skillName.toLowerCase().trim();
    return normalizeMap.get(lower) || null;
}

/**
 * Get category for a normalized skill
 * @param {string} normalizedSkill - Canonical skill name
 * @returns {string} - Category name
 */
function getSkillCategory(normalizedSkill) {
    return categoryMap.get(normalizedSkill) || 'other';
}

/**
 * Get all known skill patterns for regex matching
 * @returns {string[]} - Array of all skill aliases
 */
function getAllSkillPatterns() {
    const patterns = [];
    for (const aliases of Object.values(skillAliases)) {
        patterns.push(...aliases);
    }
    // Sort by length descending to match longer patterns first
    return patterns.sort((a, b) => b.length - a.length);
}

module.exports = {
    normalizeSkill,
    getSkillCategory,
    getAllSkillPatterns,
    skillAliases,
    skillCategories
};
