'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarDays,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  WifiOff,
} from 'lucide-react';
import LogoutButton from '@/app/admin/components/LogoutButton';
import ImageUploader from '@/app/admin/components/ImageUploader';

interface AdminPost {
  id: string;
  title: string;
  excerpt: string;
  contentRaw: string;
  status: string;
  date: string;
  categoryNames: string[];
  categories: string[];
  imageUrl: string;
}

interface Category {
  id: string;
  name: string;
  count: number;
}

interface PostDraft {
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  categories: string[];
  status: string;
}

const EMPTY_DRAFT: PostDraft = {
  title: '',
  excerpt: '',
  content: '',
  imageUrl: '',
  categories: [],
  status: 'draft',
};

const STATUS_LABELS: Record<string, string> = {
  publish: 'Published',
  draft: 'Draft',
  pending: 'Pending Review',
  future: 'Scheduled',
  private: 'Private',
};

function stripLeadingImage(content: string): { content: string; imageUrl: string } {
  const match = content.match(
    /^\s*(?:<p[^>]*>\s*)?<img[^>]+src=["']([^"']+)["'][^>]*>\s*(?:<\/p>)?\s*/i,
  );
  if (!match) return { content, imageUrl: '' };
  return { content: content.replace(match[0], '').trim(), imageUrl: match[1] ?? '' };
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function AdminUpdatesPage() {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<PostDraft>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const [savingStatusId, setSavingStatusId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/updates');
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to load posts');
        setConfigured(false);
        return;
      }
      setPosts(data.posts ?? []);
      setConfigured(data.configured ?? true);
      if (Array.isArray(data.categories)) setCategories(data.categories);
    } catch {
      setError('Could not load posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setModalOpen(true);
  }

  function openEdit(post: AdminPost) {
    setEditingId(post.id);
    const { content, imageUrl } = stripLeadingImage(post.contentRaw);
    setDraft({
      title: post.title,
      excerpt: post.excerpt,
      content,
      imageUrl,
      categories: post.categories ?? [],
      status: post.status,
    });
    setModalOpen(true);
  }

  async function save() {
    if (!draft.title.trim()) {
      window.alert('Title is required');
      return;
    }
    setSaving(true);
    try {
      const url = editingId ? `/api/admin/updates/${editingId}` : '/api/admin/updates';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        window.alert(data.message || 'Could not save post');
        return;
      }
      setModalOpen(false);
      load();
    } catch {
      window.alert('Could not save post');
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(post: AdminPost) {
    const next = post.status === 'publish' ? 'draft' : 'publish';
    setSavingStatusId(post.id);
    try {
      const res = await fetch(`/api/admin/updates/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        window.alert(data.message || 'Could not change status');
        return;
      }
      load();
    } catch {
      window.alert('Could not change status');
    } finally {
      setSavingStatusId(null);
    }
  }

  async function trash(post: AdminPost) {
    if (!window.confirm(`Move "${post.title}" to trash?`)) return;
    try {
      const res = await fetch(`/api/admin/updates/${post.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        window.alert(data.message || 'Could not trash post');
        return;
      }
      load();
    } catch {
      window.alert('Could not trash post');
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter((post) => {
      if (statusFilter !== 'all' && post.status !== statusFilter) return false;
      if (!q) return true;
      return (
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.categoryNames.join(' ').toLowerCase().includes(q)
      );
    });
  }, [posts, search, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: posts.length };
    for (const post of posts) counts[post.status] = (counts[post.status] ?? 0) + 1;
    return counts;
  }, [posts]);

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
                Updates & Blog
              </h1>
              <p className="text-xs text-white/60 mt-1">Managed in Firebase</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {!configured && !loading && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-6 text-sm text-amber-900">
            Firebase is not configured yet. Set{' '}
            <code className="font-mono text-xs bg-amber-100 px-1.5 py-0.5 rounded">
              FIREBASE_SERVICE_ACCOUNT
            </code>{' '}
            on the server to manage posts from here.
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, excerpt or category…"
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
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-navy-950 text-sm font-black rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" /> New Post
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0">
          {['all', 'publish', 'draft', 'pending', 'future'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                statusFilter === status
                  ? 'bg-navy-900 text-white border-navy-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300'
              }`}
            >
              {STATUS_LABELS[status] ?? status}
              <span className="ml-1.5 text-[10px] font-black opacity-70">
                {statusCounts[status] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {error && (
          <p className="text-sm font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
            {error}
          </p>
        )}

        {loading && posts.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 text-center">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
              {search || statusFilter !== 'all' ? (
                <WifiOff className="w-5 h-5" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
            </div>
            <p className="text-sm font-bold text-navy-900">
              {search || statusFilter !== 'all'
                ? 'No posts match your filters.'
                : 'No blog posts yet.'}
            </p>
            {!search && statusFilter === 'all' && (
              <button
                onClick={openCreate}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-navy-900 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" /> Write your first post
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4"
              >
                {post.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.imageUrl}
                    alt=""
                    className="w-20 h-14 object-cover rounded-lg border border-slate-100 shrink-0"
                  />
                ) : (
                  <div className="w-20 h-14 bg-slate-100 rounded-lg shrink-0 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-slate-300" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold font-heading text-navy-900 truncate">
                      {post.title}
                    </h3>
                    <span
                      className={`text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full ${
                        post.status === 'publish'
                          ? 'bg-green-100 text-green-700'
                          : post.status === 'draft'
                            ? 'bg-slate-100 text-slate-500'
                            : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {STATUS_LABELS[post.status] ?? post.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {post.excerpt || 'No excerpt'}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" /> {formatDate(post.date)}
                    </span>
                    {post.categoryNames.length > 0 && (
                      <span className="truncate">
                        {post.categoryNames.slice(0, 3).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => toggleStatus(post)}
                    disabled={savingStatusId === post.id}
                    title={post.status === 'publish' ? 'Unpublish' : 'Publish'}
                    className="p-2.5 text-slate-500 enabled:hover:text-green-600 enabled:hover:bg-green-50 rounded-xl transition-colors disabled:opacity-60"
                  >
                    {savingStatusId === post.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : post.status === 'publish' ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => openEdit(post)}
                    className="p-2.5 text-slate-500 hover:text-navy-900 hover:bg-slate-100 rounded-xl transition-colors"
                    aria-label={`Edit ${post.title}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => trash(post)}
                    className="p-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    aria-label={`Trash ${post.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl my-8">
            <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-black font-heading text-navy-900">
                {editingId ? 'Edit Post' : 'New Post'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-navy-900 text-xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="px-6 sm:px-8 py-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1.5">
                  Title *
                </label>
                <input
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="Post title"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1.5">
                    Status
                  </label>
                  <select
                    value={draft.status}
                    onChange={(e) => setDraft({ ...draft, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="publish">Published</option>
                    <option value="pending">Pending Review</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1.5">
                    Featured image
                  </label>
                  <ImageUploader
                    value={draft.imageUrl}
                    onChange={(imageUrl) => setDraft({ ...draft, imageUrl })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1.5">
                  Categories
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.length === 0 && (
                    <p className="text-xs text-slate-400">
                      No categories found.
                    </p>
                  )}
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          categories: draft.categories.includes(category.id)
                            ? draft.categories.filter((id) => id !== category.id)
                            : [...draft.categories, category.id],
                        })
                      }
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                        draft.categories.includes(category.id)
                          ? 'bg-navy-900 text-white border-navy-900'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1.5">
                  Excerpt
                </label>
                <textarea
                  value={draft.excerpt}
                  onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })}
                  rows={2}
                  placeholder="Short summary shown on the Updates page"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1.5">
                  Content *
                </label>
                <textarea
                  value={draft.content}
                  onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                  rows={12}
                  placeholder="Write your article… (HTML supported)"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 resize-y"
                />
              </div>
            </div>

            <div className="px-6 sm:px-8 py-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 text-navy-950 text-xs font-black rounded-xl transition-colors"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? 'Save Changes' : 'Create Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
