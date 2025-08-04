import axios from 'axios';

// Comment out the original hardcoded data
/*
export const Assist_Data = {
    questions: [
        {
            id: 1,
            question: "Trong suốt cuộc đời bạn, bạn đã từng sử dụng các chất nào sau đây? (Có thể chọn nhiều đáp án)",
            options: [
                { id: 1, text: "Cần sa (marijuana, pot, cỏ, hash, v.v.)", score: 3 },
                { id: 2, text: "Cocaine (coke, crack, v.v.)", score: 3 },
                { id: 3, text: "Thuốc kích thích kê đơn (Adderall, Ritalin, thuốc ăn kiêng, v.v.) dùng sai mục đích", score: 3 },
                { id: 4, text: "Methamphetamine (meth, đá, ecstasy, molly, v.v.)", score: 3 },
                { id: 5, text: "Chất hít (keo, sơn, khí cười, poppers, v.v.)", score: 3 },
                { id: 6, text: "Thuốc an thần (Xanax, Valium, thuốc ngủ, benzodiazepine v.v.) dùng sai mục đích", score: 3 },
                { id: 7, text: "Ảo giác (LSD, nấm thần, PCP, ketamine, v.v.)", score: 3 },
                { id: 8, text: "Opioids đường phố (heroin, thuốc phiện)", score: 3 },
                { id: 9, text: "Opioids kê đơn (Oxycodone, Vicodin, Fentanyl, Methadone, v.v.) dùng sai mục đích", score: 3 },
                { id: 10, text: "Chất khác để tạo cảm giác 'phê'", score: 3 },
                { id: 11, text: "Tôi chưa từng sử dụng bất kỳ chất nào", score: 0 }
            ],
            type: "multi-select",
            multiSelect: true,
            allowMultiple: true
        },
        {
            id: 2,
            question: "Trong 3 tháng qua, bạn đã sử dụng [chất] bao nhiêu lần?",
            note: "Dùng để đo tần suất sử dụng gần đây. [chất] sẽ thay bằng loại chất bạn chọn ở câu hỏi 1.",
            options: [
                { id: 1, text: "Không bao giờ", score: 0 },
                { id: 2, text: "Một hoặc hai lần", score: 2 },
                { id: 3, text: "Hàng tháng", score: 3 },
                { id: 4, text: "Hàng tuần", score: 4 },
                { id: 5, text: "Gần như hàng ngày hoặc hàng ngày", score: 6 },
            ],
            type: "MCQs"
        },
        {
            id: 3,
            question: "Trong 3 tháng qua, bạn có từng rất muốn sử dụng [chất] không?",
            note: "'Rất muốn' tức là cảm giác mạnh mẽ, khó cưỡng lại khi không sử dụng.",
            options: [
                { id: 1, text: "Không bao giờ", score: 0 },
                { id: 2, text: "Một hoặc hai lần", score: 3 },
                { id: 3, text: "Hàng tháng", score: 4 },
                { id: 4, text: "Hàng tuần", score: 5 },
                { id: 5, text: "Gần như hàng ngày hoặc hàng ngày", score: 6 },
            ],
            type: "MCQs"
        },
        {
            id: 4,
            question: "Trong 3 tháng qua, việc sử dụng [chất] có làm bạn gặp vấn đề về sức khỏe, tài chính, xã hội hoặc pháp lý không?",
            note: "Ví dụ: đau ốm, mất tiền, bị xa lánh, bị phạt hoặc bắt.",
            options: [
                { id: 1, text: "Không bao giờ", score: 0 },
                { id: 2, text: "Một hoặc hai lần", score: 4 },
                { id: 3, text: "Hàng tháng", score: 5 },
                { id: 4, text: "Hàng tuần", score: 6 },
                { id: 5, text: "Gần như hàng ngày hoặc hàng ngày", score: 7 },
            ],
            type: "MCQs"
        },
        {
            id: 5,
            question: "Trong 3 tháng qua, bạn có từng bỏ bê trách nhiệm ở nhà, trường học, hoặc nơi làm vì sử dụng [chất] không?",
            note: "Ví dụ: nghỉ học, đi làm trễ, quên việc do ảnh hưởng của chất.",
            options: [
                { id: 1, text: "Không bao giờ", score: 0 },
                { id: 2, text: "Một hoặc hai lần", score: 5 },
                { id: 3, text: "Hàng tháng", score: 6 },
                { id: 4, text: "Hàng tuần", score: 7 },
                { id: 5, text: "Gần như hàng ngày hoặc hàng ngày", score: 8 },
            ],
            type: "MCQs"
        },
        {
            id: 6,
            question: "Có ai từng lo lắng hoặc phàn nàn về việc bạn sử dụng [chất] không?",
            note: "Người khác cảm thấy bạn có vấn đề với chất và thể hiện sự lo ngại.",
            options: [
                { id: 1, text: "Không bao giờ", score: 0 },
                { id: 2, text: "Có, trong 3 tháng qua", score: 6 },
                { id: 3, text: "Có, nhưng không trong 3 tháng qua", score: 3 },
            ],
            type: "MCQs"
        },
        {
            id: 7,
            question: "Bạn đã từng cố gắng ngừng hoặc giảm sử dụng [chất] nhưng không thành công chưa?",
            note: "Cố gắng dừng lại nhưng vẫn không kiểm soát được.",
            options: [
                { id: 1, text: "Không bao giờ", score: 0 },
                { id: 2, text: "Có, trong 3 tháng qua", score: 6 },
                { id: 3, text: "Có, nhưng không trong 3 tháng qua", score: 3 },
            ],
            type: "MCQs"
        },
        {
            id: 8,
            question: "Bạn đã từng tiêm chất nào đó vào cơ thể chưa? (Không tính trường hợp tiêm vì lý do y tế)",
            note: "Tiêm bằng kim để đưa chất vào máu hoặc cơ.",
            options: [
                { id: 1, text: "Không bao giờ", score: 0 },
                { id: 2, text: "Có, trong 3 tháng qua", score: 2 },
                { id: 3, text: "Có, nhưng không trong 3 tháng qua", score: 1 },
            ],
            type: "MCQs"
        },
        {
            id: 9,
            question: "Việc sử dụng [chất] của bạn có từng khiến bạn gặp nguy hiểm không? (như lái xe khi say, quan hệ tình dục không an toàn, v.v.)",
            note: "Hành vi nguy hiểm do ảnh hưởng của chất, đe dọa an toàn bản thân hoặc người khác.",
            options: [
                { id: 1, text: "Không bao giờ", score: 0 },
                { id: 2, text: "Một hoặc hai lần", score: 4 },
                { id: 3, text: "Hàng tháng", score: 5 },
                { id: 4, text: "Hàng tuần", score: 6 },
                { id: 5, text: "Gần như hàng ngày hoặc hàng ngày", score: 7 },
            ],
            type: "MCQs"
        },
        {
            id: 10,
            question: "Khi bạn ngừng sử dụng [chất], bạn có từng trải qua triệu chứng khó chịu như run tay, mất ngủ, cáu gắt không?",
            note: "Đây là triệu chứng cai nghiện, xuất hiện khi ngừng dùng chất gây nghiện.",
            options: [
                { id: 1, text: "Không bao giờ", score: 0 },
                { id: 2, text: "Một hoặc hai lần", score: 4 },
                { id: 3, text: "Thường xuyên", score: 6 },
            ],
            type: "MCQs"
        },
        {
            id: 11,
            question: "Bạn có cần tăng liều [chất] để cảm thấy hiệu quả như trước không?",
            note: "Càng dùng nhiều mới có tác dụng như cũ gọi là hiện tượng 'dung nạp'.",
            options: [
                { id: 1, text: "Không bao giờ", score: 0 },
                { id: 2, text: "Một vài lần", score: 3 },
                { id: 3, text: "Thường xuyên", score: 5 },
            ],
            type: "MCQs"
        },
        {
            id: 12,
            question: "Bạn đã từng bỏ qua các hoạt động quan trọng vì sử dụng [chất] chưa? (như học tập, giải trí, gia đình)",
            note: "Ví dụ: bỏ họp lớp, không ăn cơm gia đình vì bận dùng chất.",
            options: [
                { id: 1, text: "Không bao giờ", score: 0 },
                { id: 2, text: "Một vài lần", score: 4 },
                { id: 3, text: "Thường xuyên", score: 6 },
            ],
            type: "MCQs"
        },
        {
            id: 13,
            question: "Việc sử dụng [chất] có từng khiến bạn bị mất ngủ, giảm trí nhớ hoặc khó tập trung không?",
            note: "Ảnh hưởng đến chức năng thần kinh như suy nghĩ, học tập, làm việc.",
            options: [
                { id: 1, text: "Không bao giờ", score: 0 },
                { id: 2, text: "Thỉnh thoảng", score: 3 },
                { id: 3, text: "Thường xuyên", score: 5 },
            ],
            type: "MCQs",
          
        },
        {
            id: 14,
            question: "Bạn có từng bị nghỉ học hoặc mất việc do việc sử dụng [chất] không?",
            note: "Có thể là bị đình chỉ học, sa thải hoặc tự nghỉ.",
            options: [
                { id: 1, text: "Không bao giờ", score: 0 },
                { id: 2, text: "Một lần", score: 4 },
                { id: 3, text: "Hơn một lần", score: 6 },
            ],
            type: "MCQs",
            
        },
        {
            id: 15,
            question: "Bạn đã từng bị công an bắt hoặc bị xử phạt vì liên quan đến sử dụng hoặc sở hữu [chất] chưa?",
            note: "Ví dụ: bị cảnh sát xử lý hành chính, hình sự hoặc bị lập hồ sơ.",
            options: [
                { id: 1, text: "Không bao giờ", score: 0 },
                { id: 2, text: "Một lần", score: 5 },
                { id: 3, text: "Nhiều lần", score: 7 },
            ],
            type: "MCQs",
        }
    ],
};
*/

