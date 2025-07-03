import { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch, FaPlus, FaEdit, FaEye, FaFlag } from "react-icons/fa";
import { FaTrash } from "react-icons/fa6";
import { MdCancel, MdApproval, MdBlock } from "react-icons/md";


const BlogListPage = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [newBlog, setNewBlog] = useState({
    title: "",
    body: "",
    status: "draft",
    img_link: "",
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blogIdToDelete, setBlogIdToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('all'); // 'all', 'pending', 'published', 'draft'
  const token = sessionStorage.getItem("token");

  const fetchBlogs = async () => {
    try {
      let endpoint = "http://localhost:3000/api/admin/blogs";

      // Choose endpoint based on view mode
      switch (viewMode) {
        case 'pending':
          endpoint = "http://localhost:3000/api/blogs/pending";
          break;
        case 'my':
          endpoint = "http://localhost:3000/api/blogs/my";
          break;
        case 'draft':
          endpoint = "http://localhost:3000/api/blogs/draft";
          break;
        case 'published':
          endpoint = "http://localhost:3000/api/blogs/published";
          break;
        default:
          endpoint = "http://localhost:3000/api/admin/blogs";
      }

      const res = await axios.get(endpoint, {
        headers: viewMode !== 'all' ? { Authorization: `Bearer ${token}` } : {}
      });

      if (res.data.success) {
        setBlogs(res.data.data);
      }
    } catch (err) {
      console.error("Lỗi khi gọi API:", err);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [viewMode]);

  const handleOpenPopup = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setNewBlog({
      title: "",
      body: "",
      status: "draft",
      img_link: "",
    });
  };

  const handleChange = (e) => {
    setNewBlog({ ...newBlog, [e.target.name]: e.target.value });
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newBlog,
        created_at: new Date().toISOString(),
      };

      console.log("Payload gửi:", payload);

      const res = await axios.post("http://localhost:3000/api/blogs", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        fetchBlogs();
        handleClosePopup();
        alert("Tạo blog thành công!");
      }
    } catch (err) {
      console.error("Lỗi khi thêm blog:", err);
      alert("Có lỗi xảy ra khi tạo blog");
    }
  };



  const handleOpenDeleteDialog = (blogId) => {
    setBlogIdToDelete(blogId);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setBlogIdToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!blogIdToDelete) return;
    try {
      const res = await axios.delete(
        `http://localhost:3000/api/blogs/${blogIdToDelete}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        fetchBlogs();
        alert("Xóa blog thành công!");
      }
    } catch (err) {
      console.error("Lỗi khi xóa blog:", err);
      alert("Có lỗi xảy ra khi xóa blog");
    }
    handleCloseDeleteDialog();
  };

  const handleStatusChange = async (blogId, newStatus) => {
    try {
      const endpoint = newStatus === 'published'
        ? `http://localhost:3000/api/blogs/${blogId}/approve`
        : `http://localhost:3000/api/blogs/${blogId}/reject`;

      const res = await axios.patch(endpoint, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        fetchBlogs();
        alert(`Blog đã được ${newStatus === 'published' ? 'phê duyệt' : 'từ chối'}!`);
      }
    } catch (err) {
      console.error("Lỗi khi thay đổi trạng thái blog:", err);
      alert("Có lỗi xảy ra khi thay đổi trạng thái blog");
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchClick = async () => {
    if (searchTerm.trim() === "") {
      fetchBlogs();
      return;
    }
    try {
      const res = await axios.get(
        `http://localhost:3000/api/blogs/${searchTerm}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setBlogs([res.data.data]);
      }
    } catch (err) {
      console.error("Lỗi khi tìm kiếm blog:", err);
      // If single blog search fails, try to filter current blogs
      const filtered = blogs.filter(blog =>
        blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.body?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setBlogs(filtered);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'published': 'success',
      'draft': 'secondary',
      'pending': 'warning',
      'rejected': 'danger'
    };
    return statusColors[status] || 'secondary';
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="blog-list-container">
      <div className="top-bar d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
          <button className="btn btn-primary me-3" onClick={handleOpenPopup}>
            <FaPlus className="me-2" /> Tạo blog mới
          </button>

          <div className="btn-group" role="group">
            <button
              className={`btn btn-sm ${viewMode === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setViewMode('all')}
            >
              Tất cả
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'pending' ? 'btn-warning' : 'btn-outline-warning'}`}
              onClick={() => setViewMode('pending')}
            >
              Chờ duyệt
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'my' ? 'btn-info' : 'btn-outline-info'}`}
              onClick={() => setViewMode('my')}
            >
              Blog của tôi
            </button>
          </div>
        </div>

        <div className="input-group" style={{ maxWidth: '300px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Tìm kiếm blog..."
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
              <th>Tiêu đề</th>
              <th>Nội dung</th>
              <th>Trạng thái</th>
              <th>Tác giả</th>
              <th>Ngày tạo</th>
              <th>Hình ảnh</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map((blog, index) => (
              <tr key={blog.blog_id}>
                <td>{index + 1}</td>
                <td>
                  <div style={{ maxWidth: '200px' }}>
                    {truncateText(blog.title, 50)}
                  </div>
                </td>
                <td>
                  <div style={{ maxWidth: '300px' }}>
                    {truncateText(blog.body, 100)}
                  </div>
                </td>
                <td>
                  <span className={`badge bg-${getStatusBadge(blog.status)}`}>
                    {blog.status || 'draft'}
                  </span>
                </td>
                <td>{blog.author?.name || blog.author_id}</td>
                <td>{blog.created_at ? new Date(blog.created_at).toLocaleDateString() : 'N/A'}</td>
                <td>
                  {blog.img_link ? (
                    <img
                      src={blog.img_link}
                      alt="Blog"
                      style={{ width: '50px', height: '30px', objectFit: 'cover' }}
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  ) : 'Không có'}
                </td>
                <td className="action-buttons">
                  <button
                    className="btn btn-outline-info btn-sm me-1"
                    onClick={() => window.open(`/blog/${blog.blog_id}`, '_blank')}
                    title="Xem blog"
                  >
                    <FaEye />
                  </button>
                  {blog.status === 'pending' && (
                    <>
                      <button
                        className="btn btn-outline-success btn-sm me-1"
                        onClick={() => handleStatusChange(blog.blog_id, 'published')}
                        title="Phê duyệt"
                      >
                        <MdApproval />
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm me-1"
                        onClick={() => handleStatusChange(blog.blog_id, 'rejected')}
                        title="Từ chối"
                      >
                        <MdBlock />
                      </button>
                    </>
                  )}
                  <button
                    className="btn btn-outline-warning btn-sm me-1"
                    onClick={() => window.open(`/admin/flags/blog/${blog.blog_id}`, '_blank')}
                    title="Xem báo cáo"
                  >
                    <FaFlag />
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleOpenDeleteDialog(blog.blog_id)}
                    title="Xóa"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {blogs.length === 0 && (
          <div className="text-center py-4">
            <p>Không có blog nào để hiển thị.</p>
          </div>
        )}
      </div>

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <span className="close" onClick={handleClosePopup}><MdCancel /></span>
            <div className="form">
              <h2>Tạo blog mới</h2>
              <form className="form-grid" onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="title"
                  placeholder="Tiêu đề blog"
                  value={newBlog.title}
                  onChange={handleChange}
                  required
                  style={{ gridColumn: 'span 2' }}
                />
                <textarea
                  name="body"
                  placeholder="Nội dung blog"
                  value={newBlog.body}
                  onChange={handleChange}
                  required
                  rows="6"
                  style={{ gridColumn: 'span 2', resize: 'vertical' }}
                />
                <input
                  type="url"
                  name="img_link"
                  placeholder="Link hình ảnh (không bắt buộc)"
                  value={newBlog.img_link}
                  onChange={handleChange}
                  style={{ gridColumn: 'span 2' }}
                />
                <select
                  name="status"
                  value={newBlog.status}
                  onChange={handleChange}
                  required
                >
                  <option value="draft">Bản nháp</option>
                  <option value="pending">Chờ duyệt</option>
                  <option value="published">Đã xuất bản</option>
                  <option value="rejected">Bị từ chối</option>
                </select>
                <button type="submit" className="form-button">
                  Tạo
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
                <p>Bạn có chắc chắn muốn xóa blog này không? Hành động này không thể hoàn tác.</p>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-secondary" onClick={handleCloseDeleteDialog}>Hủy</button>
                <button type="button" className="btn btn-danger" onClick={handleConfirmDelete}>Xóa</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogListPage;
