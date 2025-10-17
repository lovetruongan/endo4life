import { useTranslation } from 'react-i18next';
import { useUserDelete } from '../../hooks';
import { useCallback, useState } from 'react';
import { Modal } from '@mui/material';
import { Button } from '@endo4life/ui-common';
import clsx from 'clsx';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface Props {
  id: string;
  onClose(): void;
  onCloseConfirmDeleteDialog(): void;
}
export function UserDeleteConfirmPassword({
  id,
  onClose,
  onCloseConfirmDeleteDialog,
}: Props) {
  const { t } = useTranslation(["common", "user"]);
  const { mutation } = useUserDelete();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const deleteUser = useCallback(async () => {
    if (!id) {
      toast.error(t("user:deleteForm.invalidUserId"), {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: true,
      });
      return;
    }
    if (!password) {
      toast.error(t("user:deleteForm.mustNotBlankPassword"), {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: true,
      });
      return;
    }
    mutation.mutate(
      { id: id, password },
      {
        onSuccess(data, variables, context) {
          toast.success(t("user:deleteForm.successfullyDeleteUser"), {
            position: 'top-right',
            autoClose: 2000,
            hideProgressBar: true,
          });
          setTimeout(() => {
            navigate(ADMIN_WEB_ROUTES.USERS);
            onClose();
            onCloseConfirmDeleteDialog();
          }, 3000);
        },
        onError(error, variables, context) {
          toast.error(t("user:deleteForm.unsuccessfullyDeleteUser"), {
            position: 'top-right',
            autoClose: 2000,
            hideProgressBar: true,
          });
        },
      }
    );
  }, [mutation, onClose, id, navigate, onCloseConfirmDeleteDialog, password, t]);
  
  return (
    <Modal
      open
      onClose={() => {
        if (!mutation.isLoading) onClose();
      }}
      className={clsx({
        'flex items-start justify-center py-20': true,
        'pointer-events-none': mutation.isLoading,
      })}
    >
      <section className="w-full max-w-xl bg-white rounded-lg shadow">
        <header className="flex items-center gap-4 px-4 py-3">
          <h2 className="flex-auto pt-4 text-2xl font-semibold">
            {t('user:userDeleteAccount')} ?
          </h2>
        </header>
        <div className="px-4 pt-4">
          <p>{t("user:deleteForm.passwordRequiredToDelete")}</p>
        </div>
        <div className="flex flex-col w-full p-4">
          <label htmlFor="password" className="mb-2 text-gray-700">
            {t("user:basicInfo.password")} <span className="text-red-500">*</span>
          </label>
          <div className="relative flex items-center">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              className="w-full px-4 py-3 text-gray-700 placeholder-gray-400 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t("user:accountSecurity.passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              onClick={togglePasswordVisibility}
              className="absolute text-gray-500 cursor-pointer right-3"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-4 pb-4">
          <Button
            text={t("common:txtConfirm")}
            type="submit"
            variant="fill"
            requesting={mutation.isLoading}
            disabled={mutation.isLoading}
            className="px-5 py-4 text-sm font-bold bg-red-700"
            onClick={deleteUser}
          />
          <Button
            onClick={(evt) => {
              evt.preventDefault();
              evt.stopPropagation();
              onClose();
            }}
            text={t('common:txtCancel')}
            className="px-5 py-4 text-sm font-bold text-black border-gray-200 hover:bg-opacity-70"
            variant="outline"
          />
        </div>
      </section>
    </Modal>
  );
}

export default UserDeleteConfirmPassword;
