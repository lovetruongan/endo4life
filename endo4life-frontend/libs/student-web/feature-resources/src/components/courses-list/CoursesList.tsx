import { STUDENT_WEB_ROUTES } from '@endo4life/feature-config';
import clsx from 'clsx';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ICourseEntity } from '../../types/course-entity';
import styles from './CoursesList.module.css';

interface Props {
  loading?: boolean;
  data?: ICourseEntity[];
}

export function CoursesList({ loading, data }: Props) {
  const { t } = useTranslation('common');

  const truncateDescription = (text: string | undefined, maxLength: number) => {
    if (!text || typeof text !== 'string') return '';
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

  return (
    <div className={clsx(styles['container'])}>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 mb-6">
        {!loading &&
          data?.map((course) => (
            <div
              key={course.id}
              className="flex flex-col gap-2.5 py-3 bg-white rounded-lg"
            >
              <Link
                to={STUDENT_WEB_ROUTES.RESOURCE_COURSE.replace(
                  ':id',
                  course.id,
                )}
                className="flex items-center justify-center"
              >
                <img
                  src={
                    (course as any).thumbnail?.src ||
                    course.thumbnailUrl ||
                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="20" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E'
                  }
                  alt={course.title}
                  className="w-full h-60 mb-2 object-cover rounded-lg bg-gray-100"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    // Prevent infinite loop - only set placeholder once
                    if (!target.src.startsWith('data:image/svg')) {
                      target.src =
                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="20" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                    }
                  }}
                />
              </Link>
              <div className="flex items-center justify-between">
                <span className="text-md font-medium">{course.title}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-700 break-all">
                  {truncateDescription(course.description, 120)}
                </span>
              </div>
            </div>
          ))}

        {loading && <LoadingSkeleton />}
      </div>

      {!loading && data && data.length === 0 && (
        <div className="text-center text-gray-500 mb-4">
          {t('txtNoSearchResultsShort')}
        </div>
      )}
    </div>
  );
}

const LoadingSkeleton = () => (
  <Fragment>
    {[...Array(10)].map((_, i) => (
      <CourseSkeleton key={i} />
    ))}
  </Fragment>
);

const CourseSkeleton = () => (
  <div className="rounded-md p-3 w-full mx-auto">
    <div className="animate-pulse flex space-x-4">
      <div className="flex-1 space-y-6 py-1">
        <div className="h-60 bg-slate-200 rounded"></div>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-4">
            <div className="h-2 bg-slate-200 rounded col-span-2"></div>
            <div className="h-2 bg-slate-200 rounded col-span-1"></div>
          </div>
          <div className="h-2 bg-slate-200 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

export default CoursesList;
