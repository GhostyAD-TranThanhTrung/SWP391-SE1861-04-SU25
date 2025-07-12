import { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch, FaPlus, FaEdit } from "react-icons/fa";
import { FaEye, FaTrash } from "react-icons/fa6";
import { MdCancel } from "react-icons/md";
import "../../styles/AssessmentListPage.scss";
import { useNavigate } from "react-router-dom";
import PaginationComp from "../../components/Pagination";
const AssessmentListPage = () => {
  const [assessments, setAssessments] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const maxPageNumbersToShow = 5;

  const token = sessionStorage.getItem("token");
  const navigate = useNavigate()

  const userRole = async () => {
    try {
      if (!token) navigate('/admin/login')
      const res = await axios.get('http://localhost:3000/api/user/role/',
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!(res.data.role && res.data.role === 'admin')) navigate('/admin/login')
    } catch{
      navigate('/admin/login')
    }

  }
  userRole()
  //const [showPopup, setShowPopup] = useState(false);

  //const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  //const [assessmentIdToDelete, setAssessmentIdToDelete] = useState(null);

  // const handleOpenPopup = () => {
  //   setShowPopup(true);
  // };

  // const handleClosePopup = () => {
  //   setShowPopup(false);
  // };

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

  // const handleOpenDeleteDialog = (staffId) => {
  //   setStaffIdToDelete(staffId);
  //   setDeleteDialogOpen(true);
  // };

  // const handleCloseDeleteDialog = () => {
  //   setDeleteDialogOpen(false);
  //   setStaffIdToDelete(null);
  // };

  // const handleConfirmDelete = async () => {
  //   if (!staffIdToDelete) return;
  //   try {
  //     const res = await axios.delete(
  //       `http://localhost:3000/api/staff/${staffIdToDelete}`
  //     );
  //     if (res.data.success) {
  //       fetchStaffs();
  //     }
  //   } catch (err) {
  //     console.error("Lỗi khi xóa staff:", err);
  //   }
  //   handleCloseDeleteDialog();
  // };

  const assessmentTypes = Array.from(new Set(assessments.map(a => a.type)));

  const filteredAssessments = assessments.filter(a => {
    return filterType === '' || a.type === filterType;
  });

  // Pagination logic
  const totalItems = filteredAssessments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedAssessments = filteredAssessments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
    // eslint-disable-next-line
  }, [filterType, totalPages]);


  return (
      <div className="assessment-list-container">
        <div className="top-bar d-flex align-items-center mb-3" style={{gap: 8}}>
          <select
            className="assessment-type-select"
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
          >
            <option value="">Tất cả loại đánh giá</option>
            {assessmentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
  
        <div className="table-wrapper">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã người dùng</th>
                <th>Tổng điểm</th>
                <th>Loại đánh giá</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAssessments.map((assessment, index) => (
                <tr key={assessment.user_id}>
                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td>{assessment.user_id}</td>
                  <td>{(() => {
                    try {
                      const resultData = typeof assessment.result_json === 'string'
                        ? JSON.parse(assessment.result_json)
                        : assessment.result_json;
                      return resultData && resultData.total_score !== undefined ? resultData.total_score : '';
                    } catch {
                      return '';
                    }
                  })()}</td>
                  <td>{assessment.type}</td>
                  <td>{new Date(assessment.create_at).toLocaleDateString()}</td>
                  <td className="action-buttons">
                    <button
                      className="btn btn-light me-2"
                    >
                      <FaEye color="yellow" />
                    </button>
                    <button
                      className="btn btn-light"
                    >
                      <FaTrash color="red" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <PaginationComp
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          maxPageNumbersToShow={maxPageNumbersToShow}
          onPageChange={setCurrentPage}
        />

      {/* {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <span className="close" onClick={handleClosePopup}>
              <MdCancel />
            </span>
            <div className="form">
              <h2>{editingStaffId ? "Edit Staff" : "Create New Staff"}</h2>
              <form
                className="form-grid"
                onSubmit={editingStaffId ? handleUpdateSubmit : handleSubmit}
              >
                <input
                  type="text"
                  name="email"
                  placeholder="Email"
                  value={editingStaffId ? editStaffData?.email || "" : newStaff.email}
                  onChange={editingStaffId ? handleEditChange : handleChange}
                  required
                />

                  <input
                  type="password"
                  name="password"
                  placeholder={editingStaffId ? "Leave blank to keep current password" : "Password"}
                  value={
                    editingStaffId ? editStaffData?.passwordInput || "" : newStaff.password
                  }
                  onChange={(e) => {
                    if (editingStaffId) {
                      setEditStaffData({ ...editStaffData, passwordInput: e.target.value });
                    } else {
                      handleChange(e);
                    }
                  }}
                  required={!editingStaffId}
                />

                <select
                  name="role"
                  value={editingStaffId ? editStaffData?.role || "" : newStaff.role}
                  onChange={editingStaffId ? handleEditChange : handleChange}
                  required
                >
                  <option value="">Choose role</option>
                  <option value="admin">Admin</option>
                  <option value="consultant">Consultant</option>
                </select>

                {editingStaffId && (
                  <select
                    name="status"
                    value={editStaffData?.status || ""}
                    onChange={handleEditChange}
                    required
                  >
                    <option value="">Choose status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="banned">Banned</option>
                  </select>
                )}

                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={editingStaffId ? editStaffData?.name || "" : newStaff.name}
                  onChange={editingStaffId ? handleEditChange : handleChange}
                  required
                />

                <input
                  type="text"
                  name="bio"
                  placeholder="Bio"
                  value={editingStaffId ? editStaffData?.bio || "" : newStaff.bio}
                  onChange={editingStaffId ? handleEditChange : handleChange}
                />

                <input
                  type="text"
                  name="education"
                  placeholder="Education"
                  value={editingStaffId ? editStaffData?.education || "" : newStaff.education}
                  onChange={editingStaffId ? handleEditChange : handleChange}
                />

                <input
                  type="date"
                  name="date_of_birth"
                  value={editingStaffId ? editStaffData?.date_of_birth || "" : newStaff.date_of_birth}
                  onChange={editingStaffId ? handleEditChange : handleChange}
                />

                <input
                  type="text"
                  name="job"
                  placeholder="Job"
                  value={editingStaffId ? editStaffData?.job || "" : newStaff.job}
                  onChange={editingStaffId ? handleEditChange : handleChange}
                />

                <button type="submit" className="form-button">
                  {editingStaffId ? "Update" : "Create"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {deleteDialogOpen && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.3)' }} tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content position-relative">
              <button
                type="button"
                className="close position-absolute top-0 end-0 m-2"
                style={{ zIndex: 2, background: 'none', border: 'none' }}
                onClick={handleCloseDeleteDialog}
                aria-label="Close"
              >
                <span aria-hidden="true"><MdCancel size={20}/></span>
              </button>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title">Xác nhận xóa</h5>
              </div>
              <div className="modal-body">
                <p>Bạn có chắc chắn muốn xóa nhân viên này không?</p>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-secondary" onClick={handleCloseDeleteDialog}>No</button>
                <button type="button" className="btn btn-danger" onClick={handleConfirmDelete}>Yes</button>
              </div>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default AssessmentListPage;