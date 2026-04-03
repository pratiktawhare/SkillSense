import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ExportButton = ({ jobId, jobTitle, type = 'both' }) => {
    const [exporting, setExporting] = useState(null);
    const { success, error } = useToast();

    const getToken = () => localStorage.getItem('token');

    const handleExportPDF = () => {
        setExporting('pdf');
        try {
            const token = getToken();
            window.open(`${API_URL}/export/job/${jobId}/pdf?token=${token}`, '_blank');
            success('PDF report downloading...');
        } catch (err) {
            error('Failed to export PDF');
        } finally {
            setTimeout(() => setExporting(null), 1000);
        }
    };

    const handleExportCSV = () => {
        setExporting('csv');
        try {
            const token = getToken();
            window.open(`${API_URL}/export/job/${jobId}/csv?token=${token}`, '_blank');
            success('CSV file downloading...');
        } catch (err) {
            error('Failed to export CSV');
        } finally {
            setTimeout(() => setExporting(null), 1000);
        }
    };

    return (
        <div className="flex items-center gap-2">
            {(type === 'both' || type === 'pdf') && (
                <button
                    onClick={handleExportPDF}
                    disabled={exporting === 'pdf'}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02]"
                    style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-primary)'
                    }}
                    title="Download PDF Report"
                >
                    {exporting === 'pdf' ? (
                        <span className="animate-spin inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full" />
                    ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                    )}
                    PDF
                </button>
            )}
            {(type === 'both' || type === 'csv') && (
                <button
                    onClick={handleExportCSV}
                    disabled={exporting === 'csv'}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02]"
                    style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-primary)'
                    }}
                    title="Download CSV Rankings"
                >
                    {exporting === 'csv' ? (
                        <span className="animate-spin inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full" />
                    ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                    )}
                    CSV
                </button>
            )}
        </div>
    );
};

export default ExportButton;
