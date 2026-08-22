import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../utils/api';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  village: string;
  state: string;
  preferredLanguage: string;
}

export interface Listing {
  id: string;
  providerId: string;
  type: 'machinery' | 'labor' | 'crop_residue' | 'storage' | 'agri_product';
  title: string;
  description: string;
  price: number;
  unit: 'per hour' | 'per day' | 'per quintal' | 'per tonne' | 'per kg' | 'per unit';
  location: string;
  status: 'active' | 'inactive';
  imageUrl?: string;
  category?: string;
  capacity?: number | null;   // Storage listings: max capacity in tonnes
  stock?: number | null;      // Agri product / crop residue: qty in stock
  hourlyPrice?: number | null;// Per-hour rate e.g. 500
  dailyPrice?: number | null; // Per-day rate e.g. 3000
  averageRating?: number | null; // Computed from reviews; returned by getListings
  reviewCount?: number;          // Total number of reviews for this listing
}

export interface BazaarPost {
  id: string;
  authorId: string;
  authorName: string;
  type: 'need' | 'offer';
  content: string;
  location: string;
  timestamp: number; // Unix ms
}

// ─── Chat entities ────────────────────────────────────────────────────────────

export interface Conversation {
  id: string;
  /** exactly two participant user IDs */
  participantIds: [string, string];
  /** display name keyed by userId */
  participantNames: Record<string, string>;
  lastMessageText: string;
  timestamp: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: number;
}

// ─────────────────────────────────────────────────────────────────────────────

// ─── Booking entity ───────────────────────────────────────────────────────────

export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'paid' | 'active' | 'completed';

export interface Booking {
  id: string;
  listingId: string;
  listingTitle: string;
  listingType?: 'machinery' | 'labor' | 'crop_residue' | 'storage' | 'agri_product';
  listingLocation?: string;
  consumerId: string;
  consumerName: string;
  providerId: string;
  date: string;        // ISO date string (YYYY-MM-DD)
  endDate?: string;    // End ISO date string (YYYY-MM-DD) if multi-day
  quantity: number;    // hours or days depending on bookingType
  unit: 'per hour' | 'per day';
  totalPrice: number;
  bookingType?: 'hourly' | 'daily';
  hours?: number;
  days?: number;
  rate?: number;       // Agreed rate at booking creation
  status: BookingStatus;
  timestamp: number;
}

// ─────────────────────────────────────────────────────────────────────────────

// ─── Transaction entity ─────────────────────────────────────────────────────────

export type PaymentMethod = 'UPI' | 'Card' | 'NetBanking' | 'Cash';

export interface Transaction {
  id: string;
  bookingId: string;
  consumerId: string;
  providerId: string;
  amount: number;
  method: PaymentMethod;
  status: 'success';
  timestamp: number;
}

// ─────────────────────────────────────────────────────────────────────────────

// ─── Review entity ────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  bookingId: string;
  listingId: string;
  consumerId: string;
  consumerName: string;
  providerId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  timestamp: number;
}

// ─────────────────────────────────────────────────────────────────────────────

// ─── Notification entity ──────────────────────────────────────────────────────

export type NotificationType = 'booking' | 'payment' | 'chat' | 'system';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  type: NotificationType;
  timestamp: number;
}

// ─────────────────────────────────────────────────────────────────────────────

export type AppMode = 'consumer' | 'provider';



interface AppState {
  // Authentication & Settings state
  user: UserProfile | null;
  isAuthenticated: boolean;
  appMode: AppMode;
  language: string | null;

  // Listings state (Mock database)
  listings: Listing[];

  // Bazaar community posts
  bazaarPosts: BazaarPost[];

  // Chat state
  conversations: Conversation[];
  messages: Message[];
  /** When non-null, a chat thread is open — Layout hides the bottom nav */
  openConversationId: string | null;

  // Bookings
  bookings: Booking[];

  // Transactions
  transactions: Transaction[];

  // Reviews
  reviews: Review[];

  // Notifications
  notifications: AppNotification[];

  // Recently viewed listing IDs (tracked locally for the current session)
  viewedListingIds: string[];

  // Actions
  setUser: (user: UserProfile | null) => void;
  setAppMode: (mode: AppMode) => void;
  setLanguage: (lang: string) => void;
  login: (phone: string, password?: string) => Promise<void>;
  registerUser: (userData: { name: string; phone: string; password?: string; location: string; preferredLanguage?: string }) => Promise<void>;
  fetchProfile: () => Promise<void>;

