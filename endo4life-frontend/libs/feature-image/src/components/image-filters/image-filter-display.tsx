import { IFilter } from '@endo4life/types';
import { useMemo } from 'react';
import { ImageFilter } from '../../types';
import { formatDateOnly } from '@endo4life/util-common';
import { useTranslation } from 'react-i18next';

interface Props {
  filter: IFilter;
}
export function ImageFilterDisplay({ filter }: Props) {
  const { t } = useTranslation('image');
  const displayItems = useMemo(() => {
    const arrStr: string[] = [];
    const imageFilter = new ImageFilter(filter);

    const fromDate = imageFilter.getStringField('fromDate');
    const toDate = imageFilter.getStringField('toDate');
    const commentOperator = imageFilter.getStringField('commentOperator');
    const viewOperator = imageFilter.getStringField('viewOperator');
    const numComments = imageFilter.getNumberField('numComments');
    const numViews = imageFilter.getNumberField('numViews');
    const tag = imageFilter.getArrayStringField('tag');
    const detailTag = imageFilter.getArrayStringField('detailTag');

    if (fromDate && toDate) {
      arrStr.push(`${formatDateOnly(fromDate)}-${formatDateOnly(toDate)}`);
    } else {
      if (fromDate) {
        arrStr.push(
          `${t('imageFilterForm.fromDate')}: ${formatDateOnly(fromDate)}`,
        );
      } else if (toDate) {
        arrStr.push(
          `${t('imageFilterForm.toDate')}: ${formatDateOnly(toDate)}`,
        );
      }
    }
    if (commentOperator === '>=' && numComments) {
      arrStr.push(`${t('basicInfo.commentCount')} ≥ ${numComments}`);
    }
    if (commentOperator === '<=' && numComments) {
      arrStr.push(`${t('basicInfo.commentCount')} ≤ ${numComments}`);
    }
    if (viewOperator === '>=' && numViews) {
      arrStr.push(`${t('basicInfo.viewNumber')} ≥ ${numViews}`);
    }
    if (viewOperator === '<=' && numViews) {
      arrStr.push(`${t('basicInfo.viewNumber')} ≤ ${numViews}`);
    }
    if (tag && tag.length > 0) {
      arrStr.push(`${t('basicInfo.tag')}: ${tag.join(', ')}`);
    }
    if (detailTag && detailTag.length > 0) {
      arrStr.push(`${t('basicInfo.detailTag')}: ${detailTag.join(', ')}`);
    }
    return arrStr;
  }, [filter]);
  if (displayItems.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-white">
      <strong className="text-sm">{t('imageFilterForm.title')}:</strong>
      {displayItems.map((item) => (
        <span className="px-3 py-1 text-xs rounded-full bg-slate-100 text-slate-900">
          {item}
        </span>
      ))}
    </div>
  );
}
