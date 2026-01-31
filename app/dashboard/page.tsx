export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Packing Helper</h1>
          <button className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors">
            Sign Out
          </button>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              My Packing Lists
            </h2>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium">
              + New List
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Sample packing list cards */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Summer Vacation 2024
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Beach trip essentials
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-500">12 items • 8 checked</span>
                <span className="text-blue-600 font-medium">67% complete</span>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Business Trip
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Conference in NYC</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-500">8 items • 2 checked</span>
                <span className="text-blue-600 font-medium">25% complete</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
