import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import { mockUser, mockCourses, getStartedCourses, getCompletedCourses } from '@/mock';
import { useApi } from '@/hooks/useApi';
import { getMyEnrollments } from '@/api/enrollments';
import { getCourses } from '@/api/courses';
import { isAuthenticated } from '@/api/client';
import type { Course } from '@/api/courses';

export default function Dashboard() {
  const navigate = useNavigate();
  const isAuth = isAuthenticated();
  const { data: enrollments } = useApi(() => getMyEnrollments(), [isAuth]);
  const { data: allCourses } = useApi(() => getCourses({ limit: 50 }), []);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);

  const mockStarted = getStartedCourses().slice(0, 3);
  const mockCompletedCount = getCompletedCourses().length;
  const mockTotalHours = mockCourses.reduce((acc, c) => acc + (isNaN(parseInt(c.duration)) ? 0 : parseInt(c.duration)), 0);

  useEffect(() => {
    if (enrollments && allCourses) {
      const courseMap = new Map(allCourses.items.map(c => [c.id, c]));
      setEnrolledCourses(enrollments.map(e => courseMap.get(e.course_id)).filter(Boolean) as Course[]);
    }
  }, [enrollments, allCourses]);

  const displayCourses = isAuth && enrolledCourses.length > 0 ? enrolledCourses : mockStarted;
  const inProgress = displayCourses.filter(c => (c.progress || 0) > 0 && (c.progress || 0) < 100);
  const completedCount = isAuth ? displayCourses.filter(c => (c.progress || 0) >= 100).length : mockCompletedCount;
  const totalHours = isAuth ? Math.round(displayCourses.reduce((acc, c) => acc + ((c as any).duration_seconds || parseInt((c as any).duration) * 3600 || 0), 0) / 3600) : mockTotalHours;

  const stats = [
    { label: 'En cours', value: inProgress.length.toString() },
    { label: 'Terminées', value: completedCount.toString() },
    { label: 'Heures', value: totalHours.toString() + 'h' },
  ];

  return (
    <div className='max-w-5xl mx-auto space-y-12 py-8 px-4 sm:px-6 lg:px-8'>
      <section className='text-center space-y-4'>
        <h1 className='text-4xl md:text-5xl font-extrabold font-heading text-kleia-burgundy'>
          Ton Incarnation, {mockUser.name.split(' ')[0]}
        </h1>
        <p className='text-lg text-kleia-gray font-body max-w-2xl mx-auto italic'>
          Chaque étape est une pierre posée pour ton leadership organique.
        </p>
      </section>

      <div className='flex justify-around items-center border-y border-kleia-dark/10 py-8'>
        {stats.map((stat) => (
          <div key={stat.label} className='text-center'>
            <div className='text-3xl font-bold font-heading text-kleia-dark'>{stat.value}</div>
            <div className='text-xs uppercase tracking-wider text-kleia-gray mt-1'>{stat.label}</div>
          </div>
        ))}
      </div>

      <section>
        <h2 className='text-xl font-bold font-heading text-kleia-dark mb-8 flex items-center gap-2'>
          <span className='w-2 h-2 rounded-full bg-kleia-burgundy' />
          Ton Parcours
        </h2>
        <div className='flex gap-8 overflow-x-auto pb-4'>
          {displayCourses.map((course, i) => (
            <div key={course.slug} className='flex-shrink-0 w-64 bg-white border border-kleia-dark/5 p-6 rounded-kleia shadow-sm hover:shadow-md transition-all cursor-pointer' onClick={() => navigate('/formations/' + course.slug)}>
              <span className='text-sm text-kleia-gray font-body'>Module {i + 1}</span>
              <h3 className='font-heading font-bold text-lg mt-2 text-kleia-dark'>{course.title}</h3>
              <div className='mt-4 h-2 w-full bg-kleia-dark/5 rounded-full overflow-hidden'>
                <div className='h-full bg-kleia-burgundy' style={{ width: (course.progress || 0) + '%' }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
