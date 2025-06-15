-- DỮ LIỆU MẪU CHO ỨNG DỤNG PHÒNG CHỐNG MA TÚY
-- File này chứa dữ liệu mẫu được dịch sang tiếng Việt cho mục đích kiểm thử và phát triển

-- Chèn Người dùng (Quản trị viên, Tư vấn viên, Thành viên)
INSERT INTO Users (role, password, status, email, img_link) VALUES
('admin', N'hashed_password_123', 'active', 'admin@drugprevention.com', N'/uploads/profile-pictures/default-admin.png'),
('consultant', N'hashed_password_456', 'active', 'dr.smith@drugprevention.com', N'/uploads/profile-pictures/default-consultant.png'),
('consultant', N'hashed_password_789', 'active', 'therapist.johnson@drugprevention.com', N'/uploads/profile-pictures/default-consultant.png'),
('consultant', N'hashed_password_321', 'active', 'counselor.williams@drugprevention.com', N'/uploads/profile-pictures/default-consultant.png'),
('consultant', N'hashed_password_654', 'inactive', 'dr.brown@drugprevention.com', N'/uploads/profile-pictures/default-consultant.png'),
('member', N'hashed_password_987', 'active', 'john.doe@email.com', N'/uploads/profile-pictures/default-member.png'),
('member', N'hashed_password_147', 'active', 'jane.smith@email.com', N'/uploads/profile-pictures/default-member.png'),
('member', N'hashed_password_258', 'active', 'mike.wilson@email.com', N'/uploads/profile-pictures/default-member.png'),
('member', N'hashed_password_369', 'active', 'sarah.davis@email.com', N'/uploads/profile-pictures/default-member.png'),
('member', N'hashed_password_741', 'banned', 'banned.user@email.com', NULL);

-- Chèn Hồ sơ cho tất cả người dùng
INSERT INTO Profile (user_id, name, bio_json, date_of_birth, job) VALUES
(1, N'Quản trị viên', N'{"bio": "Quản trị viên hệ thống cho nền tảng phòng chống ma túy"}', '1985-05-15', N'Quản trị Hệ thống'),
(2, N'Bác sĩ Minh Đức', N'{"bio": "Bác sĩ tâm thần chuyên về nghiện với 15 năm kinh nghiệm trong điều trị và phòng ngừa lạm dụng chất gây nghiện", "education": "Tiến sĩ Y khoa, Chứng nhận chuyên khoa Điều trị Nghiện"}', '1975-03-20', N'Bác sĩ Tâm thần Nghiện'),
(3, N'Nguyễn Thị Hương', N'{"bio": "Nhà trị liệu lâm sàng được cấp phép chuyên về tư vấn nghiện và trị liệu gia đình", "education": "Thạc sĩ Tâm lý Lâm sàng, Chứng chỉ Tư vấn Chuyên nghiệp"}', '1982-08-12', N'Nhà trị liệu Lâm sàng'),
(4, N'Trần Văn Nam', N'{"bio": "Chuyên viên tư vấn lạm dụng chất gây nghiện có chứng chỉ với chuyên môn về chương trình phòng ngừa thanh thiếu niên", "education": "Thạc sĩ Tư vấn Nghiện, Chứng chỉ CADC"}', '1978-11-05', N'Chuyên viên Tư vấn Nghiện'),
(5, N'Bác sĩ Thu Hà', N'{"bio": "Nhà tâm lý học lâm sàng chuyên về can thiệp hành vi cho nghiện", "education": "Tiến sĩ Tâm lý Lâm sàng"}', '1980-01-30', N'Nhà Tâm lý Lâm sàng'),
(6, N'Nguyễn Văn An', N'{"bio": "Tìm kiếm hỗ trợ cho quá trình phục hồi nghiện", "interests": ["thể dục", "đọc sách"]}', '1995-06-10', N'Lập trình viên'),
(7, N'Phạm Thị Mai', N'{"bio": "Phụ huynh tìm kiếm tài liệu phòng ngừa cho con tuổi teen", "interests": ["nuôi dạy con", "công tác cộng đồng"]}', '1978-09-22', N'Giáo viên'),
(8, N'Lê Minh Tuấn', N'{"bio": "Sinh viên đại học quan tâm đến giáo dục phòng ngừa", "interests": ["thể thao", "âm nhạc"]}', '2001-12-03', N'Sinh viên'),
(9, N'Đỗ Thị Hồng', N'{"bio": "Nhân viên y tế tìm kiếm phát triển chuyên môn về phòng ngừa nghiện", "interests": ["chăm sóc sức khỏe", "đào tạo"]}', '1988-04-17', N'Y tá'),
(10, N'Người dùng bị cấm', N'{"bio": "Tài khoản người dùng bị cấm do vi phạm"}', '1990-07-25', N'Không xác định');

