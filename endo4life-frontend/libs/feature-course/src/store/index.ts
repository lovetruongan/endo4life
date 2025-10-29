import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { courseReducer } from './course/course.slice';
import { courseLecturesReducer } from './course-lectures/course-lectures.slice';
import { courseTestsReducer } from './course-tests/course-tests.slice';
import { courseQuestionsReducer } from './course-questions/course-questions.slice';

export const store = configureStore({
  reducer: {
    course: courseReducer,
    lectures: courseLecturesReducer,
    tests: courseTestsReducer,
    questions: courseQuestionsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore File objects in these action paths
        ignoredActions: [
          'course-questions/updateEditingQuestion',
          'course-questions/addCourseQuestion',
          'course-questions/updateCourseQuestion',
          'course-questions/addCourseQuestions',
        ],
        // Ignore File objects in these state paths (File objects from image uploads)
        ignoredPaths: [
          'questions.editingQuestion.image.file',
          'questions.questions',
        ],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
