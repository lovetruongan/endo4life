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
import AboutUsPageError from '../pages/about-us/error';
import AboutUsLoading from '../pages/about-us/loading';

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

const AboutUsPage = lazy(() => import('../pages/about-us/page'));
const LibraryPage = lazy(() => import('../pages/library/page'));
const MyProfilePage = lazy(() => import('../pages/my-profile/page'));
const LoginPage = lazy(() => import('../pages/login/page'));

export const studentWebRouter = createBrowserRouter([
  // LOGIN PAGE - No Layout (no header/footer)
  {
    path: '/login',
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <LoginPage />
      </Suspense>
    ),
  },
  // MAIN APP - With Layout (has header/footer)
  {
    path: STUDENT_WEB_ROUTES.ROOT,
    errorElement: <div> Loading</div>,
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
            path: STUDENT_WEB_ROUTES.MY_LIBRARY,
            index: true,
            errorElement: <LibraryPageError />,
            element: (
              <Suspense fallback={<LibraryPageLoading />}>
                <LibraryPage />
              </Suspense>
            ),
          },
        ],
      },

      // ABOUT_US
      {
        path: STUDENT_WEB_ROUTES.ABOUT_US,
        index: true,
        errorElement: <AboutUsPageError />,
        element: (
          <Suspense fallback={<AboutUsLoading />}>
            <AboutUsPage />
          </Suspense>
        ),
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
    ],
  },
]);