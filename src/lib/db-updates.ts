import { ObjectId } from 'mongodb';
import { COLLECTIONS, getDb } from '@/lib/db';

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

type PostWithId = PostDoc & { _id: ObjectId };

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '') || 'post';
}

async function uniqueSlug(coll: { findOne: (filter: Record<string, unknown>) => Promise<PostDoc | null> }, base: string): Promise<string> {
  const slug = slugify(base);
  let candidate = slug;
  let suffix = 2;
  while (await coll.findOne({ slug: candidate })) {
    candidate = `${slug}-${suffix}`;
    suffix += 1;
  }
  return candidate;
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

function toStoredPost(doc: PostWithId): StoredPost {
  const { _id, ...rest } = doc;
  return { ...rest, id: _id.toString() };
}

const LIST_FILTER: Record<string, unknown> = { status: { $ne: 'trash' } };

export async function listPosts(): Promise<StoredPost[]> {
  const db = await getDb();
  const docs = await db
    .collection<PostDoc>(COLLECTIONS.updates)
    .find(LIST_FILTER)
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map((doc) => toStoredPost(doc as PostWithId));
}

export async function listPublishedPosts(): Promise<StoredPost[]> {
  const db = await getDb();
  const docs = await db
    .collection<PostDoc>(COLLECTIONS.updates)
    .find({ status: 'publish' })
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map((doc) => toStoredPost(doc as PostWithId));
}

export async function getPost(id: string): Promise<StoredPost | null> {
  const db = await getDb();
  const doc = await db.collection<PostDoc>(COLLECTIONS.updates).findOne({
    _id: new ObjectId(id),
  });
  return doc ? toStoredPost(doc as PostWithId) : null;
}

export async function getPostBySlug(slug: string): Promise<StoredPost | null> {
  const db = await getDb();
  const doc = await db.collection<PostDoc>(COLLECTIONS.updates).findOne({ slug });
  return doc ? toStoredPost(doc as PostWithId) : null;
}

export async function createPost(input: PostInput): Promise<StoredPost> {
  const db = await getDb();
  const coll = db.collection<PostDoc>(COLLECTIONS.updates);
  const now = new Date();
  const title = input.title.trim().slice(0, 300);
  const categories = (input.categories ?? [])
    .map((c) => c.trim().slice(0, 60))
    .filter(Boolean)
    .slice(0, 3);
  const content = input.content ?? '';
  const slug = await uniqueSlug(coll, title);
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
  const result = await coll.insertOne(doc);
  return toStoredPost({ ...doc, _id: result.insertedId });
}

export async function updatePost(id: string, input: PostInput): Promise<StoredPost | null> {
  const db = await getDb();
  const coll = db.collection<PostDoc>(COLLECTIONS.updates);
  const _id = new ObjectId(id);
  const existing = await coll.findOne({ _id });
  if (!existing) return null;

  const title = input.title.trim().slice(0, 300);
  const categories = (input.categories ?? [])
    .map((c) => c.trim().slice(0, 60))
    .filter(Boolean)
    .slice(0, 3);
  const content = input.content ?? '';

  let slug = existing.slug;
  if (title && title !== existing.title) {
    slug = await uniqueSlug(coll, title);
  }

  const now = new Date();
  const doc: PostDoc = {
    ...existing,
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
    modified: now.toISOString(),
    updatedAt: now,
  };
  await coll.updateOne({ _id }, { $set: doc });
  return toStoredPost({ ...doc, _id });
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
  const db = await getDb();
  const coll = db.collection<PostDoc>(COLLECTIONS.updates);
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
  const existing = await coll.findOne({ slug: doc.slug });
  if (existing) {
    await coll.updateOne({ _id: existing._id }, { $set: { ...doc, _id: existing._id } });
    return toStoredPost({ ...doc, _id: existing._id });
  }
  const result = await coll.insertOne(doc);
  return toStoredPost({ ...doc, _id: result.insertedId });
}
