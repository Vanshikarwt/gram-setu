import React, { useState, useEffect } from 'react';
import { X, Sprout, Save, Sparkles, Warehouse, Leaf, ShoppingBag, Tractor, Users } from 'lucide-react';
import type { Listing } from '../store/useStore';
import { useStore } from '../store/useStore';
import { generatePriceSuggestion } from '../utils/aiInsights';

type ListingType = 'machinery' | 'labor' | 'crop_residue' | 'storage' | 'agri_product';
type UnitType = 'per hour' | 'per day' | 'per quintal' | 'per tonne' | 'per kg' | 'per unit';

interface ListingFormProps {
  initialListing?: Listing | null;
  onSave: (listingData: Omit<Listing, 'id' | 'providerId'> & { id?: string }) => void;
  onClose: () => void;
}

const TYPE_CONFIG: Record<ListingType, {
  label: string;
  labelHi: string;
  icon: React.ReactNode;
  units: UnitType[];
  defaultUnit: UnitType;
  titlePlaceholder: string;
  descPlaceholder: string;
  color: string;
  showCategory: boolean;
  showCapacity: boolean;
  showStock: boolean;
  categories: string[];
}> = {
  machinery: {
    label: 'Machinery',
    labelHi: 'मशीनरी / उपकरण',
    icon: <Tractor className="w-4 h-4" />,
    units: ['per hour', 'per day'],
    defaultUnit: 'per hour',
    titlePlaceholder: 'जैसे: महिंद्रा ट्रैक्टर 575 DI',
    descPlaceholder: 'किराये की शर्तें, उपलब्ध सामान (कल्टीवेटर, रोटावेटर) आदि',
    color: 'bg-blue-600',
    showCategory: false,
    showCapacity: false,
    showStock: false,
    categories: [],
  },
  labor: {
    label: 'Labor',
    labelHi: 'श्रम / मज़दूर',
    icon: <Users className="w-4 h-4" />,
    units: ['per hour', 'per day'],
    defaultUnit: 'per day',
    titlePlaceholder: 'जैसे: धान रोपाई हेतु श्रमिक',
    descPlaceholder: 'मजदूरों की संख्या, कार्य अनुभव आदि',
    color: 'bg-purple-600',
    showCategory: false,
    showCapacity: false,
    showStock: false,
    categories: [],
  },
  crop_residue: {
    label: 'Crop Residue',
    labelHi: 'फसल अवशेष',
    icon: <Leaf className="w-4 h-4" />,
    units: ['per quintal', 'per tonne'],
    defaultUnit: 'per quintal',
    titlePlaceholder: 'जैसे: गेहूं का भूसा (Wheat Straw)',
    descPlaceholder: 'फसल अवशेष की गुणवत्ता, उपलब्धता आदि',
    color: 'bg-amber-600',
    showCategory: true,
    showCapacity: false,
    showStock: true,
    categories: ['wheat', 'paddy', 'sugarcane', 'cotton', 'maize', 'soybean', 'other'],
  },
  storage: {
    label: 'Cold Storage',
    labelHi: 'भंडारण / गोदाम',
    icon: <Warehouse className="w-4 h-4" />,
    units: ['per tonne', 'per day'],
    defaultUnit: 'per tonne',
    titlePlaceholder: 'जैसे: कोल्ड स्टोरेज फैसिलिटी',
    descPlaceholder: 'तापमान श्रेणी, सुरक्षा व्यवस्था, पहुंच मार्ग आदि',
    color: 'bg-cyan-600',
    showCategory: true,
    showCapacity: true,
    showStock: false,
    categories: ['cold-storage', 'warehouse', 'silo', 'open-yard', 'other'],
  },
  agri_product: {
    label: 'Agri Product',
    labelHi: 'कृषि उत्पाद / बाज़ार',
    icon: <ShoppingBag className="w-4 h-4" />,
    units: ['per kg', 'per quintal', 'per unit'],
    defaultUnit: 'per kg',
    titlePlaceholder: 'जैसे: देशी गाय का घी (A2 Ghee)',
    descPlaceholder: 'उत्पाद की गुणवत्ता, पैकेजिंग, न्यूनतम आर्डर आदि',
    color: 'bg-rural-green-700',
    showCategory: true,
    showCapacity: false,
    showStock: true,
    categories: ['dairy', 'seed', 'fertilizer', 'pesticide', 'produce', 'spice', 'oil', 'other'],
  },
};

