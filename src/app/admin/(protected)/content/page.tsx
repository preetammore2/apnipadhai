'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  XCircle,
} from 'lucide-react';
import LogoutButton from '@/app/admin/components/LogoutButton';
import ImageUploader from '@/app/admin/components/ImageUploader';

interface HeroValue {
  title: string;
  highlight: string;
  subtitle: string;
}

interface TestimonialValue {
  name: string;
  exam: string;
  city: string;
  quote: string;
  photo: string;
}

interface FaqValue {
  question: string;
  answer: string;
}

interface CourseValue {
  title: string;
  description: string;
  url: string;
  image?: string;
  tag?: string;
  tagline?: string;
  type?: string;
  features?: string[];
}

type SectionState =
  | { section: 'hero'; value: HeroValue }
  | { section: 'testimonials'; value: TestimonialValue[] }
  | { section: 'faqs'; value: FaqValue[] }
  | { section: 'courses'; value: CourseValue[] };

const EMPTY_HERO: HeroValue = { title: '', highlight: '', subtitle: '' };
const EMPTY_TESTIMONIAL: TestimonialValue = { name: '', exam: '', city: '', quote: '', photo: '' };
const EMPTY_FAQ: FaqValue = { question: '', answer: '' };
const EMPTY_COURSE: CourseValue = { title: '', description: '', url: '' };
type SectionKey = SectionState['section'];

const SECTION_META: { key: SectionKey; title: string; hint: string }[] = [
  { key: 'hero', title: 'Hero', hint: 'Homepage headline, highlighted phrase and subtitle.' },
  { key: 'testimonials', title: 'Testimonials', hint: 'Student success stories with name, exam, city and photo.' },
  { key: 'faqs', title: 'FAQs', hint: 'Question & answer pairs shown in the FAQ section.' },
  { key: 'courses', title: 'Courses', hint: 'Courses with title, description, enrollment link, image, tag, tagline, type and features.' },
];

