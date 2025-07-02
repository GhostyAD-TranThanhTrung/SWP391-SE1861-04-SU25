import React, { useState } from "react";
import { FaPlus, FaTrash, FaSave, FaTimes, FaImage, FaCode, FaEyeSlash } from "react-icons/fa";
import { MdCancel, MdSave, MdPreview } from "react-icons/md";
// import "../../styles/ContentCreator.scss";

const ContentCreator = ({ 
  program, 
  contents, 
  onSave, 
  onCancel, 
  onDelete,
  onUpdate 
}) => {
  const [showMarkdownEditor, setShowMarkdownEditor] = useState(false);
  const [markdownContent, setMarkdownContent] = useState("");
  const [markdownPreview, setMarkdownPreview] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [newContent, setNewContent] = useState({
    title: "",
    type: "markdown",
    orders: 1,
    content_file_link: "",
    content_type: "markdown",
    content_metadata_json: JSON.stringify({
      author: "Admin",
      readingTime: "5 min",
      difficulty: "beginner"
    })
  });

  const renderMarkdownGuide = () => (
    <div className="markdown-guide">
      <h6>Markdown Guide:</h6>
      <div className="guide-examples">
        <div># Heading 1</div>
        <div>## Heading 2</div>
        <div>**Bold text**</div>
        <div>*Italic text*</div>
        <div>[Link text](URL)</div>
        <div>![Image alt](image-url)</div>
        <div>- List item</div>
        <div>```code block```</div>
      </div>
    </div>
  );

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const res = await fetch("http://localhost:3000/api/images/upload", {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem("token")}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const imageUrl = data.imageUrl;
          const imageMarkdown = `![Image](${imageUrl})`;
          setMarkdownContent(prev => prev + `\n${imageMarkdown}\n`);
          alert("Image uploaded successfully!");
        }
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      alert("Error uploading image: " + err.message);
    }
  };

  const handleCreateContent = () => {
    setShowMarkdownEditor(true);
    setEditingContent(null);
    setNewContent({
      title: "",
      type: "markdown",
      orders: contents.length + 1,
      content_file_link: "",
      content_type: "markdown",
      content_metadata_json: JSON.stringify({
        author: "Admin",
        readingTime: "5 min",
        difficulty: "beginner"
      })
    });
    setMarkdownContent("");
  };

  const handleEditContent = (content) => {
    setEditingContent(content);
    setShowMarkdownEditor(true);
    setNewContent({
      title: content.title,
      type: content.type,
      orders: content.orders,
      content_file_link: content.content_file_link,
      content_type: content.content_type,
      content_metadata_json: content.content_metadata_json
    });
    setMarkdownContent(content.content_file_link || "");
  };

  const handleSaveContent = () => {
    if (!newContent.title.trim()) {
      alert("Please enter a content title.");
      return;
    }

    if (!markdownContent.trim()) {
      alert("Please enter some content.");
      return;
    }

    const contentData = {
      ...newContent,
      content_file_link: markdownContent,
      program_id: program.program_id
    };

    if (editingContent) {
      onUpdate(editingContent.content_id, contentData);
    } else {
      onSave(contentData);
    }

    setShowMarkdownEditor(false);
    setEditingContent(null);
    setNewContent({
      title: "",
      type: "markdown",
      orders: 1,
      content_file_link: "",
      content_type: "markdown",
      content_metadata_json: JSON.stringify({
        author: "Admin",
        readingTime: "5 min",
        difficulty: "beginner"
      })
    });
    setMarkdownContent("");
  };

  const handleCancelEdit = () => {
    setShowMarkdownEditor(false);
    setEditingContent(null);
    setNewContent({
      title: "",
      type: "markdown",
      orders: 1,
      content_file_link: "",
      content_type: "markdown",
      content_metadata_json: JSON.stringify({
        author: "Admin",
        readingTime: "5 min",
        difficulty: "beginner"
      })
    });
    setMarkdownContent("");
  };

  const handleDeleteContent = (contentId, contentTitle) => {
    if (window.confirm(`Are you sure you want to delete "${contentTitle}"?`)) {
      onDelete(contentId);
    }
  };

  return (
    <div className="content-creator">
      <div className="creator-header">
        <h5>Content Management: {program?.title}</h5>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={handleCreateContent}
          >
            <FaPlus className="me-1" /> Create New Content
          </button>
        </div>
      </div>

      <div className="creator-content">
        {showMarkdownEditor ? (
          <div className="markdown-editor">
            <div className="editor-header d-flex justify-content-between mb-3">
              <h6>{editingContent ? 'Edit Content' : 'Create New Content'}</h6>
              <div>
                <input
                  type="file"
                  id="imageUpload"
                  accept="image/*"
                  style={{display: 'none'}}
                  onChange={(e) => handleImageUpload(e.target.files[0])}
                />
                <button 
                  className="btn btn-sm btn-secondary me-2"
                  onClick={() => document.getElementById('imageUpload').click()}
                >
                  <FaImage className="me-1" /> Upload Image
                </button>
                <button 
                  className="btn btn-sm btn-info me-2"
                  onClick={() => setMarkdownPreview(!markdownPreview)}
                >
                  {markdownPreview ? <FaCode className="me-1" /> : <MdPreview className="me-1" />}
                  {markdownPreview ? 'Edit' : 'Preview'}
                </button>
                <button 
                  className="btn btn-sm btn-success me-2"
                  onClick={handleSaveContent}
                >
                  <MdSave className="me-1" /> Save
                </button>
                <button 
                  className="btn btn-sm btn-secondary"
                  onClick={handleCancelEdit}
                >
                  <FaTimes className="me-1" /> Cancel
                </button>
              </div>
            </div>
            
            <div className="row">
              <div className="col-md-6">
                {!markdownPreview && (
                  <div>
                    <textarea
                      className="form-control markdown-textarea"
                      rows="15"
                      value={markdownContent}
                      onChange={(e) => setMarkdownContent(e.target.value)}
                      placeholder="Write your markdown content here..."
                    />
                    {renderMarkdownGuide()}
                  </div>
                )}
                {markdownPreview && (
                  <div className="markdown-preview" 
                       dangerouslySetInnerHTML={{__html: markdownContent}} 
                  />
                )}
              </div>
              <div className="col-md-6">
                <div className="content-form">
                  <div className="mb-3">
                    <label className="form-label">Content Title *</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={newContent.title}
                      onChange={(e) => setNewContent({...newContent, title: e.target.value})}
                      placeholder="Enter content title..."
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Content Type</label>
                    <select 
                      className="form-control"
                      value={newContent.type}
                      onChange={(e) => setNewContent({...newContent, type: e.target.value})}
                    >
                      <option value="markdown">Markdown</option>
                      <option value="video">Video</option>
                      <option value="podcast">Podcast</option>
                      <option value="quiz">Quiz</option>
                      <option value="article">Article</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Order</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      min="1"
                      value={newContent.orders}
                      onChange={(e) => setNewContent({...newContent, orders: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="content-list">
            <div className="content-header">
              <h6>Content List ({contents.length} items)</h6>
            </div>
            
            {contents.length === 0 ? (
              <div className="no-content">
                <p>No content found for this program.</p>
                <button 
                  className="btn btn-primary"
                  onClick={handleCreateContent}
                >
                  <FaPlus className="me-1" /> Create First Content
                </button>
              </div>
            ) : (
              <div className="content-table">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Title</th>
                      <th>Type</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contents.map(content => (
                      <tr key={content.content_id}>
                        <td>{content.orders}</td>
                        <td>{content.title}</td>
                        <td>
                          <span className={`badge bg-${content.type === 'markdown' ? 'primary' : 
                            content.type === 'video' ? 'success' : 
                            content.type === 'podcast' ? 'warning' : 'info'}`}>
                            {content.type}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn btn-sm btn-warning me-1"
                            onClick={() => handleEditContent(content)}
                            title="Edit"
                          >
                            <FaPlus />
                          </button>
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteContent(content.content_id, content.title)}
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentCreator; 