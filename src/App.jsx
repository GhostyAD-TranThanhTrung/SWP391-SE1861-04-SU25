import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgetPassPage from "./pages/ForgetPassPage";
import BookingPage from "./pages/BookingPage";
import CoursePage from "./pages/CoursePage";
import TestPage from "./pages/TestPage";
import BlogPage from "./pages/BlogPage";
import AboutUsPage from "./pages/AboutUsPage";
import ChooseRolePage from "./pages/ChooseRolePage";
import AdminLoginPage from "./pages/AdminLoginPage";
import SettingSidebar from "./components/SettingSidebar";
import ChooseTypeExam from "./pages/ChooseTypeExam";
import ExamPage from "./pages/ExamPage";
import BookingProfile from "./pages/BookingProfile";
import ResultPage from "./pages/ResultPage";
import DashboardPage from "./pages/admin/DashboardPage";
import StaffListPage from "./pages/admin/StaffListPage";
import MemberListPage from "./pages/admin/MemberListPage";
import ConsultantListPage from "./pages/admin/ConsultantListPage";
import AssessmentListPage from "./pages/admin/AssessmentListPage";
import DetailCoursePage from "./pages/DetailCoursePage";
import DetailCommunityEventPage from "./pages/DetailCommunityEventPage";
import DetailBlogPage from "./pages/DetailBlogPage";
import ContentViewPage from "./pages/ContentViewPage";
import CertificatePage from "./pages/consultant/CertificatePage";
import ManageBookingPage from "./pages/consultant/ManageBookingPage";
import CourseListPage from "./pages/admin/CourseListPage";
import BlogListPage from "./pages/admin/BlogListPage";
import ProfilePage from "./pages/ProfilePage";
import SettingLayout from "./layout/SettingLayout";

//Import layout
import AdminLayout from "./layout/AdminLayout";
import ConsultantLayout from "./layout/ConsultantLayout";

// Wrapper component to conditionally render Navbar and Footer
const AppLayout = () => {
  const location = useLocation();
  const hideNavbarAndFooter = ["/login", "/signup", "/forget", "/choose-role", "/admin/login",
    "/dashboard", "/staff-list", "/member-list", "/consultant-list", '/assessment-list',
    '/course-list', '/blog-list', '/manage-booking', '/certificate'].includes(location.pathname);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {!hideNavbarAndFooter && <Navbar />}
      <ToastContainer position="top-right" autoClose={2000} />

      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<RegisterPage />} />
          <Route path="/forget" element={<ForgetPassPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/courses" element={<CoursePage />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/choose-role" element={<ChooseRolePage />} />
          <Route path="/choosetype" element={<ChooseTypeExam />} />
          <Route path="/exam/:type" element={<ExamPage />} />
          <Route path="/consultant/:id" element={<BookingProfile />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/program/:id" element={<DetailCoursePage />} />
          <Route path="/community-event/:id" element={<DetailCommunityEventPage />} />
          <Route path="/blog/:id" element={<DetailBlogPage />} />
          <Route path="/content/:contentId" element={<ContentViewPage />} />
          <Route path="/setting" element={<SettingLayout />}>
            <Route path="profile" element={<ProfilePage />} />
            {/* Thêm các route khác nếu cần */}
          </Route>

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/dashboard"
            element={
              <AdminLayout>
                <DashboardPage />
              </AdminLayout>
            }
          />
          <Route
            path="/staff-list"
            element={
              <AdminLayout>
                <StaffListPage />
              </AdminLayout>
            }
          />
          <Route
            path="/member-list"
            element={
              <AdminLayout>
                <MemberListPage />
              </AdminLayout>
            }
          />
          <Route
            path="/consultant-list"
            element={
              <AdminLayout>
                <ConsultantListPage />
              </AdminLayout>
            }
          />
          <Route
            path="/assessment-list"
            element={
              <AdminLayout>
                <AssessmentListPage />
              </AdminLayout>
            }
          />
          <Route
            path="/course-list"
            element={
              <AdminLayout>
                <CourseListPage />
              </AdminLayout>
            }
          />
          <Route
            path="/blog-list"
            element={
              <AdminLayout>
                <BlogListPage />
              </AdminLayout>
            }
          />

          {/* Consultant*/}
          <Route
            path="/manage-booking"
            element={
              <ConsultantLayout>
                <ManageBookingPage />
              </ConsultantLayout>
            }
          />
          <Route
            path="/certificate"
            element={
              <ConsultantLayout>
                <CertificatePage />
              </ConsultantLayout>
            }
          />
        </Routes>
      </div>

      {!hideNavbarAndFooter && <Footer />}
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;