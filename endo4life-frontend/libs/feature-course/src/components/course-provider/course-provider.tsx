import {
  createContext,
  Fragment,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { Provider } from 'react-redux';
import { store, useAppDispatch, useAppSelector } from '../../store';
import { loadCourseAsync } from '../../store/course/thunks/load-course.thunk';
import { useParams } from 'react-router-dom';
import {
  selectCourseIsLoading,
  selectCourseIsSaving,
} from '../../store/course/course.selectors';
import { CircularProgress } from '@mui/material';
import { ICourseEntity } from '../../types';
import { useCourseGetById } from '../../hooks';
import { localUuid } from '@endo4life/util-common';

interface CourseState {
  loading?: boolean;
  data?: ICourseEntity;
}

const CourseContext = createContext({} as CourseState);

export const useCourseContext = () => {
  return useContext(CourseContext);
};

interface Props {
  children?: ReactNode;
}
export function CourseProvider({ children }: Props) {
  const { id: courseId = localUuid() } = useParams<{ id: string }>();
  const { loading, data } = useCourseGetById(courseId);
  const state = useMemo<CourseState>(() => {
    return { loading, data };
  }, [loading, data]);

  return (
    <CourseContext.Provider value={state}>
      <Provider store={store}>
        <Main>{children}</Main>
      </Provider>
    </CourseContext.Provider>
  );
}

function Main({ children }: Props) {
  const { id: courseId = '' } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectCourseIsLoading);
  const isSaving = useAppSelector(selectCourseIsSaving);

  useEffect(() => {
    dispatch(loadCourseAsync({ courseId }));
  }, [courseId, dispatch]);

  // useEffect(() => {
  //   const handleBeforeUnload = (evt: any) => {
  //     evt.preventDefault();
  //     evt.stopPropagation();
  //     evt.returnValue = '';
  //     return '';
  //   };

  //   window.addEventListener('beforeunload', handleBeforeUnload);
  //   return () => {
  //     window.removeEventListener('beforeunload', handleBeforeUnload);
  //   };
  // }, []);

  if (isLoading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <Fragment>
      {!isLoading && children}
      {isSaving && (
        <div className="fixed w-screen h-screen left-0 top-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
          <div className="flex items-center gap-4 text-white">
            <CircularProgress size={20} sx={{ color: 'inherit' }} />
            <span>Đang lưu dữ liệu...</span>
          </div>
        </div>
      )}
      {/* {blocker.state === 'blocked' ? (
        <div className="fixed w-screen h-screen left-0 top-0 z-50 flex justify-center items-start bg-black bg-opacity-20">
          <div className="bg-white rounded p-4 w-full max-w-lg mt-14 space-y-4">
            <div className="flex items-center gap-4">
              <h2 className="font-semibold text-lg flex-auto">
                Rời khỏi trang?
              </h2>
              <IconButton size="small" onClick={() => blocker.reset()}>
                <VscClose />
              </IconButton>
            </div>
            <p className="pb-6">
              Các thay đổi bạn đã thực hiện có thể không được lưu.
            </p>
            <div className="flex items-center justify-end gap-4">
              <button
                className="px-4 py-2 text-sm rounded-full bg-primary text-white"
                onClick={() => blocker.proceed()}
              >
                Rời khỏi
              </button>
              <button
                className="px-4 py-2 text-sm rounded"
                onClick={() => blocker.reset()}
              >
                Huỷ
              </button>
            </div>
          </div>
        </div>
      ) : null} */}
    </Fragment>
  );
}
