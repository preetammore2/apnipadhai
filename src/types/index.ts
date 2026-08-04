export interface Course {
  id: string;
  title: string;
  subtitle: string;
  category: 'rajasthan-gk' | 'ssc-gd' | 'cet' | 'ras' | 'si' | 'science' | 'maths' | 'ldc';
  targetExam: string;
  description: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  rating: number;
  reviewCount: number;
  enrolledStudents: number;
  durationMonths: number;
  totalLectures: number;
  totalTests: number;
  language: 'Bilingual' | 'Hindi' | 'English';
  level: 'Foundation' | 'Target' | 'Crash Course' | 'Test Series';
  instructor: {
    name: string;
    role: string;
    image: string;
    experience: string;
  };
  features: string[];
  curriculum: {
    title: string;
    lecturesCount: number;
    duration: string;
    topics: string[];
  }[];
  isBestseller?: boolean;
  isPopular?: boolean;
  image: string;
}

export interface Book {
  id: string;
  title: string;
  subtitle: string;
  category: 'General English' | 'Science' | 'Hindi' | 'Mathematics' | 'Rajasthan GK' | 'Model Papers' | 'Computer';
  examTarget: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  rating: number;
  reviewsCount: number;
  author: string;
  pages: number;
  edition: string;
  inStock: boolean;
  coverImage: string;
  samplePdfUrl: string;
  features: string[];
  description: string;
  tableOfContents: string[];
  sku: string;
}

export interface PYQ {
  id: string;
  title: string;
  examName: string;
  category: 'RAS' | 'Sub Inspector' | 'CET' | 'LDC' | 'SSC GD' | 'Rajasthan GK' | 'Teacher Exams';
  year: number;
  state: 'Rajasthan' | 'All India';
  questionsCount: number;
  pdfSize: string;
  downloadUrl: string;
  hasSolution: boolean;
  subject: string;
}

export interface Faculty {
  id: string;
  name: string;
  role: string;
  subject: string;
  experienceYears: number;
  studentsTaught: string;
  selectionsProduced: string;
  image: string;
  bio: string;
  achievements: string[];
  socialLinks: {
    youtube?: string;
    telegram?: string;
    instagram?: string;
  };
}

export interface Testimonial {
  id: string;
  name: string;
  exam: string;
  rank?: string;
  selectionYear: string;
  quote: string;
  rating: number;
  photo: string;
  city: string;
  isVideo?: boolean;
  videoUrl?: string;
}

export interface ResultRanker {
  id: string;
  name: string;
  exam: string;
  rank: string;
  rollNo: string;
  year: string;
  photo: string;
  district: string;
  testimonial: string;
}

export interface BlogArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'Exam News' | 'Study Tips' | 'Notifications' | 'Current Affairs';
  author: string;
  date: string;
  readTime: string;
  image: string;
}

export interface CareerOpening {
  id: string;
  title: string;
  department: string;
  type: 'Full-time' | 'Part-time' | 'Remote';
  location: string;
  experience: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
}
