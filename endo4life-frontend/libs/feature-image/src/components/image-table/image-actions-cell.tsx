import { IImageEntity } from '../../types';
import { IconButton, Tooltip } from '@mui/material';
import { VscTrash } from 'react-icons/vsc';
import { BiEditAlt } from 'react-icons/bi';
import { useTranslation } from 'react-i18next';
import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';
import { useNavigate } from 'react-router-dom';

interface ImageActionsCellProps {
  image: IImageEntity;
  hasEditButton?: boolean;
  hasRemoveButton?: boolean;
}
export function ImageActionsCell({
  image,
  hasEditButton = true,
  hasRemoveButton = true,
}: ImageActionsCellProps) {
  const { t } = useTranslation(['common', 'image']);
  // const [open, openDialogAction] = useToggle(false);
  const navigate = useNavigate();
  return (
    <span className="py-2">
      {hasEditButton && (
        <Tooltip arrow title={t('image:actions.editImage')}>
          <IconButton
            size="small"
            className="my-2 hover:text-primary"
            onClick={() => {
              navigate(ADMIN_WEB_ROUTES.IMAGE_DETAIL.replace(':id', image.id));
            }}
          >
            <BiEditAlt size={16} />
          </IconButton>
        </Tooltip>
      )}
      {hasRemoveButton && (
        <Tooltip arrow title={t('image:actions.deleteImage')}>
          <IconButton
            size="small"
            className="my-2 hover:text-red-500"
            // onClick={openDialogAction.toggle}
          >
            <VscTrash size={16} />
          </IconButton>
        </Tooltip>
      )}
      {/* {open && (
        <ImageDeleteConfirmDialog
          Image={Image}
          onClose={openDialogAction.setLeft}
        />
      )} */}
    </span>
  );
}
