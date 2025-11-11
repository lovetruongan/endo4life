import { lazy, Suspense } from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import UsersPageError from '../pages/users/error';
import UsersPageLoading from '../pages/users/loading';
import UsersPage from '../pages/users/page';
import UserCreatePageError from '../pages/users/create/error';
import UserCreatePageLoading from '../pages/users/create/loading';
import UserDetailPageError from '../pages/users/[id]/error';
import UserDetailPageLoading from '../pages/users/[id]/loading';
import CommentsPageError from '../pages/comments/error';
import CommentsPageLoading from '../pages/comments/loading';
import CommentsPage from '../pages/comments/page';
import CommentDetailPageError from '../pages/comments/[id]/error';
import CommentDetailPageLoading from '../pages/comments/[id]/loading';
import CommentDetailPage from '../pages/comments/[id]/page';
import { ProtectedRoute } from './protected-route';
import Layout from '../components/layout';
import Navbar from '../components/navbar';
import Header from '../components/header';
import UserCreatePage from '../pages/users/create/page';
import UserDetailPage from '../pages/users/[id]/page';
import ImagesPageError from '../pages/images/error';
import ImagesPageLoading from '../pages/images/loading';
import ImagesPage from '../pages/images/page';
import VideosPageError from '../pages/videos/error';
import VideosPageLoading from '../pages/videos/loading';
import VideosPage from '../pages/videos/page';
import DocumentsPageError from '../pages/documents/error';
import DocumentsPageLoading from '../pages/documents/loading';
import DocumentsPage from '../pages/documents/page';
import QuestionsPageError from '../pages/questions/error';
import QuestionsPageLoading from '../pages/questions/loading';
import QuestionsPage from '../pages/questions/page';
import CoursesPageError from '../pages/courses/error';
import CoursesPageLoading from '../pages/courses/loading';
import CoursesPage from '../pages/courses/page';
import ImageCreatePageError from '../pages/images/create/error';
import ImageCreatePageLoading from '../pages/images/create/loading';
import ImageCreatePage from '../pages/images/create/page';
import ImageDetailPageError from '../pages/images/[id]/error';
import ImageDetailPageLoading from '../pages/images/[id]/loading';
import ImageDetailPage from '../pages/images/[id]/page';
import ImageImportPageError from '../pages/images/import/error';
import ImageImportPageLoading from '../pages/images/import/loading';
import ImageImportPage from '../pages/images/import/page';

