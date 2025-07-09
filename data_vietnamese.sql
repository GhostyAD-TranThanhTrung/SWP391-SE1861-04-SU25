-- SAMPLE DATA FOR DRUG PREVENTION APPLICATION
-- This file contains realistic sample data for testing and development

-- Insert Users (Admin, Consultants, Members)
-- Status options: 'active' (can login), 'inactive' (soft deleted, cannot login), 'banned' (cannot login)
INSERT INTO Users (role, password, status, email, img_link) VALUES
(N'admin', N'hashed_password_123', N'active', N'admin@drugprevention.com', N'/uploads/profile-pictures/default-admin.png'),
(N'admin', N'hashed_password_456', N'active', N'dr.smith@drugprevention.com', N'/uploads/profile-pictures/default-consultant.png'),
(N'consultant', N'hashed_password_789', N'active', N'therapist.johnson@drugprevention.com', N'/uploads/profile-pictures/default-consultant.png'),
(N'consultant', N'hashed_password_321', N'active', N'counselor.williams@drugprevention.com', N'/uploads/profile-pictures/default-consultant.png'),
(N'consultant', N'hashed_password_654', N'inactive', N'dr.brown@drugprevention.com', N'/uploads/profile-pictures/default-consultant.png'), -- Deactivated account
(N'member', N'hashed_password_987', N'active', N'john.doe@email.com', N'/uploads/profile-pictures/default-member.png'),
(N'member', N'hashed_password_147', N'active', N'jane.smith@email.com', N'/uploads/profile-pictures/default-member.png'),
(N'member', N'hashed_password_258', N'active', N'mike.wilson@email.com', N'/uploads/profile-pictures/default-member.png'),
(N'member', N'hashed_password_369', N'active', N'sarah.davis@email.com', N'/uploads/profile-pictures/default-member.png'),
(N'member', N'hashed_password_741', N'banned', N'banned.user@email.com', NULL), -- Banned account
(N'member', N'hashed_password_999', N'inactive', N'deleted.user@email.com', NULL); -- Soft deleted account (user "deleted" their account)

-- Insert Profiles for all users
INSERT INTO Profile (user_id, name, bio_json, date_of_birth, job) VALUES
(1, N'Quản trị viên', N'{"bio": "Quản trị viên hệ thống cho nền tảng phòng chống ma túy"}', '1985-05-15', N'Quản trị hệ thống'),
(2, N'Bác sĩ Michael Smith', N'{"bio": "Bác sĩ tâm thần nghiện có giấy phép với 15 năm kinh nghiệm trong điều trị và phòng ngừa lạm dụng chất", "education": "MD từ Johns Hopkins, Chứng nhận Hội đồng về Y học Nghiện"}', '1975-03-20', N'Bác sĩ tâm thần nghiện'),
(3, N'Sarah Johnson', N'{"bio": "Nhà trị liệu lâm sàng được cấp phép chuyên về tư vấn nghiện và trị liệu gia đình", "education": "Thạc sĩ Tâm lý học Lâm sàng, Tư vấn viên Chuyên nghiệp được cấp phép"}', '1982-08-12', N'Nhà trị liệu lâm sàng'),
(4, N'Robert Williams', N'{"bio": "Tư vấn viên lạm dụng chất được chứng nhận với chuyên môn về các chương trình phòng ngừa thanh thiếu niên", "education": "Thạc sĩ Tư vấn Nghiện, Chứng nhận CADC"}', '1978-11-05', N'Tư vấn viên lạm dụng chất'),
(5, N'Bác sĩ Emily Brown', N'{"bio": "Nhà tâm lý học lâm sàng chuyên về can thiệp hành vi cho nghiện", "education": "Tiến sĩ Tâm lý học Lâm sàng"}', '1980-01-30', N'Nhà tâm lý học lâm sàng'),
(6, N'John Doe', N'{"bio": "Tìm kiếm hỗ trợ cho phục hồi nghiện", "interests": ["thể dục", "đọc sách"]}', '1995-06-10', N'Lập trình viên'),
(7, N'Jane Smith', N'{"bio": "Phụ huynh tìm kiếm tài nguyên phòng ngừa cho thanh thiếu niên", "interests": ["làm cha mẹ", "phục vụ cộng đồng"]}', '1978-09-22', N'Giáo viên'),
(8, N'Mike Wilson', N'{"bio": "Sinh viên đại học quan tâm đến giáo dục phòng ngừa", "interests": ["thể thao", "âm nhạc"]}', '2001-12-03', N'Sinh viên'),
(9, N'Sarah Davis', N'{"bio": "Nhân viên y tế tìm kiếm phát triển chuyên môn về phòng ngừa nghiện", "interests": ["y tế", "đào tạo"]}', '1988-04-17', N'Y tá'),
(10, N'Người dùng bị cấm', N'{"bio": "Tài khoản người dùng bị cấm do vi phạm"}', '1990-07-25', N'Không xác định'),
(11, N'Người dùng đã xóa', N'{"bio": "Người dùng đã xóa tài khoản (dữ liệu được bảo tồn)"}', '1992-03-18', N'Thành viên cũ');

-- Insert Consultants
INSERT INTO Consultant (user_id, cost, certification, speciality) VALUES
(2, 150.00, N'Chứng nhận Hội đồng về Y học Nghiện, Bác sĩ được cấp phép', N'Tâm thần học nghiện, Điều trị hỗ trợ bằng thuốc, Chẩn đoán kép'),
(3, 120.00, N'Tư vấn viên Chuyên nghiệp được cấp phép, Tư vấn viên Nghiện được chứng nhận', N'Trị liệu cá nhân và gia đình, Trị liệu nhận thức hành vi, Chăm sóc thông hiểu chấn thương'),
(4, 100.00, N'Tư vấn viên Rượu và Ma túy được chứng nhận, Chuyên gia Phòng ngừa', N'Chương trình Phòng ngừa Thanh thiếu niên, Trị liệu nhóm, Tiếp cận cộng đồng'),
(5, 130.00, N'Nhà tâm lý học Lâm sàng được cấp phép, Chuyên gia Điều trị Nghiện', N'Can thiệp hành vi, Đánh giá và Định giá, Lập kế hoạch điều trị');

-- Insert Time Slots
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

-- Insert Consultant Availability
INSERT INTO Consultant_Slot (consultant_id, slot_id, day_of_week) VALUES
-- Dr. Smith (Consultant 1) - Monday to Friday, morning and afternoon
(1, 1, N'Monday'), (1, 2, N'Monday'), (1, 5, N'Monday'), (1, 6, N'Monday'),
(1, 1, N'Tuesday'), (1, 2, N'Tuesday'), (1, 5, N'Tuesday'), (1, 6, N'Tuesday'),
(1, 1, N'Wednesday'), (1, 2, N'Wednesday'), (1, 5, N'Wednesday'), (1, 6, N'Wednesday'),
(1, 1, N'Thursday'), (1, 2, N'Thursday'), (1, 5, N'Thursday'), (1, 6, N'Thursday'),
(1, 1, N'Friday'), (1, 2, N'Friday'), (1, 5, N'Friday'), (1, 6, N'Friday'),

-- Sarah Johnson (Consultant 2) - Monday to Saturday, flexible hours
(2, 3, N'Monday'), (2, 4, N'Monday'), (2, 7, N'Monday'), (2, 8, N'Monday'),
(2, 3, N'Tuesday'), (2, 4, N'Tuesday'), (2, 7, N'Tuesday'), (2, 8, N'Tuesday'),
(2, 3, N'Wednesday'), (2, 4, N'Wednesday'), (2, 7, N'Wednesday'), (2, 8, N'Wednesday'),
(2, 3, N'Thursday'), (2, 4, N'Thursday'), (2, 7, N'Thursday'), (2, 8, N'Thursday'),
(2, 3, N'Friday'), (2, 4, N'Friday'), (2, 7, N'Friday'), (2, 8, N'Friday'),
(2, 2, N'Saturday'), (2, 3, N'Saturday'), (2, 4, N'Saturday'),

