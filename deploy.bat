CMD /C docker build -t flask-container .

CMD /C aws lightsail push-container-image --service-name flask-service --label flask-container --image flask-container

CMD /C aws lightsail create-container-service-deployment --service-name flask-service --containers file://containers.json --public-endpoint file://public-endpoint.json

CMD /C docker tag flask-container gcr.io/lively-machine-427223-j0/flask-container:1.00

CMD /C docker push gcr.io/lively-machine-427223-j0/flask-container:1.00

CMD /C gcloud run deploy flask-container --image=gcr.io/lively-machine-427223-j0/flask-container:1.00