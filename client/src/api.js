import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me')
};

// Resume API
export const resumeAPI = {
    upload: (formData) => api.post('/resumes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getAll: () => api.get('/resumes'),
    getOne: (id) => api.get(`/resumes/${id}`),
    delete: (id) => api.delete(`/resumes/${id}`),
    // Embedding endpoints
    generateEmbedding: (id) => api.post(`/resumes/${id}/embed`),
    getEmbeddingStatus: (id) => api.get(`/resumes/${id}/embedding-status`),
    batchEmbed: () => api.post('/resumes/batch-embed')
};

// Job API
export const jobAPI = {
    create: (data) => api.post('/jobs', data),
    getAll: () => api.get('/jobs'),
    getOne: (id) => api.get(`/jobs/${id}`),
    delete: (id) => api.delete(`/jobs/${id}`),
    // Embedding endpoints
    generateEmbedding: (id) => api.post(`/jobs/${id}/embed`),
    getEmbeddingStatus: (id) => api.get(`/jobs/${id}/embedding-status`),
    batchEmbed: () => api.post('/jobs/batch-embed'),
    // Public endpoints (no auth)
    getPublicJobs: () => api.get('/jobs/public'),
    getPublicJob: (id) => api.get(`/jobs/public/${id}`)
};

// Matching API
export const matchAPI = {
    runMatching: (jobId) => api.post(`/match/job/${jobId}`),
    getResults: (jobId) => api.get(`/match/job/${jobId}/results`),
    updateStatus: (matchId, status) => api.put(`/match/${matchId}/status`, { status })
};

// Application API
export const applicationAPI = {
    apply: (data) => api.post('/applications', data),
    getMyApplications: () => api.get('/applications/my'),
    getJobApplications: (jobId) => api.get(`/applications/job/${jobId}`),
    updateStatus: (id, status) => api.put(`/applications/${id}/status`, { status })
};

export default api;