// API-based ASSIST data
export const Assist_Data = {
    questions: [],
    isLoading: false,
    error: null
};

// Function to fetch ASSIST questions from API
export const fetchAssistQuestions = async () => {
    try {
        Assist_Data.isLoading = true;
        Assist_Data.error = null;
        
        console.log('🔄 Fetching ASSIST questions from API...');
        
        // Use the correct endpoint from index.js
        const response = await axios.get('http://localhost:3000/api/assessment-questions/type/ASSIST');
        
        console.log('📡 ASSIST API Response:', response);
        console.log('📊 ASSIST Response Data:', response.data);
        
        if (response.data && response.data.success && response.data.data && response.data.data.length > 0) {
            console.log('✅ ASSIST Questions found:', response.data.data.length);
            console.log('📝 ASSIST Raw Questions:', response.data.data);
            
            // Transform API data to match expected format
            Assist_Data.questions = response.data.data.map(question => ({
                id: question.assessment_question_id,
                question: question.question,
                note: question.note,
                type: question.type,
                multiSelect: question.multiSelect,
                allowMultiple: question.allowMultiple,
                options: question.options.map(option => ({
                    id: option.id,
                    text: option.text,
                    score: option.score
                }))
            }));
            
            console.log('🔄 ASSIST Transformed Questions:', Assist_Data.questions);
            console.log('✅ ASSIST Data loaded successfully!');
        } else {
            console.warn('⚠️ No ASSIST questions found in response');
            throw new Error('No ASSIST questions found');
        }
    } catch (error) {
        console.error('❌ Error fetching ASSIST questions:', error);
        console.error('❌ Error details:', error.response?.data || error.message);
        Assist_Data.error = error.message;
        // Fallback to empty array if API fails
        Assist_Data.questions = [];
    } finally {
        Assist_Data.isLoading = false;
        console.log('🏁 ASSIST fetch completed. Loading:', Assist_Data.isLoading);
    }
};