-- Chèn Tư vấn viên
INSERT INTO Consultant (user_id, cost, certification, speciality) VALUES
(2, 150.00, N'Chứng nhận chuyên khoa Điều trị Nghiện, Bác sĩ được cấp phép', N'Tâm thần Nghiện, Điều trị Hỗ trợ Thuốc, Chẩn đoán Kép'),
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
-- Bác sĩ Minh Đức (Tư vấn viên 1) - Thứ Hai đến Thứ Sáu, sáng và chiều
(1, 1, 'Monday'), (1, 2, 'Monday'), (1, 5, 'Monday'), (1, 6, 'Monday'),
(1, 1, 'Tuesday'), (1, 2, 'Tuesday'), (1, 5, 'Tuesday'), (1, 6, 'Tuesday'),
(1, 1, 'Wednesday'), (1, 2, 'Wednesday'), (1, 5, 'Wednesday'), (1, 6, 'Wednesday'),
(1, 1, 'Thursday'), (1, 2, 'Thursday'), (1, 5, 'Thursday'), (1, 6, 'Thursday'),
(1, 1, 'Friday'), (1, 2, 'Friday'), (1, 5, 'Friday'), (1, 6, 'Friday'),

-- Nguyễn Thị Hương (Tư vấn viên 2) - Thứ Hai đến Thứ Bảy, giờ linh hoạt
(2, 3, 'Monday'), (2, 4, 'Monday'), (2, 7, 'Monday'), (2, 8, 'Monday'),
(2, 3, 'Tuesday'), (2, 4, 'Tuesday'), (2, 7, 'Tuesday'), (2, 8, 'Tuesday'),
(2, 3, 'Wednesday'), (2, 4, 'Wednesday'), (2, 7, 'Wednesday'), (2, 8, 'Wednesday'),
(2, 3, 'Thursday'), (2, 4, 'Thursday'), (2, 7, 'Thursday'), (2, 8, 'Thursday'),
(2, 3, 'Friday'), (2, 4, 'Friday'), (2, 7, 'Friday'), (2, 8, 'Friday'),
(2, 2, 'Saturday'), (2, 3, 'Saturday'), (2, 4, 'Saturday'),

-- Trần Văn Nam (Tư vấn viên 3) - Thứ Hai đến Thứ Sáu, chiều và tối
(3, 5, 'Monday'), (3, 6, 'Monday'), (3, 7, 'Monday'), (3, 9, 'Monday'),
(3, 5, 'Tuesday'), (3, 6, 'Tuesday'), (3, 7, 'Tuesday'), (3, 9, 'Tuesday'),
(3, 5, 'Wednesday'), (3, 6, 'Wednesday'), (3, 7, 'Wednesday'), (3, 9, 'Wednesday'),
(3, 5, 'Thursday'), (3, 6, 'Thursday'), (3, 7, 'Thursday'), (3, 9, 'Thursday'),
(3, 5, 'Friday'), (3, 6, 'Friday'), (3, 7, 'Friday'), (3, 9, 'Friday'),

-- Bác sĩ Thu Hà (Tư vấn viên 4) - Thứ Ba đến Thứ Bảy, sáng và chiều
(4, 1, 'Tuesday'), (4, 2, 'Tuesday'), (4, 3, 'Tuesday'), (4, 5, 'Tuesday'),
(4, 1, 'Wednesday'), (4, 2, 'Wednesday'), (4, 3, 'Wednesday'), (4, 5, 'Wednesday'),
(4, 1, 'Thursday'), (4, 2, 'Thursday'), (4, 3, 'Thursday'), (4, 5, 'Thursday'),
(4, 1, 'Friday'), (4, 2, 'Friday'), (4, 3, 'Friday'), (4, 5, 'Friday'),
(4, 1, 'Saturday'), (4, 2, 'Saturday'), (4, 3, 'Saturday'), (4, 5, 'Saturday');

