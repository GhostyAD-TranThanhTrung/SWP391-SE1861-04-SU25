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
// Uncomment these imports when ready to use protected routes
// import ProtectedRoute from "./components/ProtectedRoute";
// import ProtectedComponent from "./components/ProtectedComponent";

// Wrapper component to conditionally render Navbar and Footer
const AppLayout = () => {
  const location = useLocation();
  const hideNavbarAndFooter = ["/login", "/signup", "/forget"].includes(location.pathname);

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
          <Route path="/courses" element={<CoursePage />} />          <Route path="/test" element={<TestPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/about" element={<AboutUsPage />} />
          
          {/* 
            PROTECTED ROUTE EXAMPLE - Uncomment when ready to use:
            This route will redirect to login if user is not authenticated
            It displays user profile information fetched from protected backend endpoint
          */}
          {/* <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProtectedComponent />
              </ProtectedRoute>
            } 
          /> */}
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