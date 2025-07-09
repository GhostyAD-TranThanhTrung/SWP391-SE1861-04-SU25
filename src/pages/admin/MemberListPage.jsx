import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
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
  const handleClosePopup = () => setShowPopup(false);

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

  return (
    <div className="member-list-container">
      <div className="top-bar d-flex justify-content-between align-items-center mb-3">
        <div
          className="search-box"
          style={{
            display: "flex",
            justifyContent: "flex-end",
            margin: "0 auto",
            width: "100%",
          }}
        >
          <input
            type="text"
            placeholder="Tìm kiếm..."
            style={{ background: "white" }}
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
            {members.map((member, index) => (
              <tr key={member.user_id}>
                <td>{index + 1}</td>
                <td>{member.profile.name}</td>
                <td>{member.email}</td>
                <td>{member.role}</td>
                <td>{member.status}</td>
                <td>{new Date(member.date_create).toLocaleDateString()}</td>
                <td className="action-buttons">
                  <button className="btn btn-light me-2" onClick={() => handleView(member.user_id)}>
                    <FaEye color="yellow" />
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

      {showPopup && selectedMember && (
        <div className="popup">
          <div className="popup-content">
            <span className="close" onClick={handleClosePopup}>
              <MdCancel />
            </span>
            <h4>Chi tiết thành viên</h4>
            <div className="member-detail-row">
              <span className="member-detail-label">Tên:</span>
              <span className="member-detail-value">{selectedMember.profile?.name}</span>
            </div>
            <div className="member-detail-row">
              <span className="member-detail-label">Email:</span>
              <span className="member-detail-value">{selectedMember.email}</span>
            </div>
            <div className="member-detail-row">
              <span className="member-detail-label">Vai trò:</span>
              <span className="member-detail-value">{selectedMember.role}</span>
            </div>
            <div className="member-detail-row">
              <span className="member-detail-label">Ngày sinh:</span>
              <span className="member-detail-value">{selectedMember.profile?.date_of_birth}</span>
            </div>
            <div className="member-detail-row">
              <span className="member-detail-label">Nghề nghiệp:</span>
              <span className="member-detail-value">{selectedMember.profile?.job}</span>
            </div>
            <div className="member-detail-row">
              <span className="member-detail-label">Tiểu sử:</span>
              <span className="member-detail-value">{selectedMember.profile?.bio_json?.bio}</span>
            </div>
            <div className="member-detail-row">
              <span className="member-detail-label">Sở thích:</span>
              <span className="member-detail-value">
                {Array.isArray(selectedMember.profile?.bio_json?.interests)
                  ? selectedMember.profile.bio_json.interests.join(', ')
                  : selectedMember.profile?.bio_json?.interests}
              </span>
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
