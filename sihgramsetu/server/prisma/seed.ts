import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Transparent 1x1 base64 PNG image placeholder to satisfy non-labor photo requirement
const DUMMY_PHOTO = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

async function main() {
  console.log('🌱 Starting GramSetu database seed...');

  // Clean existing data
  await prisma.review.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.bazaarPost.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('gramsetu123', 10);

  // 1. Create Users (4 Providers + 1 Consumer)
  const provider1 = await prisma.user.create({
    data: {
      phone: '9876543210',
      password: hashedPassword,
      name: 'रामू काका (Ramu Kaka)',
      location: 'संगरिया, राजस्थान (Sangaria, Rajasthan)',
    },
  });

  const provider2 = await prisma.user.create({
    data: {
      phone: '9876543211',
      password: hashedPassword,
      name: 'गुरप्रीत सिंह (Gurpreet Singh)',
      location: 'अबोहर, पंजाब (Abohar, Punjab)',
    },
  });

  const provider3 = await prisma.user.create({
    data: {
      phone: '9876543212',
      password: hashedPassword,
      name: 'सुरेश यादव (Suresh Yadav)',
      location: 'नोहर, राजस्थान (Nohar, Rajasthan)',
    },
  });

  const provider4 = await prisma.user.create({
    data: {
      phone: '9876543213',
      password: hashedPassword,
      name: 'विक्रम पटेल (Vikram Patel)',
      location: 'आगरा, उत्तर प्रदेश (Agra, Uttar Pradesh)',
    },
  });

  const consumer1 = await prisma.user.create({
    data: {
      phone: '9123456789',
      password: hashedPassword,
      name: 'रमेश कुमार (Ramesh Kumar)',
      location: 'संगरिया, राजस्थान (Sangaria, Rajasthan)',
    },
  });

  console.log('✅ Created 5 sample users (4 Providers + 1 Consumer)');

  // Helper date strings for availability
  const today = new Date();
  const getFutureDate = (daysAhead: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split('T')[0];
  };

  const dates1 = [getFutureDate(1), getFutureDate(2), getFutureDate(3), getFutureDate(5), getFutureDate(7)];
  const dates2 = [getFutureDate(2), getFutureDate(3), getFutureDate(4), getFutureDate(8), getFutureDate(9)];

  // 2. Create Machinery Listings
  await prisma.listing.create({
    data: {
      providerId: provider1.id,
      type: 'machinery',
      title: 'Tractor 502 (Mahindra 575 DI)',
      description: 'शक्तिशाली 45 HP ट्रैक्टर, रोटावेटर और कल्टीवेटर के साथ उपलब्ध। गहरी जुताई और बुवाई के लिए उत्तम। ड्राइवर के साथ या बिना किराये पर।',
      price: 500,
      hourlyPrice: 500,
      dailyPrice: 3000,
      unit: 'per hour',
      location: 'संगरिया, राजस्थान',
      status: 'active',
      imageUrl: DUMMY_PHOTO,
      images: JSON.stringify([DUMMY_PHOTO]),
      availabilityDates: JSON.stringify(dates1),
      category: 'tractor',
    },
  });

  await prisma.listing.create({
    data: {
      providerId: provider4.id,
      type: 'machinery',
      title: 'Harvester PH9 (John Deere 5310)',
      description: 'अत्याधुनिक कंबाइन हार्वेस्टर — गेहूं, चावल और सरसों की कटाई के लिए आदर्श। बड़े खेतों के लिए उपयुक्त।',
      price: 900,
      hourlyPrice: 900,
      dailyPrice: 5500,
      unit: 'per hour',
      location: 'आगरा, उत्तर प्रदेश',
      status: 'active',
      imageUrl: DUMMY_PHOTO,
      images: JSON.stringify([DUMMY_PHOTO]),
      availabilityDates: JSON.stringify(dates2),
      category: 'harvester',
    },
  });

  await prisma.listing.create({
    data: {
      providerId: provider3.id,
      type: 'machinery',
      title: 'Cultivator Pro (Sonalika RX-50)',
      description: 'मिट्टी को बारीक करने वाला रोटावेटर व कल्टीवेटर, बुवाई से पहले खेत तैयार करने के लिए। किसी भी ट्रैक्टर के साथ जोड़ सकते हैं।',
      price: 350,
      hourlyPrice: 350,
      dailyPrice: 2200,
      unit: 'per hour',
      location: 'नोहर, राजस्थान',
      status: 'active',
      imageUrl: DUMMY_PHOTO,
      images: JSON.stringify([DUMMY_PHOTO]),
      availabilityDates: JSON.stringify(dates1),
      category: 'cultivator',
    },
  });

  // 3. Create Crop Residue Listings
  await prisma.listing.create({
    data: {
      providerId: provider2.id,
      type: 'crop_residue',
      title: 'Wheat Straw (गेहूं का भूसा)',
      description: 'उच्च गुणवत्ता वाला सूखा गेहूं का भूसा। पशुओं के चारे और ब्रिकेट्स बनाने के लिए एकदम सही। 500 किग्रा गांठों में उपलब्ध।',
      price: 250,
      unit: 'per quintal',
      location: 'अबोहर, पंजाब',
      status: 'active',
      imageUrl: DUMMY_PHOTO,
      images: JSON.stringify([DUMMY_PHOTO]),
      availabilityDates: JSON.stringify(dates1),
      category: 'wheat',
      stock: 50, // 50 quintals
    },
  });

  await prisma.listing.create({
    data: {
      providerId: provider1.id,
      type: 'crop_residue',
      title: 'Rice Residue / Paddy Straw (धान का पुआल)',
      description: 'पैकिंग, मशरूम की खेती और जैविक खाद के लिए साफ धान का पुआल उपलब्ध है। प्रति क्विंटल वाजिब दर।',
      price: 200,
      unit: 'per quintal',
      location: 'संगरिया, राजस्थान',
      status: 'active',
      imageUrl: DUMMY_PHOTO,
      images: JSON.stringify([DUMMY_PHOTO]),
      availabilityDates: JSON.stringify(dates2),
      category: 'paddy',
      stock: 80,
    },
  });

  await prisma.listing.create({
    data: {
      providerId: provider3.id,
      type: 'crop_residue',
      title: 'Mustard Residue (सरसों की तूड़ी)',
      description: 'सूखी सरसों की तूड़ी, ईंधन व बायोमास प्लांट के लिए। तुरंत उठान हेतु उपलब्ध।',
      price: 180,
      unit: 'per quintal',
      location: 'नोहर, राजस्थान',
      status: 'active',
      imageUrl: DUMMY_PHOTO,
      images: JSON.stringify([DUMMY_PHOTO]),
      availabilityDates: JSON.stringify(dates1),
      category: 'mustard',
      stock: 40,
    },
  });

  // 4. Create Labor Listings (Photos optional/none)
  await prisma.listing.create({
    data: {
      providerId: provider1.id,
      type: 'labor',
      title: 'Farm Harvesting Worker (धान रोपाई व कटाई श्रमिक)',
      description: ' अनुभवी मज़दूरों का दल, धान की रोपाई और कटाई में कुशल। समय पर और विश्वसनीय कार्य।',
      price: 600,
      dailyPrice: 600,
      hourlyPrice: 80,
      unit: 'per day',
      location: 'संगरिया, राजस्थान',
      status: 'active',
      availabilityDates: JSON.stringify(dates1),
      category: 'harvesting',
    },
  });

  await prisma.listing.create({
    data: {
      providerId: provider4.id,
      type: 'labor',
      title: 'Tractor Driver (अनुभवी ट्रैक्टर चालक)',
      description: '5 वर्ष का अनुभव रखने वाला कुशल ट्रैक्टर चालक। जुताई, ट्रॉली संचालन और हार्वेस्टिंग में माहिर।',
      price: 700,
      dailyPrice: 700,
      hourlyPrice: 100,
      unit: 'per day',
      location: 'आगरा, उत्तर प्रदेश',
      status: 'active',
      availabilityDates: JSON.stringify(dates2),
      category: 'driver',
    },
  });

  await prisma.listing.create({
    data: {
      providerId: provider2.id,
      type: 'labor',
      title: 'Farm Helper (खेत सहायक श्रमिक दल)',
      description: '5 कुशल मज़दूर, गेहूं की कटाई, निराई-गुड़ाई और बंडल बनाने में अनुभवी। छोटे और मध्यम खेतों के लिए।',
      price: 450,
      dailyPrice: 450,
      hourlyPrice: 60,
      unit: 'per day',
      location: 'अबोहर, पंजाब',
      status: 'active',
      availabilityDates: JSON.stringify(dates1),
      category: 'general',
    },
  });

  // 5. Create Storage Listings
  await prisma.listing.create({
    data: {
      providerId: provider1.id,
      type: 'storage',
      title: 'Grain Warehouse (अनाज गोदाम)',
      description: 'सुरक्षित और हवादार गोदाम, गेहूं, सरसों व चने के भंडारण के लिए। सीसीटीवी सुरक्षा एवं कीट नियंत्रण सुविधा।',
      price: 15,
      unit: 'per quintal',
      location: 'संगरिया, राजस्थान',
      status: 'active',
      imageUrl: DUMMY_PHOTO,
      images: JSON.stringify([DUMMY_PHOTO]),
      availabilityDates: JSON.stringify(dates1),
      category: 'warehouse',
      capacity: 500, // 500 quintals capacity
    },
  });

  await prisma.listing.create({
    data: {
      providerId: provider4.id,
      type: 'storage',
      title: 'Cold Storage Facility (कोल्ड स्टोरेज भंडारण)',
      description: 'सब्जियों, आलू व फलों के दीर्घकालिक भंडारण के लिए आधुनिक तापमान-नियंत्रित कोल्ड स्टोरेज।',
      price: 40,
      unit: 'per quintal',
      location: 'आगरा, उत्तर प्रदेश',
      status: 'active',
      imageUrl: DUMMY_PHOTO,
      images: JSON.stringify([DUMMY_PHOTO]),
      availabilityDates: JSON.stringify(dates2),
      category: 'cold-storage',
      capacity: 1000,
    },
  });

  // 6. Create Agri Products (Others / Bazaar) Listings
  await prisma.listing.create({
    data: {
      providerId: provider1.id,
      type: 'agri_product',
      title: 'Wheat Seeds RHB-177 (प्रमाणित गेहूं बीज)',
      description: 'उच्च उपज देने वाली उन्नत किस्म RHB-177। 90%+ अंकुरण दर की गारंटी। 50 किग्रा की बोरियों में उपलब्ध।',
      price: 45,
      unit: 'per kg',
      location: 'संगरिया, राजस्थान',
      status: 'active',
      imageUrl: DUMMY_PHOTO,
      images: JSON.stringify([DUMMY_PHOTO]),
      availabilityDates: JSON.stringify(dates1),
      category: 'seed',
      stock: 200, // 200 kg
    },
  });

  await prisma.listing.create({
    data: {
      providerId: provider2.id,
      type: 'agri_product',
      title: 'NPK Fertilizer 19:19:19 (एनपीके उर्वरक)',
      description: '100% जल घुलनशील एनपीके उर्वरक। फसलों के सर्वांगीण विकास के लिए उत्तम। मान्यता प्राप्त कंपनी ब्रांड।',
      price: 120,
      unit: 'per kg',
      location: 'अबोहर, पंजाब',
      status: 'active',
      imageUrl: DUMMY_PHOTO,
      images: JSON.stringify([DUMMY_PHOTO]),
      availabilityDates: JSON.stringify(dates2),
      category: 'fertilizer',
      stock: 100,
    },
  });

  await prisma.listing.create({
    data: {
      providerId: provider3.id,
      type: 'agri_product',
      title: 'Organic Neem Pesticide (जैविक नीम कीटनाशक)',
      description: 'शुद्ध नीम का तेल व अर्क पर आधारित पर्यावरण-अनुकूल कीटनाशक। कीटों व इल्लियों से सुरक्षा प्रदान करता है।',
      price: 350,
      unit: 'per unit',
      location: 'नोहर, राजस्थान',
      status: 'active',
      imageUrl: DUMMY_PHOTO,
      images: JSON.stringify([DUMMY_PHOTO]),
      availabilityDates: JSON.stringify(dates1),
      category: 'pesticide',
      stock: 30,
    },
  });

  console.log('✅ Created 14 realistic sample listings across all categories');

  // 7. Create Bazaar Community Posts
  await prisma.bazaarPost.create({
    data: {
      authorId: consumer1.id,
      type: 'need',
      content: 'कल सुबह 6 बजे तक 5 मज़दूर चाहिए गेहूं की कटाई के लिए। संगरिया से 3 किमी दूर खेत है। भोजन और चाय की व्यवस्था होगी।',
      location: 'संगरिया, राजस्थान',
    },
  });

  await prisma.bazaarPost.create({
    data: {
      authorId: provider2.id,
      type: 'offer',
      content: 'आज शाम मंडी से खाली ट्रैक्टर लौट रहा है अबोहर की ओर। अगर किसी को सामान भेजना हो तो बता दें। किराया बहुत कम लगेगा।',
      location: 'अबोहर, पंजाब',
    },
  });

  await prisma.bazaarPost.create({
    data: {
      authorId: provider3.id,
      type: 'need',
      content: 'रोटावेटर चाहिए 2 दिन के लिए। 10 बीघा ज़मीन तैयार करनी है बुवाई से पहले। नोहर के आसपास कोई हो तो संपर्क करें।',
      location: 'नोहर, राजस्थान',
    },
  });

  await prisma.bazaarPost.create({
    data: {
      authorId: provider1.id,
      type: 'offer',
      content: 'बाजरे का अच्छा बीज उपलब्ध है — RHB-177 किस्म। अंकुरण दर 90% से ऊपर। 50 किलो तक दे सकता हूं।',
      location: 'संगरिया, राजस्थान',
    },
  });

  console.log('✅ Created 4 sample Bazaar community posts');
  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
