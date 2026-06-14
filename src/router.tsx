import { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import { Box, CircularProgress } from '@mui/material';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';

// Lazy loading pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const TaskInviteLanding = lazy(() => import('./pages/TaskInviteLanding'));
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
const TaskDetail = lazy(() => import('./pages/TaskDetail'));
const SharingMarketplace = lazy(() => import('./pages/Sharing/index'));
const SharingItemDetail = lazy(() => import('./pages/Sharing/SharingItemDetail'));
const GiftsArea = lazy(() => import('./pages/GiftsArea'));

const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
    <CircularProgress />
  </Box>
);

export const router = createBrowserRouter([
  {
    path: '/login',
    errorElement: <GlobalErrorBoundary />,
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: '/invite/task/:inviteToken',
    errorElement: <GlobalErrorBoundary />,
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <TaskInviteLanding />
      </Suspense>
    ),
  },
  {
    path: '/forgot-password',
    errorElement: <GlobalErrorBoundary />,
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ForgotPassword />
      </Suspense>
    ),
  },
  {
    path: '/reset-password',
    errorElement: <GlobalErrorBoundary />,
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ResetPassword />
      </Suspense>
    ),
  },
  {
    path: '/',
    errorElement: <GlobalErrorBoundary />,
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <Home />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile/:id?',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <Profile />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'wallet',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <Wallet />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'sharing',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <SharingMarketplace />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'sharing/:itemId',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <SharingItemDetail />
          </Suspense>
        ),
      },
      {
        path: 'gifts',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <GiftsArea />
            </Suspense>
          </ProtectedRoute>
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
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <Documentation />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'governance',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <GovernanceServices />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'work-wall',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <WorkWall />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'register-work',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <RegisterWork />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'create-demand',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <CreateDemand />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/reports',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <ReportsDashboard />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'voting',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <Voting />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'voting/:id',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <TopicDetail />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'tasks-board',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <TasksBoard />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'tasks/new',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <CreateTask />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'tasks/:id',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <TaskDetail />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'tasks/:id/submit',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <SubmitTaskProof />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'ai-agent',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <AIAgent />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'notifications',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <Notifications />
            </Suspense>
          </ProtectedRoute>
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
