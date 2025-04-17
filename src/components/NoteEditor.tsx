
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNotes } from '@/context/NoteContext';
import RecordingButton from './RecordingButton';
import AudioPlayer from './AudioPlayer';
import { formatDistanceToNow } from 'date-fns';
import { Save, Trash2 } from 'lucide-react';

const NoteEditor: React.FC = () => {
  const { currentNote, updateNote, deleteNote } = useNotes();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Sync local state with current note
  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
      setContent(currentNote.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [currentNote]);
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };
  
  const getCursorPosition = useCallback(() => {
    return textareaRef.current?.selectionStart || 0;
  }, []);
  
  const saveNote = useCallback(() => {
    if (!currentNote) return;
    
    setIsSaving(true);
    updateNote({
      ...currentNote,
      title,
      content
    });
    
    setTimeout(() => {
      setIsSaving(false);
    }, 500);
  }, [currentNote, title, content, updateNote]);
  
  // Auto-save on title/content change (debounced)
  useEffect(() => {
    if (!currentNote) return;
    
    const timer = setTimeout(() => {
      saveNote();
    }, 800);
    
    return () => clearTimeout(timer);
  }, [title, content, currentNote, saveNote]);
  
  const handleDeleteNote = () => {
    if (!currentNote) return;
    if (showDeleteConfirm) {
      deleteNote(currentNote.id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
      // Auto-reset confirmation after 3 seconds
      setTimeout(() => {
        setShowDeleteConfirm(false);
      }, 3000);
    }
  };
  
  if (!currentNote) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground p-6">
        <p>No note selected. Create a new note or select an existing one.</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Untitled Note"
            className="text-lg font-medium bg-transparent border-none outline-none focus:ring-0 w-full"
          />
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>
            {formatDistanceToNow(currentNote.updatedAt, { addSuffix: true })}
          </span>
          <div className={`transition-opacity duration-300 ${isSaving ? 'opacity-100' : 'opacity-0'}`}>
            <Save size={16} />
          </div>
          <button 
            onClick={handleDeleteNote}
            className={`p-1 rounded-md transition-colors ${
              showDeleteConfirm ? 'bg-red-500 text-white' : 'hover:bg-accent text-muted-foreground'
            }`}
            title={showDeleteConfirm ? "Click again to confirm deletion" : "Delete note"}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          placeholder="Type your note here..."
          className="w-full h-full min-h-[200px] resize-none bg-transparent border-none outline-none focus:ring-0 text-foreground"
        />
        
        {currentNote.recordings.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium text-sm mb-2">Voice notes</h3>
            {currentNote.recordings.map(recording => (
              <AudioPlayer 
                key={recording.id} 
                audioId={recording.audioUrl} 
                duration={recording.duration} 
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="p-3 border-t flex justify-between items-center">
        <RecordingButton getCursorPosition={getCursorPosition} />
        <div className="text-xs text-muted-foreground">
          {currentNote.recordings.length} voice note{currentNote.recordings.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;
