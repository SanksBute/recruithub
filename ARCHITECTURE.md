# RecruitHub Architecture

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTPS
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    Kubernetes Ingress                           │
│                  (NGINX Ingress Controller)                     │
│                      - TLS Termination                          │
│                      - Path-based routing                       │
└────────────┬───────────────────────────┬────────────────────────┘
             │                           │
             │ /api/*                    │ /*
             │                           │
┌────────────▼─────────────┐  ┌─────────▼──────────────────────┐
│   Backend Service        │  │   Frontend Service             │
│   (ClusterIP)            │  │   (ClusterIP)                  │
│   Port: 8001             │  │   Port: 3000                   │
└────────────┬─────────────┘  └─────────┬──────────────────────┘
             │                           │
┌────────────▼─────────────┐  ┌─────────▼──────────────────────┐
│   Backend Pods (x2)      │  │   Frontend Pods (x2)           │
│   - FastAPI Application  │  │   - React Application          │
│   - Python 3.11          │  │   - Nginx Web Server           │
│   - Uvicorn Server       │  │   - Static File Serving        │
│   - JWT Auth             │  │   - React Router               │
│   - Resume Parsing       │  │                                 │
│   - PDF Generation       │  │                                 │
└────────────┬─────────────┘  └────────────────────────────────┘
             │
             │ MongoDB Protocol
             │
┌────────────▼─────────────┐
│   MongoDB Service        │
│   (ClusterIP)            │
│   Port: 27017            │
└────────────┬─────────────┘
             │
┌────────────▼─────────────┐
│   MongoDB Pod            │
│   - MongoDB 7.0          │
│   - Persistent Storage   │
│   - Authentication       │
└──────────────────────────┘
```

## Component Details

### Frontend Layer
- **Technology**: React 19 + Tailwind CSS + Shadcn UI
- **Build Tool**: Create React App with CRACO
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Routing**: React Router v7
- **Deployment**: Nginx container serving static files

### Backend Layer
- **Framework**: FastAPI 0.110.1
- **Runtime**: Python 3.11
- **Web Server**: Uvicorn (ASGI)
- **Authentication**: JWT with bcrypt
- **Database Driver**: Motor (async MongoDB)
- **Resume Parsing**: pdfplumber, python-docx
- **PDF Generation**: ReportLab

### Database Layer
- **Database**: MongoDB 7.0
- **Driver**: Motor (async ODM)
- **Storage**: Persistent Volume (10Gi)
- **Backup**: Manual mongodump/mongorestore

## Data Flow

### User Authentication Flow
```
User → Frontend → POST /api/auth/login → Backend
                                           ↓
                                      Validate credentials
                                           ↓
                                      Generate JWT token
                                           ↓
User ← Frontend ← JWT token + user data ← Backend
```

### Bulk Resume Upload Flow
```
User uploads files → Frontend (FormData)
                       ↓
            POST /api/candidates/bulk-upload
                       ↓
                    Backend
                       ↓
            ┌──────────┴──────────┐
            ↓                     ↓
    Extract text from PDF    Save to filesystem
            ↓                     ↓
    Parse candidate data     /uploads/resumes/
            ↓                     
    Create candidate record       
            ↓                     
        MongoDB                   
            ↓                     
    Return success/failure        
```

### Profile Sharing Flow
```
User selects candidates → Frontend
                            ↓
            POST /api/candidates/generate-pdf
                            ↓
                         Backend
                            ↓
                    Query candidates from MongoDB
                            ↓
                    Generate PDF (ReportLab)
                    - Hide contact details
                    - Add company branding
                            ↓
                    Return base64 PDF
                            ↓
User downloads ← Frontend ← Backend
```

## Security Architecture

### Authentication & Authorization
```
┌─────────────────────────────────────────────┐
│              User Request                   │
└───────────────────┬─────────────────────────┘
                    │
                    ↓
        ┌───────────────────────┐
        │   JWT Token in        │
        │   Authorization       │
        │   Header              │
        └───────────┬───────────┘
                    │
                    ↓
        ┌───────────────────────┐
        │   Verify Token        │
        │   Signature           │
        └───────────┬───────────┘
                    │
                    ↓
        ┌───────────────────────┐
        │   Extract User ID     │
        │   and Role            │
        └───────────┬───────────┘
                    │
                    ↓
        ┌───────────────────────┐
        │   Check Role-based    │
        │   Permissions         │
        └───────────┬───────────┘
                    │
            ┌───────┴────────┐
            ↓                ↓
        Allowed         Denied (403)
            ↓
    Process Request
```

### Role-Based Access Control (RBAC)

| Resource | Admin | Manager | Team Leader | Recruiter |
|----------|-------|---------|-------------|-----------|
| Clients (All) | ✓ | ✓ | ✗ | ✗ |
| Clients (Assigned) | ✓ | ✓ | ✓ | ✓ |
| Positions (All) | ✓ | ✓ | ✗ | ✗ |
| Positions (Assigned) | ✓ | ✓ | ✓ | ✓ |
| Candidates (All) | ✓ | ✓ | ✓ | ✗ |
| Candidates (Own) | ✓ | ✓ | ✓ | ✓ |
| Approve/Reject | ✓ | ✓ | ✓ | ✗ |
| Share Profiles | ✓ | ✓ | ✓ | ✗ |
| Schedule Interviews | ✓ | ✓ | ✓ | ✗ |
| User Management | ✓ | ✓ | ✗ | ✗ |

## Deployment Architecture

### Development Environment
```
┌──────────────────────────────────┐
│      Docker Compose              │
│                                  │
│  ┌────────┐  ┌────────┐  ┌────┐│
│  │Frontend│  │Backend │  │Mongo││
│  │:3000   │  │:8001   │  │:27017│
│  └────────┘  └────────┘  └────┘│
│                                  │
│  Shared Docker Network           │
└──────────────────────────────────┘
```

### Production Environment (Kubernetes)
```
┌─────────────────────────────────────────────────┐
│           Kubernetes Cluster                    │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │         Namespace: recruithub            │  │
│  │                                          │  │
│  │  ┌────────────┐      ┌────────────┐    │  │
│  │  │ Frontend   │      │  Backend   │    │  │
│  │  │ Deployment │      │ Deployment │    │  │
│  │  │ (2 replicas)      │ (2 replicas)    │  │
│  │  └────────────┘      └────────────┘    │  │
│  │         │                    │          │  │
│  │  ┌──────▼──────┐      ┌─────▼──────┐  │  │
│  │  │  Frontend   │      │  Backend   │  │  │
│  │  │   Service   │      │  Service   │  │  │
│  │  └──────┬──────┘      └─────┬──────┘  │  │
│  │         │                    │          │  │
│  │         └────────┬───────────┘          │  │
│  │                  │                      │  │
│  │           ┌──────▼──────┐              │  │
│  │           │   Ingress   │              │  │
│  │           └─────────────┘              │  │
│  │                                         │  │
│  │  ┌────────────┐                        │  │
│  │  │  MongoDB   │                        │  │
│  │  │ StatefulSet│                        │  │
│  │  └──────┬─────┘                        │  │
│  │         │                               │  │
│  │  ┌──────▼──────┐                       │  │
│  │  │ Persistent  │                       │  │
│  │  │  Volume     │                       │  │
│  │  └─────────────┘                       │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

## CI/CD Pipeline

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│   Git    │────▶│ Jenkins  │────▶│  Docker  │────▶│Kubernetes│
│  Commit  │     │ Pipeline │     │  Build   │     │  Deploy  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
      │               │                 │                │
      │               │                 │                │
      ▼               ▼                 ▼                ▼
   Webhook       Checkout          Push to         Rolling
   Trigger       & Test           Registry         Update
```

### Jenkins Pipeline Stages
1. **Checkout**: Clone repository
2. **Backend Test**: Install dependencies, lint, test
3. **Frontend Test**: Install dependencies, lint, build
4. **Docker Build**: Build backend and frontend images
5. **Docker Push**: Push images to registry
6. **K8s Deploy**: Apply Kubernetes manifests
7. **Health Check**: Verify deployment success

## Scaling Strategy

### Horizontal Pod Autoscaling (HPA)
- **Backend**: Min 2, Max 10 pods
- **Frontend**: Min 2, Max 10 pods
- **Triggers**: 
  - CPU usage > 70%
  - Memory usage > 80%

### Database Scaling
- **Vertical Scaling**: Increase MongoDB pod resources
- **Replication**: MongoDB replica sets for read scaling
- **Sharding**: For datasets > 100GB

## Monitoring & Observability

### Metrics Collection
```
Application Metrics → Prometheus → Grafana Dashboards
Container Metrics  → cAdvisor    → Grafana Dashboards
K8s Cluster Metrics → Metrics Server → kubectl top
```

### Logging
```
Container Logs → stdout/stderr → Kubernetes Logs → Log Aggregator
                                                    (ELK/Loki)
```

### Health Checks
- **Liveness Probe**: Ensures pod is alive
- **Readiness Probe**: Ensures pod is ready to accept traffic
- **Startup Probe**: Handles slow-starting containers

## Disaster Recovery

### Backup Strategy
1. **MongoDB**: Daily automated backups using CronJob
2. **Uploaded Files**: PV snapshots or S3 sync
3. **Kubernetes Configs**: Version controlled in Git

### Recovery Time Objectives
- **RTO (Recovery Time Objective)**: < 1 hour
- **RPO (Recovery Point Objective)**: < 24 hours

## Performance Optimization

### Backend
- Async database operations with Motor
- Connection pooling
- Response caching for read-heavy endpoints
- Batch operations for bulk uploads

### Frontend
- Code splitting with React.lazy
- Asset optimization (Webpack)
- CDN for static assets
- Service worker for offline support

### Database
- Indexed queries on frequently searched fields
- Aggregation pipelines for complex queries
- Connection pooling
- Query optimization

## Security Measures

### Network Security
- Network policies in Kubernetes
- TLS encryption for all traffic
- Private container registry
- VPC isolation

### Application Security
- JWT token expiration (24 hours)
- Password hashing with bcrypt
- Input validation with Pydantic
- CORS configuration
- Rate limiting
- File upload validation

### Data Security
- Encrypted secrets in Kubernetes
- Environment-based configuration
- No hardcoded credentials
- Regular security updates
- Audit logging for sensitive operations
