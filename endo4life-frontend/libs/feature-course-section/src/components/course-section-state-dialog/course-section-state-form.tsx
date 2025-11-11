import clsx from 'clsx';
import { Button, FormInputRadio } from '@endo4life/ui-common';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { CourseState } from '@endo4life/data-access';
import { ICourseSectionFormData } from '../../types';
import { useCourseStateOptions } from '../../hooks/use-course-status-options';
import { useTranslation } from 'react-i18next';

interface Props {
  courseSectionId: string;
  state?: CourseState | string;
  onClose(): void;
  onSubmit(data: ICourseSectionFormData): void;
}

export const CourseSectionStateForm = ({
  courseSectionId,
  state,
  onClose,
  onSubmit,
}: Props) => {
  const { t } = useTranslation(['common', 'course']);
  // Convert state to CourseState enum if it's a string
  const initialState = state
    ? (typeof state === 'string' ? (state as CourseState) : state)
    : CourseState.Draft;
  const { options: courseStateOptions } = useCourseStateOptions(initialState);

  const schema = yup.object().shape({
    id: yup.string().required(),
    state: yup
      .string()
      .oneOf([
        CourseState.Public.toString(),
        CourseState.Private.toString(),
        CourseState.Draft.toString(),
      ])
      .required(
        t(
          'common:txtRequiredField'.replace(
            '{{field_name}}',
            t('course:basicInfo.state'),
          ),
        ),
      ),
  });

  // Convert state to string for form default value
  const stateString = state
    ? (typeof state === 'string' ? state : state.toString())
    : CourseState.Draft.toString();

  const { control, handleSubmit } = useForm<ICourseSectionFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      id: courseSectionId,
      state: stateString,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={clsx('space-y-6')}>
      <Controller
        name="state"
        control={control}
        render={({ field: { onChange, value } }) => (
          <FormInputRadio
            label="Chọn trạng thái hiển thị của bài giảng"
            options={courseStateOptions}
            value={value}
            onChange={onChange}
            optionsClassName="flex flex-col gap-2"
          />
        )}
      />
      <div className="flex items-center justify-end gap-2 pt-4">
        <Button
          text={t('common:txtCancel')}
          onClick={(evt) => {
            evt.preventDefault();
            onClose();
          }}
          className="h-12 py-2 text-sm font-bold px-9 border-1"
          variant="outline"
        />
        <Button
          text={t('common:txtSubmit')}
          type="submit"
          variant="fill"
          className="h-12 py-4 text-sm font-bold px-9"
        />
      </div>
    </form>
  );
};

export default CourseSectionStateForm;