-- Robert Williams (Consultant 3) - Monday to Friday, afternoon and evening
(3, 5, N'Monday'), (3, 6, N'Monday'), (3, 7, N'Monday'), (3, 9, N'Monday'),
(3, 5, N'Tuesday'), (3, 6, N'Tuesday'), (3, 7, N'Tuesday'), (3, 9, N'Tuesday'),
(3, 5, N'Wednesday'), (3, 6, N'Wednesday'), (3, 7, N'Wednesday'), (3, 9, N'Wednesday'),
(3, 5, N'Thursday'), (3, 6, N'Thursday'), (3, 7, N'Thursday'), (3, 9, N'Thursday'),
(3, 5, N'Friday'), (3, 6, N'Friday'), (3, 7, N'Friday'), (3, 9, N'Friday'),

-- Dr. Brown (Consultant 4) - Tuesday to Saturday, morning and afternoon
(4, 1, N'Tuesday'), (4, 2, N'Tuesday'), (4, 3, N'Tuesday'), (4, 5, N'Tuesday'),
(4, 1, N'Wednesday'), (4, 2, N'Wednesday'), (4, 3, N'Wednesday'), (4, 5, N'Wednesday'),
(4, 1, N'Thursday'), (4, 2, N'Thursday'), (4, 3, N'Thursday'), (4, 5, N'Thursday'),
(4, 1, N'Friday'), (4, 2, N'Friday'), (4, 3, N'Friday'), (4, 5, N'Friday'),
(4, 1, N'Saturday'), (4, 2, N'Saturday'), (4, 3, N'Saturday'), (4, 5, N'Saturday');

-- Insert Booking Sessions
INSERT INTO Booking_Session (consultant_id, member_id, slot_id, booking_date, status, notes, google_meet_link) VALUES
(1, 6, 1, '2024-01-15', N'Hoàn thành', N'Tư vấn ban đầu để đánh giá nghiện. Bệnh nhân thể hiện sự tham gia tốt.', N'https://meet.google.com/abc-defg-hij'),
(1, 6, 5, '2024-01-22', N'Hoàn thành', N'Buổi theo dõi. Thảo luận về các lựa chọn điều trị và cân nhắc thuốc.', N'https://meet.google.com/klm-nopq-rst'),
(2, 7, 7, '2024-01-18', N'Hoàn thành', N'Tư vấn phụ huynh về chiến lược phòng ngừa sử dụng chất ở thanh thiếu niên.', N'https://meet.google.com/uvw-xyz-123'),
(3, 8, 6, '2024-01-20', N'Lên lịch', N'Buổi giáo dục phòng ngừa cho sinh viên đại học đã được lên lịch.', NULL),
(2, 9, 3, '2024-01-25', N'Lên lịch', N'Tư vấn phát triển chuyên môn cho nhân viên y tế.', NULL),
(1, 6, 2, '2024-01-29', N'Lên lịch', N'Buổi lập kế hoạch điều trị đang diễn ra.', NULL),
(4, 7, 1, '2024-01-23', N'Đã hủy', N'Phụ huynh hủy do xung đột lịch trình.', NULL),
(3, 8, 9, '2024-01-17', N'Hoàn thành', N'Buổi chuẩn bị trị liệu nhóm hoàn thành thành công.', N'https://meet.google.com/456-789-012');

-- Insert Categories
INSERT INTO Category (name, description) VALUES
(N'Khoa học nghiện', N'Nội dung giáo dục khám phá nền tảng khoa học của nghiện, hóa học não và tác động thần kinh'),
(N'Cần sa (Marijuana)', N'Nội dung giáo dục về sử dụng cần sa, tác dụng, rủi ro và cân nhắc pháp lý'),
(N'Xu hướng ma túy mới', N'Thông tin về các chất mới và đang nổi lên, ma túy tổng hợp và mô hình sử dụng ma túy đang phát triển'),
(N'Fentanyl', N'Giáo dục quan trọng về fentanyl, sự nguy hiểm, phòng ngừa quá liều và biện pháp an toàn'),
(N'Giảm tác hại', N'Chiến lược và cách tiếp cận để giảm thiểu rủi ro sức khỏe liên quan đến sử dụng ma túy'),
(N'Heroin', N'Nội dung giáo dục về nghiện heroin, lựa chọn điều trị và tài nguyên phục hồi'),
(N'HIV', N'Thông tin về phòng ngừa HIV, xét nghiệm và chăm sóc liên quan đến sử dụng chất'),
(N'Kratom', N'Nội dung giáo dục về sử dụng kratom, tác dụng và rủi ro tiềm ẩn'),
(N'Methamphetamine', N'Thông tin về nghiện methamphetamine, tác dụng và cách tiếp cận điều trị'),
(N'Opioid', N'Giáo dục toàn diện về nghiện opioid, lạm dụng thuốc theo toa và điều trị'),
(N'Phòng ngừa', N'Chiến lược phòng ngừa dựa trên bằng chứng, chương trình và sáng kiến giáo dục'),
(N'Thuốc gây ảo giác và phân ly', N'Nội dung giáo dục về chất gây ảo giác, chất phân ly và tác dụng của chúng'),
(N'Psilocybin (Nấm ma thuật)', N'Thông tin về nấm psilocybin, tác dụng và cân nhắc an toàn'),
(N'Kỳ thị và phân biệt đối xử', N'Giải quyết kỳ thị, thúc đẩy hiểu biết và giảm phân biệt đối xử trong nghiện'),
(N'Chương trình dịch vụ bơm kim tiêm', N'Thông tin về chương trình trao đổi kim tiêm và dịch vụ giảm tác hại'),
(N'Thuốc lá/Nicotine và Vaping', N'Nội dung giáo dục về sử dụng thuốc lá, nghiện nicotine và rủi ro vaping'),
(N'Điều trị', N'Thông tin toàn diện về lựa chọn điều trị nghiện, chương trình phục hồi và dịch vụ hỗ trợ'),
(N'Sự kiện cộng đồng', N'Sự kiện dựa vào cộng đồng, hội thảo và hoạt động thúc đẩy nhận thức phòng ngừa ma túy và hỗ trợ nỗ lực phục hồi');

-- Insert Programs
INSERT INTO Programs (img_link, title, description, create_by, status, age_group, create_at, category_id) VALUES
-- Chương trình Khoa học Nghiện
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Hiểu biết Khoa học về Nghiện', N'Khám phá toàn diện về khoa học thần kinh đằng sau nghiện, thay đổi não và cơ chế phục hồi', 1, N'active', N'18+', GETDATE(), 1),
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Não và Nghiện: Góc nhìn Khoa học', N'Tìm hiểu sâu về cách chất tác động đến hóa học não và đường dẫn thần kinh', 1, N'active', N'18+', GETDATE(), 1),

-- Chương trình Cần sa
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Giáo dục và Nhận thức về Cần sa', N'Thông tin dựa trên bằng chứng về sử dụng cần sa, tác dụng và cân nhắc pháp lý', 1, N'active', N'18+', GETDATE(), 2),
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Cần sa và Phát triển Thanh thiếu niên', N'Hiểu tác động của sử dụng cần sa lên não đang phát triển', 1, N'active', N'13-25', GETDATE(), 2),

-- Chương trình Xu hướng Ma túy Mới
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Cảnh báo Chất Tâm thần Mới', N'Cập nhật về các loại ma túy tổng hợp và chất mới nổi', 1, N'active', N'18+', GETDATE(), 3),
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Chương trình Nhận thức Ma túy Tổng hợp', N'Giáo dục về ma túy thiết kế, rủi ro và cách nhận biết', 1, N'active', N'16+', GETDATE(), 3),

-- Chương trình Fentanyl
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Ứng phó Khủng hoảng Fentanyl', N'Giáo dục quan trọng về sự nguy hiểm của fentanyl, phòng ngừa quá liều và đào tạo naloxone', 1, N'active', N'16+', GETDATE(), 4),
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Phòng ngừa và Ứng phó Quá liều', N'Kỹ thuật cứu sống và phản ứng khẩn cấp cho quá liều opioid', 1, N'active', N'16+', GETDATE(), 4),

