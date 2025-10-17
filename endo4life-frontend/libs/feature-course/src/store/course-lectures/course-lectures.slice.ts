import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  CourseLecturesState,
  INITIAL_COURSE_LECTURES_STATE,
} from './course-lectures.state';
import { courseLecturesReducerBuider } from './course-lectures.thunk';
import { ICourseSectionFormData } from '@endo4life/feature-course-section';

const SLICE_NAME: string = 'course-lectures';

const slice = createSlice({
  name: SLICE_NAME,
  initialState: INITIAL_COURSE_LECTURES_STATE,
  reducers: {
    resetCourseLecturesState: (state: CourseLecturesState) => {
      Object.assign(state, INITIAL_COURSE_LECTURES_STATE);
    },
    updateCourseLectureDetail: (
      state: CourseLecturesState,
      action: PayloadAction<{
        lectureId: string;
        data: ICourseSectionFormData;
      }>,
    ) => {
      const { lectureId, data } = action.payload;
      state.lectureDetails[lectureId] = {
        ...data,
        dirty: true,
      };
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    courseLecturesReducerBuider(builder);
  },
});

export const { resetCourseLecturesState, updateCourseLectureDetail } =
  slice.actions;

export const courseLecturesReducer = slice.reducer;
