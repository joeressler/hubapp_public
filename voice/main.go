package main

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"mime/multipart"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	htgotts "github.com/hegedustibor/htgo-tts"
)

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		if origin == "" {
			origin = "*"
		}

		c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

// Function to clean up old audio files
func cleanupOldFiles() {
	audioDir := "audio"
	filepath.Walk(audioDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		// Delete files older than 5 minutes
		if time.Since(info.ModTime()) > 5*time.Minute {
			os.Remove(path)
		}
		return nil
	})
}

func main() {
	r := gin.Default()

	// Use CORS middleware
	r.Use(corsMiddleware())

	// TTS endpoint
	r.POST("/tts", func(c *gin.Context) {
		var data struct {
			Text string `json:"text"`
		}
		if err := c.BindJSON(&data); err != nil {
			c.JSON(400, gin.H{"error": "Invalid request"})
			return
		}

		fmt.Println("TTS received text:", data.Text)

		fileName := fmt.Sprintf("response_%d", time.Now().UnixNano())
		speech := htgotts.Speech{Folder: "audio", Language: "en"}
		filePath, err := speech.CreateSpeechFile(data.Text, fileName)
		if err != nil {
			fmt.Println("Error creating speech file:", err)
			c.JSON(500, gin.H{"error": "Failed to create speech file"})
			return
		}

		fmt.Printf("Created speech file at: %s\n", filePath)

		// Read the file and convert to base64
		audioData, err := os.ReadFile(filePath)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to read audio file"})
			return
		}

		// Convert to base64 and send as JSON
		base64Audio := base64.StdEncoding.EncodeToString(audioData)
		c.JSON(200, gin.H{"audio": base64Audio})

		// Clean up the file
		os.Remove(filePath)
	})

	// Add a new endpoint to handle the conversion and forwarding of audio data
	r.POST("/api/voice/convert-and-transcribe", func(c *gin.Context) {
		fmt.Println("Received request to convert and transcribe audio")

		file, err := c.FormFile("audio")
		if err != nil {
			fmt.Println("Error receiving audio file:", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "No audio file received"})
			return
		}

		// Save the uploaded Ogg file temporarily
		tempOggPath := "/tmp/audio.ogg"
		tempWavPath := "/tmp/audio.wav"
		if err := c.SaveUploadedFile(file, tempOggPath); err != nil {
			fmt.Println("Error saving audio file:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save audio file"})
			return
		}

		// Convert Ogg to WAV using ffmpeg
		cmd := exec.Command("ffmpeg", "-i", tempOggPath, tempWavPath)
		if err := cmd.Run(); err != nil {
			fmt.Println("Error converting audio format:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to convert audio format"})
			return
		}

		// Read the converted WAV file
		wavData, err := os.ReadFile(tempWavPath)
		if err != nil {
			fmt.Println("Error reading converted audio file:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read converted audio file"})
			return
		}

		// Create a multipart form to send to the Flask backend
		body := &bytes.Buffer{}
		writer := multipart.NewWriter(body)
		part, _ := writer.CreateFormFile("audio", "audio.wav")
		part.Write(wavData)
		writer.WriteField("context", c.PostForm("context"))
		writer.Close()

		// Send the WAV file to the Flask backend
		resp, err := http.Post(
			"http://backend:8080/api/voice/transcribe",
			writer.FormDataContentType(),
			body,
		)
		if err != nil {
			fmt.Println("Error sending to backend:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reach backend"})
			return
		}
		defer resp.Body.Close()

		// Forward the response from the backend to the client
		var result map[string]interface{}
		if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
			fmt.Println("Error parsing backend response:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse backend response"})
			return
		}
		c.JSON(resp.StatusCode, result)
	})

	// Start the server
	if err := r.Run(":8081"); err != nil {
		panic(err)
	}

	go func() {
		for {
			cleanupOldFiles()
			time.Sleep(10 * time.Minute)
		}
	}()
}
