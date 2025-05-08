import axios from 'axios';

// Mock data for categories
const mockCategories = [
  {
    id: 1,
    name: "Technical Skills",
    description: "Evaluate candidate's technical abilities and knowledge",
    default_time: 30,
    job_id: 34,
    questions: [
      { id: 101, text: "Tell me about your experience with React and frontend frameworks", status: "active", must_ask: true, category_id: 1, job_id: 34 },
      { id: 102, text: "How do you approach state management in complex applications?", status: "active", must_ask: true, category_id: 1, job_id: 34 },
      { id: 103, text: "Explain your experience with responsive design and CSS frameworks", status: "active", must_ask: true, category_id: 1, job_id: 34 },
      { id: 104, text: "What testing frameworks have you used for frontend applications?", status: "active", must_ask: false, category_id: 1, job_id: 34 },
      { id: 105, text: "Describe your experience with version control and CI/CD pipelines", status: "if_time_permits", must_ask: false, category_id: 1, job_id: 34 }
    ]
  },
  {
    id: 2,
    name: "Problem Solving",
    description: "Review analytical abilities and critical thinking",
    default_time: 25,
    job_id: 34,
    questions: [
      { id: 201, text: "Describe a challenging technical problem you've faced and how you solved it", status: "active", must_ask: true, category_id: 2, job_id: 34 },
      { id: 202, text: "How do you approach debugging complex frontend issues?", status: "active", must_ask: true, category_id: 2, job_id: 34 },
      { id: 203, text: "Tell me about a time when you had to optimize the performance of a web application", status: "active", must_ask: false, category_id: 2, job_id: 34 }
    ]
  },
  {
    id: 3,
    name: "Behavioral",
    description: "Assess cultural fit and interpersonal qualities",
    default_time: 15,
    job_id: 34,
    questions: [
      { id: 301, text: "How do you collaborate with designers and backend developers?", status: "active", must_ask: true, category_id: 3, job_id: 34 },
      { id: 302, text: "Tell me about a time when you had to meet a tight deadline", status: "active", must_ask: true, category_id: 3, job_id: 34 },
      { id: 303, text: "How do you stay updated with the latest frontend technologies?", status: "active", must_ask: true, category_id: 3, job_id: 34 },
      { id: 304, text: "Describe a situation where you had to give or receive constructive feedback", status: "if_time_permits", must_ask: false, category_id: 3, job_id: 34 }
    ]
  },
  {
    id: 4,
    name: "Specific Job Skills",
    description: "Questions related specifically to the frontend developer role",
    default_time: 20,
    job_id: 34,
    questions: [
      { id: 401, text: "What's your approach to writing maintainable and scalable code?", status: "active", must_ask: true, category_id: 4, job_id: 34 },
      { id: 402, text: "How do you ensure your UI components are accessible?", status: "active", must_ask: true, category_id: 4, job_id: 34 },
      { id: 403, text: "What experience do you have with API integration and data fetching?", status: "active", must_ask: false, category_id: 4, job_id: 34 }
    ]
  }
];

// Helper for creating mock question responses
const createMockQuestion = (data) => {
  return {
    id: Date.now(),
    text: data.text || "",
    status: data.status || "active",
    must_ask: data.must_ask !== undefined ? data.must_ask : true,
    category_id: data.category_id,
    job_id: data.job_id
  };
};

// API proxy handler
export default async function handler(req, res) {
  const { path } = req.query;
  const fullPath = Array.isArray(path) ? path.join('/') : path;
  const backendUrl = `http://localhost:8000/api/${fullPath}`;
  
  console.log(`Proxying request to: ${backendUrl}`);
  
  try {
    // Try to forward the request to the real backend
    const response = await axios({
      method: req.method,
      url: backendUrl,
      headers: {
        ...req.headers,
        host: 'localhost:8000',
      },
      data: req.method !== 'GET' ? req.body : undefined,
      timeout: 3000, // 3 second timeout
    });
    
    // Forward the response from the backend
    res.status(response.status).json(response.data);
  } catch (error) {
    console.log(`Backend request failed: ${error.message}`);
    console.log('Falling back to mock data');
    
    // If the backend is unavailable, provide mock data
    const urlParts = fullPath.split('/');
    
    // Extract information from the URL
    const isInterviewEndpoint = urlParts[0] === 'interview';
    
    if (!isInterviewEndpoint) {
      return res.status(404).json({ error: 'Not Found' });
    }
    
    // Handle different API endpoints with mock data
    if (req.method === 'GET' && urlParts[1] === 'job' && urlParts[3] === 'categories') {
      // GET /api/interview/job/:id/categories
      const jobId = parseInt(urlParts[2]);
      return res.status(200).json(mockCategories.map(cat => ({
        ...cat,
        job_id: jobId
      })));
    }
    
    if (req.method === 'POST' && urlParts[1] === 'questions') {
      // POST /api/interview/questions
      return res.status(200).json(createMockQuestion(req.body));
    }
    
    if (req.method === 'PUT' && urlParts[1] === 'questions') {
      // PUT /api/interview/questions/:id
      const questionId = parseInt(urlParts[2]);
      return res.status(200).json({
        ...req.body,
        id: questionId,
        category_id: req.body.category_id || 1,
        job_id: req.body.job_id || 34
      });
    }
    
    if (req.method === 'DELETE' && urlParts[1] === 'questions') {
      // DELETE /api/interview/questions/:id
      const questionId = parseInt(urlParts[2]);
      return res.status(200).json({
        id: questionId,
        text: "Deleted question",
        status: "inactive",
        must_ask: false,
        category_id: 1,
        job_id: 34
      });
    }
    
    if (req.method === 'POST' && urlParts[1] === 'categories') {
      // POST /api/interview/categories
      return res.status(200).json({
        ...req.body,
        id: Date.now(),
        questions: []
      });
    }
    
    if (req.method === 'PUT' || req.method === 'PATCH') {
      // Generic PUT/PATCH response
      return res.status(200).json(req.body);
    }
    
    // Fallback response
    res.status(404).json({ error: 'Not Found' });
  }
} 