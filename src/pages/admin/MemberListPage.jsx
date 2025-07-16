import { useEffect, useState } from "react";
import { FaEdit, FaSearch, FaEye, FaEyeSlash, FaUsers, FaPlus, FaCrown, FaUserShield, FaUserTie } from "react-icons/fa";
import { FaTrash } from "react-icons/fa6";
import { MdCancel } from "react-icons/md";
import "../../styles/MemberListPage.scss";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PaginationComp from "../../components/Pagination";


const MemberListPage = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberIdToDelete, setMemberIdToDelete] = useState(null);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [editMemberData, setEditMemberData] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const maxPageNumbersToShow = 5;
  
  // Statistics state - no longer needed as we'll calculate from filtered data

  useEffect(() => {
    if (!token) {
      alert('Bạn không có quyền truy cập trang này!');
      navigate('/');
    }
  }, [navigate]);
  const userRole = async () => {
    try {
      if (!token) navigate('/admin/login')
      const res = await axios.get('http://localhost:3000/api/user/role/',
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.data.role === 'admin') setIsAdmin(true);
      if (!(res.data.role && (res.data.role === 'admin' || res.data.role === 'manager'))) navigate('/admin/login')
    } catch {
      navigate('/admin/login')
    }

  }
  userRole()
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
    setShowPassword(false);
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
        password: member.password || "", // Include password for admin view
      };
      setEditMemberData(flatData);
      setEditingMemberId(memberId);
      setShowPassword(false);
      setShowPopup(true);
    }
  };

  // Function to get password display value
  const getPasswordDisplayValue = () => {
    if (editingMemberId) {
      // When editing existing member
      if (showPassword) {
        return editMemberData?.password || ""; // Show actual password when admin toggles visibility
      } else {
        return "*********"; // Hide password by default when editing
      }
    } else {
      // Not applicable for members since we don't create new members in this page
      return "";
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
        const { data } = res.data;
        
        if (data.action === "status_changed_to_inactive") {
          // Member has references, status changed to inactive
          alert(`Thành viên có ${data.references.total_count} tham chiếu (${data.references.blogs_count} blog, ${data.references.booking_sessions_count} phiên tư vấn, ${data.references.survey_responses_count} phản hồi khảo sát, ${data.references.assessments_count} đánh giá).\nTrạng thái đã được chuyển thành "Không hoạt động" thay vì xóa.`);
        } else if (data.action === "completely_deleted") {
          // Member was completely deleted
          let deletedEntities = [];
          if (data.deleted_entities.profile) deletedEntities.push("hồ sơ cá nhân");
          if (data.deleted_entities.user) deletedEntities.push("tài khoản người dùng");
          
          alert(`Xóa thành viên thành công!\nĐã xóa: ${deletedEntities.join(", ")}`);
        } else {
          // Fallback message
          alert("Thao tác thành công!");
        }
        
        // Refresh the member list to reflect changes
        fetchMembers();
      }
    } catch (err) {
      console.error("Lỗi khi xóa thành viên:", err);
      if (err.response?.data?.message) {
        alert(`Lỗi: ${err.response.data.message}`);
      } else {
        alert("Có lỗi xảy ra khi thực hiện thao tác. Vui lòng thử lại.");
      }
    }
    handleCloseDeleteDialog();
  };

  const handleView = async (memberId) => {
    try {
      console.log('=== MEMBER DETAIL API CALL START ===');
      console.log('Member ID:', memberId);
      console.log('API URL:', `http://localhost:3000/api/members/detailed/${memberId}`);
      console.log('Token exists:', !!token);

      const res = await axios.get(`http://localhost:3000/api/members/detailed/${memberId}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });

      console.log('API Response Status:', res.status);
      console.log('API Response Data:', res.data);

      if (res.data.success) {
        console.log('Member detail data received:', res.data.data);
        setSelectedMember(res.data.data);
        setShowPopup(true);
        console.log('Member detail popup opened successfully');
      } else {
        console.error("Failed to fetch member details:", res.data.message);
        console.log('API returned success: false');
        alert("Không thể tải thông tin chi tiết thành viên");
      }
      console.log('=== MEMBER DETAIL API CALL END ===');
    } catch (err) {
      console.error("=== MEMBER DETAIL API ERROR ===");
      console.error("Error details:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      console.error("Error message:", err.message);
      alert("Có lỗi xảy ra khi tải thông tin thành viên");
    }
  };

  // Filter members by status, search term, and inactive visibility (frontend)
  const filteredMembers = members.filter(member => {
    // Hide inactive users by default unless showInactive is true
    if (!showInactive && member.status === 'inactive') {
      return false;
    }
    // Apply status filter and search term
    return (statusFilter === '' || member.status === statusFilter) &&
           (searchTerm === '' || member.profile?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  // Pagination logic
  const totalItems = filteredMembers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate statistics from all members data
  const activeCount = members.filter(m => m.status === 'active').length;
  const inactiveCount = members.filter(m => m.status === 'inactive').length;
  const bannedCount = members.filter(m => m.status === 'banned').length;

  useEffect(() => {
    // Reset to page 1 if filter/search changes and currentPage is out of range
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
    // eslint-disable-next-line
  }, [statusFilter, searchTerm, showInactive, totalPages]);

  return (
    <div className="staff-container">
      
      <div className="row g-4 mb-4">
        {/* Total Members Card */}
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
                  <FaUsers />
                </div>
              </div>
              <div className="ms-3">
                <div className="small text-muted">Tổng số thành viên</div>
                <div className="h3 mb-0 fw-bold">{totalItems}</div>
                <div className="small text-muted">trong danh sách</div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Members Card */}
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
                  <FaUsers />
                </div>
              </div>
              <div className="ms-3">
                <div className="small text-muted">Thành viên hoạt động</div>
                <div className="h3 mb-0 fw-bold">{activeCount}</div>
                <div className="small text-muted">active</div>
              </div>
            </div>
          </div>
        </div>

        {/* Inactive Members Card */}
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
                  <FaUsers />
                </div>
              </div>
              <div className="ms-3">
                <div className="small text-muted">Không hoạt động</div>
                <div className="h3 mb-0 fw-bold">{inactiveCount}</div>
                <div className="small text-muted">inactive</div>
              </div>
            </div>
          </div>
        </div>

        {/* Banned Members Card */}
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
                  <FaUsers />
                </div>
              </div>
              <div className="ms-3">
                <div className="small text-muted">Bị cấm</div>
                <div className="h3 mb-0 fw-bold">{bannedCount}</div>
                <div className="small text-muted">banned</div>
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
                onClick={() => setShowInactive(!showInactive)} 
                className={`btn shadow-sm ${showInactive ? 'btn-warning' : 'btn-outline-warning'}`}
                title={showInactive ? "Ẩn người dùng không hoạt động" : "Hiển thị người dùng không hoạt động"}
              >
                {showInactive ? "Ẩn không hoạt động" : "Hiện không hoạt động"}
              </button>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <select
                className="form-select shadow-sm"
                style={{ minWidth: '150px' }}
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="banned">Banned</option>
              </select>
              <div className="input-group" style={{ minWidth: '250px' }}>
                <input
                  type="text"
                  className="form-control shadow-sm"
                                      placeholder="Tìm kiếm thành viên..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <button className="btn btn-outline-secondary shadow-sm" onClick={handleSearchClick}>
                  <FaSearch />
                </button>
              </div>
            </div>
          </div>
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
            {paginatedMembers.map((member, index) => (
              <tr key={member.user_id}>
                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                <td>{member.profile.name}</td>
                <td>{member.email}</td>
                <td>{member.role}</td>
                <td>{member.status}</td>
                <td>{new Date(member.date_create).toLocaleDateString()}</td>
                <td className="action-buttons">
                  <button className="btn btn-light me-2" onClick={() => handleView(member.user_id)}>
                    <FaEye />
                  </button>
                  <button disabled={!isAdmin} className="btn btn-light me-2" onClick={() => handleEdit(member.user_id)}>
                    <FaEdit color="yellow" />
                  </button>
                  <button disabled={!isAdmin} className="btn btn-light me-2" onClick={() => handleOpenDeleteDialog(member.user_id)}>
                    <FaTrash color="red" />
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

      {/* View Member Details Popup */}
      {showPopup && selectedMember && !editingMemberId && (
        <div className="popup" style={{ zIndex: 1050 }}>
          <div className="popup-content" style={{
            maxWidth: '800px',
            maxHeight: '90vh',
            overflowY: 'auto',
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }}>
            <span className="close" onClick={handleClosePopup} style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
              zIndex: 1051
            }}>
              <MdCancel />
            </span>
            <div style={{ padding: '20px' }}>
              <h4 style={{
                marginBottom: '20px',
                color: '#333',
                borderBottom: '2px solid #007bff',
                paddingBottom: '10px',
                fontSize: '1.5rem'
              }}>Chi tiết thông tin thành viên</h4>

              {/* Basic Information Section */}
              <div className="info-section" style={{
                backgroundColor: '#f8f9fa',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #e9ecef'
              }}>
                <h5 style={{
                  color: '#495057',
                  marginBottom: '15px',
                  fontSize: '1.1rem',
                  borderBottom: '1px solid #dee2e6',
                  paddingBottom: '8px'
                }}>🧑‍💼 Thông tin cơ bản</h5>

                <div className="row">
                  <div className="col-md-6">
                    <div className="member-detail-row">
                      <span className="member-detail-label">ID thành viên:</span>
                      <span className="member-detail-value">{selectedMember.user?.user_id || selectedMember.profile?.user_id || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="member-detail-row">
                      <span className="member-detail-label">Họ và tên:</span>
                      <span className="member-detail-value" style={{ fontWeight: 'bold' }}>{selectedMember.profile?.name || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="member-detail-row">
                      <span className="member-detail-label">Email:</span>
                      <span className="member-detail-value">{selectedMember.user?.email || selectedMember.email || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="member-detail-row">
                      <span className="member-detail-label">Nghề nghiệp:</span>
                      <span className="member-detail-value">{selectedMember.profile?.job || 'Chưa cập nhật'}</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="member-detail-row">
                      <span className="member-detail-label">Ngày sinh:</span>
                      <span className="member-detail-value">
                        {selectedMember.profile?.date_of_birth ?
                          new Date(selectedMember.profile.date_of_birth).toLocaleDateString('vi-VN') :
                          'Chưa cập nhật'}
                      </span>
                    </div>
                    <div className="member-detail-row">
                      <span className="member-detail-label">Vai trò:</span>
                      <span className="member-detail-value">{selectedMember.user?.role || selectedMember.role || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="member-detail-row">
                      <span className="member-detail-label">Trạng thái:</span>
                      <span className="member-detail-value">
                        <span className={`status-badge ${(selectedMember.user?.status || selectedMember.status)?.toLowerCase()}`}>
                          {selectedMember.user?.status || selectedMember.status || 'Không xác định'}
                        </span>
                      </span>
                    </div>
                    <div className="member-detail-row">
                      <span className="member-detail-label">Ngày tạo tài khoản:</span>
                      <span className="member-detail-value">
                        {(selectedMember.user?.date_create || selectedMember.date_create) ?
                          new Date(selectedMember.user?.date_create || selectedMember.date_create).toLocaleDateString('vi-VN') :
                          'Chưa cập nhật'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bio and Interests */}
                {(selectedMember.profile?.bio_json?.bio || selectedMember.profile?.bio_json?.interests) && (
                  <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #dee2e6' }}>
                    {selectedMember.profile?.bio_json?.bio && (
                      <div className="member-detail-row">
                        <span className="member-detail-label">Tiểu sử:</span>
                        <span className="member-detail-value">{selectedMember.profile.bio_json.bio}</span>
                      </div>
                    )}
                    {selectedMember.profile?.bio_json?.interests && (
                      <div className="member-detail-row">
                        <span className="member-detail-label">Sở thích:</span>
                        <span className="member-detail-value">
                          {Array.isArray(selectedMember.profile.bio_json.interests)
                            ? selectedMember.profile.bio_json.interests.join(', ')
                            : selectedMember.profile.bio_json.interests}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Assessment Summary Section */}
              <div className="info-section" style={{
                backgroundColor: '#e3f2fd',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #bbdefb'
              }}>
                <h5 style={{
                  color: '#1565c0',
                  marginBottom: '15px',
                  fontSize: '1.1rem',
                  borderBottom: '1px solid #90caf9',
                  paddingBottom: '8px'
                }}>📊 Tổng quan đánh giá</h5>

                <div className="member-detail-row">
                  <span className="member-detail-label">Số lượng đánh giá:</span>
                  <span className="member-detail-value">
                    <span style={{
                      backgroundColor: '#1976d2',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '15px',
                      fontSize: '0.9em',
                      fontWeight: 'bold'
                    }}>
                      {selectedMember.assessment_count || 0} lần
                    </span>
                  </span>
                </div>
              </div>

              {/* Assessment Details */}
              {selectedMember.assessments && selectedMember.assessments.length > 0 && (
                <div className="info-section" style={{
                  backgroundColor: '#fff3e0',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  border: '1px solid #ffcc02'
                }}>
                  <h5 style={{
                    color: '#e65100',
                    marginBottom: '15px',
                    fontSize: '1.1rem',
                    borderBottom: '1px solid #ffb74d',
                    paddingBottom: '8px'
                  }}>📋 Lịch sử đánh giá chi tiết</h5>
                  {selectedMember.assessments.map((assessment, index) => {
                    // Parse result_json to extract meaningful data
                    let parsedResult = null;
                    let totalScore = 0;
                    let questionCount = 0;

                    try {
                      if (assessment.result_json) {
                        parsedResult = JSON.parse(assessment.result_json);
                        if (parsedResult.result && Array.isArray(parsedResult.result)) {
                          questionCount = parsedResult.result.length;
                          totalScore = parsedResult.score || 0;
                        }
                      }
                    } catch (e) {
                      console.error('Error parsing assessment result:', e);
                    }

                    return (
                      <div key={index} className="assessment-item" style={{
                        backgroundColor: '#ffffff',
                        padding: '20px',
                        margin: '15px 0',
                        borderRadius: '10px',
                        border: '2px solid #e9ecef',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease'
                      }}>
                        <div className="member-detail-row">
                          <span className="member-detail-label">Loại đánh giá:</span>
                          <span className="member-detail-value">
                            <strong style={{
                              color: assessment.type === 'assist' ? '#28a745' :
                                assessment.type === 'crafft' ? '#007bff' : '#6c757d',
                              textTransform: 'uppercase'
                            }}>
                              {assessment.type || 'Chưa xác định'}
                            </strong>
                          </span>
                        </div>
                        <div className="member-detail-row">
                          <span className="member-detail-label">Mô tả:</span>
                          <span className="member-detail-value">{assessment.description || 'Không có mô tả'}</span>
                        </div>
                        <div className="member-detail-row">
                          <span className="member-detail-label">Ngày thực hiện:</span>
                          <span className="member-detail-value">
                            {assessment.created_at ?
                              new Date(assessment.created_at).toLocaleDateString('vi-VN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) :
                              'Chưa cập nhật'}
                          </span>
                        </div>

                        {parsedResult && (
                          <div className="assessment-results" style={{ marginTop: '15px' }}>
                            <div className="result-summary" style={{
                              backgroundColor: '#fff',
                              padding: '10px',
                              borderRadius: '5px',
                              border: '1px solid #dee2e6',
                              marginBottom: '10px'
                            }}>
                              <div className="member-detail-row">
                                <span className="member-detail-label">Tổng điểm:</span>
                                <span className="member-detail-value">
                                  <strong style={{
                                    color: totalScore >= 15 ? '#dc3545' :
                                      totalScore >= 10 ? '#fd7e14' :
                                        totalScore >= 5 ? '#ffc107' : '#28a745',
                                    fontSize: '1.1em'
                                  }}>
                                    {totalScore}
                                  </strong>
                                </span>
                              </div>
                              <div className="member-detail-row">
                                <span className="member-detail-label">Số câu hỏi:</span>
                                <span className="member-detail-value">{questionCount} câu</span>
                              </div>
                              <div className="member-detail-row">
                                <span className="member-detail-label">Mức độ rủi ro:</span>
                                <span className="member-detail-value">
                                  <span style={{
                                    padding: '3px 8px',
                                    borderRadius: '3px',
                                    fontSize: '0.9em',
                                    fontWeight: 'bold',
                                    color: 'white',
                                    backgroundColor: totalScore >= 15 ? '#dc3545' :
                                      totalScore >= 10 ? '#fd7e14' :
                                        totalScore >= 5 ? '#ffc107' : '#28a745'
                                  }}>
                                    {totalScore >= 15 ? 'Cao' :
                                      totalScore >= 10 ? 'Trung bình' :
                                        totalScore >= 5 ? 'Thấp' : 'Rất thấp'}
                                  </span>
                                </span>
                              </div>
                            </div>

                            {parsedResult.result && (
                              <div className="question-details">
                                <h6 style={{
                                  margin: '15px 0 10px 0',
                                  color: '#495057',
                                  fontSize: '1rem',
                                  fontWeight: 'bold'
                                }}>💭 Chi tiết câu trả lời:</h6>
                                <div style={{
                                  maxHeight: '250px',
                                  overflowY: 'auto',
                                  backgroundColor: '#f8f9fa',
                                  padding: '10px',
                                  borderRadius: '8px',
                                  border: '1px solid #e9ecef'
                                }}>
                                  {parsedResult.result.map((question, qIndex) => (
                                    <div key={qIndex} style={{
                                      padding: '8px 12px',
                                      margin: '4px 0',
                                      backgroundColor: question.score > 2 ? '#ffebee' : '#f1f8e9',
                                      borderRadius: '6px',
                                      fontSize: '0.9em',
                                      borderLeft: `4px solid ${question.score > 2 ? '#f44336' : '#4caf50'}`,
                                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                    }}>
                                      <strong>Q{question.questionId}:</strong>
                                      <span style={{ marginLeft: '5px' }}>
                                        Lựa chọn {question.selectedOption}
                                        <span style={{
                                          color: question.score > 2 ? '#d32f2f' : '#388e3c',
                                          fontWeight: 'bold',
                                          marginLeft: '5px'
                                        }}>
                                          ({question.score} điểm)
                                        </span>
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {!parsedResult && assessment.result_json && (
                          <div className="member-detail-row">
                            <span className="member-detail-label">Kết quả:</span>
                            <span className="member-detail-value" style={{ fontSize: '0.9em', color: '#666' }}>
                              Dữ liệu đánh giá không thể hiển thị
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* No assessments message */}
              {(!selectedMember.assessments || selectedMember.assessments.length === 0) && (
                <div className="info-section" style={{
                  backgroundColor: '#f8f9fa',
                  padding: '20px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  border: '1px solid #e9ecef'
                }}>
                  <p style={{ color: '#6c757d', margin: 0, fontSize: '1rem' }}>
                    🔍 Thành viên này chưa thực hiện đánh giá nào
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Popup */}
      {showPopup && editingMemberId && editMemberData && (
        <div className="popup">
          <div className="popup-content">
            <span className="close" onClick={handleClosePopup}>
              <MdCancel size={28} />
            </span>
            <div className="form">
              <h2>Chỉnh sửa thành viên</h2>
              <form className="form-grid" onSubmit={handleUpdateSubmit}>
                
                {/* User Information Section */}
                <div className="form-section-header form-grid-col-span-2">
                  <h3>Thông tin tài khoản</h3>
                </div>

                {/* Email */}
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="text"
                    name="email"
                    placeholder="Email"
                    value={editMemberData?.email || ""}
                    onChange={handleEditChange}
                    required
                    disabled
                    className="form-input"
                    style={{ color: '#000', backgroundColor: '#fff' }}
                  />
                </div>

                {/* Mật khẩu */}
                <div className="form-group">
                  <label className="form-label">Mật khẩu *</label>
                  <div className="d-flex align-items-center">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Mật khẩu"
                      value={getPasswordDisplayValue()}
                      onChange={(e) => {
                        if (showPassword) {
                          // When password is visible, allow editing
                          setEditMemberData({ ...editMemberData, password: e.target.value });
                        }
                      }}
                      disabled={!showPassword}
                      className="form-input"
                      style={{ color: '#000', backgroundColor: '#fff' }}
                    />
                    {isAdmin && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary ms-2"
                        onClick={() => setShowPassword(!showPassword)}
                        title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    )}
                  </div>
                  {showPassword ? (
                    <small className="text-muted mt-1">
                      Để trống nếu không muốn thay đổi mật khẩu
                    </small>
                  ) : (
                    <small className="text-muted mt-1">
                      Nhấn nút mắt để xem/chỉnh sửa mật khẩu
                    </small>
                  )}
                </div>

                {/* Vai trò */}
                <div className="form-group">
                  <label className="form-label">Vai trò *</label>
                  <select
                    name="role"
                    value={editMemberData?.role || ""}
                    onChange={handleEditChange}
                    required
                    disabled
                    className="form-select"
                    style={{ color: '#000', backgroundColor: '#fff' }}
                  >
                    <option value="">Chọn vai trò</option>
                    <option value="member">Member</option>
                  </select>
                </div>

                {/* Trạng thái */}
                <div className="form-group">
                  <label className="form-label">Trạng thái</label>
                  <select
                    name="status"
                    value={editMemberData?.status || ""}
                    onChange={handleEditChange}
                    required
                    className="form-select"
                    style={{ color: '#000', backgroundColor: '#fff' }}
                  >
                    <option value="">Chọn trạng thái</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="banned">Banned</option>
                  </select>
                </div>

                {/* Profile Information Section */}
                <div className="form-section-header form-grid-col-span-2">
                  <h3>Thông tin cá nhân</h3>
                </div>

                {/* Tên */}
                <div className="form-group">
                  <label className="form-label">Tên *</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Tên"
                    value={editMemberData?.name || ""}
                    onChange={handleEditChange}
                    required
                    disabled
                    className="form-input"
                    style={{ color: '#000', backgroundColor: '#fff' }}
                  />
                </div>

                {/* Ngày sinh */}
                <div className="form-group">
                  <label className="form-label">Ngày sinh</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={editMemberData?.date_of_birth || ""}
                    onChange={handleEditChange}
                    disabled
                    className="form-input"
                    style={{ color: '#000', backgroundColor: '#fff' }}
                  />
                </div>

                {/* Công việc */}
                <div className="form-group">
                  <label className="form-label">Công việc</label>
                  <input
                    type="text"
                    name="job"
                    placeholder="Công việc"
                    value={editMemberData?.job || ""}
                    onChange={handleEditChange}
                    disabled
                    className="form-input"
                    style={{ color: '#000', backgroundColor: '#fff' }}
                  />
                </div>

                {/* Sở thích */}
                <div className="form-group">
                  <label className="form-label">Sở thích</label>
                  <input
                    type="text"
                    name="interests"
                    placeholder="Sở thích"
                    value={editMemberData?.interests || ""}
                    onChange={handleEditChange}
                    disabled
                    className="form-input"
                    style={{ color: '#000', backgroundColor: '#fff' }}
                  />
                </div>

                {/* Tiểu sử - Full Width */}
                <div className="form-group form-grid-col-span-2">
                  <label className="form-label">Tiểu sử</label>
                  <textarea
                    name="bio"
                    placeholder="Tiểu sử"
                    value={editMemberData?.bio || ""}
                    onChange={handleEditChange}
                    disabled
                    className="form-textarea"
                    rows="4"
                    style={{ color: '#000', backgroundColor: '#fff', resize: 'vertical' }}
                  />
                </div>

                {/* Submit Button */}
                <button type="submit" className="form-button form-grid-col-span-2">
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
                <h5 className="modal-title">Xác nhận thao tác</h5>
              </div>
              <div className="modal-body">
                <p>Bạn có chắc chắn muốn thực hiện thao tác này không?</p>
                <small className="text-muted">
                  Lưu ý: Nếu thành viên có blog, phiên tư vấn, phản hồi khảo sát hoặc đánh giá, trạng thái sẽ được chuyển thành "Không hoạt động" thay vì xóa hoàn toàn.
                </small>
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