-- Chèn Phiên đặt lịch
INSERT INTO Booking_Session (consultant_id, member_id, slot_id, booking_date, status, notes) VALUES
(1, 6, 1, '2024-01-15', 'completed', N'Tư vấn ban đầu để đánh giá nghiện. Bệnh nhân thể hiện sự tham gia tích cực.'),
(1, 6, 5, '2024-01-22', 'completed', N'Buổi theo dõi. Thảo luận về các lựa chọn điều trị và cân nhắc về thuốc.'),
(2, 7, 7, '2024-01-18', 'completed', N'Tư vấn cho phụ huynh về chiến lược phòng ngừa sử dụng chất gây nghiện ở tuổi teen.'),
(3, 8, 6, '2024-01-20', 'scheduled', N'Đã lên lịch buổi giáo dục phòng ngừa cho sinh viên đại học.'),
(2, 9, 3, '2024-01-25', 'scheduled', N'Tư vấn phát triển chuyên môn cho nhân viên y tế.'),
(1, 6, 2, '2024-01-29', 'scheduled', N'Buổi lập kế hoạch điều trị tiếp theo.'),
(4, 7, 1, '2024-01-23', 'cancelled', N'Phụ huynh hủy do xung đột lịch trình.'),
(3, 8, 9, '2024-01-17', 'completed', N'Hoàn thành thành công buổi chuẩn bị trị liệu nhóm.');

-- Chèn Danh mục cho Chương trình
INSERT INTO Category (description) VALUES
(N'Phòng ngừa Thanh thiếu niên'),
(N'Phục hồi Người trưởng thành'),
(N'Hỗ trợ Gia đình'),
(N'Đào tạo Chuyên môn'),
(N'Tiếp cận Cộng đồng'),
(N'Tài liệu Giáo dục');

-- Chèn Chương trình Phòng ngừa
INSERT INTO Programs (title, description, create_by, status, age_group, category_id, img_link) VALUES
(N'Lựa chọn Thông minh cho Thanh thiếu niên', N'Chương trình phòng ngừa lạm dụng chất gây nghiện toàn diện cho thanh thiếu niên, tập trung vào kỹ năng ra quyết định, chống lại áp lực bạn bè và lựa chọn lối sống lành mạnh.', 1, 'active', '13-18', 1, N'/uploads/program-images/default-youth.png'),
(N'Nền tảng Phục hồi', N'Chương trình phục hồi dựa trên bằng chứng cho người trưởng thành đang đấu tranh với nghiện chất gây nghiện. Bao gồm các mô-đun liệu pháp nhận thức hành vi và thành phần hỗ trợ đồng đẳng.', 1, 'active', '18+', 2, N'/uploads/program-images/default-adult.png'),
(N'Xây dựng Khả năng phục hồi Gia đình', N'Chương trình hỗ trợ cho các gia đình bị ảnh hưởng bởi lạm dụng chất gây nghiện. Tập trung vào giao tiếp, thiết lập ranh giới và chữa lành các mối quan hệ gia đình.', 1, 'active', 'All Ages', 3, N'/uploads/program-images/default-family.png'),
(N'Sáng kiến Phòng ngừa trong Trường học', N'Chương trình phòng ngừa lạm dụng chất gây nghiện được thiết kế đặc biệt cho sinh viên đại học, giải quyết vấn đề uống rượu quá độ và thử nghiệm ma túy.', 1, 'active', '18-25', 1, N'/uploads/program-images/default-campus.png'),
(N'Đào tạo Người hỗ trợ Chuyên nghiệp', N'Chương trình đào tạo cho nhân viên y tế, giáo viên và tư vấn viên để nhận biết và ứng phó với các vấn đề lạm dụng chất gây nghiện.', 1, 'active', 'Adult', 4, N'/uploads/program-images/default-training.png'),
(N'Chương trình Hành động Cộng đồng', N'Sáng kiến phòng ngừa toàn cộng đồng liên quan đến các tổ chức địa phương, trường học và gia đình trong nỗ lực phòng ngừa lạm dụng chất gây nghiện.', 1, 'draft', 'All Ages', 5, N'/uploads/program-images/default-community.png'),
(N'Sức khỏe Kỹ thuật số cho Thanh thiếu niên', N'Cách tiếp cận hiện đại đối với giáo dục phòng ngừa sử dụng công cụ kỹ thuật số và nhận thức về mạng xã hội cho các lựa chọn lành mạnh.', 1, 'active', '13-18', 6, N'/uploads/program-images/default-digital.png');

