-- DỮ LIỆU MẪU CHO ỨNG DỤNG PHÒNG CHỐNG MA TÚY
-- File này chứa dữ liệu mẫu thực tế được dịch sang tiếng Việt cho mục đích kiểm thử và phát triển

-- Chèn Người dùng (Quản trị viên, Tư vấn viên, Thành viên)
INSERT INTO Users (role, password, status, email, img_link) VALUES
('admin', 'hashed_password_123', 'active', 'admin@drugprevention.com', '/uploads/profile-pictures/default-admin.png'),
('consultant', 'hashed_password_456', 'active', 'dr.smith@drugprevention.com', '/uploads/profile-pictures/default-consultant.png'),
('consultant', 'hashed_password_789', 'active', 'therapist.johnson@drugprevention.com', '/uploads/profile-pictures/default-consultant.png'),
('consultant', 'hashed_password_321', 'active', 'counselor.williams@drugprevention.com', '/uploads/profile-pictures/default-consultant.png'),
('consultant', 'hashed_password_654', 'inactive', 'dr.brown@drugprevention.com', '/uploads/profile-pictures/default-consultant.png'),
('member', 'hashed_password_987', 'active', 'john.doe@email.com', '/uploads/profile-pictures/default-member.png'),
('member', 'hashed_password_147', 'active', 'jane.smith@email.com', '/uploads/profile-pictures/default-member.png'),
('member', 'hashed_password_258', 'active', 'mike.wilson@email.com', '/uploads/profile-pictures/default-member.png'),
('member', 'hashed_password_369', 'active', 'sarah.davis@email.com', '/uploads/profile-pictures/default-member.png'),
('member', 'hashed_password_741', 'banned', 'banned.user@email.com', NULL);

-- Chèn Hồ sơ cho tất cả người dùng
INSERT INTO Profile (user_id, name, bio_json, date_of_birth, job) VALUES
(1, N'Quản trị viên Hệ thống', N'{"bio": "Quản trị viên hệ thống cho nền tảng phòng chống ma túy"}', '1985-05-15', N'Quản trị viên Hệ thống'),
(2, N'Bác sĩ Michael Smith', N'{"bio": "Bác sĩ tâm thần chuyên về nghiện với 15 năm kinh nghiệm trong điều trị và phòng ngừa lạm dụng chất gây nghiện", "education": "Tiến sĩ Y khoa từ Johns Hopkins, Chứng nhận Chuyên khoa Điều trị Nghiện"}', '1975-03-20', N'Bác sĩ Tâm thần Nghiện'),
(3, N'Sarah Johnson', N'{"bio": "Nhà trị liệu lâm sàng được cấp phép chuyên về tư vấn nghiện và trị liệu gia đình", "education": "Thạc sĩ Tâm lý Lâm sàng, Chứng chỉ Tư vấn Chuyên nghiệp"}', '1982-08-12', N'Nhà trị liệu Lâm sàng'),
(4, N'Robert Williams', N'{"bio": "Chuyên viên tư vấn lạm dụng chất gây nghiện có chứng chỉ với chuyên môn về chương trình phòng ngừa thanh thiếu niên", "education": "Thạc sĩ Tư vấn Nghiện, Chứng chỉ CADC"}', '1978-11-05', N'Chuyên viên Tư vấn Lạm dụng Chất'),
(5, N'Bác sĩ Emily Brown', N'{"bio": "Nhà tâm lý học lâm sàng chuyên về can thiệp hành vi cho nghiện", "education": "Tiến sĩ Tâm lý Lâm sàng"}', '1980-01-30', N'Nhà Tâm lý Lâm sàng'),
(6, N'John Doe', N'{"bio": "Tìm kiếm hỗ trợ cho quá trình phục hồi nghiện", "interests": ["thể dục", "đọc sách"]}', '1995-06-10', N'Lập trình viên Phần mềm'),
(7, N'Jane Smith', N'{"bio": "Phụ huynh tìm kiếm tài liệu phòng ngừa cho con tuổi teen", "interests": ["nuôi dạy con", "công tác cộng đồng"]}', '1978-09-22', N'Giáo viên'),
(8, N'Mike Wilson', N'{"bio": "Sinh viên đại học quan tâm đến giáo dục phòng ngừa", "interests": ["thể thao", "âm nhạc"]}', '2001-12-03', N'Sinh viên'),
(9, N'Sarah Davis', N'{"bio": "Nhân viên y tế tìm kiếm phát triển chuyên môn về phòng ngừa nghiện", "interests": ["chăm sóc sức khỏe", "đào tạo"]}', '1988-04-17', N'Y tá'),
(10, N'Người dùng bị cấm', N'{"bio": "Tài khoản người dùng bị cấm do vi phạm"}', '1990-07-25', N'Không xác định');

