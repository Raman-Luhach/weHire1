// Mock user data
export const mockUsers = [
  {
    id: 1,
    username: 'hr_admin',
    email: 'hr@example.com',
    role: 'HR',
  },
  {
    id: 2,
    username: 'manager1',
    email: 'manager1@example.com',
    role: 'Hiring Manager',
  },
  {
    id: 3,
    username: 'manager2',
    email: 'manager2@example.com',
    role: 'Hiring Manager',
  },
];

// Mock job data
export const mockJobs = [
  {
    id: 1,
    title: 'Frontend Developer',
    description: 'We are looking for a skilled Frontend Developer to join our team and help build amazing user interfaces.',
    requirements: 'Experience with React, Next.js, and modern JavaScript. At least 2 years of experience in frontend development.',
    location: 'New York, NY',
    department: 'Engineering',
    salary: 95000,
    end_date: '2023-12-31',
    status: 'open',
    assigned_to: 2,
    assigned_manager: {
      id: 2,
      username: 'manager1',
    },
    created_at: '2023-06-01T00:00:00Z',
  },
  {
    id: 2,
    title: 'Backend Developer',
    description: 'Join our backend team to develop high-performance APIs and services.',
    requirements: 'Proficient in Python, FastAPI, and SQL databases. Knowledge of Docker and cloud services is a plus.',
    location: 'San Francisco, CA',
    department: 'Engineering',
    salary: 110000,
    end_date: '2023-11-30',
    status: 'open',
    assigned_to: 3,
    assigned_manager: {
      id: 3,
      username: 'manager2',
    },
    created_at: '2023-06-02T00:00:00Z',
  },
  {
    id: 3,
    title: 'Product Manager',
    description: 'Lead the product development lifecycle for our core products.',
    requirements: 'Experience in product management, agile methodologies, and technical background preferred.',
    location: 'Remote',
    department: 'Product',
    salary: 120000,
    end_date: '2023-10-15',
    status: 'in_review',
    assigned_to: 2,
    assigned_manager: {
      id: 2,
      username: 'manager1',
    },
    created_at: '2023-06-03T00:00:00Z',
  },
  {
    id: 4,
    title: 'DevOps Engineer',
    description: 'Help us build and maintain our cloud infrastructure and CI/CD pipelines.',
    requirements: 'Experience with AWS, Kubernetes, Terraform, and CI/CD tools.',
    location: 'Seattle, WA',
    department: 'Engineering',
    salary: 115000,
    end_date: '2023-12-15',
    status: 'draft',
    assigned_to: 3,
    assigned_manager: {
      id: 3,
      username: 'manager2',
    },
    created_at: '2023-06-04T00:00:00Z',
  },
  {
    id: 5,
    title: 'UX Designer',
    description: 'Design intuitive and beautiful user experiences for our products.',
    requirements: 'Portfolio showing UX/UI design skills. Experience with Figma and user research.',
    location: 'Boston, MA',
    department: 'Design',
    salary: 90000,
    end_date: '2023-11-01',
    status: 'closed',
    assigned_to: 2,
    assigned_manager: {
      id: 2,
      username: 'manager1',
    },
    created_at: '2023-05-15T00:00:00Z',
  },
];

// Mock auth token
export const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6ImhyX2FkbWluIiwicm9sZSI6IkhSIn0'; 