import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { GamificationProvider } from '@/context/GamificationContext';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import SkipLink from '@/components/ui/SkipLink';
import Layout from '@/components/layout/Layout';
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
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LeaderboardPage from '@/pages/LeaderboardPage';
import KleiaCraftPage from '@/pages/KleiaCraftPage';
import CertificatsPage from '@/pages/CertificatsPage';

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <GamificationProvider>
          <BrowserRouter>
          <ErrorBoundary>
            <SkipLink />
            <Routes>
              {/* Pages publiques sans sidebar */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/landing" element={<LandingPage />} />

              {/* Routes protégées (authentifié) */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/onboarding" element={<OnboardingPage />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/formations" element={<Courses />} />
                  <Route path="/formation/:slug" element={<CourseDetail />} />
                  <Route path="/lecon/:lessonId" element={<LessonView />} />
                  <Route path="/quiz/:quizId" element={<QuizView />} />
                  <Route path="/profil" element={<Profile />} />
                  <Route path="/journal" element={<JournalPage />} />
                  <Route path="/coaching" element={<CoachingHub />} />
                  <Route path="/classement" element={<LeaderboardPage />} />
                  <Route path="/certificats" element={<CertificatsPage />} />
                </Route>
              </Route>

              {/* Routes admin (admin uniquement) */}
              <Route element={<ProtectedRoute requiredRole="admin" />}>
                <Route element={<Layout />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/courses" element={<AdminCourses />} />
                  <Route path="/admin/courses/new" element={<AdminCourseForm />} />
                  <Route path="/admin/courses/:courseId" element={<AdminCourseEditor />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/enrollments" element={<AdminEnrollments />} />
                  <Route path="/admin/kleiacraft" element={<KleiaCraftPage />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </BrowserRouter>
        </GamificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
