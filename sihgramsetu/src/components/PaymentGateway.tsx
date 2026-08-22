import React, { useState } from 'react';
import {
  ArrowLeft, ShieldCheck, Smartphone, CreditCard, Building2,
  Loader2, CheckCircle, XCircle, Copy, IndianRupee,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Booking, PaymentMethod } from '../store/useStore';

type Screen = 'gateway' | 'processing' | 'success' | 'failure';

interface PaymentGatewayProps {
  booking: Booking;
  onClose: () => void;
}

// ── Mock UPI provider logos (SVG inline) ──────────────────────────────────────
const UPI_PROVIDERS = [
  {
    name: 'PhonePe',
    color: '#5f259f',
    bg: 'bg-[#f5efff]',
    border: 'border-[#5f259f]/20',
    icon: (
      <svg viewBox="0 0 48 48" className="w-7 h-7" fill="none">
        <circle cx="24" cy="24" r="24" fill="#5f259f"/>
        <text x="9" y="31" fontSize="18" fontWeight="bold" fill="white" fontFamily="sans-serif">Pe</text>
      </svg>
    ),
  },
  {
    name: 'GPay',
    color: '#1a73e8',
    bg: 'bg-[#eef3ff]',
    border: 'border-[#1a73e8]/20',
    icon: (
      <svg viewBox="0 0 48 48" className="w-7 h-7" fill="none">
        <circle cx="24" cy="24" r="24" fill="white" stroke="#e0e0e0"/>
        <text x="5" y="31" fontSize="15" fontWeight="bold" fill="#1a73e8" fontFamily="sans-serif">GPay</text>
      </svg>
    ),
  },
  {
    name: 'Paytm',
    color: '#00b9f1',
    bg: 'bg-[#e5f8ff]',
    border: 'border-[#00b9f1]/20',
    icon: (
      <svg viewBox="0 0 48 48" className="w-7 h-7" fill="none">
        <circle cx="24" cy="24" r="24" fill="#00b9f1"/>
        <text x="5" y="31" fontSize="13" fontWeight="bold" fill="white" fontFamily="sans-serif">Paytm</text>
      </svg>
    ),
  },
];

type TabId = 'upi' | 'card' | 'netbanking';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'upi', label: 'UPI', icon: <Smartphone className="w-4 h-4" /> },
  { id: 'card', label: 'Card', icon: <CreditCard className="w-4 h-4" /> },
  { id: 'netbanking', label: 'Net Banking', icon: <Building2 className="w-4 h-4" /> },
];

