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
  ChevronDown,
  BookOpen,
  GraduationCap,
  Sparkles,
  Download,
  FileCheck,
  Award,
  Layers,
  Home,
  BookMarked,
  FileText,
  Heart,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setCartOpen } from '@/redux/features/cart/cartSlice';
import {
  setCounselorModalOpen,
  setSearchOpen,
  setSearchQuery,
} from '@/redux/features/ui/uiSlice';
import { useTranslation } from '@/i18n/useTranslation';
import { LanguageSwitcher } from './LanguageSwitcher';
import { COURSES_DATA } from '@/data/courses';
import { BOOKS_DATA } from '@/data/books';
import { COURSE_HI, BOOK_HI } from '@/i18n/data';

interface NavbarProps {
  onOpenCounselorModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCounselorModal }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCoursesMegaMenuOpen, setIsCoursesMegaMenuOpen] = useState(false);

  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { t, language } = useTranslation();
  const cartItems = useAppSelector((state) => state.cart.items);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = useAppSelector((state) => state.wishlist.items.length);
  const isSearchOpen = useAppSelector((state) => state.ui.isSearchOpen);
  const searchQuery = useAppSelector((state) => state.ui.searchQuery);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const searchResults = normalizedQuery
    ? {
        courses: COURSES_DATA.filter((course) => {
          const hi = COURSE_HI[course.id];
          return `${course.title} ${course.subtitle} ${course.targetExam} ${course.category} ${hi ? `${hi.title} ${hi.subtitle} ${hi.targetExam}` : ''}`
            .toLowerCase()
            .includes(normalizedQuery);
        }),
        books: BOOKS_DATA.filter((book) => {
          const hi = BOOK_HI[book.id];
          return `${book.title} ${book.subtitle} ${book.category} ${book.examTarget} ${hi ? `${hi.title} ${hi.subtitle} ${hi.examTarget}` : ''}`
            .toLowerCase()
            .includes(normalizedQuery);
        }),
      }
    : null;
  const totalResults = searchResults ? searchResults.courses.length + searchResults.books.length : 0;

  const closeSearch = () => {
    dispatch(setSearchOpen(false));
    dispatch(setSearchQuery(''));
  };

  const handleCounselorModal = () => {
    dispatch(setCounselorModalOpen(true));
    if (onOpenCounselorModal) onOpenCounselorModal();
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

  const navLinks = [
    { name: t('Home'), href: '/' },
    { name: t('All Courses'), href: '/courses', hasDropdown: true },
    { name: t('Books'), href: '/books' },
    { name: t('PYQs'), href: '/pyqs' },
    { name: t('Results'), href: '/results' },
    { name: t('Contact'), href: '/contact' },
  ];

  const courseCategories = [
    {
      name: t('Rajasthan GK Master Batches'),
      desc: t('Complete History, Art & Culture, Geography & Polity'),
      href: '/courses?category=rajasthan-gk',
      icon: <BookOpen className="w-5 h-5 text-amber-600" />,
    },
    {
      name: t('Rajasthan CET 2026'),
      desc: t('Senior Secondary (12th Pass) & Graduate Level Prep'),
      href: '/courses?category=cet',
      icon: <GraduationCap className="w-5 h-5 text-blue-600" />,
    },
    {
      name: t('SSC GD Target Foundation'),
      desc: t('Mass recruitment preparation for Constable posts'),
      href: '/courses?category=ssc-gd',
      icon: <Award className="w-5 h-5 text-amber-500" />,
    },
    {
      name: t('RAS Pre + Mains Integrated'),
      desc: t('Comprehensive Civil Services Guidance & Answer Writing'),
      href: '/courses?category=ras',
      icon: <Sparkles className="w-5 h-5 text-emerald-600" />,
    },
    {
      name: t('High Court LDC & Group D'),
      desc: t('Special Language & Aptitude Mastery Crash Courses'),
      href: '/courses?category=ldc',
      icon: <Layers className="w-5 h-5 text-purple-600" />,
    },
    {
      name: t('General Science Brahmastra'),
      desc: t('NCERT based Physics, Chemistry & Biology'),
      href: '/courses?category=science',
      icon: <FileCheck className="w-5 h-5 text-rose-600" />,
    },
  ];

  return (
    <>
      {/* Top Notification Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white text-xs py-2 px-4 text-center font-medium relative z-40 hidden md:block border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-yellow-400 text-navy-950 text-[10px] font-black uppercase rounded-full animate-pulse shadow-button-glow">
              {t('NEW BATCHES LIVE')}
            </span>
            <span className="text-slate-200">{t('🔥 Rajasthan CET 2026 & SSC GD Special Brahmastra Batches are live!')}</span>
          </div>
          <div className="flex items-center gap-4 text-slate-300 text-[11px]">
            <span>{t('Helpline:')} <strong className="text-yellow-400 font-bold">+91 7568716768</strong></span>
            <span>•</span>
            <button
              onClick={handleCounselorModal}
              className="text-yellow-300 hover:text-white font-bold underline flex items-center gap-1 transition-colors"
            >
              <Phone className="w-3 h-3 text-yellow-400" />
              {t('Request Free Callback')}
            </button>
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
          <div className="flex items-center justify-between gap-3">
            
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl overflow-hidden shadow-md group-hover:scale-105 transition-transform p-0.5 bg-white">
                <Image
                  src="/logo.jpg"
                  alt="Apni Padhai Logo"
                  fill
                  className="object-cover rounded-xl"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-extrabold text-xl sm:text-2xl tracking-tight text-navy-900 leading-none">
                  Apni <span className="text-gradient">Padhai</span>
                </span>
                <span className="text-[9px] sm:text-[10px] font-extrabold text-amber-600 tracking-widest uppercase mt-0.5">
                  {t('Publication & EdTech')}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1.5 bg-slate-50/80 p-1.5 rounded-full border border-slate-200/80">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;

                if (link.hasDropdown) {
                  return (
                    <div
                      key={link.name}
                      className="relative"
                      onMouseEnter={() => setIsCoursesMegaMenuOpen(true)}
                      onMouseLeave={() => setIsCoursesMegaMenuOpen(false)}
                    >
                      <button
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                          isActive || isCoursesMegaMenuOpen
                            ? 'text-navy-900 bg-yellow-400 shadow-sm'
                            : 'text-slate-700 hover:text-navy-900 hover:bg-slate-200/60'
                        }`}
                      >
                        <span>{link.name}</span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform ${
                            isCoursesMegaMenuOpen ? 'rotate-180 text-navy-900' : 'text-slate-500'
                          }`}
                        />
                      </button>

                      {/* Mega Dropdown Menu */}
                      <AnimatePresence>
                        {isCoursesMegaMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 w-[540px] bg-white rounded-3xl shadow-2xl border border-amber-200 p-6 grid grid-cols-2 gap-3 mt-1 z-50"
                          >
                            {courseCategories.map((cat, idx) => (
                              <Link
                                key={idx}
                                href={cat.href}
                                onClick={() => setIsCoursesMegaMenuOpen(false)}
                                className="flex items-start gap-3 p-3 rounded-2xl hover:bg-amber-50/60 transition-colors group"
                              >
                                <div className="p-2.5 bg-slate-100 rounded-xl group-hover:bg-yellow-400 group-hover:shadow-sm transition-all shrink-0">
                                  {cat.icon}
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-navy-900 group-hover:text-amber-700 transition-colors">
                                    {cat.name}
                                  </h4>
                                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                                    {cat.desc}
                                  </p>
                                </div>
                              </Link>
                            ))}
                            <div className="col-span-2 mt-2 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                              <span className="text-slate-500">{t('Looking for custom exam strategy?')}</span>
                              <Link
                                href="/courses"
                                onClick={() => setIsCoursesMegaMenuOpen(false)}
                                className="font-bold text-amber-600 hover:underline"
                              >
                                {t('View All Batches →')}
                              </Link>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      isActive
                        ? 'text-navy-900 bg-yellow-400 shadow-sm'
                        : 'text-slate-700 hover:text-navy-900 hover:bg-slate-200/60'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Icons & Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              <div className="hidden sm:block">
                <LanguageSwitcher />
              </div>

              {/* Search Toggle */}
              <button
                onClick={() => dispatch(setSearchOpen(!isSearchOpen))}
                className="p-2 sm:p-2.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors"
                title={t('Search courses & books')}
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

              {/* Talk to Counselor Button */}
              <button
                onClick={handleCounselorModal}
                className="hidden xl:flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-navy-900 text-xs font-bold rounded-full transition-colors border border-slate-200"
              >
                <Phone className="w-3.5 h-3.5 text-amber-600" />
                <span>{t('Talk to Counselor')}</span>
              </button>

              {/* Download App CTA */}
              <a
                href="https://play.google.com/store/search?q=apni+padhai&c=apps"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-yellow-400 hover:to-amber-500 text-navy-950 font-black text-xs rounded-full shadow-button-glow transition-all transform hover:-translate-y-0.5 shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>{t('Download App')}</span>
              </a>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 sm:p-2.5 text-slate-700 hover:text-navy-900 rounded-xl lg:hidden"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Global Search Bar Dropdown */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-amber-100 bg-amber-50/50 p-4"
            >
              <div className="max-w-3xl mx-auto relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t('Search for Rajasthan GK, Brahmastra Books, CET, Science, PYQs...')}
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
              {searchResults && (
                <div className="max-w-3xl mx-auto mt-3 bg-white rounded-2xl border border-amber-100 shadow-lg overflow-hidden">
                  {totalResults === 0 ? (
                    <div className="p-6 text-center">
                      <p className="text-xs font-bold text-slate-600">{t('No results found for')} &quot;{searchQuery}&quot;</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {t('Try searching for')} &quot;{t('Science')}&quot;, &quot;CET&quot;, &quot;Rajasthan GK&quot; {t('or')} &quot;History&quot;.
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-[420px] overflow-y-auto">
                      {searchResults.courses.length > 0 && (
                        <div className="py-2">
                          <p className="px-4 pb-1.5 text-[10px] font-black uppercase tracking-wider text-amber-700">
                            {t('Live Batches')}
                          </p>
                          {searchResults.courses.slice(0, 4).map((course) => (
                            <Link
                              key={course.id}
                              href={`/courses/${course.id}`}
                              onClick={closeSearch}
                              className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50/70 transition-colors"
                            >
                              <div className="p-2 bg-slate-100 rounded-xl shrink-0">
                                <GraduationCap className="w-4 h-4 text-amber-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-navy-900 truncate">
                                  {language === 'hi' ? COURSE_HI[course.id]?.title ?? course.title : course.title}
                                </p>
                                <p className="text-[10px] text-slate-500 truncate">
                                  {language === 'hi' ? COURSE_HI[course.id]?.targetExam ?? course.targetExam : course.targetExam}
                                </p>
                              </div>
                              <span className="text-xs font-black text-navy-900 shrink-0">₹{course.price}</span>
                            </Link>
                          ))}
                        </div>
                      )}

                      {searchResults.books.length > 0 && (
                        <div className="py-2 border-t border-slate-100">
                          <p className="px-4 pb-1.5 text-[10px] font-black uppercase tracking-wider text-amber-700">
                            {t('Brahmastra Books')}
                          </p>
                          {searchResults.books.slice(0, 4).map((book) => (
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
                                  {language === 'hi' ? BOOK_HI[book.id]?.examTarget ?? book.category : book.category}
                                </p>
                              </div>
                              <span className="text-xs font-black text-navy-900 shrink-0">₹{book.price}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-b border-amber-100 px-5 py-5 space-y-4 shadow-xl overflow-hidden"
            >
              <div className="flex justify-center">
                <LanguageSwitcher />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-xl text-xs font-bold text-center transition-colors ${
                      pathname === link.href
                        ? 'bg-yellow-400 text-navy-950 font-black'
                        : 'bg-slate-50 text-navy-900 hover:bg-yellow-100'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleCounselorModal();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 text-navy-900 rounded-xl text-xs font-bold"
                >
                  <Phone className="w-4 h-4 text-amber-600" />
                  <span>{t('Talk to Academic Counselor')}</span>
                </button>
                <a
                  href="https://play.google.com/store/search?q=apni+padhai&c=apps"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-yellow-400 text-navy-950 rounded-xl text-xs font-black shadow-button-glow"
                >
                  <Download className="w-4 h-4" />
                  <span>{t('Install App from Play Store')}</span>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Floating Quick Action Bottom Bar (Small Devices Only) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-amber-200 shadow-2xl py-2 px-4 flex items-center justify-around sm:hidden">
        <Link
          href="/"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            pathname === '/' ? 'text-amber-700 font-black' : 'text-slate-500'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>{t('Home')}</span>
        </Link>
        <Link
          href="/courses"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            pathname.startsWith('/courses') ? 'text-amber-700 font-black' : 'text-slate-500'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>{t('Courses')}</span>
        </Link>
        <Link
          href="/books"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            pathname.startsWith('/books') ? 'text-amber-700 font-black' : 'text-slate-500'
          }`}
        >
          <BookMarked className="w-5 h-5" />
          <span>{t('Books')}</span>
        </Link>
        <Link
          href="/pyqs"
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            pathname === '/pyqs' ? 'text-amber-700 font-black' : 'text-slate-500'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span>{t('PYQs')}</span>
        </Link>
        <button
          onClick={() => dispatch(setCartOpen(true))}
          className="relative flex flex-col items-center gap-0.5 text-[10px] font-bold text-slate-500"
        >
          <ShoppingBag className="w-5 h-5 text-amber-600" />
          <span>{t('Cart')} ({itemCount})</span>
        </button>
      </div>
    </>
  );
};
