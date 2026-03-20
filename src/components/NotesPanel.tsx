import { useState } from 'react';
import { TripNote } from '../lib/types';

interface NotesPanelProps {
  notes: TripNote[];
  onNotesChange: (notes: TripNote[]) => void;
}

export function NotesPanel({ notes, onNotesChange }: NotesPanelProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const generateId = () => crypto.randomUUID();

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    const note: TripNote = {
      id: generateId(),
      content: newNote.trim(),
      createdAt: Date.now(),
    };
    
    onNotesChange([...notes, note]);
    setNewNote('');
    setIsAdding(false);
  };

  const handleEditNote = (id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    
    setEditingId(id);
    setEditContent(note.content);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editContent.trim()) return;
    
    onNotesChange(notes.map(n => 
      n.id === editingId 
        ? { ...n, content: editContent.trim(), updatedAt: Date.now() }
        : n
    ));
    setEditingId(null);
    setEditContent('');
  };

  const handleDeleteNote = (id: string) => {
    if (!confirm('Delete this note?')) return;
    onNotesChange(notes.filter(n => n.id !== id));
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Trip Notes</h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            + Add Note
          </button>
        )}
      </div>

      {isAdding && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Enter your note..."
            className="w-full p-2 border rounded-md text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleAddNote}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewNote('');
              }}
              className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {notes.length === 0 && !isAdding ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No notes yet</p>
          <p className="text-xs mt-1">Add confirmation numbers, packing reminders, or trip info</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes
            .sort((a, b) => b.createdAt - a.createdAt)
            .map((note) => (
              <div key={note.id} className="p-3 bg-gray-50 rounded-lg group">
                {editingId === note.id ? (
                  <div>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-2 border rounded-md text-sm resize-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={handleSaveEdit}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditContent('');
                        }}
                        className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">
                        {formatDate(note.createdAt)}
                        {note.updatedAt && ` (edited)`}
                      </span>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditNote(note.id)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
