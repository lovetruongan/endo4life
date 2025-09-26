import { IconButton, Tooltip } from '@mui/material';
import { VscTrash } from 'react-icons/vsc';
import { BiEditAlt } from 'react-icons/bi';
import { useToggle } from 'ahooks';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { ICourseSectionEntity } from '../../types';

interface CourseSectionActionsCellProps {
  course: ICourseSectionEntity;
  hasEditButton?: boolean;
  hasRemoveButton?: boolean;
}
export function CourseActionsCell({
  course,
  hasEditButton = true,
  hasRemoveButton = true,
}: CourseSectionActionsCellProps) {
  const { t } = useTranslation(['common', 'course']);
  const [open, openDialogAction] = useToggle(false);
  const [searchParams, setSearchParams] = useSearchParams();
  return (
    <span className="py-2">
      {hasEditButton && (
        <Tooltip arrow title={t('course:actions.txtEditCourse')}>
          <IconButton
            size="small"
            className="hover:text-primary my-2"
            onClick={() => {
              const newParams = new URLSearchParams(searchParams);
              newParams.set('lectureId', course?.id?.toString());
              setSearchParams(newParams);
            }}
          >
            <BiEditAlt size={16} />
          </IconButton>
        </Tooltip>
      )}
      {hasRemoveButton && (
        <Tooltip arrow title={t('course:actions.txtRemoveCourse')}>
          <IconButton
            size="small"
            className="hover:text-red-500 my-2"
            onClick={openDialogAction.toggle}
          >
            <VscTrash size={16} />
          </IconButton>
        </Tooltip>
      )}
    </span>
  );
}
