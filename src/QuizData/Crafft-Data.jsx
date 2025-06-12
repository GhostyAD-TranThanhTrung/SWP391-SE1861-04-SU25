export const Crafft_Data = {
    questions: [
        // --- CRAFFT Part A (frequency) ---
        {
            id: 1,
            question: "Trong 12 tháng qua, bạn đã uống hơn vài ngụm bia, rượu vang hoặc đồ uống có cồn trong bao nhiêu ngày?",
            options: [
                { id: 1, text: "0 ngày", score: 0 },
                { id: 2, text: "1–2 ngày", score: 1 },
                { id: 3, text: "3–9 ngày", score: 2 },
                { id: 4, text: "10+ ngày", score: 3 },
            ],
            type: "MCQs",
            correctAnswer: "Tùy câu trả lời",
        },
        {
            id: 2,
            question: "Trong 12 tháng qua, bạn đã sử dụng cần sa hoặc cần sa tổng hợp bao nhiêu ngày?",
            options: [
                { id: 1, text: "0 ngày", score: 0 },
                { id: 2, text: "1–2 ngày", score: 1 },
                { id: 3, text: "3–9 ngày", score: 2 },
                { id: 4, text: "10+ ngày", score: 3 },
            ],
            type: "MCQs",
            correctAnswer: "Tùy câu trả lời",
        },
        {
            id: 3,
            question: "Trong 12 tháng qua, bạn đã sử dụng chất nào sau đây để cảm thấy 'phê' hoặc thay đổi cảm xúc?",
            options: [
                { id: 1, text: "Không sử dụng", score: 0 },
                { id: 2, text: "Thuốc kê đơn/thuốc không kê đơn", score: 1 },
                { id: 3, text: "Ma túy bất hợp pháp (hít, tiêm...)", score: 1 },
                { id: 4, text: "Chất khác (sơn, keo, chất lạ...)", score: 1 },
            ],
            type: "MCQs",
            correctAnswer: "Tùy câu trả lời",
        },

        {
            id: 4,
            question: "Bạn đã từng ngồi trên xe (ô tô, xe máy...) khi người lái đang chịu ảnh hưởng của chất nào dưới đây?",
            options: [
                { id: 1, text: "Không bao giờ", score: 0 },
                { id: 2, text: "Đã từng – người lái đã uống rượu", score: 1 },
                { id: 3, text: "Đã từng – người lái đã sử dụng cần sa hoặc ma túy", score: 1 },
                { id: 4, text: "Đã từng – cả rượu và ma túy", score: 1 },
            ],
            type: "MCQs",
            correctAnswer: "Tùy câu trả lời",
        },

        {
            id: 5,
            question: "Bạn thường sử dụng rượu hoặc ma túy trong hoàn cảnh nào?",
            options: [
                { id: 1, text: "Không bao giờ sử dụng", score: 0 },
                { id: 2, text: "Khi cảm thấy căng thẳng, lo âu", score: 1 },
                { id: 3, text: "Khi đi chơi hoặc tụ tập với bạn bè", score: 1 },
                { id: 4, text: "Cả hai tình huống trên", score: 1 },
            ],
            type: "MCQs",
            correctAnswer: "Tùy câu trả lời",
        },
        {
            id: 6,
            question: "Bạn đã từng sử dụng rượu hoặc ma túy khi chỉ có một mình chưa?",
            options: [
                { id: 1, text: "Có", score: 1 },
                { id: 2, text: "Không", score: 0 },
            ],
            type: "MCQs",
            correctAnswer: "Tùy câu trả lời",
        },
        {
            id: 7,
            question: "Bạn có bao giờ quên những gì đã xảy ra sau khi sử dụng rượu hoặc ma túy?",
            options: [
                { id: 1, text: "Chưa từng xảy ra", score: 0 },
                { id: 2, text: "Chỉ một lần", score: 1 },
                { id: 3, text: "Vài lần", score: 1 },
                { id: 4, text: "Nhiều lần", score: 1 },
            ],
            type: "MCQs",
            correctAnswer: "Tùy câu trả lời",
        },
        {
            id: 8,
            question: "Bạn bè hoặc gia đình từng lo lắng về việc bạn sử dụng rượu hoặc ma túy chưa?",
            options: [
                { id: 1, text: "Có", score: 1 },
                { id: 2, text: "Không", score: 0 },
            ],
            type: "MCQs",
            correctAnswer: "Tùy câu trả lời",
        },
        {
            id: 9,
            question: "Bạn đã từng gặp rắc rối do sử dụng rượu hoặc ma túy chưa?",
            options: [
                { id: 1, text: "Có", score: 1 },
                { id: 2, text: "Không", score: 0 },
            ],
            type: "MCQs",
            correctAnswer: "Tùy câu trả lời",
        },

        // --- Phần mở rộng từ DSM-5 ---
        {
            id: 10,
            question: "Bạn có từng cảm thấy cần tăng liều hoặc sử dụng nhiều hơn để đạt hiệu quả?",
            options: [
                { id: 1, text: "Có", score: 1 },
                { id: 2, text: "Không", score: 0 },
            ],
            type: "MCQs",
            correctAnswer: "Tùy câu trả lời",
        },
        {
            id: 11,
            question: "Bạn có từng cố gắng giảm hoặc dừng sử dụng nhưng không thành công?",
            options: [
                { id: 1, text: "Có", score: 1 },
                { id: 2, text: "Không", score: 0 },
            ],
            type: "MCQs",
            correctAnswer: "Tùy câu trả lời",
        },
        {
            id: 12,
            question: "Bạn có từng dành nhiều thời gian để sử dụng, hoặc hồi phục sau khi sử dụng chất?",
            options: [
                { id: 1, text: "Có", score: 1 },
                { id: 2, text: "Không", score: 0 },
            ],
            type: "MCQs",
            correctAnswer: "Tùy câu trả lời",
        },
        {
            id: 13,
            question: "Việc sử dụng rượu hoặc ma túy ảnh hưởng đến cuộc sống của bạn như thế nào?",
            options: [
                { id: 1, text: "Không ảnh hưởng", score: 0 },
                { id: 2, text: "Ảnh hưởng đến học tập", score: 1 },
                { id: 3, text: "Ảnh hưởng đến các mối quan hệ", score: 1 },
                { id: 4, text: "Ảnh hưởng đến cả học tập và quan hệ", score: 1 },
            ],
            type: "MCQs",
            correctAnswer: "Tùy câu trả lời",
        },
        {
            id: 14,
            question: "Bạn có tiếp tục sử dụng ngay cả khi biết nó đang gây hại cho bản thân không?",
            options: [
                { id: 1, text: "Có", score: 1 },
                { id: 2, text: "Không", score: 0 },
            ],
            type: "MCQs",
            correctAnswer: "Tùy câu trả lời",
        },
        {
            id: 15,
            question: "Bạn đã từng sử dụng trong tình huống nguy hiểm (như khi lái xe, đi học, hoặc đi làm)?",
            options: [
                { id: 1, text: "Có", score: 1 },
                { id: 2, text: "Không", score: 0 },
            ],
            type: "MCQs",
            correctAnswer: "Tùy câu trả lời",
        },
    ]
}

export const resultInitalState = {
    score: 0,
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