  // Listing CRUD Actions
  fetchListings: (params?: { q?: string; type?: string; location?: string }) => Promise<void>;
  fetchMyListings: () => Promise<void>;
  addListing: (listing: Omit<Listing, 'id' | 'providerId'>) => Promise<void>;
  updateListing: (id: string, updated: Partial<Listing>) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;

  // Bazaar Actions
  fetchBazaarPosts: () => Promise<void>;
  createBazaarPostApi: (postData: { type: 'need' | 'offer'; content: string; location?: string }) => Promise<BazaarPost>;
  addBazaarPost: (post: BazaarPost) => void;

  // Chat Actions
  /** Open a conversation (creates one if it doesn't exist between these two users). */
  getOrCreateConversation: (
    otherUserId: string,
    otherUserName: string
  ) => string; // returns conversationId
  addMessage: (message: Message) => void;
  setOpenConversationId: (id: string | null) => void;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendChatMessage: (conversationId: string, text: string) => Promise<void>;
  startConversationWithUser: (targetUserId: string) => Promise<string | null>;

  // Booking Actions
  fetchMyRequests: () => Promise<void>;
  fetchIncomingRequests: () => Promise<void>;
  addBooking: (booking: {
    listingId: string;
    startDate: string;
    endDate?: string;
    dates?: string[];
    quantity?: number;
    hours?: number;
    days?: number;
    bookingType?: 'hourly' | 'daily';
  }) => Promise<void>;
  updateBookingStatus: (id: string, status: BookingStatus) => Promise<void>;
  checkoutBooking: (bookingId: string, method: PaymentMethod) => Promise<any>;

  // Transaction Actions
  addTransaction: (transaction: Transaction) => void;

  // Review Actions
  addReview: (reviewData: { bookingId: string; rating: number; comment?: string }) => Promise<any>;

  // Notification Actions
  fetchNotifications: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;

  // Payment History Actions
  fetchPaymentHistory: () => Promise<void>;

  // Analytics Actions
  fetchProviderAnalytics: () => Promise<{ totalRevenue: number; jobsCompleted: number; activeListingsCount: number } | null>;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;

  // Recently viewed tracking
  addViewedListing: (id: string) => void;

  logout: () => void;
}

