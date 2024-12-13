pipeline {
    agent any  // Use Jenkins' default agent
    
    environment {
        VERSION = '1.00'
        DOCKER_IMAGE = 'flask-container'
        GCR_IMAGE = 'gcr.io/lively-machine-427223-j0/flask-container'
        EC2_HOST = 'ec2-user@ec2-3-90-221-218.compute-1.amazonaws.com'
        EC2_KEY_PATH = 'C:\\ProgramData\\ssh\\ec2.pem'
        GCR_PROJECT = 'lively-machine-427223-j0'
        AWS_DEFAULT_REGION = 'us-east-1'
        AWS_DEPLOY = 'true'
        GCR_DEPLOY = 'true'
    }
    
    stages {
        stage('Build Docker Image') {
            steps {
                bat "docker build -t ${DOCKER_IMAGE} ."
            }
        }
        stage('Deploy to EC2') {
            when {
                environment name: 'AWS_DEPLOY', value: 'true'
            }
            steps {
                script {
                    // Build docker compose images
                    withCredentials([
                        string(credentialsId: 'MYSQL_HOST', variable: 'MYSQL_HOST'),
                        string(credentialsId: 'MYSQL_USER', variable: 'MYSQL_USER'),
                        string(credentialsId: 'MYSQL_PWD', variable: 'MYSQL_PWD'),
                        string(credentialsId: 'MYSQL_DATABASE', variable: 'MYSQL_DATABASE'),
                        string(credentialsId: 'OPENAI_API_KEY', variable: 'OPENAI_API_KEY'),
                        string(credentialsId: 'FLASK_SECRET_KEY', variable: 'FLASK_SECRET_KEY'),
                        string(credentialsId: 'RECAPTCHA_PUBLIC_KEY', variable: 'RECAPTCHA_PUBLIC_KEY'),
                        string(credentialsId: 'RECAPTCHA_PRIVATE_KEY', variable: 'RECAPTCHA_PRIVATE_KEY'),
                        string(credentialsId: 'VERIFY_URL', variable: 'VERIFY_URL'),
                        string(credentialsId: 'PASSWORD_PIN', variable: 'PASSWORD_PIN'),
                        string(credentialsId: 'SENTRY_DSN', variable: 'SENTRY_DSN')
                    ]) {
                        bat "docker compose build"
                    }
                    // Save docker image to .tar
                    bat "docker save -o flask-container.tar ${DOCKER_IMAGE}"

                    withCredentials([
                        sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'EC2_SSH_KEY')
                    ]) {
                        bat "scp -i ${EC2_SSH_KEY} -o StrictHostKeyChecking=no flask-container.tar Dockerfile docker-compose.yml ${EC2_HOST}:~/"
                        // SSH into EC2 and load the docker image
                        bat "ssh -i ${EC2_SSH_KEY} -o StrictHostKeyChecking=no ${EC2_HOST} 'docker load -i flask-container.tar && docker-compose up -d'"
                    }
                    
                }
            }
        }
        
        stage('Deploy to Google Cloud Run') {
            when {
                environment name: 'GCR_DEPLOY', value: 'true'
            }
            steps {
                withCredentials([
                    file(credentialsId: 'google-cloud-key', variable: 'GC_KEY'),
                    string(credentialsId: 'MYSQL_HOST', variable: 'MYSQL_HOST'),
                    string(credentialsId: 'MYSQL_USER', variable: 'MYSQL_USER'),
                    string(credentialsId: 'MYSQL_PWD', variable: 'MYSQL_PWD'),
                    string(credentialsId: 'MYSQL_DATABASE', variable: 'MYSQL_DATABASE'),
                    string(credentialsId: 'OPENAI_API_KEY', variable: 'OPENAI_API_KEY'),
                    string(credentialsId: 'FLASK_SECRET_KEY', variable: 'FLASK_SECRET_KEY'),
                    string(credentialsId: 'RECAPTCHA_PUBLIC_KEY', variable: 'RECAPTCHA_PUBLIC_KEY'),
                    string(credentialsId: 'RECAPTCHA_PRIVATE_KEY', variable: 'RECAPTCHA_PRIVATE_KEY'),
                    string(credentialsId: 'VERIFY_URL', variable: 'VERIFY_URL'),
                    string(credentialsId: 'PASSWORD_PIN', variable: 'PASSWORD_PIN'),
                    string(credentialsId: 'SENTRY_DSN', variable: 'SENTRY_DSN')
                ]) {
                    // Configure gcloud
                    bat 'gcloud auth activate-service-account --key-file=%GC_KEY%'
                    bat 'gcloud auth configure-docker gcr.io -q'

                    // Build docker solo image instead of compose for GCR
                    bat "docker build -t ${DOCKER_IMAGE} ."
                    bat "docker tag ${DOCKER_IMAGE} ${GCR_IMAGE}:${VERSION}"
                    
                    // Push and deploy with environment variables
                    bat "docker push ${GCR_IMAGE}:${VERSION}"
                    bat """
                        gcloud run deploy ${DOCKER_IMAGE} \
                            --project=${GCR_PROJECT} \
                            --image=${GCR_IMAGE}:${VERSION} \
                            --platform managed \
                            --region us-central1 \
                            --set-env-vars MYSQL_HOST=%MYSQL_HOST% \
                            --set-env-vars MYSQL_USER=%MYSQL_USER% \
                            --set-env-vars MYSQL_PWD=%MYSQL_PWD% \
                            --set-env-vars MYSQL_DATABASE=%MYSQL_DATABASE% \
                            --set-env-vars OPENAI_API_KEY=%OPENAI_API_KEY% \
                            --set-env-vars FLASK_SECRET_KEY=%FLASK_SECRET_KEY% \
                            --set-env-vars RECAPTCHA_PUBLIC_KEY=%RECAPTCHA_PUBLIC_KEY% \
                            --set-env-vars RECAPTCHA_PRIVATE_KEY=%RECAPTCHA_PRIVATE_KEY% \
                            --set-env-vars VERIFY_URL=%VERIFY_URL% \
                            --set-env-vars PASSWORD_PIN=%PASSWORD_PIN% \
                            --set-env-vars SENTRY_DSN=%SENTRY_DSN%
                    """
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


