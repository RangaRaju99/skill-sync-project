import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { useChatWebSocket } from '../../../hooks/useChatWebSocket';
import type { Message as ChatMessage } from '../../../hooks/useChatWebSocket';
import { chatService } from '../../../services/chatService';
import { groupService } from '../../../services/group.service';
import ChatSidebar from '../components/ChatSidebar';
import ChatHeader from '../components/ChatHeader';
import MessageBubble from '../components/MessageBubble';
import MessageInput from '../components/MessageInput';
import TypingIndicator from '../components/TypingIndicator';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Layout, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

const ChatPage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [activeGroupId, setActiveGroupId] = useState<number | null>(null);
  const [availableGroups, setAvailableGroups] = useState<{ id: number; name: string }[]>([]);
  const [replyToMessage, setReplyToMessage] = useState<ChatMessage | null>(null);
  const [showPinned, setShowPinned] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const { 
    messages, 
    setMessages, 
    typingUsers, 
    isConnected, 
    sendMessage, 
    sendTyping 
  } = useChatWebSocket(activeGroupId);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch user's groups on mount
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const groups = await groupService.getMyGroups();
        setAvailableGroups(groups || []);
        if (groups && groups.length > 0) {
            setActiveGroupId(groups[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch groups', err);
      }
    };
    fetchGroups();
  }, []);

  // 2. Initial message fetch when group changes
  useEffect(() => {
    if (activeGroupId) {
      setLoading(true);
      setPage(0);
      chatService.getMessages(activeGroupId, 0)
        .then(data => {
          setMessages(data.content || []);
          setHasMore(!data.last);
        })
        .catch(err => console.error('Failed to load messages', err))
        .finally(() => setLoading(false));
    }
  }, [activeGroupId, setMessages]);

  // 3. Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (content: string) => {
    sendMessage(content, replyToMessage?.id);
    setReplyToMessage(null);
  };

  const handleSendFile = async (file: File) => {
    if (!activeGroupId) return;
    try {
        // The service uploads and broadcasts to everyone including ME
        // so we don't need to manually update state here
        await chatService.uploadFile(file, activeGroupId);
    } catch (err) {
        console.error('File upload failed', err);
        alert('File upload failed. Please check size limits.');
    }
  };

  const handleDeleteMessage = async (msgId: number) => {
    try {
        await chatService.deleteMessage(msgId);
        // WS will broadcast deletion
    } catch (err) {
        console.error('Delete failed', err);
    }
  };

  const currentGroupName = availableGroups.find(g => g.id === activeGroupId)?.name || 'Select a group';

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <ChatSidebar 
              groups={availableGroups}
              activeGroupId={activeGroupId}
              onSelectGroup={setActiveGroupId}
              onLogout={logout}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">
        <ChatHeader 
          name={currentGroupName}
          memberCount={isConnected ? 42 : 0}
          onShowPinned={() => setShowPinned(!showPinned)}
        />

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-1 py-4 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
          {loading && page === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-500 font-medium">Loading conversation...</p>
            </div>
          ) : (
            <>
              {/* Pagination sentinel would go here */}
              
              <div className="flex flex-col-reverse">
                {messages.map((msg, index) => (
                  <MessageBubble 
                    key={`${msg.id}-${index}`}
                    message={msg}
                    onReply={setReplyToMessage}
                    onDelete={handleDeleteMessage}
                  />
                ))}
              </div>

              {messages.length === 0 && !loading && (
                 <div className="flex flex-col items-center justify-center h-full text-center px-10">
                    <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 mb-6">
                        <MessageSquare size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No messages yet</h3>
                    <p className="text-slate-500 max-w-sm">
                        This is the beginning of the <span className="text-primary-600 font-bold">#{currentGroupName}</span> group. 
                        Start the conversation by sending a message!
                    </p>
                 </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="relative">
          <TypingIndicator typingUsers={typingUsers} />
          <MessageInput 
            onSendMessage={handleSendMessage}
            onSendFile={handleSendFile}
            onTyping={sendTyping}
            replyTo={replyToMessage}
            onCancelReply={() => setReplyToMessage(null)}
            disabled={!isConnected}
          />
        </div>

        {/* Toggle Sidebar Button (Floating) */}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`absolute bottom-24 ${sidebarOpen ? '-left-6' : 'left-4'} p-3 bg-white border border-slate-200 text-slate-400 hover:text-primary-600 rounded-full shadow-lg z-50 transition-all hover:scale-110`}
        >
          {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
        </button>
      </div>

      {/* Connection Status Overlay */}
      {!isConnected && (
         <div className="absolute top-20 right-8 bg-red-500 text-white px-4 py-2 rounded-xl shadow-xl z-50 flex items-center gap-2 animate-bounce">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">Connecting to Real-time...</span>
         </div>
      )}
    </div>
  );
};

export default ChatPage;
