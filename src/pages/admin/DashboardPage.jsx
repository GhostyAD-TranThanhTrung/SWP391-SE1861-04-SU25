import { useRef, useEffect, useState } from 'react';
import { Chart } from 'chart.js/auto';
import '../../styles/DashboardPage.scss';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
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
      if (!(res.data.role && res.data.role === 'admin')) navigate('/admin/login')
    } catch (err) {
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
          maintainAspectRatio: false
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
          labels: ['Hoàn thành', 'Lên lịch', 'Đã hủy', 'Đang chờ xác nhận', 'Xác nhận thành công'],
          datasets: [
            {
              label: 'Thống kê đặt lịch',
              data: [
                bookingStatsData.pending,
                bookingStatsData.confirmed,
                bookingStatsData.completed,
                bookingStatsData.cancelled
              ],
              backgroundColor: ['#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }
  }, [dashboardData.bookingStats]);

  return (
    <div className="dashboard-container">
      <div className="stat-cards">
        <div className="card">
          <div>Tổng thành viên đăng ký khóa học</div>
          <h4>{dashboardData.totalMonthlyCourseEnrollment}</h4>
          <small>thành viên/tháng</small>
        </div>

        <div className="card">
          <div>Tổng người dùng</div>
          <h4>{dashboardData.monthlyCreatedMember}</h4>
          <small>người dùng/tháng</small>
        </div>
        <div className="card">
          <div>Người dùng hoạt động</div>
          <h4>{dashboardData.memberActiveCount}</h4>
          <small>hoạt động/tháng</small>
        </div>
        <div className="card">
          <div>Tổng tư vấn</div>
          <h4>{dashboardData.totalMonthlyBookingSession}</h4>
          <small>lượt tư vấn/tháng</small>
        </div>
      </div>
      {dashboardData.dateRange && dashboardData.dateRange.startDate && dashboardData.dateRange.endDate && (
        <div className="current-month-info">
          <h3>
            Thống kê tháng {new Date(dashboardData.dateRange.startDate).getMonth() + 1} năm {new Date(dashboardData.dateRange.startDate).getFullYear()}
          </h3>
          <p>
            (Từ {new Date(dashboardData.dateRange.startDate).toLocaleDateString('vi-VN')} đến {new Date(dashboardData.dateRange.endDate).toLocaleDateString('vi-VN')})
          </p>
        </div>
      )}
      <div
        className="charts-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '2rem',
          marginTop: '2rem'
        }}
      >
        <div className="chart-container">
          <h2>Thống kê người dùng</h2>
          <canvas ref={userStatsCanvasRef}></canvas>
        </div>
        <div className="chart-container">
          <h2>Thống kê đặt lịch</h2>
          <canvas ref={bookingStatsCanvasRef}></canvas>
        </div>
      </div>

      <button className="export-button">
        <i className="bi bi-file-earmark-excel"></i> Xuất ra Excel
      </button>
    </div>
  );
};

export default DashboardPage;
