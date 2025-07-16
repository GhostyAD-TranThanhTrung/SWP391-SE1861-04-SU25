export const Crafft_Data = {
    questions: [
        // Part A: Substance Use Screening Questions (1-3)
        {
            id: 1,
            question: "Trong 12 tháng qua, bạn đã uống bia, rượu hoặc đồ uống có cồn vào bao nhiêu ngày?",
            note: "Đồ uống có cồn bao gồm bia, rượu vang, rượu mạnh như vodka, whiskey...",
            options: [
                { id: 1, text: "Không (0 ngày)", score: 0 },
                { id: 2, text: "1-2 ngày", score: 1 },
                { id: 3, text: "3-9 ngày", score: 1 },
                { id: 4, text: "10-19 ngày", score: 1 },
                { id: 5, text: "20 ngày trở lên", score: 1 },
            ],
            type: "MCQs",
            category: "partA",
            substance: "alcohol"
        },
        {
            id: 2,
            question: "Trong 12 tháng qua, bạn đã sử dụng cần sa (marijuana) vào bao nhiêu ngày?",
            note: "Cần sa còn gọi là marijuana, cỏ, pot...",
            options: [
                { id: 1, text: "Không (0 ngày)", score: 0 },
                { id: 2, text: "1-2 ngày", score: 1 },
                { id: 3, text: "3-9 ngày", score: 1 },
                { id: 4, text: "10-19 ngày", score: 1 },
                { id: 5, text: "20 ngày trở lên", score: 1 },
            ],
            type: "MCQs",
            category: "partA",
            substance: "cannabis"
        },
        {
            id: 3,
            question: "Trong 12 tháng qua, bạn đã sử dụng chất gì khác để cảm thấy hưng phấn hoặc thay đổi tâm trạng?",
            note: "Ví dụ: thuốc kê đơn hoặc thuốc không kê đơn, chất bay hơi, chất bất hợp pháp...",
            options: [
                { id: 1, text: "Không (0 ngày)", score: 0 },
                { id: 2, text: "1-2 ngày", score: 1 },
                { id: 3, text: "3-9 ngày", score: 1 },
                { id: 4, text: "10-19 ngày", score: 1 },
                { id: 5, text: "20 ngày trở lên", score: 1 },
            ],
            type: "MCQs",
            category: "partA",
            substance: "other"
        },
        // Part B: CRAFFT Questions (4-9) - each "Yes" = 1 point
        {
            id: 4,
            question: "[C] Bạn có từng ngồi trên XE do người đã uống rượu hoặc sử dụng chất gây nghiện lái xe không?",
            note: "Câu hỏi về an toàn này được hỏi cho tất cả mọi người",
            options: [
                { id: 1, text: "Có", score: 1 },
                { id: 2, text: "Không", score: 0 },
            ],
            type: "MCQs",
            category: "partB",
            letter: "C"
        },
        {
            id: 5,
            question: "[R] Bạn có từng sử dụng rượu hoặc chất gây nghiện để THƯ GIÃN, cảm thấy tốt hơn về bản thân, hoặc để hòa nhập không?",
            note: "Câu hỏi về động cơ sử dụng",
            options: [
                { id: 1, text: "Có", score: 1 },
                { id: 2, text: "Không", score: 0 },
            ],
            type: "MCQs",
            category: "partB",
            letter: "R"
        },
        {
            id: 6,
            question: "[A] Bạn có từng sử dụng rượu hoặc chất gây nghiện khi chỉ có MỘT MÌNH không?",
            note: "Sử dụng một mình có thể là dấu hiệu nguy hiểm",
            options: [
                { id: 1, text: "Có", score: 1 },
                { id: 2, text: "Không", score: 0 },
            ],
            type: "MCQs",
            category: "partB",
            letter: "A"
        },
        {
            id: 7,
            question: "[F] Bạn có từng QUÊN những gì mình đã làm khi đang sử dụng rượu hoặc chất gây nghiện không?",
            note: "Mất trí nhớ tạm thời là dấu hiệu nghiêm trọng",
            options: [
                { id: 1, text: "Có", score: 1 },
                { id: 2, text: "Không", score: 0 },
            ],
            type: "MCQs",
            category: "partB",
            letter: "F1"
        },
        {
            id: 8,
            question: "[F] GIA ĐÌNH hoặc BẠN BÈ của bạn có từng nói rằng bạn nên cắt giảm việc uống rượu hoặc sử dụng chất gây nghiện không?",
            note: "Quan điểm của người thân là dấu hiệu cảnh báo quan trọng",
            options: [
                { id: 1, text: "Có", score: 1 },
                { id: 2, text: "Không", score: 0 },
            ],
            type: "MCQs",
            category: "partB",
            letter: "F2"
        },
        {
            id: 9,
            question: "[T] Bạn có từng gặp RẮC RỐI khi đang sử dụng rượu hoặc chất gây nghiện không?",
            note: "Rắc rối có thể là vấn đề pháp lý, học tập, gia đình, hoặc sức khỏe",
            options: [
                { id: 1, text: "Có", score: 1 },
                { id: 2, text: "Không", score: 0 },
            ],
            type: "MCQs",
            category: "partB",
            letter: "T"
        }
    ]
};