-- Chèn Tư vấn viên
INSERT INTO Consultant (user_id, cost, certification, speciality) VALUES
(2, 150.00, N'Chứng nhận Chuyên khoa Điều trị Nghiện, Bác sĩ được cấp phép', N'Tâm thần Nghiện, Điều trị Hỗ trợ Thuốc, Chẩn đoán Kép'),
(3, 120.00, N'Chứng chỉ Tư vấn Chuyên nghiệp, Chứng chỉ Tư vấn Nghiện', N'Trị liệu Cá nhân và Gia đình, Liệu pháp Nhận thức Hành vi, Chăm sóc Chấn thương Tâm lý'),
(4, 100.00, N'Chứng chỉ Tư vấn Rượu và Ma túy, Chuyên gia Phòng ngừa', N'Chương trình Phòng ngừa Thanh thiếu niên, Trị liệu Nhóm, Tiếp cận Cộng đồng'),
(5, 130.00, N'Chứng chỉ Tâm lý Lâm sàng, Chuyên gia Điều trị Nghiện', N'Can thiệp Hành vi, Đánh giá và Thẩm định, Lập kế hoạch Điều trị');

-- Chèn Khung giờ
INSERT INTO Slot (start_time, end_time) VALUES
('08:00:00', '09:00:00'),
('09:00:00', '10:00:00'),
('10:00:00', '11:00:00'),
('11:00:00', '12:00:00'),
('13:00:00', '14:00:00'),
('14:00:00', '15:00:00'),
('15:00:00', '16:00:00'),
('16:00:00', '17:00:00'),
('18:00:00', '19:00:00'),
('19:00:00', '20:00:00');

-- Chèn Lịch làm việc của Tư vấn viên
INSERT INTO Consultant_Slot (consultant_id, slot_id, day_of_week) VALUES
-- Dr. Smith (Consultant 1) - Monday to Friday, morning and afternoon
(1, 1, 'Monday'), (1, 2, 'Monday'), (1, 5, 'Monday'), (1, 6, 'Monday'),
(1, 1, 'Tuesday'), (1, 2, 'Tuesday'), (1, 5, 'Tuesday'), (1, 6, 'Tuesday'),
(1, 1, 'Wednesday'), (1, 2, 'Wednesday'), (1, 5, 'Wednesday'), (1, 6, 'Wednesday'),
(1, 1, 'Thursday'), (1, 2, 'Thursday'), (1, 5, 'Thursday'), (1, 6, 'Thursday'),
(1, 1, 'Friday'), (1, 2, 'Friday'), (1, 5, 'Friday'), (1, 6, 'Friday'),

