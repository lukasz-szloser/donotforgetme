export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <main className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Hero Section */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-slate-100">
              Packing Helper
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400">
              Never forget what to pack again
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid gap-6 md:grid-cols-3 mt-12">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-lg font-semibold mb-2">Multi-level Lists</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Organize items in nested categories
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-lg font-semibold mb-2">Real-time Sync</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Collaborate with travel companions
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-lg font-semibold mb-2">Mobile First</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Perfect for packing on the go
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-12 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/login"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-lg text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 transition-colors"
              >
                Get Started
              </a>
              <a
                href="/about"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-lg text-slate-900 bg-white border-2 border-slate-300 hover:bg-slate-50 dark:text-slate-100 dark:bg-slate-800 dark:border-slate-600 dark:hover:bg-slate-700 transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Tech Stack Info */}
          <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-500">
              Built with Next.js 14, TypeScript, Tailwind CSS, and Supabase
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
