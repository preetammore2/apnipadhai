import { COLLECTIONS, getDb, toJsDate } from '@/lib/db';
import type { CollectionReference, DocumentData } from 'firebase-admin/firestore';

export type PostStatus = 'publish' | 'draft' | 'pending' | 'future' | 'private' | 'trash';

export const POST_STATUSES: PostStatus[] = ['publish', 'draft', 'pending', 'future', 'private'];

export interface PostDoc {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  contentHtml: string;
  status: PostStatus;
  categories: string[];
  imageUrl: string;
  author: string;
  date: string;
  modified: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoredPost extends PostDoc {
  id: string;
}

export interface PostInput {
  title: string;
  content: string;
  excerpt?: string;
  categories?: string[];
  status?: PostStatus;
  imageUrl?: string;
  author?: string;
}

function postsColl(): CollectionReference<DocumentData> {
  return getDb().collection(COLLECTIONS.updates);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '') || 'post';
}

async function uniqueSlug(base: string): Promise<string> {
  const slug = slugify(base);
  let candidate = slug;
  let suffix = 2;
  while (true) {
    const existing = await postsColl().where('slug', '==', candidate).limit(1).get();
    if (existing.empty) return candidate;
    candidate = `${slug}-${suffix}`;
    suffix += 1;
  }
}

function stripHtml(html: string | undefined): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractFirstImage(html: string | undefined): string {
  if (!html) return '';
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] ?? '';
}

