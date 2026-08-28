import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'BCA Department Event 2026 | Panskura Banamali College',
  description:
    'Official Registration and Fee Collection Web Portal for BCA Department Event at Panskura Banamali College. Fast, secure online checkout with instant digital pass issuance.',
  keywords: [
    'Panskura Banamali College',
    'BCA Event',
    'Computer Application',
    'College Tech Fest',
    'Event Registration',
  ],
  authors: [{ name: 'BCA Department Committee' }],
  icons: {
    icon: '/college-logo.png',
    apple: '/college-logo.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#4f46e5',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        suppressHydrationWarning
        className="antialiased selection:bg-indigo-600 selection:text-white bg-[#f6f8fd] text-slate-900 relative pb-16 md:pb-0"
      >
        {/* Apple Liquid Ambient Mesh Background */}
        <div className="liquid-bg-canvas" aria-hidden="true">
          <div className="liquid-orb liquid-orb-1" />
          <div className="liquid-orb liquid-orb-2" />
          <div className="liquid-orb liquid-orb-3" />
          <div className="liquid-orb liquid-orb-4" />
          <div className="liquid-orb liquid-orb-5" />
        </div>

        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.9)',
              color: '#0f172a',
              boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.1)',
            },
          }}
        />
      </body>
    </html>
  );
}
