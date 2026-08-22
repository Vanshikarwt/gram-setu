import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingBag, MessageSquare, User, Sprout, Bell } from 'lucide-react';
import { useStore } from '../store/useStore';
import { NotificationsPanel } from './NotificationsPanel';
import { useTranslation } from '../locales/useTranslation';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { appMode, setAppMode, isAuthenticated, openConversationId, user, notifications } = useStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const { t } = useTranslation();

  // Unread count for the current user only
  const unreadCount = notifications.filter((n) => n.userId === user?.id && !n.isRead).length;

  const fullNavItems = [
    { label: t('nav.home'), path: '/', icon: Home },
    { label: t('nav.search'), path: '/search', icon: Search },
    { label: t('nav.bazaar'), path: '/bazaar', icon: ShoppingBag },
    { label: t('nav.chat'), path: '/chat', icon: MessageSquare },
    { label: t('nav.profile'), path: '/profile', icon: User },
  ];

  // Remove redundant Search item from Consumer mode bottom navigation
  const navItems = appMode === 'consumer'
    ? fullNavItems.filter((item) => item.path !== '/search')
    : fullNavItems;

  // Show header and footer navigation only if authenticated and not on login/signup pages
  const isAuthRoute = ['/login', '/signup'].includes(location.pathname);
  const showNav = isAuthenticated && !isAuthRoute;
  // Hide bottom nav and its padding when inside an active chat thread
  const isChatOpen = showNav && !!openConversationId;

  // Visual header styling tokens based on dual mode
  const headerBg = appMode === 'consumer' ? 'bg-rural-green-50' : 'bg-earth-100';
  const badgeBg = appMode === 'consumer' 
    ? 'bg-rural-green-800 text-cream-50 hover:bg-rural-green-900 border-rural-green-900/10' 
    : 'bg-harvest-gold-dark text-cream-50 hover:bg-harvest-gold border-harvest-gold-dark/10';
  const borderCol = appMode === 'consumer' ? 'border-rural-green-200' : 'border-earth-200';

  return (
    <div className="min-h-screen bg-earth-900/5 flex items-center justify-center sm:py-6 sm:px-4">
      {/* Mobile container: full screen on mobile, phone-shaped mockup on desktop */}
      <div className="w-full h-screen sm:h-[880px] sm:max-w-md sm:rounded-[36px] bg-cream-950 flex flex-col shadow-2xl overflow-hidden border-0 sm:border-8 sm:border-earth-800 relative">
        
        {/* Top App Bar - Visible only when authenticated */}
        {showNav && (
          <header className={`sticky top-0 z-10 flex items-center justify-between px-5 py-3.5 transition-all duration-300 border-b ${headerBg} ${borderCol} select-none`}>
            {/* Logo & Brand */}
            <div className="flex items-center gap-2">
              <div className="bg-rural-green-800 p-1.5 rounded-xl text-cream-50 flex items-center justify-center">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-rural-green-900 font-sans">
                GramSetu
              </span>
            </div>

            {/* Mode Switcher Toggle + Bell + Avatar */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAppMode(appMode === 'consumer' ? 'provider' : 'consumer')}
                type="button"
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1 active:scale-95 shadow-sm border ${badgeBg}`}
              >
                <span className="w-2 h-2 rounded-full bg-cream-50 animate-pulse" />
                {appMode === 'consumer' ? t('header.consumerMode') : t('header.providerMode')}
              </button>

              {/* Bell icon with unread badge */}
              <button
                onClick={() => setShowNotifications(true)}
                type="button"
                className="relative w-9 h-9 bg-cream-50 rounded-full flex items-center justify-center border border-cream-800 hover:bg-cream-100 transition-colors shadow-sm active:scale-90 outline-none"
                aria-label="Notifications"
              >
                <Bell className="w-4.5 h-4.5 text-earth-700" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center leading-none shadow-md">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* User Avatar */}
              <Link
                to="/profile"
                className="w-9 h-9 bg-cream-50 text-rural-green-800 rounded-full flex items-center justify-center font-bold border border-cream-800 hover:bg-cream-100 transition-colors shadow-sm"
                aria-label="View Profile"
              >
                👤
              </Link>
            </div>
          </header>
        )}

        {/* Notifications Panel Overlay */}
        {showNotifications && (
          <NotificationsPanel onClose={() => setShowNotifications(false)} />
        )}

        {/* Scrollable Main Content Frame */}
        <main className={`flex-1 overflow-y-auto flex flex-col bg-cream-950 ${showNav && !isChatOpen ? 'pb-20' : ''}`}>
          {children}
        </main>

        {/* Sticky Bottom Navigation Bar - Visible only when authenticated */}
        {showNav && !isChatOpen && (
          <nav className="absolute bottom-0 left-0 right-0 z-10 bg-cream-50 border-t border-cream-800 px-2 py-1.5 flex justify-around items-center select-none shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-150 relative min-w-[64px] min-h-[48px] ${
                    isActive
                      ? 'text-rural-green-800 font-bold scale-105'
                      : 'text-earth-500 hover:text-earth-800 font-medium'
                  }`}
                  aria-label={item.label}
                >
                  {/* Active background indicator */}
                  {isActive && (
                    <span className="absolute inset-x-2 top-0 bottom-0 bg-rural-green-100/60 rounded-2xl -z-10" />
                  )}
                  
                  <Icon className={`w-6 h-6 stroke-[2.2] ${isActive ? 'text-rural-green-800' : 'text-earth-450'}`} />
                  <span className="text-[10px] tracking-wide mt-1 uppercase font-sans">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        )}

      </div>
    </div>
  );
};
