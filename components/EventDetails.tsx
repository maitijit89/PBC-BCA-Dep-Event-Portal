'use client';

import React, { useState } from 'react';
import { Code, Trophy, Utensils, Award, Sparkles, Clock, CheckCircle, HelpCircle, ChevronDown } from 'lucide-react';

const HIGHLIGHTS = [
  {
    icon: Code,
    title: 'Live Hackathon & Coding Contest',
    description: 'Compete in rapid algorithmic problem-solving and full-stack challenges with live leaderboards and spot prizes.',
    badge: 'Tech Contest',
    iconBg: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Trophy,
    title: 'Inter-Batch Tech Quiz',
    description: 'Showcase your tech prowess across computer systems, AI trivia, database design, and web technologies.',
    badge: 'Competition',
    iconBg: 'bg-amber-100 text-amber-600',
  },
  {
    icon: Utensils,
    title: 'Grand Buffet Department Feast',
    description: 'Delicious hot lunch, refreshments, evening tea, and desserts prepared specially for all registered students.',
    badge: 'Included',
    iconBg: 'bg-emerald-100 text-emerald-600',
  },
  {
    icon: Award,
    title: 'Department Kit & Certificates',
    description: 'All participants receive official departmental certificates, customized BCA badges, and digital event passes.',
    badge: 'Perks',
    iconBg: 'bg-purple-100 text-purple-600',
  },
];

const SCHEDULE = [
  { time: '09:30 AM', event: 'Gate Entry & Pass Verification with 6-Digit ID', note: 'Main Gate' },
  { time: '10:15 AM', event: 'Inaugural Ceremony & Welcome Speech by Faculty', note: 'Auditorium' },
  { time: '11:00 AM', event: 'Keynote Tech Session & Coding Arena Kickoff', note: 'Computer Lab 1 & 2' },
  { time: '01:30 PM', event: 'Grand Department Buffet Lunch & Networking', note: 'College Dining Hall' },
  { time: '02:45 PM', event: 'Technical Quiz Finale & Cultural Showcase', note: 'Auditorium' },
  { time: '04:30 PM', event: 'Prize Distribution, Group Photography & Wrap-Up', note: 'Main Stage' },
];

const FAQS = [
  {
    question: 'Why is 1st Semester fee ₹100 while other semesters are ₹250?',
    answer: 'The BCA Department Committee offers a subsidized welcome rate of ₹100 for newly enrolled 1st-semester fresher students. For 2nd through 8th semesters, the fee is ₹250 to cover comprehensive logistics, technical competitions, full event kits, and the grand buffet lunch feast.',
  },
  {
    question: 'How do I receive my event entry pass?',
    answer: 'Immediately upon completing your payment via Razorpay, a digital pass with your unique 6-digit numeric ID is shown on screen, and an official HTML invitation letter is automatically sent to your provided email address.',
  },
  {
    question: 'Do I need to create an account or password to register?',
    answer: 'No! The registration system is completely frictionless with zero login/signup barriers. You only need your Name, Email, Phone, Age, and Semester.',
  },
  {
    question: 'What if I made a payment but didn’t receive the email?',
    answer: 'Please check your Spam/Junk folder first. You can also write down your 6-digit ID shown on the confirmation popup. If you still need assistance, use the Helpdesk form at the bottom of the page and our committee will assist you.',
  },
];