export default function AdminContentPage() {
  const [sections, setSections] = useState<Partial<Record<SectionKey, SectionState>>>({});
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState<SectionKey | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [saveResult, setSaveResult] = useState<{ key: SectionKey; ok: boolean; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<SectionKey>('hero');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/content');
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to load content');
        setConfigured(false);
        return;
      }
      setConfigured(data.configured ?? true);
      const next: Partial<Record<SectionKey, SectionState>> = {};
      for (const meta of SECTION_META) {
        const entry = data.sections?.[meta.key];
        if (meta.key === 'hero') {
          next.hero = {
            section: 'hero',
            value: entry?.value ?? EMPTY_HERO,
          };
        } else {
          const items = entry?.value ?? [];
          next[meta.key] = {
            section: meta.key,
            value: items,
          } as SectionState;
        }
      }
      setSections(next);
    } catch {
      setError('Could not load site content');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function updateValue(nextValue: unknown) {
    setSections((prev) => ({
      ...prev,
      [activeTab]: { section: activeTab, value: nextValue },
    }));
    setSaveResult(null);
  }

  async function saveSection() {
    const state = sections[activeTab];
    if (!state) return;
    setSaving(activeTab);
    setSaveResult(null);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: activeTab, value: state.value }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setSaveResult({ key: activeTab, ok: false, message: data.message || 'Could not save' });
        return;
      }
      const entry = data.section;
      let value = entry?.value;
      if (activeTab === 'hero' && !value) value = EMPTY_HERO;
      if (value) updateValueFromServer(activeTab, value);
      setSaveResult({
        key: activeTab,
        ok: true,
        message: `Saved. The site will refresh within a minute.`,
      });
    } catch {
      setSaveResult({ key: activeTab, ok: false, message: 'Could not save content' });
    } finally {
      setSaving(null);
    }
  }

  function updateValueFromServer(key: SectionKey, value: unknown) {
    setSections((prev) => ({ ...prev, [key]: { section: key, value } as SectionState }));
  }

  async function syncFromWordPress() {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch('/api/admin/sync/wp-content', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setSyncResult({ ok: false, message: data.message || 'Could not sync from WordPress' });
        return;
      }
      const report = data.report ?? {};
      const parts = Object.entries(report).map(([section, info]) => {
        const r = info as { added?: number; skipped?: number };
        return `${section}: +${r.added ?? 0} added${(r.skipped ?? 0) > 0 ? `, ${r.skipped} skipped` : ''}`;
      });
      setSyncResult({
        ok: true,
        message: `Synced from WordPress. ${parts.join(' · ')}`,
      });
      await load();
    } catch {
      setSyncResult({ ok: false, message: 'Could not sync from WordPress' });
    } finally {
      setSyncing(false);
    }
  }

  const activeState = sections[activeTab];

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
                Site Content
              </h1>
              <p className="text-xs text-white/60 mt-1">
                Hero, testimonials, FAQs & courses
              </p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {!configured && !loading && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-6 text-sm text-amber-900">
            MongoDB is not configured yet. Set{' '}
            <code className="font-mono text-xs bg-amber-100 px-1.5 py-0.5 rounded">MONGODB_URI</code>{' '}
            on the server to edit content from here.
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="flex-1">
            <p className="text-sm text-slate-500">
              Changes are saved to MongoDB and the site reads them automatically.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={syncFromWordPress}
              disabled={syncing || loading}
              className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-600 hover:text-navy-900 rounded-xl transition-colors disabled:opacity-60 text-xs font-bold self-start"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing…' : 'Sync from WordPress'}
            </button>
            <button
              onClick={load}
              disabled={loading}
              className="p-2.5 border border-slate-200 bg-white text-slate-500 hover:text-navy-900 rounded-xl transition-colors disabled:opacity-60 self-start"
              aria-label="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {syncResult && (
          <p
            className={`text-sm font-semibold rounded-xl px-4 py-3 mb-4 ${
              syncResult.ok
                ? 'text-emerald-700 bg-emerald-50 border border-emerald-100'
                : 'text-red-600 bg-red-50 border border-red-100'
            }`}
          >
            {syncResult.message}
          </p>
        )}

        {error && (
          <p className="text-sm font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
            {error}
          </p>
        )}

        <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0">
          {SECTION_META.map((meta) => (
            <button
              key={meta.key}
              onClick={() => {
                setActiveTab(meta.key);
                setSaveResult(null);
              }}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition-colors ${
                activeTab === meta.key
                  ? 'bg-navy-900 text-white border-navy-900 shadow-md'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300'
              }`}
            >
              {meta.title}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <>
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-lg font-black font-heading text-navy-900">
                  {SECTION_META.find((m) => m.key === activeTab)?.title}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {SECTION_META.find((m) => m.key === activeTab)?.hint}
                </p>
              </div>

              {activeTab === 'hero' && (
                <HeroEditor
                  value={(activeState as { value: HeroValue } | undefined)?.value ?? EMPTY_HERO}
                  onChange={updateValue}
                />
              )}
              {activeTab === 'testimonials' && (
                <ListEditor<TestimonialValue>
                  items={(activeState as { value: TestimonialValue[] } | undefined)?.value ?? []}
                  emptyItem={EMPTY_TESTIMONIAL}
                  renderFields={(item, set) => (
                    <TestimonialFields item={item} onChange={set} />
                  )}
                  onChange={updateValue}
                />
              )}
              {activeTab === 'faqs' && (
                <ListEditor<FaqValue>
                  items={(activeState as { value: FaqValue[] } | undefined)?.value ?? []}
                  emptyItem={EMPTY_FAQ}
                  renderFields={(item, set) => (
                    <FaqFields item={item} onChange={set} />
                  )}
                  onChange={updateValue}
                />
              )}
              {activeTab === 'courses' && (
                <ListEditor<CourseValue>
                  items={(activeState as { value: CourseValue[] } | undefined)?.value ?? []}
                  emptyItem={EMPTY_COURSE}
                  renderFields={(item, set) => (
                    <CourseFields item={item} onChange={set} />
                  )}
                  onChange={updateValue}
                />
              )}

              {saveResult && saveResult.key === activeTab && (
                <div
                  className={`mt-5 flex items-start gap-2 text-xs font-semibold rounded-xl px-4 py-3 ${
                    saveResult.ok
                      ? 'bg-green-50 text-green-700 border border-green-100'
                      : 'bg-red-50 text-red-600 border border-red-100'
                  }`}
                >
                  {saveResult.ok ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{saveResult.message}</span>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={saveSection}
                  disabled={saving === activeTab}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 text-navy-950 text-xs font-black rounded-xl transition-colors"
                >
                  {saving === activeTab ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save {SECTION_META.find((m) => m.key === activeTab)?.title}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function HeroEditor({
  value,
  onChange,
}: {
  value: HeroValue;
  onChange: (next: HeroValue) => void;
}) {
  return (
    <div className="space-y-4">
      <Field label="Title" hint="The main headline. Highlight text below is auto-styled.">
        <input
          value={value.title}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
          placeholder="e.g. Learn with Expert Educators & Crack Your Dream Exam"
          className="input-field"
        />
      </Field>
      <Field label="Highlight" hint="A phrase inside the title shown in gold.">
        <input
          value={value.highlight}
          onChange={(e) => onChange({ ...value, highlight: e.target.value })}
          placeholder="e.g. Dream Exam"
          className="input-field"
        />
      </Field>
      <Field label="Subtitle">
        <textarea
          value={value.subtitle}
          onChange={(e) => onChange({ ...value, subtitle: e.target.value })}
          rows={3}
          placeholder="Supporting sentence under the headline"
          className="input-field resize-y"
        />
      </Field>
    </div>
  );
}

function TestimonialFields({
  item,
  onChange,
}: {
  item: TestimonialValue;
  onChange: (next: TestimonialValue) => void;
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <input
        value={item.name}
        onChange={(e) => onChange({ ...item, name: e.target.value })}
        placeholder="Student name"
        className="input-field"
      />
      <input
        value={item.exam}
        onChange={(e) => onChange({ ...item, exam: e.target.value })}
        placeholder="Exam / rank, e.g. RAS Mains 2024"
        className="input-field"
      />
      <input
        value={item.city}
        onChange={(e) => onChange({ ...item, city: e.target.value })}
        placeholder="City"
        className="input-field"
      />
      <div className="sm:col-span-2">
        <label className="block text-xs font-bold text-navy-900 mb-1.5">Photo</label>
        <ImageUploader
          value={item.photo}
          onChange={(photo) => onChange({ ...item, photo })}
          label="Upload student photo"
        />
      </div>
      <textarea
        value={item.quote}
        onChange={(e) => onChange({ ...item, quote: e.target.value })}
        rows={3}
        placeholder="What the student said…"
        className="input-field sm:col-span-2 resize-y"
      />
    </div>
  );
}

function FaqFields({
  item,
  onChange,
}: {
  item: FaqValue;
  onChange: (next: FaqValue) => void;
}) {
  return (
    <div className="space-y-3">
      <input
        value={item.question}
        onChange={(e) => onChange({ ...item, question: e.target.value })}
        placeholder="Question"
        className="input-field"
      />
      <textarea
        value={item.answer}
        onChange={(e) => onChange({ ...item, answer: e.target.value })}
        rows={3}
        placeholder="Answer"
        className="input-field resize-y"
      />
    </div>
  );
}

function CourseFields({
  item,
  onChange,
}: {
  item: CourseValue;
  onChange: (next: CourseValue) => void;
}) {
  return (
    <div className="space-y-3">
      <input
        value={item.title}
        onChange={(e) => onChange({ ...item, title: e.target.value })}
        placeholder="Course title"
        className="input-field"
      />
      <textarea
        value={item.description}
        onChange={(e) => onChange({ ...item, description: e.target.value })}
        rows={2}
        placeholder="Short description"
        className="input-field resize-y"
      />
      <input
        value={item.url}
        onChange={(e) => onChange({ ...item, url: e.target.value })}
        placeholder="Enrollment URL (https://…)"
        className="input-field"
      />
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          value={item.tag ?? ''}
          onChange={(e) => onChange({ ...item, tag: e.target.value })}
          placeholder="Tag (e.g. NEW BATCH)"
          className="input-field"
        />
        <input
          value={item.type ?? ''}
          onChange={(e) => onChange({ ...item, type: e.target.value })}
          placeholder="Type (e.g. Online Batch / Test Series)"
          className="input-field"
        />
      </div>
      <input
        value={item.tagline ?? ''}
        onChange={(e) => onChange({ ...item, tagline: e.target.value })}
        placeholder="Tagline (short highlight under the title)"
        className="input-field"
      />
      <input
        value={item.image ?? ''}
        onChange={(e) => onChange({ ...item, image: e.target.value })}
        placeholder="Image URL (https://…)"
        className="input-field"
      />
      <textarea
        value={(item.features ?? []).join('\n')}
        onChange={(e) =>
          onChange({
            ...item,
            features: e.target.value
              .split('\n')
              .map((f) => f.trim())
              .filter(Boolean),
          })
        }
        rows={2}
        placeholder="Features, one per line (e.g. Daily Practice Sets)"
        className="input-field resize-y"
      />
    </div>
  );
}

function ListEditor<T>({
  items,
  emptyItem,
  renderFields,
  onChange,
}: {
  items: T[];
  emptyItem: T;
  renderFields: (item: T, set: (next: T) => void) => React.ReactNode;
  onChange: (next: T[]) => void;
}) {
  const update = (index: number, next: T) => {
    const copy = [...items];
    copy[index] = next;
    onChange(copy);
  };
  return (
    <div className="space-y-4">
      {items.length === 0 && (
        <div className="border border-dashed border-slate-200 rounded-2xl py-8 text-center">
          <FileText className="w-6 h-6 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-400">Nothing added yet.</p>
        </div>
      )}
      {items.map((item, index) => (
        <div key={index} className="border border-slate-200 rounded-2xl p-4 relative">
          <button
            type="button"
            onClick={() => onChange(items.filter((_, i) => i !== index))}
            className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Remove item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="pr-8">{renderFields(item, (next) => update(index, next))}</div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, { ...emptyItem }])}
        className="inline-flex items-center gap-2 px-4 py-2.5 border border-dashed border-slate-300 text-slate-500 hover:text-navy-900 hover:border-navy-900 text-xs font-bold rounded-xl transition-colors"
      >
        <Plus className="w-4 h-4" /> Add item
      </button>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-navy-900 mb-1.5">
        {label}
        {hint && <span className="font-normal text-slate-400 ml-1.5">{hint}</span>}
      </label>
      {children}
    </div>
  );
}
