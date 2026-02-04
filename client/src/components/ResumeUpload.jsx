import { useState, useRef } from 'react';
import { resumeAPI } from '../api';

const ResumeUpload = ({ onUpload }) => {
    const [candidateName, setCandidateName] = useState('');
    const [file, setFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFile = (selectedFile) => {
        if (selectedFile.type !== 'application/pdf') {
            setError('Only PDF files are allowed');
            return;
        }
        setFile(selectedFile);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !candidateName.trim()) {
            setError('Please provide candidate name and resume file');
            return;
        }

        setUploading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('resume', file);
            formData.append('candidateName', candidateName.trim());

            const response = await resumeAPI.upload(formData);
            onUpload(response.data);

            // Reset form
            setCandidateName('');
            setFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Upload Resume</h3>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Candidate Name
                    </label>
                    <input
                        type="text"
                        value={candidateName}
                        onChange={(e) => setCandidateName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                        placeholder="John Doe"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Resume PDF
                    </label>
                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${dragActive
                                ? 'border-purple-500 bg-purple-500/10'
                                : file
                                    ? 'border-green-500 bg-green-500/10'
                                    : 'border-slate-600 hover:border-purple-500 hover:bg-slate-700/50'
                            }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf"
                            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                            className="hidden"
                        />
                        {file ? (
                            <div className="text-green-400">
                                <span className="text-2xl">✓</span>
                                <p className="mt-2 font-medium">{file.name}</p>
                                <p className="text-sm text-slate-400">Click to change</p>
                            </div>
                        ) : (
                            <div className="text-slate-400">
                                <span className="text-3xl">📄</span>
                                <p className="mt-2">Drag & drop PDF here</p>
                                <p className="text-sm">or click to browse</p>
                            </div>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={uploading || !file || !candidateName.trim()}
                    className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {uploading ? 'Uploading...' : 'Upload Resume'}
                </button>
            </form>
        </div>
    );
};

export default ResumeUpload;
