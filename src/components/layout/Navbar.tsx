'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShoppingBag,
  Phone,
  Menu,
  X,
  BookOpen,
  Download,
  Award,
  Home,
  BookMarked,
  FileText,
  Heart,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setCartOpen } from '@/redux/features/cart/cartSlice';
import {
  setSearchOpen,
  setSearchQuery,
} from '@/redux/features/ui/uiSlice';
import { useTranslation } from '@/i18n/useTranslation';
import { LanguageSwitcher } from './LanguageSwitcher';
import { BOOK_HI } from '@/i18n/data';
import { useGetBooksQuery } from '@/redux/api/bookApi';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { t, language } = useTranslation();
  const cartItems = useAppSelector((state) => state.cart.items);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = useAppSelector((state) => state.wishlist.items.length);
  const isSearchOpen = useAppSelector((state) => state.ui.isSearchOpen);
  const searchQuery = useAppSelector((state) => state.ui.searchQuery);
  const { data: allBooks = [] } = useGetBooksQuery();

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const searchBooks = normalizedQuery
    ? allBooks.filter((book) => {
        const hi = BOOK_HI[book.id];
        return `${book.title} ${book.subtitle ?? ''} ${book.category} ${hi ? `${hi.title} ${hi.subtitle}` : ''}`
          .toLowerCase()
          .includes(normalizedQuery);
      })
    : [];
  const totalResults = searchBooks.length;

  const closeSearch = () => {
    dispatch(setSearchOpen(false));
    dispatch(setSearchQuery(''));
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    dispatch(setSearchOpen(false));
    dispatch(setSearchQuery(''));
  }, [pathname, dispatch]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        dispatch(setSearchOpen(false));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [dispatch]);

  const navLinks = [
    { name: t('Home'), href: '/', icon: <Home className="w-4 h-4" /> },
    { name: t('Books'), href: '/books', icon: <BookMarked className="w-4 h-4" /> },
    { name: t('Sample PDFs'), href: '/book-sample-pdf', icon: <FileText className="w-4 h-4" /> },
    { name: t('PYQs'), href: '/pyqs', icon: <FileText className="w-4 h-4" /> },
    { name: t('Results'), href: '/results', icon: <Award className="w-4 h-4" /> },
    { name: t('Contact'), href: '/contact', icon: <Phone className="w-4 h-4" /> },
  ];

  const isLinkActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* Top Notification Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white text-xs py-2 px-4 text-center font-medium relative z-40 hidden md:block border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-yellow-400 text-navy-950 text-[10px] font-black uppercase rounded-full animate-pulse shadow-button-glow">
              {t('PUBLICATION STORE')}
            </span>
            <span className="text-slate-200">{t('🔥 New editions of the Brahmastra book series are now available!')}</span>
          </div>
          <div className="flex items-center gap-4 text-slate-300 text-[11px]">
            <span>{t('Helpline:')} <strong className="text-yellow-400 font-bold">+91 7568716768</strong></span>
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-amber-100 py-2.5 sm:py-3'
            : 'bg-white py-3 sm:py-4 border-b border-amber-100/60'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-2.5 min-w-0 group shrink-0">
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-2xl overflow-hidden shadow-md group-hover:scale-105 transition-transform p-0.5 bg-white shrink-0">
                <Image
                  src="/logo.png"
                  alt="Apni Padhai Logo"
                  fill
                  sizes="44px"
                  className="object-cover rounded-xl"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-heading font-extrabold text-lg sm:text-xl lg:text-2xl tracking-tight text-navy-900 leading-none truncate">
                  Apni <span className="text-gradient">Padhai</span>
                </span>
                <span className="hidden sm:block text-[8px] sm:text-[10px] font-extrabold text-amber-600 tracking-wider sm:tracking-widest uppercase mt-0.5 truncate">
                  {t('Publication & EdTech')}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 bg-slate-50/80 p-1.5 rounded-full border border-slate-200/80">
              {navLinks.map((link) => {
                const isActive = isLinkActive(link.href);

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`group relative flex items-center gap-1 px-3 xl:px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                      isActive ? 'text-navy-900' : 'text-slate-700 hover:text-navy-900'
                    }`}
                  >
                    <span className="absolute inset-0 rounded-full bg-slate-200/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-yellow-400 shadow-sm rounded-full"
                        transition={{ type: 'spring', stiffness: 420, damping: 38, mass: 0.8 }}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                      />
                    )}
                    <span className="relative z-10">{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Icons & Buttons */}
            <div className="flex items-center gap-1 sm:gap-3">
              <div className="hidden sm:block">
                <LanguageSwitcher />
              </div>

              {/* Search Toggle */}
              <button
                onClick={() => dispatch(setSearchOpen(!isSearchOpen))}
                className="p-2 sm:p-2.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors"
                title={t('Search books')}
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="relative p-2 sm:p-2.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors"
                title={t('View Wishlist')}
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-sm">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Drawer Button (hidden on mobile — Cart is in the fixed bottom bar) */}
              <button
                onClick={() => dispatch(setCartOpen(true))}
                className="hidden sm:inline-flex relative p-2 sm:p-2.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors"
                title={t('View Shopping Cart')}
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-yellow-400 text-navy-950 text-[10px] font-black rounded-full flex items-center justify-center shadow-sm animate-pulse">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Download App CTA */}
              <a
                href="https://apnipadhai.org/"
                target="_blank"
                rel="noreferrer"
                className="hidden xl:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-yellow-400 hover:to-amber-500 text-navy-950 font-black text-xs rounded-full shadow-button-glow transition-all transform hover:-translate-y-0.5 shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>{t('Course')}</span>
              </a>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="relative p-2 sm:p-2.5 text-slate-700 hover:text-navy-900 rounded-xl lg:hidden"
                aria-label={isMobileMenuOpen ? t('Close menu') : t('Open menu')}
                aria-expanded={isMobileMenuOpen}
              >
                <AnimatePresence initial={false}>
                  {isMobileMenuOpen ? (
                    <motion.span
                      key="close-icon"
                      initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                      animate={{ rotate: 0, opacity: 1, scale: 1 }}
                      exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <X className="w-6 h-6" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="menu-icon"
                      initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                      animate={{ rotate: 0, opacity: 1, scale: 1 }}
                      exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Menu className="w-6 h-6" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* Global Search Bar Dropdown */}
        <AnimatePresence initial={false}>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                height: { duration: 0.3, ease: [0.32, 0.72, 0, 1] },
                opacity: { duration: 0.2 },
              }}
              className="overflow-hidden border-t border-amber-100 bg-amber-50/50"
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeOut', delay: 0.05 }}
                className="p-4"
              >
                <div className="max-w-3xl mx-auto relative">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={t('Search for Brahmastra Books, Science, Hindi, English, PYQs...')}
                    value={searchQuery}
                    onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                    className="w-full pl-12 pr-10 py-3 bg-white border border-amber-200 rounded-2xl text-sm focus:outline-none focus:border-yellow-500 shadow-sm text-navy-900"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={() => dispatch(setSearchQuery(''))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Search Results Dropdown */}
                {searchQuery.trim() && (
                  <div className="max-w-3xl mx-auto mt-3 bg-white rounded-2xl border border-amber-100 shadow-lg overflow-hidden">
                    {totalResults === 0 ? (
                      <div className="p-6 text-center">
                        <p className="text-xs font-bold text-slate-600">{t('No results found for')} &quot;{searchQuery}&quot;</p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {t('Try searching for')} &quot;{t('Science')}&quot;, &quot;CET&quot;, &quot;Rajasthan GK&quot; {t('or')} &quot;English&quot;.
                        </p>
                      </div>
                    ) : (
                      <div className="max-h-[420px] overflow-y-auto">
                        <div className="py-2">
                          <p className="px-4 pb-1.5 text-[10px] font-black uppercase tracking-wider text-amber-700">
                            {t('Brahmastra Books')}
                          </p>
                          {searchBooks.slice(0, 6).map((book) => (
                            <Link
                              key={book.id}
                              href={`/books/${book.id}`}
                              onClick={closeSearch}
                              className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50/70 transition-colors"
                            >
                              <div className="p-2 bg-slate-100 rounded-xl shrink-0">
                                <BookOpen className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-navy-900 truncate">
                                  {language === 'hi' ? BOOK_HI[book.id]?.title ?? book.title : book.title}
                                </p>
                                <p className="text-[10px] text-slate-500 truncate">
                                  {book.category}
                                </p>
                              </div>
                              <span className="text-xs font-black text-navy-900 shrink-0">₹{book.price}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </header>

      {/* Search click-away catcher (closes search when clicking outside the header) */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            key="search-click-catcher"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => dispatch(setSearchOpen(false))}
            className="fixed inset-0 z-[39]"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Mobile Full-Screen Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="lg:hidden fixed inset-0 z-[45] bg-gradient-to-b from-white to-amber-50/50 overflow-y-auto overscroll-contain"
            role="dialog"
            aria-modal="true"
            aria-label={t('Mobile navigation')}
          >
            {/* Overlay top bar */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-amber-100">
              <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 min-w-0 group"
                >
                  <div className="relative w-9 h-9 rounded-2xl overflow-hidden p-0.5 bg-white shadow-md shrink-0">
                    <Image src="/logo.png" alt="Apni Padhai Logo" fill sizes="36px" className="object-cover rounded-xl" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-heading font-extrabold text-lg tracking-tight text-navy-900 leading-none truncate">
                      Apni <span className="text-gradient">Padhai</span>
                    </span>
                    <span className="text-[8px] font-extrabold text-amber-600 tracking-wider uppercase mt-0.5 truncate">
                      {t('Publication & EdTech')}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-navy-900 border border-slate-200 transition-colors shrink-0"
                  aria-label={t('Close menu')}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Overlay content */}
            <div className="max-w-7xl mx-auto px-4 py-5">
              <div className="flex flex-col gap-1.5">
                {navLinks.map((link, idx) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * idx, duration: 0.25 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                        isLinkActive(link.href)
                          ? 'bg-yellow-400 text-navy-950 shadow-sm scale-[1.01]'
                          : 'bg-white text-navy-900 hover:bg-amber-50 border border-slate-100'
                      }`}
                    >
                      <span className="p-2 rounded-xl bg-slate-100 shrink-0">{link.icon}</span>
                      <span>{link.name}</span>
                      {isLinkActive(link.href) && (
                        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-navy-950/10 text-navy-950 text-[10px] font-black">
                          •
                        </span>
                      )}
                    </Link>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.25 }}
                className="mt-5 flex justify-center"
              >
                <LanguageSwitcher />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.25 }}
                className="mt-5 space-y-2"
              >
                <a
                  href="https://play.google.com/store/apps/details?id=com.aapni.padhai"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-yellow-400 hover:to-amber-500 text-navy-950 rounded-2xl text-sm font-black shadow-button-glow transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>{t('Install App from Play Store')}</span>
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Floating Quick Action Bottom Bar (Small Devices Only) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-amber-200 shadow-2xl pt-2 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center justify-around sm:hidden">
        <Link
          href="/"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold whitespace-nowrap min-w-0 ${
            isLinkActive('/') ? 'text-amber-700 font-black' : 'text-slate-500'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>{t('Home')}</span>
        </Link>
        <Link
          href="/books"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold whitespace-nowrap min-w-0 ${
            isLinkActive('/books') ? 'text-amber-700 font-black' : 'text-slate-500'
          }`}
        >
          <BookMarked className="w-5 h-5" />
          <span>{t('Books')}</span>
        </Link>
        <Link
          href="/pyqs"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold whitespace-nowrap min-w-0 ${
            isLinkActive('/pyqs') ? 'text-amber-700 font-black' : 'text-slate-500'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span>{t('PYQs')}</span>
        </Link>
        <Link
          href="/results"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold whitespace-nowrap min-w-0 ${
            isLinkActive('/results') ? 'text-amber-700 font-black' : 'text-slate-500'
          }`}
        >
          <Award className="w-5 h-5" />
          <span>{t('Results')}</span>
        </Link>
        <Link
          href="/contact"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold whitespace-nowrap min-w-0 ${
            isLinkActive('/contact') ? 'text-amber-700 font-black' : 'text-slate-500'
          }`}
        >
          <Phone className="w-5 h-5" />
          <span>{t('Contact')}</span>
        </Link>
        <button
          onClick={() => dispatch(setCartOpen(true))}
          className="relative flex flex-col items-center gap-0.5 text-[10px] font-bold text-slate-500 whitespace-nowrap min-w-0"
        >
          <ShoppingBag className="w-5 h-5 text-amber-600" />
          <span>{t('Cart')} ({itemCount})</span>
        </button>
      </div>
    </>
  );
};