/** Prepend an <img> when an image URL is supplied (reader falls back to the first content image). */
function embedImage(content: string, imageUrl?: string): string {
  const url = (imageUrl ?? '').trim();
  if (!url || !/^https?:\/\//i.test(url)) return content;
  return `<img src="${url.replace(/"/g, '&quot;')}" alt="" />\n${content}`;
}

function toStoredPost(id: string, data: DocumentData): StoredPost {
  const doc = data as PostDoc;
  return {
    ...doc,
    id,
    createdAt: toJsDate(doc.createdAt),
    updatedAt: toJsDate(doc.updatedAt),
  };
}

function sortByCreatedDesc(posts: StoredPost[]): StoredPost[] {
  return posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function listPosts(): Promise<StoredPost[]> {
  const snap = await postsColl().get();
  const posts = snap.docs
    .map((doc) => toStoredPost(doc.id, doc.data()))
    .filter((post) => post.status !== 'trash');
  return sortByCreatedDesc(posts);
}

export async function listPublishedPosts(): Promise<StoredPost[]> {
  const snap = await postsColl().get();
  const posts = snap.docs
    .map((doc) => toStoredPost(doc.id, doc.data()))
    .filter((post) => post.status === 'publish');
  return sortByCreatedDesc(posts);
}

export async function getPost(id: string): Promise<StoredPost | null> {
  const doc = await postsColl().doc(id).get();
  return doc.exists ? toStoredPost(doc.id, doc.data() as DocumentData) : null;
}

export async function getPostBySlug(slug: string): Promise<StoredPost | null> {
  const snap = await postsColl().where('slug', '==', slug).limit(1).get();
  const doc = snap.docs[0];
  return doc ? toStoredPost(doc.id, doc.data()) : null;
}

export async function createPost(input: PostInput): Promise<StoredPost> {
  const now = new Date();
  const title = input.title.trim().slice(0, 300);
  const categories = (input.categories ?? [])
    .map((c) => c.trim().slice(0, 60))
    .filter(Boolean)
    .slice(0, 3);
  const content = input.content ?? '';
  const slug = await uniqueSlug(title);
  const doc: PostDoc = {
    slug,
    title,
    excerpt: (input.excerpt ?? '').trim().slice(0, 2000),
    content,
    contentHtml: embedImage(content, input.imageUrl),
    status: input.status ?? 'draft',
    categories: categories.length > 0 ? categories : ['Blog'],
    imageUrl: (input.imageUrl ?? '').trim(),
    author: (input.author ?? '').trim() || 'Apni Padhai',
    date: now.toISOString(),
    modified: now.toISOString(),
    createdAt: now,
    updatedAt: now,
  };
  const ref = await postsColl().add(doc);
  return toStoredPost(ref.id, doc as unknown as DocumentData);
}

export async function updatePost(id: string, input: PostInput): Promise<StoredPost | null> {
  const existing = await getPost(id);
  if (!existing) return null;

  const title = input.title.trim().slice(0, 300);
  const categories = (input.categories ?? [])
    .map((c) => c.trim().slice(0, 60))
    .filter(Boolean)
    .slice(0, 3);
  const content = input.content ?? '';

  let slug = existing.slug;
  if (title && title !== existing.title) {
    const candidate = slugify(title);
    const clash = await postsColl().where('slug', '==', candidate).limit(1).get();
    if (clash.empty || clash.docs[0]?.id === id) {
      slug = candidate;
    } else {
      slug = await uniqueSlug(title);
    }
  }

  const now = new Date();
  const doc: PostDoc = {
    slug,
    title: title || existing.title,
    excerpt:
      input.excerpt !== undefined ? input.excerpt.trim().slice(0, 2000) : existing.excerpt,
    content,
    contentHtml: embedImage(content, input.imageUrl ?? existing.imageUrl),
    status: input.status ?? existing.status,
    categories: categories.length > 0 ? categories : existing.categories,
    imageUrl:
      input.imageUrl !== undefined ? (input.imageUrl ?? '').trim() : existing.imageUrl,
    author: existing.author,
    date: existing.date,
    modified: now.toISOString(),
    createdAt: existing.createdAt,
    updatedAt: now,
  };
  await postsColl().doc(id).set(doc);
  return toStoredPost(id, doc as unknown as DocumentData);
}

export async function setPostStatus(id: string, status: PostStatus): Promise<StoredPost | null> {
  const existing = await getPost(id);
  if (!existing) return null;
  return updatePost(id, { ...existing, status });
}

/** Soft-delete: move to trash (hidden from every list). */
export async function trashPost(id: string): Promise<StoredPost | null> {
  return setPostStatus(id, 'trash');
}

export async function listCategoryNames(): Promise<{ id: string; name: string; count: number }[]> {
  const posts = await listPosts();
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const category of post.categories) {
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }
  }
  return Array.from(counts, ([name, count]) => ({ id: name, name, count })).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

export function postExcerpt(post: StoredPost): string {
  return post.excerpt || stripHtml(post.contentHtml).slice(0, 200);
}

export function postImageUrl(post: StoredPost): string {
  return post.imageUrl || extractFirstImage(post.contentHtml);
}

export interface ImportedPostInput {
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  contentHtml?: string;
  imageUrl?: string;
  author?: string;
  date?: string;
  modified?: string;
  categories?: string[];
}

/** Import a post from WordPress, preserving its slug/date/html. Upserts by slug. */
export async function upsertImportedPost(input: ImportedPostInput): Promise<StoredPost> {
  const now = new Date();
  const categories = (input.categories ?? [])
    .map((c) => c.trim().slice(0, 60))
    .filter(Boolean)
    .slice(0, 3);
  const doc: PostDoc = {
    slug: input.slug || 'post',
    title: (input.title ?? '').trim().slice(0, 300) || 'Untitled',
    excerpt: (input.excerpt ?? '').trim().slice(0, 2000),
    content: input.content ?? '',
    contentHtml:
      (input.contentHtml ?? '').trim() || embedImage(input.content ?? '', input.imageUrl),
    status: 'publish',
    categories: categories.length > 0 ? categories : ['Blog'],
    imageUrl: (input.imageUrl ?? '').trim(),
    author: (input.author ?? '').trim() || 'Apni Padhai',
    date: input.date || now.toISOString(),
    modified: input.modified || now.toISOString(),
    createdAt: now,
    updatedAt: now,
  };
  const existing = await getPostBySlug(doc.slug);
  if (existing) {
    const updated: PostDoc = { ...doc, createdAt: existing.createdAt };
    await postsColl().doc(existing.id).set(updated as unknown as DocumentData);
    return toStoredPost(existing.id, updated as unknown as DocumentData);
  }
  const ref = await postsColl().add(doc as unknown as DocumentData);
  return toStoredPost(ref.id, doc as unknown as DocumentData);
}