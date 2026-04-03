import { useState, useEffect } from 'react';
import { rankingsAPI } from '../api';

const QUICK_TEMPLATES = [
    'Strong technical background',
    'Schedule interview',
    'Needs further review',
    'Great culture fit',
    'Overqualified for role'
];

const NoteEditor = ({ resumeId, jobId }) => {
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadNotes();
    }, [resumeId, jobId]);

    const loadNotes = async () => {
        setLoading(true);
        try {
            const res = await rankingsAPI.getNotes(resumeId, jobId);
            setNotes(res.data);
        } catch (err) {
            console.error('Failed to load notes:', err);
        }
        setLoading(false);
    };

    const handleAdd = async () => {
        if (!newNote.trim()) return;
        setSaving(true);
        try {
            const res = await rankingsAPI.addNote({
                resumeId,
                jobId,
                content: newNote.trim()
            });
            setNotes([res.data, ...notes]);
            setNewNote('');
        } catch (err) {
            console.error('Failed to add note:', err);
        }
        setSaving(false);
    };

    const handleDelete = async (noteId) => {
        try {
            await rankingsAPI.deleteNote(noteId);
            setNotes(notes.filter(n => n._id !== noteId));
        } catch (err) {
            console.error('Failed to delete note:', err);
        }
    };

    const handleTemplate = (template) => {
        setNewNote(template);
    };

    return (
        <div className="space-y-3">
            <h5 className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
                📝 Notes
            </h5>

            {/* Quick templates */}
            <div className="flex flex-wrap gap-1.5">
                {QUICK_TEMPLATES.map((t, i) => (
                    <button
                        key={i}
                        onClick={() => handleTemplate(t)}
                        className="text-xs px-2 py-1 rounded-full border transition hover:scale-105"
                        style={{
                            borderColor: 'var(--border-primary)',
                            color: 'var(--text-secondary)',
                            backgroundColor: 'var(--bg-input)'
                        }}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* Input */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                    placeholder="Add a note..."
                    className="flex-1 px-3 py-2 rounded-lg text-sm border outline-none transition"
                    style={{
                        backgroundColor: 'var(--bg-input)',
                        borderColor: 'var(--border-primary)',
                        color: 'var(--text-primary)'
                    }}
                    onClick={e => e.stopPropagation()}
                />
                <button
                    onClick={handleAdd}
                    disabled={!newNote.trim() || saving}
                    className="btn-primary text-sm px-4"
                    style={{ opacity: !newNote.trim() || saving ? 0.5 : 1 }}
                >
                    {saving ? '...' : 'Add'}
                </button>
            </div>

            {/* Notes list */}
            {loading ? (
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Loading notes...</p>
            ) : notes.length === 0 ? (
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>No notes yet</p>
            ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                    {notes.map(note => (
                        <div key={note._id} className="flex items-start gap-2 p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-input)' }}>
                            <p className="text-sm flex-1" style={{ color: 'var(--text-secondary)' }}>
                                {note.content}
                            </p>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                                    {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(note._id); }}
                                    className="text-xs hover:text-red-400 transition"
                                    style={{ color: 'var(--text-tertiary)' }}
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NoteEditor;
