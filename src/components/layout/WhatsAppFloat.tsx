'use client';

import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { motion } from 'framer-motion';

const WHATSAPP_NUMBER = '917073480809';
const WHATSAPP_MESSAGE =
  "Hi! I'm interested in Apni Padhai courses/books. Please help me.";

const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  WHATSAPP_MESSAGE
)}`;

export const WhatsAppFloat: React.FC = () => {
  return (
    <motion.a
      href={waLink}
      target="_blank"
      rel="noreferrer"
      title="Chat with us on WhatsApp"
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-14 right-3 z-50 flex items-center justify-center w-11 h-11 rounded-full bg-emerald-500 text-white shadow-[0_8px_30px_rgba(16,185,129,0.45)] hover:bg-emerald-600 transition-colors"
    >
      <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60 animate-ping" />
      <FaWhatsapp className="relative w-5 h-5" />
    </motion.a>
  );
};