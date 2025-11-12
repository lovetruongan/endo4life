import { ICourseEntity } from '../../types';
import { IconButton, Tooltip } from '@mui/material';
import { VscTrash } from 'react-icons/vsc';
import { BiEditAlt } from 'react-icons/bi';
import { useToggle } from 'ahooks';
import { useTranslation } from 'react-i18next';
import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

interface CourseActionsCellProps {
  course: ICourseEntity;
  hasEditButton?: boolean;
  hasRemoveButton?: boolean;
}
export function CourseActionsCell({
  course,
  hasEditButton = true,
  hasRemoveButton = true,
}: CourseActionsCellProps) {
  const { t } = useTranslation(['common', 'course']);
  const [open, openDialogAction] = useToggle(false);
  const navigate = useNavigate();
  return (
    <span className="py-2">
      {hasEditButton && (
        <Tooltip arrow title={t('course:actions.txtEditCourse')}>
          <IconButton
            size="small"
            className="my-2 hover:text-primary"
            onClick={() => {
              navigate(ADMIN_WEB_ROUTES.COURSE_DETAIL.replace(':id', course.id));
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
            className="my-2 hover:text-red-500"
            onClick={openDialogAction.toggle}
          >
            <VscTrash size={16} />
          </IconButton>
        </Tooltip>
      )}
    </span>
  );
}
