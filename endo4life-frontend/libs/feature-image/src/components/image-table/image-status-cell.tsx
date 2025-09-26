import { ResourceState } from '@endo4life/data-access';
import { IImageEntity } from '../../types';
import { useTranslation } from 'react-i18next';
import { FaGlobe, FaLock } from 'react-icons/fa';
import { IoChevronDown } from 'react-icons/io5';

interface ImageStateCellProps {
  image: IImageEntity;
}
export function ImageStatusCell({
  image,
}: ImageStateCellProps) {
  const { t } = useTranslation('image');

  return (
    <div
      className="flex items-center justify-center py-2 space-x-1 hover:cursor-pointer hover:text-gray-400 hover:duration-300"
    >
      {image?.state === ResourceState.Public.toString() && (
        <>
          <FaGlobe />
          <span>{t(`state.${ResourceState.Public.toString()}`)}</span>
          <IoChevronDown />
        </>
      )}
      {image?.state === ResourceState.Unlisted.toString() && (
        <>
          <FaLock />
          <span>{t(`state.${ResourceState.Unlisted.toString()}`)}</span>
          <IoChevronDown />
        </>
      )}
    </div>
  );
}
