import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';

const MessageModal = ({ isOpen, onClose, candidateName }) => {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const { success, error } = useToast();

    if (!isOpen) return null;

    const handleSend = async () => {
        if (!subject || !message) {
            error('Please fill out both subject and message.');
            return;
        }

        setIsSending(true);
        // Simulate an API call
        setTimeout(() => {
            setIsSending(false);
            success(`Message sent to ${candidateName}!`);
            onClose();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
            <div className="w-full max-w-lg rounded-xl shadow-2xl animate-[slideUp_0.2s_ease-out]" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Message {candidateName}
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors" style={{ color: 'var(--text-secondary)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Subject</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="e.g. Next Steps, Additional Information"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Message</label>
                        <textarea
                            className="input-field min-h-[150px] resize-y"
                            placeholder={`Hi ${candidateName}, we would like to...`}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        ></textarea>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-4 border-t" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-tertiary)' }}>
                    <button onClick={onClose} className="btn-secondary">
                        Cancel
                    </button>
                    <button onClick={handleSend} disabled={isSending} className="btn-primary flex items-center gap-2">
                        {isSending ? (
                            <>
                                <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span>
                                Sending...
                            </>
                        ) : (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                Send Message
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MessageModal;
