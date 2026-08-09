import Image from 'next/image';
import Link from 'next/link';
import { Download, ExternalLink, FileText } from 'lucide-react';
import { getBooks } from '@/lib/woocommerce';
import { enrichBooksWithSamples, getBookSamples } from '@/lib/wordpress';
import { Book } from '@/types';

export const revalidate = 60;

export const metadata = {
  title: 'Book Sample PDFs - Apni Padhai Publication',
  description:
    'Preview and download free sample PDFs of all Apni Padhai Brahmastra books, fetched from our official resources.',
};

export default async function BookSamplePdfPage() {
  let books: Book[] = [];
  try {
    const [fetchedBooks, samples] = await Promise.all([getBooks(), getBookSamples()]);
    books = enrichBooksWithSamples(fetchedBooks, samples);
  } catch {
    // empty state shown below
  }

  const withSamples = books.filter((book) => book.samplePdfUrl);

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-100/80 px-3.5 py-1.5 rounded-full">
            100% FREE BOOK PREVIEWS
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-heading text-navy-900 mt-3">
            Book Sample PDFs
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Preview a free sample chapter of every Brahmastra book before you buy. Click{' '}
            <strong>Preview</strong> to read it in your browser or <strong>Download</strong> to save
            it.
          </p>
        </div>

        {withSamples.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <FileText className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-semibold">
              Sample PDFs are not available right now. Please check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {withSamples.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-card hover:shadow-card-hover transition-all flex flex-col group"
              >
                <Link
                  href={`/books/${book.id}`}
                  className="relative w-full aspect-[3/4] bg-slate-100 overflow-hidden block"
                >
                  {book.coverImage ? (
                    <Image
                      src={book.coverImage}
                      alt={book.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-contain p-2 transform group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center p-4 text-center text-2xl font-black font-heading text-slate-300">
                      {book.title}
                    </span>
                  )}
                  <span className="absolute top-2 right-2 px-2 py-0.5 bg-yellow-400 text-navy-950 text-[10px] font-black rounded-full uppercase shadow-sm">
                    Sample
                  </span>
                </Link>

                <div className="p-4 flex flex-col flex-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {book.category}
                  </span>
                  <Link href={`/books/${book.id}`}>
                    <h3 className="mt-1 text-sm sm:text-base font-bold font-heading text-navy-900 line-clamp-2 group-hover:text-brand-600 transition-colors">
                      {book.title}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-base font-black font-heading text-navy-900">
                      ₹{book.price}
                    </span>
                    {book.originalPrice > book.price && (
                      <span className="text-xs text-slate-400 line-through">₹{book.originalPrice}</span>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <a
                      href={book.samplePdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 bg-navy-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-yellow-400" />
                      Preview
                    </a>
                    <a
                      href={book.samplePdfUrl}
                      download
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
