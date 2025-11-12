import { CourseState } from '@endo4life/data-access';
import { ICourseEntity } from '../../types';
import { useTranslation } from 'react-i18next';
import { FaGlobe, FaLock, FaFileAlt } from 'react-icons/fa';
import { IoChevronDown } from 'react-icons/io5';
import { Actions } from 'ahooks/lib/useToggle';

interface CourseStateCellProps {
  course: ICourseEntity;
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

  const currentState = course?.status || CourseState.Draft.toString();
  const stateAsEnum = currentState as CourseState;

  return (
    <div
      className="flex items-center justify-center py-2 space-x-1 hover:cursor-pointer hover:text-gray-400 hover:duration-300"
      onClick={() => {
        onSelectCourse(course.id);
        onSetStateCourse(stateAsEnum);
        openStateDialogAction.toggle();
      }}
    >
      {currentState === CourseState.Public.toString() && (
        <>
          <FaGlobe />
          <span>{t(`state.${CourseState.Public.toString()}`)}</span>
          <IoChevronDown />
        </>
      )}
      {currentState === CourseState.Private.toString() && (
        <>
          <FaLock />
          <span>{t(`state.${CourseState.Private.toString()}`)}</span>
          <IoChevronDown />
        </>
      )}
      {(currentState === CourseState.Draft.toString() ||
        !course?.status) && (
        <>
          <FaFileAlt />
          <span>{t(`state.${CourseState.Draft.toString()}`)}</span>
          <IoChevronDown />
        </>
      )}
    </div>
  );
}
