import {
  ICourseInfoFormData,
  useCourseCreate,
} from '@endo4life/feature-course';
import { toast } from 'react-toastify';
import { useCallback } from 'react';
import CourseInfoForm from './course-create-form';
import { useNavigate } from 'react-router-dom';
import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';
import { Button, PageHeaderUserDetail } from '@endo4life/ui-common';
import { IconButton, Tooltip } from '@mui/material';
import { VscArrowLeft } from 'react-icons/vsc';
import { useTranslation } from 'react-i18next';

export default function CourseCreatePage() {
  const { t } = useTranslation(['common', 'course']);
  const { mutation: createCourseMutation } = useCourseCreate();
  const navigate = useNavigate();

  const createCourse = useCallback(
    (values: ICourseInfoFormData) => {
      if (!values.course) {
        toast.error('Thiếu thông tin cần thiết!', {
          position: 'top-right',
          autoClose: 2000,
          hideProgressBar: true,
        });
        return;
      }
      createCourseMutation.mutate(values, {
        onSuccess(data) {
          toast.success('Tạo khoá học thành công!', {
            position: 'top-right',
            autoClose: 2000,
            hideProgressBar: true,
          });
          setTimeout(() => {
            navigate(ADMIN_WEB_ROUTES.COURSES);
          }, 1000);
        },
        onError(error) {
          console.log(error);
          toast.error('Tạo khoá học thất bại! Vui lòng thử lại.', {
            position: 'top-right',
            autoClose: 2000,
            hideProgressBar: true,
          });
        },
      });
    },
    [createCourseMutation]
  );

  return (
    <>
      <PageHeaderUserDetail
        title="Thêm mới khóa học"
        titleAction={
          <Tooltip title="Trở về" className="text-black">
            <span>
              <IconButton
                size="medium"
                className="text-black"
                disabled={createCourseMutation.isLoading}
                onClick={(evt) => {
                  evt.preventDefault();
                  evt.stopPropagation();
                  navigate(ADMIN_WEB_ROUTES.COURSES);
                }}
              >
                <VscArrowLeft size={18} />
              </IconButton>
            </span>
          </Tooltip>
        }
        leading={
          <div className="flex items-center gap-2">
            <Button
              text={t('common:txtCancel')}
              className="border-none hover:bg-opacity-70"
              variant="outline"
              onClick={(evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                navigate(ADMIN_WEB_ROUTES.COURSES);
              }}
            />
            <Button
              form="course-detail-form"
              text={t('common:txtSave')}
              className="border-none hover:bg-opacity-70"
              variant="fill"
              requesting={createCourseMutation.isLoading}
            />
          </div>
        }
      />
      <div className="justify-center inline rounded shadow">
        <CourseInfoForm
          loading={createCourseMutation.isLoading}
          onSubmit={createCourse}
        />
      </div>
    </>
  );
}
