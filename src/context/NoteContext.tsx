
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
    // First, clean up any recordings associated with this note
    const noteToDelete = notes.find(note => note.id === id);
    if (noteToDelete) {
      noteToDelete.recordings.forEach(recording => {
        removeAudioFromStorage(`audio-${recording.audioUrl}`);
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
    
    // Remove from selected notes if it was selected
    if (selectedNotes.includes(id)) {
      setSelectedNotes(prev => prev.filter(noteId => noteId !== id));
    }
    
    toast.success('Note deleted');
  };
  
  const deleteNotes = (ids: string[]) => {
    if (ids.length === 0) return;
    
    // Clean up recordings for all notes being deleted
    ids.forEach(id => {
      const noteToDelete = notes.find(note => note.id === id);
      if (noteToDelete) {
        noteToDelete.recordings.forEach(recording => {
          removeAudioFromStorage(`audio-${recording.audioUrl}`);
        });
      }
    });
    
    setNotes(prevNotes => {
      const updatedNotes = prevNotes.filter(note => !ids.includes(note.id));
      saveNotes(updatedNotes);
      
      // Update current note if it was deleted
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
    
    toast.success(`${ids.length} note${ids.length !== 1 ? 's' : ''} deleted`);
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
            removeAudioFromStorage(`audio-${recordingToDelete.audioUrl}`);
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
      createdAt: Date.now()
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
      const audioData = getAudioFromStorage(`audio-${recording.audioUrl}`);
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
  
  // Note selection functions
  const toggleNoteSelection = (noteId: string) => {
    setSelectedNotes(prev => {
      if (prev.includes(noteId)) {
        return prev.filter(id => id !== noteId);
      } else {
        return [...prev, noteId];
      }
    });
  };
  
  const selectAllNotes = (folderId?: string) => {
    const notesToSelect = notes
      .filter(note => folderId ? note.folderId === folderId : true)
      .map(note => note.id);
    
    setSelectedNotes(notesToSelect);
  };
  
  const clearNoteSelection = () => {
    setSelectedNotes([]);
  };
  
  const isNoteSelected = (noteId: string) => {
    return selectedNotes.includes(noteId);
  };
  
  // Bulk move notes to a folder
  const moveNotesToFolder = (noteIds: string[], folderId?: string) => {
    if (noteIds.length === 0) return;
    
    setNotes(prevNotes => {
      const updatedNotes = prevNotes.map(note => {
        if (noteIds.includes(note.id)) {
          return { ...note, folderId, updatedAt: Date.now() };
        }
        return note;
      });
      
      saveNotes(updatedNotes);
      
      // Update current note if it was moved
      if (currentNote && noteIds.includes(currentNote.id)) {
        const updatedCurrentNote = updatedNotes.find(note => note.id === currentNote.id);
        if (updatedCurrentNote) {
          setCurrentNote(updatedCurrentNote);
        }
      }
      
      return updatedNotes;
    });
    
    clearNoteSelection();
    
    const folderName = folderId 
      ? folders.find(f => f.id === folderId)?.name || 'folder' 
      : 'Unfiled';
    
    toast.success(`${noteIds.length} note${noteIds.length !== 1 ? 's' : ''} moved to ${folderName}`);
  };
  
  // Reorder notes within a folder via drag and drop
  const reorderNotes = (sourceIndex: number, destinationIndex: number, folderId?: string) => {
    setNotes(prevNotes => {
      // Get the notes in the specified folder (or unfiled if no folder)
      const folderNotes = prevNotes
        .filter(note => folderId ? note.folderId === folderId : !note.folderId)
        .sort((a, b) => b.updatedAt - a.updatedAt);
      
      // Get the note being moved
      const movingNote = folderNotes[sourceIndex];
      if (!movingNote) return prevNotes;
      
      // Create a new array with the note removed
      const reorderedNotes = [...folderNotes];
      reorderedNotes.splice(sourceIndex, 1);
      
      // Insert the note at the destination
      reorderedNotes.splice(destinationIndex, 0, movingNote);
      
      // Update the timestamps to maintain the new order
      const updatedNotes = reorderedNotes.map((note, index) => ({
        ...note,
        updatedAt: Date.now() - (index * 1000) // Ensure proper ordering
      }));
      
      // Merge the reordered notes back with the notes from other folders
      const otherNotes = prevNotes.filter(note => 
        folderId ? note.folderId !== folderId : note.folderId !== undefined
      );
      
      const result = [...otherNotes, ...updatedNotes];
      saveNotes(result);
      return result;
    });
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
    selectAllNotes,
    clearNoteSelection,
    moveNotesToFolder,
    reorderNotes,
    isNoteSelected
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
