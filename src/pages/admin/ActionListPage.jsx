import { useState, useEffect } from "react";
import axios from "axios";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaList,
  FaChartBar,
} from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import "../../styles/ActionListPage.scss";
import { useNavigate } from "react-router-dom";
import PaginationComp from "../../components/Pagination.jsx";

const ActionListPage = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [actions, setActions] = useState([]);
  const [newAction, setNewAction] = useState({
    description: "",
    range: 0,
    type: "",
  });

  const [editingActionId, setEditingActionId] = useState(null);
  const [editActionData, setEditActionData] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionIdToDelete, setActionIdToDelete] = useState(null);
  const token = sessionStorage.getItem("token");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const maxPageNumbersToShow = 5;

  // Sorting state
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");

  const navigate = useNavigate();

  const userRole = async () => {
    try {
      if (!token) navigate("/admin/login");
      const res = await axios.get("http://localhost:3000/api/user/role/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (
        !(
          res.data.role &&
          (res.data.role === "admin" ||
            res.data.role === "manager" ||
            res.data.role === "staff")
        )
      )
        navigate("/admin/login");
    } catch {
      navigate("/admin/login");
    }
  };

  userRole();

  const fetchActions = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/actions", {
        headers: { Authorization: `Bearer ${token}` },
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
      description: "",
      range: 0,
      type: "",
    });
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setEditingActionId(null);
    setEditActionData(null);
    setNewAction({
      description: "",
      range: 0,
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
    if (!newAction.description || !newAction.description || !newAction.type) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:3000/api/actions",
        newAction,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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

  const handleEdit = async (actionId) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/actions/${actionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        setEditActionData(res.data.data);
        setEditingActionId(actionId);
        setShowPopup(true);
      } else {
        alert("Không thể lấy thông tin action. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Lỗi khi lấy thông tin action:", err);
      if (err.response?.data?.message) {
        alert(`Lỗi: ${err.response.data.message}`);
      } else {
        alert("Có lỗi xảy ra khi lấy thông tin action. Vui lòng thử lại.");
      }
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
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Get sort icon for column headers
  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <FaSort className="ms-1 text-muted" />;
    }
    return sortDirection === "asc" ? (
      <FaSortUp className="ms-1 text-primary" />
    ) : (
      <FaSortDown className="ms-1 text-primary" />
    );
  };

  // Filter actions by category, difficulty, type, and search term
  const filteredActions = actions.filter((action) => {
    const typeMatch = filterType === "all" || action.type === filterType;
    return typeMatch;
  });

  // Sort filtered actions
  const sortedActions = [...filteredActions].sort((a, b) => {
    if (!sortField) return 0;

    let aValue = a[sortField];
    let bValue = b[sortField];

    if (typeof aValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) {
      return sortDirection === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortDirection === "asc" ? 1 : -1;
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

  // Count by type
  const typeCounts = actions.reduce((acc, action) => {
    acc[action.type] = (acc[action.type] || 0) + 1;
    return acc;
  }, {});

  const totalActions = actions.length;
  const assistCount = typeCounts.ASSIST || 0;
  const crafftCount = typeCounts.CRAFFT || 0;

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [filterType, actions]);

    return (
    <div className="action-list-container">
      <div className="row g-4 mb-4">
        {/* Total Actions Card */}
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-circle bg-primary bg-opacity-10">
                  <FaList className="text-primary" />
                </div>
              </div>
              <div className="ms-3">
                <div className="small text-muted">Tổng số hành động</div>
                <div className="h3 mb-0 fw-bold">{totalActions}</div>
                <div className="small text-muted">trong danh sách</div>
              </div>
            </div>
          </div>
        </div>

        {/* ASSIST Actions Card */}
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-circle bg-success bg-opacity-10">
                  <FaChartBar className="text-success" />
                </div>
              </div>
              <div className="ms-3">
                <div className="small text-muted">Hành động ASSIST</div>
                <div className="h3 mb-0 fw-bold">{assistCount}</div>
                <div className="small text-muted">loại ASSIST</div>
              </div>
            </div>
          </div>
        </div>

        {/* CRAFFT Actions Card */}
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-circle bg-warning bg-opacity-10">
                  <FaChartBar className="text-warning" />
                </div>
              </div>
              <div className="ms-3">
                <div className="small text-muted">Hành động CRAFFT</div>
                <div className="h3 mb-0 fw-bold">{crafftCount}</div>
                <div className="small text-muted">loại CRAFFT</div>
              </div>
            </div>
          </div>
        </div>

        
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="d-flex gap-2 flex-wrap">
              <button
                className="btn btn-primary shadow-sm"
                onClick={handleOpenPopup}
              >
                <FaPlus className="me-1" /> Tạo hành động mới
              </button>
            </div>
            <div className="d-flex gap-2 flex-wrap">
                <select
                 className="form-select shadow-sm"
                 style={{ minWidth: "300px" }}
                 value={filterType}
                 onChange={handleTypeChange}
               >
                 <option value="all">Tất cả loại</option>
                 <option value="ASSIST">ASSIST</option>
                 <option value="CRAFFT">CRAFFT</option>
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
                onClick={() => handleSort("description")}
                style={{ cursor: "pointer", userSelect: "none" }}
                title="Click to sort by description"
              >
                Mô tả {getSortIcon("description")}
              </th>
              <th
                onClick={() => handleSort("range")}
                style={{ cursor: "pointer", userSelect: "none" }}
                title="Click to sort by range"
              >
                Phạm vi {getSortIcon("range")}
              </th>
              <th
                onClick={() => handleSort("type")}
                style={{ cursor: "pointer", userSelect: "none" }}
                title="Click to sort by type"
              >
                Loại {getSortIcon("type")}
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
                  <button
                    className="btn btn-light me-2"
                    onClick={() => handleEdit(action.action_id)}
                    title="Chỉnh sửa"
                  >
                    <FaEdit color="yellow" />
                  </button>
                  <button
                    className="btn btn-light"
                    onClick={() => handleOpenDeleteDialog(action.action_id)}
                    title="Xóa"
                  >
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
            <span className="close" onClick={handleClosePopup}>
              <MdCancel />
            </span>
            <div className="form">
              <h2>{editingActionId ? "Chỉnh sửa action" : "Tạo action mới"}</h2>
              <form
                className="form-grid"
                onSubmit={editingActionId ? handleUpdateSubmit : handleSubmit}
              >
                <div className="form-group form-grid-col-span-2">
                  <label className="form-label">Mô tả *</label>
                  <textarea
                    name="description"
                    value={
                      editingActionId
                        ? editActionData?.description || ""
                        : newAction.description
                    }
                    onChange={editingActionId ? handleEditChange : handleChange}
                    required
                    className="form-textarea"
                    rows="4"
                    placeholder="Nhập mô tả chi tiết của hành động..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phạm vi *</label>
                  <input
                    type="number"
                    step="1"
                    name="range"
                    value={
                      editingActionId
                        ? editActionData?.range || ""
                        : newAction.range
                    }
                    onChange={editingActionId ? handleEditChange : handleChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Loại *</label>
                  <select
                    name="type"
                    value={
                      editingActionId
                        ? editActionData?.type || ""
                        : newAction.type
                    }
                    onChange={editingActionId ? handleEditChange : handleChange}
                    required
                    className="form-select"
                  >
                    <option value="">Chọn loại</option>
                    <option value="ASSIST">ASSIST</option>
                    <option value="CRAFFT">CRAFFT</option>
                  </select>
                </div>

                

                <button
                  type="submit"
                  className="form-button form-grid-col-span-2"
                >
                  {editingActionId ? "Cập nhật" : "Tạo"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {deleteDialogOpen && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.3)" }}
          tabIndex="-1"
          role="dialog"
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content position-relative">
              <button
                type="button"
                className="close position-absolute top-0 end-0 m-2"
                onClick={handleCloseDeleteDialog}
                aria-label="Close"
                style={{ border: "none", background: "none" }}
              >
                <span>
                  <MdCancel size={20} />
                </span>
              </button>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title">Xác nhận thao tác</h5>
              </div>
              <div className="modal-body">
                <p>Bạn có chắc chắn muốn xóa action này không?</p>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseDeleteDialog}
                >
                  Không
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleConfirmDelete}
                >
                  Có
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionListPage;
