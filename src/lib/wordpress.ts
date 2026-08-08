const WP_URL = process.env.WP_URL ?? 'https://apnipadhaipublication.com';
const WP_API = `${WP_URL}/wp-json/wp/v2`;

export interface WordPressPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  contentHtml: string;
  date: string;
  link: string;
  author: string;
  categories: string[];
  categoryNames: string[];
  imageUrl: string;
}

export interface WordPressCategory {
  id: number;
  name: string;
  slug: string;
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

interface RawPost {
  id: number;
  slug: string;
  link: string;
  date: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  categories: number[];
  author: number;
}

const rawParams = (perPage: number): string =>
  new URLSearchParams({
    per_page: String(perPage),
    _fields: ['id', 'slug', 'link', 'date', 'title', 'excerpt', 'content', 'categories', 'author'].join(','),
  }).toString();

export async function getCategories(): Promise<WordPressCategory[]> {
  try {
    const params = new URLSearchParams({
      per_page: '100',
      _fields: ['id', 'name', 'slug', 'count'].join(','),
    });
    const res = await fetch(`${WP_API}/categories?${params.toString()}`, {
      cache: 'force-cache',
    });
    if (!res.ok) return [];
    const raw = (await res.json()) as { id: number; name: string; slug: string; count: number }[];
    return raw
      .filter((c) => c.count > 0)
      .map((c) => ({ id: c.id, name: stripHtml(c.name), slug: c.slug }));
  } catch {
    return [];
  }
}

export async function getPosts(perPage = 50): Promise<WordPressPost[]> {
  const [postRes, categories] = await Promise.all([
    fetch(`${WP_API}/posts?${rawParams(perPage)}`, { cache: 'force-cache' }),
    getCategories(),
  ]);

  if (!postRes.ok) {
    throw new Error(`WordPress posts request failed (${postRes.status})`);
  }

  const posts = (await postRes.json()) as RawPost[];
  const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));
  const postsWithAuthor = await Promise.all(
    posts.map(async (post) => {
      let author = 'Apni Padhai';
      try {
        const userRes = await fetch(
          `${WP_API}/users/${post.author}?_fields=name`,
          { cache: 'force-cache' },
        );
        if (userRes.ok) {
          const user = (await userRes.json()) as { name: string };
          author = user.name;
        }
      } catch {
        // keep default author
      }
      return { post, author };
    }),
  );

  return postsWithAuthor.map(({ post, author }) => {
    const categoryNames = post.categories
      .map((id) => categoryNameById.get(id))
      .filter((name): name is string => Boolean(name));
    const contentHtml = post.content.rendered ?? '';
    return {
      id: post.id,
      slug: post.slug,
      link: post.link,
      date: post.date,
      title: stripHtml(post.title.rendered),
      excerpt: stripHtml(post.excerpt.rendered) || stripHtml(post.content.rendered).slice(0, 200),
      content: stripHtml(post.content.rendered),
      contentHtml,
      categories: post.categories.map((id) => String(id)),
      categoryNames: categoryNames.length > 0 ? categoryNames : ['Blog'],
      imageUrl: extractFirstImage(contentHtml),
      author,
    };
  });
}
