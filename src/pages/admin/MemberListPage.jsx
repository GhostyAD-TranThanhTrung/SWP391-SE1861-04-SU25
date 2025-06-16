import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { FaEye, FaTrash, FaWrench } from "react-icons/fa6";
import { MdCancel } from "react-icons/md";
import "../../styles/MemberListPage.scss";
import axios from "axios";

const MemberListPage = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const token = sessionStorage.getItem("token");

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
      console.error("Lỗi khi tìm kiếm member:", err);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleDelete = async (memberId) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        const res = await axios.delete(`http://localhost:3000/api/members/${memberId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data.success) {
          fetchMembers();
        }
      } catch (err) {
        console.error("Lỗi khi xóa staff:", err);
      }
    }
  };

  const handleView = async (memberId) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/members/${memberId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        setSelectedMember(res.data.data);
        setShowPopup(true);
      }
    } catch (err) {
      console.error("Lỗi khi lấy thông tin member:", err);
    }
  };

  return (
    <div className="staff-list-container">
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
            placeholder="Search..."
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
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Creation date</th>
              <th>Actions</th>
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
                  <button className="btn btn-light" onClick={() => handleDelete(member.user_id)}>
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
            <h4>Member Detail</h4>
            <div className="member-detail-row">
              <span className="member-detail-label">Name:</span>
              <span className="member-detail-value">{selectedMember.profile?.name}</span>
            </div>
            <div className="member-detail-row">
              <span className="member-detail-label">Email:</span>
              <span className="member-detail-value">{selectedMember.email}</span>
            </div>
            <div className="member-detail-row">
              <span className="member-detail-label">Role:</span>
              <span className="member-detail-value">{selectedMember.role}</span>
            </div>
            <div className="member-detail-row">
              <span className="member-detail-label">Date of birth:</span>
              <span className="member-detail-value">{selectedMember.profile?.date_of_birth}</span>
            </div>
            <div className="member-detail-row">
              <span className="member-detail-label">Job:</span>
              <span className="member-detail-value">{selectedMember.profile?.job}</span>
            </div>
            <div className="member-detail-row">
              <span className="member-detail-label">Bio:</span>
              <span className="member-detail-value">{selectedMember.profile?.bio_json?.bio}</span>
            </div>
            <div className="member-detail-row">
              <span className="member-detail-label">Interest:</span>
              <span className="member-detail-value">
                {Array.isArray(selectedMember.profile?.bio_json?.interests)
                  ? selectedMember.profile.bio_json.interests.join(', ')
                  : selectedMember.profile?.bio_json?.interests}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberListPage;
