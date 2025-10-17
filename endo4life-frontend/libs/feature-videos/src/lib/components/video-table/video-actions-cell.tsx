import { IVideoEntity } from '../../types';
import { IconButton, Tooltip } from '@mui/material';
import { VscTrash } from 'react-icons/vsc';
import { BiEditAlt } from 'react-icons/bi';
import { useToggle } from 'ahooks';
import { useTranslation } from 'react-i18next';
import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';
import { useNavigate } from 'react-router-dom';

interface VideoActionsCellProps {
  video: IVideoEntity;
  hasEditButton?: boolean;
  hasRemoveButton?: boolean;
}
export function VideoActionsCell({
  video,
  hasEditButton = true,
  hasRemoveButton = true,
}: VideoActionsCellProps) {
  const { t } = useTranslation('video');
  const [open, openDialogAction] = useToggle(false);
  const navigate = useNavigate();
  return (
    <span className="py-2">
      {hasEditButton && (
        <Tooltip arrow title={t('actions.editVideo')}>
          <IconButton
            size="small"
            className="hover:text-primary my-2"
            onClick={() => {
              navigate(ADMIN_WEB_ROUTES.VIDEO_DETAIL.replace(':id', video.id));
            }}
          >
            <BiEditAlt size={16} />
          </IconButton>
        </Tooltip>
      )}
      {hasRemoveButton && (
        <Tooltip arrow title={t('actions.deleteVideo')}>
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
