import { useEffect, useState } from "react";
import { FaEdit, FaSearch, FaEye, FaEyeSlash, FaUsers, FaPlus, FaCrown, FaUserShield, FaUserTie, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { FaTrash } from "react-icons/fa6";
import { MdCancel } from "react-icons/md";
import "../../styles/MemberListPage.scss";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PaginationComp from "../../components/Pagination";
import { assessRiskLevel as assessCrafftRisk } from "../../QuizData/Crafft-Data";
import { assessRiskLevel as assessAssistRisk } from "../../QuizData/Assist_Data";


const MemberListPage = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAllowedToChangePassword, setIsAllowedToChangePassword] = useState(false);
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
  const [loadingStatistics, setLoadingStatistics] = useState(false);
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const maxPageNumbersToShow = 5;

  // Sorting state
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'

  // Statistics state - no longer needed as we'll calculate from filtered data

  // Helper function to calculate risk level from assessment data
  const calculateRiskLevel = (assessment) => {
    try {
      const resultData = typeof assessment.result_json === 'string'
        ? JSON.parse(assessment.result_json)
        : assessment.result_json;

      if (!resultData || resultData.score === undefined) {
        return { riskLevel: 'Không xác định', score: 0 };
      }

      const score = resultData.score;
      let riskLevel = 'Không xác định';
      const assessmentType = assessment.type?.toLowerCase();

      if (assessmentType === 'crafft') {
        // For CRAFFT, we need to check substance use from Part A
        const hasSubstanceUse = resultData.result && resultData.result.some((answer, index) => {
          return index < 3 && answer.score > 0; // First 3 questions are Part A
        });

        // Check CAR question (question 4, index 3)
        const hasCarRisk = resultData.result && resultData.result[3]?.score === 1;

        // Create userAnswers object for CRAFFT assessment
        const userAnswers = {};
        if (resultData.result) {
          resultData.result.forEach((answer, index) => {
            userAnswers[index] = answer;
          });
        }

        riskLevel = assessCrafftRisk(score, userAnswers);
      } else if (assessmentType === 'assist') {
        // For ASSIST, check if it's cannabis or other substances
        const isCannabis = resultData.result && resultData.result[0] &&
          resultData.result[0].selectedOption &&
          resultData.result[0].selectedOption.includes('Cần sa');

        riskLevel = assessAssistRisk(score, isCannabis);
      }

      return { riskLevel, score };
    } catch (error) {
      console.error('Error calculating risk level:', error);
      return { riskLevel: 'Lỗi', score: 0 };
    }
  };

  // Get risk level color class
  const getRiskLevelClass = (riskLevel) => {
    switch (riskLevel.toLowerCase()) {
      case 'thấp':
        return 'bg-success';
      case 'trung bình':
        return 'bg-warning';
      case 'cao':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

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
      if (res.data.role === 'admin' || res.data.role === 'manager' || res.data.role === 'staff') setIsAdmin(true);
      if (res.data.role === 'admin') setIsAllowedToChangePassword(true);
      if (!(res.data.role && (res.data.role === 'admin' || res.data.role === 'manager' || res.data.role === 'staff'))) navigate('/admin/login')
    } catch {
      navigate('/admin/login')
    }

  }
  useEffect(() => {
    (async () => {
      await userRole()
    })()
  }, [])
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

      // Only include password in payload if admin is editing and password was changed
      if (!isAllowedToChangePassword || !showPassword || !editMemberData.password || editMemberData.password.trim() === '' || editMemberData.password === '*********') {
        delete payload.password;
      }

      console.log("Payload gửi:", payload);
      console.log("Editing Member ID:", editingMemberId);
      if (payload.password === '' || payload.password === '*********' || payload.password === null) {
        delete payload.password
      }
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

      setLoadingStatistics(true);
      const res = await axios.get(`http://localhost:3000/api/members/detailed/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('API Response Status:', res.status);
      console.log('API Response Data:', res.data);

      if (res.data.success) {
        console.log('Member detail data received:', res.data.data);
        let memberData = res.data.data;

        // Show popup first with basic data
        setSelectedMember(memberData);
        setShowPopup(true);

        // Try to fetch additional statistics if not already included
        try {
          // Fetch course enrollment status
          const coursesRes = await axios.get(`http://localhost:3000/api/programs/user/${memberId}/enrollment-status`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const enrolledCourses = coursesRes.data.data || [];
          const completedCourses = enrolledCourses.filter(course => course.enrollment_status?.has_complete);
          memberData.completed_courses_count = completedCourses.length;
          memberData.total_courses_count = enrolledCourses.length;

          console.log('Course statistics:', {
            total: enrolledCourses.length,
            completed: completedCourses.length
          });
        } catch (courseError) {
          console.warn('Could not fetch course statistics:', courseError);
          memberData.completed_courses_count = 0;
          memberData.total_courses_count = 0;
        }

        // Try to fetch blog post count
        try {
          const blogsRes = await axios.get(`http://localhost:3000/api/blogs/user/${memberId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          memberData.blog_posts_count = blogsRes.data.data?.length || 0;

          console.log('Blog statistics:', {
            count: memberData.blog_posts_count
          });
        } catch (blogError) {
          console.warn('Could not fetch blog statistics:', blogError);
          memberData.blog_posts_count = 0;
        }

        // Update with complete statistics
        setSelectedMember({ ...memberData });
        console.log('Member detail popup opened successfully with statistics');
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
    } finally {
      setLoadingStatistics(false);
    }
  };

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

  // Sort filtered members
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    if (!sortField) return 0;

    let aValue = a[sortField];
    let bValue = b[sortField];

    // Handle nested properties
    if (sortField === 'name') {
      aValue = a.profile?.name || '';
      bValue = b.profile?.name || '';
    } else if (sortField === 'date_create') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    // Handle string comparisons
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
  const totalItems = sortedMembers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedMembers = sortedMembers.slice(
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
                <div className="small text-muted">Hoạt động</div>
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
                <div className="small text-muted">Không hoạt động</div>
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
                <div className="small text-muted">bị cấm</div>
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
              <th
                onClick={() => handleSort('name')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
                title="Click to sort by name"
              >
                Tên {getSortIcon('name')}
              </th>
              <th
                onClick={() => handleSort('email')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
                title="Click to sort by email"
              >
                Email {getSortIcon('email')}
              </th>
              <th
                onClick={() => handleSort('role')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
                title="Click to sort by role"
              >
                Vai trò {getSortIcon('role')}
              </th>
              <th
                onClick={() => handleSort('status')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
                title="Click to sort by status"
              >
                Trạng thái {getSortIcon('status')}
              </th>
              <th
                onClick={() => handleSort('date_create')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
                title="Click to sort by creation date"
              >
                Ngày tạo {getSortIcon('date_create')}
              </th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginatedMembers.map((member, index) => (
              <tr key={member.user_id}>
                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                <td>{member.profile?.name ? member.profile.name : 'Unnamed'}</td>
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
                  <button className="btn btn-light me-2" onClick={() => handleOpenDeleteDialog(member.user_id)}>
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

              {/* Activity Overview Section */}
              <div className="row mb-4">
                <div className="col-md-4">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body text-center" style={{ backgroundColor: '#e3f2fd' }}>
                      <div className="display-6 mb-2" style={{ color: '#1976d2' }}>📊</div>
                      <h6 className="card-title text-muted">Đánh giá rủi ro</h6>
                      <div className="h4 mb-0" style={{ color: '#1976d2', fontWeight: 'bold' }}>
                        {selectedMember.assessments?.length || 0}
                      </div>
                      <small className="text-muted">lần thực hiện</small>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body text-center" style={{ backgroundColor: '#e8f5e8' }}>
                      <div className="display-6 mb-2" style={{ color: '#28a745' }}>🎓</div>
                      <h6 className="card-title text-muted">Khóa học</h6>
                      {loadingStatistics ? (
                        <div className="spinner-border spinner-border-sm" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      ) : (
                        <>
                          <div className="h4 mb-0" style={{ color: '#28a745', fontWeight: 'bold' }}>
                            {selectedMember.completed_courses_count || 0}
                          </div>
                          <small className="text-muted">hoàn thành</small>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body text-center" style={{ backgroundColor: '#fff3e0' }}>
                      <div className="display-6 mb-2" style={{ color: '#fd7e14' }}>✍️</div>
                      <h6 className="card-title text-muted">Bài blog</h6>
                      {loadingStatistics ? (
                        <div className="spinner-border spinner-border-sm" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      ) : (
                        <>
                          <div className="h4 mb-0" style={{ color: '#fd7e14', fontWeight: 'bold' }}>
                            {selectedMember.blog_posts_count || 0}
                          </div>
                          <small className="text-muted">đã viết</small>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Assessment History */}
              {selectedMember.assessments && selectedMember.assessments.length > 0 ? (
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-header bg-light">
                    <h5 className="mb-0 d-flex align-items-center">
                      <span className="me-2">📋</span>
                      Lịch sử đánh giá rủi ro
                      <span className="badge bg-primary ms-2">{selectedMember.assessments.length}</span>
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      {selectedMember.assessments.slice(0, 3).map((assessment, index) => {
                        const { riskLevel, score } = calculateRiskLevel(assessment);
                        const riskLevelClass = getRiskLevelClass(riskLevel);

                        return (
                          <div key={index} className="col-md-4">
                            <div className="card h-100 border-0" style={{
                              backgroundColor: assessment.type === 'assist' ? '#f8fff8' : '#f0f8ff',
                              border: `2px solid ${assessment.type === 'assist' ? '#28a745' : '#007bff'}20`
                            }}>
                              <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <span className={`badge ${assessment.type === 'assist' ? 'bg-success' : 'bg-primary'}`}>
                                    {assessment.type?.toUpperCase() || 'N/A'}
                                  </span>
                                  <span className={`badge ${riskLevelClass}`}>
                                    {riskLevel}
                                  </span>
                                </div>

                                <div className="mb-2">
                                  <div className="d-flex justify-content-between">
                                    <small className="text-muted">Điểm số:</small>
                                    <strong style={{
                                      color: score >= 15 ? '#dc3545' :
                                        score >= 10 ? '#fd7e14' :
                                          score >= 5 ? '#ffc107' : '#28a745'
                                    }}>
                                      {score}
                                    </strong>
                                  </div>
                                </div>

                                <small className="text-muted d-block">
                                  {assessment.create_at ?
                                    new Date(assessment.create_at).toLocaleDateString('vi-VN') :
                                    'Chưa cập nhật'
                                  }
                                </small>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {selectedMember.assessments.length > 3 && (
                      <div className="text-center mt-3">
                        <small className="text-muted">
                          và {selectedMember.assessments.length - 3} đánh giá khác...
                        </small>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body text-center py-5">
                    <div className="display-6 text-muted mb-3">📋</div>
                    <h6 className="text-muted">Chưa có đánh giá rủi ro</h6>
                    <p className="text-muted mb-0">Thành viên này chưa thực hiện bài đánh giá nào</p>
                  </div>
                </div>
              )}
              {/* Action Buttons */}
              <div className="text-center pt-4 border-top">
                <button
                  className="btn btn-outline-primary btn-lg px-4"
                  onClick={() => {
                    setShowPopup(false);
                    navigate(`/member-list/detail/${selectedMember.user_id || selectedMember.user?.user_id}`);
                  }}
                  style={{
                    borderRadius: '25px',
                    fontWeight: '600',
                    fontSize: '1rem',
                    minWidth: '200px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0,123,255,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  Xem chi tiết đầy đủ
                </button>
                <div className="mt-2">
                  <small className="text-muted">Xem thông tin chi tiết về khóa học, đánh giá và hoạt động</small>
                </div>
              </div>
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
                        if (showPassword && isAllowedToChangePassword) {
                          // When password is visible and user is admin, allow editing
                          setEditMemberData({ ...editMemberData, password: e.target.value });
                        }
                      }}
                      disabled={!showPassword || !isAllowedToChangePassword}
                      className="form-input"
                      style={{ color: '#000', backgroundColor: '#fff' }}
                    />
                    {isAllowedToChangePassword && (
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
                  {!isAllowedToChangePassword ? (
                    <small className="text-muted mt-1">
                      Chỉ admin mới có thể thay đổi mật khẩu
                    </small>
                  ) : showPassword ? (
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