// Initialize ASSIST data on module load
fetchAssistQuestions();

export const resultInitalState = {
    score: 0,
    riskLevel: "Chưa xác định",
};

// Function to get risk level based on score and action ranges from API
export const assessRiskLevel = async (score) => {
    try {
        // Get token from sessionStorage
        const token = sessionStorage.getItem("token");
        
        // Fetch actions from API to get dynamic ranges
        const response = await axios.get('http://localhost:3000/api/actions/type/ASSIST', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data && response.data.success && response.data.data) {
            const actions = response.data.data;
            
            // Sort actions by range to ensure proper order
            const sortedActions = actions.sort((a, b) => a.range - b.range);
            
            // Use the actual ranges from the database dynamically:
            // sortedActions[0] = lowest range (Thấp)
            // sortedActions[1] = middle range (Trung bình)  
            // sortedActions[2] = highest range (Cao)
            
            if (sortedActions.length >= 3) {
                if (score >= sortedActions[2].range) {
                    return "Cao";
                } else if (score >= sortedActions[1].range) {
                    return "Trung bình";
                } else {
                    return "Thấp";
                }
            }
            
            // Fallback if unexpected number of actions
            if (score >= 27) {
                return "Cao";
            } else if (score >= 4) {
                return "Trung bình";
            } else {
                return "Thấp";
            }
        }
        
        // Fallback to database-based ranges if API fails
        if (score >= 27) {
            return "Cao";
        } else if (score >= 4) {
            return "Trung bình";
        } else {
            return "Thấp";
        }
    } catch (error) {
        console.error('Error fetching actions for risk assessment:', error);
        
        // Fallback to database-based ranges
        if (score >= 27) {
            return "Cao";
        } else if (score >= 4) {
            return "Trung bình";
        } else {
            return "Thấp";
        }
    }
};


