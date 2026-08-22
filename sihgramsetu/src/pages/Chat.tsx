import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { ChatScreen } from '../components/ChatScreen';
import { FriendlyEmptyState } from '../components/FriendlyEmptyState';
import { useTranslation } from '../locales/useTranslation';

function timeLabel(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

const Chat: React.FC = () => {
  const {
    user,
    conversations,
    messages,
    openConversationId,
    setOpenConversationId,
    fetchConversations,
  } = useStore();
  const { t } = useTranslation();

  // Load conversations from backend API on mount
  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  // Sort conversations newest first
  const sortedConversations = [...conversations].sort((a, b) => b.timestamp - a.timestamp);

  const activeConversation = openConversationId
    ? conversations.find((c) => c.id === openConversationId) ?? null
    : null;

  // ── Active Chat View ────────────────────────────────────────────────────────
  if (activeConversation) {
    return (
      <div className="flex-1 relative">
        <ChatScreen
          conversation={activeConversation}
          onBack={() => setOpenConversationId(null)}
        />
      </div>
    );
  }

  // ── Inbox View ──────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col py-3">
      {/* Header */}
      <div className="px-4 mb-4">
        <h1 className="text-2xl font-extrabold text-earth-900 tracking-tight">
          {t('chat.heading')}
        </h1>
        <p className="text-xs text-earth-550 font-medium">
          {t('chat.subheading')}
        </p>
      </div>

      {/* Conversations list or empty state */}
      {sortedConversations.length === 0 ? (
        <div className="flex-1 flex flex-col justify-center">
          <FriendlyEmptyState
            iconName="MessageSquare"
            title={t('chat.noMessages')}
            description={t('chat.noMessagesDesc')}
            actionText=""
            onAction={() => {}}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto divide-y divide-cream-800/40">
          {sortedConversations.map((conv) => {
            const otherId = conv.participantIds.find((id) => id !== user?.id) ?? '';
            const otherName = conv.participantNames[otherId] ?? 'Unknown';
            const unreadCount = messages.filter(
              (m) => m.conversationId === conv.id && m.senderId !== user?.id
            ).length; // simplified unread badge

            return (
              <button
                key={conv.id}
                onClick={() => setOpenConversationId(conv.id)}
                type="button"
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-cream-50 active:bg-cream-100 transition-colors text-left outline-none"
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-rural-green-100 text-rural-green-800 flex items-center justify-center font-bold text-lg border border-rural-green-200 shrink-0">
                  {otherName.charAt(0)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm text-earth-900 truncate">{otherName}</span>
                    <span className="text-[10px] text-earth-400 font-semibold shrink-0">
                      {timeLabel(conv.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-earth-500 font-medium truncate mt-0.5">
                    {conv.lastMessageText || t('chat.startConversation')}
                  </p>
                </div>

                {/* Unread dot indicator */}
                {unreadCount > 0 && (
                  <div className="w-2.5 h-2.5 rounded-full bg-rural-green-700 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Chat;
