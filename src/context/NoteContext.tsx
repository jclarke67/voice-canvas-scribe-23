
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Note, NoteContextType, Recording, Folder } from '@/types';
import { getNotes, saveNotes, createEmptyNote, generateId, getAudioFromStorage, removeAudioFromStorage, getFolders, saveFolders } from '@/lib/storage';
import { toast } from 'sonner';

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export const NoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);

  useEffect(() => {
    const savedNotes = getNotes();
    const savedFolders = getFolders();
    setNotes(savedNotes);
    setFolders(savedFolders);
    if (savedNotes.length > 0) {
      setCurrentNote(savedNotes[0]);
    }
  }, []);

  const createNote = (folderId?: string) => {
    const newNote = createEmptyNote(folderId);
    setNotes(prevNotes => {
      const updatedNotes = [...prevNotes, newNote];
      saveNotes(updatedNotes);
      return updatedNotes;
    });
    setCurrentNote(newNote);
    toast.success('Note created');
  };

  const updateNote = (updatedNote: Note) => {
    const now = Date.now();
    const noteWithTimestamp = {
      ...updatedNote,
      updatedAt: now
    };

    setNotes(prevNotes => {
      const updatedNotes = prevNotes.map(note => 
        note.id === noteWithTimestamp.id ? noteWithTimestamp : note
      );
      saveNotes(updatedNotes);
      return updatedNotes;
    });

    if (currentNote && currentNote.id === updatedNote.id) {
      setCurrentNote(noteWithTimestamp);
    }
  };

  const deleteNote = (id: string) => {
    // If the note is in selectedNotes, remove it
    if (selectedNotes.includes(id)) {
      setSelectedNotes(prev => prev.filter(noteId => noteId !== id));
    }
    
    // First, clean up any recordings associated with this note
    const noteToDelete = notes.find(note => note.id === id);
    if (noteToDelete) {
      noteToDelete.recordings.forEach(recording => {
        removeAudioFromStorage(recording.audioUrl);
      });
    }

    setNotes(prevNotes => {
      const updatedNotes = prevNotes.filter(note => note.id !== id);
      saveNotes(updatedNotes);
      
      // If the current note is deleted, set current note to the first available note or null
      if (currentNote && currentNote.id === id) {
        if (updatedNotes.length > 0) {
          setCurrentNote(updatedNotes[0]);
        } else {
          setCurrentNote(null);
        }
      }
      
      return updatedNotes;
    });
    toast.success('Note deleted');
  };

  // New function to delete multiple notes at once
  const deleteNotes = (ids: string[]) => {
    // Clean up recordings for all notes to be deleted
    const notesToDelete = notes.filter(note => ids.includes(note.id));
    notesToDelete.forEach(note => {
      note.recordings.forEach(recording => {
        removeAudioFromStorage(recording.audioUrl);
      });
    });

    setNotes(prevNotes => {
      const updatedNotes = prevNotes.filter(note => !ids.includes(note.id));
      saveNotes(updatedNotes);
      
      // If the current note is among deleted notes, set current note to the first available note or null
      if (currentNote && ids.includes(currentNote.id)) {
        if (updatedNotes.length > 0) {
          setCurrentNote(updatedNotes[0]);
        } else {
          setCurrentNote(null);
        }
      }
      
      return updatedNotes;
    });

    // Clear selected notes
    setSelectedNotes([]);
    toast.success(`${ids.length} notes deleted`);
  };

  const saveRecording = (noteId: string, recordingData: Omit<Recording, 'id' | 'name'>) => {
    const recording: Recording = {
      id: generateId(),
      name: `Recording ${new Date().toLocaleString()}`, // Default name
      ...recordingData
    };

    setNotes(prevNotes => {
      const updatedNotes = prevNotes.map(note => {
        if (note.id === noteId) {
          const updatedNote = {
            ...note,
            recordings: [...note.recordings, recording],
            updatedAt: Date.now()
          };
          
          // Update current note if it's the modified one
          if (currentNote && currentNote.id === noteId) {
            setCurrentNote(updatedNote);
          }
          
          return updatedNote;
        }
        return note;
      });
      
      saveNotes(updatedNotes);
      return updatedNotes;
    });
    toast.success('Recording saved');
  };

  const updateRecording = (noteId: string, recordingId: string, updates: Partial<Recording>) => {
    setNotes(prevNotes => {
      const updatedNotes = prevNotes.map(note => {
        if (note.id === noteId) {
          const updatedRecordings = note.recordings.map(recording => 
            recording.id === recordingId 
              ? { ...recording, ...updates } 
              : recording
          );
          
          const updatedNote = {
            ...note,
            recordings: updatedRecordings,
            updatedAt: Date.now()
          };
          
          // Update current note if it's the modified one
          if (currentNote && currentNote.id === noteId) {
            setCurrentNote(updatedNote);
          }
          
          return updatedNote;
        }
        return note;
      });
      
      saveNotes(updatedNotes);
      return updatedNotes;
    });
    toast.success('Recording updated');
  };

  const deleteRecording = (noteId: string, recordingId: string) => {
    setNotes(prevNotes => {
      const updatedNotes = prevNotes.map(note => {
        if (note.id === noteId) {
          // Find the recording to get its audioUrl
          const recordingToDelete = note.recordings.find(rec => rec.id === recordingId);
          if (recordingToDelete) {
            // Remove audio data from storage
            removeAudioFromStorage(recordingToDelete.audioUrl);
          }
          
          const updatedRecordings = note.recordings.filter(rec => rec.id !== recordingId);
          
          const updatedNote = {
            ...note,
            recordings: updatedRecordings,
            updatedAt: Date.now()
          };
          
          // Update current note if it's the modified one
          if (currentNote && currentNote.id === noteId) {
            setCurrentNote(updatedNote);
          }
          
          return updatedNote;
        }
        return note;
      });
      
      saveNotes(updatedNotes);
      return updatedNotes;
    });
    toast.success('Recording deleted');
  };

  const createFolder = (name: string) => {
    const newFolder: Folder = {
      id: generateId(),
      name,
      createdAt: Date.now(),
      order: folders.length // Set order to the end of the list
    };
    
    setFolders(prevFolders => {
      const updatedFolders = [...prevFolders, newFolder];
      saveFolders(updatedFolders);
      return updatedFolders;
    });
    toast.success('Folder created');
  };

  const updateFolder = (id: string, name: string) => {
    setFolders(prevFolders => {
      const updatedFolders = prevFolders.map(folder => 
        folder.id === id ? { ...folder, name } : folder
      );
      saveFolders(updatedFolders);
      return updatedFolders;
    });
    toast.success('Folder updated');
  };

  const deleteFolder = (id: string) => {
    // Update notes that were in this folder to have no folder
    setNotes(prevNotes => {
      const updatedNotes = prevNotes.map(note => 
        note.folderId === id ? { ...note, folderId: undefined } : note
      );
      saveNotes(updatedNotes);
      return updatedNotes;
    });
    
    // Delete the folder
    setFolders(prevFolders => {
      const updatedFolders = prevFolders.filter(folder => folder.id !== id);
      saveFolders(updatedFolders);
      return updatedFolders;
    });
    toast.success('Folder deleted');
  };

  const importRecording = async (noteId: string, file: File): Promise<void> => {
    try {
      // Read the audio file
      const arrayBuffer = await file.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: file.type });
      
      // Use the storage utility to save the audio file
      const audioUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          try {
            const base64data = reader.result as string;
            const audioId = generateId();
            localStorage.setItem(`audio-${audioId}`, base64data);
            resolve(audioId);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      
      // Create a new audio element to get the duration
      const audio = new Audio();
      audio.src = URL.createObjectURL(blob);
      
      // Wait for the metadata to load to get the duration
      await new Promise<void>((resolve) => {
        audio.onloadedmetadata = () => {
          const duration = audio.duration;
          
          // Create a new recording
          const recording: Omit<Recording, 'id' | 'name'> = {
            audioUrl,
            duration,
            timestamp: 0, // Default to the beginning of the note
            createdAt: Date.now()
          };
          
          // Save the recording
          saveRecording(noteId, recording);
          resolve();
        };
        audio.onerror = () => {
          toast.error('Failed to load audio metadata');
          resolve();
        };
      });
      
      toast.success('Recording imported successfully');
    } catch (error) {
      console.error('Error importing recording:', error);
      toast.error('Failed to import recording');
    }
  };

  const exportRecording = (recording: Recording) => {
    try {
      const audioData = getAudioFromStorage(recording.audioUrl);
      if (!audioData) {
        toast.error('Recording data not found');
        return;
      }
      
      // Create a download link for the audio
      const a = document.createElement('a');
      a.href = audioData;
      a.download = `${recording.name || 'recording'}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success('Recording exported');
    } catch (error) {
      console.error('Error exporting recording:', error);
      toast.error('Failed to export recording');
    }
  };

  // New function to toggle note selection for multi-select
  const toggleNoteSelection = (noteId: string) => {
    setSelectedNotes(prev => {
      if (prev.includes(noteId)) {
        return prev.filter(id => id !== noteId);
      } else {
        return [...prev, noteId];
      }
    });
  };

  // New function to clear all selected notes
  const clearSelectedNotes = () => {
    setSelectedNotes([]);
  };

  // New function to move multiple notes to a folder
  const moveNotesToFolder = (noteIds: string[], folderId?: string) => {
    setNotes(prevNotes => {
      const updatedNotes = prevNotes.map(note => 
        noteIds.includes(note.id) ? { ...note, folderId, updatedAt: Date.now() } : note
      );
      saveNotes(updatedNotes);
      return updatedNotes;
    });
    
    const folderName = folderId 
      ? folders.find(f => f.id === folderId)?.name || 'selected folder' 
      : 'Unfiled';
    
    toast.success(`${noteIds.length} notes moved to ${folderName}`);
  };

  // New function to reorder notes within a folder (for drag and drop)
  const reorderNotes = (noteIds: string[], folderId?: string, startIndex: number, endIndex: number) => {
    // This is a placeholder for drag-and-drop functionality
    // The actual reordering will be handled when we implement drag-and-drop
    console.log('Reordering notes:', { noteIds, folderId, startIndex, endIndex });
  };

  // New function to reorder folders
  const reorderFolders = (result: {source: {index: number}, destination: {index: number}}) => {
    const { source, destination } = result;
    if (!destination) return;

    const reorderedFolders = [...folders];
    const [removed] = reorderedFolders.splice(source.index, 1);
    reorderedFolders.splice(destination.index, 0, removed);

    // Update order property
    const updatedFolders = reorderedFolders.map((folder, index) => ({
      ...folder,
      order: index
    }));

    setFolders(updatedFolders);
    saveFolders(updatedFolders);
  };

  const contextValue: NoteContextType = {
    notes,
    folders,
    currentNote,
    selectedNotes,
    setCurrentNote,
    createNote,
    updateNote,
    deleteNote,
    deleteNotes,
    saveRecording,
    updateRecording,
    deleteRecording,
    createFolder,
    updateFolder,
    deleteFolder,
    importRecording,
    exportRecording,
    toggleNoteSelection,
    clearSelectedNotes,
    moveNotesToFolder,
    reorderNotes,
    reorderFolders
  };

  return (
    <NoteContext.Provider value={contextValue}>
      {children}
    </NoteContext.Provider>
  );
};

export const useNotes = (): NoteContextType => {
  const context = useContext(NoteContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NoteProvider');
  }
  return context;
};
