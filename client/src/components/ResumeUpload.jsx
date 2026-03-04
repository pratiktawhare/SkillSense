import { useState, useRef, useEffect } from 'react';
import { resumeAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ResumeUpload = ({ onUpload }) => {
    const { user } = useAuth();
    const { success, error: showError } = useToast();
    const [candidateName, setCandidateName] = useState('');
    const [files, setFiles] = useState([]);

    useEffect(() => {
        if (user?.role === 'candidate' && user?.name && !candidateName) {
            setCandidateName(user.name);
        }
    }, [user]);

    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
    const [errorMsg, setErrorMsg] = useState('');
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

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleFiles = (selectedFiles) => {
        const pdfs = selectedFiles.filter(f => f.type === 'application/pdf');
        const rejected = selectedFiles.length - pdfs.length;
        if (rejected > 0) {
            setErrorMsg(`${rejected} non-PDF file(s) were skipped`);
        } else {
            setErrorMsg('');
        }
        setFiles(prev => [...prev, ...pdfs]);
    };

    const removeFile = (idx) => {
        setFiles(prev => prev.filter((_, i) => i !== idx));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (files.length === 0) {
            setErrorMsg('Please add at least one resume file');
            return;
        }

        // For single file, require name. For multi, use filename as name.
        if (files.length === 1 && !candidateName.trim()) {
            setErrorMsg('Please provide candidate name');
            return;
        }

        setUploading(true);
        setErrorMsg('');
        setUploadProgress({ current: 0, total: files.length });

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < files.length; i++) {
            setUploadProgress({ current: i + 1, total: files.length });
            try {
                const formData = new FormData();
                formData.append('resume', files[i]);
                // Use provided name for single, or derive from filename for multi
                const name = files.length === 1
                    ? candidateName.trim()
                    : files[i].name.replace('.pdf', '').replace(/[_-]/g, ' ');
                formData.append('candidateName', name);

                const response = await resumeAPI.upload(formData);
                onUpload(response.data);
                successCount++;
            } catch (err) {
                failCount++;
                console.error(`Upload failed for ${files[i].name}`, err);
            }
        }

        if (successCount > 0) success(`${successCount} resume(s) uploaded successfully`);
        if (failCount > 0) showError(`${failCount} upload(s) failed`);

        setCandidateName('');
        setFiles([]);
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Upload Resumes</h3>

            {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
                    {errorMsg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name field (only for single uploads) */}
                {files.length <= 1 && (
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
                )}

                {files.length > 1 && (
                    <p className="text-xs text-slate-400">
                        Uploading {files.length} files — candidate names will be derived from filenames.
                    </p>
                )}

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Resume PDF(s)
                    </label>
                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${dragActive
                            ? 'border-purple-500 bg-purple-500/10'
                            : files.length > 0
                                ? 'border-green-500 bg-green-500/10'
                                : 'border-slate-600 hover:border-purple-500 hover:bg-slate-700/50'
                            }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf"
                            multiple
                            onChange={(e) => e.target.files?.length > 0 && handleFiles(Array.from(e.target.files))}
                            className="hidden"
                        />
                        {files.length > 0 ? (
                            <div className="text-green-400">
                                <span className="text-2xl">✓</span>
                                <p className="mt-2 font-medium">{files.length} file(s) selected</p>
                                <p className="text-sm text-slate-400">Click or drop to add more</p>
                            </div>
                        ) : (
                            <div className="text-slate-400">
                                <span className="text-3xl">📄</span>
                                <p className="mt-2">Drag & drop PDFs here</p>
                                <p className="text-sm">or click to browse • Multiple files supported</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* File list */}
                {files.length > 0 && (
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                        {files.map((f, idx) => (
                            <div key={idx} className="flex items-center justify-between py-1 px-2 rounded text-sm text-slate-300 bg-slate-700/30">
                                <span className="truncate flex-1">{f.name}</span>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                                    className="text-red-400 hover:text-red-300 ml-2"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Upload Progress */}
                {uploading && files.length > 1 && (
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-400">
                            <span>Uploading {uploadProgress.current} of {uploadProgress.total}</span>
                            <span>{Math.round((uploadProgress.current / uploadProgress.total) * 100)}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                                style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={uploading || files.length === 0}
                    className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {uploading
                        ? `Uploading${files.length > 1 ? ` (${uploadProgress.current}/${uploadProgress.total})` : '...'}`
                        : `Upload ${files.length > 1 ? `${files.length} Resumes` : 'Resume'}`
                    }
                </button>
            </form>
        </div>
    );
};

export default ResumeUpload;
