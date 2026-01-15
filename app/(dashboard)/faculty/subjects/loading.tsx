
export default function Loading() {
    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between animate-pulse">
                <div>
                    <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
                    <div className="h-4 w-64 bg-gray-200 dark:bg-gray-800 rounded"></div>
                </div>
                <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
            </header>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
                ))}
            </div>
        </div>
    );
}
