
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNotes } from '@/context/NoteContext';
import RecordingButton from './RecordingButton';
import AudioPlayer from './AudioPlayer';
import { formatDistanceToNow } from 'date-fns';
import { Save, Trash2, Headphones, FolderOpen, Download, FileDown, Upload } from 'lucide-react';
import RecordingsManager from './RecordingsManager';
import VoiceRecordingsDropdown from './VoiceRecordingsDropdown';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { exportNoteAsText, exportNotesAsPDF } from '@/lib/exportUtils';
import QuillEditor from './QuillEditor';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuItem, 
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

const NoteEditor: React.FC = () => {
  const { currentNote, updateNote, deleteNote, folders } = useNotes();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRecordingsManager, setShowRecordingsManager] = useState(false);
  const [showMoveToFolder, setShowMoveToFolder] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
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
  
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };
  
  const getCursorPosition = useCallback(() => {
    return 0; // With Quill, we'll just place recordings at the start
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
  
  const handleMoveToFolder = (folderId: string | undefined) => {
    if (!currentNote) return;
    
    updateNote({
      ...currentNote,
      folderId
    });
    
    setShowMoveToFolder(false);
  };
  
  const handleExportNote = () => {
    if (!currentNote) return;
    exportNoteAsText(currentNote);
  };
  
  const handleExportAsPDF = () => {
    if (!currentNote) return;
    exportNotesAsPDF([currentNote], currentNote.title || 'Note Export');
  };

  // Handle file drop for audio import
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (!currentNote) return;

    const files = Array.from(e.dataTransfer.files);
    
    // Filter for audio files
    const audioFiles = files.filter(file => file.type.startsWith('audio/'));
    
    if (audioFiles.length === 0) {
      return;
    }
    
    // Process each audio file
    for (const file of audioFiles) {
      try {
        await useNotes().importRecording(currentNote.id, file);
      } catch (error) {
        console.error('Error importing audio file:', error);
      }
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
    <div 
      className="flex flex-col h-full overflow-hidden"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      ref={containerRef}
    >
      {dragActive && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 border-2 border-dashed border-primary rounded-lg">
          <div className="text-center p-4">
            <Upload size={48} className="mx-auto text-primary mb-2" />
            <h3 className="text-xl font-medium">Drop audio files to import</h3>
            <p className="text-muted-foreground">Supported formats: MP3, WAV, WebM, OGG</p>
          </div>
        </div>
      )}
      
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
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" title="Download note">
                <FileDown size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportNote}>
                Export as Text
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportAsPDF}>
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowMoveToFolder(true)}
            title="Move to folder"
          >
            <FolderOpen size={16} />
          </Button>
          
          {currentNote.recordings.length > 0 && (
            <>
              <VoiceRecordingsDropdown noteId={currentNote.id} />
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowRecordingsManager(true)}
                title="Manage all recordings"
              >
                <Headphones size={16} />
              </Button>
            </>
          )}
          
          <span className="text-sm text-muted-foreground">
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
        <QuillEditor value={content} onChange={handleContentChange} />
        
        {currentNote.recordings.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium text-sm mb-2">Voice notes</h3>
            {currentNote.recordings.map(recording => (
              <AudioPlayer 
                key={recording.id} 
                audioId={recording.audioUrl} 
                duration={recording.duration} 
                name={recording.name}
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
      
      {/* Dialogs */}
      <RecordingsManager
        isOpen={showRecordingsManager}
        onClose={() => setShowRecordingsManager(false)}
      />
      
      <Dialog open={showMoveToFolder} onOpenChange={setShowMoveToFolder}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Move to Folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Select
              value={currentNote.folderId || "unfiled"}
              onValueChange={(value) => handleMoveToFolder(value === "unfiled" ? undefined : value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unfiled">Unfiled</SelectItem>
                {folders.map(folder => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMoveToFolder(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NoteEditor;
