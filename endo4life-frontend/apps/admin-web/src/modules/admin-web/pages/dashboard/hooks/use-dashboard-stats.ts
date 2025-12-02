import { useUsers } from '@endo4life/feature-user';
import { useImages } from '@endo4life/feature-image';
import { useVideos } from '@endo4life/feature-videos';
import { useCourses } from '@endo4life/feature-course';
import { useBooks } from '../../documents/hooks';

const STATS_FILTER = { page: 0, size: 1 };

export interface DashboardStats {
  users: number;
  images: number;
  videos: number;
  courses: number;
  documents: number;
  loading: boolean;
}

export function useDashboardStats(): DashboardStats {
  const { pagination: usersPagination, loading: usersLoading } = useUsers(STATS_FILTER);
  const { pagination: imagesPagination, loading: imagesLoading } = useImages(STATS_FILTER);
  const { pagination: videosPagination, loading: videosLoading } = useVideos(STATS_FILTER);
  const { pagination: coursesPagination, loading: coursesLoading } = useCourses(STATS_FILTER);
  const { pagination: booksPagination, loading: booksLoading } = useBooks();

  return {
    users: usersPagination?.totalCount ?? 0,
    images: imagesPagination?.totalCount ?? 0,
    videos: videosPagination?.totalCount ?? 0,
    courses: coursesPagination?.totalCount ?? 0,
    documents: booksPagination?.totalCount ?? 0,
    loading: usersLoading || imagesLoading || videosLoading || coursesLoading || booksLoading,
  };
}

