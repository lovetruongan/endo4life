import {
  IAnswerEntity,
  IQuestionEntity,
  QuestionBuilder,
  QuestionTypeEnum,
} from '../types';
import { ChangeEvent, useMemo, useRef, useState } from 'react';
import { IconButton } from '@mui/material';
import { VscClose, VscCopy, VscTrash } from 'react-icons/vsc';
import { FormInputSelect } from '@endo4life/ui-common';
import { useMount } from 'ahooks';
import clsx from 'clsx';
import { EditableAnswerCard } from './editable-answer-card';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { PiImage } from 'react-icons/pi';
import { useQuestionTypeOptions } from '../hooks';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { IRichText } from '@endo4life/types';
import { EditableRichText } from './editable-richtext';

interface Props {
  data: IQuestionEntity;
  onChange?(data: IQuestionEntity): void;
  onDuplicate?(data: IQuestionEntity): void;
  onDelete?(data: IQuestionEntity): void;
}

export function EditableQuestionCard({
  data,
  onChange,
  onDuplicate,
  onDelete,
}: Props) {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const answers = useMemo(() => data.answers || [], [data]);
  const [loaded, setLoaded] = useState(false);
  const { options: typeOptions } = useQuestionTypeOptions(data.type);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over) return;
    if (active.id === over?.id) return;

    const items = data.answers || [];
    const oldIndex = items.findIndex(
      (ans) => ans.id.toString() === active.id.toString(),
    );
    const newIndex = items.findIndex(
      (ans) => ans.id.toString() === over.id.toString(),
    );

    const builder = new QuestionBuilder(data);
    builder.swapAnswer(oldIndex, newIndex);
    onChange && onChange(builder.build());
  };

  const handleRemoveAnswer = (answer: IAnswerEntity) => {
    const builder = new QuestionBuilder(data);
    builder.removeAnswer(answer.id);
    onChange && onChange(builder.build());
  };
  const handleSelectAnswer = (answer: IAnswerEntity) => {
    const builder = new QuestionBuilder(data);
    builder.selectAnswer(answer.id);
    onChange && onChange(builder.build());
  };
  const handleOnChangeAnswer = (answer: IAnswerEntity) => {
    const builder = new QuestionBuilder(data);
    builder.updateAnswer(answer);
    onChange && onChange(builder.build());
  };

  const handleChangeType = (type?: string) => {
    if (!type) return;
    const builder = new QuestionBuilder(data);
    builder.changeQuestionType(type as QuestionTypeEnum);
    onChange && onChange(builder.build());
  };

  const onClickSelectFile = () => {
    inputFileRef.current?.click();
  };

  const handleOnFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (!files || files.length === 0) return;

    const selectedFile = files.item(0);
    if (selectedFile) {
      const builder = new QuestionBuilder(data);
      builder.onFileSelected(selectedFile);
      onChange && onChange(builder.build());
      if (inputFileRef.current) inputFileRef.current.value = '';
    }
  };

  const onImageSizeChange = (width: number, height: number) => {
    const builder = new QuestionBuilder(data);
    builder.updateImageSize(width, height);
    onChange && onChange(builder.build());
  };

  const onClickRemoveImage = () => {
    const builder = new QuestionBuilder(data);
    builder.removeImage();
    onChange && onChange(builder.build());
  };

  const handleContentChange = (value?: IRichText) => {
    const builder = new QuestionBuilder(data);
    builder.updateContent(value);
    onChange && onChange(builder.build());
  };

  const handleAnswerChange = (value?: IRichText) => {
    const builder = new QuestionBuilder(data);
    builder.setAnswer(value);
    onChange && onChange(builder.build());
  };
  const onClickAddAnswer = () => {
    const builder = new QuestionBuilder(data);
    builder.addAnswer();
    onChange && onChange(builder.build());
  };

  useMount(() => {
    setTimeout(() => {
      setLoaded(true);
    }, 100);
  });

  return (
    <div
      className={clsx(
        'p-4 pb-2 space-y-3 bg-white border rounded-lg border-slate-100 outline outline-blue-500 border-l-4 border-l-blue-500',
        {
          'opacity-0': !loaded,
        },
      )}
    >
      <div className="flex items-start gap-4">
        <EditableRichText
          className="flex-auto"
          placeholder="Nhập nội dung câu hỏi"
          value={data.content}
          onChange={handleContentChange}
        />

        <div className="relative flex-none">
          <IconButton className="flex-none" onClick={onClickSelectFile}>
            <PiImage />
          </IconButton>
          <input
            ref={inputFileRef}
            type="file"
            accept="image/png, image/gif, image/jpeg"
            className="absolute top-0 left-0 w-0 h-0 opacity-0"
            onChange={handleOnFileChange}
          />
        </div>

        <FormInputSelect
          className="w-64"
          options={typeOptions}
          value={data.type}
          onChange={(type) => {
            handleChangeType(type);
          }}
        />
      </div>
      {data.image && (
        <div>
          <ResizableBox
            axis="both"
            resizeHandles={['w', 's', 'n', 'e']}
            className="relative flex-none"
            height={data.image?.height || 480}
            width={data.image?.width || 320}
            onResizeStop={(evt, data) => {
              evt.preventDefault();
              evt.stopPropagation();
              setTimeout(
                () => onImageSizeChange(data.size.width, data.size.height),
                100,
              );
            }}
          >
            <div className="relative w-full h-full group">
              <div
                className="w-full h-full border bg-slate-300 border-slate-300"
                style={{
                  backgroundImage: `url(${data.image.src})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div className="absolute z-10 opacity-0 group-hover:opacity-100 top-1 right-1">
                <button
                  className="flex items-center justify-center w-8 h-8 bg-white border rounded-full border-slate-300"
                  onClick={onClickRemoveImage}
                >
                  <VscClose
                    className="text-slate-500 hover:text-red-500"
                    size={18}
                  />
                </button>
              </div>
            </div>
          </ResizableBox>
        </div>
      )}
      {data.type !== QuestionTypeEnum.FREE_TEXT && (
        <div className="space-y-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={answers}
              strategy={verticalListSortingStrategy}
            >
              {answers.map((ans) => (
                <EditableAnswerCard
                  key={ans.id.toString()}
                  data={ans}
                  question={data}
                  onChange={handleOnChangeAnswer}
                  onSelect={handleSelectAnswer}
                  onDelete={handleRemoveAnswer}
                />
              ))}
            </SortableContext>
          </DndContext>
          <div>
            <button
              className="text-sm font-semibold text-primary"
              onClick={onClickAddAnswer}
            >
              Thêm lựa chọn
            </button>
          </div>
        </div>
      )}
      {data.type === QuestionTypeEnum.FREE_TEXT && (
        <div className="px-3 py-1 border rounded-lg border-slate-200 min-h-16">
          <EditableRichText
            className="flex-auto"
            placeholder="Câu trả lời ngắn"
            value={data.answer}
            onChange={handleAnswerChange}
          />
          {/* {data.answer && <RichTextContent value={data.answer} />}
          {!data.answer && (
            <span className="text-sm text-gray-500">Câu trả lời ngắn</span>
          )} */}
        </div>
      )}

      <div className="flex items-center justify-end pt-2 border-t border-slate-100">
        <IconButton
          className="flex-none"
          onClick={() => onDuplicate && onDuplicate(data)}
        >
          <VscCopy size={20} />
        </IconButton>
        <IconButton
          className="flex-none"
          onClick={() => onDelete && onDelete(data)}
        >
          <VscTrash size={20} />
        </IconButton>
      </div>
    </div>
  );
}
