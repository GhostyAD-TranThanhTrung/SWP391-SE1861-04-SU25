import axios from 'axios';

// Comment out the original hardcoded data
/*
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
*/

// API-based CRAFFT data
export const Crafft_Data = {
    questions: [],
    isLoading: false,
    error: null
};

// Function to fetch CRAFFT questions from API
export const fetchCrafftQuestions = async () => {
    try {
        Crafft_Data.isLoading = true;
        Crafft_Data.error = null;
        
        console.log('🔄 Fetching CRAFFT questions from API...');
        
        // Use the correct endpoint from index.js
        const response = await axios.get('http://localhost:3000/api/assessment-questions/type/CRAFFT');
        
        console.log('📡 CRAFFT API Response:', response);
        console.log('📊 CRAFFT Response Data:', response.data);
        
        if (response.data && response.data.success && response.data.data && response.data.data.length > 0) {
            console.log('✅ CRAFFT Questions found:', response.data.data.length);
            console.log('📝 CRAFFT Raw Questions:', response.data.data);
            
            // Transform API data to match expected format
            Crafft_Data.questions = response.data.data.map(question => ({
                id: question.assessment_question_id,
                question: question.question,
                note: question.note,
                type: question.type,
                category: question.category,        // Use database value
                substance: question.substance,      // Use database value
                letter: question.letter,            // Use database value
                options: question.options.map(option => ({
                    id: option.id,
                    text: option.text,
                    score: option.score
                }))
            }));
            
            console.log('🔄 CRAFFT Transformed Questions:', Crafft_Data.questions);
            console.log('✅ CRAFFT Data loaded successfully!');
        } else {
            console.warn('⚠️ No CRAFFT questions found in response');
            throw new Error('No CRAFFT questions found');
        }
    } catch (error) {
        console.error('❌ Error fetching CRAFFT questions:', error);
        console.error('❌ Error details:', error.response?.data || error.message);
        Crafft_Data.error = error.message;
        // Fallback to empty array if API fails
        Crafft_Data.questions = [];
    } finally {
        Crafft_Data.isLoading = false;
        console.log('🏁 CRAFFT fetch completed. Loading:', Crafft_Data.isLoading);
    }
};

// Initialize CRAFFT data on module load
fetchCrafftQuestions();

export const resultInitalState = {
    score: 0,
    riskLevel: "Chưa xác định",
};

// Helper functions for dynamic CRAFFT scoring
export const getCrafftPartAScore = (userAnswers) => {
    const crafftQuestions = Crafft_Data.questions;
    return Object.entries(userAnswers).reduce((total, [questionIndex, answer]) => {
        const questionId = parseInt(questionIndex);
        const question = crafftQuestions.find(q => q.id === questionId);
        return question?.category === 'partA' ? total + (answer?.score || 0) : total;
    }, 0);
};

export const getCrafftPartBScore = (userAnswers) => {
    const crafftQuestions = Crafft_Data.questions;
    return Object.entries(userAnswers).reduce((total, [questionIndex, answer]) => {
        const questionId = parseInt(questionIndex);
        const question = crafftQuestions.find(q => q.id === questionId);
        return question?.category === 'partB' ? total + (answer?.score || 0) : total;
    }, 0);
};

export const hasSubstanceUseInPartA = (userAnswers) => {
    const crafftQuestions = Crafft_Data.questions;
    return Object.entries(userAnswers).some(([questionIndex, answer]) => {
        const questionId = parseInt(questionIndex);
        const question = crafftQuestions.find(q => q.id === questionId);
        return question?.category === 'partA' && answer?.score > 0;
    });
};

export const hasCarRisk = (userAnswers) => {
    const crafftQuestions = Crafft_Data.questions;
    return Object.entries(userAnswers).some(([questionIndex, answer]) => {
        const questionId = parseInt(questionIndex);
        const question = crafftQuestions.find(q => q.id === questionId);
        return question?.letter === 'C' && answer?.score === 1;
    });
};

// CRAFFT 2.1 Risk Assessment Function - Compatible with ExamPage flow
export const assessRiskLevel = (totalScore, userAnswers = {}) => {
    // totalScore now only contains Part B score (0-6) since Part A doesn't contribute
    const partBScore = totalScore;

    // Use helper functions for dynamic assessment
    const hasSubstanceUse = hasSubstanceUseInPartA(userAnswers);
    const hasCarRiskFactor = hasCarRisk(userAnswers);

    // Apply CRAFFT 2.1 risk assessment logic
    if (!hasSubstanceUse && partBScore === 0) {
        // LOW RISK: No use in past 12 months AND CRAFFT score = 0
        return "Thấp";
    } else if ((!hasSubstanceUse && hasCarRiskFactor) || (hasSubstanceUse && partBScore < 2)) {
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
            partAScore: 0,
            partBScore: 0,
            hasSubstanceUse: false,
            hasCarRisk: false,
            riskLevel: "Chưa xác định",
            clinicalAction: "Chưa có dữ liệu đánh giá"
        };
    }

    // Use helper functions for dynamic scoring
    const partAScore = getCrafftPartAScore(userAnswers);
    const partBScore = getCrafftPartBScore(userAnswers);
    const hasSubstanceUse = hasSubstanceUseInPartA(userAnswers);
    const hasCarRiskFactor = hasCarRisk(userAnswers);

    // Determine risk level according to CRAFFT 2.1 guidelines
    let riskLevel;
    let clinicalAction;

    if (!hasSubstanceUse && partBScore === 0) {
        riskLevel = "Thấp";
        clinicalAction = "Cung cấp thông tin về rủi ro của việc sử dụng chất và lái xe/đi xe với người đã sử dụng chất; khen ngợi và khuyến khích";
    } else if ((!hasSubstanceUse && hasCarRiskFactor) || (hasSubstanceUse && partBScore < 2)) {
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
        riskLevel,
        score: partBScore
    };
};