import VideoCreatePageError from '../pages/videos/create/error';
import VideoCreatePageLoading from '../pages/videos/create/loading';
import VideoCreatePage from '../pages/videos/create/page';
import VideoDetailPageError from '../pages/videos/[id]/error';
import VideoDetailPageLoading from '../pages/videos/[id]/loading';
import VideoDetailPage from '../pages/videos/[id]/page';
import CoursesPageLayout from '../pages/courses/layout';
import {
  CourseHeader,
  CourseNavbar,
  CourseProvider,
  CourseSubNavbar,
} from '@endo4life/feature-course';
import { CourseDetailPageError } from '../pages/courses/[id]/error';
import { CourseDetailPageLoading } from '../pages/courses/[id]/loading';
import { CourseSurveyPageError } from '../pages/courses/[id]/survey/error';
import { CourseSurveyPage } from '../pages/courses/[id]/survey/page';
import { CourseSurveyPageLoading } from '../pages/courses/[id]/survey/loading';
import { CourseLecturesPageError } from '../pages/courses/[id]/lectures/error';
import { CourseLecturesPageLoading } from '../pages/courses/[id]/lectures/loading';
import { CourseLecturesPage } from '../pages/courses/[id]/lectures/page';
import { CourseLectureDetailContentsPageError } from '../pages/courses/[id]/lectures/[id]/contents/error';
import { CourseLectureDetailContentsPageLoading } from '../pages/courses/[id]/lectures/[id]/contents/loading';
import { CourseLectureDetailContentsPage } from '../pages/courses/[id]/lectures/[id]/contents/page';
import { CourseLectureDetailPageError } from '../pages/courses/[id]/lectures/[id]/error';
import { CourseLectureDetailPageLoading } from '../pages/courses/[id]/lectures/[id]/loading';
import { CourseLectureDetailPage } from '../pages/courses/[id]/lectures/[id]/page';
import { CourseLectureDetailRecapQuestionsPageError } from '../pages/courses/[id]/lectures/[id]/recap-questions/error';
import { CourseLectureDetailRecapQuestionsPageLoading } from '../pages/courses/[id]/lectures/[id]/recap-questions/loading';
import { CourseLectureDetailRecapQuestionsPage } from '../pages/courses/[id]/lectures/[id]/recap-questions/page';
import { CourseRequiredTestsPage } from '../pages/courses/[id]/required-tests/page';
import { CourseRequiredTestsPageError } from '../pages/courses/[id]/required-tests/error';
import { CourseRequiredTestsPageLoading } from '../pages/courses/[id]/required-tests/loading';
import { CourseRequiredTestDetailPageError } from '../pages/courses/[id]/required-tests/[id]/error';
import { CourseRequiredTestDetailPageLoading } from '../pages/courses/[id]/required-tests/[id]/loading';
import { CourseRequiredTestDetailPage } from '../pages/courses/[id]/required-tests/[id]/page';
import { CourseFinalTestsPageError } from '../pages/courses/[id]/final-tests/error';
import { CourseFinalTestsPageLoading } from '../pages/courses/[id]/final-tests/loading';
import { CourseFinalTestsPage } from '../pages/courses/[id]/final-tests/page';
import { CourseFinalTestDetailPageError } from '../pages/courses/[id]/final-tests/[id]/error';
import { CourseFinalTestDetailPageLoading } from '../pages/courses/[id]/final-tests/[id]/loading';
import { CourseFinalTestDetailPage } from '../pages/courses/[id]/final-tests/[id]/page';
import CourseDetailPage from '../pages/courses/[id]/page';
import { CourseCreatePageLoading } from '../pages/courses/create/loading';
import CourseCreatePage from '../pages/courses/create/page';
import { CourseCreatePageError } from '../pages/courses/create/error';
import VideoImportPage from '../pages/videos/import/page';
import DashboardPage from '../pages/dashboard/page';
import KeycloakDebugPage from '../pages/debug/keycloak-debug';
import VideoImportPageError from '../pages/videos/import/error';
import VideoImportPageLoading from '../pages/videos/import/loading';
import { ADMIN_WEB_ROUTES } from '@endo4life/feature-config';

const HomePage = lazy(() => import('../pages/home/page'));

