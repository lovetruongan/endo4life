import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import { Modal } from '@mui/material';
import { Button } from '@endo4life/ui-common';
import clsx from 'clsx';
import { toast } from 'react-toastify';
import { useDeleteCourseSections } from '../../hooks';
import { ICourseSectionEntity } from '../../types';

interface Props {
  courseSections: ICourseSectionEntity[] | undefined;
  onClose(): void;
}
export function CourseSectionDeleteMultipleConfirmDialog({
  courseSections,
  onClose,
}: Props) {
  const { t } = useTranslation('course');
  const { mutation } = useDeleteCourseSections();

  const handleDelete = useCallback(() => {
    if (courseSections && courseSections.length > 0) {
      mutation.mutate(
        courseSections.map((course) => course.id),
        {
          onSuccess: () => {
            toast.success(t('Xóa các bài giảng thành công'));
            onClose();
          },

          onError: (error) => {
            toast.error(t('Lỗi khi xóa các bài giảng'));
            console.error('Delete courses Error:', error);
          },
        }
      );
    }
  }, [mutation, courseSections, t, onClose]);

  const handleOnCancel = useCallback(
    (evt: React.MouseEvent<Element, MouseEvent>) => {
      evt.preventDefault();
      evt.stopPropagation();
      onClose();
    },
    [onClose]
  );

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
      <section className="w-full max-w-xl px-6 py-6 bg-white rounded-lg shadow">
        <header className="flex items-center gap-4">
          <h2 className="flex-auto text-2xl font-semibold">Xoá ảnh</h2>
        </header>
        <div className="py-4 space-y-2">
          <p>
            Bạn có chắc muốn xóa {courseSections?.length} bài giảng này?
            <br />
            Những bài giảng đã xoá sẽ không thể khôi phục lại.{' '}
          </p>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button
            text={t('common:txtConfirm')}
            type="submit"
            variant="fill"
            requesting={mutation.isLoading}
            disabled={mutation.isLoading}
            className="px-6 py-3 text-sm font-bold bg-red-700"
            onClick={handleDelete}
          />
          <Button
            onClick={(evt) => handleOnCancel(evt)}
            text={t('common:txtCancel')}
            className="px-6 py-3 text-sm font-bold text-black border-gray-200 hover:bg-opacity-70"
            variant="outline"
          />
        </div>
      </section>
    </Modal>
  );
}
