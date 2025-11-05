import { useState } from 'react';
import { StudentTestDto, TestResultDto, SubmittedAnswerDto } from '../../api/student-test-api';
import { StudentQuestionCard } from './StudentQuestionCard';
import { TestProgressBar } from './TestProgressBar';
import { TestResultModal } from './TestResultModal';
import { MdArrowBack, MdArrowForward } from 'react-icons/md';
import { RichTextContent } from '@endo4life/feature-richtext-editor';
import { stringToRichText } from '@endo4life/util-common';

interface StudentTestContainerProps {
  test: StudentTestDto;
  userInfoId: string;
  onSubmit: (answers: SubmittedAnswerDto[]) => Promise<TestResultDto>;
  onClose?: () => void;
  onTestComplete?: (result: TestResultDto) => void;
  showAllQuestions?: boolean;
}

export function StudentTestContainer({
  test,
  userInfoId,
  onSubmit,
  onClose,
  onTestComplete,
  showAllQuestions = false,
}: StudentTestContainerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string[]>>(new Map());
  const [essayAnswers, setEssayAnswers] = useState<Map<string, string>>(new Map());
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<TestResultDto | null>(null);

  const totalQuestions = test.questions?.length || 0;
  const answeredCount = answers.size + essayAnswers.size;
  const currentQuestion = test.questions?.[currentQuestionIndex];

  const handleAnswerSelect = (questionId: string, answerId: string, selected: boolean) => {
    const question = test.questions?.find((q) => q.id === questionId);
    if (!question) return;

    setAnswers((prev) => {
      const newAnswers = new Map(prev);
      const currentAnswers = newAnswers.get(questionId) || [];

      if (question.type === 'SINGLE_CHOICE') {
        // For single choice, replace with new selection
        newAnswers.set(questionId, selected ? [answerId] : []);
      } else if (question.type === 'MULTIPLE_CHOICE') {
        // For multiple choice, toggle selection
        if (selected) {
          newAnswers.set(questionId, [...currentAnswers, answerId]);
        } else {
          newAnswers.set(
            questionId,
            currentAnswers.filter((id) => id !== answerId)
          );
        }
      }

      return newAnswers;
    });
  };

  const handleEssayChange = (questionId: string, text: string) => {
    setEssayAnswers((prev) => {
      const newAnswers = new Map(prev);
      if (text.trim()) {
        newAnswers.set(questionId, text);
      } else {
        newAnswers.delete(questionId);
      }
      return newAnswers;
    });
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmitTest = async () => {
    if (answeredCount < totalQuestions) {
      const unanswered = totalQuestions - answeredCount;
      if (
        !window.confirm(
          `You have ${unanswered} unanswered question(s). Do you want to submit anyway?`
        )
      ) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const submissionAnswers: SubmittedAnswerDto[] = [];
      test.questions?.forEach((question) => {
        const isEssay = question.type === 'FREE_TEXT';
        if (isEssay) {
          const essayText = essayAnswers.get(question.id) || '';
          submissionAnswers.push({
            questionId: question.id,
            selectedAnswers: essayText ? [essayText] : [],
          });
        } else {
          submissionAnswers.push({
            questionId: question.id,
            selectedAnswers: answers.get(question.id) || [],
          });
        }
      });

      const testResult = await onSubmit(submissionAnswers);
      setResult(testResult);
      if (onTestComplete) {
        onTestComplete(testResult);
      }
    } catch (error) {
      console.error('Failed to submit test:', error);
      alert('Failed to submit test. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetakeTest = () => {
    setAnswers(new Map());
    setCurrentQuestionIndex(0);
    setResult(null);
  };

  const handleCloseResult = () => {
    if (onClose) {
      onClose();
    } else {
      setResult(null);
    }
  };

  if (result) {
    return (
      <TestResultModal
        result={result}
        onClose={handleCloseResult}
        onRetake={handleRetakeTest}
        onContinue={result.passed ? onClose : undefined}
        showRetake={!result.passed}
        showContinue={result.passed}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{test.title}</h1>
            {test.description && (
              <RichTextContent className="text-gray-600 mt-1" value={stringToRichText(test.description)} />
            )}
            <p className="text-sm text-gray-500 mt-2">
              Passing Score: {test.passingScore}%
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
            >
              Exit
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {!showAllQuestions && (
        <TestProgressBar
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={totalQuestions}
          answeredCount={answeredCount}
        />
      )}

      {/* Questions */}
      <div className="flex-1 overflow-y-auto p-6">
        {showAllQuestions ? (
          <div className="space-y-6 max-w-4xl mx-auto">
            {test.questions?.map((question, index) => (
              <StudentQuestionCard
                key={question.id}
                question={question}
                questionNumber={index + 1}
                selectedAnswers={answers.get(question.id) || []}
                onAnswerSelect={(answerId, selected) =>
                  handleAnswerSelect(question.id, answerId, selected)
                }
                essayText={essayAnswers.get(question.id) || ''}
                onEssayChange={(text) => handleEssayChange(question.id, text)}
                disabled={submitting}
              />
            ))}
          </div>
        ) : (
          currentQuestion && (
            <div className="max-w-4xl mx-auto">
              <StudentQuestionCard
                question={currentQuestion}
                questionNumber={currentQuestionIndex + 1}
                selectedAnswers={answers.get(currentQuestion.id) || []}
                onAnswerSelect={(answerId, selected) =>
                  handleAnswerSelect(currentQuestion.id, answerId, selected)
                }
                essayText={essayAnswers.get(currentQuestion.id) || ''}
                onEssayChange={(text) => handleEssayChange(currentQuestion.id, text)}
                disabled={submitting}
              />
            </div>
          )
        )}
      </div>

      {/* Navigation Footer */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {!showAllQuestions && (
            <>
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed font-medium"
              >
                <MdArrowBack size={20} />
                Previous
              </button>

              <div className="flex items-center gap-3">
                {currentQuestionIndex < totalQuestions - 1 ? (
                  <button
                    onClick={handleNextQuestion}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                  >
                    Next
                    <MdArrowForward size={20} />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitTest}
                    disabled={submitting}
                    className="px-8 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Submit Test'}
                  </button>
                )}
              </div>
            </>
          )}

          {showAllQuestions && (
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-gray-600">
                {answeredCount} of {totalQuestions} questions answered
              </div>
              <button
                onClick={handleSubmitTest}
                disabled={submitting}
                className="px-8 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Test'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

