import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Chart } from 'chart.js/auto';
import "../../styles/AssessmentListPage.scss";
import { useNavigate } from "react-router-dom";

const AssessmentListPage = () => {

  // Thêm ref cho chart action_id
  const actionStatsCanvasRef = useRef(null);
  // Thêm ref cho instance chart action_id
  const actionStatsChartInstance = useRef(null);


  const [assessments, setAssessments] = useState([]);

  const token = sessionStorage.getItem("token");
  const navigate = useNavigate()

  const userRole = async () => {
    try {
      if (!token) navigate('/admin/login')
      const res = await axios.get('http://localhost:3000/api/user/role/',
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!(res.data.role && res.data.role === 'manager')) navigate('/admin/login')
    } catch{
      navigate('/admin/login')
    }

  }
  userRole()


  const fetchAssessments = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/assessments",
        { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        setAssessments(res.data.data);
      }
    } catch (err) {
      console.error("Lỗi khi gọi API:", err);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  // Chart thống kê assessment theo action_id
  useEffect(() => {
    if (actionStatsCanvasRef.current && actionIds.length > 0) {
      const ctx = actionStatsCanvasRef.current.getContext('2d');
      if (actionStatsChartInstance.current) {
        actionStatsChartInstance.current.destroy();
      }
      actionStatsChartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: actionIds.map(id => `Action ${id}`),
          datasets: [{
            label: 'Số lượng assessment theo action_id',
            data: actionCounts,
            backgroundColor: ['#4BC0C0', '#FFCE56', '#FF6384']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            x: {
              barPercentage: 0.1, // Cột nhỏ lại hơn nữa
              categoryPercentage: 0.3 // Tăng khoảng cách giữa các cột hơn nữa
            },
            y: { beginAtZero: true }
          }
        }
      });
    }
  }, [assessments]);

  // Đếm số lượng assessment theo action_id
  const actionIdCounts = {};
  assessments.forEach(a => {
    if (a.action_id) {
      actionIdCounts[a.action_id] = (actionIdCounts[a.action_id] || 0) + 1;
    }
  });
  const actionIds = Object.keys(actionIdCounts);
  const actionCounts = Object.values(actionIdCounts);


  return (
      <div className="assessment-list-container">

          <div className="card">
          <div>Tổng số bài đánh giá trong danh sách</div>
          <h4>{assessments.length}</h4>
          <small>bài</small>
        </div>
      
      <div
        className="charts-grid"
      >
        {/* Thêm chart action_id */}
        <div className="chart-container">
          <h3>Thống kê assessment theo action_id</h3>
          <canvas ref={actionStatsCanvasRef}></canvas>
        </div>
      </div>
    </div>
  );
};

export default AssessmentListPage;