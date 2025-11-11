import {
  VscAdd,
  VscArrowRight,
  VscCloudUpload,
  VscSave,
} from 'react-icons/vsc';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  selectCourseTest,
  selectCourseTestQuestions,
} from '../../store/course-tests/course-tests.selectors';
import { selectEditingQuestion } from '../../store/course-questions/course-questions.selectors';
import {
  EditableQuestionCard,
  IQuestionEntity,
  QuestionCard,
  QuestionTypeEnum,
} from '@endo4life/feature-test';
import {
  selectCourseQuestion,
  updateEditingQuestion,
} from '../../store/course-questions/course-questions.slice';
import { CourseTestTypeEnum } from '../../types';
import { addNewCourseQuestionAsync } from '../../store/course-tests/thunks/add-new-course-question.thunk';
import { duplicateCourseQuestionAsync } from '../../store/course-tests/thunks/duplicate-course-question.thunk';
import { deleteCourseQuestionAsync } from '../../store/course-tests/thunks/delete-course-question.thunk';
import { Button } from '@endo4life/ui-common';
import { saveCourseTestAsync } from '../../store/course-tests/thunks/save-course-test.thunk';
import { useState } from 'react';
import { toast } from 'react-toastify';

interface Props {
  courseId: string;
  type: CourseTestTypeEnum;
  testId?: string;
}
export function CourseTest({ courseId, type, testId }: Props) {
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState(false);
  const courseTest = useAppSelector(selectCourseTest(courseId, type, testId));
  const questions = useAppSelector(
    selectCourseTestQuestions(courseId, type, testId),
  );
  const editingQuestion = useAppSelector(selectEditingQuestion);

  const handleSelectQuestion = (question: IQuestionEntity) => {
    dispatch(selectCourseQuestion(question.id));
  };

  const handleSaveTest = async () => {
    if (!courseTest) return;
    
    // Validate: Check if all multiple choice questions have at least one correct answer
    const invalidQuestions: IQuestionEntity[] = [];
    const allQuestions = editingQuestion 
      ? [...questions.filter(q => q.id !== editingQuestion.id), editingQuestion]
      : questions;
    
    for (const question of allQuestions) {
      if (!question || question.isDeleted) continue;
      
      // Only validate SINGLE_CHOICE and MULTIPLE_CHOICE questions
      if (
        question.type === QuestionTypeEnum.SINGLE_CHOICE ||
        question.type === QuestionTypeEnum.MULTIPLE_CHOICE
      ) {
        const hasCorrectAnswer = question.answers?.some(
          (answer) => answer.isCorrect === true
        );
        
        if (!hasCorrectAnswer) {
          invalidQuestions.push(question);
        }
      }
    }
    
    if (invalidQuestions.length > 0) {
      toast.error(
        `Vui lòng chọn ít nhất 1 đáp án đúng cho ${invalidQuestions.length} câu hỏi trắc nghiệm!`,
        {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
        }
      );
      setSaving(false);
      return;
    }
    
    try {
      setSaving(true);
      await dispatch(saveCourseTestAsync({ testId: courseTest.id }));
      toast.success('Lưu thành công!', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: true,
      });
    } catch (error) {
      toast.error('Lưu thất bại!', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddNewQuestion = () => {
    if (!courseTest) return;

    dispatch(addNewCourseQuestionAsync({ testId: courseTest.id }));
  };

  const handleOnChange = (question: IQuestionEntity) => {
    dispatch(updateEditingQuestion(question));
  };

  const handleDuplicateQuestion = (question: IQuestionEntity) => {
    if (!courseTest) return;
    dispatch(
      duplicateCourseQuestionAsync({
        testId: courseTest.id,
        question,
      }),
    );
  };

  const handleDeleteQuestion = (question: IQuestionEntity) => {
    if (!courseTest) return;
    dispatch(
      deleteCourseQuestionAsync({
        testId: courseTest.id,
        questionId: question.id,
      }),
    );
  };

  return (
    <div className="relative flex flex-col h-full min-h-0">
      <div className="flex-1 pb-24 overflow-y-auto min-h-0">
        {questions.length === 0 && (
          <div className="p-4 text-center">
            <div className="flex items-center justify-center">
              <img src="/images/empty.jpg" width={120} />
            </div>
            <div className="flex items-center gap-2 justify-center">
              <div>Chưa có câu hỏi nào!</div>
              <Button
                variant="text"
                text="tạo ngay"
                className="text-primary"
                onClick={handleAddNewQuestion}
                endIcon={<VscArrowRight size={18} className="text-primary" />}
              />
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 p-4">
          {questions.map((question) => {
            if (!question || question.isDeleted) return null;
            return (
              <div
                key={question.id}
                onClick={(evt) => {
                  if (question.id !== editingQuestion?.id) {
                    handleSelectQuestion(question);
                    evt.preventDefault();
                    evt.stopPropagation();
                  }
                }}
              >
                {question?.id !== editingQuestion?.id && (
                  <QuestionCard data={question} />
                )}
                {question?.id === editingQuestion?.id && (
                  <EditableQuestionCard
                    onChange={handleOnChange}
                    onDuplicate={handleDuplicateQuestion}
                    onDelete={handleDeleteQuestion}
                    data={editingQuestion}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="absolute flex items-center gap-4 transform -translate-x-1/2 bottom-4 left-1/2">
        <Button
          className="min-w-40 min-h-10"
          onClick={handleSaveTest}
          text="Lưu"
          disabled={saving}
          requesting={saving}
        >
          <VscSave />
        </Button>
        <button
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border rounded-lg shadow border-slate-300 flex-none"
          onClick={handleAddNewQuestion}
        >
          <VscAdd />
          <span>Thêm mới</span>
        </button>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border rounded-lg shadow border-slate-300 flex-none">
          <VscCloudUpload />
          <span>Nhập khẩu</span>
        </button>
      </div>
    </div>
  );
}
