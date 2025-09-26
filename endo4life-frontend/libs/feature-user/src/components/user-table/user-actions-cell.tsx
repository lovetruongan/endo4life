import { IUserEntity } from '../../types';
import { IconButton, Tooltip } from '@mui/material';
import { VscTrash } from 'react-icons/vsc';
import { BiEditAlt } from 'react-icons/bi';
import { useToggle } from 'ahooks';
import UserDeleteConfirmDialog from '../user-delete-confirm-dialog/user-delete-confirm-dialog';
import { useTranslation } from 'react-i18next';
import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';
import { useNavigate } from 'react-router-dom';

interface UserActionsCellProps {
  user: IUserEntity;
  hasEditButton?: boolean;
  hasRemoveButton?: boolean;
}
export function UserActionsCell({
  user,
  hasEditButton = true,
  hasRemoveButton = true,
}: UserActionsCellProps) {
  const { t } = useTranslation(['common', 'user']);
  const [open, openDialogAction] = useToggle(false);
  const navigate = useNavigate();
  return (
    <span className="">
      {hasEditButton && (
        <Tooltip arrow title={t('user:actions.txtEditUser')}>
          <IconButton
            size="small"
            className="hover:text-primary"
            onClick={() => {
              navigate(ADMIN_WEB_ROUTES.USER_DETAIL.replace(':id', user.id));
            }}
          >
            <BiEditAlt size={16} />
          </IconButton>
        </Tooltip>
      )}
      {hasRemoveButton && (
        <Tooltip arrow title={t('user:actions.txtRemoveUser')}>
          <IconButton
            size="small"
            className="hover:text-red-500"
            onClick={openDialogAction.toggle}
          >
            <VscTrash size={16} />
          </IconButton>
        </Tooltip>
      )}
      {open && (
        <UserDeleteConfirmDialog
          id={user.id}
          onClose={openDialogAction.setLeft}
        />
      )}
    </span>
  );
}
