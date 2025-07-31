

-- ASSIST Assessment Questions and Answers (insert question, then its answers)

-- 1
INSERT INTO Assessments_question (question, type, note, assessment_type, multiSelect, allowMultiple)
VALUES (N'Trong suốt cuộc đời bạn, bạn đã từng sử dụng các chất nào sau đây? (Có thể chọn nhiều đáp án)', N'multi-select', NULL, N'ASSIST', 1, 1);
DECLARE @q1 INT = SCOPE_IDENTITY();
INSERT INTO Answers (assessment_question_id, id, text, score, answer_order) VALUES
(@q1, 1, N'Cần sa (marijuana, pot, cỏ, hash, v.v.)', 3, 1),
(@q1, 2, N'Cocaine (coke, crack, v.v.)', 3, 2),
(@q1, 3, N'Thuốc kích thích kê đơn (Adderall, Ritalin, thuốc ăn kiêng, v.v.) dùng sai mục đích', 3, 3),
(@q1, 4, N'Methamphetamine (meth, đá, ecstasy, molly, v.v.)', 3, 4),
(@q1, 5, N'Chất hít (keo, sơn, khí cười, poppers, v.v.)', 3, 5),
(@q1, 6, N'Thuốc an thần (Xanax, Valium, thuốc ngủ, benzodiazepine v.v.) dùng sai mục đích', 3, 6),
(@q1, 7, N'Ảo giác (LSD, nấm thần, PCP, ketamine, v.v.)', 3, 7),
(@q1, 8, N'Opioids đường phố (heroin, thuốc phiện)', 3, 8),
(@q1, 9, N'Opioids kê đơn (Oxycodone, Vicodin, Fentanyl, Methadone, v.v.) dùng sai mục đích', 3, 9),
(@q1, 10, N'Chất khác để tạo cảm giác ''phê''', 3, 10),
(@q1, 11, N'Tôi chưa từng sử dụng bất kỳ chất nào', 0, 11);

-- 2
INSERT INTO Assessments_question (question, type, note, assessment_type, multiSelect, allowMultiple)
VALUES (N'Trong 3 tháng qua, bạn đã sử dụng [chất] bao nhiêu lần?', N'MCQs', N'Dùng để đo tần suất sử dụng gần đây. [chất] sẽ thay bằng loại chất bạn chọn ở câu hỏi 1.', N'ASSIST', 0, 0);
DECLARE @q2 INT = SCOPE_IDENTITY();
INSERT INTO Answers (assessment_question_id, id, text, score, answer_order) VALUES
(@q2, 1, N'Không bao giờ', 0, 1),
(@q2, 2, N'Một hoặc hai lần', 2, 2),
(@q2, 3, N'Hàng tháng', 3, 3),
(@q2, 4, N'Hàng tuần', 4, 4),
(@q2, 5, N'Gần như hàng ngày hoặc hàng ngày', 6, 5);

