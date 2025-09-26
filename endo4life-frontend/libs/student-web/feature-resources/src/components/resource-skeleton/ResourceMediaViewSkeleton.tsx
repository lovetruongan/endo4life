import { Skeleton } from '@mui/material';
import clsx from 'clsx';
import styles from './ResourceMediaViewSkeleton.module.css';

interface IResourceMediaViewSkeletonProps {

}
export function ResourceMediaViewSkeleton({
  
}: IResourceMediaViewSkeletonProps) {
  return (
    <div className={clsx(styles['container'])}>
      <Skeleton sx={{ bgcolor: 'white' }} width="100%" height={720} />
    </div>
    
  );
}