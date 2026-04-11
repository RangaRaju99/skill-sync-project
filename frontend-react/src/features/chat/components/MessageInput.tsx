import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, X, Mic } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import type { EmojiClickData } from 'emoji-picker-react';
import type { Message } from '../../../hooks/useChatWebSocket';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onSendFile: (file: File) => void;
  onTyping: (isTyping: boolean) => void;
  replyTo?: Message | null;
  onCancelReply?: () => void;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  onSendFile, 
  onTyping, 
  replyTo, 
  onCancelReply,
  disabled 
}) => {
  const [content, setContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSend = () => {
    if (content.trim()) {
      onSendMessage(content.trim());
      setContent('');
      onTyping(false);
      setIsTyping(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    
    // Typing indicator logic
    if (!isTyping) {
      setIsTyping(true);
      onTyping(true);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTyping(false);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setContent(prev => prev + emojiData.emoji);
    inputRef.current?.focus();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSendFile(file);
      // Reset input
      e.target.value = '';
    }
  };

  return (
    <div className="relative p-4 bg-white border-t border-slate-200">
      {/* Reply Preview */}
      {replyTo && (
        <div className="flex items-center justify-between gap-3 p-3 mb-3 bg-slate-50 border-l-4 border-primary-600 rounded-lg animate-in slide-in-from-bottom-2 fade-in">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-primary-600">Replying to {replyTo.senderName}</p>
            <p className="text-sm text-slate-500 truncate">{replyTo.content}</p>
          </div>
          <button onClick={onCancelReply} className="p-1 text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2 transition-all focus-within:ring-2 focus-within:ring-primary-100 focus-within:border-primary-500">
        {/* Attachments */}
        <label className="p-2 text-slate-400 hover:text-primary-600 cursor-pointer transition-colors rounded-full hover:bg-white">
          <input type="file" className="hidden" onChange={handleFileChange} />
          <Paperclip size={20} />
        </label>

        {/* Emoji Picker */}
        <div ref={emojiPickerRef} className="relative">
          <button 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2 transition-colors rounded-full hover:bg-white ${showEmojiPicker ? 'text-primary-600 bg-white' : 'text-slate-400 hover:text-amber-500'}`}
          >
            <Smile size={20} />
          </button>
          
          {showEmojiPicker && (
            <div className="absolute bottom-full left-0 mb-4 z-50">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
        </div>

        {/* Text Input */}
        <textarea
          ref={inputRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={disabled}
          className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none focus:ring-0 resize-none py-2 text-slate-800 placeholder:text-slate-400 text-sm overflow-y-auto"
          rows={1}
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!content.trim() || disabled}
          className={`p-2.5 rounded-xl transition-all ${
            content.trim() && !disabled 
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 hover:bg-primary-700 active:scale-95' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Send size={20} />
        </button>
      </div>
      
      <p className="mt-2 text-[10px] text-slate-400 text-center">
        Press <span className="font-mono px-1 py-0.5 bg-slate-100 rounded text-slate-500">Enter</span> to send, <span className="font-mono px-1 py-0.5 bg-slate-100 rounded text-slate-500">Shift + Enter</span> for new line
      </p>
    </div>
  );
};

export default MessageInput;
