
// Type definitions for the application
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  recordings: Recording[];
  folderId?: string; // Optional folder association
}

export interface Recording {
  id: string;
  name: string; // Added name field for recordings
  audioUrl: string;
  duration: number;
  timestamp: number; // Position in the note where recording was added
  createdAt: number;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: number;
  order?: number; // Added for drag and drop ordering
}

export type NoteContextType = {
  notes: Note[];
  folders: Folder[];
  currentNote: Note | null;
  selectedNotes: string[]; // Added for multi-selection
  setCurrentNote: (note: Note | null) => void;
  createNote: (folderId?: string) => void;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  deleteNotes: (ids: string[]) => void; // Added for multi-deletion
  saveRecording: (noteId: string, recording: Omit<Recording, 'id' | 'name'>) => void;
  updateRecording: (noteId: string, recordingId: string, updates: Partial<Recording>) => void;
  deleteRecording: (noteId: string, recordingId: string) => void;
  createFolder: (name: string) => void;
  updateFolder: (id: string, name: string) => void;
  deleteFolder: (id: string) => void;
  importRecording: (noteId: string, file: File) => Promise<void>;
  exportRecording: (recording: Recording) => void;
  toggleNoteSelection: (noteId: string) => void; // Added for multi-selection
  clearSelectedNotes: () => void; // Added for multi-selection
  moveNotesToFolder: (noteIds: string[], folderId?: string) => void; // Added for multi-move
  reorderNotes: (noteIds: string[], folderId?: string, startIndex: number, endIndex: number) => void; // Added for drag and drop
  reorderFolders: (result: {source: {index: number}, destination: {index: number}}) => void; // Added for folder reordering
};
