# RecruitHub - Recruitment Management System

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/your-org/recruithub)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-blue)](https://hub.docker.com/r/recruithub)

A production-ready, full-stack Recruitment Management System built with FastAPI, React, and MongoDB. Features role-based access control, bulk resume processing, PDF generation, and comprehensive candidate management workflows.

## 🌟 Features

### Core Functionality
- **Role-Based Access Control (RBAC)**: Admin, Manager, Team Leader, Recruiter roles with granular permissions
- **Client Management**: Comprehensive client registration and tracking
- **Position Management**: Create and manage job positions with recruiter assignments
- **Candidate Management**: 
  - Manual candidate entry
  - Bulk resume upload with automatic data extraction (PDF, DOCX)
  - Advanced search and filtering
- **Profile Review Workflow**: Approve/reject candidates with mandatory reasons
- **Profile Sharing**: 
  - Generate professional PDFs with contact details hidden
  - Email draft composition for client communication
- **Interview Scheduling**: Schedule and track interviews with multiple modes
- **User Management**: Create and manage system users

### Technical Features
- **Modern UI**: Built with React 19, Tailwind CSS, and Shadcn UI components
- **RESTful API**: FastAPI backend with automatic OpenAPI documentation
- **JWT Authentication**: Secure token-based authentication
- **Resume Parsing**: Automatic extraction of candidate details from resumes
- **PDF Generation**: ReportLab-based professional document generation
- **Docker Support**: Complete containerization for easy deployment
- **Kubernetes Ready**: Production-ready K8s manifests included
- **CI/CD Pipeline**: Jenkins pipeline for automated builds and deployments

## 📚 Table of Contents

- [Quick Start](#quick-start)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## 🚀 Quick Start

### Using Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-org/recruithub.git
cd recruithub

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8001/api/
# API Docs: http://localhost:8001/docs
```

### Default Credentials

```
Email: admin@recruitment.com
Password: Admin@123
```

**⚠️ Remember to change default credentials in production!**

## 💻 Tech Stack

### Backend
- **Framework**: FastAPI 0.110.1
- **Database**: MongoDB 7.0
- **ODM**: Motor (async MongoDB driver)
- **Authentication**: JWT with bcrypt
- **PDF Generation**: ReportLab
- **Resume Parsing**: pdfplumber, python-docx
- **Validation**: Pydantic

### Frontend
- **Framework**: React 19
- **Routing**: React Router v7
- **UI Components**: Shadcn UI, Radix UI
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **Notifications**: Sonner
- **Icons**: Lucide React

### DevOps
- **Containerization**: Docker, Docker Compose
- **Orchestration**: Kubernetes
- **CI/CD**: Jenkins
- **Web Server**: Nginx (for frontend)
- **Process Manager**: Uvicorn (for backend)

## 📁 Project Structure

```
recruithub/
├── backend/                 # FastAPI backend application
│   ├── server.py            # Main FastAPI application
│   ├── requirements.txt     # Python dependencies
│   ├── Dockerfile           # Backend Docker image
│   ├── .env                 # Backend environment variables
│   └── uploads/             # Uploaded files directory
│       ├── jds/             # Job descriptions
│       └── resumes/         # Candidate resumes
│
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── ui/          # Shadcn UI components
│   │   │   └── Layout.js    # Main layout component
│   │   ├── pages/           # Page components
│   │   │   ├── Dashboard.js
│   │   │   ├── Clients.js
│   │   │   ├── Positions.js
│   │   │   ├── Candidates.js
│   │   │   └── ...
│   │   ├── contexts/        # React contexts
│   │   └── App.js           # Main App component
│   ├── package.json         # Node dependencies
│   ├── Dockerfile           # Frontend Docker image
│   ├── nginx.conf           # Nginx configuration
│   └── .env                 # Frontend environment variables
│
├── k8s/                    # Kubernetes manifests
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secrets.yaml
│   ├── mongodb-deployment.yaml
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   ├── ingress.yaml
│   └── hpa.yaml
│
├── docker-compose.yml      # Docker Compose configuration
├── Jenkinsfile             # Jenkins CI/CD pipeline
├── .dockerignore           # Docker ignore file
├── DEPLOYMENT.md           # Detailed deployment guide
└── README.md               # This file
```

## 🔧 Installation

### Prerequisites

- Node.js 20+
- Python 3.11+
- MongoDB 7.0+
- Docker & Docker Compose (for containerized deployment)

### Local Development Setup

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB connection string

# Run the server
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
yarn install

# Create .env file
cp .env.example .env
# Edit .env with your backend URL

# Start development server
yarn start
```

## ⚙️ Configuration

### Backend Environment Variables

Create `/app/backend/.env`:

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=recruitment_db
CORS_ORIGINS=*
JWT_SECRET=your-secret-key-min-32-characters-long
```

### Frontend Environment Variables

Create `/app/frontend/.env`:

```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

## 🚀 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions including:

- Docker Compose deployment
- Kubernetes deployment
- Jenkins CI/CD pipeline setup
- Production configuration
- Monitoring and logging
- Backup and restore procedures

### Quick Deployment Commands

```bash
# Docker Compose
docker-compose up -d

# Kubernetes
kubectl apply -f k8s/

# Check status
kubectl get all -n recruithub
```

## 📚 API Documentation

Once the backend is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc

### Key API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (Admin/Manager only)
- `GET /api/auth/me` - Get current user

#### Clients
- `GET /api/clients` - List clients (role-based filtering)
- `POST /api/clients` - Create client
- `GET /api/clients/{id}` - Get client details
- `PUT /api/clients/{id}` - Update client

#### Positions
- `GET /api/positions` - List positions (role-based filtering)
- `POST /api/positions` - Create position
- `GET /api/positions/{id}` - Get position details
- `PUT /api/positions/{id}` - Update position

#### Candidates
- `GET /api/candidates` - List candidates
- `POST /api/candidates` - Create candidate manually
- `POST /api/candidates/bulk-upload` - Bulk upload resumes
- `POST /api/candidates/search` - Advanced search
- `POST /api/candidates/{id}/action` - Approve/reject candidate

#### Profile Sharing
- `POST /api/candidates/generate-pdf` - Generate PDF with hidden contacts
- `POST /api/candidates/share-email-draft` - Create email draft

#### Interviews
- `GET /api/interviews` - List interviews
- `POST /api/interviews` - Schedule interview
- `PUT /api/interviews/{id}` - Update interview feedback

#### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics (role-specific)

## 🛠️ Development

### Code Style

**Backend (Python)**
```bash
# Format code
black .

# Lint
flake8 .

# Type checking
mypy .
```

**Frontend (JavaScript)**
```bash
# Lint
yarn lint

# Format
yarn format
```

### Database Schema

**Collections:**
- `users` - System users with roles
- `clients` - Client companies
- `positions` - Job positions
- `candidates` - Candidate profiles
- `interviews` - Interview schedules
- `profile_sharing_log` - Audit log for profile sharing

### Adding New Features

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes
3. Test thoroughly
4. Submit pull request

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest tests/ -v

# With coverage
pytest tests/ --cov=. --cov-report=html
```

### Frontend Tests

```bash
cd frontend
yarn test

# With coverage
yarn test --coverage
```

### End-to-End Tests

Use the built-in testing subagent or manual testing:

```bash
# Manual API testing
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@recruitment.com","password":"Admin@123"}'
```

## 🔒 Security

### Best Practices Implemented

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Input validation with Pydantic
- CORS configuration
- SQL injection prevention (MongoDB)
- XSS protection
- File upload validation

### Security Checklist for Production

- [ ] Change default admin password
- [ ] Use strong JWT secret (32+ characters)
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets
- [ ] Enable MongoDB authentication
- [ ] Regular security updates
- [ ] Implement rate limiting
- [ ] Enable audit logging
- [ ] Use Kubernetes secrets for sensitive data

## 📊 Monitoring

### Health Checks

- Backend: `GET /api/` - Returns API status
- Frontend: `GET /health` - Returns health status

### Logs

```bash
# Docker Compose
docker-compose logs -f [service-name]

# Kubernetes
kubectl logs -f deployment/backend -n recruithub
kubectl logs -f deployment/frontend -n recruithub
```

### Metrics

- CPU and Memory usage via Kubernetes metrics
- Request latency via FastAPI middleware
- Database performance via MongoDB metrics

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contribution Guidelines

- Follow existing code style
- Write tests for new features
- Update documentation
- Ensure all tests pass
- Add meaningful commit messages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Support

- **Documentation**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Issues**: [GitHub Issues](https://github.com/your-org/recruithub/issues)
- **Email**: support@recruithub.com
- **Discord**: [Join our community](https://discord.gg/recruithub)

## 🚀 Roadmap

### Phase 1 (Current)
- [x] Core recruitment workflow
- [x] Role-based access control
- [x] Bulk resume upload
- [x] PDF generation
- [x] Docker & Kubernetes support

### Phase 2 (Planned)
- [ ] LLM-based resume parsing
- [ ] Email integration (SMTP)
- [ ] Calendar integration
- [ ] Mobile app
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

### Phase 3 (Future)
- [ ] AI-powered candidate matching
- [ ] Video interview integration
- [ ] Applicant tracking system (ATS) integration
- [ ] Advanced reporting
- [ ] White-label solution

## 🌟 Acknowledgments

- Built with [FastAPI](https://fastapi.tiangolo.com/)
- UI components from [Shadcn UI](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Design system inspired by [Radix UI](https://www.radix-ui.com/)

---

**Made with ❤️ by the RecruitHub Team**