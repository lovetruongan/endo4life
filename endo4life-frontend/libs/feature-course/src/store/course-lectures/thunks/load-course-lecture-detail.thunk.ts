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
    
    console.log('loadCourseLectureDetailAsync - raw data:', {
      hasDto: !!dto,
      hasTestDetailDto: !!testDetailDto,
      testDetailDto,
      questionsCount: testDetailDto?.questions?.length || 0,
    });
    
    if (testDetailDto) {
      test = new CourseTestMapper().fromDto(testDetailDto);
      test.courseSectionId = lectureId;
      console.log('loadCourseLectureDetailAsync - mapped test:', {
        testId: test.id,
        questionIds: test.questionIds,
        metadata: test.metadata,
      });
    } else {
      const builder = new CourseTestBuilder(
        courseId,
        CourseTestTypeEnum.LECTURE_REVIEW_QUESTIONS_COURSE,
      )
        .setCourseSectionId(lectureId)
        .setTitle(lecture?.title);
      test = builder.build();
      console.log('loadCourseLectureDetailAsync - created draft test');
    }

    const questions = await getAllQuestions([test]);
    console.log('loadCourseLectureDetailAsync - getAllQuestions result:', {
      questionsCount: questions.length,
      questions: questions.map(q => ({ id: q.id, type: q.type, answersCount: q.answers?.length })),
    });
    
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
