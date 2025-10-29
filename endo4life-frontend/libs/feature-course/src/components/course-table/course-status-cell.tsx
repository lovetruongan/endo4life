import { CourseState } from '@endo4life/data-access';
import { ICourseEntity } from '../../types';
import { useTranslation } from 'react-i18next';
import { FaGlobe, FaLock, FaFileAlt } from 'react-icons/fa';
import { IoChevronDown } from 'react-icons/io5';

interface CourseStateCellProps {
  course: ICourseEntity;
}
export function CourseStatusCell({ course }: CourseStateCellProps) {
  const { t } = useTranslation('course');

  return (
    <div className="flex items-center justify-center py-2 space-x-1 hover:cursor-pointer hover:text-gray-400 hover:duration-300">
      {course?.status === CourseState.Public.toString() && (
        <>
          <FaGlobe />
          <span>{t(`state.${CourseState.Public.toString()}`)}</span>
          <IoChevronDown />
        </>
      )}
      {course?.status === CourseState.Private.toString() && (
        <>
          <FaLock />
          <span>{t(`state.${CourseState.Private.toString()}`)}</span>
          <IoChevronDown />
        </>
      )}
      {course?.status === CourseState.Draft.toString() && (
        <>
          <FaFileAlt />
          <span>{t(`state.${CourseState.Draft.toString()}`)}</span>
          <IoChevronDown />
        </>
      )}
    </div>
  );
}
