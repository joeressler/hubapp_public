# syntax=docker/dockerfile:1
FROM python:3.12.3-bullseye

EXPOSE 8080

# Set the working directory in the container
WORKDIR /app

# Copy the dependencies file to the working directory
COPY requirements.txt .

# Install any dependencies
RUN pip install -r requirements.txt

ENV FLASK_APP=app

# Copy the content of the local src directory to the working directory
COPY . ./


# Specify the command to run on container start
CMD [ "flask", "run", "--host", "0.0.0.0", "--port", "8080" ]