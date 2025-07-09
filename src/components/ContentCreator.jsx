import React, { useState, useRef, useEffect } from "react";
import { 
  FaPlus, FaTrash, FaSave, FaTimes, FaImage, FaCode, FaEye, FaBold, FaItalic, 
  FaLink, FaListUl, FaListOl, FaQuoteLeft, FaTable, FaUndo, FaRedo,
  FaHeading, FaStrikethrough, FaExpand, FaCompress
} from "react-icons/fa";
import { MdCancel, MdSave, MdPreview, MdVerticalSplit, MdFullscreen } from "react-icons/md";
import "../styles/ContentCreator.scss";

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
  const [editingContent, setEditingContent] = useState(null);
  const [editorMode, setEditorMode] = useState('split'); // 'edit', 'preview', 'split'
  const [uploadedImages, setUploadedImages] = useState([]); // Store uploaded image paths
  const [showImagePanel, setShowImagePanel] = useState(false); // Toggle image panel
  const textareaRef = useRef(null);
  
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

  // Auto-save content to localStorage
  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (markdownContent) {
        localStorage.setItem('markdown-draft', markdownContent);
      }
    }, 1000);
    return () => clearTimeout(autoSave);
  }, [markdownContent]);

  // Load draft from localStorage
  useEffect(() => {
    const draft = localStorage.getItem('markdown-draft');
    if (draft && !editingContent) {
      setMarkdownContent(draft);
    }
  }, [editingContent]);

  const insertAtCursor = (text, selectionStart = null, selectionEnd = null) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = selectionStart ?? textarea.selectionStart;
    const end = selectionEnd ?? textarea.selectionEnd;
    const before = markdownContent.substring(0, start);
    const after = markdownContent.substring(end);
    
    setMarkdownContent(before + text + after);
    
    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + text.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const wrapSelection = (before, after = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdownContent.substring(start, end);
    
    if (selectedText) {
      insertAtCursor(before + selectedText + after, start, end);
    } else {
      insertAtCursor(before + after, start, end);
      // Position cursor between the markers
      setTimeout(() => {
        textarea.setSelectionRange(start + before.length, start + before.length);
      }, 0);
    }
  };

  const formatMarkdown = (markdown) => {
    if (!markdown) return '';

    let html = markdown
      // Headers
      .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold and Italic
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/__(.*?)__/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/_(.*?)_/gim, '<em>$1</em>')
      // Strikethrough
      .replace(/~~(.*?)~~/gim, '<del>$1</del>')
      // Code blocks
      .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/gim, '<code>$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // Images - convert relative paths to absolute URLs
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
        console.log('Image found in markdown:', { match, alt, src });
        
        let finalSrc = src;
        // Convert relative paths starting with ../image/ to absolute API URLs
        if (src.startsWith('../image/')) {
          const filename = src.replace('../image/', '');
          finalSrc = `http://localhost:3000/api/images/${filename}`;
          console.log('Converted ../image/ path:', finalSrc);
        } else if (src.startsWith('./image/')) {
          const filename = src.replace('./image/', '');
          finalSrc = `http://localhost:3000/api/images/${filename}`;
          console.log('Converted ./image/ path:', finalSrc);
        } else if (src.startsWith('/image/')) {
          const filename = src.replace('/image/', '');
          finalSrc = `http://localhost:3000/api/images/${filename}`;
          console.log('Converted /image/ path:', finalSrc);
        } else if (src.includes('/image/')) {
          // Handle any path containing /image/
          const filename = src.substring(src.lastIndexOf('/image/') + 7);
          finalSrc = `http://localhost:3000/api/images/${filename}`;
          console.log('Converted generic /image/ path:', finalSrc);
        }
        
        const imgTag = `<img src="${finalSrc}" alt="${alt}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0;" onError="console.error('Image failed to load:', '${finalSrc}')" />`;
        console.log('Generated img tag:', imgTag);
        return imgTag;
      })
      // Lists
      .replace(/^\d+\.\s+(.*$)/gim, '<li class="ordered">$1</li>')
      .replace(/^[-*+]\s+(.*$)/gim, '<li class="unordered">$1</li>')
      // Blockquotes
      .replace(/^>\s+(.*$)/gim, '<blockquote>$1</blockquote>')
      // Horizontal rules
      .replace(/^---+$/gim, '<hr>')
      // Line breaks
      .replace(/\n/gim, '<br/>');

    // Wrap lists
    html = html.replace(/(<li class="ordered">.*?<\/li>(?:\s*<br\/>\s*<li class="ordered">.*?<\/li>)*)/gims, '<ol>$1</ol>');
    html = html.replace(/(<li class="unordered">.*?<\/li>(?:\s*<br\/>\s*<li class="unordered">.*?<\/li>)*)/gims, '<ul>$1</ul>');
    
    // Clean up
    html = html.replace(/<br\/>\s*(<[ou]l>)/gim, '$1');
    html = html.replace(/(<\/[ou]l>)\s*<br\/>/gim, '$1');
    html = html.replace(/<br\/>\s*(<h[1-6]>)/gim, '$1');
    html = html.replace(/(<\/h[1-6]>)\s*<br\/>/gim, '$1');
    html = html.replace(/<br\/>\s*(<blockquote>)/gim, '$1');
    html = html.replace(/(<\/blockquote>)\s*<br\/>/gim, '$1');

    return html;
  };

  const toolbarActions = {
    bold: () => wrapSelection('**', '**'),
    italic: () => wrapSelection('*', '*'),
    strikethrough: () => wrapSelection('~~', '~~'),
    heading1: () => insertAtCursor('# '),
    heading2: () => insertAtCursor('## '),
    heading3: () => insertAtCursor('### '),
    link: () => wrapSelection('[', '](url)'),
    image: () => wrapSelection('![', '](image-url)'),
    unorderedList: () => insertAtCursor('- '),
    orderedList: () => insertAtCursor('1. '),
    blockquote: () => insertAtCursor('> '),
    code: () => wrapSelection('`', '`'),
    codeBlock: () => insertAtCursor('\n```\n\n```\n'),
    table: () => insertAtCursor('\n| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n'),
    horizontalRule: () => insertAtCursor('\n---\n')
  };

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      console.log("Uploading image:", file.name);
      const res = await fetch("http://localhost:3000/api/images/upload", {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem("token")}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log("Upload response:", data);
        if (data.success) {
          const imageUrl = data.imageUrl || data.data.relativePath;
          const imageMarkdown = `![Image](${imageUrl})`;
          
          // Add to uploaded images list instead of auto-inserting
          const newImage = {
            id: Date.now(),
            filename: data.data.filename,
            originalName: data.data.originalName,
            path: imageUrl,
            markdown: imageMarkdown,
            uploadedAt: new Date().toLocaleString()
          };
          
          setUploadedImages(prev => [...prev, newImage]);
          setShowImagePanel(true); // Auto-show the panel when image is uploaded
          alert("Image uploaded successfully! Check the image panel to copy the markdown.");
        } else {
          alert("Failed to upload image: " + data.message);
        }
      } else {
        const errorData = await res.json();
        console.error("Upload failed:", errorData);
        alert("Failed to upload image: " + (errorData.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      alert("Error uploading image: " + err.message);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied to clipboard!");
    }).catch(err => {
      console.error("Failed to copy: ", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        alert("Copied to clipboard!");
      } catch (err) {
        alert("Failed to copy to clipboard");
      }
      document.body.removeChild(textArea);
    });
  };

  const clearUploadedImages = () => {
    setUploadedImages([]);
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
    localStorage.removeItem('markdown-draft');
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
    localStorage.removeItem('markdown-draft');
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
    localStorage.removeItem('markdown-draft');
  };

  const handleCancelEdit = () => {
    if (markdownContent && window.confirm("You have unsaved changes. Are you sure you want to cancel?")) {
      setShowMarkdownEditor(false);
      setEditingContent(null);
      setMarkdownContent("");
      localStorage.removeItem('markdown-draft');
    } else if (!markdownContent) {
      setShowMarkdownEditor(false);
      setEditingContent(null);
      setMarkdownContent("");
      localStorage.removeItem('markdown-draft');
    }
  };

  const handleDeleteContent = (contentId, contentTitle) => {
    if (window.confirm(`Are you sure you want to delete "${contentTitle}"?`)) {
      onDelete(contentId);
    }
  };

  const handleKeyDown = (e) => {
    // Keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          toolbarActions.bold();
          break;
        case 'i':
          e.preventDefault();
          toolbarActions.italic();
          break;
        case 'k':
          e.preventDefault();
          toolbarActions.link();
          break;
        case 's':
          e.preventDefault();
          handleSaveContent();
          break;
      }
    }
    
    // Tab for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      insertAtCursor('  ');
    }
  };

  const renderToolbar = () => (
    <div className="editor-toolbar">
      <div className="toolbar-group">
        <button onClick={() => toolbarActions.heading1()} title="Heading 1" className="toolbar-btn">
          <FaHeading />1
        </button>
        <button onClick={() => toolbarActions.heading2()} title="Heading 2" className="toolbar-btn">
          <FaHeading />2
        </button>
        <button onClick={() => toolbarActions.heading3()} title="Heading 3" className="toolbar-btn">
          <FaHeading />3
        </button>
      </div>
      
      <div className="toolbar-separator"></div>
      
      <div className="toolbar-group">
        <button onClick={() => toolbarActions.bold()} title="Bold (Ctrl+B)" className="toolbar-btn">
          <FaBold />
        </button>
        <button onClick={() => toolbarActions.italic()} title="Italic (Ctrl+I)" className="toolbar-btn">
          <FaItalic />
        </button>
        <button onClick={() => toolbarActions.strikethrough()} title="Strikethrough" className="toolbar-btn">
          <FaStrikethrough />
        </button>
      </div>
      
      <div className="toolbar-separator"></div>
      
      <div className="toolbar-group">
        <button onClick={() => toolbarActions.unorderedList()} title="Bullet List" className="toolbar-btn">
          <FaListUl />
        </button>
        <button onClick={() => toolbarActions.orderedList()} title="Numbered List" className="toolbar-btn">
          <FaListOl />
        </button>
        <button onClick={() => toolbarActions.blockquote()} title="Quote" className="toolbar-btn">
          <FaQuoteLeft />
        </button>
      </div>
      
      <div className="toolbar-separator"></div>
      
      <div className="toolbar-group">
        <button onClick={() => toolbarActions.link()} title="Link (Ctrl+K)" className="toolbar-btn">
          <FaLink />
        </button>
        <button onClick={() => toolbarActions.image()} title="Image" className="toolbar-btn">
          <FaImage />
        </button>
        <button onClick={() => toolbarActions.table()} title="Table" className="toolbar-btn">
          <FaTable />
        </button>
      </div>
      
      <div className="toolbar-separator"></div>
      
      <div className="toolbar-group">
        <button onClick={() => toolbarActions.code()} title="Inline Code" className="toolbar-btn">
          <FaCode />
        </button>
        <button onClick={() => toolbarActions.codeBlock()} title="Code Block" className="toolbar-btn">
          <FaCode />
          <span style={{fontSize: '0.8em'}}>□</span>
        </button>
      </div>
      
      <div className="toolbar-separator"></div>
      
      <div className="toolbar-group">
        <input
          type="file"
          id="imageUpload"
          accept="image/*"
          style={{display: 'none'}}
          onChange={(e) => handleImageUpload(e.target.files[0])}
        />
        <button 
          onClick={() => document.getElementById('imageUpload').click()}
          title="Upload Image"
          className="toolbar-btn"
        >
          <FaImage /> Upload
        </button>
        <button 
          onClick={() => setShowImagePanel(!showImagePanel)}
          title="Toggle Image Panel"
          className={`toolbar-btn ${showImagePanel ? 'active' : ''}`}
        >
          <FaImage /> Panel {uploadedImages.length > 0 && `(${uploadedImages.length})`}
        </button>
      </div>
    </div>
  );

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
            <div className="editor-header">
              <h6>{editingContent ? 'Edit Content' : 'Create New Content'}</h6>
              <div className="mode-controls">
                <button 
                  className={`btn btn-sm ${editorMode === 'edit' ? 'btn-primary' : 'btn-outline-secondary'} me-2`}
                  onClick={() => setEditorMode('edit')}
                  title="Edit Mode"
                >
                  <FaCode className="me-1" /> Edit
                </button>
                <button 
                  className={`btn btn-sm ${editorMode === 'split' ? 'btn-primary' : 'btn-outline-secondary'} me-2`}
                  onClick={() => setEditorMode('split')}
                  title="Split Mode"
                >
                  <MdVerticalSplit className="me-1" /> Split
                </button>
                <button 
                  className={`btn btn-sm ${editorMode === 'preview' ? 'btn-primary' : 'btn-outline-secondary'} me-2`}
                  onClick={() => setEditorMode('preview')}
                  title="Preview Mode"
                >
                  <FaEye className="me-1" /> Preview
                </button>
                <button 
                  className="btn btn-sm btn-success me-2"
                  onClick={handleSaveContent}
                  title="Save (Ctrl+S)"
                >
                  <FaSave className="me-1" /> Save
                </button>
                <button 
                  className="btn btn-sm btn-secondary"
                  onClick={handleCancelEdit}
                  title="Cancel"
                >
                  <FaTimes className="me-1" /> Cancel
                </button>
              </div>
            </div>

            {/* Content Details Form - Moved to Top */}
            <div className="content-details-form">
              <h6>Content Details</h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Content Title *</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={newContent.title}
                    onChange={(e) => setNewContent({...newContent, title: e.target.value})}
                    placeholder="Enter content title..."
                  />
                </div>
                <div className="col-md-3">
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
                <div className="col-md-3">
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

            {renderToolbar()}

            {/* Image Panel */}
            {showImagePanel && (
              <div className="image-panel">
                <div className="image-panel-header">
                  <h6>Uploaded Images</h6>
                  <div className="panel-actions">
                    {uploadedImages.length > 0 && (
                      <button 
                        className="btn btn-sm btn-outline-danger me-2"
                        onClick={clearUploadedImages}
                        title="Clear all images"
                      >
                        Clear All
                      </button>
                    )}
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => setShowImagePanel(false)}
                      title="Close panel"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
                <div className="image-panel-content">
                  {uploadedImages.length === 0 ? (
                    <div className="no-images">
                      <p>No images uploaded yet. Use the "Upload" button to add images.</p>
                    </div>
                  ) : (
                    <div className="image-list">
                      {uploadedImages.map((image) => (
                        <div key={image.id} className="image-item">
                          <div className="image-info">
                            <div className="image-name">
                              <strong>{image.originalName}</strong>
                              <small className="text-muted"> ({image.filename})</small>
                            </div>
                            <div className="image-date">
                              <small className="text-muted">Uploaded: {image.uploadedAt}</small>
                            </div>
                          </div>
                          <div className="image-paths">
                            <div className="path-item">
                              <label>Markdown:</label>
                              <div className="path-input-group">
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={image.markdown}
                                  readOnly
                                />
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => copyToClipboard(image.markdown)}
                                  title="Copy markdown"
                                >
                                  Copy
                                </button>
                              </div>
                            </div>
                            <div className="path-item">
                              <label>Path:</label>
                              <div className="path-input-group">
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={image.path}
                                  readOnly
                                />
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => copyToClipboard(image.path)}
                                  title="Copy path"
                                >
                                  Copy
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="row">
              {(editorMode === 'edit' || editorMode === 'split') && (
                <div className={editorMode === 'split' ? 'col-md-6' : 'col-12'}>
                  <div className="editor-section">
                    <div className="editor-section-header">
                      <span>Markdown Editor</span>
                      <span className="character-count">{markdownContent.length} characters</span>
                    </div>
                    <textarea
                      ref={textareaRef}
                      className="form-control markdown-textarea"
                      rows="20"
                      value={markdownContent}
                      onChange={(e) => setMarkdownContent(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="# Start writing your markdown here...

You can use the toolbar above or keyboard shortcuts:
- Ctrl+B for **bold**
- Ctrl+I for *italic*  
- Ctrl+K for [links](url)
- Tab for indentation
- Ctrl+S to save"
                      spellCheck="false"
                    />
                  </div>
                </div>
              )}

              {(editorMode === 'preview' || editorMode === 'split') && (
                <div className={editorMode === 'split' ? 'col-md-6' : 'col-12'}>
                  <div className="preview-section">
                    <div className="editor-section-header">
                      <span>Live Preview</span>
                      <span className="word-count">{markdownContent.split(' ').filter(w => w).length} words</span>
                    </div>
                    <div className="markdown-preview">
                      {markdownContent ? (
                        <div dangerouslySetInnerHTML={{ __html: formatMarkdown(markdownContent) }} />
                      ) : (
                        <div className="preview-placeholder">
                          <p>Your markdown preview will appear here as you type...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="col-md-6">
                <div className="markdown-guide">
                  <h6>Markdown Guide</h6>
                  <div className="guide-examples">
                    <div className="guide-item">
                      <code># H1</code>
                      <span>Heading 1</span>
                    </div>
                    <div className="guide-item">
                      <code>**bold**</code>
                      <span>Bold text</span>
                    </div>
                    <div className="guide-item">
                      <code>*italic*</code>
                      <span>Italic text</span>
                    </div>
                    <div className="guide-item">
                      <code>[link](url)</code>
                      <span>Link</span>
                    </div>
                    <div className="guide-item">
                      <code>![img](url)</code>
                      <span>Image</span>
                    </div>
                    <div className="guide-item">
                      <code>- item</code>
                      <span>List item</span>
                    </div>
                    <div className="guide-item">
                      <code>`code`</code>
                      <span>Inline code</span>
                    </div>
                    <div className="guide-item">
                      <code>&gt; quote</code>
                      <span>Blockquote</span>
                    </div>
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
                            <FaCode />
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