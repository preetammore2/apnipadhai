'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import { BadgeCheck, MapPin } from 'lucide-react';
import type { FolderStudent } from '@/lib/resultStudents';

interface StudentsGalleryProps {
  students: FolderStudent[];
  category: FolderStudent['category'];
  title: string;
  subtitle: string;
  badge: string;
}

export const StudentsGallery: React.FC<StudentsGalleryProps> = ({
  students,
  category,
  title,
  subtitle,
  badge,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.05 });

  if (students.length === 0) return null;

  return (
    <div ref={sectionRef}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl mx-auto mb-10"
      >
        <span
          className={`text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full border ${
            category === 'Rajasthan Police'
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}
        >
          {badge}
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-navy-900 mt-3">{title}</h2>
        <p className="text-slate-600 text-sm sm:text-base mt-2">{subtitle}</p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {students.map((student, index) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ delay: index * 0.04, duration: 0.4, ease: 'easeOut' }}
            whileHover={inView ? { y: -8 } : undefined}
            className="relative aspect-[3/4] w-full rounded-3xl overflow-hidden border border-slate-200 shadow-card hover:shadow-card-hover transition-shadow group cursor-default bg-slate-100"
          >
            <Image
              src={student.photo}
              alt={`${student.name} - ${category}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw"
              className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />

            <div className="absolute top-2 left-2 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase px-2 py-0.5 flex items-center gap-1 shadow-md">
              <BadgeCheck className="w-3 h-3" /> {student.category === 'Rajasthan Police' ? 'Selected' : 'Qualified'}
            </div>

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-900/90 via-navy-900/30 to-transparent px-3 pt-8 pb-3 text-white text-center">
              <h3 className="text-sm font-bold font-heading leading-snug line-clamp-2">{student.name}</h3>
              {student.district && (
                <p className="text-[11px] font-semibold text-slate-200 mt-0.5 flex items-center justify-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-300" />
                  {student.district}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
