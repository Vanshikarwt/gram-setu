import type { Listing, BazaarPost } from '../store/useStore';

/**
 * Seed listings to populate the consumer feed on first load.
 * These represent realistic agricultural resources from rural India.
 */
export const SEED_LISTINGS: Omit<Listing, 'id'>[] = [
  {
    providerId: 'seed_provider_1',
    type: 'machinery',
    title: 'Mahindra Tractor 575 DI',
    description: 'शक्तिशाली 45 HP ट्रैक्टर, रोटावेटर और कल्टीवेटर के साथ उपलब्ध। गहरी जुताई और बुवाई के लिए उत्तम। ड्राइवर के साथ या बिना किराये पर।',
    price: 500,
    unit: 'per hour',
    location: 'संगरिया, राजस्थान',
    status: 'active',
  },
  {
    providerId: 'seed_provider_2',
    type: 'machinery',
    title: 'John Deere Harvester 5310',
    description: 'अत्याधुनिक कंबाइन हार्वेस्टर — गेहूं, चावल और सरसों की कटाई के लिए आदर्श। बड़े खेतों के लिए उपयुक्त।',
    price: 2500,
    unit: 'per hour',
    location: 'हनुमानगढ़, राजस्थान',
    status: 'active',
  },
  {
    providerId: 'seed_provider_1',
    type: 'labor',
    title: 'धान रोपाई श्रमिक दल',
    description: '10 अनुभवी मज़दूरों का दल, धान की रोपाई में कुशल। समय पर और विश्वसनीय कार्य।',
    price: 400,
    unit: 'per day',
    location: 'श्री गंगानगर, राजस्थान',
    status: 'active',
  },
  {
    providerId: 'seed_provider_3',
    type: 'machinery',
    title: 'Sonalika Rotavator RX-50',
    description: 'मिट्टी को बारीक करने वाला रोटावेटर, बुवाई से पहले खेत तैयार करने के लिए। किसी भी ट्रैक्टर के साथ जोड़ सकते हैं।',
    price: 350,
    unit: 'per hour',
    location: 'नोहर, राजस्थान',
    status: 'active',
  },
  {
    providerId: 'seed_provider_2',
    type: 'labor',
    title: 'गेहूं कटाई श्रमिक',
    description: '5 कुशल मज़दूर, गेहूं की कटाई और बंडल बनाने में अनुभवी। छोटे और मध्यम खेतों के लिए।',
    price: 350,
    unit: 'per day',
    location: 'अबोहर, पंजाब',
    status: 'active',
  },
];

/**
 * Generate seeded listings with unique IDs.
 */
export function generateSeedListings(): Listing[] {
  return SEED_LISTINGS.map((item, index) => ({
    ...item,
    id: `seed_lst_${index + 1}`,
  }));
}

/**
 * Seed bazaar community posts — realistic needs and offers from rural India.
 */
const now = Date.now();

export const SEED_BAZAAR_POSTS: Omit<BazaarPost, 'id'>[] = [
  {
    authorId: 'seed_provider_1',
    authorName: 'रामू काका',
    type: 'need',
    content: 'कल सुबह 6 बजे तक 5 मज़दूर चाहिए गेहूं की कटाई के लिए। संगरिया से 3 किमी दूर खेत है। भोजन और चाय की व्यवस्था होगी।',
    location: 'संगरिया, राजस्थान',
    timestamp: now - 1000 * 60 * 30, // 30 min ago
  },
  {
    authorId: 'seed_provider_2',
    authorName: 'गुरप्रीत सिंह',
    type: 'offer',
    content: 'आज शाम मंडी से खाली ट्रैक्टर लौट रहा है अबोहर की ओर। अगर किसी को सामान भेजना हो तो बता दें। किराया बहुत कम लगेगा।',
    location: 'अबोहर, पंजाब',
    timestamp: now - 1000 * 60 * 60 * 2, // 2 hours ago
  },
  {
    authorId: 'seed_provider_3',
    authorName: 'सुरेश यादव',
    type: 'need',
    content: 'रोटावेटर चाहिए 2 दिन के लिए। 10 बीघा ज़मीन तैयार करनी है बुवाई से पहले। नोहर के आसपास कोई हो तो संपर्क करें।',
    location: 'नोहर, राजस्थान',
    timestamp: now - 1000 * 60 * 60 * 5, // 5 hours ago
  },
  {
    authorId: 'seed_provider_1',
    authorName: 'रामू काका',
    type: 'offer',
    content: 'बाजरे का अच्छा बीज उपलब्ध है — RHB-177 किस्म। पिछले साल का बचा हुआ है, अंकुरण दर 90% से ऊपर। 50 किलो तक दे सकता हूं।',
    location: 'संगरिया, राजस्थान',
    timestamp: now - 1000 * 60 * 60 * 8, // 8 hours ago
  },
];

