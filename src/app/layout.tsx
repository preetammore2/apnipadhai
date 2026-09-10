import type { Metadata } from 'next';
import { Inter, Manrope, Poppins, Sora } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ReduxProvider } from '@/providers/ReduxProvider';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { CartPersistence } from '@/components/layout/CartPersistence';
import { WishlistPersistence } from '@/components/layout/WishlistPersistence';
import { LanguagePersistence } from '@/components/layout/LanguagePersistence';
import { WhatsAppFloat } from '@/components/layout/WhatsAppFloat';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
});

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
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable} ${poppins.variable} ${sora.variable} scroll-smooth`}
    >
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
            <WhatsAppFloat />
            <Toaster position="top-right" richColors />
          </div>
        </ReduxProvider>
      </body>
    </html>
  );
}
