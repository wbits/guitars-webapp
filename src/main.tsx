import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from 'react-router-dom';
import { App } from './App';
import { AuthGate } from './components/AuthGate';
import { GuitarList } from './pages/GuitarList';
import { GuitarNew } from './pages/GuitarNew';
import { GuitarView } from './pages/GuitarView';
import { GuitarEdit } from './pages/GuitarEdit';
import { UserCollectionList } from './pages/UserCollectionList';
import { SimilarGuitars } from './pages/SimilarGuitars';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { AssistantApiKeyHelp } from './pages/AssistantApiKeyHelp';

const Login = lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Register').then((m) => ({ default: m.Register })));

const lazyPage = (Page: React.ComponentType) => (
  <Suspense fallback={<p className="text-sm text-slate-600">Loading…</p>}>
    <Page />
  </Suspense>
);
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/guitars" replace /> },
      {
        path: 'guitars',
        element: (
          <AuthGate>
            <GuitarList />
          </AuthGate>
        ),
      },
      {
        path: 'guitars/similar',
        element: (
          <AuthGate>
            <SimilarGuitars />
          </AuthGate>
        ),
      },
      {
        path: 'guitars/new',
        element: (
          <AuthGate>
            <GuitarNew />
          </AuthGate>
        ),
      },
      {
        path: 'guitars/:id',
        element: (
          <AuthGate>
            <GuitarView />
          </AuthGate>
        ),
      },
      {
        path: 'guitars/:id/edit',
        element: (
          <AuthGate>
            <GuitarEdit />
          </AuthGate>
        ),
      },
      {
        path: 'collections/:userId/similar',
        element: (
          <AuthGate>
            <SimilarGuitars />
          </AuthGate>
        ),
      },
      {
        path: 'collections/:userId',
        element: (
          <AuthGate>
            <UserCollectionList />
          </AuthGate>
        ),
      },
      {
        path: 'collections/:userId/:id',
        element: (
          <AuthGate>
            <GuitarView />
          </AuthGate>
        ),
      },
      {
        path: 'profile',
        element: (
          <AuthGate>
            <Profile />
          </AuthGate>
        ),
      },
      { path: 'settings', element: <Settings /> },
      { path: 'help/assistant-api-key', element: <AssistantApiKeyHelp /> },
      { path: 'login', element: lazyPage(Login) },
      { path: 'register', element: lazyPage(Register) },
      { path: '*', element: <Navigate to="/guitars" replace /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
);
