import {
  CourseTest,
  CourseTestTypeEnum,
} from '@endo4life/feature-course';
import clsx from 'clsx';
import { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

export function CourseRequiredTestsPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const type = useMemo(() => {
    const item = searchParams.get('type');
    return item || CourseTestTypeEnum.ENTRANCE_TEST_COURSE;
  }, [searchParams]);

  const selectTab = (tabId: CourseTestTypeEnum) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('type', tabId.toString()), setSearchParams(newParams);
  };

  return (
    <div className="flex flex-col h-full p-2 overflow-hidden bg-white border rounded-lg border-slate-100">
      <div className="flex items-center flex-none gap-2 p-2">
        <button
          onClick={() => selectTab(CourseTestTypeEnum.ENTRANCE_TEST_COURSE)}
          className={clsx('px-4 py-2 text-sm rounded-full font-medium', {
            'text-white bg-primary':
              type === CourseTestTypeEnum.ENTRANCE_TEST_COURSE,
          })}
        >
          Kiểm tra đầu vào
        </button>
        <button
          onClick={() => selectTab(CourseTestTypeEnum.SURVEY_COURSE)}
          className={clsx('px-4 py-2 text-sm rounded-full font-medium', {
            'text-white bg-primary': type === CourseTestTypeEnum.SURVEY_COURSE,
          })}
        >
          Khảo sát
        </button>
      </div>
      <div className="flex flex-col flex-auto min-h-0">
        {id && type === CourseTestTypeEnum.ENTRANCE_TEST_COURSE && (
          <CourseTest
            courseId={id}
            type={CourseTestTypeEnum.ENTRANCE_TEST_COURSE}
          />
        )}
        {id && type === CourseTestTypeEnum.SURVEY_COURSE && (
          <CourseTest courseId={id} type={CourseTestTypeEnum.SURVEY_COURSE} />
        )}
      </div>
    </div>
  );

  // const [selectedQuestionId, setSelectedQuestionId] = useState('');
  // const [questions, setQuestions] = useState<IQuestionEntity[]>([
  //   {
  //     id: '1',
  //     type: QuestionTypeEnum.MULTIPLE_CHOICE,
  //     content: new RichtextBuilder(
  //       'Bạn mong muốn đạt được điều gì sau khi hoàn thành khóa học này?',
  //     ).build(),
  //     answers: [
  //       {
  //         id: 'answer-1',
  //         content: new RichtextBuilder(
  //           'Nâng cao kỹ năng thực hành nội soi dạ dày',
  //         ).build(),
  //       },
  //       {
  //         id: 'answer-2',
  //         content: new RichtextBuilder(
  //           'Hiểu rõ hơn về các thiết bị nội soi hiện đại',
  //         ).build(),
  //       },
  //       {
  //         id: 'answer-3',
  //         content: new RichtextBuilder(
  //           'Học cách xử lý các biến chứng trong nội soi',
  //         ).build(),
  //       },
  //     ],
  //   },

  //   {
  //     id: '2',
  //     type: QuestionTypeEnum.SINGLE_CHOICE,
  //     content: new RichtextBuilder(
  //       'Bạn mong muốn đạt được điều gì sau khi hoàn thành khóa học này?',
  //     ).build(),
  //     answers: [
  //       {
  //         id: 'answer-1',
  //         content: new RichtextBuilder(
  //           'Nâng cao kỹ năng thực hành nội soi dạ dày',
  //         ).build(),
  //       },
  //       {
  //         id: 'answer-2',
  //         content: new RichtextBuilder(
  //           'Hiểu rõ hơn về các thiết bị nội soi hiện đại',
  //         ).build(),
  //       },
  //       {
  //         id: 'answer-3',
  //         content: new RichtextBuilder(
  //           'Học cách xử lý các biến chứng trong nội soi',
  //         ).build(),
  //       },
  //     ],
  //   },
  //   {
  //     id: '3',
  //     type: QuestionTypeEnum.FREE_TEXT,
  //     content: new RichtextBuilder(
  //       'Bạn mong muốn đạt được điều gì sau khi hoàn thành khóa học này?',
  //     ).build(),
  //   },
  // ]);
  // const handleSelectAnswer = (
  //   question: IQuestionEntity,
  //   answer: IAnswerEntity,
  // ) => {
  //   setQuestions((previousQuestions) => {
  //     return previousQuestions.map((previousQuestion) => {
  //       if (question.id !== previousQuestion.id) {
  //         return previousQuestion;
  //       }
  //       return {
  //         ...question,
  //         answers: question.answers?.map((item) => {
  //           if (question.type === QuestionTypeEnum.MULTIPLE_CHOICE) {
  //             if (item.id === answer.id) {
  //               return {
  //                 ...item,
  //                 isCorrect: !item.isCorrect,
  //               };
  //             }
  //             return item;
  //           }
  //           return { ...item, isCorrect: item.id === answer.id };
  //         }),
  //       };
  //     });
  //   });
  // };
  // const handleOnChange = (question: IQuestionEntity) => {
  //   setQuestions((pre) => {
  //     return pre.map((item) => {
  //       if (item.id === question.id) {
  //         return question;
  //       }
  //       return item;
  //     });
  //   });
  // };
  // return (
  //   <div className="h-full p-2 bg-white border rounded-lg border-slate-100">
  //     <Button
  //       onClick={(e) => {
  //         e.preventDefault();
  //         e.stopPropagation();
  //         navigate(
  //           ROUTES.COURSE_DETAIL_REQUIRED_TESTS_DETAIL.replace(
  //             ':testId',
  //             'your_test_id',
  //           ),
  //         );
  //       }}
  //     >
  //       to test detail (/courses/:id/required-tests/:testId)
  //     </Button>
  //     <div className="grid grid-cols-1 gap-4 p-4">
  //       {questions.map((question) => (
  //         <div
  //           key={question.id}
  //           onClick={(evt) => {
  //             if (question.id !== selectedQuestionId) {
  //               setSelectedQuestionId(question.id.toString());
  //               evt.preventDefault();
  //               evt.stopPropagation();
  //             }
  //           }}
  //         >
  //           {question.id !== selectedQuestionId && (
  //             <QuestionCard onSelect={handleSelectAnswer} data={question} />
  //           )}
  //           {question.id === selectedQuestionId && (
  //             <EditableQuestionCard onChange={handleOnChange} data={question} />
  //           )}
  //         </div>
  //       ))}
  //     </div>
  //   </div>
  // );
}
