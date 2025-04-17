
import React from 'react';
import { Mic, ShieldAlert } from 'lucide-react';

interface PermissionPromptProps {
  onRequestPermission: () => void;
  onCancel: () => void;
}

const PermissionPrompt: React.FC<PermissionPromptProps> = ({ 
  onRequestPermission,
  onCancel 
}) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-card border rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="mb-5 flex justify-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Mic size={32} className="text-primary" />
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-center mb-2">Microphone Access</h3>
        
        <p className="text-muted-foreground text-center mb-6">
          Voice Canvas needs microphone access to record voice notes. Your recordings are stored locally on your device.
        </p>
        
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded-md hover:bg-accent transition-colors"
          >
            Not Now
          </button>
          
          <button
            onClick={onRequestPermission}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center"
          >
            <ShieldAlert size={16} className="mr-2" />
            Allow Microphone
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionPrompt;
