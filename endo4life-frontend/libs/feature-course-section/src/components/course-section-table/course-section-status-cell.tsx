import { CourseState } from '@endo4life/data-access';
import { ICourseSectionEntity } from '../../types';
import { useTranslation } from 'react-i18next';
import { FaGlobe, FaLock, FaFileAlt } from 'react-icons/fa';
import { IoChevronDown } from 'react-icons/io5';
import { Actions } from 'ahooks/lib/useToggle';

interface CourseStateCellProps {
  course: ICourseSectionEntity;
  openStateDialogAction: Actions<boolean>;
  onSelectCourse: (courseId: string) => void;
  onSetStateCourse: (state: CourseState | undefined) => void;
}
export function CourseStatusCell({
  course,
  openStateDialogAction,
  onSelectCourse,
  onSetStateCourse,
}: CourseStateCellProps) {
  const { t } = useTranslation('course');

  return (
    <div
      className="flex items-center justify-center space-x-1 py-2 hover:cursor-pointer hover:text-gray-400 hover:duration-300"
      onClick={() => {
        onSelectCourse(course.id);
        onSetStateCourse(course.state as CourseState);
        openStateDialogAction.toggle();
      }}
    >
      {course?.state === CourseState.Public.toString() && (
        <>
          <FaGlobe />
          <span>{t(`state.${CourseState.Public.toString()}`)}</span>
          <IoChevronDown />
        </>
      )}
      {course?.state === CourseState.Private.toString() && (
        <>
          <FaLock />
          <span>{t(`state.${CourseState.Private.toString()}`)}</span>
          <IoChevronDown />
        </>
      )}
      {course?.state === CourseState.Draft.toString() && (
        <>
          <FaFileAlt />
          <span>{t(`state.${CourseState.Draft.toString()}`)}</span>
          <IoChevronDown />
        </>
      )}
    </div>
  );
}