export const resultInitalState = {
    score: 0,
    riskLevel: "Chưa xác định",
};

// CRAFFT 2.1 Risk Assessment Function - Compatible with ExamPage flow
export const assessRiskLevel = (totalScore, userAnswers = {}) => {
    // totalScore now only contains Part B score (0-6) since Part A doesn't contribute
    const partBScore = totalScore;

    // Determine if there's any substance use from Part A answers (questions 1-3)
    const hasSubstanceUse = Object.entries(userAnswers).some(([questionIndex, answer]) => {
        const questionNum = parseInt(questionIndex) + 1;
        return questionNum <= 3 && answer?.score > 0;
    });

    // Check CAR question specifically (question 4, which is index 3 in userAnswers)
    const hasCarRisk = userAnswers[3]?.score === 1 || false;

    // Apply CRAFFT 2.1 risk assessment logic
    if (!hasSubstanceUse && partBScore === 0) {
        // LOW RISK: No use in past 12 months AND CRAFFT score = 0
        return "Thấp";
    } else if ((!hasSubstanceUse && hasCarRisk) || (hasSubstanceUse && partBScore < 2)) {
        // MEDIUM RISK: No use + CAR risk OR Any use + CRAFFT < 2
        return "Trung bình";
    } else if (hasSubstanceUse && partBScore >= 2) {
        // HIGH RISK: Any use + CRAFFT >= 2
        return "Cao";
    } else {
        return "Trung bình";
    }
};

// Advanced CRAFFT calculation for detailed results (optional, for future use)
export const calculateCrafftResults = (userAnswers) => {
    if (!userAnswers || Object.keys(userAnswers).length === 0) {
        return {
            partBScore: 0,
            hasSubstanceUse: false,
            hasCarRisk: false,
            riskLevel: "Chưa xác định",
            clinicalAction: "Chưa có dữ liệu đánh giá"
        };
    }

    // Extract Part A answers (questions 1-3) 
    const hasSubstanceUse = Object.entries(userAnswers).some(([questionIndex, answer]) => {
        const questionNum = parseInt(questionIndex) + 1;
        return questionNum <= 3 && answer?.score > 0;
    });

    // Calculate Part B score (questions 4-9) 
    const partBScore = Object.entries(userAnswers).reduce((total, [questionIndex, answer]) => {
        const questionNum = parseInt(questionIndex) + 1;
        return questionNum >= 4 && questionNum <= 9 ? total + (answer?.score || 0) : total;
    }, 0);

    // Check CAR question specifically (question 4)
    const hasCarRisk = userAnswers[3]?.score === 1 || false;

    // Determine risk level according to CRAFFT 2.1 guidelines
    let riskLevel;
    let clinicalAction;

    if (!hasSubstanceUse && partBScore === 0) {
        riskLevel = "Thấp";
        clinicalAction = "Cung cấp thông tin về rủi ro của việc sử dụng chất và lái xe/đi xe với người đã sử dụng chất; khen ngợi và khuyến khích";
    } else if ((!hasSubstanceUse && hasCarRisk) || (hasSubstanceUse && partBScore < 2)) {
        riskLevel = "Trung bình";
        clinicalAction = "Cung cấp thông tin về rủi ro; tư vấn ngắn; có thể cần tái khám";
    } else if (hasSubstanceUse && partBScore >= 2) {
        riskLevel = "Cao";
        clinicalAction = "Cung cấp thông tin về rủi ro; tư vấn ngắn; tái khám; có thể cần chuyển tuyến tư vấn/điều trị";
    } else {
        riskLevel = "Chưa xác định";
        clinicalAction = "Cần đánh giá thêm";
    }

    return {
        partBScore,
        hasSubstanceUse,
        hasCarRisk,
        riskLevel,
        clinicalAction,
        details: {
            substanceUseStatus: hasSubstanceUse ? "Có sử dụng chất trong 12 tháng qua" : "Không sử dụng chất trong 12 tháng qua",
            crafftScore: `${partBScore}/6`,
            interpretation: getScoreInterpretation(partBScore),
        }
    };
};

// Get interpretation based on CRAFFT score
const getScoreInterpretation = (score) => {
    const interpretations = {
        0: "Không có dấu hiệu rối loạn sử dụng chất",
        1: "Rủi ro thấp, cần theo dõi",
        2: "Rủi ro trung bình, cần tư vấn",
        3: "Rủi ro cao, cần can thiệp",
        4: "Rủi ro rất cao (54% khả năng rối loạn sử dụng chất mức độ trung bình-nặng)",
        5: "Rủi ro nghiêm trọng (70% khả năng rối loạn sử dụng chất mức độ trung bình-nặng)",
        6: "Rủi ro cực cao (100% khả năng rối loạn sử dụng chất mức độ trung bình-nặng)"
    };

    return interpretations[score] || "Điểm số không hợp lệ";
};


