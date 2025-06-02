import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/BlogPage.scss';
import Image from '../images/Images.jpg'; // Placeholder image

const BlogPage = () => {
    const posts = [
        { title: 'Drugs and alcohol - awareness and prevention', date: 'MM/DD/YYYY', author: 'Tac gia ...', image: Image },
        { title: '12 ways to prevent drug abuse', date: 'MM/DD/YYYY', author: 'Tac gia ...', image: Image },
        { title: 'Drug abuse awareness', date: 'MM/DD/YYYY', author: 'Tac gia ...', image: Image },
        { title: 'Drugs and alcohol - awareness and prevention', date: 'MM/DD/YYYY', author: 'Tac gia ...', image: Image },
        { title: 'Drugs and alcohol - awareness and prevention', date: 'MM/DD/YYYY', author: 'Tac gia ...', image: Image },
        { title: 'Drugs and alcohol - awareness and prevention', date: 'MM/DD/YYYY', author: 'Tac gia ...', image: Image },
        { title: 'Drugs and alcohol - awareness and prevention', date: 'MM/DD/YYYY', author: 'Tac gia ...', image: Image },
    ];

    return (
        <div className="blog-page container my-5">
            <h1 className="text-center mb-5">Blog Posts</h1>
            <div className="row">
                {posts.map((post, index) => (
                    <div key={index} className="col-10 col-md-10 offset-md-1 mb-4">
                        <div className="post-card card shadow-sm">
                            <div className="card-body d-flex align-items-center p-3">
                                <div className="post-image me-2">
                                    <img src={post.image} alt={post.title} className="img-fluid" style={{ maxWidth: '120px', height: 'auto' }} />
                                </div>
                                <div className="post-content">
                                    <h5 className="card-title mb-1">{post.title}</h5>
                                    <p className="card-text text-muted mb-0">
                                        Ngày đăng: {post.date} | Tác giả: {post.author}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <nav aria-label="Page navigation" className="d-flex justify-content-center mt-4">
                <ul className="pagination">
                    <li className="page-item">
                        <a className="page-link" href="#" aria-label="Previous">
                            <span aria-hidden="true">«</span>
                        </a>
                    </li>
                    <li className="page-item active"><a className="page-link" href="#">1</a></li>
                    <li className="page-item"><a className="page-link" href="#">2</a></li>
                    <li className="page-item"><a className="page-link" href="#">3</a></li>
                    <li className="page-item disabled"><a className="page-link" href="#">...</a></li>
                    <li className="page-item"><a className="page-link" href="#">33</a></li>
                    <li className="page-item">
                        <a className="page-link" href="#" aria-label="Next">
                            <span aria-hidden="true">»</span>
                        </a>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default BlogPage;