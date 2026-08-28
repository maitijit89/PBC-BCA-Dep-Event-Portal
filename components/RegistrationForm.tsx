'use client';

import React, { useState } from 'react';
import { Sparkles, ShieldCheck, Lock, User, Mail, Phone, Calendar, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { calculateEventFee, formatCurrencyINR } from '@/lib/utils';
import { Semester, RegistrationFormData, CreateOrderResponse, VerifyPaymentResponse } from '@/lib/types';
import { TicketDetails } from './TicketModal';
import { LivePassPreview } from './LivePassPreview';

interface RegistrationFormProps {
  onPaymentSuccess: (ticket: TicketDetails) => void;
}

const SEMESTER_OPTIONS: Semester[] = [
  '1st Semester',
  '2nd Semester',
  '3rd Semester',
  '4th Semester',
  '5th Semester',
  '6th Semester',
  '7th Semester',
  '8th Semester',
];

export function RegistrationForm({ onPaymentSuccess }: RegistrationFormProps) {
  const [formData, setFormData] = useState<RegistrationFormData>({
    name: '',
    email: '',
    phone: '',
    age: '',
    semester: '1st Semester',
  });

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Calculate current fee dynamically
  const feeInfo = calculateEventFee(formData.semester);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      // Allow only numbers and max 10 digits
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData((prev) => ({ ...prev, phone: digitsOnly }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSemesterSelect = (sem: Semester) => {
    setFormData((prev) => ({ ...prev, semester: sem }));
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && (window as unknown as { Razorpay?: unknown }).Razorpay) {
        return resolve(true);
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      toast.error('Please enter a valid 10-digit mobile number (starting with 6, 7, 8, or 9)');
      return;
    }
    if (!formData.age || Number(formData.age) < 15 || Number(formData.age) > 60) {
      toast.error('Please enter a valid age (between 15 and 60)');
      return;
    }

    setLoading(true);
    setLoadingMessage('Initializing Razorpay checkout...');

    try {
      // 1. Create order
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const orderData: CreateOrderResponse = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.message || 'Failed to initialize payment order.');
      }

      // 2. Load script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }

      setLoadingMessage('Opening checkout gateway...');

      // 3. Options
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'PBC BCA Department',
        description: `BCA Event Pass (${formData.semester})`,
        order_id: orderData.orderId,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#4f46e5',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setLoadingMessage('');
            toast.info('Checkout dialog closed.');
          },
        },
        handler: async function (response: { razorpay_order_id?: string; razorpay_payment_id?: string; razorpay_signature?: string }) {
          setLoading(true);
          setLoadingMessage('Verifying payment & generating invitation ticket...');

          try {
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id || orderData.orderId,
                razorpay_payment_id: response.razorpay_payment_id || '',
                razorpay_signature: response.razorpay_signature || '',
                userData: formData,
              }),
            });

            const verifyData: VerifyPaymentResponse = await verifyRes.json();

            if (verifyRes.ok && verifyData.success && verifyData.details) {
              toast.success('Registration & Payment Successful!');
              onPaymentSuccess({
                ticketId: verifyData.details.ticketId,
                name: verifyData.details.name,
                email: verifyData.details.email,
                phone: verifyData.details.phone,
                semester: verifyData.details.semester,
                amountPaid: verifyData.details.amountPaid,
                paymentId: verifyData.details.paymentId,
                timestamp: verifyData.details.timestamp,
              });

              setFormData({
                name: '',
                email: '',
                phone: '',
                age: '',
                semester: '1st Semester',
              });
            } else {
              throw new Error(verifyData.message || 'Payment verification failed.');
            }
          } catch (err: unknown) {
            console.error('Verification error:', err);
            const msg = err instanceof Error ? err.message : 'Payment verification failed. Please contact helpdesk.';
            toast.error(msg);
          } finally {
            setLoading(false);
            setLoadingMessage('');
          }
        },
      };

      const rzp = new (window as unknown as { Razorpay: new (opts: typeof options) => { open: () => void; on: (event: string, cb: (res: { error?: { description?: string } }) => void) => void } }).Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setLoading(false);
        setLoadingMessage('');
        toast.error(`Payment failed: ${response.error?.description || 'Transaction declined'}`);
      });

      rzp.open();
    } catch (error: unknown) {
      console.error('Checkout error:', error);
      const msg = error instanceof Error ? error.message : 'An error occurred during checkout.';
      toast.error(msg);
      setLoading(false);
      setLoadingMessage('');
    }
  };

  return (
    <section id="register" className="py-12 md:py-20 relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Liquid Glass Form Container */}
        <div className="liquid-glass rounded-3xl p-5 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Decorative Corner Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-linear-to-bl from-indigo-300/20 via-purple-300/10 to-transparent rounded-bl-full pointer-events-none blur-2xl" />

          {/* Form Header */}
          <div className="text-center mb-8 sm:mb-10 relative">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-pill text-indigo-700 text-xs font-bold mb-3 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Direct Student Entry Registration
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Student Registration &amp; Instant Pass
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-lg mx-auto leading-relaxed">
              No password or sign-up needed. Fill in your details below to preview your pass and complete checkout.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start relative">
            {/* Left Column: Form Inputs & Pay (7 cols) */}
            <div className="lg:col-span-7">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Student Name */}
                <div>
                  <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Sourav Mukherjee"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl liquid-glass-input text-slate-900 placeholder-slate-400 text-sm outline-none font-medium"
                    />
                  </div>
                </div>

                {/* Email & Phone Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        inputMode="email"
                        autoComplete="email"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="student@gmail.com"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl liquid-glass-input text-slate-900 placeholder-slate-400 text-sm outline-none font-medium"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 font-medium">Digital pass will be emailed here</p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        maxLength={10}
                        inputMode="numeric"
                        autoComplete="tel"
                        pattern="[0-9]*"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="10-digit mobile number"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl liquid-glass-input text-slate-900 placeholder-slate-400 text-sm outline-none font-medium"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 font-medium">For gate SMS &amp; pass lookup</p>
                  </div>
                </div>

                {/* Age & Semester */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Age */}
                  <div>
                    <label htmlFor="age" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Age <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <input
                        type="number"
                        id="age"
                        name="age"
                        min={15}
                        max={60}
                        required
                        inputMode="numeric"
                        value={formData.age}
                        onChange={handleChange}
                        placeholder="e.g. 20"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl liquid-glass-input text-slate-900 placeholder-slate-400 text-sm outline-none font-medium"
                      />
                    </div>
                  </div>

                  {/* Current Semester Dropdown */}
                  <div>
                    <label htmlFor="semester" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Current Semester <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="semester"
                      name="semester"
                      required
                      value={formData.semester}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-2xl liquid-glass-input text-slate-900 text-sm outline-none cursor-pointer font-semibold"
                    >
                      {SEMESTER_OPTIONS.map((sem) => (
                        <option key={sem} value={sem}>
                          {sem} {sem === '1st Semester' ? '(₹100)' : '(₹250)'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Quick Select Semester Chips */}
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Quick Select Semester:
                  </span>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                    {SEMESTER_OPTIONS.map((sem) => {
                      const isSelected = formData.semester === sem;
                      const shortName = sem.replace(' Semester', ' Sem');
                      return (
                        <button
                          key={sem}
                          type="button"
                          onClick={() => handleSemesterSelect(sem)}
                          className={`min-h-10 py-1.5 px-1 rounded-xl text-[11px] font-bold transition-all text-center flex items-center justify-center cursor-pointer select-none touch-manipulation ${
                            isSelected
                              ? sem === '1st Semester'
                                ? 'bg-linear-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30 border border-indigo-500 scale-[1.02]'
                                : 'bg-linear-to-r from-purple-600 to-purple-700 text-white shadow-md shadow-purple-600/30 border border-purple-500 scale-[1.02]'
                              : 'liquid-glass-subtle text-slate-700 hover:bg-white hover:text-slate-900 border-white/70 active:scale-95'
                          }`}
                        >
                          {shortName}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Pricing summary chip */}
                <div className="p-4 rounded-2xl liquid-glass-card border-indigo-200/90 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Total Fee</div>
                    <div className="text-xs text-indigo-800 font-bold mt-0.5 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        {formData.semester === '1st Semester'
                          ? '1st Sem Fresher Rate'
                          : `${formData.semester} Rate`}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl sm:text-3xl font-black text-indigo-700 tracking-tight">
                      {formatCurrencyINR(feeInfo.amountInINR)}
                    </div>
                    <div className="text-[10px] text-slate-500 font-semibold">all taxes included</div>
                  </div>
                </div>

                {/* Security Note */}
                <div className="flex items-center gap-2 text-xs text-slate-600 px-1 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Secured 256-bit Razorpay checkout. Instant pass issuance on payment.
                  </span>
                </div>

                {/* Submit / Proceed to Pay Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="apple-glass-btn w-full relative flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl text-white font-bold text-base shadow-xl disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{loadingMessage || 'Processing...'}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-indigo-200" />
                      <span>Proceed to Pay {formatCurrencyINR(feeInfo.amountInINR)}</span>
                      <ArrowRight className="w-4 h-4 text-indigo-200" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Column: Live Reactive Pass Visualizer & Inclusions (5 cols) */}
            <div className="lg:col-span-5 flex flex-col items-center lg:sticky lg:top-24 space-y-4">
              <LivePassPreview formData={formData} />

              {/* Package Inclusions Checklist */}
              <div className="w-full max-w-85 sm:max-w-90 p-4 rounded-2xl liquid-glass-subtle border border-white/80 shadow-sm text-xs space-y-2.5">
                <div className="font-bold text-slate-600 uppercase tracking-wider text-[10px] mb-1">
                  What is included in your pass:
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Full-day access to all coding &amp; tech contests</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Grand Buffet Feast (Lunch, Tea &amp; Desserts)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verified 6-Digit Digital Pass + Gate QR</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Official BCA Department Certificate &amp; Kit</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
