import { ReactNode } from 'react';
import clsx from 'clsx';

export interface PageHeaderProps {
  title: string;
  titleAction?: ReactNode;
  subTitle?: string;
  description?: string | ReactNode;
  leading?: ReactNode;
  children?: ReactNode;
  onTitleClick?: () => void;
}

export function PageHeader({
  title,
  titleAction,
  subTitle,
  description,
  leading,
  children,
  onTitleClick,
}: PageHeaderProps) {
  return (
    <div className="flex-none px-5 my-5 space-y-1">
      <div className="flex items-center gap-4">
        <div className="flex-auto">
          <div className="flex flex-col">
            {title && (
              <div className="flex items-center gap-2">
                <h2
                  className={clsx('text-xl font-semibold text-slate-90', {
                    'cursor-pointer': onTitleClick,
                  })}
                  onClick={onTitleClick}
                >
                  {title}
                </h2>
                {titleAction}
              </div>
            )}
            {subTitle && (
              <h2
                className={clsx('text-xl font-semibold text-slate-90', {
                  'cursor-pointer': onTitleClick,
                })}
                onClick={onTitleClick}
              >
                {subTitle}
              </h2>
            )}
          </div>

          {description && <p>{description}</p>}
        </div>
        <div className="flex items-center flex-none gap-2 py-2">{leading}</div>
      </div>
      {!!children && (
        <div className="px-4 py-3 space-y-3 bg-white rounded">{children}</div>
      )}
    </div>
  );
}
