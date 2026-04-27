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
const CreateDemand = lazy(() => import('./pages/CreateDemand'));
const ReportsDashboard = lazy(() => import('./pages/Dashboard/Reports/index'));
const Voting = lazy(() => import('./pages/Voting'));
const TopicDetail = lazy(() => import('./pages/TopicDetail'));
const MemberManagement = lazy(() => import('./pages/MemberManagement'));
const Documentation = lazy(() => import('./pages/Documentation'));
const GovernanceServices = lazy(() => import('./pages/GovernanceServices'));
const TasksBoard = lazy(() => import('./pages/TasksBoard'));
const CreateTask = lazy(() => import('./pages/CreateTask'));
const SubmitTaskProof = lazy(() => import('./pages/SubmitTaskProof'));
const AIAgent = lazy(() => import('./pages/AIAgent'));
const Notifications = lazy(() => import('./pages/Notifications'));

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
        path: 'admin/members',
        element: (
          <ProtectedRoute adminOnly>
            <Suspense fallback={<LoadingFallback />}>
              <MemberManagement />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'documents',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Documentation />
          </Suspense>
        ),
      },
      {
        path: 'governance',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <GovernanceServices />
          </Suspense>
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
        path: 'create-demand',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <CreateDemand />
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
      {
        path: 'voting',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Voting />
          </Suspense>
        ),
      },
      {
        path: 'voting/:id',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <TopicDetail />
          </Suspense>
        ),
      },
      {
        path: 'tasks-board',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <TasksBoard />
          </Suspense>
        ),
      },
      {
        path: 'tasks/new',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <CreateTask />
          </Suspense>
        ),
      },
      {
        path: 'tasks/:id/submit',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <SubmitTaskProof />
          </Suspense>
        ),
      },
      {
        path: 'ai-agent',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AIAgent />
          </Suspense>
        ),
      },
      {
        path: 'notifications',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Notifications />
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
