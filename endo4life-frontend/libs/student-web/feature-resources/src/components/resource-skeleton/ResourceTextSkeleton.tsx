import { Skeleton } from '@mui/material';
import clsx from 'clsx';
import styles from './ResourceTextSkeleton.module.css';

interface IResourceTextSkeletonProps {
  isFullWidth?: boolean;
}
export function ResourceTextSkeleton({
  isFullWidth = true,
}: IResourceTextSkeletonProps) {
  return (
    <div className={clsx(styles['container'])}>
       <Skeleton width={isFullWidth ? "100%" : "50%"} height={40} />
    </div>
  );
}