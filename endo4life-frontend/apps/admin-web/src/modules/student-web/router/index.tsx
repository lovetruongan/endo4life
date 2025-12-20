import { STUDENT_WEB_ROUTES } from '@endo4life/feature-config';
import { lazy, Suspense } from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import Layout from '../components/layout';
import Header from '../components/header';
import { ProtectedRoute } from './protected-route';
import HomePageError from '../pages/home/error';
import HomePageLoading from '../pages/home/loading';
import LibraryPageError from '../pages/library/error';
import LibraryPageLoading from '../pages/library/loading';
import LibraryPageLayout from '../pages/library/layout';
import { ResourcesPageLayout } from '../pages/resources/layout';
import MyLearningPageError from '../pages/my-learning/error';
import MyLearningPageLoading from '../pages/my-learning/loading';
import MyLearningPageLayout from '../pages/my-learning/layout';
import WatchHistoryPageError from '../pages/watch-history/error';
import WatchHistoryPageLoading from '../pages/watch-history/loading';
import WatchHistoryPageLayout from '../pages/watch-history/layout';
import MyQuestionsPageError from '../pages/my-questions/error';
import MyQuestionsPageLoading from '../pages/my-questions/loading';
import MyQuestionsPageLayout from '../pages/my-questions/layout';

const HomePage = lazy(() => import('../pages/home/page'));
const ResourcesPage = lazy(() => import('../pages/resources/page'));
const ResourceImagePage = lazy(
  () => import('../pages/resources/images/[id]/page'),
);
const ResourceVideoPage = lazy(
  () => import('../pages/resources/videos/[id]/page'),
);
const ResourceCoursePage = lazy(
  () => import('../pages/resources/courses/[id]/page'),
);
const EntranceTestPage = lazy(
  () => import('../pages/resources/courses/[courseId]/entrance-test/page'),
);
const LecturePlayerPage = lazy(
  () =>
    import('../pages/resources/courses/[courseId]/lectures/[lectureId]/page'),
);
const LectureReviewPage = lazy(
  () =>
    import(
      '../pages/resources/courses/[courseId]/lectures/[lectureId]/review/page'
    ),
);
const FinalExamPage = lazy(
  () => import('../pages/resources/courses/[courseId]/final-exam/page'),
);

const LibraryPage = lazy(() => import('../pages/library/page'));
const BookDetailPage = lazy(() => import('../pages/library/books/[id]/page'));
const MyLearningPage = lazy(() => import('../pages/my-learning/page'));
const WatchHistoryPage = lazy(() => import('../pages/watch-history/page'));
const MyQuestionsPage = lazy(() => import('../pages/my-questions/page'));
const MyProfilePage = lazy(() => import('../pages/my-profile/page'));
const LoginPage = lazy(() => import('../pages/login/page'));

// RAG Pages
const RagPageLayout = lazy(() => import('../pages/rag/layout'));
const RagAskPage = lazy(() => import('../pages/rag/ask/page'));
const RagIngestPage = lazy(() => import('../pages/rag/ingest/page'));
const RagSearchPage = lazy(() => import('../pages/rag/search/page'));

