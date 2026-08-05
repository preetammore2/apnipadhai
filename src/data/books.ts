import { Book } from '@/types';

export const BOOKS_DATA: Book[] = [
  {
    id: 'general-english-brahmastra',
    title: 'General English Brahmastra Book',
    subtitle: 'Comprehensive Grammar, Vocabulary & Practice Set for All Competitive Exams',
    category: 'General English',
    examTarget: 'CET, LDC, High Court, SSC GD, Sub Inspector',
    price: 120,
    originalPrice: 130,
    discountPercentage: 8,
    rating: 4.9,
    reviewsCount: 420,
    author: 'Apni Padhai Editorial Team',
    pages: 320,
    edition: '2026 Latest Edition',
    inStock: true,
    coverImage: '/images/english front.png',
    samplePdfUrl: '/samples/general-english-sample.pdf',
    features: [
      'Comprehensive Grammar Rules with Hindi Explanations',
      '5000+ Frequent Vocabulary Words (Synonyms, Antonyms, One-Words)',
      'Topic-wise PYQs from Previous 15 Years Exams',
      'Short Tricks for Error Spotting & Sentence Improvement'
    ],
    description: 'Designed specifically for Hindi-medium students to easily master General English for competitive exams in Rajasthan and Central recruitment boards.',
    tableOfContents: [
      'Chapter 1: Tenses & Sentence Structure',
      'Chapter 2: Active & Passive Voice',
      'Chapter 3: Direct & Indirect Speech',
      'Chapter 4: Articles, Prepositions & Conjunctions',
      'Chapter 5: Idioms, Phrases & One Word Substitutions',
      'Chapter 6: Model Practice Test Papers'
    ],
    sku: 'AP-ENG-001'
  },
  {
    id: 'science-brahmastra-cet',
    title: 'Science Brahmastra [CET / LDC Edition]',
    subtitle: 'NCERT & RBSE Based Complete General Science Theory + Objective Book',
    category: 'Science',
    examTarget: 'CET, LDC, Railway, SSC, Police Exams',
    price: 125,
    originalPrice: 130,
    discountPercentage: 4,
    rating: 4.95,
    reviewsCount: 680,
    author: 'Rohit Sir & Science Team',
    pages: 280,
    edition: '2026 Special Edition',
    inStock: true,
    coverImage: '/images/science tilt.png',
    samplePdfUrl: '/samples/science-brahmastra-sample.pdf',
    features: [
      'NCERT Class 6-10 Simplified Summary',
      '1500+ High Yield Multiple Choice Questions',
      'Diagrammatic Flowcharts for Quick Revision',
      'Clear Explanation of Daily Life Science Phenomena'
    ],
    description: 'The ultimate Science study guide trusted by over 50,000+ students across Rajasthan. Written in crystal clear, easy-to-understand Hindi with full illustrations.',
    tableOfContents: [
      'Physics: Light, Electricity, Motion, Work & Energy',
      'Chemistry: Metals, Non-Metals, Carbon Compounds, Chemical Reactions',
      'Biology: Cell Structure, Human Organ Systems, Genetics, Ecology'
    ],
    sku: 'AP-08-P-S'
  },
  {
    id: 'hindi-brahmastra-book',
    title: 'Hindi Brahmastra Book (Samanya Hindi)',
    subtitle: 'Complete Vyakaran, Shabd Gyaan & Technical Terms Master Book',
    category: 'Hindi',
    examTarget: 'Sub Inspector (SI), CET, LDC, Patwari, Reet',
    price: 180,
    originalPrice: 220,
    discountPercentage: 18,
    rating: 4.9,
    reviewsCount: 890,
    author: 'Apni Padhai Publication',
    pages: 410,
    edition: '2026 Edition',
    inStock: true,
    coverImage: '/images/Hindi Front 1_1.png',
    samplePdfUrl: '/samples/hindi-brahmastra-sample.pdf',
    features: [
      'Exhaustive Coverage of Hindi Grammar & Vyakaran',
      'Special Focus on Official Administrative Terms (Prashasnik Shabdavali)',
      '3000+ Practice MCQs with Answer Explanations',
      'Error-free Authentic Text Content'
    ],
    description: 'Essential reference book for Sub Inspector Paper 1 and all Rajasthan exams requiring mastery over Samanya Hindi grammar and administrative vocabulary.',
    tableOfContents: [
      'Chapter 1: Varna Vichar & Ucharan Sthan',
      'Chapter 2: Sandhi, Samas, Upsarg & Pratyaya',
      'Chapter 3: Tatbhav, Tatsam, Deshaj & Videshaj Shabd',
      'Chapter 4: Prashasnik Shabdavali (English to Hindi & Vice Versa)'
    ],
    sku: 'AP-HIN-002'
  },
  {
    id: 'ankganit-brahmastra',
    title: 'Ankganit Brahmastra (Mathematics)',
    subtitle: 'Quantitative Aptitude & Arithmetic Master Guide with Short Tricks',
    category: 'Mathematics',
    examTarget: 'SSC GD, CET, LDC, Railway, Police Exams',
    price: 100,
    originalPrice: 150,
    discountPercentage: 33,
    rating: 4.85,
    reviewsCount: 510,
    author: 'Apni Padhai Maths Panel',
    pages: 260,
    edition: '2026 Edition',
    inStock: true,
    coverImage: '/images/Math Front tilted without background.png',
    samplePdfUrl: '/samples/maths-brahmastra-sample.pdf',
    features: [
      'Concept + 5-Second Short Trick Method for Every Type',
      'Type-wise Classified Questions from Easy to Advanced',
      'Step-by-Step Hindi Explanations',
      'Formula Flashcards Included'
    ],
    description: 'Master mathematics without panic! Designed specifically for aspirants who find math difficult, providing intuitive visual methods and short tricks.',
    tableOfContents: [
      'Section A: Number System, HCF & LCM',
      'Section B: Percentage, Profit & Loss, Simple & Compound Interest',
      'Section C: Ratio, Partnership, Average, Mixture & Alligation',
      'Section D: Time & Work, Speed, Distance & Trains'
    ],
    sku: 'AP-007-P-S'
  },
  {
    id: 'rajasthan-art-culture-book',
    title: 'Rajasthan Art & Culture Brahmastra',
    subtitle: 'Visual Illustrated Guide to Rajasthan Folk Art, Architecture & Culture',
    category: 'Rajasthan GK',
    examTarget: 'RAS, SI, CET, Grade 1/2/3 Teacher, LDC',
    price: 160,
    originalPrice: 200,
    discountPercentage: 20,
    rating: 4.95,
    reviewsCount: 1120,
    author: 'Rohit Choudhary',
    pages: 350,
    edition: '2026 Edition',
    inStock: true,
    coverImage: '/images/ART FRONT.png',
    samplePdfUrl: '/samples/art-culture-sample.pdf',
    features: [
      'Full Color Maps & Fort Illustrations',
      'Mnemonics & Memory Tricks for Lok Devta & Festivals',
      'Latest Updated Data as per New Districts',
      'Previous 20 Years Solved Questions'
    ],
    description: 'The standard bestseller for Rajasthan Art & Culture. Recommended by previous year RAS rankers and top scoring SI toppers.',
    tableOfContents: [
      'Chapter 1: Major Forts, Palaces, Cenotaphs & Stepwells',
      'Chapter 2: Folk Deities, Saints & Religious Sects',
      'Chapter 3: Folk Dances, Drama, Music & Musical Instruments',
      'Chapter 4: Fairs, Festivals, Attire & Ornaments'
    ],
    sku: 'AP-ART-003'
  },
  {
    id: 'rajasthan-politics-book',
    title: 'Rajasthan Politics & Administration',
    subtitle: 'State Executive, Legislature, Judiciary & Commissions',
    category: 'Rajasthan GK',
    examTarget: 'RAS Pre/Mains, SI, CET, Executive Exams',
    price: 140,
    originalPrice: 180,
    discountPercentage: 22,
    rating: 4.88,
    reviewsCount: 390,
    author: 'Apni Padhai Polity Wing',
    pages: 290,
    edition: '2026 Edition',
    inStock: true,
    coverImage: '/images/Polity Front (780.500).png',
    samplePdfUrl: '/samples/polity-sample.pdf',
    features: [
      'Constitutional Provisions Relating to Rajasthan State',
      'Complete List & Tenure of Governors, CMs & Chief Secretaries',
      'Panchayati Raj & Urban Local Bodies Governance',
      'State Information, Election & Human Rights Commissions'
    ],
    description: 'Clear, tabular and analytical guide to Rajasthan state politics and administrative framework, updated with all current constitutional amendments.',
    tableOfContents: [
      'Part I: State Executive & Vidhan Sabha',
      'Part II: Rajasthan High Court & Subordinate Judiciary',
      'Part III: Constitutional & Statutory Commissions in Rajasthan'
    ],
    sku: 'AP-POL-004'
  },
  {
    id: 'rajasthan-history-heritage',
    title: 'Rajasthan History & Royal Heritage',
    subtitle: 'Ancient, Medieval & Modern History of Rajasthan',
    category: 'Rajasthan GK',
    examTarget: 'RAS, SI, CET, Teacher Exams',
    price: 165,
    originalPrice: 210,
    discountPercentage: 21,
    rating: 4.92,
    reviewsCount: 740,
    author: 'Rohit Sir',
    pages: 380,
    edition: '2026 Edition',
    inStock: true,
    coverImage: '/images/History Front (780_500).png',
    samplePdfUrl: '/samples/history-sample.pdf',
    features: [
      'Chronological Timeline of Mewar, Marwar, Amber & Rathore Rulers',
      'Detailed Account of Praja Mandal & Freedom Struggle',
      '7 Stages of Rajasthan Integration Explained',
      '2000+ Exam Point Bullet Points'
    ],
    description: 'Comprehensive historical account of Rajasthan from ancient archaeological sites (Kalibangan, Ahar) to modern political integration.',
    tableOfContents: [
      'Section 1: Ancient Civilizations of Rajasthan',
      'Section 2: Rajput Dynasties & Resistance Against Sultanate/Mughals',
      'Section 3: Freedom Movement, Peasant Agitations & Unification'
    ],
    sku: 'AP-HIS-005'
  },
  {
    id: 'rajasthan-4th-grade-model-papers',
    title: 'Rajasthan 4th Grade / Group D 11 Model Papers Set',
    subtitle: 'Exact Exam Pattern Based 11 Practice Sets with OMR Sheets',
    category: 'Model Papers',
    examTarget: 'Rajasthan Group D / 4th Grade Recruitment 2026',
    price: 110,
    originalPrice: 160,
    discountPercentage: 31,
    rating: 4.86,
    reviewsCount: 950,
    author: 'Apni Padhai Test Board',
    pages: 220,
    edition: '2026 New Pattern Edition',
    inStock: true,
    coverImage: '/images/4th Grade model paper 11.png',
    samplePdfUrl: '/samples/4th-grade-sample.pdf',
    features: [
      '11 Full Length Unsolved & Solved Model Test Papers',
      'Printed Practice OMR Sheets Included',
      'Detailed Step-by-Step Answer Explanations Key',
      'Time Management Strategy Guide'
    ],
    description: 'Designed as per the latest syllabus and marking scheme for Rajasthan 4th Grade examination. Essential for self-evaluation before the main exam.',
    tableOfContents: [
      'Model Paper 1 to 11 with Solution Key and Detailed Explanations'
    ],
    sku: 'AP-MP-011'
  }
];
