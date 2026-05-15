import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import SkipLink from '@/components/ui/SkipLink';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import Courses from '@/pages/Courses';
import CourseDetail from '@/pages/CourseDetail';
import LessonView from '@/pages/LessonView';
import QuizView from '@/pages/QuizView';
import Profile from '@/pages/Profile';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminCourses from '@/pages/AdminCourses';
import AdminCourseForm from '@/pages/AdminCourseForm';
import AdminCourseDetail from '@/pages/AdminCourseDetail';
import AdminUsers from '@/pages/AdminUsers';
import LoginPage from '@/pages/LoginPage';
import NotFound from '@/pages/NotFound';
import CoachingHub from '@/pages/CoachingHub';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <SkipLink />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/formations" element={<Courses />} />
              <Route path="/formation/:slug" element={<CourseDetail />} />
              <Route path="/lecon/:lessonId" element={<LessonView />} />
              <Route path="/quiz/:quizId" element={<QuizView />} />
              <Route path="/profil" element={<Profile />} />
              <Route path="/coaching" element={<CoachingHub />} />
              <Route element={<ProtectedRoute requiredRole="admin" />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/courses" element={<AdminCourses />} />
                <Route path="/admin/courses/new" element={<AdminCourseForm />} />
                <Route path="/admin/courses/:courseId" element={<AdminCourseDetail />} />
                <Route path="/admin/users" element={<AdminUsers />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
  );
}