-- Chèn Đăng ký của Người dùng
INSERT INTO Enroll (user_id, program_id, start_at, progress) VALUES
(6, 2, '2024-01-10 10:00:00', 0.75),
(7, 3, '2024-01-12 14:00:00', 0.40),
(8, 1, '2024-01-08 09:00:00', 0.90),
(8, 4, '2024-01-15 16:00:00', 0.25),
(9, 5, '2024-01-05 11:00:00', 1.0);

-- Chèn Nội dung Chương trình
INSERT INTO Content (program_id, content_json, type, orders) VALUES
(1, N'{"title": "Hiểu về Lạm dụng Chất gây nghiện", "duration": "45 phút", "content": "Mô-đun tương tác bao gồm các loại chất gây nghiện, tác động lên não bộ và cơ thể, và các yếu tố rủi ro dẫn đến nghiện.", "activities": ["video", "trắc nghiệm", "thảo luận"]}', 'module', 1),
(1, N'{"title": "Áp lực Bạn bè và Ra quyết định", "duration": "60 phút", "content": "Bài tập đóng vai và chiến lược để chống lại áp lực bạn bè và đưa ra lựa chọn lành mạnh.", "activities": ["đóng vai", "tình huống", "suy ngẫm"]}', 'module', 2),
(1, N'{"title": "Xây dựng Mối quan hệ Lành mạnh", "duration": "45 phút", "content": "Kỹ năng giao tiếp và xây dựng các mối quan hệ hỗ trợ củng cố các lựa chọn tích cực.", "activities": ["làm việc nhóm", "thực hành", "lập kế hoạch"]}', 'module', 3),
(2, N'{"title": "Hiểu về Nghiện như một Căn bệnh", "duration": "90 phút", "content": "Khía cạnh y tế và tâm lý của nghiện, phá vỡ kỳ thị và thúc đẩy lòng tự trắc ẩn.", "activities": ["bài giảng", "thảo luận", "suy ngẫm"]}', 'module', 1),
(2, N'{"title": "Kỹ thuật Nhận thức Hành vi", "duration": "120 phút", "content": "Học cách nhận biết và thay đổi các mô hình suy nghĩ và hành vi tiêu cực liên quan đến sử dụng chất gây nghiện.", "activities": ["bài tập", "thực hành", "bài tập về nhà"]}', 'module', 2),
(2, N'{"title": "Lập kế hoạch Phòng ngừa Tái phát", "duration": "90 phút", "content": "Phát triển chiến lược cá nhân hóa để phòng ngừa tái phát và duy trì phục hồi.", "activities": ["lập kế hoạch", "công cụ", "mạng lưới hỗ trợ"]}', 'module', 3);

-- Chèn Khảo sát
INSERT INTO Surveys (program_id, type, questions_json) VALUES
(1, 'pre-assessment', N'{"questions": [{"id": 1, "text": "Bạn tự tin như thế nào về việc từ chối chất gây nghiện?", "type": "scale", "scale": "1-10"}, {"id": 2, "text": "Bạn đã từng cảm thấy bị áp lực từ bạn bè để sử dụng chất gây nghiện chưa?", "type": "yes_no"}, {"id": 3, "text": "Những tình huống nào khiến bạn dễ đưa ra quyết định kém?", "type": "multiple_choice", "options": ["tiệc tùng", "căng thẳng", "áp lực bạn bè", "buồn chán"]}]}'),
(1, 'post-assessment', N'{"questions": [{"id": 1, "text": "Bây giờ bạn tự tin như thế nào về việc từ chối chất gây nghiện?", "type": "scale", "scale": "1-10"}, {"id": 2, "text": "Chiến lược nào từ chương trình bạn thấy hữu ích nhất?", "type": "multiple_choice", "options": ["đóng vai", "khung ra quyết định", "hỗ trợ đồng đẳng", "kỹ năng giao tiếp"]}, {"id": 3, "text": "Bạn có khả năng giới thiệu chương trình này cho bạn bè không?", "type": "scale", "scale": "1-10"}]}'),
(2, 'weekly-checkin', N'{"questions": [{"id": 1, "text": "Trong tuần này bạn cảm thấy thèm thuốc mạnh bao nhiêu ngày?", "type": "number"}, {"id": 2, "text": "Bạn đã sử dụng những chiến lược đối phó nào trong tuần này?", "type": "multiple_choice", "options": ["bài tập thở", "nhóm hỗ trợ", "hoạt động thể chất", "viết nhật ký", "gọi người hỗ trợ"]}, {"id": 3, "text": "Đánh giá tâm trạng chung của bạn trong tuần này", "type": "scale", "scale": "1-10"}]}');

