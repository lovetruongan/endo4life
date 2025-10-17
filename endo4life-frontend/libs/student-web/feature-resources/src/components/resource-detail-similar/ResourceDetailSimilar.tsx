import clsx from 'clsx';
import styles from './ResourceDetailSimilar.module.css';
import { IResourceEntity, ResourceFilter } from '../../types';
import moment from 'moment';
import { PreviewCard } from '@endo4life/ui-common';
import { arrayUtils, stringUtils } from '@endo4life/util-common';
import { STUDENT_WEB_ROUTES } from '@endo4life/feature-config';
import { Link } from 'react-router-dom';
import { Tooltip } from '@mui/material';
import { ResourcePreviewCardSkeleton } from '../resource-skeleton/ResourcePreviewCardSkeleton';
import { useResourceDetailContext, useResourceFilters, useResources } from '../../hooks';
import { useDeepCompareEffect } from 'ahooks';

interface IResourceDetailSimilarProps { }

export function ResourceDetailSimilar({}: IResourceDetailSimilarProps) {
  const { resource } = useResourceDetailContext();
  const { filter, updateFilter} = useResourceFilters(false);
  const { loading, data } = useResources(filter);

  useDeepCompareEffect(() => {
    if (!resource?.tag?.length && !resource?.detailTag?.length) {
      return;
    }
    const newSimilarImageFilter = new ResourceFilter();
    newSimilarImageFilter.setQuery("tag", resource?.tag?.join(","));
    newSimilarImageFilter.setQuery("detailTag", resource?.detailTag?.join(","));
    newSimilarImageFilter.setPage(0);
    newSimilarImageFilter.setPageSize(10);
    updateFilter(newSimilarImageFilter.toFilter());
  }, [resource?.tag, resource?.detailTag]);

  return (
    <div
      className={clsx(styles['container'], {
        'flex flex-col lg:w-110 overflow-x-hidden border-slate-300 lg:p-0 rounded-lg gap-3': true,
      })}
    >
      <h2 className="text-2xl font-semibold">Xem thêm</h2>
      <div className="flex flex-col gap-2">
        {!loading ? (
          data && data.length ? (
            data.map((item) => {
              const resource = item as IResourceEntity;
              const allTags = [
                ...arrayUtils.defaultArray(resource.tag),
                ...arrayUtils.defaultArray(resource.detailTag),
              ];

              const title = () => {
                return <h4 className="text-lg font-semibold">{resource.title}</h4>;
              };
              const subTitle = () => {
                return (
                  <div className="flex gap-1 text-xs">
                    <span>{resource.createdBy}</span>
                    <span>•</span>
                    <span>{moment(resource.createdAt).fromNow()}</span>
                  </div>
                );
              };
              const extraInfo = () => {
                let tagInfo = 'Nhãn: ';
                tagInfo += allTags.join(', ');
                return (
                  <Tooltip
                    title={allTags.map((tag) => (
                      <div key={tag} className="text-xs">
                        {tag}
                        <br />
                      </div>
                    ))}
                  >
                    <div className="text-xs line-clamp-3">
                      <span>{tagInfo}</span>
                    </div>
                  </Tooltip>
                );
              };

              return (
                <Link
                  to={STUDENT_WEB_ROUTES.RESOURCE_IMAGE.replace(
                    ':id',
                    stringUtils.defaultString(resource.id),
                  )}
                  key={resource.id}
                  className="p-2 transition cursor-pointer hover:rounded-lg"
                >
                  <PreviewCard
                    previewResource={resource as IResourceEntity}
                    title={title()}
                    subTitle={subTitle()}
                    extraInfo={extraInfo()}
                  />
                </Link>
              );
            })
          ) : (
            <div className="italic">Chưa có dữ liệu</div>
          )
        ) : (
          <ResourcePreviewCardSkeleton numOfCards={5} />
        )}
      </div>
    </div>
  );
}

export default ResourceDetailSimilar;
