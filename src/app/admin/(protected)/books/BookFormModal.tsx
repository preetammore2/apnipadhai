'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Book } from '@/types';

interface BookFormModalProps {
  open: boolean;
  book: Book | null;
  onClose: () => void;
  onSaved: () => void;
}

interface FormState {
  title: string;
  subtitle: string;
  description: string;
  category: string;
  categories: string;
  regularPrice: string;
  salePrice: string;
  inStock: boolean;
  sku: string;
  coverImage: string;
  author: string;
  edition: string;
  pages: string;
  examTarget: string;
  samplePdfUrl: string;
  features: string;
  tableOfContents: string;
}

const EMPTY: FormState = {
  title: '',
  subtitle: '',
  description: '',
  category: '',
  categories: '',
  regularPrice: '',
  salePrice: '',
  inStock: true,
  sku: '',
  coverImage: '',
  author: '',
  edition: '',
  pages: '',
  examTarget: '',
  samplePdfUrl: '',
  features: '',
  tableOfContents: '',
};

function fromBook(book: Book): FormState {
  return {
    title: book.title ?? '',
    subtitle: book.subtitle ?? '',
    description: book.description ?? '',
    category: book.category ?? '',
    categories: (book.categories ?? []).join(', '),
    regularPrice: book.originalPrice ? String(book.originalPrice) : '',
    salePrice: book.price ? String(book.price) : '',
    inStock: book.inStock,
    sku: book.sku ?? '',
    coverImage: book.coverImage ?? '',
    author: book.author ?? '',
    edition: book.edition ?? '',
    pages: book.pages ? String(book.pages) : '',
    examTarget: book.examTarget ?? '',
    samplePdfUrl: book.samplePdfUrl ?? '',
    features: (book.features ?? []).join('\n'),
    tableOfContents: (book.tableOfContents ?? []).join('\n'),
  };
}

const inputClass =
  'w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500';
const labelClass = 'block text-xs font-bold text-slate-600 mb-1.5';

export default function BookFormModal({ open, book, onClose, onSaved }: BookFormModalProps) {
  const [form, setForm] = useState<FormState>(book ? fromBook(book) : EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const list = (s: string) =>
        s
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean);
      const payload = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        categories: form.categories
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        regularPrice: form.regularPrice === '' ? undefined : Number(form.regularPrice),
        salePrice: form.salePrice === '' ? undefined : Number(form.salePrice),
        inStock: form.inStock,
        sku: form.sku.trim(),
        coverImage: form.coverImage.trim(),
        author: form.author.trim(),
        edition: form.edition.trim(),
        pages: form.pages === '' ? undefined : Number(form.pages),
        examTarget: form.examTarget.trim(),
        samplePdfUrl: form.samplePdfUrl.trim(),
        features: list(form.features),
        tableOfContents: list(form.tableOfContents),
      };

      const url = book ? `/api/books/${book.id}` : '/api/books';
      const method = book ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Could not save book');
        return;
      }
      onSaved();
      onClose();
    } catch {
      setError('Could not save book. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={book ? `Edit: ${book.title}` : 'Add New Book'}
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>Title *</label>
            <input
              className={inputClass}
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Subtitle</label>
            <input
              className={inputClass}
              value={form.subtitle}
              onChange={(e) => update('subtitle', e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Category</label>
            <input
              className={inputClass}
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
              placeholder="e.g. Rajasthan GK"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>
              Categories (comma separated)
            </label>
            <input
              className={inputClass}
              value={form.categories}
              onChange={(e) => update('categories', e.target.value)}
              placeholder="e.g. Rajasthan GK, CET"
            />
          </div>
          <div>
            <label className={labelClass}>Regular Price (₹)</label>
            <input
              className={inputClass}
              type="number"
              min="0"
              step="0.01"
              value={form.regularPrice}
              onChange={(e) => update('regularPrice', e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Sale Price (₹)</label>
            <input
              className={inputClass}
              type="number"
              min="0"
              step="0.01"
              value={form.salePrice}
              onChange={(e) => update('salePrice', e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>SKU</label>
            <input
              className={inputClass}
              value={form.sku}
              onChange={(e) => update('sku', e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Pages</label>
            <input
              className={inputClass}
              type="number"
              min="0"
              value={form.pages}
              onChange={(e) => update('pages', e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Author</label>
            <input
              className={inputClass}
              value={form.author}
              onChange={(e) => update('author', e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Edition</label>
            <input
              className={inputClass}
              value={form.edition}
              onChange={(e) => update('edition', e.target.value)}
              placeholder="e.g. 2026"
            />
          </div>
          <div>
            <label className={labelClass}>Exam Target</label>
            <input
              className={inputClass}
              value={form.examTarget}
              onChange={(e) => update('examTarget', e.target.value)}
              placeholder="e.g. REET Level 1 & 2"
            />
          </div>
          <div>
            <label className={labelClass}>Cover Image URL</label>
            <input
              className={inputClass}
              value={form.coverImage}
              onChange={(e) => update('coverImage', e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div>
            <label className={labelClass}>Sample PDF URL</label>
            <input
              className={inputClass}
              value={form.samplePdfUrl}
              onChange={(e) => update('samplePdfUrl', e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Description</label>
            <textarea
              className={inputClass}
              rows={3}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Features (one per line)</label>
            <textarea
              className={inputClass}
              rows={4}
              value={form.features}
              onChange={(e) => update('features', e.target.value)}
              placeholder={'Complete study material\nSolved examples\nPrevious year questions'}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Table of Contents (one per line)</label>
            <textarea
              className={inputClass}
              rows={4}
              value={form.tableOfContents}
              onChange={(e) => update('tableOfContents', e.target.value)}
              placeholder={'Chapter 1\nChapter 2\nChapter 3'}
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              id="in-stock"
              type="checkbox"
              checked={form.inStock}
              onChange={(e) => update('inStock', e.target.checked)}
              className="w-4 h-4 accent-brand-500"
            />
            <label htmlFor="in-stock" className="text-sm font-bold text-slate-700">
              In Stock
            </label>
          </div>
        </div>

        {error && (
          <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !form.title.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-900 hover:bg-brand-600 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-60"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {book ? 'Save Changes' : 'Create Book'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
