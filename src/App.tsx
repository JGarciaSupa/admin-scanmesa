import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'

import LoginPage from './pages/login/page'
import DashboardPage from './pages/dashboard/page'
import RestaurantPage from './pages/dashboard/restaurant/page'
import RestaurantDetailPage from './pages/dashboard/restaurant/detail/page'
import ProfilePage from './pages/profile/page'
import { DashboardLayout } from './components/layout/DashboardLayout'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'dashboard/restaurant',
        element: <RestaurantPage />
      }, 
      {
        path: 'dashboard/restaurant/:id',
        element: <RestaurantDetailPage />
      },
      {
        path: 'profile',
        element: <ProfilePage />
      }
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