/**
 * Generate seeded bazaar posts with unique IDs.
 */
export function generateSeedBazaarPosts(): BazaarPost[] {
  return SEED_BAZAAR_POSTS.map((post, index) => ({
    ...post,
    id: `seed_bp_${index + 1}`,
  }));
}

// ─── Seed Chat Data ───────────────────────────────────────────────────────────
import type { Conversation, Message } from '../store/useStore';

/**
 * Generate 2 realistic seed conversations + their messages for the logged-in user.
 * @param loggedInUserId  the real user id from the store
 * @param loggedInUserName  the real user name from the store
 */
export function generateSeedChatData(
  loggedInUserId: string,
  loggedInUserName: string
): { conversations: Conversation[]; messages: Message[] } {
  const t = Date.now();

  const conv1: Conversation = {
    id: 'seed_conv_1',
    participantIds: [loggedInUserId, 'seed_provider_1'],
    participantNames: {
      [loggedInUserId]: loggedInUserName,
      seed_provider_1: 'रामू काका',
    },
    lastMessageText: 'ठीक है काका, कल सुबह 7 बजे मिलते हैं।',
    timestamp: t - 1000 * 60 * 45,
  };

  const conv2: Conversation = {
    id: 'seed_conv_2',
    participantIds: [loggedInUserId, 'seed_provider_2'],
    participantNames: {
      [loggedInUserId]: loggedInUserName,
      seed_provider_2: 'गुरप्रीत सिंह',
    },
    lastMessageText: 'ट्रैक्टर का किराया कितना होगा?',
    timestamp: t - 1000 * 60 * 60 * 3,
  };

  const messages: Message[] = [
    // Conv 1
    {
      id: 'seed_msg_1',
      conversationId: 'seed_conv_1',
      senderId: 'seed_provider_1',
      text: 'नमस्ते! क्या आपको कल मज़दूर चाहिए?',
      timestamp: t - 1000 * 60 * 60,
    },
    {
      id: 'seed_msg_2',
      conversationId: 'seed_conv_1',
      senderId: loggedInUserId,
      text: 'हाँ काका, 5 मज़दूर चाहिए गेहूं कटाई के लिए।',
      timestamp: t - 1000 * 60 * 55,
    },
    {
      id: 'seed_msg_3',
      conversationId: 'seed_conv_1',
      senderId: 'seed_provider_1',
      text: 'ठीक है, ₹400 प्रति दिन के हिसाब से भेजूंगा।',
      timestamp: t - 1000 * 60 * 50,
    },
    {
      id: 'seed_msg_4',
      conversationId: 'seed_conv_1',
      senderId: loggedInUserId,
      text: 'ठीक है काका, कल सुबह 7 बजे मिलते हैं।',
      timestamp: t - 1000 * 60 * 45,
    },
    // Conv 2
    {
      id: 'seed_msg_5',
      conversationId: 'seed_conv_2',
      senderId: loggedInUserId,
      text: 'ट्रैक्टर का किराया कितना होगा?',
      timestamp: t - 1000 * 60 * 60 * 3,
    },
    {
      id: 'seed_msg_6',
      conversationId: 'seed_conv_2',
      senderId: 'seed_provider_2',
      text: 'नमस्ते! ₹500 प्रति घंटा है। कब चाहिए?',
      timestamp: t - 1000 * 60 * 60 * 2.5,
    },
  ];

  return { conversations: [conv1, conv2], messages };
}
