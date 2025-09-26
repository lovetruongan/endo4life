import React from 'react';
import { PageHeaderProps } from './page-header';
import clsx from 'clsx';

export function PageHeaderUserDetail({
  title,
  titleAction,
  subTitle,
  description,
  leading,
  children,
  onTitleClick,
}: PageHeaderProps) {
  return (
    <div className="flex-none px-5 my-4 space-y-1">
      <div className="flex items-center gap-4">
        <div className="flex-auto">
          <div className="flex flex-col">
            {subTitle && (
              <h2
                className={clsx('text-xs font-medium text-primary', {
                  'cursor-pointer': onTitleClick,
                })}
                onClick={onTitleClick}
              >
                {subTitle}
              </h2>
            )}
            {title && (
              <div className="flex items-center gap-2">
                {titleAction}
                <h2
                  className={clsx('text-2xl font-medium text-black', {
                    'cursor-pointer': onTitleClick,
                  })}
                  onClick={onTitleClick}
                >
                  {title}
                </h2>
              </div>
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

export default PageHeaderUserDetail;