-- Chương trình Giảm Tác hại
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Chiến lược Giảm Tác hại', N'Cách tiếp cận thực tế để giảm thiểu rủi ro sức khỏe liên quan đến sử dụng chất', 1, N'active', N'18+', GETDATE(), 5),
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Giáo dục Sử dụng An toàn', N'Kỹ thuật giảm tác hại dựa trên bằng chứng và giao thức an toàn', 1, N'active', N'18+', GETDATE(), 5),

-- Chương trình Heroin
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Lựa chọn Điều trị Nghiện Heroin', N'Hướng dẫn toàn diện về điều trị nghiện heroin và con đường phục hồi', 1, N'active', N'18+', GETDATE(), 6),
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Điều trị Hỗ trợ bằng Thuốc cho Heroin', N'Hiểu về methadone, buprenorphine và các loại thuốc điều trị khác', 1, N'active', N'18+', GETDATE(), 6),

-- Chương trình Phòng ngừa
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Chương trình Phòng ngừa Ma túy Thanh thiếu niên', N'Chiến lược phòng ngừa dựa trên bằng chứng cho thanh thiếu niên', 1, N'active', N'13-18', GETDATE(), 11),
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Sáng kiến Phòng ngừa Cộng đồng', N'Xây dựng khả năng phục hồi và năng lực phòng ngừa cộng đồng', 1, N'active', N'Mọi lứa tuổi', GETDATE(), 11),

-- Chương trình Chất gây Ảo giác
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Giáo dục về Chất gây Ảo giác', N'Nội dung giáo dục về chất gây ảo giác, chất phân ly và tác dụng của chúng', 1, N'active', N'18+', GETDATE(), 12),


-- Chương trình Điều trị
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Điều trị Nghiện Toàn diện', N'Tổng quan về lựa chọn điều trị, chương trình phục hồi và dịch vụ hỗ trợ', 1, N'active', N'18+', GETDATE(), 17),
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Dịch vụ Hỗ trợ Phục hồi', N'Hỗ trợ đồng đẳng, tư vấn và duy trì phục hồi dài hạn', 1, N'active', N'18+', GETDATE(), 17),

-- Chương trình Sự kiện Cộng đồng
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Hội chợ Phòng ngừa Cộng đồng', N'Sự kiện cộng đồng tương tác với các gian hàng giáo dục phòng ngừa, chia sẻ tài nguyên và hoạt động thân thiện với gia đình để xây dựng nhận thức và mạng lưới hỗ trợ', 1, N'active', N'Mọi lứa tuổi', GETDATE(), 18),
(N'https://media.istockphoto.com/id/1494234366/vector/against-drug-abuse-day-flat-sign-on-white-background-no-drugs-icon.jpg?s=612x612&w=0&k=20&c=h2oOst0Wchjw-FfQrXfopjzttXgRvpZOYO5NQ9MKD2M=', N'Đi bộ Phục hồi & Tập trung Hỗ trợ', N'Sự kiện đi bộ cộng đồng thể hiện tình đoàn kết với những người đang phục hồi, giảm kỳ thị và kết nối gia đình với các nguồn hỗ trợ địa phương', 1, N'active', N'Mọi lứa tuổi', GETDATE(), 18);

-- Insert User Enrollments with JSON progress tracking
INSERT INTO Enroll (user_id, program_id, start_at, progress) VALUES
-- User 8 enrolled in Program 1 (Hiểu biết Khoa học về Nghiện) - 4 out of 6 content items completed (67% progress)
(8, 1, '2024-01-08 09:00:00', '[{"content_id":1,"complete":true},{"content_id":2,"complete":true},{"content_id":3,"complete":true},{"content_id":4,"complete":true},{"content_id":5,"complete":false},{"content_id":6,"complete":false}]'),

-- User 7 enrolled in Program 18 (Hội chợ Phòng ngừa Cộng đồng) - 1 out of 2 content items completed (50% progress)
(7, 18, '2024-01-12 14:00:00', '[{"content_id":7,"complete":true},{"content_id":8,"complete":false}]'),

-- User 9 enrolled in Program 19 (Đi bộ Phục hồi & Tập trung Hỗ trợ) - All 2 content items completed (100% progress)
(9, 19, '2024-01-05 11:00:00', '[{"content_id":9,"complete":true},{"content_id":10,"complete":true}]'),

-- User 6 enrolled in Program 1 (Hiểu biết Khoa học về Nghiện) - 5 out of 6 content items completed (83% progress)
(6, 1, '2024-01-10 10:00:00', '[{"content_id":1,"complete":true},{"content_id":2,"complete":true},{"content_id":3,"complete":true},{"content_id":4,"complete":true},{"content_id":5,"complete":true},{"content_id":6,"complete":false}]');

-- Insert Actions for Assessments
INSERT INTO Action (description, range, type) VALUES
(N'Đánh giá hoàn tất - Chuyển đến tài nguyên phù hợp', 10000000, 'Referral'),
(N'Giáo dục ngắn gọn - Thông tin cho bệnh nhân về rủi ro của việc sử dụng ma túy bất hợp pháp và dấu hiệu rối loạn sử dụng chất', 0, 'ASSIST'),
(N'Can thiệp ngắn gọn - Thảo luận tập trung vào bệnh nhân sử dụng khái niệm Phỏng vấn Tạo động lực để nâng cao nhận thức về sử dụng chất và tăng cường động lực thay đổi', 4, 'ASSIST'),
(N'Can thiệp ngắn gọn (đề xuất các lựa chọn bao gồm điều trị) - Nếu bệnh nhân sẵn sàng chấp nhận điều trị, giới thiệu là quá trình chủ động tạo điều kiện tiếp cận chăm sóc chuyên sâu', 27, 'ASSIST'),
(N'Rủi ro thấp - Cung cấp thông tin về rủi ro sử dụng chất; khen ngợi và khuyến khích', 0, 'CRAFFT'),
(N'Rủi ro trung bình - Cung cấp thông tin về rủi ro sử dụng chất; lời khuyên ngắn gọn; có thể theo dõi', 1, 'CRAFFT'),
(N'Rủi ro cao - Cung cấp thông tin về rủi ro sử dụng chất; lời khuyên ngắn gọn; theo dõi; có thể giới thiệu tư vấn/điều trị', 2, 'CRAFFT');

-- Insert Assessments
INSERT INTO Assessments (user_id, type, result_json, create_at, action_id) VALUES
(6, N'Sàng lọc Sử dụng Chất', N'{"total_score": 15, "risk_level": "moderate", "areas_of_concern": ["sử dụng rượu", "áp lực xã hội"], "recommendations": ["tư vấn", "nhóm hỗ trợ đồng đẳng"]}', '2024-01-15 10:00:00', 2),
(7, N'Đánh giá Tác động Gia đình', N'{"total_score": 8, "family_stress_level": "moderate", "support_needs": ["kỹ năng giao tiếp", "thiết lập ranh giới"], "children_affected": 1}', '2024-01-18 14:00:00', 2),
(8, N'Đánh giá Rủi ro Đại học', N'{"total_score": 5, "risk_level": "low", "protective_factors": ["hỗ trợ gia đình mạnh mẽ", "tham gia học tập"], "risk_factors": ["ảnh hưởng bạn bè"]}', '2024-01-20 09:00:00', 1),
(9, N'Đánh giá Sẵn sàng Chuyên môn', N'{"total_score": 22, "competency_areas": ["nhận diện", "can thiệp", "giới thiệu"], "training_needs": ["phỏng vấn tạo động lực"]}', '2024-01-25 11:00:00', 5);

