import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'

import LoginPage from './pages/login/page'
import DashboardPage from './pages/dashboard/page'
import RestaurantPage from './pages/dashboard/restaurant/page'
import RestaurantDetailPage from './pages/dashboard/restaurant/detail/page'
import ProfilePage from './pages/dashboard/profile/page'
import PlansPage from './pages/dashboard/plans/page'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { ProtectedRoute } from './components/ProtectedRoute'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'dashboard/plans',
        element: <PlansPage />
      },
      {
        path: 'dashboard/profile',
        element: <ProfilePage />
      },
      {
        path: 'dashboard/restaurant',
        element: <RestaurantPage />
      }, 
      {
        path: 'dashboard/restaurant/:id',
        element: <RestaurantDetailPage />
      },
    ]
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  }
]);

export default function App() {
  return (
    <RouterProvider router={router} />
  )
}
