import React from 'react';
import { MapPin, Clock, MessageCircle, HandHelping, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import type { BazaarPost } from '../store/useStore';
import { useTranslation } from '../locales/useTranslation';

interface BazaarPostCardProps {
  post: BazaarPost;
}

function timeAgo(timestamp: number, t: (key: any) => string): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return t('bazaar.justNow');
  if (minutes < 60) return `${minutes}${t('bazaar.minAgo')}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}${t('bazaar.hrAgo')}`;
  const days = Math.floor(hours / 24);
  return `${days}${t('bazaar.dayAgo')}`;
}

export const BazaarPostCard: React.FC<BazaarPostCardProps> = ({ post }) => {
  const navigate = useNavigate();
  const { user, getOrCreateConversation, setOpenConversationId } = useStore();
  const { t } = useTranslation();
  const isNeed = post.type === 'need';

  const accentBg     = isNeed ? 'bg-harvest-orange/10'   : 'bg-rural-green-100';
  const accentText   = isNeed ? 'text-harvest-orange-dark' : 'text-rural-green-800';
  const accentBorder = isNeed ? 'border-harvest-orange/20' : 'border-rural-green-200';
  const badgeBg      = isNeed ? 'bg-harvest-orange text-cream-50' : 'bg-rural-green-800 text-cream-50';
  const Icon         = isNeed ? HandHelping : Gift;
  const typeLabel = isNeed ? t('bazaar.needType') : t('bazaar.offerType');

  const handleReply = () => {
    if (!user) return;
    // Don't open a chat with yourself
    if (post.authorId === user.id) return;

    const convId = getOrCreateConversation(post.authorId, post.authorName);
    setOpenConversationId(convId);
    navigate('/chat');
  };

  const isSelf = user?.id === post.authorId;

  return (
    <div className={`bg-cream-50 border rounded-3xl p-4 shadow-xs select-none ${accentBorder}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border ${accentBg} ${accentText} border-cream-800`}>
            {post.authorName.charAt(0)}
          </div>
          <div>
            <h4 className="font-bold text-sm text-earth-900 leading-tight">{post.authorName}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3 h-3 text-earth-400" />
              <span className="text-[10px] text-earth-500 font-semibold">{post.location}</span>
            </div>
          </div>
        </div>
        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold ${badgeBg}`}>
          <Icon className="w-3 h-3" />
          {typeLabel}
        </span>
      </div>

      {/* Content */}
      <p className="text-sm text-earth-800 font-medium leading-relaxed mb-3 pl-0.5">
        {post.content}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-cream-800/40">
        <div className="flex items-center gap-1 text-[10px] text-earth-400 font-semibold">
          <Clock className="w-3 h-3" />
          <span>{timeAgo(post.timestamp, t)}</span>
        </div>

        <button
          onClick={handleReply}
          type="button"
          disabled={isSelf}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all outline-none active:scale-95 border ${
            isSelf
              ? `opacity-40 cursor-not-allowed ${accentBg} ${accentText} ${accentBorder}`
              : `${accentBg} ${accentText} ${accentBorder} hover:opacity-80`
          }`}
          title={isSelf ? 'यह आपकी पोस्ट है' : 'Reply to this post'}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          {isSelf ? t('bazaar.postedBy') : t('bazaar.contactBtn')}
        </button>
      </div>
    </div>
  );
};