-- Sarah Johnson (Consultant 2) - Monday to Saturday, flexible hours
(2, 3, 'Monday'), (2, 4, 'Monday'), (2, 7, 'Monday'), (2, 8, 'Monday'),
(2, 3, 'Tuesday'), (2, 4, 'Tuesday'), (2, 7, 'Tuesday'), (2, 8, 'Tuesday'),
(2, 3, 'Wednesday'), (2, 4, 'Wednesday'), (2, 7, 'Wednesday'), (2, 8, 'Wednesday'),
(2, 3, 'Thursday'), (2, 4, 'Thursday'), (2, 7, 'Thursday'), (2, 8, 'Thursday'),
(2, 3, 'Friday'), (2, 4, 'Friday'), (2, 7, 'Friday'), (2, 8, 'Friday'),
(2, 2, 'Saturday'), (2, 3, 'Saturday'), (2, 4, 'Saturday'),

-- Robert Williams (Consultant 3) - Monday to Friday, afternoon and evening
(3, 5, 'Monday'), (3, 6, 'Monday'), (3, 7, 'Monday'), (3, 9, 'Monday'),
(3, 5, 'Tuesday'), (3, 6, 'Tuesday'), (3, 7, 'Tuesday'), (3, 9, 'Tuesday'),
(3, 5, 'Wednesday'), (3, 6, 'Wednesday'), (3, 7, 'Wednesday'), (3, 9, 'Wednesday'),
(3, 5, 'Thursday'), (3, 6, 'Thursday'), (3, 7, 'Thursday'), (3, 9, 'Thursday'),
(3, 5, 'Friday'), (3, 6, 'Friday'), (3, 7, 'Friday'), (3, 9, 'Friday'),

-- Dr. Brown (Consultant 4) - Tuesday to Saturday, morning and afternoon
(4, 1, 'Tuesday'), (4, 2, 'Tuesday'), (4, 3, 'Tuesday'), (4, 5, 'Tuesday'),
(4, 1, 'Wednesday'), (4, 2, 'Wednesday'), (4, 3, 'Wednesday'), (4, 5, 'Wednesday'),
(4, 1, 'Thursday'), (4, 2, 'Thursday'), (4, 3, 'Thursday'), (4, 5, 'Thursday'),
(4, 1, 'Friday'), (4, 2, 'Friday'), (4, 3, 'Friday'), (4, 5, 'Friday'),
(4, 1, 'Saturday'), (4, 2, 'Saturday'), (4, 3, 'Saturday'), (4, 5, 'Saturday');

-- Chèn Phiên đặt lịch
INSERT INTO Booking_Session (consultant_id, member_id, slot_id, booking_date, status, notes, google_meet_link) VALUES
(1, 6, 1, '2024-01-15', 'completed', N'Tư vấn ban đầu để đánh giá nghiện. Bệnh nhân thể hiện sự tham gia tích cực.', 'https://meet.google.com/abc-defg-hij'),
(1, 6, 5, '2024-01-22', 'completed', N'Buổi theo dõi. Thảo luận về các lựa chọn điều trị và cân nhắc về thuốc.', 'https://meet.google.com/klm-nopq-rst'),
(2, 7, 7, '2024-01-18', 'completed', N'Tư vấn cho phụ huynh về chiến lược phòng ngừa sử dụng chất gây nghiện ở tuổi teen.', 'https://meet.google.com/uvw-xyz-123'),
(3, 8, 6, '2024-01-20', 'scheduled', N'Đã lên lịch buổi giáo dục phòng ngừa cho sinh viên đại học.', NULL),
(2, 9, 3, '2024-01-25', 'scheduled', N'Tư vấn phát triển chuyên môn cho nhân viên y tế.', NULL),
(1, 6, 2, '2024-01-29', 'scheduled', N'Buổi lập kế hoạch điều trị tiếp theo.', NULL),
(4, 7, 1, '2024-01-23', 'cancelled', N'Phụ huynh hủy do xung đột lịch trình.', NULL),
(3, 8, 9, '2024-01-17', 'completed', N'Hoàn thành thành công buổi chuẩn bị trị liệu nhóm.', 'https://meet.google.com/456-789-012');

-- Chèn Danh mục
INSERT INTO Category (description) VALUES
('Article'),
('Video'),
('Podcast');

