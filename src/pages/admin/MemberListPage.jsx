import { useEffect, useState } from "react";
import { FaEdit, FaSearch } from "react-icons/fa";
import { FaEye, FaTrash, FaWrench } from "react-icons/fa6";
import { MdCancel } from "react-icons/md";
import "../../styles/MemberListPage.scss";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const MemberListPage = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberIdToDelete, setMemberIdToDelete] = useState(null);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [editMemberData, setEditMemberData] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      alert('Bạn không có quyền truy cập trang này!');
      navigate('/');
    }
  }, [navigate]);

  const fetchMembers = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/members", { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        setMembers(res.data.data);
      }
    } catch (err) {
      console.error("Lỗi khi gọi API:", err);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setEditingMemberId(null);
    setEditMemberData(null);
    setSelectedMember(null);
  };

  const handleEditChange = (e) => {
    setEditMemberData({ ...editMemberData, [e.target.name]: e.target.value });
  };

  const handleEdit = (memberId) => {
    const member = members.find((m) => m.user_id === memberId);
    if (member) {
      const flatData = {
        email: member.email,
        role: member.role,
        status: member.status,
        name: member.profile?.name || "",
        bio: member.profile?.bio_json?.bio || "",
        interests: member.profile?.bio_json?.interests || "",
        date_of_birth: member.profile?.date_of_birth?.slice(0, 10) || "",
        job: member.profile?.job || "",
      };
      setEditMemberData(flatData);
      setEditingMemberId(memberId);
      setShowPopup(true);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...editMemberData,
        bio_json: {
          bio: editMemberData.bio,
          interests: editMemberData.interests,
        },
      };
      delete payload.bio;
      delete payload.interests;

      console.log("Payload gửi:", payload);
      console.log("Editing Member ID:", editingMemberId);

      const res = await axios.put(
        `http://localhost:3000/api/members/${editingMemberId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        fetchMembers();
        handleClosePopup();
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật thành viên:", err);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchClick = async () => {
    if (searchTerm.trim() === '') {
      fetchMembers();
      return;
    }
    try {
      const res = await axios.get(`http://localhost:3000/api/members/search/${searchTerm}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        setMembers(res.data.data);
      }
    } catch (err) {
      console.error("Lỗi khi tìm kiếm thành viên:", err);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleOpenDeleteDialog = (memberId) => {
    setMemberIdToDelete(memberId);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setMemberIdToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!memberIdToDelete) return;
    try {
      const res = await axios.delete(
        `http://localhost:3000/api/members/${memberIdToDelete}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        fetchMembers();
      }
    } catch (err) {
      console.error("Lỗi khi xóa thành viên:", err);
    }
    handleCloseDeleteDialog();
  };

  const handleView = async (memberId) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/members/${memberId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        setSelectedMember(res.data.data);
        setShowPopup(true);
      }
    } catch (err) {
      console.error("Lỗi khi lấy thông tin thành viên:", err);
    }
  };

  // Filter members by status and search term (frontend)
  const filteredMembers = members.filter(member =>
    (statusFilter === '' || member.status === statusFilter) &&
    (searchTerm === '' || member.profile?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="member-container">
      <div className="top-bar d-flex justify-content-between align-items-center mb-3">
        <div className="search-box" style={{ display: "flex", justifyContent: "flex-end", margin: "0 auto", width: "100%" }}>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="banned">Banned</option>
          </select>
          <input
            type="text"
            placeholder="Tìm kiếm thành viên..."
            style={{ background: "white" }}
            value={searchTerm}
            onChange={handleSearch}
          />
          <button className="btn btn-outline-secondary" onClick={handleSearchClick}>
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
            {filteredMembers.map((member, index) => (
              <tr key={member.user_id}>
                <td>{index + 1}</td>
                <td>{member.profile.name}</td>
                <td>{member.email}</td>
                <td>{member.role}</td>
                <td>{member.status}</td>
                <td>{new Date(member.date_create).toLocaleDateString()}</td>
                <td className="action-buttons">
                  <button className="btn btn-light me-2" onClick={() => handleView(member.user_id)}>
                    <FaEye />
                  </button>
                  <button className="btn btn-light me-2" onClick={() => handleEdit(member.user_id)}>
                    <FaEdit color="yellow" />
                  </button>
                  <button className="btn btn-light" onClick={() => handleOpenDeleteDialog(member.user_id)}>
                    <FaTrash color="red" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Member Details Popup */}
      {showPopup && selectedMember && !editingMemberId && (
        <div className="popup" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="popup-content member-detail" style={{ minWidth: 400, maxWidth: 500, padding: 32, borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.15)' }}>
            <span className="close" onClick={handleClosePopup} style={{ position: 'absolute', top: 16, right: 16, cursor: 'pointer' }}>
              <MdCancel size={28} />
            </span>
            <h2 style={{ fontWeight: 700, marginBottom: 24 }}>Chi tiết thành viên</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
              <div className="member-detail-row">
                <span className="member-detail-label">Tên: {' '}</span>
                <span className="member-detail-value">{selectedMember.profile?.name}</span>
              </div>
              <div className="member-detail-row">
                <span className="member-detail-label">Email: {' '}</span>
                <span className="member-detail-value">{selectedMember.email}</span>
              </div>
              <div className="member-detail-row">
                <span className="member-detail-label">Vai trò: {' '}</span>
                <span className="member-detail-value">{selectedMember.role}</span>
              </div>
              <div className="member-detail-row">
                <span className="member-detail-label">Ngày sinh: {' '}</span>
                <span className="member-detail-value">{selectedMember.profile?.date_of_birth}</span>
              </div>
              <div className="member-detail-row">
                <span className="member-detail-label">Nghề nghiệp: {' '}</span>
                <span className="member-detail-value">{selectedMember.profile?.job}</span>
              </div>
              <div className="member-detail-row">
                <span className="member-detail-label">Tiểu sử: {' '}</span>
                <span className="member-detail-value">{selectedMember.profile?.bio_json?.bio}</span>
              </div>
              <div className="member-detail-row">
                <span className="member-detail-label">Sở thích: {' '}</span>
                <span className="member-detail-value">
                  {Array.isArray(selectedMember.profile?.bio_json?.interests)
                    ? selectedMember.profile.bio_json.interests.join(', ')
                    : selectedMember.profile?.bio_json?.interests}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Popup */}
      {showPopup && editingMemberId && editMemberData && (
        <div className="popup" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="popup-content" style={{ minWidth: 400, maxWidth: 500, padding: 32, borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.15)' }}>
            <span className="close" onClick={handleClosePopup} style={{ position: 'absolute', top: 16, right: 16, cursor: 'pointer' }}>
              <MdCancel size={28} />
            </span>
            <div className="form">
              <h2 style={{ textAlign: 'center', fontWeight: 700, marginBottom: 24 }}>Chỉnh sửa thành viên</h2>
              <form className="form-grid" onSubmit={handleUpdateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <input
                    type="text"
                    name="email"
                    placeholder="Email"
                    value={editMemberData?.email || ""}
                    onChange={handleEditChange}
                    required
                    disabled
                    style={{ flex: 1 }}
                  />
                  <select
                    name="role"
                    value={editMemberData?.role || ""}
                    onChange={handleEditChange}
                    required
                    disabled
                    style={{ flex: 1 }}
                  >
                    <option value="">Chọn vai trò</option>
                    <option value="member">Member</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <select
                    name="status"
                    value={editMemberData?.status || ""}
                    onChange={handleEditChange}
                    required
                    style={{ flex: 1 }}
                  >
                    <option value="">Chọn trạng thái</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="banned">Banned</option>
                  </select>
                  <input
                    type="text"
                    name="name"
                    placeholder="Tên"
                    value={editMemberData?.name || ""}
                    onChange={handleEditChange}
                    required
                    disabled
                    style={{ flex: 1 }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <input
                    type="text"
                    name="bio"
                    placeholder="Tiểu sử"
                    value={editMemberData?.bio || ""}
                    onChange={handleEditChange}
                    disabled
                    style={{ flex: 1 }}
                  />
                  <input
                    type="text"
                    name="education"
                    placeholder="Học vấn"
                    value={editMemberData?.interests || ""}
                    onChange={handleEditChange}
                    disabled
                    style={{ flex: 1 }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={editMemberData?.date_of_birth || ""}
                    onChange={handleEditChange}
                    disabled
                    style={{ flex: 1 }}
                  />
                  <input
                    type="text"
                    name="job"
                    placeholder="Công việc"
                    value={editMemberData?.job || ""}
                    onChange={handleEditChange}
                    disabled
                    style={{ flex: 1 }}
                  />
                </div>
                <button type="submit" className="form-button" style={{ margin: '0 auto', width: 160, marginTop: 12 }}>
                  Cập nhật
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
                <p>Bạn có chắc chắn muốn xóa thành viên này không?</p>
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

export default MemberListPage;
