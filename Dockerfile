# syntax=docker/dockerfile:1
FROM python:slim-bullseye

# By default, listen on port 5000
EXPOSE 5000

# Set the working directory in the container
WORKDIR /app


RUN set -e; \
        apk add --no-cache --virtual .build-deps \
                gcc \
                build-base \
                libc-dev \
                linux-headers \
                mariadb-dev \
                python3-dev \
                postgresql-dev \
        ;
# Copy the dependencies file to the working directory
COPY requirements.txt .

# Install any dependencies
RUN pip install -r requirements.txt


ENV FLASK_APP=app

# Copy the content of the local src directory to the working directory
COPY . ./


# Specify the command to run on container start
CMD [ "flask", "run", "--host", "0.0.0.0", "--port", "5000" ]