export const PaymentGateway: React.FC<PaymentGatewayProps> = ({ booking, onClose }) => {
  const { checkoutBooking } = useStore();

  const [screen, setScreen] = useState<Screen>('gateway');
  const [activeTab, setActiveTab] = useState<TabId>('upi');
  const [selectedUpi, setSelectedUpi] = useState<string>('PhonePe');
  const [transactionId, setTransactionId] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('UPI');

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSimulateSuccess = async () => {
    const m: PaymentMethod = activeTab === 'upi' ? 'UPI' : activeTab === 'card' ? 'Card' : 'NetBanking';
    setMethod(m);
    setScreen('processing');

    try {
      // Simulating brief delay before backend call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const transaction = await checkoutBooking(booking.id, m);
      setTransactionId(transaction.id);
      setScreen('success');
    } catch (err: any) {
      console.error('Checkout error:', err);
      setScreen('failure');
    }
  };

  const handleSimulateFailure = () => {
    setScreen('processing');
    setTimeout(() => setScreen('failure'), 1500);
  };

  // ── SUCCESS SCREEN ───────────────────────────────────────────────────────────
  if (screen === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-cream-50 overflow-y-auto">
        {/* Decorative top gradient */}
        <div className="h-48 bg-gradient-to-b from-rural-green-800 to-rural-green-600 flex flex-col items-center justify-end pb-6 relative">
          <div className="w-20 h-20 bg-cream-50 rounded-full flex items-center justify-center shadow-xl border-4 border-rural-green-200">
            <CheckCircle className="w-11 h-11 text-rural-green-700" strokeWidth={2.5} />
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center px-6 pt-6 pb-10">
          <h2 className="text-2xl font-extrabold text-earth-900 mb-1 text-center">भुगतान सफल!</h2>
          <p className="text-sm text-earth-500 font-medium text-center mb-6">
            Payment Successful! The provider has been notified. 🎉
          </p>

          {/* Transaction receipt card */}
          <div className="w-full bg-white border border-cream-800 rounded-3xl p-5 shadow-md mb-6">
            {/* Order ID */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-dashed border-cream-800">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-extrabold text-earth-400 mb-0.5">Order ID</p>
                <p className="font-mono font-bold text-sm text-earth-900">{transactionId}</p>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(transactionId)}
                type="button"
                className="p-2 rounded-lg bg-cream-100 text-earth-500 active:scale-90 transition-transform"
                title="Copy transaction ID"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            {/* Booking summary */}
            <div className="space-y-2.5">
              <Row label="Booking" value={booking.listingTitle} bold />
              <Row label="Date" value={booking.date} />
              <Row label="Duration" value={`${booking.quantity} ${booking.unit === 'per hour' ? 'Hr' : 'Day'}`} />
              <Row label="Payment Method" value={method} />
              <div className="pt-2 mt-2 border-t border-cream-800 flex items-center justify-between">
                <span className="text-xs font-extrabold text-earth-700 uppercase tracking-wider">Total Paid</span>
                <span className="text-lg font-extrabold text-rural-green-900">₹{booking.totalPrice}</span>
              </div>
            </div>
          </div>

          <div className="w-full flex items-center gap-2 p-3 bg-rural-green-50 border border-rural-green-200 rounded-2xl mb-6">
            <ShieldCheck className="w-5 h-5 text-rural-green-700 shrink-0" />
            <p className="text-xs font-semibold text-rural-green-800">
              आपका लेन-देन सुरक्षित है। Provider को सूचित किया गया है।
            </p>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="w-full py-4 bg-rural-green-800 text-cream-50 font-bold rounded-2xl shadow-md text-base active:scale-[0.98] transition-all outline-none"
          >
            बुकिंग पर वापस जाएं (Back to Bookings)
          </button>
        </div>
      </div>
    );
  }

  // ── PROCESSING / LOADING SCREEN ──────────────────────────────────────────────
  if (screen === 'processing') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-cream-50 gap-5">
        <div className="w-20 h-20 rounded-full bg-rural-green-100 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-rural-green-800 animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-base font-extrabold text-earth-900">प्रक्रिया में है…</p>
          <p className="text-sm text-earth-500 mt-1">Processing your payment securely</p>
        </div>
      </div>
    );
  }

  // ── FAILURE SCREEN ───────────────────────────────────────────────────────────
  if (screen === 'failure') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-cream-50">
        <div className="h-48 bg-gradient-to-b from-red-600 to-red-500 flex flex-col items-center justify-end pb-6">
          <div className="w-20 h-20 bg-cream-50 rounded-full flex items-center justify-center shadow-xl border-4 border-red-200">
            <XCircle className="w-11 h-11 text-red-600" strokeWidth={2.5} />
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center px-6 pt-6 pb-10">
          <h2 className="text-2xl font-extrabold text-earth-900 mb-1 text-center">भुगतान विफल!</h2>
          <p className="text-sm text-earth-500 font-medium text-center mb-6">
            Payment failed. Please try again.
          </p>

          <div className="w-full flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-2xl mb-8">
            <XCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-xs font-semibold text-red-700">
              बैंक से कनेक्शन नहीं हो पाया। कृपया दोबारा कोशिश करें।
            </p>
          </div>

          <button
            onClick={() => setScreen('gateway')}
            type="button"
            className="w-full py-4 bg-rural-green-800 text-cream-50 font-bold rounded-2xl shadow-md text-base active:scale-[0.98] outline-none mb-3"
          >
            दोबारा कोशिश करें (Try Again)
          </button>
          <button
            onClick={onClose}
            type="button"
            className="w-full py-3.5 bg-cream-100 text-earth-700 border border-cream-800 font-bold rounded-2xl text-sm active:scale-[0.98] outline-none"
          >
            रद्द करें (Cancel)
          </button>
        </div>
      </div>
    );
  }

  // ── MAIN GATEWAY SCREEN ──────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-cream-50 overflow-y-auto">
      {/* App bar */}
      <div className="flex items-center gap-3 px-4 pt-safe pt-4 pb-3 bg-white border-b border-cream-800 shadow-xs">
        <button
          onClick={onClose}
          type="button"
          className="p-1.5 rounded-full hover:bg-cream-100 text-earth-700 active:scale-90 transition-transform outline-none"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-extrabold text-base text-earth-900">भुगतान करें (Checkout)</h1>
          <p className="text-[10px] text-earth-500 font-semibold">GramSetu Secure Payment</p>
        </div>
        <ShieldCheck className="w-5 h-5 text-rural-green-700" />
      </div>

      {/* Amount banner */}
      <div className="mx-4 mt-4 p-4 bg-rural-green-800 rounded-2xl text-cream-50 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest opacity-80 mb-0.5">भुगतान राशि</p>
          <p className="text-xs font-medium opacity-70 truncate max-w-[180px]">{booking.listingTitle}</p>
        </div>
        <div className="flex items-center gap-1">
          <IndianRupee className="w-5 h-5 opacity-90" />
          <span className="text-3xl font-extrabold">{booking.totalPrice}</span>
        </div>
      </div>

      {/* Payment method tabs */}
      <div className="flex gap-1 mx-4 mt-4 bg-cream-100 rounded-xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            type="button"
            className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-bold transition-all outline-none ${
              activeTab === tab.id
                ? 'bg-white text-earth-900 shadow-sm'
                : 'text-earth-500'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mx-4 mt-3 mb-4 flex-1">
        {/* UPI tab */}
        {activeTab === 'upi' && (
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-widest font-extrabold text-earth-500 mb-2">
              UPI ऐप चुनें (Select UPI App)
            </p>
            {UPI_PROVIDERS.map((p) => (
              <button
                key={p.name}
                onClick={() => setSelectedUpi(p.name)}
                type="button"
                className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all outline-none ${
                  selectedUpi === p.name
                    ? `${p.border} ${p.bg} border-opacity-60`
                    : 'border-cream-800 bg-white'
                }`}
              >
                <div className="w-9 h-9 flex items-center justify-center rounded-full overflow-hidden shrink-0">
                  {p.icon}
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-earth-900">{p.name}</p>
                  <p className="text-[10px] text-earth-500">UPI Payment</p>
                </div>
                {selectedUpi === p.name && (
                  <CheckCircle className="w-5 h-5 ml-auto shrink-0" style={{ color: p.color }} />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Card tab */}
        {activeTab === 'card' && (
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-widest font-extrabold text-earth-500 mb-2">
              Card Details (Mock)
            </p>
            <div className="bg-white border border-cream-800 rounded-2xl p-4 space-y-3">
              <div>
                <label className="text-[10px] font-extrabold text-earth-500 uppercase tracking-wider block mb-1">Card Number</label>
                <input
                  type="text"
                  placeholder="•••• •••• •••• ••••"
                  defaultValue="4111 1111 1111 1111"
                  className="w-full px-3 py-2.5 bg-cream-100 rounded-xl text-sm font-mono font-bold text-earth-900 outline-none border border-cream-800"
                  readOnly
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[10px] font-extrabold text-earth-500 uppercase tracking-wider block mb-1">Expiry</label>
                  <input
                    type="text"
                    defaultValue="12/27"
                    className="w-full px-3 py-2.5 bg-cream-100 rounded-xl text-sm font-mono font-bold text-earth-900 outline-none border border-cream-800"
                    readOnly
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-extrabold text-earth-500 uppercase tracking-wider block mb-1">CVV</label>
                  <input
                    type="text"
                    defaultValue="•••"
                    className="w-full px-3 py-2.5 bg-cream-100 rounded-xl text-sm font-mono font-bold text-earth-900 outline-none border border-cream-800"
                    readOnly
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-cream-100 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-rural-green-700 shrink-0" />
              <p className="text-[10px] font-semibold text-earth-600">256-bit SSL encryption • Mock data only</p>
            </div>
          </div>
        )}

        {/* Net Banking tab */}
        {activeTab === 'netbanking' && (
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-widest font-extrabold text-earth-500 mb-2">
              बैंक चुनें (Select Bank)
            </p>
            {['SBI', 'PNB', 'BOB', 'Canara', 'HDFC', 'ICICI'].map((bank) => (
              <button
                key={bank}
                type="button"
                className="w-full flex items-center gap-3 p-3.5 bg-white border border-cream-800 rounded-xl text-sm font-bold text-earth-900 active:bg-cream-100 outline-none"
              >
                <Building2 className="w-4 h-4 text-earth-400" />
                {bank} Bank
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action buttons — sticky at bottom */}
      <div className="sticky bottom-0 bg-cream-50 border-t border-cream-800 p-4 space-y-2.5">
        <button
          onClick={handleSimulateSuccess}
          type="button"
          className="w-full py-4 bg-rural-green-800 hover:bg-rural-green-900 text-cream-50 font-bold rounded-2xl shadow-md text-base active:scale-[0.98] transition-all outline-none flex items-center justify-center gap-2"
        >
          <ShieldCheck className="w-5 h-5" />
          Simulate Payment Success ✅
        </button>
        <button
          onClick={handleSimulateFailure}
          type="button"
          className="w-full py-3 bg-cream-100 text-earth-600 border border-cream-800 font-semibold rounded-2xl text-sm active:scale-[0.98] outline-none"
        >
          Simulate Payment Failure ❌
        </button>
      </div>
    </div>
  );
};

// ── Helper row component ──────────────────────────────────────────────────────
const Row: React.FC<{ label: string; value: string; bold?: boolean }> = ({ label, value, bold }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs font-semibold text-earth-500">{label}</span>
    <span className={`text-xs ${bold ? 'font-extrabold' : 'font-bold'} text-earth-900 text-right max-w-[55%] truncate`}>
      {value}
    </span>
  </div>
);
