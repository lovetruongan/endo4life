import { Skeleton } from '@mui/material';
import clsx from 'clsx';
import styles from './ResourceDiscussionSkeleton.module.css';

interface IResourceDiscussionSkeletonProps {
  numOfDiscussions?: number;
}
export function ResourceDiscussionSkeleton({
  numOfDiscussions = 2,
}: IResourceDiscussionSkeletonProps) {
  return (
    <div
      className={clsx(styles["container"], {
        "flex flex-col gap-4": true
      })}
    >
      {Array.from({ length: numOfDiscussions }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-2"
        >
          {/* left */}
          <div className="flex-none h-full">
            <Skeleton
              variant="circular"
              width={40}
              height={40}
            />
          </div>
          {/* right */}
          <div className="flex-col flex-auto h-full gap-1">
            <Skeleton height={24} width="50%"/>
            <Skeleton height={32} width="100%"/>
          </div>
        </div>
      ))}
    </div>
  );
}