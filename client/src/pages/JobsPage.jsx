import { useState, useEffect } from 'react';
import JobForm from '../components/JobForm';
import JobList from '../components/JobList';
import Breadcrumb from '../components/Breadcrumb';
import { jobAPI } from '../api';

const JobsPage = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const res = await jobAPI.getAll();
            setJobs(res.data);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = (newJob) => {
        setJobs([newJob, ...jobs]);
    };

    const handleDelete = async (id) => {
        try {
            await jobAPI.delete(id);
            setJobs(jobs.filter(j => j.id !== id));
        } catch (error) {
            console.error('Error deleting job:', error);
        }
    };

    return (
        <div>
            <Breadcrumb />
            <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Jobs</h1>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2" style={{ borderColor: 'var(--accent-primary)' }} />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <JobForm onSubmit={handleCreate} />
                    </div>
                    <div className="lg:col-span-2">
                        <JobList jobs={jobs} onDelete={handleDelete} onRefresh={fetchJobs} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobsPage;
