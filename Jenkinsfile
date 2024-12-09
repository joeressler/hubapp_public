pipeline {
    agent any  // Use Jenkins' default agent
    
    environment {
        VERSION = '1.00'
        DOCKER_IMAGE = 'flask-container'
        GCR_IMAGE = 'gcr.io/lively-machine-427223-j0/flask-container'
        AWS_LIGHTSAIL_SERVICE = 'flask-service'
        GCR_PROJECT = 'lively-machine-427223-j0'
        AWS_DEFAULT_REGION = 'us-east-1'
        AWS_DEPLOY = 'true'
        GCR_DEPLOY = 'true'
    }
    
    stages {
        stage('Build and Tag') {
            steps {
                script {
                    bat "docker build -t ${DOCKER_IMAGE} ."
                    if (GCR_DEPLOY) {
                        bat "docker tag ${DOCKER_IMAGE} ${GCR_IMAGE}:${VERSION}"
                    }
                }
            }
        }

        stage('Create Necessary Deployment JSON Files') {
            steps {
                script {
                    def containers = readJSON text: '{}'
                    containers.flask.image = ':flask-service.flask-container.latest' as String
                    containers.flask.ports = readJSON text: '{}'
                    containers.flask.ports['8080'] = 'HTTP' as String
                    containers.flask.environment = readJSON text: '{}'
                    containers.flask.environment['MYSQL_HOST'] = '%MYSQL_HOST%' as String
                    containers.flask.environment['MYSQL_USER'] = '%MYSQL_USER%' as String
                    containers.flask.environment['MYSQL_PWD'] = '%MYSQL_PWD%' as String
                    containers.flask.environment['MYSQL_DATABASE'] = '%MYSQL_DATABASE%' as String
                    containers.flask.environment['OPENAI_API_KEY'] = '%OPENAI_API_KEY%' as String
                    containers.flask.environment['FLASK_SECRET_KEY'] = '%FLASK_SECRET_KEY%' as String
                    containers.flask.environment['RECAPTCHA_PUBLIC_KEY'] = '%RECAPTCHA_PUBLIC_KEY%' as String
                    containers.flask.environment['RECAPTCHA_PRIVATE_KEY'] = '%RECAPTCHA_PRIVATE_KEY%' as String
                    containers.flask.environment['VERIFY_URL'] = '%VERIFY_URL%' as String
                    containers.flask.environment['PASSWORD_PIN'] = '%PASSWORD_PIN%' as String
                    containers.flask.environment['SENTRY_DSN'] = '%SENTRY_DSN%' as String
                    writeJSON file: 'containers.json', json: containers

                    def publicEndpoint = readJSON text: '{}'
                    publicEndpoint.containerName = 'flask' as String
                    publicEndpoint.containerPort = 8080 as Integer
                    writeJSON file: 'public-endpoint.json', json: publicEndpoint
                }
            }
        }
        
        stage('Deploy to AWS Lightsail') {
            when {
                environment name: 'AWS_DEPLOY', value: 'true'
            }
            steps {
                withCredentials([
                    aws(accessKeyVariable: 'AWS_ACCESS_KEY_ID', 
                        credentialsId: 'd03bf61e-64e0-4efb-b6cc-9907081a93dd', 
                        secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'),
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
                    // Push container image
                    bat "aws lightsail push-container-image --service-name ${AWS_LIGHTSAIL_SERVICE} --label ${DOCKER_IMAGE} --image ${DOCKER_IMAGE}"
                    
                    // Create deployment JSON with environment variables
                bat '''
                    echo {
                        "flask": {
                            "image": ":flask-service.flask-container.latest",
                            "ports": {
                                "8080": "HTTP"
                            },
                            "environment": {
                                "MYSQL_HOST": "%MYSQL_HOST%",
                                "MYSQL_USER": "%MYSQL_USER%",
                                "MYSQL_PWD": "%MYSQL_PWD%",
                                "MYSQL_DATABASE": "%MYSQL_DATABASE%",
                                "OPENAI_API_KEY": "%OPENAI_API_KEY%",
                                "FLASK_SECRET_KEY": "%FLASK_SECRET_KEY%",
                                "RECAPTCHA_PUBLIC_KEY": "%RECAPTCHA_PUBLIC_KEY%",
                                "RECAPTCHA_PRIVATE_KEY": "%RECAPTCHA_PRIVATE_KEY%",
                                "VERIFY_URL": "%VERIFY_URL%",
                                "PASSWORD_PIN": "%PASSWORD_PIN%",
                                "SENTRY_DSN": "%SENTRY_DSN%"
                                }
                            }
                        } > containers.json
                    ''' 
                bat '''
                    echo {
                        "containerName": "flask",
                        "containerPort": 8080
                    } > public-endpoint.json
                '''

                    // Deploy with environment variables
                    bat "aws lightsail create-container-service-deployment --service-name ${AWS_LIGHTSAIL_SERVICE} --containers file://containers.json --public-endpoint file://public-endpoint.json"
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


