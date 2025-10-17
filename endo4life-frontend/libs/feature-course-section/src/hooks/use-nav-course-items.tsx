import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';
import { INavItem } from '@endo4life/types';
import { useParams } from 'react-router-dom';

export function useNavCourseItems() {
  const { t } = useTranslation('common');
  const { id = '' } = useParams<{ id: string }>();
  const menuSections = useMemo(() => {
    const sections: INavItem[] = [
      {
        id: 'common',
        children: [
          {
            id: 'common1',
            label: 'Thông tin khoá học',
            name: 'COURSE_DETAIL',
            link: ADMIN_WEB_ROUTES.COURSE_DETAIL.replace(':id', id),
          },
          {
            id: 'common2',
            label: 'Câu hỏi đầu vào',
            name: 'COURSE_DETAIL_REQUIRED_TESTS',
            link: ADMIN_WEB_ROUTES.COURSE_DETAIL_REQUIRED_TESTS.replace(
              ':id',
              id,
            ),
            children: [
              {
                id: 'common2.1',
                label: 'Kiểm tra đầu vào',
                name: 'COURSE_DETAIL_REQUIRED_TESTS',
                link: ADMIN_WEB_ROUTES.COURSE_DETAIL_REQUIRED_TESTS.replace(
                  ':id',
                  id,
                ),
              },
              {
                id: 'common2.2',
                label: 'Khảo sát',
                name: 'COURSE_DETAIL_REQUIRED_TESTS_SURVEY',
                link: ADMIN_WEB_ROUTES.COURSE_DETAIL_REQUIRED_TESTS_SURVEY.replace(
                  ':id',
                  id,
                ),
              },
            ],
          },
          {
            id: 'common3',
            label: 'Bài giảng',
            name: 'COURSE_DETAIL_LECTURES',
            link: ADMIN_WEB_ROUTES.COURSE_DETAIL_LECTURES.replace(':id', id),
            children: [
              {
                id: 'common3.1',
                label: 'Nội dung',
                name: 'COURSE_DETAIL_LECTURES',
                link: ADMIN_WEB_ROUTES.COURSE_DETAIL_LECTURES.replace(
                  ':id',
                  id,
                ),
              },
              {
                id: 'common3.2',
                label: 'Câu hỏi ôn tập',
                name: 'COURSE_DETAIL_LECTURES_RECAP_QUESTION',
                link: ADMIN_WEB_ROUTES.COURSE_DETAIL_LECTURES_RECAP_QUESTION.replace(
                  ':id',
                  id,
                ),
              },
            ],
          },
          {
            id: 'common4',
            label: 'Kiểm tra cuối khoá',
            name: 'COURSE_DETAIL_FINAL_TESTS',
            link: ADMIN_WEB_ROUTES.COURSE_DETAIL_FINAL_TESTS.replace(':id', id),
          },
        ],
      },
    ];
    return sections;
  }, [t, id]);

  return { menuSections };
}
