import { STUDENT_WEB_ROUTES } from '@endo4life/feature-config';
import { IFilter } from '@endo4life/types';
import { formatTimeAgo } from '@endo4life/util-common';
import { Avatar } from '@mui/material';
import clsx from 'clsx';
import moment from 'moment';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PiPlayFill } from 'react-icons/pi';
import { VscCircleFilled } from 'react-icons/vsc';
import { Link } from 'react-router-dom';
import { Fragment } from 'react/jsx-runtime';
import { ICourseEntity, IResourceEntity, ResourceFilter, ResourceTypeEnum } from '../../types';
import ResourceTagListLink from '../resource-tag-list-link/ResourceTagListLink';
import styles from './ResourcesList.module.css';

interface Props {
  filter: IFilter;
  loading?: boolean;
  data?: IResourceEntity[] | ICourseEntity[];
  onChange(filter: IFilter): void;
}

export function ResourcesList({ filter, loading, data, onChange }: Props) {
  const { t } = useTranslation('common');
  const resourceType = useMemo<string>(() => {
    return new ResourceFilter(filter).getType() || ResourceTypeEnum.IMAGE;
  }, [filter]);

  return (
    <div
      className={clsx(styles['container'], {
        '': true,
      })}
    >
      <div className="grid grid-cols-1 gap-5 mb-6 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
        {!loading &&
          data?.map((resource) => {
            return (
              <div
                key={resource.id}
                className="flex flex-col gap-2.5 py-3 bg-white rounded-lg"
              >
                {resourceType === ResourceTypeEnum.IMAGE && (
                  <Link to={STUDENT_WEB_ROUTES.RESOURCE_IMAGE.replace(':id', resource.id)} className="flex items-center justify-center">
                    <img
                      src={(resource as IResourceEntity).thumbnailUrl}
                      alt={(resource as IResourceEntity).title}
                      className="object-cover w-full mb-2 rounded-lg h-60"
                    />
                  </Link>
                )}
                {resourceType === ResourceTypeEnum.VIDEO && (
                  <Link to={STUDENT_WEB_ROUTES.RESOURCE_VIDEO.replace(':id', resource.id)} className="flex items-center justify-center">
                    <div className="relative w-full mb-2 overflow-hidden rounded-lg h-60">
                      <img
                        src={(resource as IResourceEntity).thumbnailUrl}
                        alt={resource.title}
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-15"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex items-center justify-center w-10 h-10 bg-black rounded-full opacity-30">
                          <PiPlayFill size={26} color="white" />
                        </div>
                      </div>
                      <div className="absolute px-2 py-1 text-xs text-white bg-gray-800 rounded bottom-2 right-2">
                        {moment
                          .utc(((resource as IResourceEntity).time || 0) * 1000)
                          .format('mm:ss')}
                      </div>
                    </div>
                  </Link>
                )}

                <div className="flex items-center justify-between">
                  <span className="font-medium text-md">{resource.title}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Avatar
                    alt="avatar"
                    sx={{
                      width: '24px',
                      height: '24px',
                    }}
                  >
                    { }
                  </Avatar>
                  <span className="text-xs text-gray-500">
                    {resource.createdBy}
                  </span>
                  <VscCircleFilled size={8} color="gray" />
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(resource?.createdAt || '')}
                  </span>
                </div>
                {'tag' in resource && (
                  <div className="flex mt-0.5">
                    <span className="mr-1.5 text-gray-600">Nhãn:</span>
                    <ResourceTagListLink
                      tags={(resource.tag ?? []).concat(
                        resource.detailTag ?? [],
                      )}
                      maxVisibleTags={3}
                      filter={filter}
                      onChange={onChange}
                    />
                  </div>
                )}
              </div>
            );
          })}

        {loading && <LoadingSkeleton />}
      </div>

      {!loading && data && data.length === 0 && (
        <div className="mb-4 text-center text-gray-500">
          {t('txtNoSearchResultsShort')}
        </div>
      )}
    </div>
  );
}

const LoadingSkeleton = () => (
  <Fragment>
    {[...Array(10)].map((_, i) => (
      <ResourceSkeleton key={i} />
    ))}
  </Fragment>
);

const ResourceSkeleton = () => {
  return (
    <div className="w-full p-3 mx-auto rounded-md">
      <div className="flex space-x-4 animate-pulse">
        <div className="flex-1 py-1 space-y-6">
          <div className="rounded h-60 bg-slate-200"></div>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="h-2 col-span-2 rounded bg-slate-200"></div>
              <div className="h-2 col-span-1 rounded bg-slate-200"></div>
            </div>
            <div className="h-2 rounded bg-slate-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcesList;