export const adminWebRouter = createBrowserRouter([
  {
    path: ADMIN_WEB_ROUTES.ROOT,
    errorElement: <div> Loading</div>,
    element: (
      <Layout header={<Header />} navbar={<Navbar />}>
        <Outlet />
      </Layout>
    ),
    children: [
      // HOME
      {
        path: ADMIN_WEB_ROUTES.HOME,
        index: true,
        errorElement: <div> Error</div>,
        element: (
          <Suspense fallback={<div> Loading</div>}>
            <DashboardPage />
          </Suspense>
        ),
      },
      // USER
      {
        path: ADMIN_WEB_ROUTES.USERS,

        element: (
          <ProtectedRoute roles={[]}>
            <Outlet />
          </ProtectedRoute>
        ),

        children: [
          {
            path: ADMIN_WEB_ROUTES.USERS,
            index: true,
            errorElement: <UsersPageError />,
            element: (
              <Suspense fallback={<UsersPageLoading />}>
                <UsersPage />
              </Suspense>
            ),
          },
          {
            path: ADMIN_WEB_ROUTES.USER_CREATE,
            errorElement: <UserCreatePageError />,
            element: (
              <Suspense fallback={<UserCreatePageLoading />}>
                <UserCreatePage />
              </Suspense>
            ),
          },
          {
            path: ADMIN_WEB_ROUTES.USER_DETAIL,
            errorElement: <UserDetailPageError />,
            element: (
              <Suspense fallback={<UserDetailPageLoading />}>
                <UserDetailPage />
              </Suspense>
            ),
          },
        ],
      },
      // COMMENT (not yet implemented)
      {
        path: ADMIN_WEB_ROUTES.COMMENTS,

        element: (
          <ProtectedRoute roles={[]}>
            <Outlet />
          </ProtectedRoute>
        ),

        children: [
          {
            path: ADMIN_WEB_ROUTES.COMMENTS,
            index: true,
            errorElement: <CommentsPageError />,
            element: (
              <Suspense fallback={<CommentsPageLoading />}>
                <CommentsPage />
              </Suspense>
            ),
          },
          {
            path: ADMIN_WEB_ROUTES.COMMENT_DETAIL,
            errorElement: <CommentDetailPageError />,
            element: (
              <Suspense fallback={<CommentDetailPageLoading />}>
                <CommentDetailPage />
              </Suspense>
            ),
          },
        ],
      },
      // IMAGE
      {
        path: ADMIN_WEB_ROUTES.IMAGES,

        element: (
          <ProtectedRoute roles={[]}>
            <Outlet />
          </ProtectedRoute>
        ),

        children: [
          {
            path: ADMIN_WEB_ROUTES.IMAGES,
            index: true,
            errorElement: <ImagesPageError />,
            element: (
              <Suspense fallback={<ImagesPageLoading />}>
                <ImagesPage />
              </Suspense>
            ),
          },
          {
            path: ADMIN_WEB_ROUTES.IMAGE_CREATE,
            errorElement: <ImageCreatePageError />,
            element: (
              <Suspense fallback={<ImageCreatePageLoading />}>
                <ImageCreatePage />
              </Suspense>
            ),
          },
          {
            path: ADMIN_WEB_ROUTES.IMAGE_DETAIL,
            errorElement: <ImageDetailPageError />,
            element: (
              <Suspense fallback={<ImageDetailPageLoading />}>
                <ImageDetailPage />
              </Suspense>
            ),
          },
          {
            path: ADMIN_WEB_ROUTES.IMAGE_IMPORT,
            errorElement: <ImageImportPageError />,
            element: (
              <Suspense fallback={<ImageImportPageLoading />}>
                <ImageImportPage />
              </Suspense>
            ),
          },
        ],
      },
      // VIDEO
      {
        path: ADMIN_WEB_ROUTES.VIDEOS,

        element: (
          <ProtectedRoute roles={[]}>
            <Outlet />
          </ProtectedRoute>
        ),

        children: [
          {
            path: ADMIN_WEB_ROUTES.VIDEOS,
            index: true,
            errorElement: <VideosPageError />,
            element: (
              <Suspense fallback={<VideosPageLoading />}>
                <VideosPage />
              </Suspense>
            ),
          },
          {
            path: ADMIN_WEB_ROUTES.VIDEO_CREATE,
            errorElement: <VideoCreatePageError />,
            element: (
              <Suspense fallback={<VideoCreatePageLoading />}>
                <VideoCreatePage />
              </Suspense>
            ),
          },
          {
            path: ADMIN_WEB_ROUTES.VIDEO_DETAIL,
            errorElement: <VideoDetailPageError />,
            element: (
              <Suspense fallback={<VideoDetailPageLoading />}>
                <VideoDetailPage />
              </Suspense>
            ),
          },
          {
            path: ADMIN_WEB_ROUTES.VIDEO_IMPORT,
            errorElement: <VideoImportPageError />,
            element: (
              <Suspense fallback={<VideoImportPageLoading />}>
                <VideoImportPage />
              </Suspense>
            ),
          },
        ],
      },
      // COURSE
      {
        path: ADMIN_WEB_ROUTES.COURSES,
        errorElement: <CoursesPageError />,
        element: (
          <ProtectedRoute roles={[]}>
            <Outlet />
          </ProtectedRoute>
        ),
        children: [
          {
            path: ADMIN_WEB_ROUTES.COURSES,
            index: true,
            errorElement: <div>Error</div>,
            element: (
              <Suspense fallback={<CoursesPageLoading />}>
                <CoursesPage />
              </Suspense>
            ),
          },
          {
            path: ADMIN_WEB_ROUTES.COURSE_DETAIL,
            errorElement: <CourseDetailPageError />,
            element: (
              <CourseProvider>
                <CoursesPageLayout
                  navbar={<CourseNavbar />}
                  subNavbar={<CourseSubNavbar />}
                  header={<CourseHeader />}
                >
                  <ProtectedRoute roles={[]}>
                    <Outlet />
                  </ProtectedRoute>
                </CoursesPageLayout>
              </CourseProvider>
            ),
            children: [
              {
                index: true,
                path: ADMIN_WEB_ROUTES.COURSE_DETAIL,
                errorElement: <CourseDetailPageError />,
                element: (
                  <Suspense fallback={<CourseDetailPageLoading />}>
                    <CourseDetailPage />
                  </Suspense>
                ),
              },
              {
                path: ADMIN_WEB_ROUTES.COURSE_DETAIL_REQUIRED_TESTS,
                errorElement: <CourseRequiredTestsPageError />,
                element: (
                  <Suspense fallback={<CourseRequiredTestsPageLoading />}>
                    <CourseRequiredTestsPage />
                  </Suspense>
                ),
                children: [
                  {
                    index: true,
                    path: ADMIN_WEB_ROUTES.COURSE_DETAIL_REQUIRED_TESTS_DETAIL,
                    errorElement: <CourseRequiredTestDetailPageError />,
                    element: (
                      <Suspense
                        fallback={<CourseRequiredTestDetailPageLoading />}
                      >
                        <CourseRequiredTestDetailPage />
                      </Suspense>
                    ),
                  },
                  {
                    path: ADMIN_WEB_ROUTES.COURSE_DETAIL_REQUIRED_TESTS_SURVEY,
                    errorElement: <CourseSurveyPageError />,
                    element: (
                      <Suspense fallback={<CourseSurveyPageLoading />}>
                        <CourseSurveyPage />
                      </Suspense>
                    ),
                  },
                ],
              },
              {
                path: ADMIN_WEB_ROUTES.COURSE_DETAIL_FINAL_TESTS,
                errorElement: <CourseFinalTestsPageError />,
                element: (
                  <Suspense fallback={<CourseFinalTestsPageLoading />}>
                    <CourseFinalTestsPage />
                  </Suspense>
                ),
                children: [
                  {
                    index: true,
                    path: ADMIN_WEB_ROUTES.COURSE_DETAIL_FINAL_TESTS_DETAIL,
                    errorElement: <CourseFinalTestDetailPageError />,
                    element: (
                      <Suspense fallback={<CourseFinalTestDetailPageLoading />}>
                        <CourseFinalTestDetailPage />
                      </Suspense>
                    ),
                  },
                ],
              },
              {
                path: ADMIN_WEB_ROUTES.COURSE_DETAIL_LECTURES,
                errorElement: <CourseLecturesPageError />,
                element: (
                  <Suspense fallback={<CourseLecturesPageLoading />}>
                    <CourseLecturesPage />
                  </Suspense>
                ),
                children: [
                  {
                    index: true,
                    path: ADMIN_WEB_ROUTES.COURSE_DETAIL_LECTURES_DETAIL,
                    errorElement: <CourseLectureDetailPageError />,
                    element: (
                      <Suspense fallback={<CourseLectureDetailPageLoading />}>
                        <CourseLectureDetailPage />
                      </Suspense>
                    ),
                  },
                  {
                    path: ADMIN_WEB_ROUTES.COURSE_DETAIL_LECTURES_CONTENT,
                    errorElement: <CourseLectureDetailContentsPageError />,
                    element: (
                      <Suspense
                        fallback={<CourseLectureDetailContentsPageLoading />}
                      >
                        <CourseLectureDetailContentsPage />
                      </Suspense>
                    ),
                  },
                  {
                    path: ADMIN_WEB_ROUTES.COURSE_DETAIL_LECTURES_RECAP_QUESTION,
                    errorElement: (
                      <CourseLectureDetailRecapQuestionsPageError />
                    ),
                    element: (
                      <Suspense
                        fallback={
                          <CourseLectureDetailRecapQuestionsPageLoading />
                        }
                      >
                        <CourseLectureDetailRecapQuestionsPage />
                      </Suspense>
                    ),
                  },
                ],
              },
            ],
          },
          {
            path: ADMIN_WEB_ROUTES.COURSE_CREATE,
            index: true,
            errorElement: <CourseCreatePageError />,
            element: (
              <Suspense fallback={<CourseCreatePageLoading />}>
                <CourseCreatePage />
              </Suspense>
            ),
          },
        ],
      },
      // QUESTION (not yet implemented)
      {
        path: ADMIN_WEB_ROUTES.QUESTIONS,

        element: (
          <ProtectedRoute roles={[]}>
            <Outlet />
          </ProtectedRoute>
        ),

        children: [
          {
            path: ADMIN_WEB_ROUTES.QUESTIONS,
            index: true,
            errorElement: <QuestionsPageError />,
            element: (
              <Suspense fallback={<QuestionsPageLoading />}>
                <QuestionsPage />
              </Suspense>
            ),
          },
        ],
      },
      // DOCUMENT (not yet implemented)
      {
        path: ADMIN_WEB_ROUTES.DOCUMENTS,

        element: (
          <ProtectedRoute roles={[]}>
            <Outlet />
          </ProtectedRoute>
        ),

        children: [
          {
            path: ADMIN_WEB_ROUTES.DOCUMENTS,
            index: true,
            errorElement: <DocumentsPageError />,
            element: (
              <Suspense fallback={<DocumentsPageLoading />}>
                <DocumentsPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
]);
