import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { InstructorRoute } from './components/InstructorRoute';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { LearningPage } from './pages/LearningPage';
import { InstructorDashboardPage } from './pages/InstructorDashboardPage';
import { CreateCoursePage } from './pages/CreateCoursePage'; // <-- Impor halaman baru
import { EditCoursePage } from './pages/EditCoursePage';     // <-- Impor halaman baru
import { ManageCoursePage } from './pages/ManageCoursePage';
import { ProfilePage } from './pages/ProfilePage';
import { MyLearningPage } from './pages/MyLearningPage';
import { MyFavoritesPage } from './pages/MyFavoritesPage';


function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="courses/:courseId" element={<CourseDetailPage />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/learn/course/:courseId/lesson/:lessonId" element={<LearningPage />} />
		  <Route path="/profile" element={<ProfilePage />} />
		  <Route path="/my-learning" element={<MyLearningPage />} />
		  <Route path="/my-favorites" element={<MyFavoritesPage />} />
        </Route>
        
        <Route element={<InstructorRoute />}>
          <Route path="/instructor/dashboard" element={<InstructorDashboardPage />} />
          <Route path="/instructor/courses/create" element={<CreateCoursePage />} />
          <Route path="/instructor/courses/edit/:courseId" element={<EditCoursePage />} />
		  <Route path="/instructor/courses/:courseId/manage" element={<ManageCoursePage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;