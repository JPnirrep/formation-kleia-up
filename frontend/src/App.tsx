import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import SkipLink from '@/components/ui/SkipLink';
import Layout from '@/components/layout/Layout';
import AdminLayout from '@/components/admin/AdminLayout';
import Dashboard from '@/pages/Dashboard';
import LandingPage from '@/pages/LandingPage';
import Courses from '@/pages/Courses';
import CourseDetail from '@/pages/CourseDetail';
import LessonView from '@/pages/LessonView';
import QuizView from '@/pages/QuizView';
import Profile from '@/pages/Profile';
import JournalPage from '@/pages/JournalPage';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminCourses from '@/pages/AdminCourses';
import AdminCourseForm from '@/pages/AdminCourseForm';
import AdminCourseDetail from '@/pages/AdminCourseDetail';
import AdminCourseEditor from '@/pages/AdminCourseEditor';
import AdminUsers from '@/pages/AdminUsers';
import AdminEnrollments from '@/pages/AdminEnrollments';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import AuthCallback from '@/pages/AuthCallback';
import OnboardingPage from '@/pages/OnboardingPage';
import NotFound from '@/pages/NotFound';
import CoachingHub from '@/pages/CoachingHub';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <SkipLink />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            {/* Alias pour compatibilité (URLs anglaises → françaises) */}
            <Route path="/courses" element={<Navigate to="/formations" replace />} />
            <Route path="/profile" element={<Navigate to="/profil" replace />} />
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/formations" element={<Courses />} />
              <Route path="/formation/:slug" element={<CourseDetail />} />
              <Route path="/lecon/:lessonId" element={<LessonView />} />
              <Route path="/quiz/:quizId" element={<QuizView />} />
              <Route path="/profil" element={<Profile />} />
              <Route path="/journal" element={<JournalPage />} />
              <Route path="/coaching" element={<CoachingHub />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            <Route element={<ProtectedRoute requiredRole="admin" />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/courses" element={<AdminCourses />} />
                <Route path="/admin/courses/new" element={<AdminCourseForm />} />
                <Route path="/admin/courses/:courseId" element={<AdminCourseEditor />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/enrollments" element={<AdminEnrollments />} />
              </Route>
            </Route>
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
  );
}
