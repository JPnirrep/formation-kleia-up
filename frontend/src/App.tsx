import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import Courses from '@/pages/Courses';
import CourseDetail from '@/pages/CourseDetail';
import LessonView from '@/pages/LessonView';
import QuizView from '@/pages/QuizView';
import Profile from '@/pages/Profile';
import AdminDashboard from '@/pages/AdminDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/formations" element={<Courses />} />
          <Route path="/formation/:slug" element={<CourseDetail />} />
          <Route path="/lecon/:lessonId" element={<LessonView />} />
          <Route path="/quiz/:quizId" element={<QuizView />} />
          <Route path="/profil" element={<Profile />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