-- Chèn Chương trình
INSERT INTO Programs (img_link, title, description, create_by, status, age_group, create_at, category_id) VALUES
('https://example.com/img1.jpg', N'Cơ bản về Sức khỏe Tâm thần', N'Giới thiệu về các khái niệm sức khỏe tâm thần', 1, 'active', '18-25', GETDATE(), 1),
('https://example.com/img2.jpg', N'Quản lý Căng thẳng', N'Học cách quản lý căng thẳng hiệu quả', 1, 'active', '18-25', GETDATE(), 2),
('https://example.com/img3.jpg', N'Thiền Buổi sáng', N'Các buổi thiền hướng dẫn', 1, 'active', '18-25', GETDATE(), 3);

-- Chèn Đăng ký của Người dùng
INSERT INTO Enroll (user_id, program_id, start_at, progress) VALUES
(6, 2, '2024-01-10 10:00:00', 0.75),
(7, 3, '2024-01-12 14:00:00', 0.40),
(8, 1, '2024-01-08 09:00:00', 0.90),
(8, 3, '2024-01-15 16:00:00', 0.25),
(9, 2, '2024-01-05 11:00:00', 1.0);

-- Chèn Hành động cho Đánh giá
INSERT INTO Action (description, range, type) VALUES
(N'Hoàn thành Đánh giá - Chuyển hướng đến Tài nguyên Phù hợp', 10000000, 'Referral'),
(N'Giáo dục ngắn - Thông báo cho bệnh nhân về rủi ro của việc sử dụng ma túy bất hợp pháp và dấu hiệu của rối loạn sử dụng chất', 0, 'ASSIST'),
(N'Can thiệp ngắn - Thảo luận lấy bệnh nhân làm trung tâm sử dụng các khái niệm Phỏng vấn Động lực để nâng cao nhận thức về việc sử dụng chất và tăng cường động lực thay đổi. Can thiệp ngắn thường được thực hiện trong 3-15 phút, và nên được thực hiện trong cùng buổi với việc sàng lọc. Các buổi lặp lại hiệu quả hơn can thiệp một lần.', 4, 'ASSIST'),
(N'Can thiệp ngắn (đưa ra các lựa chọn bao gồm điều trị) - Nếu bệnh nhân sẵn sàng chấp nhận điều trị, việc chuyển hướng là một quá trình chủ động tạo điều kiện tiếp cận chăm sóc chuyên khoa cho những cá nhân có khả năng gặp phải rối loạn sử dụng chất. Những bệnh nhân này được chuyển đến các chuyên gia điều trị rượu và ma túy để đánh giá sâu hơn, chính xác hơn và, nếu được bảo đảm, điều trị. Tuy nhiên, điều trị cũng bao gồm việc kê đơn thuốc cho rối loạn sử dụng chất như một phần của chăm sóc ban đầu bình thường của bệnh nhân.', 27, 'ASSIST'),
(N'Rủi ro Thấp - Cung cấp thông tin về rủi ro của việc sử dụng chất và lái xe/đi xe liên quan đến sử dụng chất; đưa ra lời khen và khuyến khích. Tặng tờ rơi Hợp đồng cho Cuộc sống hoặc Cam kết cho Cuộc sống.', 0, 'CRAFFT'),
(N'Rủi ro Trung bình - Cung cấp thông tin về rủi ro của việc sử dụng chất và lái xe/đi xe liên quan đến sử dụng chất; lời khuyên ngắn; có thể có buổi theo dõi. Tham gia thảo luận về các tác động sức khỏe bất lợi với khuyến nghị rõ ràng để ngừng.', 1, 'CRAFFT'),
(N'Rủi ro Cao - Cung cấp thông tin về rủi ro của việc sử dụng chất và lái xe/đi xe liên quan đến sử dụng chất; lời khuyên ngắn; buổi theo dõi; có thể chuyển hướng đến tư vấn/điều trị. Sử dụng khung 5 Rs: Xem xét, Khuyến nghị, Tư vấn rủi ro Lái xe/Đi xe, Phản hồi (gợi ra các tuyên bố tự động lực), Củng cố hiệu quả bản thân.', 2, 'CRAFFT');

