import { Skeleton } from '@mui/material';
import styles from './ResourceMultiTextSkeleton.module.css';
import clsx from 'clsx';

interface IResourceMultiTextSkeletonProps {
  numOfLines?: number;
  isFullWidth?: boolean;
}
export function ResourceMultiTextSkeleton({
  numOfLines = 2,
  isFullWidth = true,
}: IResourceMultiTextSkeletonProps) {
  return (
    <div
      className={clsx(styles['container'], {
        'flex flex-col gap-1': true,
      })}
    >
      {Array.from({ length: numOfLines }).map((_, index) => (
        <Skeleton key={index} width={isFullWidth ? '100%' : '50%'} height={40} />
      ))}
    </div>
  );
}
