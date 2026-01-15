# RecruitHub Deployment Guide

This guide covers deployment using Docker, Docker Compose, Jenkins CI/CD, and Kubernetes.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development with Docker Compose](#local-development)
3. [Production Deployment with Kubernetes](#kubernetes-deployment)
4. [CI/CD with Jenkins](#cicd-with-jenkins)
5. [Configuration](#configuration)

---

## Prerequisites

### Required Software
- Docker 20.10+
- Docker Compose 2.0+
- Kubernetes 1.25+ (for production)
- kubectl CLI
- Jenkins 2.400+ (for CI/CD)
- Git

---

## Local Development with Docker Compose

### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/recruithub.git
cd recruithub

# Set environment variables
cp .env.example .env
# Edit .env file with your configuration

# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8001/api/
# MongoDB: localhost:27017
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB
MONGO_PASSWORD=your-secure-password

# JWT
JWT_SECRET=your-jwt-secret-key-min-32-chars

# Backend
CORS_ORIGINS=http://localhost:3000
```

### Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v
```

---

## Kubernetes Deployment

### Prerequisites

1. **Kubernetes Cluster** (AWS EKS, GKE, AKS, or local minikube)
2. **kubectl** configured to access your cluster
3. **NGINX Ingress Controller** installed
4. **cert-manager** for TLS certificates (optional)

### Step-by-Step Deployment

#### 1. Update Configuration

Edit `k8s/configmap.yaml`:
```yaml
data:
  REACT_APP_BACKEND_URL: "https://your-domain.com/api"
```

Edit `k8s/secrets.yaml` with secure values:
```yaml
stringData:
  MONGO_PASSWORD: "your-secure-password"
  JWT_SECRET: "your-jwt-secret-key-min-32-chars"
```

Edit `k8s/ingress.yaml`:
```yaml
spec:
  tls:
  - hosts:
    - your-domain.com
  rules:
  - host: your-domain.com
```

#### 2. Build and Push Docker Images

```bash
# Login to Docker registry
docker login

# Build images
cd backend
docker build -t your-registry/recruithub-backend:v1.0 .
cd ../frontend
docker build -t your-registry/recruithub-frontend:v1.0 .

# Push images
docker push your-registry/recruithub-backend:v1.0
docker push your-registry/recruithub-frontend:v1.0
```

#### 3. Update Deployment Files

Update image references in `k8s/backend-deployment.yaml` and `k8s/frontend-deployment.yaml`:
```yaml
image: your-registry/recruithub-backend:v1.0
```

#### 4. Deploy to Kubernetes

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Deploy configurations
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml

# Deploy MongoDB
kubectl apply -f k8s/mongodb-deployment.yaml

# Wait for MongoDB to be ready
kubectl wait --for=condition=ready pod -l app=mongodb -n recruithub --timeout=300s

# Deploy Backend
kubectl apply -f k8s/backend-deployment.yaml

# Wait for Backend to be ready
kubectl wait --for=condition=ready pod -l app=backend -n recruithub --timeout=300s

# Deploy Frontend
kubectl apply -f k8s/frontend-deployment.yaml

# Deploy Ingress
kubectl apply -f k8s/ingress.yaml

# Optional: Deploy HPA for auto-scaling
kubectl apply -f k8s/hpa.yaml
```

#### 5. Verify Deployment

```bash
# Check all resources
kubectl get all -n recruithub

# Check pod logs
kubectl logs -f deployment/backend -n recruithub
kubectl logs -f deployment/frontend -n recruithub

# Check ingress
kubectl get ingress -n recruithub

# Get external IP
kubectl get svc -n recruithub
```

---

## CI/CD with Jenkins

### Jenkins Setup

#### 1. Install Required Plugins

- Docker Pipeline
- Kubernetes CLI
- Git
- Credentials Binding

#### 2. Configure Credentials

Add the following credentials in Jenkins:

1. **docker-hub-credentials** (Username with password)
   - Username: Your Docker Hub username
   - Password: Your Docker Hub token

2. **kubeconfig** (Secret file)
   - Upload your kubeconfig file

3. **git-credentials** (if using private repo)
   - SSH key or username/password

#### 3. Create Jenkins Pipeline

1. New Item → Pipeline
2. Configure:
   - **Pipeline definition**: Pipeline script from SCM
   - **SCM**: Git
   - **Repository URL**: Your Git repository
   - **Script Path**: Jenkinsfile

#### 4. Configure Webhooks

For automatic builds on git push:

1. In Jenkins: Configure → Build Triggers → GitHub hook trigger
2. In GitHub: Settings → Webhooks → Add webhook
   - Payload URL: `http://your-jenkins-url/github-webhook/`
   - Content type: application/json
   - Events: Push events

### Manual Pipeline Execution

```bash
# Trigger pipeline from Jenkins UI or
curl -X POST http://your-jenkins-url/job/recruithub/build \
  --user username:token
```

---

## Configuration

### Backend Configuration

**Environment Variables:**
- `MONGO_URL`: MongoDB connection string
- `DB_NAME`: Database name
- `JWT_SECRET`: Secret key for JWT tokens (min 32 characters)
- `CORS_ORIGINS`: Allowed CORS origins

### Frontend Configuration

**Environment Variables:**
- `REACT_APP_BACKEND_URL`: Backend API URL

### MongoDB Configuration

**Credentials:**
- Username: Configured in secrets
- Password: Configured in secrets
- Default Database: recruitment_db

---

## Monitoring and Logging

### View Logs

```bash
# Docker Compose
docker-compose logs -f [service-name]

# Kubernetes
kubectl logs -f deployment/backend -n recruithub
kubectl logs -f deployment/frontend -n recruithub
kubectl logs -f deployment/mongodb -n recruithub
```

### Health Checks

- Backend: `http://your-domain.com/api/`
- Frontend: `http://your-domain.com/health`

---

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed
```bash
# Check MongoDB status
kubectl get pods -n recruithub | grep mongodb

# Check MongoDB logs
kubectl logs deployment/mongodb -n recruithub

# Verify connection string in secrets
kubectl get secret recruithub-secrets -n recruithub -o yaml
```

#### 2. Backend Pod CrashLoopBackOff
```bash
# Check pod logs
kubectl logs deployment/backend -n recruithub

# Check pod events
kubectl describe pod <pod-name> -n recruithub

# Verify environment variables
kubectl exec deployment/backend -n recruithub -- env
```

#### 3. Frontend Not Loading
```bash
# Check frontend logs
kubectl logs deployment/frontend -n recruithub

# Verify REACT_APP_BACKEND_URL is correct
kubectl get configmap recruithub-config -n recruithub -o yaml

# Check ingress configuration
kubectl describe ingress recruithub-ingress -n recruithub
```

---

## Scaling

### Manual Scaling

```bash
# Scale backend
kubectl scale deployment/backend --replicas=5 -n recruithub

# Scale frontend
kubectl scale deployment/frontend --replicas=5 -n recruithub
```

### Auto-scaling (HPA)

Horizontal Pod Autoscaler is configured in `k8s/hpa.yaml`:
- Min replicas: 2
- Max replicas: 10
- Target CPU: 70%
- Target Memory: 80%

---

## Backup and Restore

### MongoDB Backup

```bash
# Create backup
kubectl exec deployment/mongodb -n recruithub -- \
  mongodump --uri="mongodb://admin:password@localhost:27017" \
  --out=/backup

# Copy backup to local
kubectl cp recruithub/mongodb-pod:/backup ./backup
```

### MongoDB Restore

```bash
# Copy backup to pod
kubectl cp ./backup recruithub/mongodb-pod:/backup

# Restore
kubectl exec deployment/mongodb -n recruithub -- \
  mongorestore --uri="mongodb://admin:password@localhost:27017" \
  /backup
```

---

## Security Best Practices

1. **Use strong passwords** for MongoDB and JWT secret
2. **Enable TLS/SSL** for all communications
3. **Use Kubernetes secrets** for sensitive data
4. **Implement network policies** to restrict pod communication
5. **Regular security updates** for base images
6. **Enable RBAC** in Kubernetes
7. **Use private Docker registry** for production images
8. **Implement pod security policies**

---

## Support

For issues and questions:
- GitHub Issues: https://github.com/your-org/recruithub/issues
- Documentation: https://docs.recruithub.com
- Email: support@recruithub.com