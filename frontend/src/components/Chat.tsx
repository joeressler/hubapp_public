import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { apiService } from '../services/api';
import { RootState } from '../store';

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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [sttProcessing, setSttProcessing] = useState(false);
  const [chatbotProcessing, setChatbotProcessing] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);

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
      // Add validation for audio data
      if (!audioData) {
        throw new Error('No audio data received');
      }

      console.log('Audio data preview:', audioData.substring(0, 100));

      // Create a Blob directly from the base64 data
      let blob;
      if (audioData.startsWith('data:audio/mp3;base64,')) {
        // Data is already in data URI format
        const base64Data = audioData.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        blob = new Blob([byteArray], { type: 'audio/mp3' });
      } else {
        // Handle plain base64 data
        const byteCharacters = atob(audioData);
        const byteNumbers = new Array(byteCharacters.length);
        
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        blob = new Blob([byteArray], { type: 'audio/mp3' });
      }

      // Validate blob size
      if (blob.size === 0) {
        throw new Error('Created audio blob is empty');
      }
      console.log('Created blob size:', blob.size, 'bytes');

      // Create an object URL from the blob
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio();

      // Add error handling for audio loading
      audio.onerror = ((e: Event | string) => {
        const target = (e instanceof Event ? e.currentTarget : audio) as HTMLAudioElement;
        console.error('Audio loading error:', {
          code: target.error?.code,
          message: target.error?.message
        });
        URL.revokeObjectURL(audioUrl);
        setError(`Failed to load audio: ${target.error?.message || 'Unknown error'}`);
      });

      // Clean up the object URL after playback
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };

      // Set the source and load the audio
      audio.src = audioUrl;
      await audio.load();

      // Log when audio is loaded
      audio.onloadedmetadata = () => {
        console.log('Audio metadata loaded. Duration:', audio.duration);
      };

      // Attempt to play the audio
      await audio.play();
    } catch (err) {
      console.error('Error playing audio:', err);
      setError(`Failed to play audio response: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setError(null);
    setLoading(true);
    setChatbotProcessing(true);
    
    try {
      const result = await apiService.sendChatMessage(message, context, true);
      setResponse(result.response);
      if (result.audio) {
        await playResponse(result.audio);
      }
      setMessage('');  // Clear the input only on success
    } catch (err) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : 'Failed to get response. Please try again.');
    } finally {
      setLoading(false);
      setChatbotProcessing(false);
    }
  };

  const handleAudioStop = async () => {
    if (audioChunksRef.current.length === 0) {
      console.log('No audio data recorded');
      setError('No audio data to send');
      return;
    }

    console.log('Processing recorded audio data');
    setSttProcessing(true); // Start STT processing animation

    // Create a blob from the recorded chunks
    const audioBlob = new Blob(audioChunksRef.current, {
      type: 'audio/ogg',
    });
    audioChunksRef.current = []; // Clear the chunks

    console.log('Audio blob created:', audioBlob);

    // Create a FormData object to send the audio file
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.ogg');
    formData.append('context', context);

    try {
      const response = await apiService.sendAudioToVoiceService(formData);
      console.log('Received transcription:', response);
      setMessage(response.text);
      var form = document.getElementById('chat-form') as HTMLFormElement;
      var submitButton = document.getElementById('submit-button') as HTMLButtonElement;
      form.requestSubmit(submitButton);
    } catch (error) {
      console.error('Error transcribing audio:', error);
      setError('Failed to transcribe audio');
    } finally {
      setSttProcessing(false); // End STT processing animation
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
            noiseSuppression: true,
          },
        });
        const mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
            console.log('Audio chunk recorded:', event.data);
          }
        };

        mediaRecorder.onstop = handleAudioStop;

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        console.log('Recording started');

        setVoiceState({
          isRecording: true,
          audioStream: stream,
          audioContext: null,
          processor: null,
        });
      } catch (err) {
        console.error('Recording error:', err);
        setError('Failed to start recording');
      }
    } else {
      mediaRecorderRef.current?.stop();
      voiceState.audioStream?.getTracks().forEach((track) => track.stop());
      setVoiceState({
        isRecording: false,
        audioStream: null,
        audioContext: null,
        processor: null,
      });
      console.log('Recording stopped');
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Game Support Chat</h1>
      <p className="gradient-text" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        Get help with your favorite games using my ChatGPT LLM RAG-powered support system.
      </p>

      <div className="feature-note" style={{ textAlign: 'center', marginBottom: '1rem', color: '#38bdf8' }}>
        Try out our new Go microservice-backed feature: Speak to the bot and have it talk back to you!
      </div>
      
      <div className="form-container crystal-card">
        <div className="chat-form-group">
          <label>Select Game:</label>
          <div className="chat-select-container">
            <select 
              value={context} 
              onChange={handleContextChange}
              className="chat-select"
              disabled={loading || sttProcessing}
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
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
          disabled={loading || chatbotProcessing}
        >
          {voiceState.isRecording ? 'Stop Recording' : 'Start Recording your question!'}
        </button>

        <form id="chat-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Your Question:</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="form-control"
              rows={4}
              placeholder="Type your question here..."
              style={{ 
                width: '100%', 
                resize: 'vertical',
                opacity: loading ? 0.7 : 1
              }}
              disabled={loading || sttProcessing || chatbotProcessing}
            />
          </div>
          <button 
            type="submit" 
            className="ratingButton"
            disabled={loading || !message.trim() || sttProcessing || chatbotProcessing}
            style={{ 
              width: '100%',
              opacity: (loading || !message.trim() || sttProcessing || chatbotProcessing) ? 0.7 : 1,
              cursor: (loading || !message.trim() || sttProcessing || chatbotProcessing) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Sending...' : 'Send Question'}
          </button>
        </form>

        {error && (
          <div className="alert alert-danger" style={{ marginTop: '1rem' }}>
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

        {(sttProcessing || chatbotProcessing) && (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <div className="loading-spinner" />
            <p style={{ marginTop: '0.5rem', color: '#94a3b8' }}>
              {sttProcessing ? 'Processing speech...' : 'Getting response...'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat; 