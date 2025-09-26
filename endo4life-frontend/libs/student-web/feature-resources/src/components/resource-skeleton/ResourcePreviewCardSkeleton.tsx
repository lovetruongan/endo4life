import { Skeleton } from '@mui/material';
import clsx from 'clsx';
import styles from './ResourcePreviewCardSkeleton.module.css';

interface IResourcePreviewCardSkeletonProps {
  numOfCards?: number;
}
export function ResourcePreviewCardSkeleton({
  numOfCards = 2,
}: IResourcePreviewCardSkeletonProps) {
  return (
    <div
      className={clsx(styles["container"])}
    >
      {Array.from({ length: numOfCards }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-2 max-w-140 h-30"
        >
          {/* left */}
          <div className="flex-none w-24 h-full sm:w-40">
            <Skeleton height={132} width="100%"/>
          </div>
          {/* right */}
          <div className="flex-col flex-auto h-full gap-1">
            <Skeleton height={24} width="50%"/>
            <Skeleton height={24} width="100%"/>
            <Skeleton height={24} width="100%"/>
          </div>
        </div>
      ))}
    </div>
  );
}