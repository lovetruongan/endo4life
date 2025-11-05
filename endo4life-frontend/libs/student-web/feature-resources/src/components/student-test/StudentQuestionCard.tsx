import { useState } from 'react';
import { StudentQuestionDto, StudentAnswerDto } from '../../api/student-test-api';
import { RichTextContent } from '@endo4life/feature-richtext-editor';
import { stringToRichText } from '@endo4life/util-common';

interface StudentQuestionCardProps {
  question: StudentQuestionDto;
  questionNumber: number;
  selectedAnswers: string[];
  onAnswerSelect: (answerId: string, selected: boolean) => void;
  onEssayChange?: (text: string) => void;
  essayText?: string;
  disabled?: boolean;
}

export function StudentQuestionCard({
  question,
  questionNumber,
  selectedAnswers,
  onAnswerSelect,
  onEssayChange,
  essayText = '',
  disabled = false,
}: StudentQuestionCardProps) {
  const isSingleChoice = question.type === 'SINGLE_CHOICE';
  const isMultipleChoice = question.type === 'MULTIPLE_CHOICE';
  const isEssay = question.type === 'FREE_TEXT';

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

  const handleAnswerClick = (answerId: string) => {
    if (disabled) return;

    if (isSingleChoice) {
      // For single choice, unselect all others and select this one
      onAnswerSelect(answerId, true);
    } else if (isMultipleChoice) {
      // For multiple choice, toggle the selection
      const isCurrentlySelected = selectedAnswers.includes(answerId);
      onAnswerSelect(answerId, !isCurrentlySelected);
    }
  };

  const renderAnswerOption = (answer: StudentAnswerDto, index: number) => {
    const isSelected = selectedAnswers.includes(answer.id);
    const inputType = isSingleChoice ? 'radio' : 'checkbox';

    return (
      <div
        key={answer.id}
        onClick={() => handleAnswerClick(answer.id)}
        className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
          isSelected
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
        } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
      >
        <input
          type={inputType}
          checked={isSelected}
          onChange={() => {}}
          className="mt-1 flex-shrink-0 w-4 h-4"
          disabled={disabled}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">
              {String.fromCharCode(65 + index)}.
            </span>
            <div className="text-gray-900">
              <RichTextContent value={toRich((answer as any).content?.content ?? (answer as any).content)} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Question Header */}
      <div className="flex items-start gap-3 mb-4">
        <span className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-semibold">
          {questionNumber}
        </span>
        <div className="flex-1">
          {question.title && (
            <div className="text-lg font-semibold text-gray-900 mb-2">
              <RichTextContent value={toRich(question.title)} />
            </div>
          )}
          {question.description && (
            <RichTextContent className="text-gray-600 text-sm" value={toRich(question.description)} />
          )}
          <p className="text-sm text-gray-500 mt-2">
            {isSingleChoice && '(Select one answer)'}
            {isMultipleChoice && '(Select all that apply)'}
            {isEssay && '(Write your answer below)'}
          </p>
        </div>
      </div>

      {/* Answer Options */}
      {!isEssay && (
        <div className="space-y-3 mt-4">
          {question.answers?.map((answer, index) => renderAnswerOption(answer, index))}
        </div>
      )}

      {/* Essay Answer */}
      {isEssay && (
        <div className="mt-4">
          <textarea
            value={essayText}
            onChange={(e) => onEssayChange?.(e.target.value)}
            disabled={disabled}
            placeholder="Type your answer here..."
            className="w-full min-h-[200px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <p className="text-sm text-gray-500 mt-2">
            {essayText.length} characters
          </p>
        </div>
      )}

      {/* Attachments */}
      {question.attachments && question.attachments.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Attachments:</p>
          <div className="flex flex-wrap gap-4 items-start">
            {question.attachments.map((attachment) => {
              const url = (attachment as any)?.fileUrl || '';
              const name = (attachment as any)?.fileName || 'attachment';
              const type = ((attachment as any)?.fileType || '').toString();
              const isImage =
                (type && type.startsWith('image')) || /\.(png|jpe?g|gif|webp|svg)$/i.test(url);
              return (
                <div key={(attachment as any)?.id || url} className="max-w-full">
                  {isImage ? (
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={url}
                        alt={name}
                        className="max-h-64 rounded border bg-white object-contain"
                      />
                    </a>
                  ) : (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
                    >
                      {name}
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

