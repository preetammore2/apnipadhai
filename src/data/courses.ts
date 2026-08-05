import { Course } from '@/types';

export const COURSES_DATA: Course[] = [
  {
    id: 'rajasthan-gk-complete-2026',
    title: 'Rajasthan GK Complete Online Batch 2026',
    subtitle: 'Comprehensive History, Geography, Polity, Art & Culture of Rajasthan',
    category: 'rajasthan-gk',
    targetExam: 'RAS, SI, CET, Grade 1/2/3 Teacher, Patwari, LDC',
    description: 'Master Rajasthan General Knowledge with Rohit Sir and top educators. Includes live interactive classes, printed note PDF access, topic-wise PYQs, and 50+ full-length test series.',
    price: 1499,
    originalPrice: 3999,
    discountPercentage: 62,
    rating: 4.9,
    reviewCount: 3840,
    enrolledStudents: 28450,
    durationMonths: 6,
    totalLectures: 280,
    totalTests: 65,
    language: 'Hindi',
    level: 'Foundation',
    instructor: {
      name: 'Rohit Choudhary',
      role: 'Founder & Lead GK Specialist',
      image: '/images/rohit sir QHD Photo.png',
      experience: '10+ Years Teaching Experience',
    },
    features: [
      '280+ Live & Recorded HD Lectures',
      'Daily Handwritten PDF Notes',
      'Topic-wise PYQ Discussion & Solutions',
      'Dedicated Live Doubt Resolution Sessions',
      'Monthly Current Affairs Special Classes',
      'Validity: 12 Months Access'
    ],
    curriculum: [
      {
        title: 'Module 1: Rajasthan History & Royal Dynasties',
        lecturesCount: 45,
        duration: '60 Hours',
        topics: ['Mewar & Marwar Dynasties', '1857 Revolt in Rajasthan', 'Peasant & Tribal Movements', 'Integration of Rajasthan']
      },
      {
        title: 'Module 2: Rajasthan Art, Architecture & Folklore',
        lecturesCount: 50,
        duration: '65 Hours',
        topics: ['Forts, Palaces & Havelis', 'Folk Deities (Lok Devta/Deviyan)', 'Folk Music & Dances', 'Handicrafts & Jewelry']
      },
      {
        title: 'Module 3: Physical & Economic Geography of Rajasthan',
        lecturesCount: 40,
        duration: '50 Hours',
        topics: ['Physical Divisions', 'River System & Lakes', 'Climate & Vegetation', 'Minerals & Industries']
      },
      {
        title: 'Module 4: Polity & State Administration System',
        lecturesCount: 35,
        duration: '45 Hours',
        topics: ['Governor & CM Roles', 'High Court & Judiciary', 'Panchayati Raj System', 'State Human Rights Commission']
      }
    ],
    isBestseller: true,
    isPopular: true,
    image: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'ssc-gd-foundation-batch',
    title: 'SSC GD Complete Target Foundation Batch',
    subtitle: 'Maths, Reasoning, Hindi/English & General Knowledge Mastery',
    category: 'ssc-gd',
    targetExam: 'SSC GD Constable 2026',
    description: 'Specialized intensive coaching for SSC GD aspirants. Guaranteed concept clarity, speed enhancement tricks, and previous 10 years solved paper discussion.',
    price: 999,
    originalPrice: 2499,
    discountPercentage: 60,
    rating: 4.8,
    reviewCount: 2120,
    enrolledStudents: 19300,
    durationMonths: 4,
    totalLectures: 220,
    totalTests: 40,
    language: 'Bilingual',
    level: 'Target',
    instructor: {
      name: 'Apni Padhai Faculty Team',
      role: 'SSC Exam Experts',
      image: '/images/rohit sir QHD Photo.png',
      experience: 'Combined 25+ Yrs Exp',
    },
    features: [
      '220+ Chapterwise Video Lessons',
      'Speed Math Shortcuts & Tricks',
      'Hindi Vyakaran Special Crash Course',
      'Mock Tests with All-India Rank Analysis',
      'Unlimited Replay Access'
    ],
    curriculum: [
      {
        title: 'Elementary Mathematics',
        lecturesCount: 60,
        duration: '70 Hours',
        topics: ['Percentage & Profit-Loss', 'Ratio & Proportion', 'Time, Work & Distance', 'Mensuration 2D/3D']
      },
      {
        title: 'General Intelligence & Reasoning',
        lecturesCount: 50,
        duration: '55 Hours',
        topics: ['Coding-Decoding', 'Analogy & Series', 'Blood Relations', 'Non-Verbal Reasoning']
      }
    ],
    isPopular: true,
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'rajasthan-cet-brahmastra-batch',
    title: 'Rajasthan CET (Graduate & 12th Pass) Brahmastra Batch',
    subtitle: 'All-in-One Comprehensive Prep for Senior Secondary & Graduate CET',
    category: 'cet',
    targetExam: 'Rajasthan CET 2026',
    description: 'One single course covering Rajasthan GK, Science, Hindi, English, Maths, Reasoning & Computer for CET clearing confidence.',
    price: 1299,
    originalPrice: 3499,
    discountPercentage: 62,
    rating: 4.9,
    reviewCount: 4150,
    enrolledStudents: 31200,
    durationMonths: 5,
    totalLectures: 320,
    totalTests: 75,
    language: 'Hindi',
    level: 'Foundation',
    instructor: {
      name: 'Rohit Sir & Team',
      role: 'EdTech Pioneer',
      image: '/images/rohit sir QHD Photo.png',
      experience: '10+ Years Exp',
    },
    features: [
      '320+ Detailed Live Classes',
      'Complimentary Brahmastra E-Books Access',
      'Topic-wise Daily Practice Sets (DPPs)',
      'Live Doubts Resolution',
      'Performance Analytics Dashboard'
    ],
    curriculum: [
      {
        title: 'General Science & Environment',
        lecturesCount: 50,
        duration: '55 Hours',
        topics: ['Physics Concepts', 'Chemistry in Daily Life', 'Biology & Human Body', 'Environment & Ecology']
      },
      {
        title: 'Samanya Hindi & General English',
        lecturesCount: 60,
        duration: '60 Hours',
        topics: ['Sandhi, Samas & Upsarg', 'Vocabulary & One Word', 'Grammar Rules & Spotting Errors']
      }
    ],
    isBestseller: true,
    isPopular: true,
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'ras-foundation-pre-mains',
    title: 'RAS Pre + Mains Integrated Comprehensive Batch',
    subtitle: 'Exhaustive Civil Services Preparation with Mains Answer Writing',
    category: 'ras',
    targetExam: 'RAS 2026-2027',
    description: 'Designed by former bureaucrats and top subject experts. Includes comprehensive GS papers covering, Ethics, Economy, History, Admin Law & Daily Mains Answer Evaluation.',
    price: 4999,
    originalPrice: 12999,
    discountPercentage: 61,
    rating: 4.95,
    reviewCount: 1280,
    enrolledStudents: 8900,
    durationMonths: 12,
    totalLectures: 550,
    totalTests: 120,
    language: 'Bilingual',
    level: 'Foundation',
    instructor: {
      name: 'Rohit Sir & Expert Bureaucrat Panel',
      role: 'RAS Mentor Group',
      image: '/images/rohit sir QHD Photo.png',
      experience: '15+ Yrs Combined',
    },
    features: [
      '550+ Live Interactive Modules',
      'Personalized Mains Answer Reviewing',
      'Printed Study Material Courier to Doorstep',
      'Dedicated Mentor Assigned',
      'Interview Guidance Program Included'
    ],
    curriculum: [
      {
        title: 'GS Paper I: History, Economy & Sociology',
        lecturesCount: 150,
        duration: '180 Hours',
        topics: ['Indian & World History', 'Rajasthan Economy & Budget', 'Sociology & Management']
      }
    ],
    isPopular: true,
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'science-brahmastra-special',
    title: 'General Science Brahmastra Live Batch',
    subtitle: 'Physics, Chemistry & Biology with Real-Life Experiments & PYQs',
    category: 'science',
    targetExam: 'CET, LDC, Railway, SSC, Police Exam',
    description: 'Eliminate your fear of science! Clear concepts through visual animations, zero-formula physics approach, and exam-oriented biology diagrams.',
    price: 499,
    originalPrice: 1499,
    discountPercentage: 66,
    rating: 4.85,
    reviewCount: 1950,
    enrolledStudents: 15400,
    durationMonths: 3,
    totalLectures: 90,
    totalTests: 30,
    language: 'Hindi',
    level: 'Target',
    instructor: {
      name: 'Science Expert Faculty',
      role: 'Senior Science Mentor',
      image: '/images/rohit sir QHD Photo.png',
      experience: '8+ Years Exp',
    },
    features: [
      '90+ Animated HD Video Classes',
      'Free Access to Science Brahmastra PDF',
      'Chapterwise 2000+ MCQ Practice Set',
      'Formula & Mindmaps Cheat Sheet'
    ],
    curriculum: [
      {
        title: 'Human Physiology & Biology',
        lecturesCount: 35,
        duration: '40 Hours',
        topics: ['Digestive & Nervous Systems', 'Genetics & Biotechnology', 'Diseases & Vaccines']
      }
    ],
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
  }
];
