import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../services/api';

const CHAT_CONTEXTS = ['wows', 'warcraft', 'lol'] as const;
type ChatContext = typeof CHAT_CONTEXTS[number];

interface GameContextInfo {
  value: ChatContext;
  label: string;
  description: string;
}

const GAME_CONTEXTS: GameContextInfo[] = [
  {
    value: 'wows',
    label: 'World of Warships',
    description: 'Get help with World of Warships gameplay, features, and support'
  },
  {
    value: 'warcraft',
    label: 'World of Warcraft',
    description: 'Ask questions about World of Warcraft game mechanics and support'
  },
  {
    value: 'lol',
    label: 'League of Legends',
    description: 'Get assistance with League of Legends gameplay and support'
  }
];

interface VoiceState {
  isRecording: boolean;
  audioStream: MediaStream | null;
  audioContext: AudioContext | null;
  processor: AudioWorkletNode | null;
}

const Chat: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [context, setContext] = useState<ChatContext>('wows');
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [descriptionState, setDescriptionState] = useState<'normal' | 'entering' | 'exiting'>('normal');
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isRecording: false,
    audioStream: null,
    audioContext: null,
    processor: null
  });
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Update the WebSocket connection URL to be environment-aware and include context
  const getWsUrl = (context: string) => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? `${window.location.host}`
      : 'localhost:8081';
    return `${protocol}//${baseUrl}/ws/${context}`;
  };

  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout;

    const connectWebSocket = () => {
      if (wsRef.current) {
        wsRef.current.close();
      }

      const wsUrl = getWsUrl(context);
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        setError(null);
      };
      
      wsRef.current.onmessage = async (event) => {
        try {
          console.log('Received WebSocket message:', event.data);
          const data = JSON.parse(event.data);
          if (data.error) {
            console.error('WebSocket error:', data.error);
            setError(data.error);
          } else if (data.text) {
            console.log('Setting transcribed text:', data.text);
            setMessage(data.text);
            setError(null);
            
            // Automatically submit the transcribed text
            setLoading(true);
            try {
              const result = await apiService.sendChatMessage(data.text, context, true);
              setResponse(result.response);
              if (result.audio) {
                await playResponse(result.audio);
              }
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Failed to send message');
            } finally {
              setLoading(false);
            }
          } else {
            console.warn('Received unexpected message format:', data);
          }
        } catch (e) {
          console.error('Error parsing WebSocket message:', e, 'Raw message:', event.data);
          setError('Failed to process server response');
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Failed to connect to voice service');
      };

      wsRef.current.onclose = () => {
        reconnectTimeout = setTimeout(connectWebSocket, 3000);
      };
    };

    connectWebSocket();

    return () => {
      clearTimeout(reconnectTimeout);
      wsRef.current?.close();
    };
  }, [context]); // Add context as a dependency

  const handleContextChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newContext = e.target.value as ChatContext;
    if (CHAT_CONTEXTS.includes(newContext as any)) {
      setDescriptionState('exiting');
      setTimeout(() => {
        setContext(newContext);
        setDescriptionState('entering');
        setTimeout(() => {
          setDescriptionState('normal');
        }, 50);
      }, 300);
    }
  };

  const playResponse = async (audioData: string) => {
    try {
      // Create a Blob from the base64 audio data
      const byteCharacters = atob(audioData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'audio/mp3' });

      // Create an object URL from the blob
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);

      // Clean up the object URL after playback
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (err) {
      console.error('Error playing audio:', err);
      setError('Failed to play audio response');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof message !== 'string' || !message.trim()) {
      setError('Please enter a valid message.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await apiService.sendChatMessage(message, context, true);
      setResponse(result.response);
      if (result.audio) {
        await playResponse(result.audio);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleAudioStop = async () => {
    if (audioChunksRef.current.length === 0) {
        console.log('No audio data recorded');
        return;
    }

    // Create an audio context to process the audio data
    const audioContext = new AudioContext({
        sampleRate: 16000
    });

    // Create a blob from the recorded chunks
    const audioBlob = new Blob(audioChunksRef.current, { 
        type: 'audio/wav' 
    });
    audioChunksRef.current = []; // Clear the chunks

    // Convert blob to array buffer
    const arrayBuffer = await audioBlob.arrayBuffer();
    
    // Decode the audio data
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Create a buffer with the correct sample rate and format
    const pcmBuffer = audioContext.createBuffer(1, audioBuffer.length, 16000);
    
    // Copy and convert the audio data
    const inputData = audioBuffer.getChannelData(0);
    const outputData = pcmBuffer.getChannelData(0);
    
    for (let i = 0; i < audioBuffer.length; i++) {
        outputData[i] = inputData[i];
    }
    
    // Convert to 16-bit PCM
    const pcmData = new Int16Array(pcmBuffer.length);
    const channelData = pcmBuffer.getChannelData(0);
    for (let i = 0; i < pcmBuffer.length; i++) {
        pcmData[i] = Math.max(-1, Math.min(1, channelData[i])) * 0x7FFF;
    }

    // Create WAV blob with the processed data
    const wavBlob = new Blob([pcmData.buffer], { type: 'audio/wav' });

    if (wsRef.current?.readyState === WebSocket.OPEN) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64data = reader.result;
            console.log('Sending audio data of size:', wavBlob.size);
            wsRef.current?.send(JSON.stringify({ 
                audio: base64data, 
                context,
                sampleRate: 16000
            }));
        };
        reader.readAsDataURL(wavBlob);
    } else {
        console.error('WebSocket is not connected');
        setError('Connection to voice service lost');
    }
  };

  const toggleRecording = async () => {
    if (!voiceState.isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
                sampleRate: 16000,
                channelCount: 1,
                echoCancellation: true,
                noiseSuppression: true
            } 
        });
        const mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = handleAudioStop;

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();

        setVoiceState({
          isRecording: true,
          audioStream: stream,
          audioContext: null,
          processor: null
        });

      } catch (err) {
        console.error('Recording error:', err);
        setError('Failed to start recording');
      }
    } else {
      mediaRecorderRef.current?.stop();
      voiceState.audioStream?.getTracks().forEach(track => track.stop());
      setVoiceState({
        isRecording: false,
        audioStream: null,
        audioContext: null,
        processor: null
      });
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Game Support Chat</h1>
      <p className="gradient-text" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        Get help with your favorite games using my GPT3.5 LLM RAG-powered support system.
      </p>
      
      <div className="form-container">
        <div className="chat-form-group">
          <label>Select Game:</label>
          <div className="chat-select-container">
            <select 
              value={context} 
              onChange={handleContextChange}
              className="chat-select"
            >
              {GAME_CONTEXTS.map((ctx) => (
                <option key={ctx.value} value={ctx.value}>
                  {ctx.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="chat-description-wrapper">
            {GAME_CONTEXTS.find(ctx => ctx.value === context)?.description && (
              <div className={`chat-description ${descriptionState !== 'normal' ? descriptionState : ''}`}>
                {GAME_CONTEXTS.find(ctx => ctx.value === context)?.description}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={toggleRecording}
          className="voice-button"
          style={{
            marginBottom: '1rem',
            background: voiceState.isRecording ? 'rgba(239, 68, 68, 0.2)' : 'rgba(56, 189, 248, 0.2)',
            border: `1px solid ${voiceState.isRecording ? 'rgba(239, 68, 68, 0.4)' : 'rgba(56, 189, 248, 0.4)'}`,
          }}
        >
          {voiceState.isRecording ? 'Stop Recording' : 'Start Recording your question!'}
        </button>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Your Question:</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="form-control"
              rows={4}
              placeholder="Type your question here..."
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>
          <button 
            type="submit" 
            className="ratingButton"
            disabled={loading || !message.trim()}
            style={{ width: '100%' }}
          >
            {loading ? 'Sending...' : 'Send Question'}
          </button>
        </form>

        {error && (
          <div className="alert alert-danger mt-3">
            {error}
          </div>
        )}
        
        {response && (
          <div style={{ marginTop: '2rem' }}>
            <h4 className="gradient-text">Response:</h4>
            <div style={{
              padding: '1rem',
              background: 'rgba(10, 15, 28, 0.5)',
              borderRadius: '8px',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              color: '#e2e8f0',
              marginTop: '1rem',
              whiteSpace: 'pre-wrap'
            }}>
              {response}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat; 