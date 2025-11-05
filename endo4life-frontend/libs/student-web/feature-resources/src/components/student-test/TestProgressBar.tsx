interface TestProgressBarProps {
  currentQuestion: number;
  totalQuestions: number;
  answeredCount: number;
}

export function TestProgressBar({
  currentQuestion,
  totalQuestions,
  answeredCount,
}: TestProgressBarProps) {
  const progressPercentage = (answeredCount / totalQuestions) * 100;

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">
            Question {currentQuestion} of {totalQuestions}
          </span>
          <span className="text-sm text-gray-600">
            {answeredCount} answered
          </span>
        </div>
        <span className="text-sm font-medium text-gray-700">
          {Math.round(progressPercentage)}% Complete
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}

