import { useEffect, useState } from "react";
import { FaSearch, FaPlus, FaEdit } from "react-icons/fa";
import { FaTrash } from "react-icons/fa6";
import { MdCancel } from "react-icons/md";
import "../../styles/ConsultantListPage.scss";
import axios from "axios";

const ConsultantListPage = () => {
  const [consultants, setConsultants] = useState([]);
  const [newConsultant, setNewConsultant] = useState({
    email: "",
    password: "",
    role: "",
    cost: 0,
    certification: "",
    speciality: "",
    name: "",
    bio: "",
    education: "",
    date_of_birth: "",
    job: "",
  });
  
  const [showPopup, setShowPopup] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [editingConsultantId, setEditingConsultantId] = useState(null);
  const [editConsultantData, setEditConsultantData] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [consultantIdToDelete, setConsultantIdToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const token = sessionStorage.getItem("token");

  const handleOpenPopup = () => {
    setShowPopup(true);
    setNewPassword(""); 
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setNewPassword("");
    setEditingConsultantId(null);
    setEditConsultantData(null);
    setNewConsultant({
      email: "",
      password: "",
      role: "consultant",
      name: "",
      bio: "",
      education: "",
      date_of_birth: "",
      job: "",
      cost: 0,
      certification: "",
      speciality: ""
    });
  };

  const fetchConsultants = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/consultants");
      if (res.data.success) {
        setConsultants(res.data.data.consultants);
      }
    } catch (err) {
      console.error("Lỗi khi gọi API:", err);
    }
  };

  const handleChange = (e) => {
    setNewConsultant({ ...newConsultant, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditConsultantData({ ...editConsultantData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    fetchConsultants();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newConsultant,
        bio_json: {
          bio: newConsultant.bio,
          education: newConsultant.education,
        },
        password: newPassword,
      };
      delete payload.bio;
      delete payload.education;

      console.log("Payload gửi:", payload);


      const res = await axios.post("http://localhost:3000/api/consultants", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        fetchConsultants();
        handleClosePopup();
      }
    } catch (err) {
      console.error("Lỗi khi thêm consultant:", err);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchClick = async () => {

    if (searchTerm.trim() === "") {
      fetchConsultants();
      return;
    }
    try {
      const res = await axios.get(
        `http://localhost:3000/api/consultants/search/${searchTerm}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setConsultants(res.data.data.consultants);
      }
    } catch (err) {
      console.error("Lỗi khi tìm kiếm consultant:", err);
    }
  };

  const handleOpenDeleteDialog = (consultantId) => {
    setConsultantIdToDelete(consultantId);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setConsultantIdToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!consultantIdToDelete) return;
    try {
      const res = await axios.delete(
        `http://localhost:3000/api/consultants/${consultantIdToDelete}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        fetchConsultants();
      }
    } catch (err) {
      console.error("Lỗi khi xóa consultant:", err);
    }
    handleCloseDeleteDialog();
  };

  // Fetch consultant by ID and open edit popup
  const handleEdit = async (consultantId) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/consultants/${consultantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        const consultant = res.data.data;
        let bio = "";
        let education = "";
        if (consultant && consultant.bio_json) {
          try {
            let bioObj = typeof consultant.bio_json === "string"
              ? JSON.parse(consultant.bio_json)
              : consultant.bio_json;
            bio = bioObj?.bio || "";
            education = bioObj?.education || "";
          } catch {
            bio = "";
            education = "";
          }
        }
        setEditConsultantData({
          ...consultant,
          bio,
          education,
        });
        setEditingConsultantId(consultantId);
        setShowPopup(true);
      }
    } catch (err) {
      console.error("Lỗi khi lấy thông tin consultant:", err);
    }
  };

  // Update consultant info
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingConsultantId) return;
    try {
      const payload = {
        ...editConsultantData,
        bio_json: {
          bio: editConsultantData.bio,
          education: editConsultantData.education,
        },
      };
      delete payload.bio;
      delete payload.education;

      console.log("ID cần update:", editingConsultantId);
      console.log("Payload gửi:", payload);

      const res = await axios.put(`http://localhost:3000/api/consultants/${editingConsultantId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        fetchConsultants();
        handleClosePopup();
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật consultant:", err);
    }
  };

  return (
    <div className="consultant-list-container">
      <div className="top-bar d-flex justify-content-between align-items-center mb-3">
        <button className="btn btn-primary" onClick={handleOpenPopup}>
          <FaPlus style={{ marginRight: "5px" }} /> Tạo
          tư vấn viên mới
        </button>
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <button onClick={handleSearchClick}>
            <FaSearch />
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>#</th>
              <th>Tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {consultants.map((consultant, index) => (
              <tr key={consultant.id_consultant}>
                <td>{index + 1}</td>
                <td>{consultant.name}</td>
                <td>{consultant.email}</td>
                <td>{consultant.role}</td>
                <td>{consultant.status}</td>
                <td>{new Date(consultant.date_create).toLocaleDateString()}</td>
                <td className="action-buttons">
                  <button className="btn btn-light me-2">
                    <FaEdit color="yellow" onClick={() => handleEdit(consultant.id_consultant)}/>
                  </button>
                  <button className="btn btn-light">
                    <FaTrash color="red" onClick={() => handleOpenDeleteDialog(consultant.id_consultant)} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <span className="close" onClick={handleClosePopup}><MdCancel /></span>
            <div className="form">
              <h2>{editingConsultantId ? "Chỉnh sửa Tư vấn viên" : "Tạo mới Tư vấn viên"}</h2>
              <form className="form-grid" onSubmit={editingConsultantId ? handleUpdate : handleSubmit}>
                <input
                  type="text"
                  name="name"
                  placeholder="Họ và tên"
                  value={editingConsultantId ? editConsultantData?.name ?? '' : newConsultant.name}
                  onChange={editingConsultantId ? handleEditChange : handleChange}
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={editingConsultantId ? editConsultantData?.email ?? '' : newConsultant.email}
                  onChange={editingConsultantId ? handleEditChange : handleChange}
                  required
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Mật khẩu"
                  value={editingConsultantId ? '' : newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required={!editingConsultantId}
                />
                <input
                  type="text"
                  name="role"
                  value="Consultant"
                  disabled
                  readOnly
                />
                <input type="hidden" name="role" value="consultant" />
                {editingConsultantId && (
                  <select
                    name="status"
                    value={editConsultantData?.status ?? ''}
                    onChange={handleEditChange}
                    required
                  >
                    <option value="">Chọn trạng thái</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="banned">Banned</option>
                  </select>
                )}
                <input
                  type="number"
                  name="cost"
                  step="10"
                  min="100"
                  placeholder="Chi phí (VND)"
                  value={editingConsultantId ? editConsultantData?.cost ?? '' : newConsultant.cost}
                  onChange={editingConsultantId ? handleEditChange : handleChange}
                  required
                />
                <input
                  type="text"
                  name="certification"
                  placeholder="Chứng chỉ"
                  value={editingConsultantId ? editConsultantData?.certification ?? '' : newConsultant.certification}
                  onChange={editingConsultantId ? handleEditChange : handleChange}
                />
                <input
                  type="text"
                  name="speciality"
                  placeholder="Chuyên môn"
                  value={editingConsultantId ? editConsultantData?.speciality ?? '' : newConsultant.speciality}
                  onChange={editingConsultantId ? handleEditChange : handleChange}
                />
                <input
                  type="date"
                  name="date_of_birth"
                  placeholder="Ngày sinh"
                  value={editingConsultantId ? editConsultantData?.date_of_birth ?? '' : newConsultant.date_of_birth}
                  onChange={editingConsultantId ? handleEditChange : handleChange}
                />
                <input
                  type="text"
                  name="job"
                  placeholder="Nghề nghiệp"
                  value={editingConsultantId ? editConsultantData?.job ?? '' : newConsultant.job}
                  onChange={editingConsultantId ? handleEditChange : handleChange}
                />
                <input
                  name="bio"
                  placeholder="Tiểu sử"
                  className="form-grid-col-span-2"
                  value={editingConsultantId ? editConsultantData?.bio ?? '' : newConsultant.bio}
                  onChange={editingConsultantId ? handleEditChange : handleChange}
                />
                <input
                  name="education"
                  placeholder="Học vấn"
                  className="form-grid-col-span-2"
                  value={editingConsultantId ? editConsultantData?.education ?? '' : newConsultant.education}
                  onChange={editingConsultantId ? handleEditChange : handleChange}
                />
                <button type="submit" className="form-button form-grid-col-span-2">
                  {editingConsultantId ? "Cập nhật" : "Tạo mới"}
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
              <button type="button" className="close position-absolute top-0 end-0 m-2"
                onClick={handleCloseDeleteDialog}
                aria-label="Close"
                style={{ border: 'none', background: 'none' }}>
                <span><MdCancel size={20} /></span>
              </button>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title">Xác nhận xóa</h5>
              </div>
              <div className="modal-body">
                <p>Bạn có chắc chắn muốn xóa tư vấn viên này không?</p>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-secondary" onClick={handleCloseDeleteDialog}>No</button>
                <button type="button" className="btn btn-danger" onClick={handleConfirmDelete}>Yes</button>
              </div>
            </div>
          </div>
        </div>
      )} 
    </div>
  );
};

export default ConsultantListPage;
