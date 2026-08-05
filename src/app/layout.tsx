import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ReduxProvider } from '@/providers/ReduxProvider';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { CartPersistence } from '@/components/layout/CartPersistence';
import { WishlistPersistence } from '@/components/layout/WishlistPersistence';
import { LanguagePersistence } from '@/components/layout/LanguagePersistence';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Apni Padhai — Bestselling Brahmastra Books & Live Coaching',
  description:
    'Apni Padhai is India\'s smart educational platform offering live online courses, Rajasthan GK, Sub Inspector, CET 2026, SSC GD, RAS Pre+Mains, and Brahmastra books by Rohit Sir.',
  keywords: [
    'Apni Padhai',
    'Apni Padhai Publication',
    'Rohit Sir',
    'Brahmastra Science Book',
    'Rajasthan CET 2026',
    'SSC GD Coaching',
    'RAS Coaching Jaipur Bhilwara',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased bg-slate-50 text-navy-900 selection:bg-yellow-200 selection:text-amber-900">
        <ReduxProvider>
          <CartPersistence />
          <WishlistPersistence />
          <LanguagePersistence />
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow pb-16 sm:pb-0">{children}</main>
            <Footer />
            <CartDrawer />
            <Toaster position="top-right" richColors />
          </div>
        </ReduxProvider>
      </body>
    </html>
  );
}
