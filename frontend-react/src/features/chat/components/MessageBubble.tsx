import React from 'react';
import { format } from 'date-fns';
import { FileIcon, ImageIcon, VideoIcon, DownloadCloud, Reply, MessageSquare, MoreVertical, Pin, Trash, Edit } from 'lucide-react';
import type { Message } from '../../../hooks/useChatWebSocket';
import { useAuthStore } from '../../../store/authStore';

interface MessageBubbleProps {
  message: Message;
  isAdmin?: boolean;
  onReply?: (msg: Message) => void;
  onReact?: (msg: Message, emoji: string) => void;
  onEdit?: (msg: Message) => void;
  onDelete?: (msgId: number) => void;
  onPin?: (msg: Message) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  onReply, 
  onReact, 
  onEdit, 
  onDelete, 
  onPin 
}) => {
  const { user } = useAuthStore();
  const isMe = message.senderId.toString() === user?.id;
  const isSystem = message.type === 'TEXT' && message.content.includes('joined the group');

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <span className="px-3 py-1 text-xs font-medium text-slate-500 bg-slate-100 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  const renderContent = () => {
    if (message.deleted) {
      return <span className="text-slate-400 italic">This message was deleted</span>;
    }

    switch (message.type) {
      case 'IMAGE':
        return (
          <div className="space-y-2">
            <img 
              src={message.fileUrl} 
              alt={message.fileName} 
              className="max-w-full rounded-lg shadow-sm border border-slate-200 cursor-zoom-in hover:opacity-95 transition-opacity"
              onClick={() => window.open(message.fileUrl, '_blank')}
            />
          </div>
        );
      case 'VIDEO':
        return (
          <video 
            controls 
            className="max-w-full rounded-lg shadow-sm border border-slate-200"
          >
            <source src={message.fileUrl} />
            Your browser does not support the video tag.
          </video>
        );
      case 'DOCUMENT':
        return (
          <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg border border-slate-200 shadow-sm">
            <div className="p-2 bg-blue-100 text-blue-600 rounded">
              <FileIcon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{message.fileName}</p>
              <p className="text-xs text-slate-500">Document</p>
            </div>
            <a 
              href={message.fileUrl} 
              download 
              className="p-2 text-slate-400 hover:text-primary-600 transition-colors"
            >
              <DownloadCloud size={20} />
            </a>
          </div>
        );
      default:
        return <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>;
    }
  };

  return (
    <div className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'} mb-4 px-4`}>
      {/* Sender Info (Only if not me) */}
      {!isMe && (
        <span className="text-xs font-semibold text-slate-500 mb-1 ml-1 px-1">
          {message.senderName}
        </span>
      )}

      <div className={`flex items-end gap-2 max-w-[85%] sm:max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Message Content Bubble */}
        <div 
          className={`relative px-4 py-2.5 rounded-2xl shadow-sm border transition-all duration-200
            ${isMe 
              ? 'bg-primary-600 text-white border-primary-500 rounded-tr-none' 
              : 'bg-white text-slate-800 border-slate-200 rounded-tl-none hover:border-slate-300'
            }
            ${message.pinned ? 'ring-2 ring-amber-400 ring-offset-1' : ''}
          `}
        >
          {/* Reply Reference */}
          {message.replyTo && (
            <div className={`mb-2 p-2 rounded-lg text-xs border-l-4 overflow-hidden
              ${isMe ? 'bg-primary-700/50 border-white/50 text-white/80' : 'bg-slate-50 border-slate-300 text-slate-500'}
            `}>
              <div className="flex items-center gap-1 mb-1 font-bold">
                <Reply size={12} />
                <span>{message.replyTo.senderName}</span>
              </div>
              <p className="truncate line-clamp-2">{message.replyTo.content}</p>
            </div>
          )}

          {renderContent()}

          {/* Timestamp & Meta */}
          <div className={`flex items-center gap-1 text-[10px] mt-1.5 ${isMe ? 'text-primary-200 justify-end' : 'text-slate-400'}`}>
            {message.pinned && <Pin size={10} className="fill-current text-amber-400" />}
            {message.edited && <span>(edited)</span>}
            <span>{format(new Date(message.createdAt), 'h:mm a')}</span>
          </div>
        </div>

        {/* Quick Actions (Hover) */}
        {!message.deleted && (
          <div className="opacity-0 group-hover:opacity-100 flex flex-col items-center gap-1 mb-2 transition-opacity">
            <button 
              onClick={() => onReply?.(message)}
              className="p-1.5 bg-white border border-slate-200 text-slate-400 hover:text-primary-600 rounded-full shadow-sm hover:shadow-md transition-all"
              title="Reply"
            >
              <Reply size={14} />
            </button>
            
            <div className="relative group/more">
              <button className="p-1.5 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 rounded-full shadow-sm">
                <MoreVertical size={14} />
              </button>
              
              <div className="absolute left-full ml-2 bottom-0 hidden group-hover/more:block bg-white border border-slate-200 rounded-lg shadow-xl py-1 min-w-[120px] z-10">
                {isMe && !message.deleted && (
                   <button 
                    onClick={() => onEdit?.(message)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <Edit size={12} /> Edit
                  </button>
                )}
                <button 
                  onClick={() => onPin?.(message)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <Pin size={12} /> {message.pinned ? 'Unpin' : 'Pin'}
                </button>
                {(isMe || user?.roles.includes('ADMIN')) && (
                   <button 
                    onClick={() => onDelete?.(message.id)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash size={12} /> Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reactions Bar */}
      {message.reactions && (
        <div className={`flex flex-wrap gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
          {message.reactions.split(',').map((react, i) => {
            const [emoji, userId] = react.split(':');
            return (
              <span key={i} className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-xs rounded-full shadow-sm">
                {emoji}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
