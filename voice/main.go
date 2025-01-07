package main

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"
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

	// Add a new REST endpoint to handle audio data
	r.POST("/api/voice/transcribe", func(c *gin.Context) {
		var audioMessage struct {
			Audio      string `json:"audio"`
			Context    string `json:"context"`
			SampleRate int    `json:"sampleRate"`
		}

		if err := c.BindJSON(&audioMessage); err != nil {
			fmt.Println("Error parsing request:", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
			return
		}
		fmt.Println("Parsed audio message:", audioMessage)

		// Decode the base64 audio data
		audioData, err := base64.StdEncoding.DecodeString(strings.Split(audioMessage.Audio, ",")[1])
		if err != nil {
			fmt.Println("Error decoding audio data:", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid audio data"})
			return
		}
		fmt.Println("Decoded audio data size:", len(audioData))

		// Create a buffer for the WAV file
		wavBuffer := &bytes.Buffer{}
		writeWAVHeader(wavBuffer, len(audioData), audioMessage.SampleRate)
		wavBuffer.Write(audioData)

		// Forward to Flask backend
		body := &bytes.Buffer{}
		writer := multipart.NewWriter(body)
		part, _ := writer.CreateFormFile("audio", "audio.wav")
		part.Write(wavBuffer.Bytes())
		writer.WriteField("context", audioMessage.Context)
		writer.Close()

		resp, err := http.Post(
			"http://backend:8080/api/voice/transcribe",
			writer.FormDataContentType(),
			body,
		)
		if err != nil {
			fmt.Println("Error forwarding to backend:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reach backend"})
			return
		}

		// Read and parse the response
		var result struct {
			Text  string `json:"text"`
			Error string `json:"error"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
			fmt.Println("Error parsing backend response:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse backend response"})
			resp.Body.Close()
			return
		}
		resp.Body.Close()

		fmt.Printf("Transcription result: %+v\n", result)

		// Send the transcription back to the client
		if result.Error != "" {
			c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error})
		} else {
			c.JSON(http.StatusOK, gin.H{
				"text":    result.Text,
				"context": audioMessage.Context,
			})
		}
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

// Helper function to write WAV header
func writeWAVHeader(w io.Writer, dataSize int, sampleRate int) {
	// RIFF header
	w.Write([]byte("RIFF"))
	writeInt32(w, uint32(dataSize+36)) // File size - 8
	w.Write([]byte("WAVE"))

	// fmt chunk
	w.Write([]byte("fmt "))
	writeInt32(w, 16)                   // Chunk size
	writeInt16(w, 1)                    // Audio format (PCM)
	writeInt16(w, 1)                    // Num channels
	writeInt32(w, uint32(sampleRate))   // Sample rate
	writeInt32(w, uint32(sampleRate*2)) // Byte rate
	writeInt16(w, 2)                    // Block align
	writeInt16(w, 16)                   // Bits per sample

	// data chunk
	w.Write([]byte("data"))
	writeInt32(w, uint32(dataSize))
}

func writeInt16(w io.Writer, val uint16) {
	w.Write([]byte{byte(val), byte(val >> 8)})
}

func writeInt32(w io.Writer, val uint32) {
	w.Write([]byte{byte(val), byte(val >> 8), byte(val >> 16), byte(val >> 24)})
}
