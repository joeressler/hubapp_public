package main

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
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

func logError(context string, err error, details string) {
	log.Printf("[%s] ERROR: %s - %s\n", time.Now().Format(time.RFC3339), context, err)
	if details != "" {
		log.Printf("Details: %s\n", details)
	}
}

// generateSpeech uses Google Translate's TTS service directly
func generateSpeech(text string, outputPath string) error {
	// Google Translate TTS URL
	baseURL := "https://translate.google.com/translate_tts"

	// Split text into chunks of 200 characters max (Google TTS limit)
	const chunkSize = 200
	textRunes := []rune(text)

	var audioChunks [][]byte

	for i := 0; i < len(textRunes); i += chunkSize {
		end := i + chunkSize
		if end > len(textRunes) {
			end = len(textRunes)
		}
		chunk := string(textRunes[i:end])

		// Create URL for this chunk
		params := url.Values{}
		params.Add("ie", "UTF-8")
		params.Add("tl", "en")
		params.Add("client", "tw-ob")
		params.Add("q", chunk)

		fullURL := baseURL + "?" + params.Encode()

		// Make request with appropriate headers
		req, err := http.NewRequest("GET", fullURL, nil)
		if err != nil {
			return fmt.Errorf("failed to create request: %v", err)
		}

		req.Header.Set("User-Agent", "Mozilla/5.0")
		req.Header.Set("Referer", "http://translate.google.com/")

		// Get the audio data
		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			return fmt.Errorf("failed to get audio: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			return fmt.Errorf("bad status: %s", resp.Status)
		}

		// Read the audio data
		audioData, err := io.ReadAll(resp.Body)
		if err != nil {
			return fmt.Errorf("failed to read audio data: %v", err)
		}

		audioChunks = append(audioChunks, audioData)

		// Small delay to avoid rate limiting
		time.Sleep(100 * time.Millisecond)
	}

	// Combine all chunks into a single MP3 file
	outputFile, err := os.Create(outputPath)
	if err != nil {
		return fmt.Errorf("failed to create output file: %v", err)
	}
	defer outputFile.Close()

	for _, chunk := range audioChunks {
		if _, err := outputFile.Write(chunk); err != nil {
			return fmt.Errorf("failed to write chunk: %v", err)
		}
	}

	return nil
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
			logError("Parsing TTS request", err, "")
			c.JSON(400, gin.H{"error": "Invalid request"})
			return
		}

		fmt.Println("TTS received text:", data.Text)

		// Create audio directory if it doesn't exist
		if err := os.MkdirAll("audio", 0755); err != nil {
			logError("Creating audio directory", err, "")
			c.JSON(500, gin.H{"error": "Failed to create audio directory"})
			return
		}

		// Generate unique filename
		fileName := fmt.Sprintf("audio/response_%d.mp3", time.Now().UnixNano())

		// Generate speech using Google TTS
		if err := generateSpeech(data.Text, fileName); err != nil {
			logError("Generating speech", err, "")
			c.JSON(500, gin.H{"error": "Failed to generate speech"})
			return
		}

		// Read the generated MP3 file
		audioData, err := os.ReadFile(fileName)
		if err != nil {
			logError("Reading MP3 file", err, "")
			c.JSON(500, gin.H{"error": "Failed to read MP3 file"})
			return
		}

		// Debug: Log file size and first few bytes
		fmt.Printf("Generated MP3 file size: %d bytes\n", len(audioData))
		if len(audioData) > 16 {
			fmt.Printf("First 16 bytes: %x\n", audioData[:16])
		}

		// Convert to base64 with proper data URI
		base64Audio := "data:audio/mp3;base64," + base64.StdEncoding.EncodeToString(audioData)

		// Clean up the file after sending
		defer func() {
			if err := os.Remove(fileName); err != nil {
				logError("Cleaning up file", err, fileName)
			} else {
				fmt.Printf("Cleaned up file: %s\n", fileName)
			}
		}()

		c.Header("Content-Type", "application/json")
		c.JSON(200, gin.H{"audio": base64Audio})
	})

	// Add a new endpoint to handle the conversion and forwarding of audio data
	r.POST("/voice/convert-and-transcribe", func(c *gin.Context) {
		fmt.Println("Received request to convert and transcribe audio")

		file, err := c.FormFile("audio")
		if err != nil {
			logError("Receiving audio file", err, "")
			c.JSON(http.StatusBadRequest, gin.H{"error": "No audio file received"})
			return
		}

		// Save the uploaded Ogg file temporarily
		tempOggPath := "/tmp/audio.ogg"
		tempWavPath := "/tmp/audio.wav"
		if err := c.SaveUploadedFile(file, tempOggPath); err != nil {
			logError("Saving audio file", err, fmt.Sprintf("Temp path: %s", tempOggPath))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save audio file"})
			return
		}
		fmt.Printf("Saved uploaded audio file to: %s\n", tempOggPath)

		// Convert Ogg to WAV using ffmpeg
		cmd := exec.Command("ffmpeg", "-i", tempOggPath, "-ar", "16000", tempWavPath)
		fmt.Printf("Executing command: %s\n", cmd.String())
		if err := cmd.Run(); err != nil {
			logError("Converting audio format", err, "")
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to convert audio format"})
			return
		}
		fmt.Printf("Converted Ogg to WAV: %s\n", tempWavPath)

		// Read the converted WAV file
		wavData, err := os.ReadFile(tempWavPath)
		if err != nil {
			logError("Reading converted audio file", err, "")
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read converted audio file"})
			return
		}
		fmt.Printf("Read WAV file of size: %d bytes\n", len(wavData))

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
			logError("Sending to backend", err, "")
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reach backend"})
			return
		}
		defer resp.Body.Close()

		// Forward the response from the backend to the client
		var result map[string]interface{}
		if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
			logError("Parsing backend response", err, "")
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse backend response"})
			return
		}
		c.JSON(resp.StatusCode, result)
	})

	// Start the server
	if err := r.Run(":8081"); err != nil {
		log.Fatalf("Failed to start server: %s\n", err)
	}

	go func() {
		for {
			cleanupOldFiles()
			time.Sleep(10 * time.Minute)
		}
	}()
}