-- Chèn Phản hồi Khảo sát
INSERT INTO Survey_Responses (survey_id, user_id, answer_json) VALUES
(1, 8, N'{"answers": [{"question_id": 1, "answer": "7"}, {"question_id": 2, "answer": "yes"}, {"question_id": 3, "answer": ["tiệc tùng", "áp lực bạn bè"]}]}'),
(2, 8, N'{"answers": [{"question_id": 1, "answer": "9"}, {"question_id": 2, "answer": ["đóng vai", "kỹ năng giao tiếp"]}, {"question_id": 3, "answer": "10"}]}'),
(3, 6, N'{"answers": [{"question_id": 1, "answer": "2"}, {"question_id": 2, "answer": ["bài tập thở", "nhóm hỗ trợ", "hoạt động thể chất"]}, {"question_id": 3, "answer": "8"}]}');

-- Chèn Bài viết
INSERT INTO Blogs (author_id, title, body, status) VALUES
(2, N'Hiểu về Khoa học của Nghiện', N'Nghiện là một căn bệnh phức tạp ảnh hưởng đến hệ thống phần thưởng, động lực và trí nhớ của não. Trong bài viết này, chúng ta tìm hiểu về những thay đổi sinh lý thần kinh xảy ra với việc sử dụng chất gây nghiện và cách hiểu biết về những thay đổi này có thể giảm kỳ thị và cải thiện kết quả điều trị...', 'published'),
(3, N'5 Cách Hỗ trợ Người thân trong Quá trình Phục hồi', N'Hỗ trợ người đang trong quá trình phục hồi có thể là thách thức nhưng cũng rất đáng giá. Đây là năm chiến lược dựa trên bằng chứng mà các thành viên gia đình và bạn bè có thể sử dụng để cung cấp sự hỗ trợ có ý nghĩa: 1. Tự giáo dục về nghiện, 2. Thiết lập ranh giới lành mạnh...', 'published'),
(4, N'Chiến lược Phòng ngừa Thực sự Hiệu quả', N'Nghiên cứu cho thấy các chương trình phòng ngừa hiệu quả có một số đặc điểm chính chung. Bài đăng này xem xét các chiến lược phòng ngừa dựa trên bằng chứng và cách chúng có thể được thực hiện trong trường học, cộng đồng và gia đình...', 'published'),
(1, N'Nghiên cứu Mới về Phát triển Não Bộ ở Tuổi Teen và Sử dụng Chất gây nghiện', N'Nghiên cứu thần kinh học gần đây tiết lộ những hiểu biết quan trọng về sự phát triển não bộ ở tuổi vị thành niên và tính dễ bị tổn thương đối với việc sử dụng chất gây nghiện. Hiểu được các yếu tố phát triển này là rất quan trọng để thiết kế các chương trình phòng ngừa hiệu quả...', 'draft');

-- Chèn Cờ cho kiểm duyệt nội dung
INSERT INTO Flags (blog_id, flagged_by, reason) VALUES
(4, 7, N'Nội dung chứa thông tin y tế cần được các chuyên gia xem xét trước khi xuất bản');

-- Chèn Nhật ký Console
INSERT INTO console_log (user_id, action, status, error_log) VALUES
(6, 'login', 'success', NULL),
(6, 'enroll_program', 'success', NULL),
(7, 'login', 'success', NULL),
(8, 'complete_assessment', 'success', NULL),
(9, 'book_consultation', 'success', NULL),
(10, 'login', 'failed', N'Tài khoản bị cấm - từ chối truy cập'),
(6, 'submit_survey', 'success', NULL),
(2, 'create_blog', 'success', NULL); 