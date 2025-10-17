import { ResourceState } from '@endo4life/data-access';
import { IVideoEntity } from '../../types';
import { useTranslation } from 'react-i18next';
import { FaGlobe, FaLock } from 'react-icons/fa';
import { IoChevronDown } from 'react-icons/io5';

interface VideoStateCellProps {
  video: IVideoEntity;
}
export function VideoStatusCell({
  video,
}: VideoStateCellProps) {
  const { t } = useTranslation('video');

  return (
    <div
      className="flex items-center justify-center py-2 space-x-1 hover:cursor-pointer hover:text-gray-400 hover:duration-300"
    >
      {video?.state === ResourceState.Public.toString() && (
        <>
          <FaGlobe />
          <span>{t(`state.${ResourceState.Public.toString()}`)}</span>
          <IoChevronDown />
        </>
      )}
      {video?.state === ResourceState.Unlisted.toString() && (
        <>
          <FaLock />
          <span>{t(`state.${ResourceState.Unlisted.toString()}`)}</span>
          <IoChevronDown />
        </>
      )}
    </div>
  );
}