export function EventDetails() {
  const [activeTab, setActiveTab] = useState<'highlights' | 'schedule' | 'guidelines' | 'faq'>('highlights');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <section id="details" className="py-16 md:py-24 relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-pill text-indigo-700 text-xs font-bold mb-3.5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Everything You Need To Know
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Event Highlights &amp; Schedule
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            A full-day fiesta packed with technical competitions, interactive games, departmental dining, and cultural celebrations.
          </p>

          {/* Apple Glass Segmented Pill Tabs (Horizontally swipeable on compact screens) */}
          <div className="w-full overflow-x-auto no-scrollbar py-2 px-1">
            <div className="inline-flex items-center justify-start sm:justify-center p-1.5 rounded-full liquid-glass-subtle gap-1.5 border-white/80 min-w-max mx-auto shadow-xs">
              <button
                type="button"
                onClick={() => setActiveTab('highlights')}
                className={`min-h-10 sm:min-h-11 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-300 flex items-center justify-center cursor-pointer select-none touch-manipulation ${
                  activeTab === 'highlights'
                    ? 'apple-glass-btn text-white shadow-md'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-white/60 active:scale-95'
                }`}
              >
                Highlights &amp; Perks
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('schedule')}
                className={`min-h-10 sm:min-h-11 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-300 flex items-center justify-center cursor-pointer select-none touch-manipulation ${
                  activeTab === 'schedule'
                    ? 'apple-glass-btn text-white shadow-md'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-white/60 active:scale-95'
                }`}
              >
                Schedule Timeline
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('guidelines')}
                className={`min-h-10 sm:min-h-11 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-300 flex items-center justify-center cursor-pointer select-none touch-manipulation ${
                  activeTab === 'guidelines'
                    ? 'apple-glass-btn text-white shadow-md'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-white/60 active:scale-95'
                }`}
              >
                Student Guidelines
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('faq')}
                className={`min-h-10 sm:min-h-11 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-300 flex items-center justify-center cursor-pointer select-none touch-manipulation ${
                  activeTab === 'faq'
                    ? 'apple-glass-btn text-white shadow-md'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-white/60 active:scale-95'
                }`}
              >
                Event FAQs
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: Highlights */}
        {activeTab === 'highlights' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {HIGHLIGHTS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-7 rounded-3xl liquid-glass-card group"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className={`p-4 rounded-2xl ${item.iconBg} shadow-sm backdrop-blur-md`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full liquid-glass-subtle text-slate-700 border-white/80">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Schedule */}
        {activeTab === 'schedule' && (
          <div className="max-w-3xl mx-auto rounded-3xl liquid-glass p-6 sm:p-9 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-200/60">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h3 className="text-xl font-bold text-slate-900">Event Schedule Breakdown</h3>
            </div>
            <div className="space-y-3.5">
              {SCHEDULE.map((slot, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 p-4 rounded-2xl liquid-glass-subtle hover:bg-white/90 border-white/70 transition-all duration-200"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="text-xs font-mono font-bold text-indigo-700 shrink-0 bg-indigo-500/15 px-3.5 py-1.5 rounded-xl border border-indigo-500/20 backdrop-blur-md">
                      {slot.time}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      {slot.event}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium sm:text-right pl-14 sm:pl-0">
                    📍 {slot.note}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Guidelines */}
        {activeTab === 'guidelines' && (
          <div className="max-w-3xl mx-auto rounded-3xl liquid-glass p-6 sm:p-9 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-200/60">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <h3 className="text-xl font-bold text-slate-900">Official Attendee Guidelines</h3>
            </div>
            <ul className="space-y-3.5 text-sm text-slate-700">
              <li className="flex items-start gap-3.5 p-4 rounded-2xl liquid-glass-subtle border-white/70">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 mt-1.5 shrink-0 shadow-xs" />
                <span>
                  Present your <strong>6-digit Entry Pass ID</strong> or email confirmation on your phone at the entry desk.
                </span>
              </li>
              <li className="flex items-start gap-3.5 p-4 rounded-2xl liquid-glass-subtle border-white/70">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 mt-1.5 shrink-0 shadow-xs" />
                <span>
                  Carry your College Student ID card for physical identification.
                </span>
              </li>
              <li className="flex items-start gap-3.5 p-4 rounded-2xl liquid-glass-subtle border-white/70">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 mt-1.5 shrink-0 shadow-xs" />
                <span>
                  Coding contestants should bring their laptops. Power points and Wi-Fi will be provided.
                </span>
              </li>
              <li className="flex items-start gap-3.5 p-4 rounded-2xl liquid-glass-subtle border-white/70">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 mt-1.5 shrink-0 shadow-xs" />
                <span>
                  All pass fees directly fund event logistics, food, kits, and prizes (strictly non-refundable).
                </span>
              </li>
            </ul>
          </div>
        )}

        {/* Tab 4: FAQ Accordion */}
        {activeTab === 'faq' && (
          <div className="max-w-3xl mx-auto rounded-3xl liquid-glass p-6 sm:p-9 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-3.5">
            <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-slate-200/60">
              <HelpCircle className="w-5 h-5 text-indigo-600" />
              <h3 className="text-xl font-bold text-slate-900">Frequently Asked Questions</h3>
            </div>
            {FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl liquid-glass-subtle overflow-hidden border-white/80 transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-4.5 text-left font-bold text-sm text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4.5 pb-4.5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/50 animate-in fade-in duration-200">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
