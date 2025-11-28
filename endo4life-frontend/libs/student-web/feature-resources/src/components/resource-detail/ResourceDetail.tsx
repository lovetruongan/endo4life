import clsx from 'clsx';
import styles from './ResourceDetail.module.css';
import moment from 'moment';
import { Avatar } from '@mui/material';
import { arrayUtils, stringUtils } from '@endo4life/util-common';
import { useCallback, useMemo } from 'react';
import { ReadMoreText } from '@endo4life/ui-common';
import ResourceTagList from '../resource-tag-list/ResourceTagList';
import { ResourceTextSkeleton } from '../resource-skeleton/ResourceTextSkeleton';
import { ResourceMultiTextSkeleton } from '../resource-skeleton/ResourceMultiTextSkeleton';
import { ResourceMediaViewSkeleton } from '../resource-skeleton/ResourceMediaViewSkeleton';
import ResourceDetailSimilar from '../resource-detail-similar/ResourceDetailSimilar';
import { ResourceType } from '@endo4life/data-access';
import { useNavigate } from 'react-router-dom';
import { DiscussionWrapper } from '@endo4life/feature-discussion';
import { STUDENT_WEB_ROUTES } from '@endo4life/feature-config';
import { useResourceDetailContext } from '../../hooks';

interface IResourceDetailProps {
  loading: boolean;
}

export function ResourceDetail({ loading }: IResourceDetailProps) {
  const navigate = useNavigate();
  const { resource } = useResourceDetailContext();

  const allTags = useMemo(() => {
    return [
      ...arrayUtils.defaultArray(resource.tag),
      ...arrayUtils.defaultArray(resource.detailTag),
      ...arrayUtils.defaultArray(resource.anatomyLocationTag),
      ...arrayUtils.defaultArray(resource.hpTag),
      ...arrayUtils.defaultArray(resource.lightTag),
      ...arrayUtils.defaultArray(resource.upperGastroAnatomyTag),
    ];
  }, [
    resource.tag,
    resource.detailTag,
    resource.anatomyLocationTag,
    resource.hpTag,
    resource.lightTag,
    resource.upperGastroAnatomyTag,
  ]);

  const renderMedia = useCallback(() => {
    return resource.type === ResourceType.Image ? (
      <img
        alt="resource-image-view"
        className="object-contain"
        src={resource?.resourceUrl}
      />
    ) : resource.type === ResourceType.Video ? (
      <video src={resource?.resourceUrl} controls />
    ) : (
      <div>Định dạng không hỗ trợ</div>
    );
  }, [resource]);

  const onTagClick = (type: string, tagValue: string) => {
    const urlParams = new URLSearchParams();
    // Map entity field names to filter field names for ResourceCriteria
    // Entity uses anatomyLocationTag/upperGastroAnatomyTag
    // Filter uses endoscopyTag/locationUpperTag
    const filterFieldMap: Record<string, string> = {
      anatomyLocationTag: 'endoscopyTag',
      upperGastroAnatomyTag: 'locationUpperTag',
      hpTag: 'hpTag',
      lightTag: 'lightTag',
    };
    const filterField = filterFieldMap[type] || type;
    urlParams.set(filterField, tagValue);
    navigate({
      pathname: STUDENT_WEB_ROUTES.RESOURCES,
      search: `?${urlParams.toString()}`,
    });
  };

  return (
    <div
      className={clsx(styles['container'], {
        'flex flex-col gap-4': true,
      })}
    >
      {/* resource view section */}
      <div className="flex justify-center border rounded-lg bg-stone-900 lg:w-full h-170">
        {loading ? <ResourceMediaViewSkeleton /> : renderMedia()}
      </div>
      {/* Info view section */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <ResourceTextSkeleton isFullWidth={false} />
        ) : (
          <h1 className="text-4xl font-bold">{resource?.title}</h1>
        )}
        {/* info of user that created the resource */}
        <div>
          {loading ? (
            <ResourceTextSkeleton isFullWidth={false} />
          ) : (
            <div className="flex items-center gap-2">
              <Avatar
                src="https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/474488XVB/meme-cho-rang-trang-cuoi_044958043.jpg"
                sx={{ width: 28, height: 28 }}
              />
              <span className="text-sm">
                {stringUtils.defaultStringWithValue(
                  resource?.createdBy,
                  'Không xác định',
                )}
              </span>
              <span>•</span>
              <span className="text-sm">
                {moment(resource.createdAt).fromNow()}
              </span>
            </div>
          )}
        </div>
        {/* detail information */}
        <div className="flex flex-col gap-3">
          {/* tags, detail */}
          <div className="flex items-center gap-2">
            {loading ? (
              <ResourceTextSkeleton isFullWidth={false} />
            ) : (
              <ResourceTagList
                tags={resource.tag}
                detailTags={resource.detailTag}
                anatomyLocationTags={resource.anatomyLocationTag}
                hpTags={resource.hpTag}
                lightTags={resource.lightTag}
                upperGastroAnatomyTags={resource.upperGastroAnatomyTag}
                maxDisplay={allTags.length}
                textColorHex="000000"
                onTagClick={onTagClick}
              />
            )}
          </div>
          {/* description of resource */}
          {loading ? (
            <ResourceMultiTextSkeleton numOfLines={5} />
          ) : (
            <ReadMoreText>
              <span>{resource.description}</span>
            </ReadMoreText>
          )}
        </div>
      </div>
      {/* similar resources section */}
      <div className="block lg:hidden">
        {resource && <ResourceDetailSimilar />}
      </div>
      {/* comment/ask expert section */}
      <div>{resource.id && <DiscussionWrapper />}</div>
    </div>
  );
}

export default ResourceDetail;
