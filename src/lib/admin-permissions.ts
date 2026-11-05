/**
 * Back-office permissions — one per admin section. Roles created by the owner
 * in /admin/staff are a name plus a list of these. Shared by the server
 * (access checks) and the admin UI (dashboard tiles, role editor).
 */
export const ADMIN_PERMISSIONS = [
  { key: 'books', label: 'Books', description: 'Add, edit and delete books, prices and covers', path: '/admin/books' },
  { key: 'book-covers', label: 'Book covers only', description: 'Change book cover images, nothing else', path: '/admin/books' },
  { key: 'sample-pdfs', label: 'Sample PDFs', description: 'Attach or remove free sample PDFs', path: '/admin/sample-pdfs' },
  { key: 'coupons', label: 'Coupons', description: 'Create, edit and delete discount codes', path: '/admin/coupons' },
  { key: 'book-discount', label: 'Book Discount', description: 'Set the store-wide discount on all books (on the Books page)', path: '/admin/books' },
  { key: 'delivery', label: 'Delivery Charges', description: 'Set delivery charges', path: '/admin/delivery' },
  { key: 'content', label: 'Site Content', description: 'Edit the hero text and FAQs, sync from WordPress', path: '/admin/content' },
  { key: 'popup', label: 'Popup', description: 'Photo that pops up when visitors open the website', path: '/admin/popup' },
  { key: 'hero-slider', label: 'Hero Slider', description: 'Manage homepage banner slides', path: '/admin/hero-slider' },
  { key: 'courses', label: 'Courses', description: 'Manage course cards on the homepage', path: '/admin/courses' },
  { key: 'testimonials', label: 'Testimonials', description: 'Manage student success stories', path: '/admin/testimonials' },
  { key: 'updates', label: 'Updates & Blog', description: 'Write and manage blog updates', path: '/admin/updates' },
  { key: 'feedback', label: 'Feedback', description: 'Manage student feedback and reviews', path: '/admin/feedback' },
  { key: 'results', label: 'Results & Selections', description: 'Manage rankers and selections', path: '/admin/results' },
  { key: 'pyqs', label: 'Previous Year Papers', description: 'Add, edit or delete PYQ PDFs', path: '/admin/pyqs' },
  { key: 'pages', label: 'Pages', description: 'Edit policies, careers, about and other pages', path: '/admin/pages' },
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number]['key'];

export const ALL_PERMISSIONS: AdminPermission[] = ADMIN_PERMISSIONS.map((p) => p.key);

export function isAdminPermission(value: unknown): value is AdminPermission {
  return typeof value === 'string' && (ALL_PERMISSIONS as string[]).includes(value);
}

export function permissionLabel(key: AdminPermission): string {
  return ADMIN_PERMISSIONS.find((p) => p.key === key)?.label ?? key;
}

/** Admin paths a person may open. /admin (dashboard) is always allowed. */
export function allowedAdminPaths(permissions: AdminPermission[], isOwner: boolean): string[] {
  const paths = new Set<string>(['/admin']);
  for (const p of ADMIN_PERMISSIONS) {
    if (permissions.includes(p.key)) paths.add(p.path);
  }
  if (isOwner) paths.add('/admin/staff');
  return [...paths];
}

/** What the signed-in person is, as returned by /api/admin/me. */
export interface AdminMe {
  authed: boolean;
  name: string;
  isOwner: boolean;
  permissions: AdminPermission[];
}
