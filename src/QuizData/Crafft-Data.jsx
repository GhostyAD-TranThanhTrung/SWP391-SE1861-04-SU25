export const Crafft_Data = {
    questions: [
        // --- Phần A ---
        {
            id: 1,
            question: "Trong 12 tháng qua, bạn đã uống bia, rượu hoặc đồ uống có cồn vào bao nhiêu ngày?",
            note: "Đồ uống có cồn bao gồm bia, rượu vang, rượu mạnh như vodka, whiskey...",
            options: [
                { id: 1, text: "Có", score: 1 },
                { id: 2, text: "Không", score: 0 },
            ],
            type: "MCQs",
        },
        {
            id: 2,
            question: "Trong 12 tháng qua, bạn đã sử dụng cần sa (hoặc cần sa tổng hợp) vào bao nhiêu ngày?",
            note: "Cần sa còn gọi là marijuana, cỏ, pot, cần... Cần sa tổng hợp là các loại chất tương tự được điều chế từ hóa chất.",
            options: [
                { id: 1, text: "Có", score: 1 },
                { id: 2, text: "Không", score: 0 },
            ],
            type: "MCQs",
        },
        {
            id: 3,
            question: "Trong 12 tháng qua, bạn đã sử dụng chất nào để cảm thấy vui vẻ, hưng phấn hoặc thay đổi tâm trạng?",
            note: "Ví dụ: thuốc ngủ, thuốc giảm đau mạnh, keo, sơn, thuốc lắc, ma túy đá, heroin...",
            options: [
                { id: 1, text: "Có", score: 1 },
                { id: 2, text: "Không", score: 0 },
            ],
            type: "MCQs",
        },

        // --- Phần B ---
        {
            id: 4,
            question: "Bạn có từng ngồi trên xe (ô tô, xe máy...) mà người lái xe đã sử dụng rượu hoặc ma túy không?",
            note: "Bao gồm mọi phương tiện như xe máy, ô tô, xe đạp điện...",
            options: [
                { id: 1, text: "Không bao giờ", score: 0 },
                { id: 2, text: "Đã từng – người lái uống rượu", score: 1 },
                { id: 3, text: "Đã từng – người lái dùng cần sa hoặc ma túy", score: 2 },
                { id: 4, text: "Đã từng – cả rượu và ma túy", score: 3 },
            ],
            type: "MCQs",
        },
        {
            id: 5,
            question: "Bạn thường sử dụng rượu hoặc ma túy trong hoàn cảnh nào?",
            note: "Ví dụ: lúc buồn bã, căng thẳng, hoặc khi đi tiệc, đi chơi với bạn bè.",
            options: [
                { id: 1, text: "Không sử dụng", score: 0 },
                { id: 2, text: "Khi cảm thấy căng thẳng hoặc lo lắng", score: 2 },
                { id: 3, text: "Khi đi chơi hoặc tụ tập bạn bè", score: 1 },
                { id: 4, text: "Cả hai trường hợp trên", score: 3 },
            ],
            type: "MCQs",
        },
        {
            id: 6,
            question: "Bạn đã từng sử dụng rượu hoặc ma túy khi chỉ có một mình chưa?",
            note: "Việc sử dụng một mình có thể là dấu hiệu của lạm dụng hoặc phụ thuộc.",
            options: [
                { id: 1, text: "Có", score: 2 },
                { id: 2, text: "Không", score: 0 },
            ],
            type: "MCQs",
        },
        {
            id: 7,
            question: "Bạn có bao giờ quên những gì đã xảy ra sau khi sử dụng rượu hoặc ma túy?",
            note: "Ví dụ: mất trí nhớ tạm thời sau khi uống quá nhiều.",
            options: [
                { id: 1, text: "Chưa bao giờ", score: 0 },
                { id: 2, text: "1 lần", score: 1 },
                { id: 3, text: "Vài lần", score: 2 },
                { id: 4, text: "Nhiều lần", score: 3 },
            ],
            type: "MCQs",
        },
        {
            id: 8,
            question: "Gia đình hoặc bạn bè có từng lo lắng về việc bạn sử dụng rượu hoặc ma túy không?",
            note: "Dấu hiệu người thân quan tâm là tín hiệu cảnh báo.",
            options: [
                { id: 1, text: "Có", score: 2 },
                { id: 2, text: "Không", score: 0 },
            ],
            type: "MCQs",
        },
        {
            id: 9,
            question: "Bạn đã từng gặp rắc rối vì sử dụng rượu hoặc ma túy chưa?",
            note: "Rắc rối có thể là vấn đề học hành, pháp luật, gia đình, sức khỏe...",
            options: [
                { id: 1, text: "Có", score: 3 },
                { id: 2, text: "Không", score: 0 },
            ],
            type: "MCQs",
        },

        // --- DSM-5 Bổ sung ---
        {
            id: 10,
            question: "Bạn có từng cảm thấy cần dùng liều cao hơn để có cảm giác như trước không?",
            note: "Đây là dấu hiệu 'dung nạp' – cơ thể cần liều cao hơn để đạt hiệu quả.",
            options: [
                { id: 1, text: "Có", score: 2 },
                { id: 2, text: "Không", score: 0 },
            ],
            type: "MCQs",
        },
        {
            id: 11,
            question: "Bạn đã từng cố gắng dừng hoặc giảm sử dụng nhưng không thành công chưa?",
            note: "Nếu nhiều lần không thể bỏ, đó là dấu hiệu nghiện.",
            options: [
                { id: 1, text: "Có", score: 2 },
                { id: 2, text: "Không", score: 0 },
            ],
            type: "MCQs",
        },
        {
            id: 12,
            question: "Bạn có thường dành nhiều thời gian để sử dụng hoặc phục hồi sau khi sử dụng chất không?",
            note: "Ví dụ: mất cả ngày sau khi uống rượu hoặc bị mệt mỏi kéo dài.",
            options: [
                { id: 1, text: "Có", score: 2 },
                { id: 2, text: "Không", score: 0 },
            ],
            type: "MCQs",
        },
        {
            id: 13,
            question: "Việc sử dụng rượu hoặc ma túy đã ảnh hưởng thế nào đến cuộc sống của bạn?",
            note: "Gợi ý: học tập giảm sút, xung đột gia đình, xa lánh bạn bè...",
            options: [
                { id: 1, text: "Không ảnh hưởng", score: 0 },
                { id: 2, text: "Ảnh hưởng đến học tập", score: 1 },
                { id: 3, text: "Ảnh hưởng đến mối quan hệ", score: 1 },
                { id: 4, text: "Ảnh hưởng cả học tập và mối quan hệ", score: 2 },
            ],
            type: "MCQs",
        },
        {
            id: 14,
            question: "Bạn có tiếp tục sử dụng ngay cả khi biết rằng nó đang gây hại cho bản thân không?",
            note: "Đây là dấu hiệu của mất kiểm soát hoặc phụ thuộc.",
            options: [
                { id: 1, text: "Có", score: 2 },
                { id: 2, text: "Không", score: 0 },
            ],
            type: "MCQs",
        },
        {
            id: 15,
            question: "Bạn đã từng sử dụng trong tình huống nguy hiểm như khi đang lái xe, đi học, hoặc làm việc chưa?",
            note: "Sử dụng trong hoàn cảnh nguy hiểm tăng nguy cơ tai nạn, mất kiểm soát.",
            options: [
                { id: 1, text: "Có", score: 2 },
                { id: 2, text: "Không", score: 0 },
            ],
            type: "MCQs",
        },
    ]
};

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


