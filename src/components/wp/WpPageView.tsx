/**
 * Renders a managed WordPress page (title + HTML) with a consistent layout.
 * Used by the info pages (policies, careers, about, download-app) whenever an
 * `ap-*` page exists on WordPress.
 */

export function WpPageView({ title, html }: { title: string; html: string }) {
  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h1 className="text-3xl sm:text-4xl font-black font-heading text-navy-900">{title}</h1>
        </div>
        <div
          className="bg-white rounded-3xl border border-slate-200 shadow-card p-8 sm:p-12 blog-prose"
          // WP page content is authored by the site admin.
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
