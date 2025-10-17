import { FilterBuilder, FilterQueryBuilder, IFilter } from '@endo4life/types';
import { Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ResourceFilter } from '../../types';

interface ResourceTagListLinkProps {
  tags?: string[];
  maxVisibleTags?: number;
  filter: IFilter;

  onChange(filter: IFilter): void;
};

const ResourceTagListLink = ({ tags = [], maxVisibleTags = 5, filter, onChange }: ResourceTagListLinkProps) => {
  const { t } = useTranslation('common');

  const displayedTags = tags.slice(0, maxVisibleTags);
  const remainingTagCount = tags.length - displayedTags.length;
  const remainingTags = tags.slice(maxVisibleTags);

  const handleTagClick = (tag: string) => {
    // const filterBuilder = new FilterBuilder(filter?.page, filter?.size);
    // filterBuilder.addQuery(new FilterQueryBuilder('resourceType', new ResourceFilter(filter).getType()).build());
    // filterBuilder.addQuery(new FilterQueryBuilder('tag', tag).build());
    // onChange && onChange(filterBuilder.build());
  }

  return (
    <div className="items-center gap-2">
      {displayedTags.map((tag, index) => (
        <span key={tag} className="text-gray-500">
          <span
            key={tag}
            className="underline cursor-pointer underline-offset-1"
            onClick={() => handleTagClick(tag)}
          >
            {tag}
          </span>
          {index < displayedTags.length - 1 ? ", " : " "}
        </span>
      ))}
      {remainingTagCount > 0 && (
        <Tooltip
          title={
            <div className="flex flex-col gap-2">
              {remainingTags.map((tag) => (
                <span key={tag} onClick={() => handleTagClick(tag)} className="!text-md cursor-pointer">
                  {tag}
                </span>
              ))}
            </div>
          }
          arrow
          placement="top"
        >
          <span className="px-1.5 py-0.5 bg-slate-100 rounded-full text-gray-500 text-nowrap cursor-pointer">
            +{remainingTagCount} {t('common:txtOthers')}
          </span>
        </Tooltip>
      )}
    </div>
  );
};

export default ResourceTagListLink;
