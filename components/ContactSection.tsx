'use client';

import React, { useState } from 'react';
import { Send, Mail, User, MessageSquare, Loader2, CheckCircle2, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ContactFormData } from '@/lib/types';

export function ContactSection() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please fill in all contact fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || 'Inquiry sent successfully!');
        setSubmitted(true);
        setFormData({ name: '', email: '', message: '' });
      } else {
        throw new Error(data.message || 'Failed to submit message.');
      }
    } catch (err: unknown) {
      console.error('Contact error:', err);
      const msg = err instanceof Error ? err.message : 'An error occurred. Please try again later.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="support" className="py-12 md:py-20 relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="liquid-glass rounded-3xl p-5 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Ambient Corner Blur */}
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-linear-to-tl from-indigo-300/15 via-purple-300/10 to-transparent rounded-tl-full pointer-events-none blur-xl" />

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center relative">
            {/* Left Info Column */}
            <div className="md:col-span-2 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-pill text-indigo-700 text-xs font-bold shadow-xs">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                Student Support &amp; Helpdesk
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                Have questions or need assistance?
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                Whether you have issues with fee checkout, lost your 6-digit pass ID, or want to inquire about event events, drop us a message and our student committee will get back to you promptly.
              </p>
              <div className="pt-3 text-xs text-slate-500 space-y-0.5">
                <p className="font-bold text-slate-800 text-sm">Department of BCA</p>
                <p>Panskura Banamali College, Purba Medinipur</p>
              </div>
            </div>

            {/* Right Form Column */}
            <div className="md:col-span-3">
              {submitted ? (
                <div className="p-8 rounded-3xl bg-emerald-50/80 border border-emerald-200/80 backdrop-blur-xl text-center space-y-3 shadow-sm animate-in fade-in zoom-in-95 duration-300">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="text-xl font-bold text-slate-900">Message Dispatched!</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Your inquiry has been emailed to the BCA Event committee. We will respond via your provided email address shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="inline-flex items-center gap-2 text-xs text-indigo-700 hover:text-indigo-900 font-bold mt-2 cursor-pointer"
                  >
                    Send another query &rarr;
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label htmlFor="contact-name" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Your Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        id="contact-name"
                        name="name"
                        required
                        autoComplete="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl liquid-glass-input text-slate-900 text-base sm:text-sm outline-none placeholder-slate-400 font-medium"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Your Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        id="contact-email"
                        name="email"
                        required
                        inputMode="email"
                        autoComplete="email"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="yourname@gmail.com"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl liquid-glass-input text-slate-900 text-base sm:text-sm outline-none placeholder-slate-400 font-medium"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="contact-message" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Message / Inquiry
                    </label>
                    <div className="relative">
                      <div className="absolute top-3.5 left-3.5 pointer-events-none text-slate-400">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <textarea
                        id="contact-message"
                        name="message"
                        required
                        rows={3}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Type your question or query here..."
                        className="w-full pl-10 pr-4 py-3 rounded-2xl liquid-glass-input text-slate-900 text-base sm:text-sm outline-none placeholder-slate-400 resize-none font-medium"
                      />
                    </div>
                  </div>

                  {/* Apple Gloss Submit button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="apple-glass-btn w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl text-white font-bold text-sm shadow-lg disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending message...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message to Committee</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