-- Chèn Đánh giá
INSERT INTO Assessments (user_id, type, result_json, create_at, action_id) VALUES
(6, N'Sàng lọc Sử dụng Chất', N'{"total_score": 15, "risk_level": "moderate", "areas_of_concern": ["sử dụng rượu", "áp lực xã hội"], "recommendations": ["tư vấn", "nhóm hỗ trợ đồng đẳng"]}', '2024-01-15 10:00:00', 2),
(7, N'Đánh giá Tác động Gia đình', N'{"total_score": 8, "family_stress_level": "moderate", "support_needs": ["kỹ năng giao tiếp", "thiết lập ranh giới"], "children_affected": 1}', '2024-01-18 14:00:00', 2),
(8, N'Đánh giá Rủi ro Sinh viên', N'{"total_score": 5, "risk_level": "low", "protective_factors": ["hỗ trợ gia đình mạnh", "tham gia học tập"], "risk_factors": ["ảnh hưởng của bạn bè"]}', '2024-01-20 09:00:00', 1),
(9, N'Đánh giá Sẵn sàng Chuyên nghiệp', N'{"total_score": 22, "competency_areas": ["nhận biết", "can thiệp", "chuyển hướng"], "training_needs": ["phỏng vấn động lực"]}', '2024-01-25 11:00:00', 5);

