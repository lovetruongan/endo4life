import clsx from 'clsx';
import { IAnswerEntity } from '../types/answer-entity';
import { RichTextContent } from '@endo4life/feature-richtext-editor';
import { IQuestionEntity, QuestionTypeEnum } from '../types';

interface Props {
  question: IQuestionEntity;
  data: IAnswerEntity;
  onSelect?(data: IAnswerEntity): void;
  disabled?: boolean;
  selected?: boolean;
}

export function AnswerCard({
  selected,
  disabled,
  data,
  question,
  onSelect,
}: Props) {
  const disableSelect = !onSelect || disabled;
  return (
    <div
      onClick={(evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        onSelect && onSelect(data);
      }}
      className={clsx('flex items-center gap-2', {
        'pointer-events-none': disableSelect,
        'cursor-pointer': !disableSelect,
      })}
    >
      <input
        readOnly
        type={
          question.type === QuestionTypeEnum.SINGLE_CHOICE
            ? 'radio'
            : 'checkbox'
        }
        id={data.id.toString()}
        title={data.id.toString()}
        checked={selected || data.isCorrect}
        className="flex-none pointer-events-none"
        onChange={() => {}}
      />
      <div className="flex-auto">
        <RichTextContent value={data.content} />
      </div>
    </div>
  );
}
