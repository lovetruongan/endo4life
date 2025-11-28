import { Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

interface ResourceTagListProps {
  tags?: string[];
  detailTags?: string[];
  anatomyLocationTags?: string[];
  hpTags?: string[];
  lightTags?: string[];
  upperGastroAnatomyTags?: string[];
  maxDisplay?: number;
  textColorHex?: string;
  onTagClick?: (type: string, tagValue: string) => void;
}

interface ITagItemProps {
  type: string;
  value: string;
}

const ResourceTagList = ({
  tags = [],
  detailTags = [],
  anatomyLocationTags = [],
  hpTags = [],
  lightTags = [],
  upperGastroAnatomyTags = [],
  maxDisplay = 5,
  textColorHex,
  onTagClick,
}: ResourceTagListProps) => {
  const { t } = useTranslation('common');
  const allKindTags: ITagItemProps[] = [
    ...tags.map((value) => ({ type: 'tag', value: value })),
    ...detailTags.map((value) => ({ type: 'detailTag', value: value })),
    ...anatomyLocationTags.map((value) => ({
      type: 'anatomyLocationTag',
      value: value,
    })),
    ...hpTags.map((value) => ({ type: 'hpTag', value: value })),
    ...lightTags.map((value) => ({ type: 'lightTag', value: value })),
    ...upperGastroAnatomyTags.map((value) => ({
      type: 'upperGastroAnatomyTag',
      value: value,
    })),
  ];

  const displayedTags = allKindTags.slice(0, maxDisplay);
  const remainingTagCount = allKindTags.length - displayedTags.length;
  const remainingTags = allKindTags.slice(maxDisplay);
  const textColor = textColorHex ? `text-[#${textColorHex}` : 'text-gray-500';

  return (
    <div className="flex flex-wrap items-center gap-2">
      {displayedTags.map((tag) => (
        <span
          key={tag.value}
          className={clsx(
            `px-2 py-1 text-sm ${textColor} rounded-full bg-slate-100 text-nowrap cursor-pointer hover:underline`,
          )}
          onClick={() => {
            onTagClick && onTagClick(tag.type, tag.value);
          }}
        >
          {tag.value}
        </span>
      ))}
      {remainingTagCount > 0 && (
        <Tooltip
          arrow
          placement="top"
          title={remainingTags.map((tag) => (
            <div className="text-xs">
              {tag.value}
              <br />
            </div>
          ))}
        >
          <span
            className={clsx(
              `px-2 py-1 text-sm rounded-full cursor-pointer ${textColor} bg-slate-200 text-nowrap cursor-pointer`,
            )}
          >
            +{remainingTagCount} {t('common:txtOthers')}
          </span>
        </Tooltip>
      )}
    </div>
  );
};

export default ResourceTagList;
