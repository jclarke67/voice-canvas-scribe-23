
import React from 'react';
import { Keyboard, X } from 'lucide-react';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ 
  isOpen,
  onClose 
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-card border rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Keyboard size={18} className="mr-2 text-primary" />
            <h3 className="text-lg font-semibold">Keyboard Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-accent transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="border-b pb-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Create new note</span>
              <kbd className="px-2 py-1 bg-accent rounded text-xs">Ctrl+N</kbd>
            </div>
            <p className="text-xs text-muted-foreground">
              Creates a fresh note and selects it for editing.
            </p>
          </div>
          
          <div className="border-b pb-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Start/stop recording</span>
              <kbd className="px-2 py-1 bg-accent rounded text-xs">Ctrl+R</kbd>
            </div>
            <p className="text-xs text-muted-foreground">
              Toggles voice recording on and off in the current note.
            </p>
          </div>
          
          <div className="border-b pb-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Toggle theme</span>
              <kbd className="px-2 py-1 bg-accent rounded text-xs">Ctrl+T</kbd>
            </div>
            <p className="text-xs text-muted-foreground">
              Switches between light and dark mode.
            </p>
          </div>
          
          <div className="border-b pb-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Toggle sidebar</span>
              <kbd className="px-2 py-1 bg-accent rounded text-xs">Ctrl+B</kbd>
            </div>
            <p className="text-xs text-muted-foreground">
              Shows or hides the notes sidebar.
            </p>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Show keyboard shortcuts</span>
              <kbd className="px-2 py-1 bg-accent rounded text-xs">?</kbd>
            </div>
            <p className="text-xs text-muted-foreground">
              Displays this keyboard shortcuts help dialog.
            </p>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsHelp;
