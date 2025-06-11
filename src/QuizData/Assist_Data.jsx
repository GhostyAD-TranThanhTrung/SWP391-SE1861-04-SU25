export const Assist_Data = {
    questions: [
        {
            id: 1,
            question: "Trong suốt cuộc đời bạn, bạn đã từng sử dụng các chất sau đây không?",
            options: [
                { id: 1, text: "Cần sa (marijuana, pot, cỏ, hash, v.v.)" },
                { id: 2, text: "Cocaine (coke, crack, v.v.)" },
                { id: 3, text: "Thuốc kích thích kê đơn (Adderall, Ritalin, thuốc ăn kiêng, v.v.) dùng sai mục đích" },
                { id: 4, text: "Methamphetamine (meth, đá, ecstasy, molly, v.v.)" },
                { id: 5, text: "Chất hít (keo, sơn, khí cười, poppers, v.v.)" },
                { id: 6, text: "Thuốc an thần (Xanax, Valium, thuốc ngủ, benzodiazepine v.v.) dùng sai mục đích" },
                { id: 7, text: "Ảo giác (LSD, nấm thần, PCP, ketamine, v.v.)" },
                { id: 8, text: "Opioids đường phố (heroin, thuốc phiện)" },
                { id: 9, text: "Opioids kê đơn (Oxycodone, Vicodin, Fentanyl, Methadone, v.v.) dùng sai mục đích" },
                { id: 10, text: "Chất khác để tạo cảm giác 'phê' (Ghi rõ sau)" },
            ],
            type: "MCQs",
            correctAnswer: "Tùy câu trả lời",
        },
        {
            id: 2,
            question: "Trong 3 tháng qua, bạn đã sử dụng [chất] bao nhiêu lần?",
            options: [
                { id: 1, text: "Không bao giờ", score: 0 },
                { id: 2, text: "Một hoặc hai lần", score: 2 },
                { id: 3, text: "Hàng tháng", score: 3 },
                { id: 4, text: "Hàng tuần", score: 4 },
                { id: 5, text: "Gần như hàng ngày hoặc hàng ngày", score: 6 },
            ],
            type: "MCQs",
            correctAnswer: "Tùy câu trả lời",
        },
        {
            id: 3,
            question: "Trong 3 tháng qua, bạn có cảm thấy thèm muốn mạnh mẽ sử dụng [chất] không?",
            options: [
                { id: 1, text: "Không bao giờ", score: 0 },
                { id: 2, text: "Một hoặc hai lần", score: 3 },
                { id: 3, text: "Hàng tháng", score: 4 },
                { id: 4, text: "Hàng tuần", score: 5 },
                { id: 5, text: "Gần như hàng ngày hoặc hàng ngày", score: 6 },
            ],
            type: "MCQs",
            correctAnswer: "Tùy câu trả lời",
        },
        {
            id: 4,
            question: "Trong 3 tháng qua, việc sử dụng [chất] đã từng gây ra vấn đề về sức khỏe, xã hội, pháp lý hoặc tài chính không?",
            options: [
                { id: 1, text: "Không bao giờ", score: 0 },
                { id: 2, text: "Một hoặc hai lần", score: 4 },
                { id: 3, text: "Hàng tháng", score: 5 },
                { id: 4, text: "Hàng tuần", score: 6 },
                { id: 5, text: "Gần như hàng ngày hoặc hàng ngày", score: 7 },
            ],
            type: "MCQs",
            correctAnswer: "Tùy câu trả lời",
        },
        {
            id: 5,
            question: "Trong 3 tháng qua, bạn đã từng không hoàn thành trách nhiệm do sử dụng [chất] chưa?",
            options: [
                { id: 1, text: "Không bao giờ", score: 0 },
                { id: 2, text: "Một hoặc hai lần", score: 5 },
                { id: 3, text: "Hàng tháng", score: 6 },
                { id: 4, text: "Hàng tuần", score: 7 },
                { id: 5, text: "Gần như hàng ngày hoặc hàng ngày", score: 8 },
            ],
            type: "MCQs",
            correctAnswer: "Tùy câu trả lời",
        },
        {
            id: 6,
            question: "Đã có ai lo ngại về việc bạn sử dụng [chất] chưa?",
            options: [
                { id: 1, text: "Không bao giờ", score: 0 },
                { id: 2, text: "Có, trong 3 tháng qua", score: 6 },
                { id: 3, text: "Có, nhưng không trong 3 tháng qua", score: 3 },
            ],
            type: "MCQs",
            correctAnswer: "Tùy câu trả lời",
        },
        {
            id: 7,
            question: "Bạn đã từng cố gắng cắt giảm hoặc ngừng sử dụng [chất] nhưng thất bại chưa?",
            options: [
                { id: 1, text: "Không bao giờ", score: 0 },
                { id: 2, text: "Có, trong 3 tháng qua", score: 6 },
                { id: 3, text: "Có, nhưng không trong 3 tháng qua", score: 3 },
            ],
            type: "MCQs",
            correctAnswer: "Tùy câu trả lời",
        },
        {
            id: 8,
            question: "Bạn đã từng tiêm bất kỳ chất nào vào cơ thể chưa? (Không tính mục đích y tế)",
            options: [
                { id: 1, text: "Không bao giờ", score: 0 },
                { id: 2, text: "Có, trong 3 tháng qua", score: 2 },
                { id: 3, text: "Có, nhưng không trong 3 tháng qua", score: 1 },
            ],
            type: "MCQs",
            correctAnswer: "Tùy câu trả lời",
        },
        {
            id: 9,
            question: "Việc sử dụng [chất] của bạn có bao giờ khiến bạn gặp nguy hiểm (ví dụ: lái xe, vận hành máy móc, quan hệ tình dục không an toàn) không?",
            options: [
                { id: 1, text: "Không bao giờ", score: 0 },
                { id: 2, text: "Một hoặc hai lần", score: 4 },
                { id: 3, text: "Hàng tháng", score: 5 },
                { id: 4, text: "Hàng tuần", score: 6 },
                { id: 5, text: "Gần như hàng ngày hoặc hàng ngày", score: 7 },
            ],
            type: "MCQs",
            correctAnswer: "Tùy câu trả lời",
        },
        {
            id: 10,
            question: "Bạn có từng trải qua các triệu chứng cai nghiện khi ngừng sử dụng [chất] không?",
            options: [
                { id: 1, text: "Không bao giờ", score: 0 },
                { id: 2, text: "Một hoặc hai lần", score: 4 },
                { id: 3, text: "Thường xuyên", score: 6 },
            ],
            type: "MCQs",
            correctAnswer: "Tùy câu trả lời",
        },
        {
            id: 11,
            question: "Bạn có từng phải tăng liều lượng [chất] để đạt được hiệu quả tương tự không?",
            options: [
                { id: 1, text: "Không bao giờ", score: 0 },
                { id: 2, text: "Một vài lần", score: 3 },
                { id: 3, text: "Thường xuyên", score: 5 },
            ],
            type: "MCQs",
            correctAnswer: "Tùy câu trả lời",
        },
        {
            id: 12,
            question: "Bạn có từng bỏ qua các hoạt động quan trọng (gia đình, học tập, giải trí) vì sử dụng [chất] không?",
            options: [
                { id: 1, text: "Không bao giờ", score: 0 },
                { id: 2, text: "Một vài lần", score: 4 },
                { id: 3, text: "Thường xuyên", score: 6 },
            ],
            type: "MCQs",
            correctAnswer: "Tùy câu trả lời",
        },
        {
            id: 13,
            question: "Bạn có từng gặp vấn đề về trí nhớ, khả năng tập trung hay giấc ngủ do sử dụng [chất] không?",
            options: [
                { id: 1, text: "Không bao giờ", score: 0 },
                { id: 2, text: "Thỉnh thoảng", score: 3 },
                { id: 3, text: "Thường xuyên", score: 5 },
            ],
            type: "MCQs",
            correctAnswer: "Tùy câu trả lời",
        },
        {
            id: 14,
            question: "Việc sử dụng [chất] có từng khiến bạn bị buộc phải nghỉ học hoặc nghỉ việc không?",
            options: [
                { id: 1, text: "Không bao giờ", score: 0 },
                { id: 2, text: "Một lần", score: 4 },
                { id: 3, text: "Hơn một lần", score: 6 },
            ],
            type: "MCQs",
            correctAnswer: "Tùy câu trả lời",
        },
        {
            id: 15,
            question: "Bạn có từng bị bắt hoặc bị xử lý pháp lý do liên quan đến việc sử dụng hoặc sở hữu [chất] không?",
            options: [
                { id: 1, text: "Không bao giờ", score: 0 },
                { id: 2, text: "Một lần", score: 5 },
                { id: 3, text: "Nhiều lần", score: 7 },
            ],
            type: "MCQs",
            correctAnswer: "Tùy câu trả lời",
        }
    ],
};

export const resultInitalState = {
    score: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    riskLevel: "Chưa xác định",
};

export const assessRiskLevel = (score, isCannabis = false) => {
    if (isCannabis) {
        if (score <= 4) return "Thấp";
        if (score <= 26) return "Trung bình";
        return "Cao";
    } else {
        if (score <= 3) return "Thấp";
        if (score <= 26) return "Trung bình";
        return "Cao";
    }
};


