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

// Helper function to validate if a URL is a valid image URL
const isValidImageUrl = (url: string | undefined | null): boolean => {
  if (!url || typeof url !== 'string') return false;
  // Check if it's JSON (starts with { or [)
  if (url.trim().startsWith('{') || url.trim().startsWith('[')) return false;
  // Check if it's a valid URL format
  try {
    const urlObj = new URL(url);
    // Check for common image extensions or data URLs
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    const pathname = urlObj.pathname.toLowerCase();
    const isImageExtension = imageExtensions.some(ext => pathname.endsWith(ext));
    const isDataUrl = url.startsWith('data:image/');
    return isImageExtension || isDataUrl || url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
};

// Helper function to parse JSON description and extract readable text
const parseDescription = (description: string | undefined): string => {
  if (!description || typeof description !== 'string') return '';
  
  // Check if it's JSON
  const trimmed = description.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(description);
      // Try to extract text from common JSON structures
      if (typeof parsed === 'object') {
        // Check for rich text editor format (Lexical)
        if (parsed.root?.children) {
          const extractText = (node: any): string => {
            if (node.text) return node.text;
            if (node.children && Array.isArray(node.children)) {
              return node.children.map(extractText).join(' ');
            }
            return '';
          };
          const text = parsed.root.children.map(extractText).join(' ').trim();
          if (text) return text;
        }
        // Check for metadata structure
        if (parsed.metadata) {
          const meta = parsed.metadata;
          if (meta.mainContent) return parseDescription(meta.mainContent);
          if (meta.content) return parseDescription(meta.content);
          if (meta.description) return parseDescription(meta.description);
        }
        // Try to find any text field
        if (parsed.content) return parseDescription(parsed.content);
        if (parsed.text) return parseDescription(parsed.text);
        if (parsed.description) return parseDescription(parsed.description);
      }
    } catch (e) {
      // If parsing fails, return empty string or fallback
      return '';
    }
  }
  
  return description;
};

export function CoursesList({ loading, data }: Props) {
  const { t } = useTranslation('common');

  const truncateDescription = (text: string | undefined, maxLength: number) => {
    const parsedText = parseDescription(text);
    if (!parsedText) return '';
    if (parsedText.length > maxLength) {
      return parsedText.substring(0, maxLength) + '...';
    }
    return parsedText;
  };

  const getThumbnailUrl = (course: ICourseEntity): string => {
    // Try thumbnail object first
    const thumbnailSrc = (course as any).thumbnail?.src;
    if (thumbnailSrc && isValidImageUrl(thumbnailSrc)) {
      return thumbnailSrc;
    }
    
    // Try thumbnailUrl
    if (course.thumbnailUrl && isValidImageUrl(course.thumbnailUrl)) {
      return course.thumbnailUrl;
    }
    
    // Return placeholder
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="20" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
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
                  src={getThumbnailUrl(course)}
                  alt={course.title || 'Course thumbnail'}
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
