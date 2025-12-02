import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';
import { FormInputText, FormInputTextarea } from '@endo4life/ui-common';
import { IBookEntity } from '../types';
import { IoCloudUploadOutline, IoClose } from 'react-icons/io5';

interface BookFormData {
  title: string;
  author: string;
  description: string;
}

const schema = yup.object().shape({
  title: yup.string().required('Title is required'),
  author: yup.string(),
  description: yup.string(),
});

interface Props {
  open: boolean;
  book?: IBookEntity | null;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (data: BookFormData, file?: File, cover?: File) => Promise<void>;
}

export function BookFormDialog({
  open,
  book,
  isLoading,
  onClose,
  onSubmit,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);

  const { control, handleSubmit, reset, formState } = useForm<BookFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      author: '',
      description: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (book) {
        reset({
          title: book.title || '',
          author: book.author || '',
          description: book.description || '',
        });
      } else {
        reset({
          title: '',
          author: '',
          description: '',
        });
      }
      setFile(null);
      setCover(null);
    }
  }, [book, reset, open]);

  const handleFormSubmit = async (data: BookFormData) => {
    await onSubmit(data, file || undefined, cover || undefined);
  };

  const isEdit = !!book;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="flex items-center justify-between border-b">
        <span className="text-lg font-semibold">
          {isEdit ? 'Edit Document' : 'Add New Document'}
        </span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full text-gray-500"
        >
          <IoClose size={20} />
        </button>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent className="space-y-4 pt-4">
          <Controller
            name="title"
            control={control}
            render={({ field: { onChange, value, name } }) => (
              <FormInputText
                key={name}
                label="Title"
                isRequired
                value={value}
                onSubmit={onChange}
                errMessage={formState.errors?.title?.message}
              />
            )}
          />

          <Controller
            name="author"
            control={control}
            render={({ field: { onChange, value, name } }) => (
              <FormInputText
                key={name}
                label="Author"
                value={value}
                onSubmit={onChange}
                errMessage={formState.errors?.author?.message}
              />
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field: { onChange, value, name } }) => (
              <FormInputTextarea
                key={name}
                label="Description"
                value={value}
                onSubmit={onChange}
                rows={3}
              />
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PDF File {!isEdit && <span className="text-red-500">*</span>}
              </label>
              <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center pointer-events-none">
                  <IoCloudUploadOutline className="text-gray-400 mb-1" size={24} />
                  <span className="text-xs text-gray-600 truncate w-full">
                    {file ? file.name : isEdit ? 'Replace file' : 'Select PDF'}
                  </span>
                </div>
              </div>
            </div>

            {/* Cover Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image
              </label>
              <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCover(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center pointer-events-none">
                  <IoCloudUploadOutline className="text-gray-400 mb-1" size={24} />
                  <span className="text-xs text-gray-600 truncate w-full">
                    {cover ? cover.name : isEdit ? 'Replace cover' : 'Select image'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>

        <DialogActions className="border-t p-4">
          <Button onClick={onClose} disabled={isLoading} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading && <CircularProgress size={16} />}
          >
            {isEdit ? 'Save Changes' : 'Create Document'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default BookFormDialog;
