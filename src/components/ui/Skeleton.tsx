const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg animate-pulse">
    <div className="flex items-center justify-between">
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
      </div>
      <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
    </div>
  </div>
);

const SkeletonChart = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg animate-pulse">
    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
  </div>
);

const SkeletonTable = ({ rows = 5 }: { rows?: number }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden animate-pulse">
    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
    </div>
    <div className="p-6 space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          </div>
          <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      ))}
    </div>
  </div>
);

const SkeletonDashboard = () => (
  <div className="space-y-6">
    {/* Header Skeleton */}
    <div className="h-32 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-2xl animate-pulse"></div>
    
    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>

    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SkeletonChart />
      <SkeletonChart />
    </div>
  </div>
);

export { SkeletonCard, SkeletonChart, SkeletonTable, SkeletonDashboard };
export default SkeletonDashboard;
