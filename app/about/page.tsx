export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <header className="bg-white dark:bg-slate-800 shadow">
        <div className="container mx-auto px-4 py-4">
          <a href="/" className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Packing Helper
          </a>
        </div>
      </header>
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto space-y-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100">
            About Packing Helper
          </h1>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Packing Helper is a modern, collaborative packing list application designed to make
              travel preparation effortless. Whether you&apos;re planning a weekend getaway or a
              month-long adventure, our app helps you organize everything you need.
            </p>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-8 mb-4">
              Key Features
            </h2>
            <ul className="space-y-3 text-slate-600 dark:text-slate-400">
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>
                  <strong>Multi-level Lists:</strong> Organize items in nested categories for better
                  organization
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>
                  <strong>Real-time Collaboration:</strong> Share lists with travel companions and
                  see updates instantly
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>
                  <strong>Mobile-First Design:</strong> Perfect interface for packing on the go
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>
                  <strong>Secure Authentication:</strong> Your data is safe with Supabase
                  authentication
                </span>
              </li>
            </ul>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-8 mb-4">
              Technology Stack
            </h2>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400">
              <li>• Next.js 14 with App Router</li>
              <li>• TypeScript for type safety</li>
              <li>• Tailwind CSS for styling</li>
              <li>• Shadcn/UI for beautiful components</li>
              <li>• Supabase for backend and authentication</li>
            </ul>
            <div className="mt-8">
              <a
                href="/login"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
