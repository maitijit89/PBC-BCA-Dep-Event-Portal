'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { LiveTracker } from '@/components/LiveTracker';
import { RegistrationForm } from '@/components/RegistrationForm';
import { EventDetails } from '@/components/EventDetails';
import { ContactSection } from '@/components/ContactSection';
import { Footer } from '@/components/Footer';
import { TicketModal, TicketDetails } from '@/components/TicketModal';

export default function Home() {
  const [ticketDetails, setTicketDetails] = useState<TicketDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePaymentSuccess = (ticket: TicketDetails) => {
    setTicketDetails(ticket);
    setIsModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-transparent text-slate-900 flex flex-col justify-between selection:bg-indigo-600 selection:text-white relative z-10">
      {/* Navigation Bar */}
      <Navbar />

      {/* Hero Welcome Header */}
      <HeroSection />

      {/* Live Collection & Registration Stats Tracker */}
      <LiveTracker />

      {/* Main Registration & Dynamic Pricing Form */}
      <RegistrationForm onPaymentSuccess={handlePaymentSuccess} />

      {/* Event Details & Interactive Schedule */}
      <EventDetails />

      {/* Support / Helpdesk Section */}
      <ContactSection />

      {/* Footer */}
      <Footer />

      {/* Post-Payment Success Modal with 6-Digit ID Pass */}
      <TicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ticket={ticketDetails}
      />
    </main>
  );
}