-- Chèn Nội dung
INSERT INTO Content (program_id, title, type, orders, content_file_link, content_type, content_metadata_json) VALUES
(1, N'Hiểu về Sức khỏe Tâm thần', 'article', 1, '/content/markdown/article1.md', 'markdown', '{"author": "Dr. Smith", "readingTime": "5 phút"}'),
(2, N'Kỹ thuật Giảm Căng thẳng', 'video', 1, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video', '{"duration": "15:30", "format": "mp4"}'),
(3, N'Thiền Buổi sáng', 'podcast', 1, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'audio', '{"duration": "20:00", "format": "mp3"}');

-- Chèn Khảo sát
INSERT INTO Surveys (program_id, type, questions_json) VALUES
(1, 'pre-assessment', '{"questions": [{"id": 1, "text": "Bạn tự tin như thế nào về việc từ chối chất gây nghiện?", "type": "scale", "scale": "1-10"}, {"id": 2, "text": "Bạn đã từng cảm thấy bị áp lực từ bạn bè để sử dụng chất gây nghiện chưa?", "type": "yes_no"}, {"id": 3, "text": "Những tình huống nào khiến bạn dễ đưa ra quyết định kém?", "type": "multiple_choice", "options": ["tiệc tùng", "căng thẳng", "áp lực bạn bè", "buồn chán"]}]}'),
(1, 'post-assessment', '{"questions": [{"id": 1, "text": "Bây giờ bạn tự tin như thế nào về việc từ chối chất gây nghiện?", "type": "scale", "scale": "1-10"}, {"id": 2, "text": "Chiến lược nào từ chương trình bạn thấy hữu ích nhất?", "type": "multiple_choice", "options": ["đóng vai", "khung ra quyết định", "hỗ trợ đồng đẳng", "kỹ năng giao tiếp"]}, {"id": 3, "text": "Bạn có khả năng giới thiệu chương trình này cho bạn bè không?", "type": "scale", "scale": "1-10"}]}'),
(2, 'weekly-checkin', '{"questions": [{"id": 1, "text": "Trong tuần này bạn cảm thấy thèm thuốc mạnh bao nhiêu ngày?", "type": "number"}, {"id": 2, "text": "Bạn đã sử dụng những chiến lược đối phó nào trong tuần này?", "type": "multiple_choice", "options": ["bài tập thở", "nhóm hỗ trợ", "hoạt động thể chất", "viết nhật ký", "gọi người hỗ trợ"]}, {"id": 3, "text": "Đánh giá tâm trạng chung của bạn trong tuần này", "type": "scale", "scale": "1-10"}]}');

-- Chèn Phản hồi Khảo sát
INSERT INTO Survey_Responses (survey_id, user_id, answer_json, submitted_at) VALUES
(1, 8, '{"answers": [{"question_id": 1, "answer": "7"}, {"question_id": 2, "answer": "yes"}, {"question_id": 3, "answer": ["tiệc tùng", "áp lực bạn bè"]}]}', '2024-01-08 09:30:00'),
(2, 8, '{"answers": [{"question_id": 1, "answer": "9"}, {"question_id": 2, "answer": ["đóng vai", "kỹ năng giao tiếp"]}, {"question_id": 3, "answer": "10"}]}', '2024-01-15 10:00:00'),
(3, 6, '{"answers": [{"question_id": 1, "answer": "2"}, {"question_id": 2, "answer": ["bài tập thở", "nhóm hỗ trợ", "hoạt động thể chất"]}, {"question_id": 3, "answer": "8"}]}', '2024-01-17 14:30:00');

-- Chèn Bài viết Blog
INSERT INTO Blogs (author_id, title, body, created_at, status, img_link) VALUES
(2, N'Hiểu về Khoa học của Nghiện', N'Nghiện là một căn bệnh phức tạp ảnh hưởng đến hệ thống phần thưởng, động lực và trí nhớ của não. Trong bài viết này, chúng ta tìm hiểu về những thay đổi sinh lý thần kinh xảy ra với việc sử dụng chất gây nghiện và cách hiểu biết về những thay đổi này có thể giảm kỳ thị và cải thiện kết quả điều trị...', '2024-01-10 09:00:00', 'published', '/uploads/blog-images/science-addiction.jpg'),
(3, N'5 Cách Hỗ trợ Người thân trong Quá trình Phục hồi', N'Hỗ trợ người đang trong quá trình phục hồi có thể là thách thức nhưng cũng rất đáng giá. Đây là năm chiến lược dựa trên bằng chứng mà các thành viên gia đình và bạn bè có thể sử dụng để cung cấp sự hỗ trợ có ý nghĩa: 1. Tự giáo dục về nghiện, 2. Thiết lập ranh giới lành mạnh...', '2024-01-12 14:00:00', 'published', '/uploads/blog-images/support-recovery.jpg'),
(4, N'Chiến lược Phòng ngừa Thực sự Hiệu quả', N'Nghiên cứu cho thấy các chương trình phòng ngừa hiệu quả có một số đặc điểm chính chung. Bài đăng này xem xét các chiến lược phòng ngừa dựa trên bằng chứng và cách chúng có thể được thực hiện trong trường học, cộng đồng và gia đình...', '2024-01-15 11:00:00', 'published', '/uploads/blog-images/prevention-strategies.jpg'),
(1, N'Nghiên cứu Mới về Phát triển Não Bộ ở Tuổi Teen và Sử dụng Chất gây nghiện', N'Nghiên cứu thần kinh học gần đây tiết lộ những hiểu biết quan trọng về sự phát triển não bộ ở tuổi vị thành niên và tính dễ bị tổn thương đối với việc sử dụng chất gây nghiện. Hiểu được các yếu tố phát triển này là rất quan trọng để thiết kế các chương trình phòng ngừa hiệu quả...', '2024-01-18 16:00:00', 'draft', '/uploads/blog-images/teen-brain.jpg');

-- Chèn Cờ cho kiểm duyệt nội dung
INSERT INTO Flags (blog_id, flagged_by, reason, created_at) VALUES
(4, 7, N'Nội dung chứa thông tin y tế cần được các chuyên gia xem xét trước khi xuất bản', '2024-01-19 10:00:00'); 