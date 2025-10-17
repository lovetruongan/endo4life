import { useNavigate } from 'react-router-dom';
import { IconButton, Tooltip } from '@mui/material';
import { VscArrowLeft } from 'react-icons/vsc';
import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';
import { Button } from '@endo4life/ui-common';
import { AiFillEye, AiOutlineGlobal } from 'react-icons/ai';
import { useAppDispatch, useAppSelector } from '../../store';
import { saveCourseAsync } from '../../store/course/thunks/save-course.thunk';
import { completeEditingQuestion } from '../../store/course-questions/course-questions.slice';
import { loadCourseAsync } from '../../store/course/thunks/load-course.thunk';
import { isLocalUuid } from '@endo4life/util-common';
import { useCourseContext } from '../course-provider/course-provider';

export function CourseHeader() {
  const { data } = useCourseContext();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const onClickSave = async () => {
    if (!data?.id) return;
    dispatch(completeEditingQuestion());
    await dispatch(saveCourseAsync({ courseId: data.id }));
    await dispatch(loadCourseAsync({ courseId: data.id }));
  };

  const isCreateNew = isLocalUuid(data?.id || '');

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-5 flex-auto">
        <Tooltip title="Trở về" className="text-black flex-none">
          <IconButton
            size="medium"
            className="text-black flex-none"
            onClick={(evt) => {
              evt.preventDefault();
              evt.stopPropagation();
              navigate(ADMIN_WEB_ROUTES.COURSES);
            }}
          >
            <VscArrowLeft size={18} />
          </IconButton>
        </Tooltip>
        {!isCreateNew && (
          <span className="text-lg font-semibold flex-auto">{data?.title}</span>
        )}
        {isCreateNew && (
          <span className="text-lg font-semibold flex-auto">
            Thêm khoá học mới
          </span>
        )}
      </div>
      <div className="flex gap-3 flex-none">
        {/* {!isCreateNew && (
          <Button
            variant="outline"
            className="min-w-24"
            onClick={(evt) => {
              evt.preventDefault();
              evt.stopPropagation();
              navigate(ADMIN_WEB_ROUTES.COURSES);
            }}
          >
            Huỷ
          </Button>
        )} */}
        {!isCreateNew && (
          <>
            {/* <Button
              variant="outline"
              className="min-w-24"
              onClick={onClickSave}
            >
              Lưu nháp
            </Button> */}
            <Button
              className="min-w-24"
              variant="outline"
              startIcon={<AiFillEye />}
            >
              Xem trước
            </Button>
            <Button
              className="min-w-24"
              variant="fill"
              startIcon={<AiOutlineGlobal />}
              form="course-detail-form"
            >
              Đăng
            </Button>
          </>
        )}

        {/* {isCreateNew && (
          <Button
            requesting={isCreating}
            disabled={isCreating}
            variant="fill"
            className="px-6 py-2"
            onClick={onClickCreate}
          >
            Lưu
          </Button>
        )} */}
      </div>
    </div>
  );
}