-- Insert Content
INSERT INTO Content (program_id, title, type, orders, content_file_link, content_type, content_metadata_json) VALUES
-- Chương trình 1: Hiểu biết Khoa học Nghiện (6 nội dung)
(1, N'Khoa học Thần kinh về Nghiện', N'article', 1, N'# Understanding Addiction Science

![Understanding Addiction Science](../image/Sample.jpg)

## What is Addiction?

Addiction is a complex, chronic brain disorder characterized by compulsive drug seeking and use, despite harmful consequences. It''s considered a brain disorder because drugs change the brain''s structure and how it works.

## The Science Behind Addiction

### Brain Chemistry and Addiction

The brain''s reward system is designed to reinforce behaviors necessary for survival. When we engage in pleasurable activities, the brain releases dopamine in the reward pathway, creating feelings of pleasure and satisfaction.

### How Substances Affect the Brain

1. **Initial Use**: Substances trigger the release of large amounts of dopamine
2. **Tolerance**: The brain adapts by reducing dopamine production
3. **Dependence**: The brain requires the substance to function normally
4. **Addiction**: Compulsive use continues despite negative consequences

## Key Brain Areas Affected

### The Reward Circuit
- **Nucleus Accumbens**: Pleasure and motivation center
- **Ventral Tegmental Area**: Dopamine production
- **Prefrontal Cortex**: Decision-making and impulse control

### Changes in Brain Function
- Reduced dopamine sensitivity
- Impaired decision-making abilities
- Weakened impulse control
- Enhanced stress response

## The Addiction Cycle

### Stage 1: Binge/Intoxication
- Initial reward and pleasure
- Dopamine release in reward circuits
- Positive reinforcement

### Stage 2: Withdrawal/Negative Affect
- Decreased dopamine function
- Increased stress hormones
- Negative emotional states
- Craving and seeking behavior

### Stage 3: Preoccupation/Anticipation
- Compromised prefrontal cortex function
- Impaired decision-making
- Loss of control over use

## Risk Factors for Addiction

### Genetic Factors
- Family history of addiction
- Genetic variations affecting drug metabolism
- Inherited personality traits

### Environmental Factors
- Early exposure to substances
- Trauma and stress
- Peer influence
- Availability of substances

### Developmental Factors
- Age of first use
- Adolescent brain development
- Mental health conditions

## The Disease Model of Addiction

Addiction is recognized as a medical condition because it:
- Involves changes in brain structure and function
- Has predictable symptoms and progression
- Responds to specific treatments
- Can be chronic and relapsing

## Neuroplasticity and Recovery

The brain''s ability to change and adapt (neuroplasticity) means that:
- Addiction-related brain changes can be reversed
- New neural pathways can be formed
- Recovery is possible with proper treatment
- The brain can heal over time

## Treatment Implications

Understanding addiction science helps us develop:
- Evidence-based treatment approaches
- Medications that target specific brain systems
- Behavioral therapies that rewire the brain
- Comprehensive recovery programs

## Breaking the Stigma

Scientific understanding of addiction helps us recognize that:
- Addiction is not a moral failing
- People with addiction need medical treatment, not punishment
- Recovery is possible with appropriate support
- Prevention efforts should focus on risk factors

## Hope for Recovery

While addiction is a chronic condition, it is treatable. Understanding the science behind addiction:
- Reduces shame and guilt
- Promotes evidence-based treatment
- Supports long-term recovery
- Helps families understand the condition

## Key Takeaways

1. Addiction is a brain disease, not a choice
2. Substances change brain structure and function
3. Multiple factors contribute to addiction risk
4. The brain can heal and recover
5. Treatment should be based on scientific evidence
6. Recovery is possible with proper support

Remember: Knowledge is power. Understanding the science of addiction is the first step toward effective treatment and lasting recovery.', N'markdown', N'{"author": "TS. Smith", "readingTime": "12 phút", "difficulty": "trung cấp"}'),
(1, N'Cách Thuốc Thay đổi Não bộ', N'video', 2, N'https://www.youtube.com/watch?v=dQw4w9WgXcQ', N'video', N'{"duration": "15:30", "format": "youtube", "instructor": "TS. Johnson"}'),
(1, N'Dopamine và Con đường Phần thưởng', N'article', 3, N'# Dopamine and Reward Pathways in Addiction

## Understanding the Brain''s Reward System

The brain''s reward system plays a crucial role in addiction development and maintenance. Understanding how dopamine and neural reward pathways function helps explain why addiction is so powerful and why recovery can be challenging.

## What is Dopamine?

Dopamine is a neurotransmitter often called the "feel-good" chemical, but its role is more complex than simply creating pleasure. Dopamine functions as:

- **A motivation signal** - It drives us to seek rewarding experiences
- **A learning mechanism** - It helps us remember what feels good
- **A prediction system** - It anticipates future rewards

## The Reward Pathway

The brain''s reward circuit includes several key areas:

### 1. Ventral Tegmental Area (VTA)
- Source of dopamine neurons
- Responds to rewarding stimuli
- Projects to other brain regions

### 2. Nucleus Accumbens
- Receives dopamine signals
- Processing center for motivation and pleasure
- Critical for addiction development

### 3. Prefrontal Cortex
- Executive decision-making
- Impulse control
- Long-term planning

## How Substances Hijack This System

### Natural vs. Artificial Rewards

**Natural rewards** (food, social interaction, sex):
- Moderate dopamine release
- Predictable patterns
- Adaptive for survival

**Substances of abuse**:
- Massive dopamine release (2-10x normal)
- Unpredictable patterns
- Override natural reward systems

## The Addiction Cycle

### 1. Initial Use
- Substance causes large dopamine spike
- Intense pleasure/euphoria
- Strong memory formation

### 2. Tolerance Development
- Brain reduces natural dopamine production
- Dopamine receptors become less sensitive
- Higher doses needed for same effect

### 3. Dependence
- Normal activities no longer feel rewarding
- Substance becomes necessary to feel "normal"
- Withdrawal symptoms when not using

## Impact on Decision-Making

Chronic substance use affects:

- **Impulse control** - Reduced ability to resist cravings
- **Risk assessment** - Poor judgment about consequences
- **Future planning** - Focus shifts to immediate rewards

## Recovery and Healing

### Neuroplasticity and Hope

The brain can recover through:

- **Time and abstinence** - Gradual restoration of natural dopamine function
- **Healthy activities** - Exercise, music, social connection
- **Professional treatment** - Therapy and medication-assisted treatment

### Supporting Recovery

- Engage in naturally rewarding activities
- Build supportive relationships
- Practice stress management
- Consider professional help

## Key Takeaways

1. Addiction involves fundamental changes to brain reward systems
2. Understanding these changes reduces stigma and self-blame
3. Recovery is possible through neuroplasticity
4. Professional treatment can accelerate healing
5. Patience and persistence are essential for recovery

---

*This information is for educational purposes and should not replace professional medical advice.*', N'markdown', N'{"author": "TS. Williams", "readingTime": "10 phút", "difficulty": "trung cấp"}'),
(1, N'Di truyền và Nguy cơ Nghiền', N'video', 4, N'https://www.youtube.com/watch?v=dQw4w9WgXcQ', N'video', N'{"duration": "12:45", "format": "youtube", "instructor": "TS. Di truyền"}'),
(1, N'Phục hồi Não bộ khi Cai nghiện', N'podcast', 5, N'https://www.youtube.com/watch?v=dQw4w9WgXcQ', N'audio', N'{"duration": "25:00", "format": "youtube", "host": "Chuyên gia Phục hồi"}'),
(1, N'Cập nhật Nghiên cứu Khoa học Nghiện', N'article', 6, N'/content/markdown/addiction-research.md', N'markdown', N'{"author": "Nhóm Nghiên cứu", "readingTime": "8 phút", "difficulty": "nâng cao"}'),


-- Nội dung Chương trình Sự kiện Cộng đồng
-- Chương trình 18: Hội chợ Phòng ngừa Cộng đồng (2 nội dung)
(18, N'Lập kế hoạch Hội chợ Phòng ngừa Cộng đồng', N'article', 1, N'# Planning Your Community Prevention Fair

## Building Awareness Through Community Engagement

Community prevention fairs are powerful tools for bringing people together to learn about drug prevention, share resources, and build supportive networks. These events create opportunities for meaningful conversations about prevention while celebrating community resilience and unity.

## Key Planning Steps

### 1. Form a Planning Committee
- Include diverse community representatives (parents, teens, healthcare providers, educators)
- Partner with local organizations, schools, and healthcare facilities
- Assign clear roles and responsibilities to committee members

### 2. Choose the Right Venue and Date
- Select accessible, family-friendly locations (parks, community centers, school grounds)
- Avoid conflicts with other major community events
- Consider weather contingencies for outdoor events
- Plan for 3-4 hours to allow meaningful engagement

### 3. Essential Components to Include

**Information Booths:**
- Local prevention resources and services
- Mental health and counseling organizations
- Healthcare providers and clinics
- Law enforcement community outreach
- Parent and family support groups

**Interactive Activities:**
- Prevention education games and quizzes
- Resource scavenger hunts for families
- Pledge walls for community commitments
- Photo booths with prevention messages

**Educational Presentations:**
- Brief, age-appropriate talks by local experts
- Panel discussions with community leaders
- Testimonials from recovery advocates (when appropriate)

## Making It Family-Friendly

### Activities for Different Age Groups
- **Young Children (5-10):** Coloring stations, healthy living games, safety education
- **Tweens/Teens (11-17):** Interactive workshops, peer education activities, resource fairs
- **Adults:** Information sessions, networking opportunities, parent education workshops

### Creating Safe Conversations
- Train volunteers in age-appropriate communication
- Provide conversation guides for difficult topics
- Ensure multiple languages are represented if needed
- Create welcoming spaces for all families

## Resource Distribution

### Essential Materials to Provide
- Local resource directories with contact information
- Age-appropriate educational brochures
- Emergency contact cards (crisis hotlines, local services)
- Take-home activities for continued learning
- Information about ongoing community programs

### Follow-Up Opportunities
- Sign-up sheets for ongoing programs and workshops
- Contact information for continued support
- Event feedback forms to improve future fairs
- Connection to online resources and communities

## Measuring Success

A successful prevention fair creates lasting connections and increased awareness. Success indicators include:
- High attendance across diverse community demographics
- Positive feedback from participants and vendors
- Increased enrollment in ongoing prevention programs
- New partnerships formed between organizations
- Media coverage that spreads prevention messages

## Building Momentum

Community prevention fairs work best as part of ongoing prevention efforts. Consider:
- Annual or bi-annual scheduling to maintain momentum
- Rotating locations to reach different neighborhoods
- Seasonal themes that connect to school calendars or awareness months
- Follow-up mini-events to maintain connections

Remember, the goal is not just information sharing, but community building. When people feel connected to their neighbors and local resources, they''re better equipped to prevent substance use and support those who need help.

## Getting Started

Start small and build year by year. Even a modest first event can plant the seeds for a thriving annual tradition that strengthens your community''s prevention efforts and creates lasting positive change.', N'markdown', N'{"author": "Điều phối viên Sự kiện Cộng đồng", "readingTime": "8 phút", "difficulty": "sơ cấp"}'),
(18, N'Hoạt động Thu hút Mọi lứa tuổi', N'article', 2, N'# Engaging Activities for All Ages at Prevention Fairs

## Creating Memorable Learning Experiences

The key to a successful prevention fair is creating activities that are both educational and enjoyable. When people have fun while learning, they''re more likely to remember the messages and take action to support prevention in their community.

## Interactive Learning Stations

### Prevention Promise Tree
Set up a large decorative tree where participants can hang written commitments to healthy choices. Provide colorful cards and markers for people to write their personal prevention promises or goals for supporting others.

**Materials Needed:**
- Large artificial tree or tree branches in a decorative pot
- Colorful paper leaves or tags
- Markers and pens
- String or ribbon for hanging

### Myth-Busting Game Show
Create a fun, game-show style booth where participants can test their knowledge about substance use prevention. Use a spinning wheel or question cards to make it interactive.

**Sample Questions:**
- True or False: Prescription drugs are always safe because they''re legal
- What percentage of teens have tried alcohol by 12th grade?
- Name three healthy ways to manage stress

### Resource Scavenger Hunt
Design a scavenger hunt that leads families through different resource booths. Participants collect stickers or stamps at each station after learning about the services offered.

**Hunt Items:**
- Find where to get free mental health counseling
- Locate the booth with information about teen support groups
- Discover three healthy after-school activity options
- Learn about emergency resources for families in crisis

## Age-Specific Activity Areas

### Little Ones (Ages 3-8): "Healthy Heroes Zone"

**Coloring Station:**
- Prevention-themed coloring sheets featuring healthy activities
- Stickers and crayons in bright colors
- Take-home coloring books about making good choices

**Puppet Show:**
- 15-minute shows about friendship, saying no, and getting help
- Interactive elements where children can participate
- Simple, positive messages about staying safe and healthy

**Healthy Snack Decorating:**
- Let children decorate apple slices or whole grain crackers
- Teach about nutrition and healthy choices
- Provide recipe cards for families to take home

### School Age (Ages 9-12): "Smart Choices Station"

**Decision-Making Board Game:**
- Large floor game where children move through scenarios
- Practice saying no to peer pressure
- Learn about trusted adults and when to ask for help

**Prevention Pledge Banner:**
- Collaborative art project where kids add handprints or signatures
- Display throughout the event as a visual commitment
- Take photos for community newsletter or social media

**"What Would You Do?" Theater:**
- Simple role-playing scenarios with guidance from volunteers
- Practice communication skills and problem-solving
- Focus on peer support and friendship

### Teens (Ages 13-17): "Real Talk Zone"

**Anonymous Question Box:**
- Safe space for teens to submit questions about difficult topics
- Local experts provide answers during designated times
- Ensure confidentiality and create judgment-free environment

**Peer Education Corner:**
- Trained teen volunteers share information with other teens
- Focus on topics like stress management and healthy relationships
- Provide leadership opportunities for youth advocates

**Creative Expression Wall:**
- Mural or poster-making area for teens to express their thoughts
- Art supplies for creating prevention messages
- Photo opportunities with completed artwork

## Family Engagement Activities

### Family Commitment Ceremony
A brief, meaningful ceremony where families can make public commitments to support each other in making healthy choices.

**Elements:**
- Simple ceremony script led by community leader
- Family commitment cards to sign and keep
- Group photo opportunity
- Connection to ongoing family support resources

### Communication Skills Workshop
Quick, hands-on workshop for parents and teens to practice difficult conversations.

**Activities:**
- Role reversal exercises
- Active listening practice
- Scripts for common challenging situations
- Take-home conversation starter cards

### Resource Speed Dating
Fast-paced activity where families rotate through mini-presentations from local organizations.

**Format:**
- 5-minute presentations at each station
- Bell or timer to signal rotation
- Information packets for each organization
- Sign-up sheets for follow-up contact

## Technology-Enhanced Activities

### Digital Storytelling Booth
- Tablets or phones for recording brief video messages
- Prompts for sharing prevention commitments or support messages
- Privacy options for sharing (personal use only, community sharing, etc.)

### Social Media Photo Frame
- Large decorative frame with prevention hashtags
- Props related to healthy living and community support
- Encourage positive social media sharing about the event

### QR Code Treasure Hunt
- QR codes throughout the fair linking to prevention resources
- Smartphones or tablets available for participants without devices
- Digital badges or rewards for completing the hunt

## Volunteer Training for Activities

### Essential Training Elements
- Age-appropriate communication techniques
- How to handle difficult questions or emotional responses
- Basic information about local resources and referral processes
- Cultural sensitivity and inclusive practices

### Activity-Specific Skills
- Game facilitation and crowd management
- Basic counseling techniques for supportive listening
- Emergency procedures and when to call for help
- Documentation and follow-up procedures

## Making Activities Accessible

### Physical Accessibility
- Ensure all activities can be adapted for different physical abilities
- Provide multiple ways to participate in each activity
- Consider sensory-friendly options for those with sensitivities

### Language and Cultural Accessibility
- Provide materials in multiple languages when possible
- Include cultural considerations in activity design
- Train volunteers in cultural sensitivity and communication

### Economic Accessibility
- Ensure all activities are free of charge
- Provide all necessary materials
- Avoid activities that might make families feel excluded

## Creating Lasting Impact

The best prevention fair activities create connections that extend beyond the event itself. Design activities that:
- Connect families to ongoing resources and support
- Build relationships between community members
- Provide tools and skills for continued prevention efforts
- Create positive memories associated with prevention and community support

Remember, the goal is to make prevention education approachable, memorable, and actionable for everyone in your community.', N'markdown', N'{"author": "Chuyên gia Thu hút Thanh thiếu niên", "readingTime": "6 phút", "difficulty": "sơ cấp"}'),

-- Chương trình 19: Đi bộ Phục hồi & Tập trung Hỗ trợ (2 nội dung)
(19, N'Tổ chức Sự kiện Đi bộ Hỗ trợ Phục hồi', N'article', 1, N'# Organizing a Recovery Support Walk

## Building Community Through Movement and Solidarity

Recovery walks are powerful community events that bring people together to show support for those in recovery, honor those lost to addiction, and celebrate the strength of individuals and families affected by substance use. These events help reduce stigma while building connections and hope.

## Understanding the Purpose

### Primary Goals
- **Show solidarity** with individuals and families in recovery
- **Reduce stigma** associated with addiction and treatment
- **Honor memories** of those lost to substance use disorders
- **Celebrate recovery milestones** and ongoing journeys
- **Connect families** to local resources and support networks
- **Build community awareness** about addiction as a health condition

### Creating an Inclusive Environment
Recovery walks welcome everyone: people in recovery, family members, friends, community supporters, and anyone who believes in the power of recovery. The emphasis is on community support rather than personal disclosure.

## Planning Your Recovery Walk

### Timeline and Preparation (6-8 weeks ahead)

**8 Weeks Before:**
- Form organizing committee with diverse representation
- Secure necessary permits and insurance
- Choose date, time, and route
- Begin outreach to potential sponsors and partners

**6 Weeks Before:**
- Launch promotional campaign
- Register with local recovery organizations
- Coordinate with local media for coverage
- Begin volunteer recruitment

**4 Weeks Before:**
- Finalize logistics (safety, refreshments, activities)
- Distribute promotional materials
- Confirm speakers and special participants
- Order supplies and materials

**2 Weeks Before:**
- Final headcount estimates
- Confirm all volunteers and roles
- Prepare registration materials
- Brief all participants on safety and messaging

### Route Planning

**Ideal Characteristics:**
- 1-3 miles in length (accessible to various fitness levels)
- Safe, well-lit areas with minimal traffic
- Symbolic start and end points (community center, park, memorial site)
- Accessible for wheelchairs and mobility devices
- Public restroom access along the route

**Safety Considerations:**
- Coordinate with local law enforcement for traffic control
- Provide walk marshals throughout the route
- Have medical support available
- Create alternative shorter routes for different abilities
- Plan for weather contingencies

## Registration and Check-In

### Pre-Event Registration
- Online registration platform with basic information
- Walk-up registration on day of event
- No cost to participate, but donations welcomed
- Collect contact information for follow-up resources

### Day-of Check-In Process
- Welcome table with resource packets
- T-shirts or walk items (if budget allows)
- Name tags or identification for safety
- Route maps and safety information
- Information about post-walk activities

### Resource Packets Should Include:
- Local treatment and support services directory
- Crisis hotline numbers
- Information about ongoing support groups
- Educational materials about recovery
- Contact information for continued engagement

## Creating Meaningful Moments

### Opening Ceremony (15-20 minutes)
- Welcome from event organizers
- Brief remarks from community leaders
- Moment of silence for those lost to addiction
- Recognition of recovery milestones
- Explanation of walk route and safety guidelines

### During the Walk
- Positive signage along the route with recovery messages
- Water stations staffed by volunteers
- Photo opportunities at designated spots
- Music or drumming groups at intervals
- Walk marshals offering encouragement

### Closing Activities
- Celebration at the endpoint with light refreshments
- Resource fair with local organizations
- Sharing circle for those who want to participate
- Recognition of sponsors and volunteers
- Information about follow-up events and ongoing support

## Messaging and Communication

### Key Messages
- **Recovery is possible** for everyone
- **Addiction is a health condition**, not a moral failing
- **Community support** makes a difference in recovery
- **Every person** deserves compassion and opportunity for healing
- **Families and friends** are part of the recovery journey

### Promotional Materials
- Flyers for community centers, healthcare facilities, and schools
- Social media content with positive, inclusive messaging
- Press releases for local media
- Partnerships with local businesses for cross-promotion
- Word-of-mouth through existing recovery networks

### Media Guidelines
- Focus on community support rather than individual stories
- Respect privacy and anonymity principles
- Emphasize hope, recovery, and resources
- Avoid stigmatizing language or imagery
- Include information about local resources in all coverage

## Engaging Different Community Groups

### Recovery Community
- Partner with local treatment centers and recovery organizations
- Include people with various lengths of recovery time
- Respect anonymity preferences and traditions
- Provide leadership opportunities for those in recovery

### Families and Friends
- Create specific outreach to family support groups
- Include activities for children and teens
- Provide educational materials about supporting loved ones
- Offer connections to family-specific resources

### General Community
- Emphasize that everyone is welcome regardless of personal experience
- Focus on community health and support
- Include local business leaders, faith communities, and civic groups
- Create volunteer opportunities for ongoing engagement

## Safety and Risk Management

### Physical Safety
- First aid stations along the route
- Emergency contact protocol
- Weather monitoring and contingency plans
- Crowd management and traffic safety measures

### Emotional Safety
- Trained volunteers to support participants who become emotional
- Clear guidelines about sharing personal stories
- Access to counselors or mental health professionals
- Information about crisis resources

### Privacy and Confidentiality
- Photography policies that respect anonymity
- Optional participation in media activities
- Respect for recovery traditions regarding anonymity
- Clear guidelines for volunteers about confidentiality

## Follow-Up and Sustained Engagement

### Immediate Follow-Up (within 1 week)
- Thank you messages to participants and sponsors
- Photos and highlights shared through social media
- Connection to ongoing resources for interested participants
- Feedback collection for future event improvement

### Ongoing Community Building
- Monthly or quarterly follow-up events
- Connection to existing support groups and meetings
- Volunteer opportunities for continued engagement
- Annual walk planning committee participation

## Measuring Success

### Quantitative Measures
- Number of participants and demographic diversity
- Amount of media coverage and community reach
- Number of resource connections made
- Follow-up engagement with participants

### Qualitative Measures
- Participant feedback about feeling supported and connected
- Community feedback about increased awareness and reduced stigma
- Stories of new connections and friendships formed
- Sense of hope and empowerment among participants

## Building Long-Term Impact

Recovery walks work best when they''re part of ongoing community efforts to support prevention, treatment, and recovery. Consider how your walk can connect to year-round activities and create lasting positive change in your community.', N'markdown', N'{"author": "Người vận động Phục hồi", "readingTime": "7 phút", "difficulty": "sơ cấp"}'),
(19, N'Xây dựng Mạng lưới Hỗ trợ Cộng đồng', N'article', 2, N'# Building Community Support Networks

## The Foundation of Effective Prevention and Recovery

Strong community support networks are essential for both preventing substance use and supporting those in recovery. These networks create environments where individuals and families feel connected, supported, and empowered to make healthy choices. When communities work together, they become more resilient and better equipped to address substance use challenges.

## Understanding Community Support Networks

### What Makes a Network Effective

**Interconnected Relationships:**
- Multiple organizations and individuals working together
- Clear communication channels between different groups
- Shared goals and coordinated efforts
- Regular collaboration and resource sharing

**Diverse Representation:**
- Healthcare providers and treatment centers
- Schools and educational institutions
- Faith-based organizations
- Community organizations and nonprofits
- Law enforcement and criminal justice
- Families and individuals with lived experience
- Local businesses and employers
- Government agencies and elected officials

**Accessibility and Inclusion:**
- Services available to all community members regardless of economic status
- Culturally responsive programming and outreach
- Multiple language options and communication methods
- Transportation and scheduling considerations
- Welcome environment for all families

## Key Components of Support Networks

### Prevention-Focused Elements

**Early Education and Awareness:**
- School-based prevention programs starting in elementary years
- Parent education workshops about prevention and early intervention
- Community education about risk factors and protective factors
- Public awareness campaigns that reduce stigma and increase understanding

**Youth Development Opportunities:**
- After-school programs and supervised activities
- Mentorship programs connecting youth with positive adult role models
- Leadership development opportunities for teens
- Job training and employment opportunities for young adults

**Family Strengthening Programs:**
- Parenting skills workshops and support groups
- Family therapy and counseling services
- Crisis intervention and emergency support
- Childcare and respite services for families under stress

### Treatment and Recovery Support

**Accessible Treatment Options:**
- Multiple levels of care (outpatient, intensive outpatient, residential)
- Medication-assisted treatment when appropriate
- Mental health services integrated with substance use treatment
- Specialized programs for different populations (youth, adults, families, specific communities)

**Peer Support Services:**
- Recovery support groups and meetings
- Peer recovery coaches and mentors
- Sober social activities and recreational opportunities
- Employment and housing assistance programs

**Family and Friends Support:**
- Support groups for family members and friends
- Education about addiction as a health condition
- Resources for supporting loved ones in recovery
- Self-care and boundary-setting guidance

## Building Your Community Network

### Assessment and Planning Phase

**Community Assessment:**
- Identify existing resources and services
- Assess gaps in services or geographic coverage
- Survey community members about needs and barriers
- Analyze data about local substance use patterns and trends

**Stakeholder Mapping:**
- List all potential network partners
- Identify key decision-makers and influential community members
- Assess current relationships and collaboration levels
- Prioritize partnership development opportunities

**Resource Inventory:**
- Catalog available funding sources and grant opportunities
- Identify volunteer capacity and skill sets
- Assess physical spaces available for programming
- Inventory existing educational materials and resources

### Network Development Strategies

**Start with Champions:**
- Identify passionate individuals and organizations already working in this area
- Build initial partnerships with committed stakeholders
- Create early wins through small collaborative projects
- Use success stories to attract additional partners

**Formal Structure and Coordination:**
- Establish regular meeting schedules and communication protocols
- Create shared governance structure with clear roles and responsibilities
- Develop memorandums of understanding between partner organizations
- Implement data sharing and evaluation systems

**Sustainable Funding Approaches:**
- Diversify funding sources (grants, donations, fee-for-service, government contracts)
- Develop business plans for sustainable service delivery
- Create partnerships that share costs and resources
- Advocate for policy changes that support network funding

## Overcoming Common Challenges

### Competition vs. Collaboration
**Challenge:** Organizations competing for limited funding may resist collaboration.
**Solutions:**
- Focus on shared mission and community benefit rather than organizational interests
- Develop agreements about client referrals and service coordination
- Create joint funding proposals that benefit multiple organizations
- Celebrate shared successes and acknowledge all partners'' contributions

### Communication and Coordination
**Challenge:** Multiple organizations with different cultures and priorities may struggle to work together.
**Solutions:**
- Establish clear communication protocols and regular check-ins
- Create shared tools for case management and resource tracking
- Develop common language and understanding about goals and approaches
- Provide training on collaboration and partnership skills

### Geographic and Cultural Barriers
**Challenge:** Rural areas or culturally diverse communities may face unique barriers to service access.
**Solutions:**
- Develop mobile or telehealth service delivery options
- Partner with trusted community leaders and organizations
- Provide services in multiple languages and culturally appropriate formats
- Address transportation and scheduling barriers creatively

## Technology Tools for Network Building

### Communication and Coordination Platforms
- Shared calendars for community events and programming
- Online collaboration tools for document sharing and project management
- Social media groups for partner organizations and community members
- Email lists and newsletters for regular communication

### Resource and Referral Systems
- Online directories of services and resources
- Electronic referral systems between partner organizations
- Client tracking systems that respect privacy while enabling coordination
- Data sharing platforms for evaluation and quality improvement

### Community Engagement Tools
- Websites and social media for public education and awareness
- Online scheduling systems for appointments and services
- Survey and feedback tools for continuous improvement
- Crisis intervention and hotline services

## Measuring Network Effectiveness

### Process Measures
- Number of organizations participating in the network
- Frequency and quality of communication between partners
- Number of cross-referrals between organizations
- Joint programming and collaborative events

### Outcome Measures
- Community awareness and knowledge about prevention and treatment
- Number of individuals and families accessing services
- Treatment engagement and completion rates
- Recovery milestones and long-term outcomes

### Impact Measures
- Changes in community substance use rates and trends
- Reduced stigma and increased support for those affected by addiction
- Increased availability and accessibility of services
- Stronger families and more resilient communities

## Sustaining Networks Over Time

### Leadership Development
- Train multiple people in network coordination and leadership
- Create succession planning for key leadership positions
- Develop leadership skills among people with lived experience
- Build capacity for continuous learning and adaptation

### Continuous Improvement
- Regular evaluation and feedback collection from all stakeholders
- Adaptation of services and approaches based on community needs
- Innovation and pilot testing of new approaches
- Learning from other successful networks and best practices

### Community Ownership
- Engage community members as partners rather than just service recipients
- Create opportunities for community input and decision-making
- Build local capacity for sustaining network efforts
- Celebrate community achievements and progress

Strong community support networks require time, dedication, and ongoing commitment from many different people and organizations. The investment is worth it because these networks create the foundation for healthier, more resilient communities where everyone has the support they need to thrive.', N'markdown', N'{"author": "Tổ chức Cộng đồng", "readingTime": "9 phút", "difficulty": "sơ cấp"}');

-- Insert Surveys
INSERT INTO Surveys (program_id, type, questions_json) VALUES

-- ==================== CHƯƠNG TRÌNH KHOA HỌC NGHIỆN ====================

-- Chương trình 1: Hiểu biết Khoa học Nghiện - Đánh giá trước
(1, 'pre-assessment', N'{"questions": [{"id": 1, "question": "Bạn đánh giá hiểu biết hiện tại của mình về cách nghiện ảnh hưởng đến não bộ như thế nào?", "options": ["Không hiểu", "Hiểu rất ít", "Hiểu một phần", "Hiểu khá", "Hiểu rất rõ"], "deleted": false}, {"id": 2, "question": "Bạn biết gì về chất dẫn truyền thần kinh và vai trò của chúng trong nghiện?", "options": ["Chưa từng nghe", "Đã nghe nhưng không hiểu", "Hiểu cơ bản", "Hiểu khá", "Hiểu chuyên sâu"], "deleted": false}, {"id": 3, "question": "Bạn quen thuộc thế nào với khái niệm đường dẫn phần thưởng dopamine?", "options": ["Hoàn toàn không quen", "Hơi quen", "Quen thuộc vừa phải", "Rất quen", "Cực kỳ quen thuộc"], "deleted": false}, {"id": 4, "question": "Bạn tin nghiện chủ yếu là sự lựa chọn hay bệnh lý?", "options": ["Hoàn toàn là lựa chọn", "Chủ yếu là lựa chọn", "Cả hai như nhau", "Chủ yếu là bệnh", "Hoàn toàn là bệnh"], "deleted": false}, {"id": 5, "question": "Bạn tự tin thế nào khi giải thích khoa học về nghiện cho người khác?", "options": ["Hoàn toàn không tự tin", "Hơi tự tin", "Tự tin vừa phải", "Rất tự tin", "Cực kỳ tự tin"], "deleted": false}, {"id": 6, "question": "Điều gì hấp dẫn bạn nhất khi học về khoa học nghiện?", "options": ["Cơ chế não bộ", "Ứng dụng điều trị", "Chiến lược phòng ngừa", "Phương pháp nghiên cứu", "Hiểu biết cá nhân", "Tất cả khía cạnh"], "deleted": false}]}'),

-- Chương trình 1: Hiểu biết Khoa học Nghiện - Đánh giá sau  
(1, 'post-assessment', N'{"questions": [{"id": 1, "question": "Sau khi hoàn thành chương trình, bạn hiểu thế nào về cách nghiện thay đổi cấu trúc và chức năng não?", "options": ["Không hiểu", "Hiểu rất ít", "Hiểu một phần", "Hiểu khá", "Hiểu rất rõ"], "deleted": false}, {"id": 2, "question": "Bây giờ bạn tự tin thế nào khi giải thích vai trò chất dẫn truyền thần kinh trong nghiện?", "options": ["Hoàn toàn không tự tin", "Hơi tự tin", "Tự tin vừa phải", "Rất tự tin", "Cực kỳ tự tin"], "deleted": false}, {"id": 3, "question": "Khía cạnh nào của khoa học nghiện bạn thấy sáng tỏ nhất?", "options": ["Đường dẫn phần thưởng dopamine", "Tính mềm dẻo và phục hồi não", "Yếu tố di truyền", "Ảnh hưởng môi trường", "Cơ chế điều trị", "Tất cả đều quan trọng"], "deleted": false}, {"id": 4, "question": "Chương trình đã thay đổi nhận thức của bạn về nghiện như bệnh lý thế nào?", "options": ["Hiểu biết tăng đáng kể", "Hiểu biết tăng vừa phải", "Hiểu biết tăng nhẹ", "Không thay đổi", "Giảm hiểu biết"], "deleted": false}, {"id": 5, "question": "Khả năng bạn chia sẻ kiến thức khoa học nghiện với người khác?", "options": ["Rất không có khả năng", "Không có khả năng", "Trung lập", "Có khả năng", "Rất có khả năng"], "deleted": false}, {"id": 6, "question": "Đánh giá hiệu quả chương trình khoa học nghiện này", "options": ["Rất không hiệu quả", "Không hiệu quả", "Trung lập", "Hiệu quả", "Rất hiệu quả"], "deleted": false}, {"id": 7, "question": "Bạn cảm thấy chuẩn bị thế nào để nhận biết dấu hiệu nghiện ở bản thân/người khác?", "options": ["Hoàn toàn không chuẩn bị", "Chuẩn bị rất ít", "Chuẩn bị vừa phải", "Chuẩn bị tốt", "Chuẩn bị rất tốt"], "deleted": false}]}'),

-- Khảo sát Đánh giá trước cho Tất cả Chương trình Phòng ngừa
(NULL, 'pre-assessment', N'{"questions": [{"id": 1, "question": "Bạn đánh giá kiến thức tổng thể về phòng ngừa lạm dụng chất?", "options": ["Rất thấp", "Thấp", "Trung bình", "Cao", "Rất cao"], "deleted": false}, {"id": 2, "question": "Bạn tự tin thế nào về khả năng quyết định lành mạnh liên quan chất kích thích?", "options": ["Hoàn toàn không tự tin", "Hơi tự tin", "Tự tin vừa phải", "Rất tự tin", "Cực kỳ tự tin"], "deleted": false}, {"id": 3, "question": "Động lực nào thúc đẩy bạn tham gia chương trình giáo dục phòng ngừa?", "options": ["Quan tâm cá nhân", "Lo ngại gia đình", "Phát triển nghề nghiệp", "Tham gia cộng đồng", "Nhận thức sức khỏe", "Tất cả trên"], "deleted": false}, {"id": 4, "question": "Bạn thường tìm kiếm thông tin về chủ đề sức khỏe?", "options": ["Không bao giờ", "Hiếm khi", "Thỉnh thoảng", "Thường xuyên", "Luôn luôn"], "deleted": false}, {"id": 5, "question": "Nguồn hỗ trợ chính cho quyết định lành mạnh của bạn?", "options": ["Gia đình", "Bạn bè", "Nhà cung cấp y tế", "Chương trình cộng đồng", "Tài nguyên trực tuyến", "Nhiều nguồn"], "deleted": false}, {"id": 6, "question": "Bạn chuẩn bị thế nào để giúp người khác ra quyết định sáng suốt về chất kích thích?", "options": ["Hoàn toàn không chuẩn bị", "Chuẩn bị rất ít", "Chuẩn bị vừa phải", "Chuẩn bị tốt", "Chuẩn bị rất tốt"], "deleted": false}]}'),

-- Khảo sát Đánh giá sau cho Tất cả Chương trình Phòng ngừa  
(NULL, 'post-assessment', N'{"questions": [{"id": 1, "question": "Bạn đánh giá kiến thức về phòng ngừa lạm dụng chất sau khi hoàn thành?", "options": ["Rất thấp", "Thấp", "Trung bình", "Cao", "Rất cao"], "deleted": false}, {"id": 2, "question": "Bây giờ bạn tự tin thế nào về quyết định sáng suốt liên quan chất kích thích?", "options": ["Hoàn toàn không tự tin", "Hơi tự tin", "Tự tin vừa phải", "Rất tự tin", "Cực kỳ tự tin"], "deleted": false}, {"id": 3, "question": "Thành phần chương trình nào có lợi nhất cho việc học của bạn?", "options": ["Tài liệu giáo dục", "Hoạt động tương tác", "Bài tập thực hành", "Thảo luận nhóm", "Thông tin tài nguyên", "Tất cả thành phần"], "deleted": false}, {"id": 4, "question": "Khả năng bạn áp dụng kiến thức từ chương trình này?", "options": ["Rất không có khả năng", "Không có khả năng", "Trung lập", "Có khả năng", "Rất có khả năng"], "deleted": false}, {"id": 5, "question": "Hiểu biết của bạn về tài nguyên phòng ngừa và hỗ trợ đã thay đổi?", "options": ["Cải thiện đáng kể", "Cải thiện vừa phải", "Cải thiện nhẹ", "Không thay đổi", "Giảm sút"], "deleted": false}, {"id": 6, "question": "Bây giờ bạn chuẩn bị thế nào để hỗ trợ người khác ra quyết định lành mạnh?", "options": ["Hoàn toàn không chuẩn bị", "Chuẩn bị rất ít", "Chuẩn bị vừa phải", "Chuẩn bị tốt", "Chuẩn bị rất tốt"], "deleted": false}, {"id": 7, "question": "Đánh giá hiệu quả tổng thể chương trình phòng ngừa này", "options": ["Rất không hiệu quả", "Không hiệu quả", "Trung lập", "Hiệu quả", "Rất hiệu quả"], "deleted": false}, {"id": 8, "question": "Khả năng bạn giới thiệu chương trình này cho người khác?", "options": ["Rất không có khả năng", "Không có khả năng", "Trung lập", "Có khả năng", "Rất có khả năng"], "deleted": false}]}');
-- Insert Survey Responses

-- Insert Blogs
INSERT INTO Blogs (author_id, title, body, created_at, status, img_link) VALUES
(2, N'Hiểu về Khoa học Nghiện', N'Nghiện là một bệnh lý phức tạp ảnh hưởng đến hệ thống khen thưởng, động lực và trí nhớ của não bộ. Trong bài viết này, chúng ta khám phá những thay đổi sinh học thần kinh xảy ra khi sử dụng chất gây nghiện và cách hiểu biết về những thay đổi này có thể giảm kỳ thị và cải thiện kết quả điều trị...', '2024-01-10 09:00:00', N'Đã xuất bản', N'/uploads/blog-images/science-addiction.jpg'),

(3, N'5 Cách Hỗ trợ Người thân Đang Phục hồi', N'Hỗ trợ người đang phục hồi có thể đầy thách thức nhưng cũng vô cùng ý nghĩa. Dưới đây là 5 chiến lược dựa trên bằng chứng mà thành viên gia đình và bạn bè có thể áp dụng để hỗ trợ hiệu quả: 1. Tìm hiểu kiến thức về nghiện, 2. Thiết lập ranh giới lành mạnh...', '2024-01-12 14:00:00', N'Đã xuất bản', N'/uploads/blog-images/support-recovery.jpg'),

(4, N'Chiến lược Phòng ngừa Thực sự Hiệu quả', N'Nghiên cứu cho thấy các chương trình phòng ngừa hiệu quả có chung nhiều đặc điểm quan trọng. Bài viết này phân tích các chiến lược phòng ngừa dựa trên bằng chứng và cách triển khai trong trường học, cộng đồng và gia đình...', '2024-01-15 11:00:00', N'Đã xuất bản', N'/uploads/blog-images/prevention-strategies.jpg'),

(1, N'Nghiên cứu Mới về Phát triển Não Tuổi teen và Sử dụng Chất kích thích', N'Nghiên cứu thần kinh học gần đây tiết lộ những hiểu biết quan trọng về sự phát triển não bộ tuổi vị thành niên và tính dễ tổn thương với chất kích thích. Hiểu các yếu tố phát triển này là rất quan trọng để thiết kế chương trình phòng ngừa hiệu quả...', '2024-01-18 16:00:00', N'Bản nháp', N'/uploads/blog-images/teen-brain.jpg');
-- Insert Flags for content moderation
INSERT INTO Flags (blog_id, flagged_by, reason, created_at) VALUES
(4, 7, N'Nội dung chứa thông tin y tế cần được chuyên gia xem xét trước khi xuất bản', '2024-01-19 10:00:00');