-- 3
INSERT INTO Assessments_question (question, type, note, assessment_type, multiSelect, allowMultiple)
VALUES (N'Trong 3 tháng qua, bạn có từng rất muốn sử dụng [chất] không?', N'MCQs', N'''Rất muốn'' tức là cảm giác mạnh mẽ, khó cưỡng lại khi không sử dụng.', N'ASSIST', 0, 0);
DECLARE @q3 INT = SCOPE_IDENTITY();
INSERT INTO Answers (assessment_question_id, id, text, score, answer_order) VALUES
(@q3, 1, N'Không bao giờ', 0, 1),
(@q3, 2, N'Một hoặc hai lần', 3, 2),
(@q3, 3, N'Hàng tháng', 4, 3),
(@q3, 4, N'Hàng tuần', 5, 4),
(@q3, 5, N'Gần như hàng ngày hoặc hàng ngày', 6, 5);

-- 4
INSERT INTO Assessments_question (question, type, note, assessment_type, multiSelect, allowMultiple)
VALUES (N'Trong 3 tháng qua, việc sử dụng [chất] có làm bạn gặp vấn đề về sức khỏe, tài chính, xã hội hoặc pháp lý không?', N'MCQs', N'Ví dụ: đau ốm, mất tiền, bị xa lánh, bị phạt hoặc bắt.', N'ASSIST', 0, 0);
DECLARE @q4 INT = SCOPE_IDENTITY();
INSERT INTO Answers (assessment_question_id, id, text, score, answer_order) VALUES
(@q4, 1, N'Không bao giờ', 0, 1),
(@q4, 2, N'Một hoặc hai lần', 4, 2),
(@q4, 3, N'Hàng tháng', 5, 3),
(@q4, 4, N'Hàng tuần', 6, 4),
(@q4, 5, N'Gần như hàng ngày hoặc hàng ngày', 7, 5);

-- 5
INSERT INTO Assessments_question (question, type, note, assessment_type, multiSelect, allowMultiple)
VALUES (N'Trong 3 tháng qua, bạn có từng bỏ bê trách nhiệm ở nhà, trường học, hoặc nơi làm vì sử dụng [chất] không?', N'MCQs', N'Ví dụ: nghỉ học, đi làm trễ, quên việc do ảnh hưởng của chất.', N'ASSIST', 0, 0);
DECLARE @q5 INT = SCOPE_IDENTITY();
INSERT INTO Answers (assessment_question_id, id, text, score, answer_order) VALUES
(@q5, 1, N'Không bao giờ', 0, 1),
(@q5, 2, N'Một hoặc hai lần', 5, 2),
(@q5, 3, N'Hàng tháng', 6, 3),
(@q5, 4, N'Hàng tuần', 7, 4),
(@q5, 5, N'Gần như hàng ngày hoặc hàng ngày', 8, 5);

-- 6
INSERT INTO Assessments_question (question, type, note, assessment_type, multiSelect, allowMultiple)
VALUES (N'Có ai từng lo lắng hoặc phàn nàn về việc bạn sử dụng [chất] không?', N'MCQs', N'Người khác cảm thấy bạn có vấn đề với chất và thể hiện sự lo ngại.', N'ASSIST', 0, 0);
DECLARE @q6 INT = SCOPE_IDENTITY();
INSERT INTO Answers (assessment_question_id, id, text, score, answer_order) VALUES
(@q6, 1, N'Không bao giờ', 0, 1),
(@q6, 2, N'Có, trong 3 tháng qua', 6, 2),
(@q6, 3, N'Có, nhưng không trong 3 tháng qua', 3, 3);

-- 7
INSERT INTO Assessments_question (question, type, note, assessment_type, multiSelect, allowMultiple)
VALUES (N'Bạn đã từng cố gắng ngừng hoặc giảm sử dụng [chất] nhưng không thành công chưa?', N'MCQs', N'Cố gắng dừng lại nhưng vẫn không kiểm soát được.', N'ASSIST', 0, 0);
DECLARE @q7 INT = SCOPE_IDENTITY();
INSERT INTO Answers (assessment_question_id, id, text, score, answer_order) VALUES
(@q7, 1, N'Không bao giờ', 0, 1),
(@q7, 2, N'Có, trong 3 tháng qua', 6, 2),
(@q7, 3, N'Có, nhưng không trong 3 tháng qua', 3, 3);

-- 8
INSERT INTO Assessments_question (question, type, note, assessment_type, multiSelect, allowMultiple)
VALUES (N'Bạn đã từng tiêm chất nào đó vào cơ thể chưa? (Không tính trường hợp tiêm vì lý do y tế)', N'MCQs', N'Tiêm bằng kim để đưa chất vào máu hoặc cơ.', N'ASSIST', 0, 0);
DECLARE @q8 INT = SCOPE_IDENTITY();
INSERT INTO Answers (assessment_question_id, id, text, score, answer_order) VALUES
(@q8, 1, N'Không bao giờ', 0, 1),
(@q8, 2, N'Có, trong 3 tháng qua', 2, 2),
(@q8, 3, N'Có, nhưng không trong 3 tháng qua', 1, 3);

-- 9
INSERT INTO Assessments_question (question, type, note, assessment_type, multiSelect, allowMultiple)
VALUES (N'Việc sử dụng [chất] của bạn có từng khiến bạn gặp nguy hiểm không? (như lái xe khi say, quan hệ tình dục không an toàn, v.v.)', N'MCQs', N'Hành vi nguy hiểm do ảnh hưởng của chất, đe dọa an toàn bản thân hoặc người khác.', N'ASSIST', 0, 0);
DECLARE @q9 INT = SCOPE_IDENTITY();
INSERT INTO Answers (assessment_question_id, id, text, score, answer_order) VALUES
(@q9, 1, N'Không bao giờ', 0, 1),
(@q9, 2, N'Một hoặc hai lần', 4, 2),
(@q9, 3, N'Hàng tháng', 5, 3),
(@q9, 4, N'Hàng tuần', 6, 4),
(@q9, 5, N'Gần như hàng ngày hoặc hàng ngày', 7, 5);

-- 10
INSERT INTO Assessments_question (question, type, note, assessment_type, multiSelect, allowMultiple)
VALUES (N'Khi bạn ngừng sử dụng [chất], bạn có từng trải qua triệu chứng khó chịu như run tay, mất ngủ, cáu gắt không?', N'MCQs', N'Đây là triệu chứng cai nghiện, xuất hiện khi ngừng dùng chất gây nghiện.', N'ASSIST', 0, 0);
DECLARE @q10 INT = SCOPE_IDENTITY();
INSERT INTO Answers (assessment_question_id, id, text, score, answer_order) VALUES
(@q10, 1, N'Không bao giờ', 0, 1),
(@q10, 2, N'Một hoặc hai lần', 4, 2),
(@q10, 3, N'Thường xuyên', 6, 3);

-- 11
INSERT INTO Assessments_question (question, type, note, assessment_type, multiSelect, allowMultiple)
VALUES (N'Bạn có cần tăng liều [chất] để cảm thấy hiệu quả như trước không?', N'MCQs', N'Càng dùng nhiều mới có tác dụng như cũ gọi là hiện tượng ''dung nạp''.', N'ASSIST', 0, 0);
DECLARE @q11 INT = SCOPE_IDENTITY();
INSERT INTO Answers (assessment_question_id, id, text, score, answer_order) VALUES
(@q11, 1, N'Không bao giờ', 0, 1),
(@q11, 2, N'Một vài lần', 3, 2),
(@q11, 3, N'Thường xuyên', 5, 3);

-- 12
INSERT INTO Assessments_question (question, type, note, assessment_type, multiSelect, allowMultiple)
VALUES (N'Bạn đã từng bỏ qua các hoạt động quan trọng vì sử dụng [chất] chưa? (như học tập, giải trí, gia đình)', N'MCQs', N'Ví dụ: bỏ họp lớp, không ăn cơm gia đình vì bận dùng chất.', N'ASSIST', 0, 0);
DECLARE @q12 INT = SCOPE_IDENTITY();
INSERT INTO Answers (assessment_question_id, id, text, score, answer_order) VALUES
(@q12, 1, N'Không bao giờ', 0, 1),
(@q12, 2, N'Một vài lần', 4, 2),
(@q12, 3, N'Thường xuyên', 6, 3);

-- 13
INSERT INTO Assessments_question (question, type, note, assessment_type, multiSelect, allowMultiple)
VALUES (N'Việc sử dụng [chất] có từng khiến bạn bị mất ngủ, giảm trí nhớ hoặc khó tập trung không?', N'MCQs', N'Ảnh hưởng đến chức năng thần kinh như suy nghĩ, học tập, làm việc.', N'ASSIST', 0, 0);
DECLARE @q13 INT = SCOPE_IDENTITY();
INSERT INTO Answers (assessment_question_id, id, text, score, answer_order) VALUES
(@q13, 1, N'Không bao giờ', 0, 1),
(@q13, 2, N'Thỉnh thoảng', 3, 2),
(@q13, 3, N'Thường xuyên', 5, 3);

-- 14
INSERT INTO Assessments_question (question, type, note, assessment_type, multiSelect, allowMultiple)
VALUES (N'Bạn có từng bị nghỉ học hoặc mất việc do việc sử dụng [chất] không?', N'MCQs', N'Có thể là bị đình chỉ học, sa thải hoặc tự nghỉ.', N'ASSIST', 0, 0);
DECLARE @q14 INT = SCOPE_IDENTITY();
INSERT INTO Answers (assessment_question_id, id, text, score, answer_order) VALUES
(@q14, 1, N'Không bao giờ', 0, 1),
(@q14, 2, N'Một lần', 4, 2),
(@q14, 3, N'Hơn một lần', 6, 3);

-- 15
INSERT INTO Assessments_question (question, type, note, assessment_type, multiSelect, allowMultiple)
VALUES (N'Bạn đã từng bị công an bắt hoặc bị xử phạt vì liên quan đến sử dụng hoặc sở hữu [chất] chưa?', N'MCQs', N'Ví dụ: bị cảnh sát xử lý hành chính, hình sự hoặc bị lập hồ sơ.', N'ASSIST', 0, 0);
DECLARE @q15 INT = SCOPE_IDENTITY();
INSERT INTO Answers (assessment_question_id, id, text, score, answer_order) VALUES
(@q15, 1, N'Không bao giờ', 0, 1),
(@q15, 2, N'Một lần', 5, 2),
(@q15, 3, N'Nhiều lần', 7, 3);

-- CRAFFT Assessment Questions and Answers

-- 16 (Part A - Alcohol)
INSERT INTO Assessments_question (question, type, note, assessment_type, multiSelect, allowMultiple, category, substance)
VALUES (N'Trong 12 tháng qua, bạn đã uống bia, rượu hoặc đồ uống có cồn vào bao nhiêu ngày?', N'MCQs', N'Đồ uống có cồn bao gồm bia, rượu vang, rượu mạnh như vodka, whiskey...', N'CRAFFT', 0, 0, N'partA', N'alcohol');
DECLARE @q16 INT = SCOPE_IDENTITY();
INSERT INTO Answers (assessment_question_id, id, text, score, answer_order) VALUES
(@q16, 1, N'Không (0 ngày)', 0, 1),
(@q16, 2, N'1-2 ngày', 1, 2),
(@q16, 3, N'3-9 ngày', 1, 3),
(@q16, 4, N'10-19 ngày', 1, 4),
(@q16, 5, N'20 ngày trở lên', 1, 5);

-- 17 (Part A - Cannabis)
INSERT INTO Assessments_question (question, type, note, assessment_type, multiSelect, allowMultiple, category, substance)
VALUES (N'Trong 12 tháng qua, bạn đã sử dụng cần sa (marijuana) vào bao nhiêu ngày?', N'MCQs', N'Cần sa còn gọi là marijuana, cỏ, pot...', N'CRAFFT', 0, 0, N'partA', N'cannabis');
DECLARE @q17 INT = SCOPE_IDENTITY();
INSERT INTO Answers (assessment_question_id, id, text, score, answer_order) VALUES
(@q17, 1, N'Không (0 ngày)', 0, 1),
(@q17, 2, N'1-2 ngày', 1, 2),
(@q17, 3, N'3-9 ngày', 1, 3),
(@q17, 4, N'10-19 ngày', 1, 4),
(@q17, 5, N'20 ngày trở lên', 1, 5);

-- 18 (Part A - Other substances)
INSERT INTO Assessments_question (question, type, note, assessment_type, multiSelect, allowMultiple, category, substance)
VALUES (N'Trong 12 tháng qua, bạn đã sử dụng chất gì khác để cảm thấy hưng phấn hoặc thay đổi tâm trạng?', N'MCQs', N'Ví dụ: thuốc kê đơn hoặc thuốc không kê đơn, chất bay hơi, chất bất hợp pháp...', N'CRAFFT', 0, 0, N'partA', N'other');
DECLARE @q18 INT = SCOPE_IDENTITY();
INSERT INTO Answers (assessment_question_id, id, text, score, answer_order) VALUES
(@q18, 1, N'Không (0 ngày)', 0, 1),
(@q18, 2, N'1-2 ngày', 1, 2),
(@q18, 3, N'3-9 ngày', 1, 3),
(@q18, 4, N'10-19 ngày', 1, 4),
(@q18, 5, N'20 ngày trở lên', 1, 5);

-- 19 (Part B - C - Car)
INSERT INTO Assessments_question (question, type, note, assessment_type, multiSelect, allowMultiple, category, letter)
VALUES (N'[C] Bạn có từng ngồi trên XE do người đã uống rượu hoặc sử dụng chất gây nghiện lái xe không?', N'MCQs', N'Câu hỏi về an toàn này được hỏi cho tất cả mọi người', N'CRAFFT', 0, 0, N'partB', N'C');
DECLARE @q19 INT = SCOPE_IDENTITY();
INSERT INTO Answers (assessment_question_id, id, text, score, answer_order) VALUES
(@q19, 1, N'Có', 1, 1),
(@q19, 2, N'Không', 0, 2);

-- 20 (Part B - R - Relax)
INSERT INTO Assessments_question (question, type, note, assessment_type, multiSelect, allowMultiple, category, letter)
VALUES (N'[R] Bạn có từng sử dụng rượu hoặc chất gây nghiện để THƯ GIÃN, cảm thấy tốt hơn về bản thân, hoặc để hòa nhập không?', N'MCQs', N'Câu hỏi về động cơ sử dụng', N'CRAFFT', 0, 0, N'partB', N'R');
DECLARE @q20 INT = SCOPE_IDENTITY();
INSERT INTO Answers (assessment_question_id, id, text, score, answer_order) VALUES
(@q20, 1, N'Có', 1, 1),
(@q20, 2, N'Không', 0, 2);

-- 21 (Part B - A - Alone)
INSERT INTO Assessments_question (question, type, note, assessment_type, multiSelect, allowMultiple, category, letter)
VALUES (N'[A] Bạn có từng sử dụng rượu hoặc chất gây nghiện khi chỉ có MỘT MÌNH không?', N'MCQs', N'Sử dụng một mình có thể là dấu hiệu nguy hiểm', N'CRAFFT', 0, 0, N'partB', N'A');
DECLARE @q21 INT = SCOPE_IDENTITY();
INSERT INTO Answers (assessment_question_id, id, text, score, answer_order) VALUES
(@q21, 1, N'Có', 1, 1),
(@q21, 2, N'Không', 0, 2);

-- 22 (Part B - F1 - Forget)
INSERT INTO Assessments_question (question, type, note, assessment_type, multiSelect, allowMultiple, category, letter)
VALUES (N'[F] Bạn có từng QUÊN những gì mình đã làm khi đang sử dụng rượu hoặc chất gây nghiện không?', N'MCQs', N'Mất trí nhớ tạm thời là dấu hiệu nghiêm trọng', N'CRAFFT', 0, 0, N'partB', N'F1');
DECLARE @q22 INT = SCOPE_IDENTITY();
INSERT INTO Answers (assessment_question_id, id, text, score, answer_order) VALUES
(@q22, 1, N'Có', 1, 1),
(@q22, 2, N'Không', 0, 2);

-- 23 (Part B - F2 - Family/Friends)
INSERT INTO Assessments_question (question, type, note, assessment_type, multiSelect, allowMultiple, category, letter)
VALUES (N'[F] GIA ĐÌNH hoặc BẠN BÈ của bạn có từng nói rằng bạn nên cắt giảm việc uống rượu hoặc sử dụng chất gây nghiện không?', N'MCQs', N'Quan điểm của người thân là dấu hiệu cảnh báo quan trọng', N'CRAFFT', 0, 0, N'partB', N'F2');
DECLARE @q23 INT = SCOPE_IDENTITY();
INSERT INTO Answers (assessment_question_id, id, text, score, answer_order) VALUES
(@q23, 1, N'Có', 1, 1),
(@q23, 2, N'Không', 0, 2);

-- 24 (Part B - T - Trouble)
INSERT INTO Assessments_question (question, type, note, assessment_type, multiSelect, allowMultiple, category, letter)
VALUES (N'[T] Bạn có từng gặp RẮC RỐI khi đang sử dụng rượu hoặc chất gây nghiện không?', N'MCQs', N'Rắc rối có thể là vấn đề pháp lý, học tập, gia đình, hoặc sức khỏe', N'CRAFFT', 0, 0, N'partB', N'T');
DECLARE @q24 INT = SCOPE_IDENTITY();
INSERT INTO Answers (assessment_question_id, id, text, score, answer_order) VALUES
(@q24, 1, N'Có', 1, 1),
(@q24, 2, N'Không', 0, 2);

