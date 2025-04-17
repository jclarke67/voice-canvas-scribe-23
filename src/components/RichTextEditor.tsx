
import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Heading from '@tiptap/extension-heading';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
  Code,
  Quote,
} from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange, placeholder = "Type your note here..." }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Image.configure({
        allowBase64: true,
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt('Enter the URL of the image:');
    
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter the URL:', previousUrl);
    
    if (url === null) {
      return;
    }
    
    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    
    // Add https if no protocol is specified
    const finalUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;
    
    editor.chain().focus().extendMarkRange('link').setLink({ href: finalUrl }).run();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      const reader = new FileReader();
      
      reader.onload = (readerEvent) => {
        const imageDataUrl = readerEvent.target?.result as string;
        editor.chain().focus().setImage({ src: imageDataUrl }).run();
      };
      
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="border rounded-md">
      <TooltipProvider delayDuration={300}>
        <div className="border-b p-2 bg-muted/50 flex flex-wrap gap-1">
          <div className="flex items-center gap-1 mr-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={cn(editor.isActive('bold') && 'bg-accent')}
                >
                  <Bold className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bold</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={cn(editor.isActive('italic') && 'bg-accent')}
                >
                  <Italic className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Italic</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => editor.chain().focus().toggleCode().run()}
                  className={cn(editor.isActive('code') && 'bg-accent')}
                >
                  <Code className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Code</TooltipContent>
            </Tooltip>
          </div>
          
          <div className="w-px h-6 bg-border mx-1" />
          
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Heading1 className="h-4 w-4" />
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Heading</TooltipContent>
            </Tooltip>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                <Heading1 className="h-4 w-4 mr-2" />
                Heading 1
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                <Heading2 className="h-4 w-4 mr-2" />
                Heading 2
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                <Heading3 className="h-4 w-4 mr-2" />
                Heading 3
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="w-px h-6 bg-border mx-1" />
          
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  className={cn(editor.isActive('bulletList') && 'bg-accent')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bullet List</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  className={cn(editor.isActive('orderedList') && 'bg-accent')}
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Ordered List</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  className={cn(editor.isActive('blockquote') && 'bg-accent')}
                >
                  <Quote className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Blockquote</TooltipContent>
            </Tooltip>
          </div>
          
          <div className="w-px h-6 bg-border mx-1" />
          
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={setLink}
                  className={cn(editor.isActive('link') && 'bg-accent')}
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Link</TooltipContent>
            </Tooltip>
            
            <div className="relative">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={addImage}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Image</TooltipContent>
              </Tooltip>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
                title="Upload image"
              />
            </div>
          </div>
          
          <div className="w-px h-6 bg-border mx-1" />
          
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => editor.chain().focus().setTextAlign('left').run()}
                  className={cn(editor.isActive({ textAlign: 'left' }) && 'bg-accent')}
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Align Left</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => editor.chain().focus().setTextAlign('center').run()}
                  className={cn(editor.isActive({ textAlign: 'center' }) && 'bg-accent')}
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Align Center</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => editor.chain().focus().setTextAlign('right').run()}
                  className={cn(editor.isActive({ textAlign: 'right' }) && 'bg-accent')}
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Align Right</TooltipContent>
            </Tooltip>
          </div>
          
          <div className="w-px h-6 bg-border mx-1" />
          
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().undo()}
                >
                  <Undo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().redo()}
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>
      
      <EditorContent 
        editor={editor} 
        className="p-4 min-h-[300px] prose prose-sm max-w-none focus:outline-none"
      />
    </div>
  );
};

export default RichTextEditor;
