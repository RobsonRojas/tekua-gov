import { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import { Box, CircularProgress } from '@mui/material';

// Lazy loading pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const Wallet = lazy(() => import('./pages/Wallet'));
const AdminTreasury = lazy(() => import('./pages/AdminTreasury'));
const WorkWall = lazy(() => import('./pages/WorkWall'));
const RegisterWork = lazy(() => import('./pages/RegisterWork'));
const ReportsDashboard = lazy(() => import('./pages/Dashboard/Reports/index'));


const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
    <CircularProgress />
  </Box>
);

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ForgotPassword />
      </Suspense>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ResetPassword />
      </Suspense>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: 'profile',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Profile />
          </Suspense>
        ),
      },
      {
        path: 'wallet',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Wallet />
          </Suspense>
        ),
      },
      {
        path: 'admin-panel',
        element: (
          <ProtectedRoute adminOnly>
            <Suspense fallback={<LoadingFallback />}>
              <AdminPanel />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin-treasury',
        element: (
          <ProtectedRoute adminOnly>
            <Suspense fallback={<LoadingFallback />}>
              <AdminTreasury />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'work-wall',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <WorkWall />
          </Suspense>
        ),
      },
      {
        path: 'register-work',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <RegisterWork />
          </Suspense>
        ),
      },
      {
        path: 'dashboard/reports',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ReportsDashboard />
          </Suspense>
        ),
      },
    ],

  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export default router;
