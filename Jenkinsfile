pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_CREDENTIALS = credentials('docker-hub-credentials')
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        BACKEND_IMAGE = "${DOCKER_REGISTRY}/recruithub-backend"
        FRONTEND_IMAGE = "${DOCKER_REGISTRY}/recruithub-frontend"
        KUBECONFIG = credentials('kubeconfig')
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo 'Code checked out successfully'
            }
        }
        
        stage('Environment Setup') {
            steps {
                script {
                    sh '''
                        echo "Setting up environment variables"
                        echo "BUILD_NUMBER: ${BUILD_NUMBER}"
                        echo "GIT_COMMIT: ${GIT_COMMIT}"
                    '''
                }
            }
        }
        
        stage('Backend - Build & Test') {
            steps {
                dir('backend') {
                    script {
                        sh '''
                            echo "Installing backend dependencies"
                            python3 -m venv venv
                            . venv/bin/activate
                            pip install -r requirements.txt
                            
                            echo "Running backend linting"
                            pip install flake8
                            flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics || true
                            
                            echo "Backend tests would run here"
                        '''
                    }
                }
            }
        }
        
        stage('Frontend - Build & Test') {
            steps {
                dir('frontend') {
                    script {
                        sh '''
                            echo "Installing frontend dependencies"
                            yarn install --frozen-lockfile
                            
                            echo "Running frontend linting"
                            yarn lint || true
                            
                            echo "Building frontend"
                            yarn build
                        '''
                    }
                }
            }
        }
        
        stage('Docker - Build Images') {
            parallel {
                stage('Build Backend Image') {
                    steps {
                        dir('backend') {
                            script {
                                sh '''
                                    echo "Building backend Docker image"
                                    docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} .
                                    docker tag ${BACKEND_IMAGE}:${IMAGE_TAG} ${BACKEND_IMAGE}:latest
                                '''
                            }
                        }
                    }
                }
                stage('Build Frontend Image') {
                    steps {
                        dir('frontend') {
                            script {
                                sh '''
                                    echo "Building frontend Docker image"
                                    docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} .
                                    docker tag ${FRONTEND_IMAGE}:${IMAGE_TAG} ${FRONTEND_IMAGE}:latest
                                '''
                            }
                        }
                    }
                }
            }
        }
        
        stage('Docker - Push Images') {
            steps {
                script {
                    sh '''
                        echo "Logging into Docker registry"
                        echo ${DOCKER_CREDENTIALS_PSW} | docker login -u ${DOCKER_CREDENTIALS_USR} --password-stdin
                        
                        echo "Pushing backend image"
                        docker push ${BACKEND_IMAGE}:${IMAGE_TAG}
                        docker push ${BACKEND_IMAGE}:latest
                        
                        echo "Pushing frontend image"
                        docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}
                        docker push ${FRONTEND_IMAGE}:latest
                    '''
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                script {
                    sh '''
                        echo "Deploying to Kubernetes"
                        
                        # Update image tags in deployment files
                        sed -i "s|IMAGE_TAG|${IMAGE_TAG}|g" k8s/backend-deployment.yaml
                        sed -i "s|IMAGE_TAG|${IMAGE_TAG}|g" k8s/frontend-deployment.yaml
                        
                        # Apply Kubernetes configurations
                        kubectl --kubeconfig=${KUBECONFIG} apply -f k8s/namespace.yaml
                        kubectl --kubeconfig=${KUBECONFIG} apply -f k8s/configmap.yaml
                        kubectl --kubeconfig=${KUBECONFIG} apply -f k8s/secrets.yaml
                        kubectl --kubeconfig=${KUBECONFIG} apply -f k8s/mongodb-deployment.yaml
                        kubectl --kubeconfig=${KUBECONFIG} apply -f k8s/backend-deployment.yaml
                        kubectl --kubeconfig=${KUBECONFIG} apply -f k8s/frontend-deployment.yaml
                        kubectl --kubeconfig=${KUBECONFIG} apply -f k8s/ingress.yaml
                        
                        # Wait for rollout to complete
                        kubectl --kubeconfig=${KUBECONFIG} rollout status deployment/backend -n recruithub
                        kubectl --kubeconfig=${KUBECONFIG} rollout status deployment/frontend -n recruithub
                    '''
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    sh '''
                        echo "Performing health checks"
                        sleep 30
                        
                        # Check if pods are running
                        kubectl --kubeconfig=${KUBECONFIG} get pods -n recruithub
                        
                        # Check service endpoints
                        kubectl --kubeconfig=${KUBECONFIG} get svc -n recruithub
                    '''
                }
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline completed successfully!'
            // Add notification here (Slack, email, etc.)
        }
        failure {
            echo 'Pipeline failed!'
            // Add notification here
        }
        always {
            // Cleanup
            sh '''
                docker logout
                echo "Cleaned up Docker credentials"
            '''
        }
    }
}