export const studentWebRouter = createBrowserRouter([
  // LOGIN PAGE - No Layout (no header/footer)
  {
    path: '/login',
    element: (
      <Suspense fallback={<div>Đang tải...</div>}>
        <LoginPage />
      </Suspense>
    ),
  },
  // MAIN APP - With Layout (has header/footer)
  {
    path: STUDENT_WEB_ROUTES.ROOT,
    errorElement: <div> Đang tải</div>,
    element: (
      <Layout header={<Header />}>
        <Outlet />
      </Layout>
    ),
    children: [
      // HOME
      {
        path: STUDENT_WEB_ROUTES.HOME,
        index: true,
        errorElement: <HomePageError />,
        element: (
          <Suspense fallback={<HomePageLoading />}>
            <HomePage />
          </Suspense>
        ),
      },
      // RESOURCES
      {
        path: STUDENT_WEB_ROUTES.RESOURCES,
        element: (
          <ProtectedRoute roles={[]}>
            <ResourcesPageLayout />
          </ProtectedRoute>
        ),

        children: [
          {
            path: STUDENT_WEB_ROUTES.RESOURCES,
            index: true,
            element: (
              <Suspense>
                <ResourcesPage />
              </Suspense>
            ),
          },

          {
            path: STUDENT_WEB_ROUTES.RESOURCE_IMAGE,
            element: (
              <Suspense>
                <ResourceImagePage />
              </Suspense>
            ),
          },

          {
            path: STUDENT_WEB_ROUTES.RESOURCE_VIDEO,
            element: (
              <Suspense>
                <ResourceVideoPage />
              </Suspense>
            ),
          },

          {
            path: STUDENT_WEB_ROUTES.RESOURCE_COURSE,
            index: true,
            element: (
              <Suspense>
                <ResourceCoursePage />
              </Suspense>
            ),
          },

          {
            path: STUDENT_WEB_ROUTES.COURSE_ENTRANCE_TEST,
            element: (
              <ProtectedRoute roles={[]}>
                <Suspense>
                  <EntranceTestPage />
                </Suspense>
              </ProtectedRoute>
            ),
          },

          {
            path: STUDENT_WEB_ROUTES.COURSE_LECTURE,
            element: (
              <ProtectedRoute roles={[]}>
                <Suspense>
                  <LecturePlayerPage />
                </Suspense>
              </ProtectedRoute>
            ),
          },

          {
            path: STUDENT_WEB_ROUTES.COURSE_LECTURE_REVIEW,
            element: (
              <ProtectedRoute roles={[]}>
                <Suspense>
                  <LectureReviewPage />
                </Suspense>
              </ProtectedRoute>
            ),
          },

          {
            path: STUDENT_WEB_ROUTES.COURSE_FINAL_EXAM,
            element: (
              <ProtectedRoute roles={[]}>
                <Suspense>
                  <FinalExamPage />
                </Suspense>
              </ProtectedRoute>
            ),
          },
        ],
      },

      // MY_LEARNING
      {
        path: STUDENT_WEB_ROUTES.MY_LEARNING,
        element: (
          <ProtectedRoute roles={[]}>
            <MyLearningPageLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: STUDENT_WEB_ROUTES.MY_LEARNING,
            index: true,
            errorElement: <MyLearningPageError />,
            element: (
              <Suspense fallback={<MyLearningPageLoading />}>
                <MyLearningPage />
              </Suspense>
            ),
          },
        ],
      },

      // WATCH_HISTORY
      {
        path: STUDENT_WEB_ROUTES.WATCH_HISTORY,
        element: (
          <ProtectedRoute roles={[]}>
            <WatchHistoryPageLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: STUDENT_WEB_ROUTES.WATCH_HISTORY,
            index: true,
            errorElement: <WatchHistoryPageError />,
            element: (
              <Suspense fallback={<WatchHistoryPageLoading />}>
                <WatchHistoryPage />
              </Suspense>
            ),
          },
        ],
      },

      // LIBRARY
      {
        path: STUDENT_WEB_ROUTES.MY_LIBRARY,
        element: (
          <ProtectedRoute roles={[]}>
            <LibraryPageLayout />
          </ProtectedRoute>
        ),

        children: [
          {
            index: true,
            errorElement: <LibraryPageError />,
            element: (
              <Suspense fallback={<LibraryPageLoading />}>
                <LibraryPage />
              </Suspense>
            ),
          },
          {
            path: 'books/:id',
            element: (
              <Suspense fallback={<LibraryPageLoading />}>
                <BookDetailPage />
              </Suspense>
            ),
          },
        ],
      },

      // MY_QUESTIONS
      {
        path: STUDENT_WEB_ROUTES.MY_QUESTIONS,
        element: (
          <ProtectedRoute roles={[]}>
            <MyQuestionsPageLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: STUDENT_WEB_ROUTES.MY_QUESTIONS,
            index: true,
            errorElement: <MyQuestionsPageError />,
            element: (
              <Suspense fallback={<MyQuestionsPageLoading />}>
                <MyQuestionsPage />
              </Suspense>
            ),
          },
        ],
      },

      // MY_PROFILE
      {
        path: STUDENT_WEB_ROUTES.MY_PROFILE,
        element: (
          <ProtectedRoute roles={[]}>
            <Suspense>
              <MyProfilePage />
            </Suspense>
          </ProtectedRoute>
        ),
      },

      // RAG
      {
        path: STUDENT_WEB_ROUTES.RAG,
        element: (
          <ProtectedRoute roles={[]}>
            <Suspense>
              <RagPageLayout />
            </Suspense>
          </ProtectedRoute>
        ),
        children: [
          {
            path: STUDENT_WEB_ROUTES.RAG_ASK,
            element: (
              <Suspense>
                <RagAskPage />
              </Suspense>
            ),
          },
          {
            path: STUDENT_WEB_ROUTES.RAG_INGEST,
            element: (
              <Suspense>
                <RagIngestPage />
              </Suspense>
            ),
          },
          {
            path: STUDENT_WEB_ROUTES.RAG_SEARCH,
            element: (
              <Suspense>
                <RagSearchPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
]);
