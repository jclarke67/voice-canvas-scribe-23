
import { useEffect, useCallback } from 'react';
import { useNotes } from '@/context/NoteContext';

export const useKeyboardShortcuts = (startRecording: () => void, stopRecording: () => void, isRecording: boolean) => {
  const { createNote } = useNotes();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Cmd/Ctrl + N: Create new note
    if ((event.metaKey || event.ctrlKey) && event.key === 'n') {
      event.preventDefault();
      createNote();
    }
    
    // Cmd/Ctrl + R: Toggle recording
    if ((event.metaKey || event.ctrlKey) && event.key === 'r') {
      event.preventDefault();
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    }
  }, [createNote, startRecording, stopRecording, isRecording]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};
