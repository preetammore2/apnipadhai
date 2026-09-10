'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ImageIcon, Loader2, Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { Book } from '@/types';
import LogoutButton from '@/app/admin/components/LogoutButton';
import BookFormModal from './BookFormModal';

type Role = 'admin' | 'moderator';

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [role, setRole] = useState<Role>('admin');
  const [roleLoaded, setRoleLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  useEffect(() => {
    let ignore = false;
    fetch('/api/admin/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { role?: string } | null) => {
        if (ignore) return;
        setRole(data?.role === 'moderator' ? 'moderator' : 'admin');
        setRoleLoaded(true);
      })
      .catch(() => {
        if (!ignore) {
          setRole('admin');
          setRoleLoaded(true);
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/books');
      if (!res.ok) throw new Error('Failed to load books');
      const data = (await res.json()) as Book[];
      setBooks(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load books');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(book: Book) {
    if (!window.confirm(`Delete "${book.title}"? This will remove it from the store.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/books/${book.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        window.alert(data.message || 'Could not delete book');
        return;
      }
      load();
    } catch {
      window.alert('Could not delete book');
    }
  }

  function openCreate() {
    setEditingBook(null);
    setFormOpen(true);
  }

  function openEdit(book: Book) {
    setEditingBook(book);
    setFormOpen(true);
  }

  const isModerator = role === 'moderator';

  const filtered = books.filter((b) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (b.title ?? '').toLowerCase().includes(q) ||
      (b.sku ?? '').toLowerCase().includes(q) ||
      (b.category ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <header className="bg-navy-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-black font-heading leading-none">
                Books Management
              </h1>
              <p className="text-xs text-white/60 mt-1">
                {isModerator && roleLoaded
                  ? 'Moderator — cover images only'
                  : 'Synced to WooCommerce store & MongoDB'}
              </p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {isModerator && roleLoaded && (
          <div className="flex items-start gap-3 bg-sky-50 border border-sky-200 rounded-2xl px-4 py-3 mb-6 text-sm text-sky-900">
            <ImageIcon className="w-5 h-5 shrink-0 mt-0.5" />
            <p>
              You are in <strong>moderator</strong> mode. You can only upload or change book cover
              images — creating and deleting books requires an admin account.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, SKU or category…"
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              disabled={loading}
              className="p-2.5 border border-slate-200 bg-white text-slate-500 hover:text-navy-900 rounded-xl transition-colors disabled:opacity-60"
              aria-label="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            {!isModerator && (
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-navy-950 text-sm font-black rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Book
              </button>
            )}
          </div>
        </div>

        {error && (
          <p className="text-sm font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
            {error}
          </p>
        )}

        {loading && books.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 text-center">
            <p className="text-sm font-bold text-navy-900">
              {search ? 'No books match your search.' : 'No books yet.'}
            </p>
            {!search && !isModerator && (
              <button
                onClick={openCreate}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-navy-900 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" /> Add your first book
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4"
              >
                {book.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-14 h-16 object-cover rounded-lg border border-slate-100 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-16 bg-slate-100 rounded-lg shrink-0 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-slate-300" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold font-heading text-navy-900 truncate">
                    {book.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {book.sku ? `SKU: ${book.sku} · ` : ''}
                    {book.category || 'Uncategorized'}
                  </p>
                  <p className="text-xs font-bold text-navy-900 mt-1">
                    ₹{book.price}
                    {book.originalPrice > book.price && (
                      <span className="text-slate-400 font-semibold line-through ml-1.5">
                        ₹{book.originalPrice}
                      </span>
                    )}
                    {!book.inStock && (
                      <span className="ml-2 text-red-500 font-bold">Out of stock</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEdit(book)}
                    className="p-2.5 text-slate-500 hover:text-navy-900 hover:bg-slate-100 rounded-xl transition-colors"
                    aria-label={`Edit ${book.title}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  {!isModerator && (
                    <button
                      onClick={() => handleDelete(book)}
                      className="p-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      aria-label={`Delete ${book.title}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BookFormModal
        open={formOpen}
        book={editingBook}
        onClose={() => setFormOpen(false)}
        onSaved={load}
        moderator={isModerator}
      />
    </main>
  );
}
