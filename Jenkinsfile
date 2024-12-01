pipeline {
    agent any  // Use Jenkins' default agent
    
    environment {
        DOCKER_IMAGE = 'flask-container'
        GCR_IMAGE = 'gcr.io/lively-machine-427223-j0/flask-container'
        VERSION = '1.00'
        AWS_LIGHTSAIL_SERVICE = 'flask-service'
    }
    
    stages {
        stage('Build and Tag') {
            steps {
                script {
                    docker.build(DOCKER_IMAGE)
                }
                bat "docker tag ${DOCKER_IMAGE} ${GCR_IMAGE}:${VERSION}"
            }
        }
        
        stage('Deploy to AWS Lightsail') {
            steps {
                withAWS(credentials: 'd03bf61e-64e0-4efb-b6cc-9907081a93dd', region: 'us-east-1') {
                    awsLightsail(
                        serviceAction: 'pushContainerImage',
                        serviceName: AWS_LIGHTSAIL_SERVICE,
                        label: DOCKER_IMAGE,
                        image: DOCKER_IMAGE
                    )
                    
                    awsLightsail(
                        serviceAction: 'createContainerServiceDeployment',
                        serviceName: AWS_LIGHTSAIL_SERVICE,
                        containersJson: readFile('containers.json'),
                        publicEndpointJson: readFile('public-endpoint.json')
                    )
                }
            }
        }
        
        stage('Deploy to Google Cloud Run') {
            steps {
                withCredentials([file(credentialsId: 'google-cloud-key', variable: 'GC_KEY')]) {
                    step([$class: 'GoogleCloudBuildStep',
                        credentialsId: 'google-cloud-key',
                        serviceAccountKeyFile: env.GC_KEY,
                        cloudSdkVersion: 'latest',
                        steps: [
                            // Authenticate with GCR
                            [$class: 'DockerAuthStep'],
                            // Push the image
                            [$class: 'DockerPushStep',
                             image: "${GCR_IMAGE}:${VERSION}"],
                            // Deploy to Cloud Run
                            [$class: 'CloudRunDeployStep',
                             image: "${GCR_IMAGE}:${VERSION}",
                             serviceName: DOCKER_IMAGE,
                             platform: 'managed']
                        ]
                    ])
                }
            }
        }
    }
    
    post {
        always {
            script {
                docker.image(DOCKER_IMAGE).remove(force: true)
                docker.image("${GCR_IMAGE}:${VERSION}").remove(force: true)
            }
        }
    }
}

