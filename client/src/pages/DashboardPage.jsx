import { useRef, useEffect } from 'react';
import { Chart } from 'chart.js/auto';
import '../styles/DashboardPage.scss';

const DashboardPage = () => {
  const canvasRef = useRef(null);
  const chartInstance = useRef(null);

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
          label: 'Month',
          data: [30, 20, 35, 40, 60, 50, 90, 70, 20, 70, 50, 40],
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
  }, []);

  return (
    <div className="dashboard-container">
      <div className="stat-cards">
        <div className="card">
          <div>Revenue</div>
          <small>/month</small>
          <h4>10.000.000</h4>
          <small>VND</small>
        </div>
        <div className="card">
          <div>Total course</div>
          <small>/month</small>
          <h4>1.000</h4>
          <small>course</small>
        </div>
        <div className="card">
          <div>Total user</div>
          <small>/month</small>
          <h4>1.000</h4>
          <small>user</small>
        </div>
        <div className="card">
          <div>Total consultation</div>
          <small>/month</small>
          <h4>10</h4>
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
