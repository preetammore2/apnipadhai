'use client';

import { useRef, useState } from 'react';
import { Link2, Loader2, Upload, X } from 'lucide-react';

interface ImageUploaderProps {
  value: string;
  onChange: (next: string) => void;
  label?: string;
}

/** Downscale + compress an image client-side so it fits in Firebase as a data URL. */
function fileToResizedDataUrl(file: File, maxWidth = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > 10 * 1024 * 1024) {
      reject(new Error('Image is too large (max 10MB)'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not read image'));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas not supported'));
          return;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/** Upload (stores as a data URL) or paste an image link — for admin image fields. */
export default function ImageUploader({ value, onChange, label }: ImageUploaderProps) {
  const [mode, setMode] = useState<'upload' | 'link'>(
    value.startsWith('data:') ? 'upload' : 'link',
  );
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function onFileSelected(file: File | null) {
    if (!file) return;
    setBusy(true);
    fileToResizedDataUrl(file)
      .then(onChange)
      .catch((err: Error) => window.alert(err.message))
      .finally(() => setBusy(false));
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
            mode === 'upload'
              ? 'bg-navy-900 text-white border-navy-900'
              : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300'
          }`}
        >
          <Upload className="w-3 h-3" /> Upload
        </button>
        <button
          type="button"
          onClick={() => setMode('link')}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
            mode === 'link'
              ? 'bg-navy-900 text-white border-navy-900'
              : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300'
          }`}
        >
          <Link2 className="w-3 h-3" /> Use link
        </button>
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              if (inputRef.current) inputRef.current.value = '';
            }}
            className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-red-600 border border-red-100 hover:bg-red-50 transition-colors"
          >
            <X className="w-3 h-3" /> Remove
          </button>
        )}
      </div>

      {mode === 'upload' ? (
        <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl px-3 py-4 cursor-pointer hover:border-brand-400 hover:bg-brand-50/40 transition-colors text-center">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => onFileSelected(e.target.files?.[0] ?? null)}
          />
          {busy ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
              <span className="text-xs font-semibold text-slate-500">Compressing…</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-navy-900">
                {label ?? 'Click to upload image'}
              </span>
              <span className="text-[11px] text-slate-400">
                JPEG/PNG, max 10MB — auto-resized
              </span>
            </>
          )}
        </label>
      ) : (
        <input
          value={value.startsWith('data:') ? '' : value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://…"
          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
        />
      )}

      {value && (
        <div className="mt-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview"
            className="w-16 h-16 object-cover rounded-xl border border-slate-200"
          />
        </div>
      )}
    </div>
  );
}
