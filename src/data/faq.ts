export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'Orders & Delivery' | 'Books' | 'Courses & Test Series' | 'Payments & Refunds' | 'Account & App';
}

export const FAQ_DATA: FaqItem[] = [
  {
    id: 'delivery-time',
    category: 'Orders & Delivery',
    question: 'What is the delivery time for physical books?',
    answer:
      'Orders are typically processed within 1-3 business days after confirmation. Physical products are then delivered within 5-10 days depending on your shipping destination. Digital products and PDFs are delivered instantly to the email address provided during checkout.',
  },
  {
    id: 'track-order',
    category: 'Orders & Delivery',
    question: 'How do I track my order?',
    answer:
      'You can track your order on the Track Your Order page using your order ID and the mobile number you entered at checkout. You will also receive a confirmation email with tracking information once your order has been shipped by our courier partner.',
  },
  {
    id: 'damaged-book',
    category: 'Orders & Delivery',
    question: 'What should I do if the book I received is incorrect or damaged?',
    answer:
      'We accept returns and replacements for broken or damaged products and for product mismatches within 7 days of delivery. Please email a photo of the damage or mismatch to support@apnipadhaipublication.com and our team will arrange a replacement or refund.',
  },
  {
    id: 'multiple-books',
    category: 'Orders & Delivery',
    question: 'Can I order multiple books in a single order?',
    answer:
      'Yes! You can add any number of books to your cart and place a single order.',
  },
  {
    id: 'book-editions',
    category: 'Books',
    question: 'Are your books updated with the latest exam pattern?',
    answer:
      'Yes. Every Brahmastra edition is reviewed and revised by Rohit Sir and our senior faculty to match the latest official syllabus and exam pattern, including PYQs and answer keys.',
  },
  {
    id: 'sample-pdf',
    category: 'Books',
    question: 'Can I see a sample of a book before buying?',
    answer:
      'Absolutely. Every book page has a "Preview Sample PDF" option so you can read the table of contents and sample chapters before placing your order.',
  },
  {
    id: 'courses-access',
    category: 'Courses & Test Series',
    question: 'How long do I get access to an online course?',
    answer:
      'All online batches include 12 months of access with live interactive classes, recorded lectures, PDF notes, topic-wise PYQs, and the full test series for the batch duration.',
  },
  {
    id: 'doubt-support',
    category: 'Courses & Test Series',
    question: 'How can I get my doubts cleared?',
    answer:
      'Every batch includes live doubt sessions with faculty. You can also reach the helpline at +91 7568716768 or request a free callback from the navbar, and our counselors will connect with you.',
  },
  {
    id: 'payment-methods',
    category: 'Payments & Refunds',
    question: 'Which payment methods are accepted?',
    answer:
      'We accept all UPI apps (PhonePe, GPay, Paytm), debit and credit cards, and net banking through the PhonePe payment gateway. All payments are 100% secure.',
  },
  {
    id: 'refund-policy',
    category: 'Payments & Refunds',
    question: 'What is your refund and return policy?',
    answer:
      'Returns and refunds are accepted for broken/damaged products or product mismatches within 7 days of delivery. Approved refunds are credited back to your original payment method within 5-7 business days. Order cancellation is valid only until the product is dispatched.',
  },
  {
    id: 'app-download',
    category: 'Account & App',
    question: 'How do I download the Apni Padhai app?',
    answer:
      'The Apni Padhai app is available on the Google Play Store. Search for "Apni Padhai" and install it to access courses, PYQs, test series, and daily exam updates on your phone.',
  },
  {
    id: 'contact-support',
    category: 'Account & App',
    question: 'How can I contact the Apni Padhai support team?',
    answer:
      'You can call or WhatsApp us at +91 7568716768, email support@apnipadhaipublication.com, or use the Contact page form. Our team is available to help you with orders, courses, and any other queries.',
  },
];

export const FAQ_CATEGORIES = ['Orders & Delivery', 'Books', 'Courses & Test Series', 'Payments & Refunds', 'Account & App'] as const;
