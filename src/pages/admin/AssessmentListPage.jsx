import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Chart } from 'chart.js/auto';
import "../../styles/AssessmentListPage.scss";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaClipboardList, FaSearch, FaEye, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import PaginationComp from "../../components/Pagination.jsx";

const AssessmentListPage = () => {

  // Chart refs for two separate charts
  const actionStatsCanvasRef1 = useRef(null);
  const actionStatsChartInstance1 = useRef(null);
  const actionStatsCanvasRef2 = useRef(null);
  const actionStatsChartInstance2 = useRef(null);

  // State management
  const [assessments, setAssessments] = useState([]);
  const [actions, setActions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [maxPageNumbersToShow] = useState(5);

  // Sorting state
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'

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
      console.error("Lỗi khi gọi API assessments:", err);
    }
  };

  const fetchActions = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/actions",
        { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        setActions(res.data.data);
      }
    } catch (err) {
      console.error("Lỗi khi gọi API actions:", err);
    }
  };

  useEffect(() => {
    fetchAssessments();
    fetchActions();
  }, []);

  // Sorting function
  const handleSort = (field) => {
    if (sortField === field) {
      // If same field, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If different field, set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort icon for column headers
  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <FaSort className="ms-1 text-muted" />;
    }
    return sortDirection === 'asc' ? 
      <FaSortUp className="ms-1 text-primary" /> : 
      <FaSortDown className="ms-1 text-primary" />;
  };

  // Filtering and pagination logic
  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = assessment.user_id?.toString().includes(searchTerm) ||
                         assessment.assessment_id?.toString().includes(searchTerm) ||
                         assessment.type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !filterType || assessment.type === filterType;
    
    return matchesSearch && matchesType;
  });

  // Sort filtered assessments
  const sortedAssessments = [...filteredAssessments].sort((a, b) => {
    if (!sortField) return 0;

    let aValue = a[sortField];
    let bValue = b[sortField];

    // Handle different data types
    if (sortField === 'created_at' || sortField === 'completed_at') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    } else if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) {
      return sortDirection === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const totalItems = sortedAssessments.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAssessments = sortedAssessments.slice(startIndex, startIndex + itemsPerPage);

  // Statistics calculations
  const totalAssessments = assessments.length;
  const typeStats = {};
  assessments.forEach(assessment => {
    if (assessment.type) {
      typeStats[assessment.type] = (typeStats[assessment.type] || 0) + 1;
    }
  });

  // Group actions by type and prepare chart data (exclude action ID 1)
  const actionsByType = {};
  actions.filter(action => action.action_id !== 1).forEach(action => {
    if (!actionsByType[action.type]) {
      actionsByType[action.type] = [];
    }
    actionsByType[action.type].push(action);
  });

  const getActionName = (actionId) => {
    if (actionId === 1) return 'Hidden Action';
    const action = actions.find(a => a.action_id === actionId);
    return action ? action.description || `Action ${actionId}` : `Action ${actionId}`;
  };

  // Get unique action types
  const actionTypes = Object.keys(actionsByType);
  
  // Prepare data for each action type
  const getChartDataForType = (actionType) => {
    const actionsOfType = actionsByType[actionType] || [];
    const actionIdCounts = {};
    
    assessments.forEach(assessment => {
      if (assessment.action_id && assessment.action_id !== 1) {
        const action = actions.find(a => a.action_id === assessment.action_id);
        if (action && action.type === actionType) {
          actionIdCounts[assessment.action_id] = (actionIdCounts[assessment.action_id] || 0) + 1;
        }
      }
    });

    const actionIds = Object.keys(actionIdCounts);
    const actionCounts = Object.values(actionIdCounts);
    const actionLabels = actionIds.map(id => `Action ${id}`);

    return { actionIds, actionCounts, actionLabels };
  };

  // Chart creation for first action type
  useEffect(() => {
    if (actionStatsCanvasRef1.current && actionTypes.length > 0 && actions.length > 0) {
      const firstType = actionTypes[0];
      const chartData = getChartDataForType(firstType);
      
      if (chartData.actionIds.length > 0) {
        const ctx = actionStatsCanvasRef1.current.getContext('2d');
        if (actionStatsChartInstance1.current) {
          actionStatsChartInstance1.current.destroy();
        }
        actionStatsChartInstance1.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: chartData.actionLabels,
            datasets: [{
              label: `Assessment theo ${firstType}`,
              data: chartData.actionCounts,
              backgroundColor: ['#4BC0C0', '#FFCE56', '#FF6384', '#36A2EB', '#9966FF']
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
                barPercentage: 0.6,
                categoryPercentage: 0.8
              },
              y: { beginAtZero: true }
            }
          }
        });
      }
    }
  }, [assessments, actions]);

  // Chart creation for second action type
  useEffect(() => {
    if (actionStatsCanvasRef2.current && actionTypes.length > 1 && actions.length > 0) {
      const secondType = actionTypes[1];
      const chartData = getChartDataForType(secondType);
      
      if (chartData.actionIds.length > 0) {
        const ctx = actionStatsCanvasRef2.current.getContext('2d');
        if (actionStatsChartInstance2.current) {
          actionStatsChartInstance2.current.destroy();
        }
        actionStatsChartInstance2.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: chartData.actionLabels,
            datasets: [{
              label: `Assessment theo ${secondType}`,
              data: chartData.actionCounts,
              backgroundColor: ['#FF6384', '#36A2EB', '#9966FF', '#4BC0C0', '#FFCE56']
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
                barPercentage: 0.6,
                categoryPercentage: 0.8
              },
              y: { beginAtZero: true }
            }
          }
        });
      }
    }
  }, [assessments, actions]);

  // Get unique assessment types for filter dropdown
  const uniqueTypes = [...new Set(assessments.map(a => a.type).filter(Boolean))];


  return (
    <div className="staff-container">
      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card h-100" style={{ background: '#f8f9fa', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <div className="card-body d-flex align-items-center">
              <div className="icon-wrapper me-3 p-3 rounded-circle" style={{ background: '#e9ecef', minWidth: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaClipboardList size={24} color="#212529" />
              </div>
              <div>
                <h3 className="mb-1" style={{ color: '#212529', fontSize: '1.8rem', fontWeight: 'bold' }}>{totalAssessments}</h3>
                <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>Tổng bài đánh giá</p>
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
                <h3 className="mb-1" style={{ color: '#212529', fontSize: '1.8rem', fontWeight: 'bold' }}>{typeStats['CRAFFT'] || 0}</h3>
                <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>CRAFFT Assessments</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card h-100" style={{ background: '#f8f9fa', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <div className="card-body d-flex align-items-center">
              <div className="icon-wrapper me-3 p-3 rounded-circle" style={{ background: '#e9ecef', minWidth: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaClipboardList size={24} color="#212529" />
              </div>
              <div>
                <h3 className="mb-1" style={{ color: '#212529', fontSize: '1.8rem', fontWeight: 'bold' }}>{typeStats['ASSIST'] || 0}</h3>
                <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>ASSIST Assessments</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6 mb-3">
          <div className="card h-100" style={{ background: '#f8f9fa', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <div className="card-body d-flex align-items-center">
              <div className="icon-wrapper me-3 p-3 rounded-circle" style={{ background: '#e9ecef', minWidth: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaSearch size={24} color="#212529" />
              </div>
              <div>
                <h3 className="mb-1" style={{ color: '#212529', fontSize: '1.8rem', fontWeight: 'bold' }}>{actionTypes.length}</h3>
                <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>Loại Action</p>
                <small className="text-muted">{actions.filter(a => a.action_id !== 1).length} tổng actions</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4" style={{ background: '#fff', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <FaSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Tìm kiếm theo ID bài đánh giá, ID người dùng hoặc loại..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">Tất cả loại</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>#</th>
              <th 
                onClick={() => handleSort('assessment_id')} 
                style={{ cursor: 'pointer', userSelect: 'none' }}
                title="Click to sort by assessment ID"
              >
                ID Bài đánh giá {getSortIcon('assessment_id')}
              </th>
              <th 
                onClick={() => handleSort('user_id')} 
                style={{ cursor: 'pointer', userSelect: 'none' }}
                title="Click to sort by user ID"
              >
                ID Người dùng {getSortIcon('user_id')}
              </th>
              <th 
                onClick={() => handleSort('type')} 
                style={{ cursor: 'pointer', userSelect: 'none' }}
                title="Click to sort by type"
              >
                Loại {getSortIcon('type')}
              </th>
              <th 
                onClick={() => handleSort('action_id')} 
                style={{ cursor: 'pointer', userSelect: 'none' }}
                title="Click to sort by action ID"
              >
                Action ID {getSortIcon('action_id')}
              </th>
              <th 
                onClick={() => handleSort('created_at')} 
                style={{ cursor: 'pointer', userSelect: 'none' }}
                title="Click to sort by creation date"
              >
                Ngày tạo {getSortIcon('created_at')}
              </th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedAssessments.map((assessment, index) => (
              <tr key={assessment.assessment_id}>
                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                <td>{assessment.assessment_id}</td>
                <td>{assessment.user_id || 'N/A'}</td>
                <td>
                  <span className={`badge ${assessment.type === 'CRAFFT' ? 'bg-primary' : 'bg-success'}`}>
                    {assessment.type || 'N/A'}
                  </span>
                </td>
                <td>{assessment.action_id || 'N/A'}</td>
                <td>{assessment.create_at ? new Date(assessment.create_at).toLocaleDateString('vi-VN') : 'N/A'}</td>
                <td className="action-buttons">
                  <button className="btn btn-light me-2" title="Xem chi tiết">
                    <FaEye color="#0ea5e9" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <PaginationComp
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        maxPageNumbersToShow={maxPageNumbersToShow}
        onPageChange={setCurrentPage}
      />

      {/* Charts and Dictionary */}
      <div className="row mt-4">
        {/* First Chart */}
        {actionTypes.length > 0 && (
          <div className="col-lg-6 mb-4">
            <div className="card" style={{ background: '#fff', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              <div className="card-header" style={{ background: '#f8f9fa', borderBottom: '1px solid #e9ecef' }}>
                <h5 className="mb-0" style={{ color: '#212529', fontWeight: 'bold' }}>
                  Assessment theo {actionTypes[0] || 'Action Type 1'}
                </h5>
              </div>
              <div className="card-body">
                <div className="chart-container" style={{ height: '350px', position: 'relative' }}>
                  <canvas ref={actionStatsCanvasRef1}></canvas>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Second Chart */}
        {actionTypes.length > 1 && (
          <div className="col-lg-6 mb-4">
            <div className="card" style={{ background: '#fff', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              <div className="card-header" style={{ background: '#f8f9fa', borderBottom: '1px solid #e9ecef' }}>
                <h5 className="mb-0" style={{ color: '#212529', fontWeight: 'bold' }}>
                  Assessment theo {actionTypes[1] || 'Action Type 2'}
                </h5>
              </div>
              <div className="card-body">
                <div className="chart-container" style={{ height: '350px', position: 'relative' }}>
                  <canvas ref={actionStatsCanvasRef2}></canvas>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dictionary Table */}
      <div className="row">
        <div className="col-12">
          <div className="card" style={{ background: '#fff', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <div className="card-header" style={{ background: '#f8f9fa', borderBottom: '1px solid #e9ecef' }}>
              <h5 className="mb-0" style={{ color: '#212529', fontWeight: 'bold' }}>Từ điển Action</h5>
            </div>
            <div className="card-body">
              {actions.length > 0 ? (
                <div className="row">
                  {actionTypes.map((actionType, typeIndex) => (
                    <div key={actionType} className="col-lg-6 mb-3">
                      <h6 className="text-muted mb-2">
                        <span className="badge bg-info me-2">{actionType}</span>
                        Action Type
                      </h6>
                      <div className="table-responsive">
                        <table className="table table-sm table-hover">
                          <thead>
                            <tr>
                              <th style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>ID</th>
                              <th style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Mô tả</th>
                              <th style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Range</th>
                            </tr>
                          </thead>
                          <tbody>
                            {actionsByType[actionType]?.map(action => (
                              <tr key={action.action_id}>
                                <td style={{ fontSize: '0.8rem' }}>
                                  <span className="badge bg-secondary">{action.action_id}</span>
                                </td>
                                <td style={{ fontSize: '0.8rem' }}>{action.description || 'Không có mô tả'}</td>
                                <td style={{ fontSize: '0.8rem' }}>
                                  {action.range ? (
                                    <span className="badge bg-light text-dark">{action.range}</span>
                                  ) : (
                                    <span className="text-muted">N/A</span>
                                  )}
                                </td>
                              </tr>
                            )) || []}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center">Không có dữ liệu action</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentListPage;