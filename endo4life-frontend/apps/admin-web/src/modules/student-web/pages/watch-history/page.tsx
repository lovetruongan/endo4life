import { useState } from 'react';
import { useAuthContext } from '@endo4life/feature-auth';
import { useWatchHistory } from '@endo4life/feature-resources';
import { UserResourceType } from '@endo4life/data-access';
import { useNavigate } from 'react-router-dom';
import { STUDENT_WEB_ROUTES } from '@endo4life/feature-config';
import moment from 'moment';

export function WatchHistoryPage() {
  const { userProfile } = useAuthContext();
  const userInfoId = userProfile?.id || '';
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'VIDEO' | 'IMAGE'>('VIDEO');
  const [page, setPage] = useState(0);

  const {
    data: resources,
    loading,
    error,
    pagination,
  } = useWatchHistory({
    userInfoId,
    type: activeTab === 'VIDEO' ? UserResourceType.Video : UserResourceType.Image,
    page,
    size: 12,
  });

  const handleTabChange = (tab: 'VIDEO' | 'IMAGE') => {
    setActiveTab(tab);
    setPage(0);
  };

  const handleResourceClick = (resourceId: string, type: string) => {
    const route =
      type === 'VIDEO'
        ? STUDENT_WEB_ROUTES.RESOURCE_VIDEO.replace(':id', resourceId)
        : STUDENT_WEB_ROUTES.RESOURCE_IMAGE.replace(':id', resourceId);
    navigate(route);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Watch History</h1>
        <p className="text-gray-600">View your recently watched content</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => handleTabChange('VIDEO')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'VIDEO'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Videos
        </button>
        <button
          onClick={() => handleTabChange('IMAGE')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'IMAGE'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Images
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 text-lg">Failed to load watch history</p>
            <p className="text-gray-600">Please try again later</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && resources.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center max-w-md px-4">
            <div className="mb-6">
              <svg
                className="mx-auto h-24 w-24 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No {activeTab === 'VIDEO' ? 'Videos' : 'Images'} Watched Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Start watching content to see your history here
            </p>
            <button
              onClick={() => navigate(STUDENT_WEB_ROUTES.RESOURCES)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Browse Resources
            </button>
          </div>
        </div>
      )}

      {/* Content Grid */}
      {!loading && !error && resources.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {resources.map((item) => (
              <div
                key={item.resource.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleResourceClick(item.resource.id, activeTab)}
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-gray-200 relative">
                  {item.resource.thumbnailUrl ? (
                    <img
                      src={item.resource.thumbnailUrl}
                      alt={item.resource.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <svg
                        className="h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        {activeTab === 'VIDEO' ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                          />
                        ) : (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        )}
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                    {item.resource.title || 'Untitled'}
                  </h3>
                  <p className="text-xs text-gray-600">
                    Watched {moment(item.createdAt).fromNow()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalCount > pagination.size && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-gray-600">
                Page {page + 1} of {Math.ceil(pagination.totalCount / pagination.size)}
              </span>
              <button
                onClick={() =>
                  setPage(
                    Math.min(
                      Math.ceil(pagination.totalCount / pagination.size) - 1,
                      page + 1
                    )
                  )
                }
                disabled={
                  page >= Math.ceil(pagination.totalCount / pagination.size) - 1
                }
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default WatchHistoryPage;
