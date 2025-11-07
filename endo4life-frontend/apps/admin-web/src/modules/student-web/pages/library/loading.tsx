export default function LibraryPageLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="px-4 sm:px-10 py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-lg animate-pulse" />
            <div className="flex-1">
              <div className="h-10 w-64 bg-white bg-opacity-20 rounded mb-2 animate-pulse" />
              <div className="h-6 w-96 bg-white bg-opacity-20 rounded animate-pulse" />
            </div>
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4">
                <div className="h-8 w-16 bg-white bg-opacity-20 rounded mb-2 animate-pulse" />
                <div className="h-4 w-24 bg-white bg-opacity-20 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="px-4 sm:px-10 py-8">
        {/* Search Bar Skeleton */}
        <div className="flex gap-4 items-center mb-8">
          <div className="flex-1 h-12 bg-white rounded-lg animate-pulse" />
          <div className="w-32 h-12 bg-white rounded-lg animate-pulse" />
        </div>

        {/* Books Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              {/* Cover Skeleton */}
              <div className="aspect-[3/4] bg-gray-200" />
              
              {/* Content Skeleton */}
              <div className="p-4">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                <div className="h-3 bg-gray-200 rounded w-5/6 mb-4" />
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
