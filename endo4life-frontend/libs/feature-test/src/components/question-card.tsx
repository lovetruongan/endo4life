import { RichTextContent } from '@endo4life/feature-richtext-editor';
import { IAnswerEntity, IQuestionEntity, QuestionTypeEnum } from '../types';
import { AnswerCard } from './answer-card';
import { isEmptyRichTextContent } from '@endo4life/util-common';

interface Props {
  isEditing?: boolean;
  data: IQuestionEntity;
  onSelect?(data: IQuestionEntity, answer: IAnswerEntity): void;
}

export function QuestionCard({ isEditing, data, onSelect }: Props) {
  return (
    <div className="p-4 space-y-3 bg-white border rounded-lg border-slate-100">
      <div>
        <RichTextContent value={data.content} />
      </div>
      {data.image && (
        <div
          className="bg-slate-300"
          style={{
            backgroundImage: `url(${data.image.src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: data.image.width,
            height: data.image.height,
          }}
        />
      )}
      {data.type !== QuestionTypeEnum.FREE_TEXT && (
        <div className="space-y-2">
          {data.answers?.map((ans) => {
            return (
              <div key={ans.id}>
                <AnswerCard
                  disabled={!isEditing}
                  data={ans}
                  question={data}
                  onSelect={() => onSelect && onSelect(data, ans)}
                />
              </div>
            );
          })}
        </div>
      )}
      {data.type === QuestionTypeEnum.FREE_TEXT && (
        <div className="px-3 py-1 border rounded-lg border-slate-200 min-h-16">
          {!isEmptyRichTextContent(data.answer?.content) && (
            <RichTextContent value={data.answer} />
          )}
          {isEmptyRichTextContent(data.answer?.content) && (
            <span className="text-sm text-gray-500">Câu trả lời ngắn</span>
          )}
        </div>
      )}
    </div>
  );
}
