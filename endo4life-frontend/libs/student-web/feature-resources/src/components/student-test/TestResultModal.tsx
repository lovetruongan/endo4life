import { TestResultDto } from '../../api/student-test-api';
import { MdCheckCircle, MdCancel, MdClose } from 'react-icons/md';
import { RichTextContent } from '@endo4life/feature-richtext-editor';
import { stringToRichText } from '@endo4life/util-common';

interface TestResultModalProps {
  result: TestResultDto;
  onClose: () => void;
  onRetake?: () => void;
  onContinue?: () => void;
  showRetake?: boolean;
  showContinue?: boolean;
}

export function TestResultModal({
  result,
  onClose,
  onRetake,
  onContinue,
  showRetake = true,
  showContinue = true,
}: TestResultModalProps) {
  const passed = result.passed;
  const scorePercentage = result.score;

  const toRich = (value: unknown) => {
    if (!value) return undefined;
    if (typeof value === 'string') return stringToRichText(value);
    if (typeof value === 'object') {
      const anyVal: any = value as any;
      if (typeof anyVal.content === 'string') return stringToRichText(anyVal.content);
      try {
        if (Object.prototype.hasOwnProperty.call(anyVal, 'root')) {
          return { content: JSON.stringify(anyVal) } as any;
        }
      } catch {}
      return stringToRichText(String(anyVal));
    }
    return undefined;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Test Results</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Score Summary */}
        <div className="p-6">
          <div
            className={`rounded-lg p-6 mb-6 ${
              passed
                ? 'bg-green-50 border-2 border-green-500'
                : 'bg-red-50 border-2 border-red-500'
            }`}
          >
            <div className="flex items-center justify-center mb-4">
              {passed ? (
                <MdCheckCircle className="text-green-600" size={64} />
              ) : (
                <MdCancel className="text-red-600" size={64} />
              )}
            </div>
            <div className="text-center">
              <h3
                className={`text-3xl font-bold mb-2 ${
                  passed ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {passed ? 'Congratulations!' : 'Try Again'}
              </h3>
              <p
                className={`text-lg mb-4 ${
                  passed ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {passed
                  ? 'You have passed the test!'
                  : 'You did not pass this time. Keep learning and try again!'}
              </p>
              <div className="flex items-center justify-center gap-8 text-center">
                <div>
                  <p className="text-4xl font-bold text-gray-900">
                    {scorePercentage}%
                  </p>
                  <p className="text-sm text-gray-600">Your Score</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-gray-900">
                    {result.correctCount}/{result.totalQuestions}
                  </p>
                  <p className="text-sm text-gray-600">Correct Answers</p>
                </div>
              </div>
            </div>
          </div>

          {/* Question Results */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              Question Breakdown:
            </h4>
            {result.questions?.map((questionResult, index) => (
              <div
                key={questionResult.questionId}
                className={`p-4 rounded-lg border ${
                  questionResult.correct
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      questionResult.correct
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-2">
                      <RichTextContent value={toRich(questionResult.question.title)} />
                    </div>
                    <div className="text-sm space-y-2">
                      <div>
                        <span className="font-medium">Your answer:</span>
                        <div
                          className={`mt-1 ${
                            questionResult.correct
                              ? 'text-green-700'
                              : 'text-red-700'
                          }`}
                        >
                          {questionResult.selectedAnswers.length > 0 ? (
                            <div className="space-y-1">
                              {questionResult.selectedAnswers.map((aid, idx) => {
                                const answer = questionResult.question.answers.find(
                                  (a) => a.id === aid
                                );
                                if (!answer) return <span key={aid}>Unknown</span>;
                                const content = (answer as any).content;
                                return (
                                  <div key={aid} className="flex items-start gap-1">
                                    {questionResult.selectedAnswers.length > 1 && (
                                      <span>{idx + 1}. </span>
                                    )}
                                    <RichTextContent value={toRich(content)} />
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <span>No answer</span>
                          )}
                        </div>
                      </div>
                      {!questionResult.correct && (
                        <div>
                          <span className="font-medium">Correct answer:</span>
                          <div className="text-green-700 mt-1">
                            <div className="space-y-1">
                              {questionResult.correctAnswers.map((aid, idx) => {
                                const answer = questionResult.question.answers.find(
                                  (a) => a.id === aid
                                );
                                if (!answer) return <span key={aid}>Unknown</span>;
                                const content = (answer as any).content;
                                return (
                                  <div key={aid} className="flex items-start gap-1">
                                    {questionResult.correctAnswers.length > 1 && (
                                      <span>{idx + 1}. </span>
                                    )}
                                    <RichTextContent value={toRich(content)} />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {questionResult.correct ? (
                      <MdCheckCircle className="text-green-600" size={24} />
                    ) : (
                      <MdCancel className="text-red-600" size={24} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          {!passed && showRetake && onRetake && (
            <button
              onClick={onRetake}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Retake Test
            </button>
          )}
          {passed && showContinue && onContinue && (
            <button
              onClick={onContinue}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              Continue
            </button>
          )}
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

