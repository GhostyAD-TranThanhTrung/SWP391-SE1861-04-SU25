import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch, FaPlus, FaEdit, FaTrash, FaEye, FaChartBar, FaFile, FaQuestion, FaImage, FaCode, FaEyeSlash } from "react-icons/fa";
import { MdCancel, MdSave, MdPreview } from "react-icons/md";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import SurveyQuestionViewer from "../../components/SurveyQuestionViewer";
import SurveyQuestionCreator from "../../components/SurveyQuestionCreator";
import ContentCreator from "../../components/ContentCreator";
import "../../styles/CourseListPage.scss";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CourseListPage = () => {
  // Main state
  const [programs, setPrograms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const token = sessionStorage.getItem("token");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);

  // Form states
  const [newProgram, setNewProgram] = useState({
    title: "",
    description: "",
    age_group: "",
    category_id: "",
    status: "active",
    img_link: ""
  });
  const [updateProgram, setUpdateProgram] = useState({
    title: "",
    description: "",
    age_group: "",
    category_id: "",
    status: "active",
    img_link: ""
  });

  // Content/Survey states  
  const [programContents, setProgramContents] = useState([]);
  const [surveyAnalytics, setSurveyAnalytics] = useState(null);
  const [showContentCreator, setShowContentCreator] = useState(false);
  const [surveyCharts, setSurveyCharts] = useState({});
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Survey management
  const [surveys, setSurveys] = useState([]);
  const [editingSurvey, setEditingSurvey] = useState(null);
  const [newQuestion, setNewQuestion] = useState({
    id: "",
    question: "",
    type: "multiple-choice",
    options: [""]
  });
  const [showSurveyViewer, setShowSurveyViewer] = useState(false);
  const [showSurveyCreator, setShowSurveyCreator] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);

  useEffect(() => {
    fetchPrograms();
    fetchCategories();
  }, []);

  // Render charts when surveyCharts data changes
  useEffect(() => {
    if (surveyCharts && Object.keys(surveyCharts).length > 0) {
      console.log("🔄 CourseListPage - Rendering charts for surveys:", Object.keys(surveyCharts));
      
      // Small delay to ensure DOM elements are ready
      setTimeout(() => {
        Object.keys(surveyCharts).forEach(surveyId => {
          const surveyChartData = surveyCharts[surveyId];
          Object.keys(surveyChartData).forEach(questionId => {
            const chartKey = `${surveyId}-${questionId}`;
            const canvas = document.getElementById(`chart-${chartKey}`);
            
            if (canvas) {
              console.log("🔄 CourseListPage - Rendering chart:", chartKey);
              const ctx = canvas.getContext('2d');
              
              // Destroy existing chart if it exists
              if (canvas.chart) {
                canvas.chart.destroy();
              }
              
              // Create new chart
              canvas.chart = new ChartJS(ctx, surveyChartData[questionId]);
            } else {
              console.warn("⚠️ CourseListPage - Canvas not found for chart:", chartKey);
            }
          });
        });
      }, 100);
    }
  }, [surveyCharts]);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      console.log("Fetching programs...");
      const res = await axios.get("http://localhost:3000/api/programs/category-details", {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Programs response:", res.data);
      
      if (res.data.success) {
        setPrograms(res.data.data.programs_by_category);
        console.log("Programs and categories updated in state");
      }
    } catch (err) {
      console.error("Error fetching programs:", {
        error: err,
        response: err.response,
        data: err.response?.data
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      console.log("Fetching categories...");
      const res = await axios.get("http://localhost:3000/api/categories", {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Categories response:", res.data);
      
      if (res.data.success) {
        setCategories(res.data.data);
        console.log("Categories updated in state:", res.data.data);
      }
    } catch (err) {
      console.error("Error fetching categories:", {
        error: err,
        response: err.response,
        data: err.response?.data
      });
    }
  };

  const handleCreateProgram = async (e) => {
    e.preventDefault();
    try {
      console.log("Creating program with data:", newProgram);
      console.log("Using auth token:", token);

      const res = await axios.post("http://localhost:3000/api/programs", newProgram, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("Create program response:", res.data);

      if (res.data.success) {
        console.log("Program created successfully");
        await fetchPrograms();
        setShowCreateModal(false);
        setNewProgram({
          title: "",
          description: "",
          age_group: "",
          category_id: "",
          status: "active",
          img_link: ""
        });
        alert("Program created successfully!");
      }
    } catch (err) {
      console.error("Error creating program:", {
        error: err,
        response: err.response,
        data: err.response?.data,
        status: err.response?.status
      });
      alert("Error creating program: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteProgram = async (programId, programTitle) => {
    if (window.confirm(`Are you sure you want to delete "${programTitle}"?`)) {
      try {
        const res = await axios.delete(`http://localhost:3000/api/programs/${programId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          fetchPrograms();
          alert("Program deleted successfully!");
        }
      } catch (err) {
        console.error("Error deleting program:", err);
        alert("Error deleting program: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const openUpdateModal = (program) => {
    console.log("Opening update modal for program:", program);
    setUpdateProgram({
      title: program.title || "",
      description: program.description || "",
      age_group: program.age_group || "",
      category_id: program.category_id || program.category?.category_id || "",
      status: program.status || "active",
      img_link: program.img_link || ""
    });
    setSelectedProgram(program);
    setShowUpdateModal(true);
  };

  const handleUpdateProgram = async (e) => {
    e.preventDefault();
    try {
      console.log("Updating program with data:", updateProgram);
      console.log("Program ID:", selectedProgram.program_id);

      const res = await axios.put(`http://localhost:3000/api/programs/${selectedProgram.program_id}`, updateProgram, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("Update program response:", res.data);

      if (res.data.success) {
        console.log("Program updated successfully");
        await fetchPrograms();
        setShowUpdateModal(false);
        setUpdateProgram({
          title: "",
          description: "",
          age_group: "",
          category_id: "",
          status: "active",
          img_link: ""
        });
        alert("Program updated successfully!");
      }
    } catch (err) {
      console.error("Error updating program:", {
        error: err,
        response: err.response,
        data: err.response?.data,
        status: err.response?.status
      });
      alert("Error updating program: " + (err.response?.data?.message || err.message));
    }
  };

  const openDetailModal = async (program) => {
    setSelectedProgram(program);
    setShowDetailModal(true);
    setAnalyticsLoading(true);
    
    // Fetch survey analytics using the survey response statistics API
    try {
      console.log("🔄 CourseListPage - Fetching survey response statistics for program:", program.program_id);
      const res = await axios.get(`http://localhost:3000/api/survey-responses/statistics?programId=${program.program_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        console.log("✅ CourseListPage - Survey response statistics:", res.data.data);
        setSurveyAnalytics({
          total_surveys: res.data.data.length,
          total_responses: res.data.data.reduce((sum, survey) => sum + survey.totalResponses, 0),
          surveys: res.data.data.map(survey => ({
            id: survey.surveyId,
            type: survey.surveyType,
            totalResponses: survey.totalResponses,
            responses: survey.questionStatistics
          }))
        });
        
        // Generate charts for each survey with improved error handling
        const charts = {};
        if (res.data.data && Array.isArray(res.data.data)) {
          res.data.data.forEach(survey => {
            console.log("🔄 CourseListPage - Processing survey:", survey.surveyId);
            const surveyCharts = generateSurveyChartsFromStatistics(survey);
            if (Object.keys(surveyCharts).length > 0) {
              charts[survey.surveyId] = surveyCharts;
            }
          });
        }
        
        setSurveyCharts(charts);
        console.log("✅ CourseListPage - Generated charts:", charts);
      } else {
        console.error("❌ CourseListPage - Failed to fetch survey statistics:", res.data.message);
        setSurveyAnalytics(null);
      }
    } catch (error) {
      console.error("❌ CourseListPage - Error fetching survey statistics:", error);
      setSurveyAnalytics(null);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const openContentModal = () => {
    setShowContentModal(true);
    setShowDetailModal(false);
  };

  const openContentCreator = () => {
    setShowContentCreator(true);
    setShowContentModal(false);
  };

  const handleSaveContent = async (contentData) => {
    try {
      const res = await axios.post("http://localhost:3000/api/content", contentData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        alert("Content created successfully!");
        // Refresh content list
        const contentRes = await axios.get(`http://localhost:3000/api/content/program/${selectedProgram.program_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (contentRes.data.success) {
          setProgramContents(contentRes.data.data);
        }
      }
    } catch (err) {
      console.error("Error creating content:", err);
      alert("Error creating content: " + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateContent = async (contentId, contentData) => {
    try {
      const res = await axios.put(`http://localhost:3000/api/content/${contentId}`, contentData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        alert("Content updated successfully!");
        // Refresh content list
        const contentRes = await axios.get(`http://localhost:3000/api/content/program/${selectedProgram.program_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (contentRes.data.success) {
          setProgramContents(contentRes.data.data);
        }
      }
    } catch (err) {
      console.error("Error updating content:", err);
      alert("Error updating content: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteContent = async (contentId) => {
    try {
      const res = await axios.delete(`http://localhost:3000/api/content/${contentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        alert("Content deleted successfully!");
        // Refresh content list
        const contentRes = await axios.get(`http://localhost:3000/api/content/program/${selectedProgram.program_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (contentRes.data.success) {
          setProgramContents(contentRes.data.data);
        }
      }
    } catch (err) {
      console.error("Error deleting content:", err);
      alert("Error deleting content: " + (err.response?.data?.message || err.message));
    }
  };

  const openSurveyModal = async () => {
    setShowSurveyModal(true);
    setShowDetailModal(false);
    
    // Fetch all surveys for this program
    try {
      const res = await axios.get(`http://localhost:3000/api/surveys/program/${selectedProgram.program_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setSurveys(res.data.data);
        console.log("Surveys by type:", res.data.dataByType);
      }
    } catch (err) {
      console.error("Error fetching surveys:", err);
    }
  };

  const openSurveyViewer = (survey) => {
    setSelectedSurvey(survey);
    setShowSurveyViewer(true);
    setShowSurveyModal(false);
  };

  const openSurveyCreator = (survey = null, hasPre = null, hasPost = null) => {
    // If editing, allow as normal
    if (survey) {
      setSelectedSurvey(survey);
      setShowSurveyCreator(true);
      setShowSurveyModal(false);
      return;
    }
    // If both exist, block creation
    const pre = hasPre !== null ? hasPre : surveys.some(s => s.type === 'pre-assessment');
    const post = hasPost !== null ? hasPost : surveys.some(s => s.type === 'post-assessment');
    if (pre && post) {
      alert('Only one pre-assessment and one post-assessment survey are allowed per program.');
      return;
    }
    // Pre-select the type that is still available
    let type = !pre ? 'pre-assessment' : 'post-assessment';
    setSelectedSurvey({ type });
    setShowSurveyCreator(true);
    setShowSurveyModal(false);
  };

  const generateSurveyChartsFromStatistics = (survey) => {
    console.log("🔄 CourseListPage - Generating charts from statistics for survey:", survey.surveyId);
    console.log("🔄 CourseListPage - Survey statistics:", survey);
    
    const charts = {};
    
    if (!survey.questionStatistics || typeof survey.questionStatistics !== 'object') {
      console.warn("⚠️ CourseListPage - No valid question statistics for survey:", survey.surveyId);
      return charts;
    }
    
    Object.keys(survey.questionStatistics).forEach(questionId => {
      const questionStats = survey.questionStatistics[questionId];
      console.log("🔄 CourseListPage - Processing question:", questionId, questionStats);
      
      if (!questionStats.answerCounts || Object.keys(questionStats.answerCounts).length === 0) {
        console.warn("⚠️ CourseListPage - No answer counts for question:", questionId);
        return;
      }
      
      const labels = Object.keys(questionStats.answerCounts);
      const data = Object.values(questionStats.answerCounts);
      
      console.log("🔄 CourseListPage - Question chart data:", {
        questionId,
        questionText: questionStats.questionText,
        labels,
        data
      });
      
      // Create chart configuration
      const chartConfig = {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: `Responses for "${questionStats.questionText}"`,
            data: data,
            backgroundColor: [
              'rgba(255, 99, 132, 0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 206, 86, 0.8)',
              'rgba(75, 192, 192, 0.8)',
              'rgba(153, 102, 255, 0.8)',
              'rgba(255, 159, 64, 0.8)',
              'rgba(199, 199, 199, 0.8)',
              'rgba(83, 102, 255, 0.8)',
              'rgba(78, 252, 3, 0.8)',
              'rgba(252, 3, 244, 0.8)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(199, 199, 199, 1)',
              'rgba(83, 102, 255, 1)',
              'rgba(78, 252, 3, 1)',
              'rgba(252, 3, 244, 1)'
            ],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: `Question ${questionId}: ${questionStats.questionText}`,
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = ((context.parsed.y / total) * 100).toFixed(1);
                  return `${context.parsed.y} responses (${percentage}%)`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Number of Responses'
              },
              ticks: {
                stepSize: 1
              }
            },
            x: {
              title: {
                display: true,
                text: 'Answer Options'
              }
            }
          }
        }
      };
      
      charts[questionId] = chartConfig;
    });
    
    console.log("✅ CourseListPage - Generated charts for survey:", survey.surveyId, charts);
    return charts;
  };

  const generateSurveyCharts = (survey) => {
    console.log("🔄 CourseListPage - Generating charts for survey:", survey.id);
    console.log("🔄 CourseListPage - Survey object:", survey);
    console.log("🔄 CourseListPage - Survey responses:", survey.responses);
    
    const charts = {};
    
    if (!survey.responses || typeof survey.responses !== 'object') {
      console.warn("⚠️ CourseListPage - No valid responses data for survey:", survey.id);
      console.warn("⚠️ CourseListPage - Survey responses type:", typeof survey.responses);
      console.warn("⚠️ CourseListPage - Survey responses value:", survey.responses);
      return charts;
    }
    
    const responseKeys = Object.keys(survey.responses);
    console.log("🔄 CourseListPage - Response keys:", responseKeys);
    
    responseKeys.forEach(questionText => {
      const optionCounts = survey.responses[questionText];
      console.log(`🔄 CourseListPage - Processing question: "${questionText}"`);
      console.log(`🔄 CourseListPage - Option counts:`, optionCounts);
      
      if (!optionCounts || typeof optionCounts !== 'object') {
        console.warn("⚠️ CourseListPage - Invalid option counts for question:", questionText);
        console.warn("⚠️ CourseListPage - Option counts type:", typeof optionCounts);
        console.warn("⚠️ CourseListPage - Option counts value:", optionCounts);
        return;
      }
      
      const labels = Object.keys(optionCounts);
      const data = Object.values(optionCounts);
      
      console.log(`📊 CourseListPage - Question: ${questionText}`, { labels, data });
      
      // Only create chart if there are valid labels and some data
      if (labels.length > 0 && data.some(count => count > 0)) {
        console.log(`✅ CourseListPage - Creating chart for question: ${questionText}`);
        charts[questionText] = {
          labels: labels,
          datasets: [
            {
              label: 'Responses',
              data: data,
              backgroundColor: [
                'rgba(255, 99, 132, 0.8)',
                'rgba(54, 162, 235, 0.8)',
                'rgba(255, 206, 86, 0.8)',
                'rgba(75, 192, 192, 0.8)',
                'rgba(153, 102, 255, 0.8)',
                'rgba(255, 159, 64, 0.8)',
                'rgba(199, 199, 199, 0.8)',
                'rgba(83, 102, 255, 0.8)',
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(199, 199, 199, 1)',
                'rgba(83, 102, 255, 1)',
              ],
              borderWidth: 1,
            },
          ],
        };
      } else {
        console.log(`ℹ️ CourseListPage - No valid data for question: ${questionText}`);
        console.log(`ℹ️ CourseListPage - Labels length: ${labels.length}`);
        console.log(`ℹ️ CourseListPage - Data with count > 0: ${data.filter(count => count > 0).length}`);
      }
    });
    
    console.log("✅ CourseListPage - Generated charts for survey:", survey.id, charts);
    return charts;
  };

  const handleSaveSurvey = async (surveyData) => {
    try {
      console.log("🔄 CourseListPage - handleSaveSurvey called with data:", surveyData);
      
      if (surveyData.survey_id) {
        // Update existing survey
        console.log("🔄 CourseListPage - Updating existing survey ID:", surveyData.survey_id);
        
        // First test with the test endpoint
        try {
          console.log("🧪 CourseListPage - Testing with test endpoint first...");
          const testRes = await axios.put(`http://localhost:3000/api/surveys-test/${surveyData.survey_id}`, surveyData, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log("🧪 CourseListPage - Test endpoint response:", testRes.data);
        } catch (testErr) {
          console.log("🧪 CourseListPage - Test endpoint failed:", testErr.response?.data || testErr.message);
        }
        
        const res = await axios.put(`http://localhost:3000/api/surveys/${surveyData.survey_id}`, surveyData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log("🔄 CourseListPage - Update survey response:", res.data);
        
        if (res.data.success) {
          console.log("✅ CourseListPage - Survey updated successfully");
          console.log("✅ CourseListPage - Updated survey data:", res.data.data);
          console.log("✅ CourseListPage - Changes made:", res.data.changes);
          
          alert(`Survey updated successfully!${res.data.changes?.warning ? `\n\nWarning: ${res.data.changes.warning}` : ''}`);
          setShowSurveyCreator(false);
          // Refresh surveys list
          openSurveyModal();
        } else {
          console.log("❌ CourseListPage - Survey update failed:", res.data.message);
          alert("Survey update failed: " + res.data.message);
        }
      } else {
        // Create new survey
        console.log("🔄 CourseListPage - Creating new survey for program:", selectedProgram.program_id);
        
        const res = await axios.post("http://localhost:3000/api/surveys", {
          ...surveyData,
          program_id: selectedProgram.program_id
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log("🔄 CourseListPage - Create survey response:", res.data);
        
        if (res.data.success) {
          console.log("✅ CourseListPage - Survey created successfully");
          console.log("✅ CourseListPage - Created survey data:", res.data.data);
          
          alert("Survey created successfully!");
          setShowSurveyCreator(false);
          // Refresh surveys list
          openSurveyModal();
        } else {
          console.log("❌ CourseListPage - Survey creation failed:", res.data.message);
          alert("Survey creation failed: " + res.data.message);
        }
      }
    } catch (err) {
      console.error("❌ CourseListPage - Error saving survey:", {
        error: err,
        response: err.response,
        data: err.response?.data,
        status: err.response?.status
      });
      alert("Error saving survey: " + (err.response?.data?.message || err.message));
    }
  };

  const getAllPrograms = () => {
    const allPrograms = [];
    Object.values(programs).forEach(category => {
      allPrograms.push(...category.programs);
    });
    return allPrograms;
  };

  const filteredPrograms = () => {
    const allPrograms = getAllPrograms();
    if (!searchTerm) return allPrograms;
    return allPrograms.filter(program => 
      program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className="course-list-container">
      <div className="top-bar d-flex justify-content-between align-items-center mb-3">
        <div>
          <button 
            className="btn btn-primary me-2" 
            onClick={() => setShowCreateModal(true)}
          >
            <FaPlus className="me-1" /> Create New Program
          </button>
        </div>
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Search programs..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button>
            <FaSearch />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
      <div className="table-wrapper">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Description</th>
                <th>Age Group</th>
              <th>Category</th>
              <th>Status</th>
                <th>Creation Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
              {filteredPrograms().map((program, index) => (
                <tr key={program.program_id}>
                <td>{index + 1}</td>
                  <td>{program.title}</td>
                  <td>{program.description}</td>
                  <td>{program.age_group}</td>
                  <td>{program.category?.name}</td>
                  <td>
                    <span className={`badge ${program.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                      {program.status}
                    </span>
                  </td>
                  <td>{new Date(program.create_at).toLocaleDateString()}</td>
                <td className="action-buttons">
                  <button
                      className="btn btn-info btn-sm me-1"
                      onClick={() => openDetailModal(program)}
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button
                      className="btn btn-warning btn-sm me-1"
                      onClick={() => openUpdateModal(program)}
                      title="Edit Program"
                    >
                      <FaEdit />
                  </button>
                  <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteProgram(program.program_id, program.title)}
                      title="Delete Program"
                  >
                      <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {/* Create Program Modal */}
      {showCreateModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Program</h5>
                <button 
                  className="btn-close" 
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateProgram}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Title *</label>
                <input
                  type="text"
                          className="form-control"
                          value={newProgram.title}
                          onChange={(e) => setNewProgram({...newProgram, title: e.target.value})}
                  required
                />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Category *</label>
                <select
                          className="form-control"
                          value={newProgram.category_id}
                          onChange={(e) => setNewProgram({...newProgram, category_id: e.target.value})}
                  required
                >
                          <option value="">Select Category</option>
                          {categories.map(cat => (
                            <option key={cat.category_id} value={cat.category_id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={newProgram.description}
                      onChange={(e) => setNewProgram({...newProgram, description: e.target.value})}
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Age Group</label>
                        <select
                          className="form-control"
                          value={newProgram.age_group}
                          onChange={(e) => setNewProgram({...newProgram, age_group: e.target.value})}
                        >
                          <option value="">Select Age Group</option>
                          <option value="youth">Youth (13-18)</option>
                          <option value="adult">Adult (18-65)</option>
                          <option value="senior">Senior (65+)</option>
                          <option value="all">All Ages</option>
                </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Status</label>
                  <select
                          className="form-control"
                          value={newProgram.status}
                          onChange={(e) => setNewProgram({...newProgram, status: e.target.value})}
                        >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                          <option value="draft">Draft</option>
                  </select>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Image URL</label>
                    <input
                      type="url"
                      className="form-control"
                      value={newProgram.img_link}
                      onChange={(e) => setNewProgram({...newProgram, img_link: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <MdSave className="me-1" /> Create Program
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Update Program Modal */}
      {showUpdateModal && selectedProgram && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Program: {selectedProgram.title}</h5>
                <button 
                  className="btn-close" 
                  onClick={() => setShowUpdateModal(false)}
                ></button>
              </div>
              <form onSubmit={handleUpdateProgram}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Title *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={updateProgram.title}
                          onChange={(e) => setUpdateProgram({...updateProgram, title: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Category *</label>
                        <select
                          className="form-control"
                          value={updateProgram.category_id}
                          onChange={(e) => setUpdateProgram({...updateProgram, category_id: e.target.value})}
                          required
                        >
                          <option value="">Select Category</option>
                          {categories.map(cat => (
                            <option key={cat.category_id} value={cat.category_id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={updateProgram.description}
                      onChange={(e) => setUpdateProgram({...updateProgram, description: e.target.value})}
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Age Group</label>
                        <select
                          className="form-control"
                          value={updateProgram.age_group}
                          onChange={(e) => setUpdateProgram({...updateProgram, age_group: e.target.value})}
                        >
                          <option value="">Select Age Group</option>
                          <option value="youth">Youth (13-18)</option>
                          <option value="adult">Adult (18-65)</option>
                          <option value="senior">Senior (65+)</option>
                          <option value="all">All Ages</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Status</label>
                        <select
                          className="form-control"
                          value={updateProgram.status}
                          onChange={(e) => setUpdateProgram({...updateProgram, status: e.target.value})}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="draft">Draft</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Image URL</label>
                    <input
                      type="url"
                      className="form-control"
                      value={updateProgram.img_link}
                      onChange={(e) => setUpdateProgram({...updateProgram, img_link: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowUpdateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <MdSave className="me-1" /> Update Program
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Program Detail Modal */}
      {showDetailModal && selectedProgram && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Program Details: {selectedProgram.title}</h5>
                <button 
                  className="btn-close" 
                  onClick={() => setShowDetailModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    {selectedProgram.img_link && (
                      <div className="program-img-wrapper mb-3 text-center">
                        <img
                          src={selectedProgram.img_link}
                          alt={selectedProgram.title + ' image'}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '180px',
                            borderRadius: '10px',
                            objectFit: 'cover',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                          }}
                        />
                      </div>
                    )}
                    <div className="program-info">
                      <h6>Program Information</h6>
                      <p><strong>Description:</strong> {selectedProgram.description}</p>
                      <p><strong>Age Group:</strong> {selectedProgram.age_group}</p>
                      <p><strong>Category:</strong> {selectedProgram.category?.name}</p>
                      <p><strong>Status:</strong> {selectedProgram.status}</p>
                      <p><strong>Enrollments:</strong> {selectedProgram.statistics?.total_enrollments || 0}</p>
                      <p><strong>Contents:</strong> {selectedProgram.statistics?.total_contents || 0}</p>
                      <p><strong>Surveys:</strong> {selectedProgram.statistics?.total_surveys || 0}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="action-buttons-detail">
                      <button 
                        className="btn btn-info me-2 mb-2"
                        onClick={openContentCreator}
                      >
                        <FaFile className="me-1" /> Manage Content
                      </button>
                      <button 
                        className="btn btn-success me-2 mb-2"
                        onClick={openSurveyModal}
                      >
                        <FaQuestion className="me-1" /> Manage Surveys
                      </button>
                      <button 
                        className="btn btn-warning mb-2"
                        onClick={() => {
                          // Analytics are already loaded in the detail modal
                          console.log("Survey analytics data:", surveyAnalytics);
                          console.log("Survey charts data:", surveyCharts);
                        }}
                      >
                        <FaChartBar className="me-1" /> View Analytics
                      </button>
                    </div>
                  </div>
                </div>
                
                {analyticsLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading analytics...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading survey analytics...</p>
                  </div>
                ) : surveyAnalytics && (
                  <div className="survey-analytics mt-4">
                    <h6>Survey Analytics Overview</h6>
                    <div className="row mb-3">
                      <div className="col-md-3">
                        <div className="stat-card">
                          <div className="stat-number">{surveyAnalytics.total_surveys}</div>
                          <div className="stat-label">Total Surveys</div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="stat-card">
                          <div className="stat-number">{surveyAnalytics.total_responses}</div>
                          <div className="stat-label">Total Responses</div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="stat-card">
                          <div className="stat-number">
                            {surveyAnalytics.total_surveys > 0 
                              ? Math.round(surveyAnalytics.total_responses / surveyAnalytics.total_surveys) 
                              : 0}
                          </div>
                          <div className="stat-label">Avg Responses/Survey</div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="stat-card">
                          <div className="stat-number">
                            {surveyAnalytics.surveys ? surveyAnalytics.surveys.length : 0}
                          </div>
                          <div className="stat-label">Active Surveys</div>
                        </div>
                      </div>
                    </div>

                    {/* Survey List with Response Counts */}
                    {surveyAnalytics.surveys && surveyAnalytics.surveys.length > 0 && (
                      <div className="survey-list mb-4">
                        <h6>Survey Details</h6>
                        <div className="row">
                          {surveyAnalytics.surveys.map(survey => (
                            <div key={survey.id} className="col-md-6 mb-3">
                              <div className="card">
                                <div className="card-body">
                                  <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                      <h6 className="mb-1">Survey #{survey.id}</h6>
                                      <p className="mb-0 text-muted">
                                        Type: <span className="badge bg-primary">{survey.type}</span>
                                      </p>
                                      <p className="mb-0 text-muted">
                                        Questions: {survey.responses ? Object.keys(survey.responses).length : 0}
                                      </p>
                                    </div>
                                    <div className="text-end">
                                      <div className="h5 mb-0 text-primary">{survey.totalResponses}</div>
                                      <small className="text-muted">Responses</small>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Survey Charts */}
                    {surveyAnalytics.surveys && surveyAnalytics.surveys.length > 0 && (
                      <div className="survey-charts mt-4">
                        <h6>Question Response Analytics</h6>
                        
                        {/* Debug Section - Remove in production */}
                        <div className="debug-section mb-3">
                          <details>
                            <summary className="text-muted">🔍 Debug: Survey Response Statistics</summary>
                            <div className="debug-content p-3 bg-light border rounded">
                              <pre className="mb-0" style={{ fontSize: '12px', maxHeight: '200px', overflow: 'auto' }}>
                                {JSON.stringify(surveyAnalytics, null, 2)}
                              </pre>
                            </div>
                          </details>
                        </div>

                        {surveyAnalytics.surveys.map(survey => (
                          <div key={survey.id} className="survey-chart-section mb-4">
                            <h6 className="mb-3">
                              Survey #{survey.id} - {survey.type} 
                              <span className="badge bg-secondary ms-2">{survey.totalResponses} responses</span>
                            </h6>
                            
                            {/* Debug individual survey */}
                            <details className="mb-3">
                              <summary className="text-muted">🔍 Debug: Survey #{survey.id} Data</summary>
                              <div className="debug-content p-3 bg-light border rounded">
                                <pre className="mb-0" style={{ fontSize: '12px', maxHeight: '200px', overflow: 'auto' }}>
                                  {JSON.stringify(survey, null, 2)}
                                </pre>
                              </div>
                            </details>

                            {survey.responses && Object.keys(survey.responses).length > 0 ? (
                              <div className="row">
                                {Object.keys(survey.responses).map(questionId => {
                                  const questionStats = survey.responses[questionId];
                                  const chartKey = `${survey.id}-${questionId}`;
                                  
                                  return (
                                    <div key={chartKey} className="col-md-6 mb-3">
                                      <div className="card">
                                        <div className="card-body">
                                          <h6 className="card-title">Question {questionId}</h6>
                                          <p className="card-text text-muted mb-3">
                                            {questionStats.questionText || `Question ${questionId}`}
                                          </p>
                                          
                                          {/* Response Summary */}
                                          <div className="response-summary mb-3">
                                            <div className="row text-center">
                                              <div className="col-4">
                                                <div className="h6 mb-0 text-primary">{questionStats.totalResponses}</div>
                                                <small className="text-muted">Total</small>
                                              </div>
                                              <div className="col-4">
                                                <div className="h6 mb-0 text-success">{questionStats.uniqueAnswers}</div>
                                                <small className="text-muted">Unique</small>
                                              </div>
                                              <div className="col-4">
                                                <div className="h6 mb-0 text-info">
                                                  {questionStats.mostCommonAnswer || 'N/A'}
                                                </div>
                                                <small className="text-muted">Most Common</small>
                                              </div>
                                            </div>
                                          </div>

                                          {/* Answer Breakdown */}
                                          {questionStats.answerCounts && Object.keys(questionStats.answerCounts).length > 0 && (
                                            <div className="answer-breakdown">
                                              <h6 className="mb-2">Answer Distribution:</h6>
                                              <div className="row">
                                                {Object.entries(questionStats.answerCounts).map(([answer, count]) => (
                                                  <div key={answer} className="col-6 mb-2">
                                                    <div className="d-flex justify-content-between">
                                                      <span className="text-truncate me-2">{answer}</span>
                                                      <span className="badge bg-primary">{count}</span>
                                                    </div>
                                                    <div className="progress mt-1" style={{ height: '4px' }}>
                                                      <div 
                                                        className="progress-bar" 
                                                        style={{ 
                                                          width: `${questionStats.percentages[answer] || 0}%` 
                                                        }}
                                                      ></div>
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}

                                          {/* Chart */}
                                          {surveyCharts[survey.id] && surveyCharts[survey.id][questionId] && (
                                            <div className="chart-container mt-3" style={{ height: '200px' }}>
                                              <canvas id={`chart-${chartKey}`}></canvas>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-center py-4">
                                <p className="text-muted">No response data available for this survey.</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Creator Modal */}
      {showContentCreator && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Content Management: {selectedProgram?.title}</h5>
                <button 
                  className="btn-close" 
                  onClick={() => setShowContentCreator(false)}
                ></button>
              </div>
              <div className="modal-body">
                <ContentCreator 
                  program={selectedProgram}
                  contents={programContents}
                  onSave={handleSaveContent}
                  onUpdate={handleUpdateContent}
                  onDelete={handleDeleteContent}
                  onCancel={() => setShowContentCreator(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Survey Management Modal */}
      {showSurveyModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Survey Management: {selectedProgram?.title}</h5>
              <button
                  className="btn-close" 
                  onClick={() => setShowSurveyModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="d-flex justify-content-between mb-3">
                  <h6>Surveys</h6>
                  {(() => {
                    const hasPre = surveys.some(s => s.type === 'pre-assessment');
                    const hasPost = surveys.some(s => s.type === 'post-assessment');
                    if (hasPre && hasPost) {
                      return (
                        <button className="btn btn-secondary" disabled>
                          <FaPlus className="me-1" /> Both Pre & Post Surveys Exist
                        </button>
                      );
                    }
                    return (
                      <button 
                        className="btn btn-primary"
                        onClick={() => openSurveyCreator(null, hasPre, hasPost)}
                      >
                        <FaPlus className="me-1" /> Create New Survey
                      </button>
                    );
                  })()}
                </div>
                
                <div className="survey-list">
                  {(() => {
                    // Group surveys by type
                    const surveysByType = surveys.reduce((acc, survey) => {
                      if (!acc[survey.type]) {
                        acc[survey.type] = [];
                      }
                      acc[survey.type].push(survey);
                      return acc;
                    }, {});

                    const surveyTypes = Object.keys(surveysByType);
                    
                    if (surveyTypes.length === 0) {
                      return (
                        <div className="text-center py-4">
                          <p className="text-muted">No surveys found for this program.</p>
                          <button 
                            className="btn btn-primary"
                            onClick={() => openSurveyCreator(null, surveys.some(s => s.type === 'pre-assessment'), surveys.some(s => s.type === 'post-assessment'))}
                          >
                            <FaPlus className="me-1" /> Create First Survey
                          </button>
                        </div>
                      );
                    }

                    return surveyTypes.map(type => (
                      <div key={type} className="survey-type-section mb-4">
                        <h6 className="survey-type-header">
                          <span className={`badge bg-${type === 'pre-assessment' ? 'primary' : 
                            type === 'post-assessment' ? 'success' : 'warning'} me-2`}>
                            {type.replace('-', ' ').toUpperCase()}
                          </span>
                          {surveysByType[type].length} Survey{surveysByType[type].length !== 1 ? 's' : ''}
                        </h6>
                        
                        {surveysByType[type].map(survey => (
                          <div key={survey.survey_id} className="survey-item card mb-2">
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <h6 className="mb-1">Survey #{survey.survey_id}</h6>
                                  <p className="mb-0 text-muted">
                                    Questions: {survey.questions_json ? JSON.parse(survey.questions_json).questions?.length || 0 : 0}
                                  </p>
                                  {surveyAnalytics && surveyAnalytics.surveys && (
                                    (() => {
                                      const analyticsSurvey = surveyAnalytics.surveys.find(s => s.id === survey.survey_id);
                                      return analyticsSurvey ? (
                                        <p className="mb-0 text-muted">
                                          Responses: {analyticsSurvey.total_responses || 0}
                                          {analyticsSurvey.error && (
                                            <span className="text-warning ms-2">
                                              ⚠️ Error: {analyticsSurvey.error}
                                            </span>
                                          )}
                                        </p>
                                      ) : null;
                                    })()
                                  )}
                                </div>
                                <div>
                                  <button 
                                    className="btn btn-sm btn-info me-1"
                                    onClick={() => openSurveyViewer(survey)}
                                    title="View Survey"
                                  >
                                    <FaEye />
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-warning"
                                    onClick={() => openSurveyCreator(survey, surveys.some(s => s.type === 'pre-assessment'), surveys.some(s => s.type === 'post-assessment'))}
                                    title="Edit Survey"
                                  >
                                    <FaEdit />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ));
                  })()}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowSurveyModal(false)}>
                  Close
                </button>
                <button className="btn btn-secondary" onClick={() => setShowDetailModal(true)}>
                  Back to Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Survey Question Viewer Modal */}
      {showSurveyViewer && selectedSurvey && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">View Survey: {selectedSurvey.type}</h5>
                <button 
                  className="btn-close" 
                  onClick={() => setShowSurveyViewer(false)}
                ></button>
              </div>
              <div className="modal-body">
                <SurveyQuestionViewer 
                  survey={selectedSurvey}
                  isEditing={false}
                />
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-warning me-2"
                  onClick={() => {
                    setShowSurveyViewer(false);
                    openSurveyCreator(selectedSurvey, surveys.some(s => s.type === 'pre-assessment'), surveys.some(s => s.type === 'post-assessment'));
                  }}
                >
                  <FaEdit className="me-1" /> Edit Survey
                </button>
                <button className="btn btn-secondary" onClick={() => setShowSurveyViewer(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Survey Question Creator Modal */}
      {showSurveyCreator && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedSurvey ? `Edit Survey: ${selectedSurvey.type}` : 'Create New Survey'}
                </h5>
                <button 
                  className="btn-close" 
                  onClick={() => setShowSurveyCreator(false)}
                ></button>
              </div>
              <div className="modal-body">
                <SurveyQuestionCreator 
                  survey={selectedSurvey || { type: 'pre-assessment' }}
                  onSave={handleSaveSurvey}
                  onCancel={() => setShowSurveyCreator(false)}
                  isEditing={!!selectedSurvey}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseListPage;