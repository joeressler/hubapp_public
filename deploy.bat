docker build -t flask-container .

aws lightsail push-container-image --service-name flask-service --label flask-container --image flask-container

aws lightsail create-container-service-deployment --service-name flask-service --containers file://containers.json --public-endpoint file://public-endpoint.json
