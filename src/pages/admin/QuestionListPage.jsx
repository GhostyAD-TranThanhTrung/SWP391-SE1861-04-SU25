import { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch, FaPlus, FaEdit, FaEye, FaEyeSlash, FaTrash, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import "../../styles/StaffListPage.scss";
import { useNavigate } from "react-router-dom";
import PaginationComp from "../../components/Pagination.jsx";

const QuestionListPage = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [actions, setActions] = useState([]);
  const [newAction, setNewAction] = useState({
    description: "",
    range: "",
    type: "",
  });
  
  const [editingActionId, setEditingActionId] = useState(null);
  const [editActionData, setEditActionData] = useState(null);
  const [viewingActionId, setViewingActionId] = useState(null);
  const [viewActionData, setViewActionData] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionIdToDelete, setActionIdToDelete] = useState(null);
  const token = sessionStorage.getItem("token");
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const maxPageNumbersToShow = 5;

  // Sorting state
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  const navigate = useNavigate();

  const userRole = async () => {
    try {
      if (!token) navigate('/admin/login')
      const res = await axios.get('http://localhost:3000/api/user/role/',
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!(res.data.role && (res.data.role === 'admin' || res.data.role === 'manager' || res.data.role === 'staff'))) navigate('/admin/login')
    } catch {
      navigate('/admin/login')
    }
  }
  
  userRole();

  const fetchActions = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/actions", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setActions(res.data.data);
      }
    } catch (err) {
      console.error("Lỗi khi gọi API:", err);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  const handleOpenPopup = () => {
    setShowPopup(true);
    setNewAction({
      name: "",
      description: "",
      category: "",
      difficulty: "",
      type: "",
    });
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setEditingActionId(null);
    setEditActionData(null);
    setViewingActionId(null);
    setViewActionData(null);
    setNewAction({
      name: "",
      description: "",
      category: "",
      difficulty: "",
      type: "",
    });
  };

  const handleChange = (e) => {
    setNewAction({ ...newAction, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditActionData({ ...editActionData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!newAction.name || !newAction.description || !newAction.category || !newAction.difficulty || !newAction.type) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      const res = await axios.post("http://localhost:3000/api/actions", newAction, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        alert("Tạo action thành công!");
        fetchActions();
        handleClosePopup();
      }
    } catch (err) {
      console.error("Lỗi khi thêm action:", err);
      if (err.response?.data?.message) {
        alert(`Lỗi: ${err.response.data.message}`);
      } else {
        alert("Có lỗi xảy ra khi tạo action. Vui lòng thử lại.");
      }
    }
  };

  const handleEdit = (actionId) => {
    const action = actions.find((a) => a.id === actionId);
    if (action) {
      setEditActionData(action);
      setEditingActionId(actionId);
      setViewingActionId(null);
      setViewActionData(null);
      setShowPopup(true);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `http://localhost:3000/api/actions/${editingActionId}`,
        editActionData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        alert("Cập nhật action thành công!");
        fetchActions();
        handleClosePopup();
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật action:", err);
      if (err.response?.data?.message) {
        alert(`Lỗi: ${err.response.data.message}`);
      } else {
        alert("Có lỗi xảy ra khi cập nhật action. Vui lòng thử lại.");
      }
    }
  };

  const handleOpenDeleteDialog = (actionId) => {
    setActionIdToDelete(actionId);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setActionIdToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!actionIdToDelete) return;
    try {
      const res = await axios.delete(
        `http://localhost:3000/api/actions/${actionIdToDelete}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        alert("Xóa action thành công!");
        fetchActions();
      }
    } catch (err) {
      console.error("Lỗi khi xóa action:", err);
      if (err.response?.data?.message) {
        alert(`Lỗi: ${err.response.data.message}`);
      } else {
        alert("Có lỗi xảy ra khi thực hiện thao tác. Vui lòng thử lại.");
      }
    }
    handleCloseDeleteDialog();
  };

  const handleTypeChange = (e) => {
    setFilterType(e.target.value);
  };

  // Sorting function
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
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

  // Filter actions by category, difficulty, type, and search term
  const filteredActions = actions.filter(action => {
    const typeMatch = filterType === 'all' || action.type === filterType;
    return typeMatch
  });

  // Sort filtered actions
  const sortedActions = [...filteredActions].sort((a, b) => {
    if (!sortField) return 0;

    let aValue = a[sortField];
    let bValue = b[sortField];

    if (typeof aValue === 'string') {
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

  // Pagination logic
  const totalItems = sortedActions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedActions = sortedActions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Count by category
  const categoryCounts = actions.reduce((acc, action) => {
    acc[action.category] = (acc[action.category] || 0) + 1;
    return acc;
  }, {});

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [filterType, actions]);

  return (
    <div className="staff-container">
      <div className="row g-4 mb-4">
        {/* Total Actions Card */}
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm h-100" style={{
            background: '#f8f9fa',
            color: '#212529'
          }}>
            <div className="card-body d-flex align-items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-circle" style={{
                  backgroundColor: '#e9ecef',
                  fontSize: '2rem'
                }}>
                  📋
                </div>
              </div>
              <div className="ms-3">
                <div className="small text-muted">Tổng số actions</div>
                <div className="h3 mb-0 fw-bold">{totalItems}</div>
                <div className="small text-muted">trong danh sách</div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Cards */}
        {Object.entries(categoryCounts).slice(0, 3).map(([category, count], index) => (
          <div key={category} className="col-xl-3 col-md-6">
            <div className="card border-0 shadow-sm h-100" style={{
              background: '#f8f9fa',
              color: '#212529'
            }}>
              <div className="card-body d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 rounded-circle" style={{
                    backgroundColor: '#e9ecef',
                    fontSize: '2rem'
                  }}>
                    {['🎯', '📚', '💡'][index] || '📋'}
                  </div>
                </div>
                <div className="ms-3">
                  <div className="small text-muted">{category}</div>
                  <div className="h3 mb-0 fw-bold">{count}</div>
                  <div className="small text-muted">actions</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="d-flex gap-2 flex-wrap">
              <button className="btn btn-primary shadow-sm" onClick={handleOpenPopup}>
                <FaPlus className="me-1" /> Tạo action mới
              </button>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <select
                className="form-select shadow-sm"
                style={{ minWidth: '140px' }}
                value={filterType}
                onChange={handleTypeChange}
              >
                <option value="all">Tất cả loại</option>
                <option value="exercise">Exercise</option>
                <option value="meditation">Meditation</option>
                <option value="reading">Reading</option>
                <option value="writing">Writing</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>#</th>
              <th
                onClick={() => handleSort('description')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
                title="Click to sort by description"
              >
                Mô tả {getSortIcon('description')}
              </th>
              <th
                onClick={() => handleSort('range')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
                title="Click to sort by range"
              >
                Phạm vi {getSortIcon('range')}
              </th>
              <th
                onClick={() => handleSort('type')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
                title="Click to sort by type"
              >
                Loại {getSortIcon('type')}
              </th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedActions.map((action, index) => (
              <tr key={action.action_id}>
                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                <td>{action.description}</td>
                <td>{action.range}</td>
                <td>{action.type}</td>
                <td className="action-buttons">
                  <button className="btn btn-light me-2" onClick={() => handleEdit(action.id)} title="Chỉnh sửa">
                    <FaEdit color="yellow" />
                  </button>
                  <button className="btn btn-light" onClick={() => handleOpenDeleteDialog(action.id)} title="Xóa">
                    <FaTrash color="red" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination below the table */}
      <PaginationComp
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        maxPageNumbersToShow={maxPageNumbersToShow}
        onPageChange={setCurrentPage}
      />

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <span className="close" onClick={handleClosePopup}><MdCancel /></span>
            <div className="form">
              <h2>
                {viewingActionId ? "Xem chi tiết action" :
                  editingActionId ? "Chỉnh sửa action" : "Tạo action mới"}
              </h2>
              <form className="form-grid" onSubmit={editingActionId ? handleUpdateSubmit : handleSubmit}>

                <div className="form-group">
                  <label className="form-label">Tên *</label>
                  <input
                    type="text"
                    name="name"
                    value={viewingActionId ? viewActionData?.name || "" :
                      editingActionId ? editActionData?.name || "" : newAction.name}
                    onChange={editingActionId ? handleEditChange : handleChange}
                    required
                    disabled={viewingActionId}
                    className="form-input"
                    style={{
                      color: '#000',
                      backgroundColor: viewingActionId ? '#f8f9fa' : '#fff',
                      cursor: viewingActionId ? 'not-allowed' : 'text'
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Danh mục *</label>
                  <select
                    name="category"
                    value={viewingActionId ? viewActionData?.category || "" :
                      editingActionId ? editActionData?.category || "" : newAction.category}
                    onChange={editingActionId ? handleEditChange : handleChange}
                    required
                    disabled={viewingActionId}
                    className="form-select"
                    style={{
                      color: '#000',
                      backgroundColor: viewingActionId ? '#f8f9fa' : '#fff',
                      cursor: viewingActionId ? 'not-allowed' : 'text'
                    }}
                  >
                    <option value="">Chọn danh mục</option>
                    <option value="mental_health">Mental Health</option>
                    <option value="physical_health">Physical Health</option>
                    <option value="social_skills">Social Skills</option>
                    <option value="academic">Academic</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Độ khó *</label>
                  <select
                    name="difficulty"
                    value={viewingActionId ? viewActionData?.difficulty || "" :
                      editingActionId ? editActionData?.difficulty || "" : newAction.difficulty}
                    onChange={editingActionId ? handleEditChange : handleChange}
                    required
                    disabled={viewingActionId}
                    className="form-select"
                    style={{
                      color: '#000',
                      backgroundColor: viewingActionId ? '#f8f9fa' : '#fff',
                      cursor: viewingActionId ? 'not-allowed' : 'text'
                    }}
                  >
                    <option value="">Chọn độ khó</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Loại *</label>
                  <select
                    name="type"
                    value={viewingActionId ? viewActionData?.type || "" :
                      editingActionId ? editActionData?.type || "" : newAction.type}
                    onChange={editingActionId ? handleEditChange : handleChange}
                    required
                    disabled={viewingActionId}
                    className="form-select"
                    style={{
                      color: '#000',
                      backgroundColor: viewingActionId ? '#f8f9fa' : '#fff',
                      cursor: viewingActionId ? 'not-allowed' : 'text'
                    }}
                  >
                    <option value="">Chọn loại</option>
                    <option value="exercise">Exercise</option>
                    <option value="meditation">Meditation</option>
                    <option value="reading">Reading</option>
                    <option value="writing">Writing</option>
                  </select>
                </div>

                <div className="form-group form-grid-col-span-2">
                  <label className="form-label">Mô tả *</label>
                  <textarea
                    name="description"
                    value={viewingActionId ? viewActionData?.description || "" :
                      editingActionId ? editActionData?.description || "" : newAction.description}
                    onChange={editingActionId ? handleEditChange : handleChange}
                    required
                    disabled={viewingActionId}
                    className="form-textarea"
                    rows="4"
                    placeholder="Nhập mô tả chi tiết của action..."
                    style={{
                      color: '#000',
                      backgroundColor: viewingActionId ? '#f8f9fa' : '#fff',
                      resize: viewingActionId ? 'none' : 'vertical',
                      cursor: viewingActionId ? 'not-allowed' : 'text'
                    }}
                  />
                </div>

                {!viewingActionId && (
                  <button type="submit" className="form-button form-grid-col-span-2">
                    {editingActionId ? "Cập nhật" : "Tạo"}
                  </button>
                )}
                {viewingActionId && (
                  <button type="button" className="form-button form-grid-col-span-2" onClick={handleClosePopup}>
                    Đóng
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      {deleteDialogOpen && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.3)' }} tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content position-relative">
              <button type="button" className="close position-absolute top-0 end-0 m-2"
                onClick={handleCloseDeleteDialog}
                aria-label="Close"
                style={{ border: 'none', background: 'none' }}>
                <span><MdCancel size={20} /></span>
              </button>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title">Xác nhận thao tác</h5>
              </div>
              <div className="modal-body">
                <p>Bạn có chắc chắn muốn xóa action này không?</p>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-secondary" onClick={handleCloseDeleteDialog}>Không</button>
                <button type="button" className="btn btn-danger" onClick={handleConfirmDelete}>Có</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionListPage;