const mapDbBookingToAppBooking = (dbB: any): Booking => ({
  id: dbB.id,
  listingId: dbB.listingId,
  listingTitle: dbB.listing?.title || 'Unknown Asset',
  listingType: dbB.listing?.type || 'machinery',
  listingLocation: dbB.listing?.location || '',
  consumerId: dbB.consumerId,
  consumerName: dbB.consumer?.name || 'Unknown Consumer',
  providerId: dbB.providerId,
  date: new Date(dbB.startDate).toISOString().split('T')[0],
  endDate: dbB.endDate ? new Date(dbB.endDate).toISOString().split('T')[0] : undefined,
  quantity: dbB.quantity,
  unit: dbB.bookingType === 'daily' ? 'per day' : (dbB.listing?.unit || 'per hour'),
  totalPrice: dbB.totalPrice,
  bookingType: dbB.bookingType || (dbB.hours ? 'hourly' : 'daily'),
  hours: dbB.hours ?? undefined,
  days: dbB.days ?? undefined,
  rate: dbB.rate ?? undefined,
  status: dbB.status as BookingStatus,
  timestamp: new Date(dbB.createdAt).getTime(),
});

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      isAuthenticated: false,
      appMode: 'consumer',
      language: localStorage.getItem('gramsetu_language') ?? null,
      listings: [],
      bazaarPosts: [],
      conversations: [],
      messages: [],
      openConversationId: null,
      bookings: [],
      transactions: [],
      reviews: [],
      notifications: [],
      viewedListingIds: [],

      // Auth & Settings
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAppMode: (appMode) => set({ appMode }),
      setLanguage: (language) => {
        localStorage.setItem('gramsetu_language', language);
        set({ language });
      },

      login: async (phone, password = 'password123') => {
        try {
          const res = await api.post('/auth/login', { phone, password });
          if (res.token) {
            localStorage.setItem('gramsetu_token', res.token);
          }
          const locStr = res.user.location || '';
          const parts = locStr.split(', ');
          const village = parts[0] || '';
          const stateName = parts[1] || '';

          // Load the user's saved language preference from DB
          const dbLang = res.user.preferredLanguage || null;
          if (dbLang) {
            localStorage.setItem('gramsetu_language', dbLang);
            set({ language: dbLang });
          }
          const profile: UserProfile = {
            id: res.user.id,
            name: res.user.name,
            phone: res.user.phone,
            village,
            state: stateName,
            preferredLanguage: dbLang || get().language || 'hi',
          };
          set({ user: profile, isAuthenticated: true });
        } catch (err: any) {
          throw new Error(err.message || 'Login failed');
        }
      },

      registerUser: async (userData) => {
        try {
          const password = userData.password || 'password123';
          const res = await api.post('/auth/register', {
            name: userData.name,
            phone: userData.phone,
            password,
            location: userData.location,
          });
          if (res.token) {
            localStorage.setItem('gramsetu_token', res.token);
          }
          const locStr = res.user.location || '';
          const parts = locStr.split(', ');
          const village = parts[0] || '';
          const stateName = parts[1] || '';

          const langToSet = userData.preferredLanguage || get().language || 'hi';
          if (langToSet) {
            localStorage.setItem('gramsetu_language', langToSet);
            set({ language: langToSet });
          }
          const profile: UserProfile = {
            id: res.user.id,
            name: res.user.name,
            phone: res.user.phone,
            village,
            state: stateName,
            preferredLanguage: langToSet,
          };
          set({ user: profile, isAuthenticated: true });
        } catch (err: any) {
          throw new Error(err.message || 'Registration failed');
        }
      },

      fetchProfile: async () => {
        try {
          const token = localStorage.getItem('gramsetu_token');
          if (!token) return;

          const res = await api.get('/auth/me');
          const locStr = res.user.location || '';
          const parts = locStr.split(', ');
          const village = parts[0] || '';
          const stateName = parts[1] || '';

          const dbLang = res.user.preferredLanguage || null;
          if (dbLang) {
            localStorage.setItem('gramsetu_language', dbLang);
            set({ language: dbLang });
          }
          const profile: UserProfile = {
            id: res.user.id,
            name: res.user.name,
            phone: res.user.phone,
            village,
            state: stateName,
            preferredLanguage: dbLang || get().language || 'hi',
          };
          set({ user: profile, isAuthenticated: true });
        } catch (err) {
          console.error('Fetch profile failed:', err);
          localStorage.removeItem('gramsetu_token');
          set({ user: null, isAuthenticated: false });
        }
      },

      // Listing Actions
      fetchListings: async (params?: { q?: string; type?: string; location?: string }) => {
        try {
          const queryParts: string[] = [];
          if (params?.q) queryParts.push(`q=${encodeURIComponent(params.q)}`);
          if (params?.type && params.type !== 'all') queryParts.push(`type=${encodeURIComponent(params.type)}`);
          if (params?.location) queryParts.push(`location=${encodeURIComponent(params.location)}`);

          const queryString = queryParts.length ? `?${queryParts.join('&')}` : '';
          const res = await api.get(`/listings${queryString}`);
          set({ listings: res.listings });
        } catch (err) {
          console.error('Fetch listings failed:', err);
        }
      },
      fetchMyListings: async () => {
        try {
          const res = await api.get('/listings/my-listings');
          set({ listings: res.listings });
        } catch (err) {
          console.error('Fetch my listings failed:', err);
        }
      },
      addListing: async (listingData) => {
        try {
          const res = await api.post('/listings', listingData);
          set((state) => ({ listings: [res.listing, ...state.listings] }));
        } catch (err: any) {
          throw new Error(err.message || 'Add listing failed');
        }
      },
      updateListing: async (id, updatedFields) => {
        try {
          const res = await api.put(`/listings/${id}`, updatedFields);
          set((state) => ({
            listings: state.listings.map((l) => l.id === id ? res.listing : l),
          }));
        } catch (err: any) {
          throw new Error(err.message || 'Update listing failed');
        }
      },
      deleteListing: async (id) => {
        try {
          await api.delete(`/listings/${id}`);
          set((state) => ({ listings: state.listings.filter((l) => l.id !== id) }));
        } catch (err: any) {
          throw new Error(err.message || 'Delete listing failed');
        }
      },

      // Bazaar Actions
      fetchBazaarPosts: async () => {
        try {
          const res = await api.get('/bazaar');
          const mapped: BazaarPost[] = res.posts.map((p: any) => ({
            id: p.id,
            authorId: p.authorId,
            authorName: p.author?.name || 'Kisan User',
            type: p.type,
            content: p.content,
            location: p.location || '',
            timestamp: new Date(p.createdAt).getTime(),
          }));
          set({ bazaarPosts: mapped });
        } catch (err) {
          console.error('Fetch bazaar posts error:', err);
        }
      },
      createBazaarPostApi: async (postData) => {
        try {
          const res = await api.post('/bazaar', postData);
          const p = res.post;
          const newPost: BazaarPost = {
            id: p.id,
            authorId: p.authorId,
            authorName: p.author?.name || 'Kisan User',
            type: p.type,
            content: p.content,
            location: p.location || '',
            timestamp: new Date(p.createdAt).getTime(),
          };
          set((state) => ({ bazaarPosts: [newPost, ...state.bazaarPosts] }));
          return newPost;
        } catch (err) {
          console.error('Create bazaar post error:', err);
          throw err;
        }
      },
      addBazaarPost: (post) =>
        set((state) => ({
          bazaarPosts: [post, ...state.bazaarPosts],
        })),

      // Chat Actions
      getOrCreateConversation: (otherUserId, otherUserName) => {
        const { user, conversations } = get();
        if (!user) return '';

        // Check if a conversation already exists between the two users
        const existing = conversations.find(
          (c) =>
            c.participantIds.includes(user.id) &&
            c.participantIds.includes(otherUserId)
        );
        if (existing) return existing.id;

        // Create a new one
        const newConv: Conversation = {
          id: `conv_${Math.random().toString(36).substr(2, 9)}`,
          participantIds: [user.id, otherUserId],
          participantNames: {
            [user.id]: user.name,
            [otherUserId]: otherUserName,
          },
          lastMessageText: '',
          timestamp: Date.now(),
        };
        set((state) => ({ conversations: [newConv, ...state.conversations] }));
        return newConv.id;
      },

      addMessage: (message) =>
        set((state) => {
          const updatedConversations = state.conversations.map((conv) => {
            if (conv.id === message.conversationId) {
              return {
                ...conv,
                lastMessageText: message.text,
                timestamp: message.timestamp,
              };
            }
            return conv;
          });

          return {
            messages: [...state.messages, message],
            conversations: updatedConversations,
          };
        }),

      setOpenConversationId: (id) => set({ openConversationId: id }),

      fetchConversations: async () => {
        try {
          const res = await api.get('/chat/conversations');
          const mappedConvs: Conversation[] = res.conversations.map((c: any) => ({
            id: c.id,
            participantIds: [c.user1Id, c.user2Id],
            participantNames: {
              [c.user1.id]: c.user1.name,
              [c.user2.id]: c.user2.name,
            },
            lastMessageText: c.lastMessageText || '',
            timestamp: new Date(c.updatedAt).getTime(),
          }));
          set({ conversations: mappedConvs });
        } catch (err) {
          console.error('Fetch conversations error:', err);
        }
      },

      fetchMessages: async (conversationId: string) => {
        try {
          const res = await api.get(`/chat/conversations/${conversationId}/messages`);
          const mappedMsgs: Message[] = res.messages.map((m: any) => ({
            id: m.id,
            conversationId: m.conversationId,
            senderId: m.senderId,
            text: m.text,
            timestamp: new Date(m.createdAt).getTime(),
          }));
          set((state) => {
            const otherMsgs = state.messages.filter((m) => m.conversationId !== conversationId);
            return { messages: [...otherMsgs, ...mappedMsgs] };
          });
        } catch (err) {
          console.error('Fetch messages error:', err);
        }
      },

      sendChatMessage: async (conversationId: string, text: string) => {
        try {
          const res = await api.post(`/chat/conversations/${conversationId}/messages`, { text });
          const newMsg: Message = {
            id: res.data.id,
            conversationId: res.data.conversationId,
            senderId: res.data.senderId,
            text: res.data.text,
            timestamp: new Date(res.data.createdAt).getTime(),
          };
          set((state) => ({
            messages: [...state.messages, newMsg],
            conversations: state.conversations.map((c) =>
              c.id === conversationId ? { ...c, lastMessageText: text, timestamp: Date.now() } : c
            ),
          }));
        } catch (err) {
          console.error('Send message error:', err);
        }
      },

      startConversationWithUser: async (targetUserId: string) => {
        try {
          const res = await api.post('/chat/conversations', { targetUserId });
          const c = res.conversation;
          const newConv: Conversation = {
            id: c.id,
            participantIds: [c.user1Id, c.user2Id],
            participantNames: {
              [c.user1.id]: c.user1.name,
              [c.user2.id]: c.user2.name,
            },
            lastMessageText: c.lastMessageText || '',
            timestamp: new Date(c.updatedAt).getTime(),
          };
          set((state) => {
            const exists = state.conversations.find((x) => x.id === newConv.id);
            return {
              conversations: exists ? state.conversations : [newConv, ...state.conversations],
              openConversationId: newConv.id,
            };
          });
          return newConv.id;
        } catch (err) {
          console.error('Start conversation error:', err);
          return null;
        }
      },

      // Booking Actions
      fetchMyRequests: async () => {
        try {
          const res = await api.get('/bookings/my-requests');
          const mapped = res.bookings.map(mapDbBookingToAppBooking);
          set({ bookings: mapped });
        } catch (err) {
          console.error('Fetch my requests failed:', err);
        }
      },
      fetchIncomingRequests: async () => {
        try {
          const res = await api.get('/bookings/incoming');
          const mapped = res.bookings.map(mapDbBookingToAppBooking);
          set({ bookings: mapped });
        } catch (err) {
          console.error('Fetch incoming requests failed:', err);
        }
      },
      addBooking: async (bookingData) => {
        try {
          const res = await api.post('/bookings', bookingData);
          const mapped = mapDbBookingToAppBooking(res.booking);
          set((state) => ({ bookings: [mapped, ...state.bookings] }));
        } catch (err: any) {
          throw new Error(err.message || 'Add booking failed');
        }
      },

      updateBookingStatus: async (id, status) => {
        try {
          const res = await api.put(`/bookings/${id}/status`, { status });
          const mapped = mapDbBookingToAppBooking(res.booking);
          set((state) => ({
            bookings: state.bookings.map((b) => b.id === id ? mapped : b),
          }));

          // Generate contextual local notifications for visual feedback
          const newNotifs: AppNotification[] = [];
          const ts = Date.now();
          const mkId = () => `notif_${Math.random().toString(36).substr(2, 9)}`;

          if (status === 'accepted') {
            newNotifs.push({
              id: mkId(), userId: mapped.consumerId, isRead: false, type: 'booking', timestamp: ts,
              title: '✅ बुकिंग स्वीकृत! (Booking Accepted)',
              message: `आपकी “${mapped.listingTitle}” की बुकिंग स्वीकार कर ली गई है। अब भुगतान करें।`,
            });
          } else if (status === 'rejected') {
            newNotifs.push({
              id: mkId(), userId: mapped.consumerId, isRead: false, type: 'booking', timestamp: ts,
              title: '❌ बुकिंग अस्वीकृत (Booking Rejected)',
              message: `दुखद है, “${mapped.listingTitle}” की बुकिंग अस्वीकार कर दी गई। कोई अन्य साधन खोजें।`,
            });
          } else if (status === 'paid') {
            newNotifs.push({
              id: mkId(), userId: mapped.consumerId, isRead: false, type: 'payment', timestamp: ts,
              title: '💸 भुगतान सफल! (Payment Successful)',
              message: `“${mapped.listingTitle}” के लिए ₹${mapped.totalPrice} का भुगतान सफल रहा।`,
            });
            newNotifs.push({
              id: mkId(), userId: mapped.providerId, isRead: false, type: 'payment', timestamp: ts,
              title: '💰 भुगतान प्राप्त (Payment Received)',
              message: `${mapped.consumerName} ने “${mapped.listingTitle}” के लिए ₹${mapped.totalPrice} भेजे।`,
            });
          } else if (status === 'active') {
            newNotifs.push({
              id: mkId(), userId: mapped.consumerId, isRead: false, type: 'booking', timestamp: ts,
              title: '🚜 काम शुरू! (Job Started)',
              message: `“${mapped.listingTitle}” का काम शुरू हो गया है। आप ट्रैक कर सकते हैं।`,
            });
          } else if (status === 'completed') {
            newNotifs.push({
              id: mkId(), userId: mapped.consumerId, isRead: false, type: 'booking', timestamp: ts,
              title: '🎉 काम पूरा! (Job Completed)',
              message: `“${mapped.listingTitle}” का काम सफलतापूर्वक पूरा हुआ। समीक्षा देने के लिए दहन करें।`,
            });
          }

          if (newNotifs.length > 0) {
            set((state) => ({ notifications: [...newNotifs, ...state.notifications] }));
          }
        } catch (err: any) {
          throw new Error(err.message || 'Update booking status failed');
        }
      },

      checkoutBooking: async (bookingId, method) => {
        try {
          const backendMethod = method === 'NetBanking' ? 'Card' : method;
          const res = await api.post('/payments/checkout', { bookingId, method: backendMethod });
          
          const dbBooking = res.transaction?.booking;
          if (!dbBooking) {
            throw new Error('Transaction response was missing booking data');
          }
          const mapped = mapDbBookingToAppBooking(dbBooking);
          
          set((state) => ({
            bookings: state.bookings.map((b) => b.id === bookingId ? mapped : b),
            transactions: [res.transaction, ...state.transactions],
          }));

          const newNotifs: AppNotification[] = [];
          const ts = Date.now();
          const mkId = () => `notif_${Math.random().toString(36).substr(2, 9)}`;

          newNotifs.push({
            id: mkId(), userId: mapped.consumerId, isRead: false, type: 'payment', timestamp: ts,
            title: '💸 भुगतान सफल! (Payment Successful)',
            message: `“${mapped.listingTitle}” के लिए ₹${mapped.totalPrice} का भुगतान सफल रहा।`,
          });
          newNotifs.push({
            id: mkId(), userId: mapped.providerId, isRead: false, type: 'payment', timestamp: ts,
            title: '💰 भुगतान प्राप्त (Payment Received)',
            message: `${mapped.consumerName} ने “${mapped.listingTitle}” के लिए ₹${mapped.totalPrice} भेजे।`,
          });

          set((state) => ({ notifications: [...newNotifs, ...state.notifications] }));
          return res.transaction;
        } catch (err: any) {
          throw new Error(err.message || 'Payment checkout failed');
        }
      },

      // Transaction Actions
      addTransaction: (transaction) => set((state) => ({
        transactions: [transaction, ...state.transactions],
      })),

      // Review Actions
      addReview: async (reviewData) => {
        try {
          const res = await api.post('/reviews', reviewData);
          set((state) => ({ reviews: [res.review, ...state.reviews] }));
          return res.review;
        } catch (err: any) {
          console.error('Submit review error:', err);
          throw err;
        }
      },

      // Notification Actions
      fetchNotifications: async () => {
        try {
          const res = await api.get('/notifications');
          set({ notifications: res.notifications });
        } catch (err) {
          console.error('Fetch notifications error:', err);
        }
      },

      markNotificationAsRead: async (id: string) => {
        try {
          await api.put(`/notifications/${id}/read`);
          set((state) => ({
            notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
          }));
        } catch (err) {
          console.error('Mark notification read error:', err);
        }
      },

      // Payment History Actions
      fetchPaymentHistory: async () => {
        try {
          const res = await api.get('/payments/history');
          set({ transactions: res.transactions });
        } catch (err) {
          console.error('Fetch payment history error:', err);
        }
      },

      // Analytics Actions
      fetchProviderAnalytics: async () => {
        try {
          const res = await api.get('/analytics/provider');
          return res;
        } catch (err) {
          console.error('Fetch provider analytics error:', err);
          return null;
        }
      },
      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) => n.id === id ? { ...n, isRead: true } : n),
      })),
      markAllRead: () => set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      })),

      // Track a listing the user tapped — keep last 20, deduplicated, newest first
      addViewedListing: (id: string) => set((state) => {
        const filtered = state.viewedListingIds.filter((vid) => vid !== id);
        return { viewedListingIds: [id, ...filtered].slice(0, 20) };
      }),

      logout: () => {
        localStorage.removeItem('gramsetu_token');
        set({
          user: null,
          isAuthenticated: false,
          appMode: 'consumer',
          openConversationId: null,
        });
      },
    }),
    {
      name: 'gramsetu-app-state',
    }
  )
);
