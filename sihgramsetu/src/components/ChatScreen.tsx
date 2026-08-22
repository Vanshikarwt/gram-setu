import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Conversation } from '../store/useStore';

interface ChatScreenProps {
  conversation: Conversation;
  onBack: () => void;
}

function timeLabel(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ conversation, onBack }) => {
  const { user, messages, fetchMessages, sendChatMessage } = useStore();
  const [inputText, setInputText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch messages from backend API when opening thread
  useEffect(() => {
    fetchMessages(conversation.id);
  }, [conversation.id, fetchMessages]);

  // Messages in this thread
  const threadMessages = messages
    .filter((m) => m.conversationId === conversation.id)
    .sort((a, b) => a.timestamp - b.timestamp);

  // Other participant name
  const otherUserId = conversation.participantIds.find((id) => id !== user?.id) ?? '';
  const otherUserName = conversation.participantNames[otherUserId] ?? 'Unknown';

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadMessages.length]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || !user) return;

    setInputText('');
    await sendChatMessage(conversation.id, text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-cream-950 z-20">
      {/* ── Header ── */}
      <header className="flex items-center gap-3 px-4 py-3.5 bg-cream-50 border-b border-cream-800 shadow-xs shrink-0">
        <button
          onClick={onBack}
          type="button"
          className="p-2 rounded-xl bg-cream-100 hover:bg-cream-200 text-earth-700 active:scale-90 transition-transform outline-none"
          aria-label="Back to inbox"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Avatar + Name */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-full bg-rural-green-100 text-rural-green-800 flex items-center justify-center font-bold text-sm border border-rural-green-200 shrink-0">
            {otherUserName.charAt(0)}
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-sm text-earth-900 truncate">{otherUserName}</h2>
            <p className="text-[10px] text-rural-green-700 font-semibold">● ऑनलाइन (Online)</p>
          </div>
        </div>
      </header>

      {/* ── Message Bubbles ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {threadMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-earth-400 px-8">
            <span className="text-5xl mb-3">💬</span>
            <p className="font-bold text-sm text-earth-600">
              नमस्ते! बातचीत शुरू करें।
            </p>
            <p className="text-xs mt-1">Say hello to start the conversation.</p>
          </div>
        )}

        {threadMessages.map((msg) => {
          const isMine = msg.senderId === user?.id;
          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
            >
              {/* Avatar for received messages */}
              {!isMine && (
                <div className="w-7 h-7 rounded-full bg-earth-200 text-earth-700 flex items-center justify-center font-bold text-xs mr-2 shrink-0 self-end mb-1">
                  {otherUserName.charAt(0)}
                </div>
              )}

              <div className={`max-w-[75%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed ${
                    isMine
                      ? 'bg-rural-green-800 text-cream-50 rounded-br-sm'
                      : 'bg-cream-50 text-earth-900 border border-cream-800 shadow-xs rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-earth-400 mt-1 px-1">
                  {timeLabel(msg.timestamp)}
                </span>
              </div>
            </div>
          );
        })}
        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* ── Message Input ── */}
      <div className="shrink-0 px-4 py-3 bg-cream-50 border-t border-cream-800 flex items-center gap-2">
        <input
          type="text"
          placeholder="संदेश लिखें (Type a message)..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-4 py-3 bg-cream-100 border border-cream-800 focus:border-rural-green-600 rounded-2xl outline-none text-sm text-earth-900 font-medium transition-colors"
          autoFocus
        />
        <button
          onClick={handleSend}
          type="button"
          disabled={!inputText.trim()}
          className="w-11 h-11 bg-rural-green-800 text-cream-50 rounded-full flex items-center justify-center shadow-md hover:bg-rural-green-900 active:scale-90 transition-all outline-none disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          aria-label="Send message"
        >
          <Send className="w-4.5 h-4.5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
