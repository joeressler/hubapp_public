pipeline {
    agent any  // Use Jenkins' default agent
    
    environment {
        DOCKER_IMAGE = 'flask-container'
        GCR_IMAGE = 'gcr.io/lively-machine-427223-j0/flask-container'
        VERSION = '1.00'
        AWS_LIGHTSAIL_SERVICE = 'flask-service'
        AWS_DEFAULT_REGION = 'us-east-1'
    }
    
    stages {
        stage('Build and Tag') {
            steps {
                script {
                    bat "docker build -t ${DOCKER_IMAGE} ."
                    bat "docker tag ${DOCKER_IMAGE} ${GCR_IMAGE}:${VERSION}"
                }
            }
        }
        
        stage('Deploy to AWS Lightsail') {
            steps {
                withCredentials([aws(accessKeyVariable: 'AWS_ACCESS_KEY_ID', 
                                   credentialsId: 'd03bf61e-64e0-4efb-b6cc-9907081a93dd', 
                                   secretKeyVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                    bat "aws lightsail push-container-image --service-name ${AWS_LIGHTSAIL_SERVICE} --label ${DOCKER_IMAGE} --image ${DOCKER_IMAGE}"
                    bat "aws lightsail create-container-service-deployment --service-name ${AWS_LIGHTSAIL_SERVICE} --containers file://containers.json --public-endpoint file://public-endpoint.json"
                }
            }
        }
        
        stage('Deploy to Google Cloud Run') {
            steps {
                withCredentials([file(credentialsId: 'google-cloud-key', variable: 'GC_KEY')]) {
                    // Configure gcloud with service account
                    bat 'gcloud auth activate-service-account --key-file=%GC_KEY%'
                    
                    // Configure Docker with gcloud credentials
                    bat 'gcloud auth configure-docker gcr.io -q'
                    
                    // Push and deploy
                    bat "docker push ${GCR_IMAGE}:${VERSION}"
                    bat "gcloud run deploy ${DOCKER_IMAGE} --image=${GCR_IMAGE}:${VERSION} --platform managed --region us-central1"
                }
            }
        }
    }
    
    post {
        always {
            script {
                bat "docker image prune -a -f"
            }
        }
    }
}