export const ListingForm: React.FC<ListingFormProps> = ({
  initialListing,
  onSave,
  onClose,
}) => {
  const user = useStore((state) => state.user);

  const [type, setType] = useState<ListingType>('machinery');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [hourlyPrice, setHourlyPrice] = useState('');
  const [dailyPrice, setDailyPrice] = useState('');
  const [unit, setUnit] = useState<UnitType>('per hour');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [category, setCategory] = useState('');
  const [capacity, setCapacity] = useState('');
  const [stock, setStock] = useState('');
  const [error, setError] = useState('');

  // AI Price Suggestion state
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiReason, setAiReason] = useState('');

  const config = TYPE_CONFIG[type];

  // When type changes, reset unit to the default for that type
  const handleTypeChange = (newType: ListingType) => {
    setType(newType);
    setUnit(TYPE_CONFIG[newType].defaultUnit);
    setAiReason('');
    setError('');
  };

  const handleGetAiPrice = () => {
    setIsAiLoading(true);
    setAiReason('');
    setTimeout(() => {
      const suggestion = generatePriceSuggestion(type as any, unit as any, title);
      setPrice(suggestion.price.toString());
      setAiReason(suggestion.reason);
      setIsAiLoading(false);
      if (error) setError('');
    }, 500);
  };

  useEffect(() => {
    if (initialListing) {
      setType(initialListing.type as ListingType);
      setTitle(initialListing.title);
      setDescription(initialListing.description);
      setPrice(initialListing.price.toString());
      setHourlyPrice(initialListing.hourlyPrice != null ? initialListing.hourlyPrice.toString() : initialListing.price.toString());
      setDailyPrice(initialListing.dailyPrice != null ? initialListing.dailyPrice.toString() : (initialListing.price * 6).toString());
      setUnit(initialListing.unit as UnitType);
      setLocation(initialListing.location);
      setStatus(initialListing.status);
      setCategory(initialListing.category ?? '');
      setCapacity(initialListing.capacity != null ? String(initialListing.capacity) : '');
      setStock(initialListing.stock != null ? String(initialListing.stock) : '');
    } else if (user) {
      setLocation(`${user.village}, ${user.state}`);
    }
  }, [initialListing, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('कृपया साधन या उत्पाद का नाम दर्ज करें (Please enter listing title)');
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      setError('कृपया सही किराया/दर दर्ज करें (Please enter a valid price greater than 0)');
      return;
    }
    if (!location.trim()) {
      setError('कृपया स्थान/पता दर्ज करें (Please enter location)');
      return;
    }
    if (config.showCapacity && capacity && isNaN(parseFloat(capacity))) {
      setError('कृपया सही क्षमता दर्ज करें (Please enter a valid capacity)');
      return;
    }
    if (config.showStock && stock && isNaN(parseFloat(stock))) {
      setError('कृपया सही स्टॉक मात्रा दर्ज करें (Please enter a valid stock quantity)');
      return;
    }

    const parsedPrice = parseFloat(price);
    const parsedHourly = hourlyPrice ? parseFloat(hourlyPrice) : parsedPrice;
    const parsedDaily = dailyPrice ? parseFloat(dailyPrice) : parsedPrice * 6;

    onSave({
      id: initialListing?.id,
      type,
      title: title.trim(),
      description: description.trim(),
      price: parsedPrice,
      hourlyPrice: parsedHourly,
      dailyPrice: parsedDaily,
      unit,
      location: location.trim(),
      status,
      category: category.trim() || undefined,
      capacity: config.showCapacity && capacity ? parseFloat(capacity) : null,
      stock: config.showStock && stock ? parseFloat(stock) : null,
    } as any);
  };

  const TYPE_BUTTONS: ListingType[] = ['machinery', 'labor', 'crop_residue', 'storage', 'agri_product'];

  return (
    <div className="absolute inset-0 bg-cream-950 z-30 flex flex-col animate-in slide-in-from-bottom duration-250 select-none">
      
      {/* Form Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-cream-50 border-b border-cream-800 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="bg-rural-green-800 p-1 rounded-lg text-cream-50">
            <Sprout className="w-4 h-4" />
          </div>
          <span className="font-bold text-base text-earth-900">
            {initialListing ? 'साधन बदलें (Edit Asset)' : 'नया साधन जोड़ें (Add Asset)'}
          </span>
        </div>
        <button
          onClick={onClose}
          type="button"
          className="p-1.5 rounded-full bg-cream-100 hover:bg-cream-200 text-earth-700 active:scale-90 transition-transform outline-none"
          aria-label="Close form"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Form Body Container */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5 pb-8">
        
        {/* Validation Errors banner */}
        {error && (
          <div className="p-3 bg-harvest-orange/10 border border-harvest-orange/20 rounded-2xl text-xs font-semibold text-harvest-orange-dark">
            ⚠️ {error}
          </div>
        )}

        {/* Picker: Type Selection — 5 types in a scrollable row */}
        <div>
          <label className="block text-xs font-extrabold text-earth-500 uppercase tracking-wider mb-2 pl-1">
            साधन का प्रकार (Resource Type)
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {TYPE_BUTTONS.map((t) => {
              const tc = TYPE_CONFIG[t];
              const isActive = type === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeChange(t)}
                  className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-[10px] font-bold transition-all outline-none border-2 ${
                    isActive
                      ? 'border-rural-green-700 bg-rural-green-50 text-rural-green-900 shadow-sm'
                      : 'border-cream-800 bg-cream-50 text-earth-600 hover:bg-cream-100'
                  }`}
                >
                  <span className={`${isActive ? 'text-rural-green-800' : 'text-earth-500'}`}>
                    {tc.icon}
                  </span>
                  <span className="leading-tight text-center">{tc.label}</span>
                </button>
              );
            })}
          </div>
          {/* Hindi label for selected type */}
          <p className="mt-1.5 text-[11px] font-semibold text-earth-500 pl-1">
            चयनित: {config.labelHi}
          </p>
        </div>

        {/* Category sub-picker (only for types that support it) */}
        {config.showCategory && config.categories.length > 0 && (
          <div>
            <label htmlFor="category" className="block text-xs font-extrabold text-earth-500 uppercase tracking-wider mb-1.5 pl-1">
              श्रेणी (Category)
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-cream-50 border border-cream-800 focus:border-rural-green-600 rounded-xl outline-none font-bold text-earth-900 text-sm transition-colors"
            >
              <option value="">— श्रेणी चुनें (Select Category) —</option>
              {config.categories.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-xs font-extrabold text-earth-500 uppercase tracking-wider mb-1.5 pl-1">
            शीर्षक / नाम (Listing Title) *
          </label>
          <input
            id="title"
            type="text"
            placeholder={config.titlePlaceholder}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError('');
            }}
            className="w-full px-4 py-3 bg-cream-50 border border-cream-800 focus:border-rural-green-600 rounded-xl outline-none font-medium text-earth-950 text-sm transition-colors"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="desc" className="block text-xs font-extrabold text-earth-500 uppercase tracking-wider mb-1.5 pl-1">
            विवरण / जानकारी (Details / Description)
          </label>
          <textarea
            id="desc"
            rows={3}
            placeholder={config.descPlaceholder}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 bg-cream-50 border border-cream-800 focus:border-rural-green-600 rounded-xl outline-none font-medium text-earth-950 text-sm transition-colors resize-none"
          />
        </div>

        {/* Rental Pricing Grid — Hourly & Daily Prices for machinery and labor */}
        {(type === 'machinery' || type === 'labor') ? (
          <div className="p-4 bg-cream-100/70 border border-cream-800 rounded-2xl space-y-3">
            <p className="text-xs font-extrabold text-earth-800 uppercase tracking-wider">
              💰 किराया दरें (Rental Pricing)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="hourlyPrice" className="block text-[11px] font-extrabold text-earth-600 mb-1">
                  प्रति घंटा दर (Hourly Rate ₹/hr) *
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-earth-500">₹</span>
                  <input
                    id="hourlyPrice"
                    type="number"
                    min="0"
                    placeholder="500"
                    value={hourlyPrice || price}
                    onChange={(e) => {
                      setHourlyPrice(e.target.value);
                      setPrice(e.target.value);
                      if (error) setError('');
                    }}
                    className="w-full pl-7 pr-3 py-2.5 bg-cream-50 border border-cream-800 focus:border-rural-green-600 rounded-xl outline-none font-bold text-earth-950 text-sm transition-colors"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="dailyPrice" className="block text-[11px] font-extrabold text-earth-600 mb-1">
                  प्रति दिन दर (Daily Rate ₹/day) *
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-earth-500">₹</span>
                  <input
                    id="dailyPrice"
                    type="number"
                    min="0"
                    placeholder="3000"
                    value={dailyPrice}
                    onChange={(e) => {
                      setDailyPrice(e.target.value);
                      if (error) setError('');
                    }}
                    className="w-full pl-7 pr-3 py-2.5 bg-cream-50 border border-cream-800 focus:border-rural-green-600 rounded-xl outline-none font-bold text-earth-950 text-sm transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Standard Price & Unit Grid for non-rental products */
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="price" className="block text-xs font-extrabold text-earth-500 uppercase tracking-wider mb-1.5 pl-1">
                दर (Rate in ₹) *
              </label>
              <input
                id="price"
                type="number"
                min="0"
                placeholder="e.g., 500"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  if (error) setError('');
                }}
                className="w-full px-4 py-3 bg-cream-50 border border-cream-800 focus:border-rural-green-600 rounded-xl outline-none font-medium text-earth-950 text-sm transition-colors"
              />
            </div>
            <div>
              <label htmlFor="unit" className="block text-xs font-extrabold text-earth-500 uppercase tracking-wider mb-1.5 pl-1">
                इकाई (Unit)
              </label>
              <select
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value as UnitType)}
                className="w-full px-4 py-3 bg-cream-50 border border-cream-800 focus:border-rural-green-600 rounded-xl outline-none font-bold text-earth-900 text-sm transition-colors"
              >
                {config.units.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Capacity (Storage only) */}
        {config.showCapacity && (
          <div>
            <label htmlFor="capacity" className="block text-xs font-extrabold text-earth-500 uppercase tracking-wider mb-1.5 pl-1">
              भंडारण क्षमता — टन में (Storage Capacity in Tonnes)
            </label>
            <input
              id="capacity"
              type="number"
              min="0"
              placeholder="e.g., 500"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full px-4 py-3 bg-cream-50 border border-cream-800 focus:border-rural-green-600 rounded-xl outline-none font-medium text-earth-950 text-sm transition-colors"
            />
          </div>
        )}

        {/* Stock (Agri Product / Crop Residue) */}
        {config.showStock && (
          <div>
            <label htmlFor="stock" className="block text-xs font-extrabold text-earth-500 uppercase tracking-wider mb-1.5 pl-1">
              उपलब्ध स्टॉक (Available Stock Quantity)
            </label>
            <input
              id="stock"
              type="number"
              min="0"
              placeholder="e.g., 200"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full px-4 py-3 bg-cream-50 border border-cream-800 focus:border-rural-green-600 rounded-xl outline-none font-medium text-earth-950 text-sm transition-colors"
            />
            <p className="text-[11px] text-earth-500 mt-1 pl-1">
              यह मात्रा हर खरीद के बाद स्वचालित रूप से कम होगी (Stock auto-decrements on purchase)
            </p>
          </div>
        )}

        {/* AI Suggested Price Button & Helper Banner */}
        <div className="bg-gradient-to-r from-harvest-gold/10 via-rural-green-100/40 to-harvest-gold/10 border border-harvest-gold/30 rounded-2xl p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-earth-800 flex items-center gap-1">
              ✨ Smart Pricing Assistant
            </span>
            <button
              type="button"
              onClick={handleGetAiPrice}
              disabled={isAiLoading}
              className="flex items-center gap-1 px-3 py-1.5 bg-rural-green-800 hover:bg-rural-green-900 disabled:opacity-50 text-cream-50 font-bold rounded-xl text-xs shadow-xs active:scale-95 transition-all outline-none"
            >
              {isAiLoading ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  सोच रहा है…
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-harvest-gold" />
                  ✨ Get AI Suggested Price
                </>
              )}
            </button>
          </div>
          {aiReason && (
            <p className="text-[11px] font-semibold text-rural-green-900 mt-2 flex items-center gap-1 animate-in fade-in">
              {aiReason}
            </p>
          )}
        </div>

        {/* Location */}
        <div>
          <label htmlFor="loc" className="block text-xs font-extrabold text-earth-500 uppercase tracking-wider mb-1.5 pl-1">
            स्थान (Location) *
          </label>
          <input
            id="loc"
            type="text"
            placeholder="village, state"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              if (error) setError('');
            }}
            className="w-full px-4 py-3 bg-cream-50 border border-cream-800 focus:border-rural-green-600 rounded-xl outline-none font-medium text-earth-950 text-sm transition-colors"
          />
        </div>

        {/* Status Toggle */}
        <div className="flex items-center justify-between p-4 bg-cream-50 border border-cream-800 rounded-2xl">
          <div className="text-left">
            <span className="block text-sm font-bold text-earth-900">बुकिंग के लिए उपलब्ध (Available for Booking)</span>
            <span className="text-[11px] font-medium text-earth-550">Toggle to show/hide listing in search feed</span>
          </div>
          <button
            type="button"
            onClick={() => setStatus(status === 'active' ? 'inactive' : 'active')}
            className={`w-12 h-6.5 rounded-full p-1 transition-colors outline-none shrink-0 ${
              status === 'active' ? 'bg-rural-green-800' : 'bg-earth-300'
            }`}
          >
            <div
              className={`bg-cream-50 w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-200 ${
                status === 'active' ? 'translate-x-5.5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Save button */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full py-4 bg-rural-green-800 hover:bg-rural-green-900 text-cream-50 font-bold rounded-2xl shadow-md transition-colors flex items-center justify-center gap-2 text-base active:scale-[0.98] outline-none focus:ring-4 focus:ring-rural-green-300"
          >
            <Save className="w-5 h-5 stroke-[2.5]" />
            साधन सहेजें (Save Resource)
          </button>
        </div>

      </form>
    </div>
  );
};
