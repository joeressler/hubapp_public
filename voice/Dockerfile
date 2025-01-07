FROM golang:1.23.4-alpine3.19

WORKDIR /app

# Install Vosk dependencies and ffmpeg with libmp3lame
RUN apk add --no-cache \
    gcc \
    musl-dev \
    pkgconfig \
    alsa-lib-dev \
    alsa-utils \
    wget \
    unzip \
    ffmpeg \
    lame

# Create audio directory
RUN mkdir -p /app/audio && chmod 777 /app/audio

# Copy Go module files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the source code
COPY . .

# Build the application
RUN CGO_ENABLED=1 go build -o main .

# Expose port 8081
EXPOSE 8081

# Run the application
CMD ["./main"] 