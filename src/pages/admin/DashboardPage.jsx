import { useRef, useEffect, useState } from 'react';
import { Chart } from 'chart.js/auto';
import '../../styles/DashboardPage.scss';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { FaUsers, FaUserGraduate, FaUserCheck, FaCalendarCheck } from 'react-icons/fa';
const DashboardPage = () => {
  const userStatsCanvasRef = useRef(null);
  const bookingStatsCanvasRef = useRef(null);

  const userStatsChartInstance = useRef(null);
  const bookingStatsChartInstance = useRef(null);
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate()
  const userRole = async () => {
    try {
      if (!token) navigate('/admin/login')
      const res = await axios.get('http://localhost:3000/api/user/role/',
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!(res.data.role && res.data.role === 'manager')) navigate('/admin/login')
    } catch {
      navigate('/admin/login')
    }

  }
  userRole()
  const [dashboardData, setDashboardData] = useState({
    totalMonthlyCourseEnrollment: 0,
    totalMonthlyCourseCompletion: 0,
    monthlyCreatedMember: 0,
    memberActiveCount: 0,
    totalMonthlyBookingSession: 0,
    monthlyRevenueData: [],
    userStats: {},
    bookingStats: {},
    currentMonth: {},
    dateRange: {}
  });

  useEffect(() => {
    axios
      .get('http://localhost:3000/api/dashboard/detailed')
      .then((res) => {
        const data = res.data.data;
        setDashboardData({
          totalMonthlyCourseEnrollment: data.totalMonthlyCourseEnrollment || 0,
          totalMonthlyCourseCompletion: data.totalMonthlyCourseCompletion || 0,
          monthlyCreatedMember: data.monthlyCreatedMember || 0,
          memberActiveCount: data.memberActiveCount || 0,
          totalMonthlyBookingSession: data.totalMonthlyBookingSession || 0,
          monthlyRevenueData: data.monthlyRevenueData || [],
          userStats: data.userStats || {},
          bookingStats: data.bookingStats || {},
          currentMonth: data.currentMonth || {},
          dateRange: data.dateRange || {}
        });
      })
      .catch((error) => {
        console.error('Lỗi khi tải dữ liệu dashboard:', error);
      });
  }, []);

  // User Stats Chart (chỉ còn Hoạt động, Không hoạt động, Bị cấm)
  useEffect(() => {
    if (userStatsCanvasRef.current && dashboardData.userStats && Object.keys(dashboardData.userStats).length > 0) {
      const ctx = userStatsCanvasRef.current.getContext('2d');
      if (userStatsChartInstance.current) {
        userStatsChartInstance.current.destroy();
      }
      userStatsChartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: [
            'Hoạt động',
            'Không hoạt động',
            'Bị cấm'
          ],
          datasets: [
            {
              label: 'Thống kê người dùng',
              data: [
                dashboardData.userStats.active,
                dashboardData.userStats.inactive,
                dashboardData.userStats.banned
              ],
              backgroundColor: ['#4BC0C0', '#FFCE56', '#FF6384']
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              ticks: {
                align: 'center',
                maxRotation: 0,
                minRotation: 0,
                autoSkip: false,
                font: {
                  size: 12
                }
              }
            }
          }
        }
      });
    }
  }, [dashboardData.userStats]);

  // Booking Stats Chart (bỏ cột Hàng tháng)
  useEffect(() => {
    if (
      bookingStatsCanvasRef.current &&
      dashboardData.bookingStats &&
      Object.keys(dashboardData.bookingStats).length > 0
    ) {
      const ctx = bookingStatsCanvasRef.current.getContext('2d');
      if (bookingStatsChartInstance.current) {
        bookingStatsChartInstance.current.destroy();
      }
      const bookingStatsData = dashboardData.bookingStats;
      bookingStatsChartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: [
            'Hoàn thành',
            'Đã hủy',
            ['Đang chờ', 'xác nhận'],
            ['Xác nhận', 'thành công']
          ],
          datasets: [
            {
              label: 'Thống kê đặt lịch',
              data: [
                bookingStatsData.completed,
                bookingStatsData.cancelled,
                bookingStatsData.pending,
                bookingStatsData.confirmed,
              ],
              backgroundColor: ['#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              ticks: {
                align: 'center',
                maxRotation: 0,
                minRotation: 0,
                autoSkip: false,
                font: {
                  size: 12
                }
              }
            }
          }
        }
      });
    }
  }, [dashboardData.bookingStats]);

  return (
    <div className="staff-container">
      <div className="row mb-4">
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card h-100" style={{ background: '#f8f9fa', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <div className="card-body d-flex align-items-center">
              <div className="icon-wrapper me-3 p-3 rounded-circle" style={{ background: '#e9ecef', minWidth: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaUserGraduate size={24} color="#212529" />
              </div>
              <div>
                <h3 className="mb-1" style={{ color: '#212529', fontSize: '1.8rem', fontWeight: 'bold' }}>{dashboardData.totalMonthlyCourseEnrollment}</h3>
                <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>Đăng ký khóa học</p>
                <small className="text-muted">thành viên/tháng</small>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card h-100" style={{ background: '#f8f9fa', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <div className="card-body d-flex align-items-center">
              <div className="icon-wrapper me-3 p-3 rounded-circle" style={{ background: '#e9ecef', minWidth: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaUsers size={24} color="#212529" />
              </div>
              <div>
                <h3 className="mb-1" style={{ color: '#212529', fontSize: '1.8rem', fontWeight: 'bold' }}>{dashboardData.monthlyCreatedMember}</h3>
                <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>Tổng người dùng</p>
                <small className="text-muted">người dùng/tháng</small>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card h-100" style={{ background: '#f8f9fa', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <div className="card-body d-flex align-items-center">
              <div className="icon-wrapper me-3 p-3 rounded-circle" style={{ background: '#e9ecef', minWidth: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaUserCheck size={24} color="#212529" />
              </div>
              <div>
                <h3 className="mb-1" style={{ color: '#212529', fontSize: '1.8rem', fontWeight: 'bold' }}>{dashboardData.memberActiveCount}</h3>
                <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>Người dùng hoạt động</p>
                <small className="text-muted">hoạt động/tháng</small>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card h-100" style={{ background: '#f8f9fa', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <div className="card-body d-flex align-items-center">
              <div className="icon-wrapper me-3 p-3 rounded-circle" style={{ background: '#e9ecef', minWidth: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaCalendarCheck size={24} color="#212529" />
              </div>
              <div>
                <h3 className="mb-1" style={{ color: '#212529', fontSize: '1.8rem', fontWeight: 'bold' }}>{dashboardData.totalMonthlyBookingSession}</h3>
                <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>Tổng tư vấn</p>
                <small className="text-muted">lượt tư vấn/tháng</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      {dashboardData.dateRange && dashboardData.dateRange.startDate && dashboardData.dateRange.endDate && (
        <div className="card mb-4" style={{ background: '#fff', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <div className="card-body text-center">
            <h4 className="mb-2" style={{ color: '#212529', fontWeight: 'bold' }}>
              Thống kê tháng {new Date(dashboardData.dateRange.startDate).getMonth() + 1} năm {new Date(dashboardData.dateRange.startDate).getFullYear()}
            </h4>
            <p className="text-muted mb-0">
              (Từ {new Date(dashboardData.dateRange.startDate).toLocaleDateString('vi-VN')} đến {new Date(dashboardData.dateRange.endDate).toLocaleDateString('vi-VN')})
            </p>
          </div>
        </div>
      )}
      
      <div className="row">
        <div className="col-lg-6 mb-4">
          <div className="card h-100" style={{ background: '#fff', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <div className="card-header" style={{ background: '#f8f9fa', borderBottom: '1px solid #e9ecef' }}>
              <h5 className="mb-0" style={{ color: '#212529', fontWeight: 'bold' }}>Thống kê người dùng</h5>
            </div>
            <div className="card-body">
              <div className="chart-container" style={{ height: '400px', position: 'relative' }}>
                <canvas ref={userStatsCanvasRef}></canvas>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-6 mb-4">
          <div className="card h-100" style={{ background: '#fff', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <div className="card-header" style={{ background: '#f8f9fa', borderBottom: '1px solid #e9ecef' }}>
              <h5 className="mb-0" style={{ color: '#212529', fontWeight: 'bold' }}>Thống kê đặt lịch</h5>
            </div>
            <div className="card-body">
              <div className="chart-container" style={{ height: '400px', position: 'relative' }}>
                <canvas ref={bookingStatsCanvasRef}></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
