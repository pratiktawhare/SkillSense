import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ResumeUpload from '../components/ResumeUpload';
import ResumeList from '../components/ResumeList';
import Breadcrumb from '../components/Breadcrumb';
import { resumeAPI } from '../api';

const ResumesPage = () => {
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResumes();
    }, []);

    const fetchResumes = async () => {
        setLoading(true);
        try {
            const res = await resumeAPI.getAll();
            setResumes(res.data);
        } catch (error) {
            console.error('Error fetching resumes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = (newResume) => {
        setResumes([newResume, ...resumes]);
    };

    const handleDelete = async (id) => {
        try {
            await resumeAPI.delete(id);
            setResumes(resumes.filter(r => r.id !== id));
        } catch (error) {
            console.error('Error deleting resume:', error);
        }
    };

    return (
        <div>
            <Breadcrumb />
            <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Resumes</h1>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2" style={{ borderColor: 'var(--accent-primary)' }} />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <ResumeUpload onUpload={handleUpload} />
                    </div>
                    <div className="lg:col-span-2">
                        <ResumeList resumes={resumes} onDelete={handleDelete} onRefresh={fetchResumes} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResumesPage;
