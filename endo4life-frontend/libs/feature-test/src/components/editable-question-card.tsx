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
import { IRichText } from '@endo4life/types';
import { EditableRichText } from './editable-richtext';
import { QuestionImageCropDialog } from './question-image-crop-dialog/question-image-crop-dialog';

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
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imageSrcForCrop, setImageSrcForCrop] = useState<string>('');
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
      // Open crop dialog instead of directly setting the image
      setSelectedImageFile(selectedFile);
      setImageSrcForCrop(URL.createObjectURL(selectedFile));
      setCropDialogOpen(true);
      if (inputFileRef.current) inputFileRef.current.value = '';
    }
  };

  const handleCropConfirm = (croppedFile: File) => {
    const builder = new QuestionBuilder(data);
    builder.onFileSelected(croppedFile);
    onChange && onChange(builder.build());
    setCropDialogOpen(false);
    // Cleanup blob URL if it was created from file
    if (imageSrcForCrop && imageSrcForCrop.startsWith('blob:')) {
      URL.revokeObjectURL(imageSrcForCrop);
    }
    setSelectedImageFile(null);
    setImageSrcForCrop('');
  };

  const handleCropCancel = () => {
    setCropDialogOpen(false);
    // Cleanup blob URL if it was created from file
    if (imageSrcForCrop && imageSrcForCrop.startsWith('blob:')) {
      URL.revokeObjectURL(imageSrcForCrop);
    }
    setSelectedImageFile(null);
    setImageSrcForCrop('');
  };

  // Convert image URL to File for cropping
  const handleImageClick = async () => {
    if (!data.image?.src) return;
    
    try {
      // If image has a file, use it directly
      if (data.image.file) {
        const blobUrl = URL.createObjectURL(data.image.file);
        setSelectedImageFile(data.image.file);
        setImageSrcForCrop(blobUrl);
        setCropDialogOpen(true);
        return;
      }
      
      // Otherwise, fetch the image from URL and convert to File
      // This ensures we have a blob URL instead of external URL to avoid CORS issues
      const response = await fetch(data.image.src);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      const blob = await response.blob();
      const fileName = data.image.fileName || 'question-image.jpg';
      const file = new File([blob], fileName, { type: blob.type || 'image/jpeg' });
      
      // Create blob URL from the file to avoid CORS issues
      const blobUrl = URL.createObjectURL(file);
      setSelectedImageFile(file);
      setImageSrcForCrop(blobUrl);
      setCropDialogOpen(true);
    } catch (error) {
      console.error('Error loading image for crop:', error);
      // Fallback: try to use the src directly (may have CORS issues with canvas)
      setSelectedImageFile(null);
      setImageSrcForCrop(data.image.src);
      setCropDialogOpen(true);
    }
  };

  const onClickRemoveImage = () => {
    const builder = new QuestionBuilder(data);
    builder.removeImage();
    onChange && onChange(builder.build());
  };

  const handleInstructionChange = (value?: IRichText) => {
    const builder = new QuestionBuilder(data);
    builder.updateInstruction(value);
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
          className="flex-auto font-semibold"
          placeholder="Nhập tiêu đề câu hỏi (Q1, Q2...)"
          value={data.instruction}
          onChange={handleInstructionChange}
        />
      </div>
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
        <div className="relative inline-block group">
          <div
            className="border bg-slate-300 border-slate-300 cursor-pointer hover:opacity-90 transition-opacity rounded-lg overflow-hidden"
            style={{
              width: data.image?.width || 320,
              height: data.image?.height || 240,
              backgroundImage: `url(${data.image.src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            onClick={handleImageClick}
            title="Nhấn để cắt ảnh"
          />
          <div className="absolute z-10 opacity-0 group-hover:opacity-100 top-1 right-1">
            <button
              className="flex items-center justify-center w-8 h-8 bg-white border rounded-full border-slate-300 hover:bg-red-50 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onClickRemoveImage();
              }}
              title="Xóa ảnh"
            >
              <VscClose
                className="text-slate-500 hover:text-red-500"
                size={18}
              />
            </button>
          </div>
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

      <QuestionImageCropDialog
        open={cropDialogOpen}
        imageFile={selectedImageFile}
        imageSrc={imageSrcForCrop}
        onClose={handleCropCancel}
        onConfirm={handleCropConfirm}
      />
    </div>
  );
}
