import { ActionReducerMapBuilder, createAsyncThunk } from '@reduxjs/toolkit';
import { CourseLecturesState } from '../course-lectures.state';
import { CourseSectionApiImpl } from '@endo4life/feature-course-section';
import { CourseTestMapper, getAllQuestions } from '../../../api';
import { ResponseDetailCourseSectionDto } from '@endo4life/data-access';
import { addCourseTests } from '../../course-tests/course-tests.slice';
import { addCourseQuestions } from '../../course-questions/course-questions.slice';
import { RootState } from '../..';
import { selectCourseLectureDetailById } from '../course-lectures.selectors';
import { selectCourseTestByLectureId } from '../../course-tests/course-tests.selectors';
import { CourseTestBuilder, CourseTestTypeEnum } from '../../../types';
interface ILoadCourseInfoPayload {
  lectureId: string;
  courseId: string;
  forceReload?: boolean;
}

export const loadCourseLectureDetailAsync = createAsyncThunk(
  'course-lectures/loadCourseLectureDetailAsync',
  async (
    { lectureId, courseId, forceReload }: ILoadCourseInfoPayload,
    { dispatch, getState },
  ) => {
    if (!lectureId || !courseId) return null;
    const state = getState() as RootState;
    let lectureDetail = selectCourseLectureDetailById(lectureId)(state);
    let test = selectCourseTestByLectureId(lectureId)(state);
    if (lectureDetail && !forceReload) return null;

    const lecture = await new CourseSectionApiImpl().getCourseSectionById(
      lectureId,
    );

    const dto = lecture?.metadata as ResponseDetailCourseSectionDto;
    const testDetailDto = dto?.lectureReviewQuestionsDto;
    if (testDetailDto) {
      test = new CourseTestMapper().fromDto(testDetailDto);
      test.courseSectionId = lectureId;
    } else {
      const builder = new CourseTestBuilder(
        courseId,
        CourseTestTypeEnum.LECTURE_REVIEW_QUESTIONS_COURSE,
      )
        .setCourseSectionId(lectureId)
        .setTitle(lecture?.title);
      test = builder.build();
    }

    const questions = await getAllQuestions([test]);
    dispatch(addCourseTests([test]));
    dispatch(addCourseQuestions(questions));
    return { lecture, test };
  },
);

export const loadCourseLectureDetailBuilder = (
  builder: ActionReducerMapBuilder<CourseLecturesState>,
) => {
  return builder.addCase(
    loadCourseLectureDetailAsync.fulfilled,
    (state, action) => {
      if (action.payload) {
        const { lecture } = action.payload;
        if (lecture) {
          state.lectureDetails[lecture.id] = lecture;
        }
      }
    },
  );
};
