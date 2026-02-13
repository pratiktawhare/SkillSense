import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ResumeUpload from '../components/ResumeUpload';
import ResumeList from '../components/ResumeList';
import JobForm from '../components/JobForm';
import JobList from '../components/JobList';
import { resumeAPI, jobAPI } from '../api';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('resumes');
    const [resumes, setResumes] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resumeRes, jobRes] = await Promise.all([
                resumeAPI.getAll(),
                jobAPI.getAll()
            ]);
            setResumes(resumeRes.data);
            setJobs(jobRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleResumeUpload = (newResume) => {
        setResumes([newResume, ...resumes]);
    };

    const handleResumeDelete = async (id) => {
        try {
            await resumeAPI.delete(id);
            setResumes(resumes.filter(r => r.id !== id));
        } catch (error) {
            console.error('Error deleting resume:', error);
        }
    };

    const handleJobCreate = (newJob) => {
        setJobs([newJob, ...jobs]);
    };

    const handleJobDelete = async (id) => {
        try {
            await jobAPI.delete(id);
            setJobs(jobs.filter(j => j.id !== id));
        } catch (error) {
            console.error('Error deleting job:', error);
        }
    };

    const refreshJobs = async () => {
        try {
            const jobRes = await jobAPI.getAll();
            setJobs(jobRes.data);
        } catch (error) {
            console.error('Error refreshing jobs:', error);
        }
    };

    const refreshResumes = async () => {
        try {
            const resumeRes = await resumeAPI.getAll();
            setResumes(resumeRes.data);
        } catch (error) {
            console.error('Error refreshing resumes:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            SkillSense
                        </h1>
                        <div className="flex items-center gap-4">
                            <span className="text-slate-300">
                                Welcome, <span className="text-white font-medium">{user?.name}</span>
                            </span>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white border border-slate-600 hover:border-slate-500 rounded-lg transition"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tabs */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setActiveTab('resumes')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'resumes'
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                            : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                            }`}
                    >
                        📄 Resumes ({resumes.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('jobs')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'jobs'
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                            : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                            }`}
                    >
                        💼 Jobs ({jobs.length})
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {activeTab === 'resumes' ? (
                            <>
                                <div className="lg:col-span-1">
                                    <ResumeUpload onUpload={handleResumeUpload} />
                                </div>
                                <div className="lg:col-span-2">
                                    <ResumeList resumes={resumes} onDelete={handleResumeDelete} onRefresh={refreshResumes} />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="lg:col-span-1">
                                    <JobForm onSubmit={handleJobCreate} />
                                </div>
                                <div className="lg:col-span-2">
                                    <JobList jobs={jobs} onDelete={handleJobDelete} onRefresh={refreshJobs} />
                                </div>
                            </>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
