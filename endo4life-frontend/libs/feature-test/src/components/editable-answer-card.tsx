import clsx from 'clsx';
import { IAnswerEntity } from '../types/answer-entity';
import { RichTextContent } from '@endo4life/feature-richtext-editor';
import { IQuestionEntity, QuestionTypeEnum } from '../types';
import { useEffect, useRef, useState } from 'react';
import { GrDrag } from 'react-icons/gr';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  useClickAway,
  useDeepCompareEffect,
  useMount,
  useUpdate,
} from 'ahooks';
import { FormInputRichText } from '@endo4life/ui-common';
import { IconButton } from '@mui/material';
import { VscClose } from 'react-icons/vsc';
import { EditableRichText } from './editable-richtext';

interface Props {
  question: IQuestionEntity;
  data: IAnswerEntity;
  onChange?(data: IAnswerEntity): void;
  onSelect?(data: IAnswerEntity): void;
  onDelete?(data: IAnswerEntity): void;
}

export function EditableAnswerCard({
  data,
  onSelect,
  onChange,
  question,
  onDelete,
}: Props) {
  const update = useUpdate();
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: data.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className={clsx('flex items-center gap-2')}>
        <div {...listeners} className="cursor-grab active:cursor-grabbing">
          <GrDrag size={16} className="flex-none" />
        </div>
        <div
          className="flex items-center justify-center cursor-pointer"
          onClick={(evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            onSelect && onSelect(data);
            setTimeout(() => {
              update();
            }, 10);
          }}
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
            checked={!!data.isCorrect}
            className="flex-none pointer-events-none"
          />
        </div>
        <EditableRichText
          placeholder="Nhập đáp án"
          className="flex-auto"
          value={data.content}
          onChange={(val) => {
            onChange && onChange({ ...data, content: val });
          }}
        />
        <IconButton
          className="flex-none"
          size="small"
          onClick={() => onDelete && onDelete(data)}
        >
          <VscClose />
        </IconButton>
      </div>
    </div>
  );
}
