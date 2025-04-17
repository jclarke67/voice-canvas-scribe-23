
// Type definitions for the application
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  recordings: Recording[];
}

export interface Recording {
  id: string;
  audioUrl: string;
  duration: number;
  timestamp: number; // Position in the note where recording was added
  createdAt: number;
}

export type NoteContextType = {
  notes: Note[];
  currentNote: Note | null;
  setCurrentNote: (note: Note | null) => void;
  createNote: () => void;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  saveRecording: (noteId: string, recording: Omit<Recording, 'id'>) => void;
};
