import { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch, FaPlus, FaEdit, FaEye, FaFlag } from "react-icons/fa";
import { FaTrash } from "react-icons/fa6";
import { MdCancel, MdVisibility, MdVisibilityOff } from "react-icons/md";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import "../../styles/StaffListPage.scss";

const BlogListPage = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [newBlog, setNewBlog] = useState({
    title: "",
    body: "",
    status: "published"
  });
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [editBlogData, setEditBlogData] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blogIdToDelete, setBlogIdToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewBlogModal, setViewBlogModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [flagDetailsModal, setFlagDetailsModal] = useState(false);
  const [selectedBlogFlags, setSelectedBlogFlags] = useState([]);
  const token = sessionStorage.getItem("token");

  // React Quill modules configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent', 'color', 'background', 'link'
  ];

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3000/api/blogs/admin", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setBlogs(res.data.data);
      }
    } catch (err) {
      console.error("Lỗi khi gọi API blogs:", err);
      // Fallback to regular blogs endpoint if admin endpoint doesn't exist
      try {
        const res = await axios.get("http://localhost:3000/api/blogs", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setBlogs(res.data.data);
        }
      } catch (fallbackErr) {
        console.error("Lỗi khi gọi API blogs fallback:", fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogFlags = async (blogId) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/flags/blog/${blogId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setSelectedBlogFlags(res.data.data);
        setFlagDetailsModal(true);
      }
    } catch (err) {
      console.error("Lỗi khi lấy flags:", err);
      alert("Không thể tải thông tin flags");
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleOpenPopup = () => {
    setShowPopup(true);
    setEditingBlogId(null);
    setEditBlogData(null);
    setNewBlog({
      title: "",
      body: "",
      status: "published"
    });
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setEditingBlogId(null);
    setEditBlogData(null);
    setNewBlog({
      title: "",
      body: "",
      status: "published"
    });
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleChange = (e) => {
    setNewBlog({ ...newBlog, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditBlogData({ ...editBlogData, [e.target.name]: e.target.value });
  };

  const handleEditorChange = (content) => {
    if (editingBlogId) {
      setEditBlogData({ ...editBlogData, body: content });
    } else {
      setNewBlog({ ...newBlog, body: content });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file hình ảnh!');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước file không được vượt quá 5MB!');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    const fileInput = document.getElementById('image');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newStaff,
        bio_json: {
          bio: newStaff.bio,
          education: newStaff.education,
        },
        password: newPassword,
      };
      delete payload.bio;
      delete payload.education;

      console.log("Payload gửi:", payload);


      const res = await axios.post("http://localhost:3000/api/staff", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        fetchStaffs();
        handleClosePopup();
      }
    } catch (err) {
      console.error("Lỗi khi thêm staff:", err);
    }
  };

  const handleEdit = (staffId) => {
    const staff = staffs.find((s) => s.user_id === staffId);
    if (staff) {
      const flatData = {
        email: staff.email,
        role: staff.role,
        status: staff.status,
        name: staff.profile?.name || "",
        bio: staff.profile?.bio_json?.bio || "",
        education: staff.profile?.bio_json?.education || "",
        date_of_birth: staff.profile?.date_of_birth?.slice(0, 10) || "",
        job: staff.profile?.job || "",
      };
      setEditStaffData(flatData);
      setEditingStaffId(String(staffId));
      setNewPassword("");
      setShowPopup(true);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...editStaffData,
        bio_json: {
          bio: editStaffData.bio,
          education: editStaffData.education,
        },
      };
      delete payload.bio;
      delete payload.education;


      if (newPassword.trim() !== "") {
        payload.password = newPassword;
      }

      console.log("Payload gửi:", payload);
      console.log("Editing Staff ID:", editingStaffId);

      const res = await axios.put(
        `http://localhost:3000/api/staff/${editingStaffId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        fetchStaffs();
        handleClosePopup();
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật staff:", err);
    }
  };

  const handleOpenDeleteDialog = (staffId) => {
    setStaffIdToDelete(staffId);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setStaffIdToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!staffIdToDelete) return;
    try {
      const res = await axios.delete(
        `http://localhost:3000/api/staff/${staffIdToDelete}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        fetchStaffs();
      }
    } catch (err) {
      console.error("Lỗi khi xóa staff:", err);
    }
    handleCloseDeleteDialog();
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchClick = async () => {
    if (searchTerm.trim() === "") {
      fetchStaffs();
      return;
    }
    try {
      const res = await axios.get(
        `http://localhost:3000/api/staff/${searchTerm}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setStaffs(res.data.data);
      }
    } catch (err) {
      console.error("Lỗi khi tìm kiếm staff:", err);
    }
  };

  return (
    <div className="staff-list-container">
      <div className="top-bar d-flex justify-content-between align-items-center mb-3">
        <button className="btn btn-primary" onClick={handleOpenPopup}>
          <FaPlus style={{ marginRight: "5px" }} /> Tạo nhân viên mới
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
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {staffs.map((staff, index) => (
              <tr key={staff.user_id}>
                <td>{index + 1}</td>
                <td>{staff.profile?.name}</td>
                <td>{staff.email}</td>
                <td>{staff.role}</td>
                <td>{staff.status}</td>
                <td>{new Date(staff.date_create).toLocaleDateString()}</td>
                <td className="action-buttons">
                  <button className="btn btn-light me-2" onClick={() => handleEdit(staff.user_id)}>
                    <FaEdit color="yellow" />
                  </button>
                  <button className="btn btn-light" onClick={() => handleOpenDeleteDialog(staff.user_id)}>
                    <FaTrash color="red" />
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
              <h2>{editingStaffId ? "Chỉnh sửa nhân viên" : "Tạo nhân viên mới"}</h2>
              <form className="form-grid" onSubmit={editingStaffId ? handleUpdateSubmit : handleSubmit}>
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
                  placeholder="Mật khẩu"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required={!editingStaffId}
                />
                <select
                  name="role"
                  value={editingStaffId ? editStaffData?.role || "" : newStaff.role}
                  onChange={editingStaffId ? handleEditChange : handleChange}
                  required
                >
                  <option value="">Chọn vai trò</option>
                  <option value="admin">Admin</option>
                  <option value="consultant">Tư vấn viên</option>
                </select>
                {editingStaffId && (
                  <select
                    name="status"
                    value={editStaffData?.status || ""}
                    onChange={handleEditChange}
                    required
                  >
                    <option value="">Chọn trạng thái</option>
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                    <option value="banned">Bị cấm</option>
                  </select>
                )}
                <input
                  type="text"
                  name="name"
                  placeholder="Tên"
                  value={editingStaffId ? editStaffData?.name || "" : newStaff.name}
                  onChange={editingStaffId ? handleEditChange : handleChange}
                  required
                />
                <input
                  type="text"
                  name="bio"
                  placeholder="Tiểu sử"
                  value={editingStaffId ? editStaffData?.bio || "" : newStaff.bio}
                  onChange={editingStaffId ? handleEditChange : handleChange}
                />
                <input
                  type="text"
                  name="education"
                  placeholder="Học vấn"
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
                  placeholder="Công việc"
                  value={editingStaffId ? editStaffData?.job || "" : newStaff.job}
                  onChange={editingStaffId ? handleEditChange : handleChange}
                />
                <button type="submit" className="form-button">
                  {editingStaffId ? "Cập nhật" : "Tạo"}
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
                <p>Bạn có chắc chắn muốn xóa nhân viên này không?</p>
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

export default BlogListPage;
