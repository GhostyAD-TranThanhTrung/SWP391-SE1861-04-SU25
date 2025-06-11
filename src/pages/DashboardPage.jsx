import { useRef, useEffect, useState } from 'react';
import { Chart } from 'chart.js/auto';
import '../styles/DashboardPage.scss';

const DashboardPage = () => {
  const canvasRef = useRef(null);
  const chartInstance = useRef(null);

  const [dashboardData, setDashboardData] = useState({
    totalMonthlyCourseEnrollment: 0,
    totalMonthlyCourseCompletion: 0, // 👈 Thêm trường mới
    monthlyCreatedMember: 0,
    memberActiveCount: 0,
    totalMonthlyBookingSession: 0,
    monthlyRevenueData: []
  });

  useEffect(() => {
    fetch('http://localhost:3000/api/dashboard')
      .then((res) => res.json())
      .then((data) => {
        setDashboardData({
          totalMonthlyCourseEnrollment: data.data.totalMonthlyCourseEnrollment || 0,
          totalMonthlyCourseCompletion: data.data.totalMonthlyCourseCompletion || 3, // 👈 Dữ liệu mới
          monthlyCreatedMember: data.data.monthlyCreatedMember || 0,
          memberActiveCount: data.data.memberActiveCount || 0,
          totalMonthlyBookingSession: data.data.totalMonthlyBookingSession || 0,
          monthlyRevenueData: data.data.monthlyRevenueData || []
        });
      })
      .catch((error) => {
        console.error('Error fetching dashboard data:', error);
      });
  }, []);

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ],
        datasets: [{
          label: 'Revenue',
          data: dashboardData.monthlyRevenueData,
          backgroundColor: '#66B0C6',
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom'
          }
        },
        scales: {
          y: {
            title: {
              display: true,
              text: 'Unit: VND'
            }
          }
        }
      }
    });
  }, [dashboardData.monthlyRevenueData]);

  return (
    <div className="dashboard-container">
      <div className="stat-cards">
        <div className="card">
          <div>Total Member Enroll Course</div>
          <small>/month</small>
          <h4>{dashboardData.totalMonthlyCourseEnrollment}</h4>
          <small>member</small>
        </div>
        <div className="card">
          <div>Total Member Complete Course</div>
          <small>/month</small>
          <h4>{dashboardData.totalMonthlyCourseCompletion}</h4>
          <small>member</small>
        </div>
        <div className="card">
          <div>Total user</div>
          <small>/month</small>
          <h4>{dashboardData.monthlyCreatedMember}</h4>
          <small>user</small>
        </div>
        <div className="card">
          <div>Active user</div>
          <small>/month</small>
          <h4>{dashboardData.memberActiveCount}</h4>
          <small>active</small>
        </div>
        <div className="card">
          <div>Total consultation</div>
          <small>/month</small>
          <h4>{dashboardData.totalMonthlyBookingSession}</h4>
          <small>consultation</small>
        </div>
      </div>

      <div className="chart-container">
        <canvas ref={canvasRef}></canvas>
      </div>

      <button className="export-button">
        <i className="bi bi-file-earmark-excel"></i> Export to Excel
      </button>
    </div>
  );
};

export default DashboardPage;
