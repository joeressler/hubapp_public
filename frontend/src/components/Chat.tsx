import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { apiService } from '../services/api';

const CHAT_CONTEXTS = ['wows', 'warcraft', 'lol'] as const;
type ChatContext = (typeof CHAT_CONTEXTS)[number];

interface GameContextInfo {
  value: ChatContext;
  label: string;
  short: string;
  description: string;
  prompts: string[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: number;
}

type ErrorKind = 'generic' | 'rate_limit' | 'auth' | 'voice';

const GAME_CONTEXTS: GameContextInfo[] = [
  {
    value: 'wows',
    label: 'World of Warships',
    short: 'WoWS',
    description: 'FAQ help for ships, modes, and account support.',
    prompts: [
      'How do I reset my World of Warships password?',
      'What is the difference between Random and Ranked battles?',
      'How do premium ships work?',
    ],
  },
  {
    value: 'warcraft',
    label: 'World of Warcraft',
    short: 'WoW',
    description: 'Mechanics and support answers grounded in WoW FAQ data.',
    prompts: [
      'How do I restore a deleted character?',
      'What should I know about Mythic+ for beginners?',
      'How do I transfer a character between realms?',
    ],
  },
  {
    value: 'lol',
    label: 'League of Legends',
    short: 'LoL',
    description: 'Gameplay and support guidance from League FAQ material.',
    prompts: [
      'How do I appeal an unfair ban?',
      'What is the difference between Ranked Solo and Flex?',
      'How do I report a player in-game?',
    ],
  },
];

const emptyThreads = (): Record<ChatContext, ChatMessage[]> => ({
  wows: [],
  warcraft: [],
  lol: [],
});

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function extractChatError(err: unknown): { message: string; kind: ErrorKind } {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const data = err.response?.data as { error?: string; code?: string } | undefined;
    if (status === 401) {
      return {
        message: 'Session expired. Please log in again to continue chatting.',
        kind: 'auth',
      };
    }
    if (data?.code === 'rate_limit' || status === 503) {
      return {
        message:
          data?.error ||
          'The AI service is temporarily rate-limited. Wait a moment, then try again.',
        kind: 'rate_limit',
      };
    }
    if (data?.error) {
      return { message: data.error, kind: 'generic' };
    }
  }
  if (err instanceof Error && err.message) {
    return { message: err.message, kind: 'generic' };
  }
  return { message: 'Failed to get a response. Please try again.', kind: 'generic' };
}

function decodeAudioBase64(audioData: string): Blob {
  const base64Data = audioData.includes(',') ? audioData.split(',')[1] : audioData;
  const byteCharacters = atob(base64Data);
  const byteArray = new Uint8Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i += 1) {
    byteArray[i] = byteCharacters.charCodeAt(i);
  }
  return new Blob([byteArray], { type: 'audio/mp3' });
}

const Chat: React.FC = () => {
  const [message, setMessage] = useState('');
  const [context, setContext] = useState<ChatContext>('wows');
  const [threads, setThreads] = useState(emptyThreads);
  const [error, setError] = useState<string | null>(null);
  const [errorKind, setErrorKind] = useState<ErrorKind>('generic');
  const [loading, setLoading] = useState(false);
  const [sttProcessing, setSttProcessing] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const threadEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const contextRef = useRef(context);
  const voiceEnabledRef = useRef(voiceEnabled);
  const loadingRef = useRef(false);
  const sendQuestionRef = useRef<(rawText: string) => Promise<void>>(async () => undefined);

  contextRef.current = context;
  voiceEnabledRef.current = voiceEnabled;

  const activeContext = useMemo(
    () => GAME_CONTEXTS.find((entry) => entry.value === context) ?? GAME_CONTEXTS[0],
    [context]
  );
  const messages = threads[context];
  const busy = loading || sttProcessing || isRecording;

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading, sttProcessing]);

  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stop();
      audioStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const appendMessage = (ctx: ChatContext, entry: Omit<ChatMessage, 'id' | 'createdAt'>) => {
    const next: ChatMessage = {
      ...entry,
      id: createId(),
      createdAt: Date.now(),
    };
    setThreads((prev) => ({
      ...prev,
      [ctx]: [...prev[ctx], next],
    }));
    return next;
  };

  const playResponse = async (audioData: string) => {
    if (!audioData) {
      throw new Error('No audio data received');
    }
    const blob = decodeAudioBase64(audioData);
    if (blob.size === 0) {
      throw new Error('Created audio blob is empty');
    }
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);
    await new Promise<void>((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        reject(new Error(audio.error?.message || 'Failed to load audio'));
      };
      audio.play().catch(reject);
    });
  };

  const sendQuestion = async (rawText: string) => {
    const text = rawText.trim();
    if (!text || loadingRef.current) return;

    const active = contextRef.current;
    setError(null);
    setMessage('');
    appendMessage(active, { role: 'user', content: text });
    loadingRef.current = true;
    setLoading(true);

    try {
      const result = await apiService.sendChatMessage(
        text,
        active,
        voiceEnabledRef.current
      );
      appendMessage(active, { role: 'assistant', content: result.response });
      if (voiceEnabledRef.current && result.audio) {
        await playResponse(result.audio);
      }
    } catch (err) {
      const parsed = extractChatError(err);
      setError(parsed.message);
      setErrorKind(parsed.kind);
      appendMessage(active, {
        role: 'system',
        content: parsed.message,
      });
    } finally {
      loadingRef.current = false;
      setLoading(false);
      textareaRef.current?.focus();
    }
  };
  sendQuestionRef.current = sendQuestion;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendQuestion(message);
  };

  const handleContextChange = (next: ChatContext) => {
    if (next === context || busy) return;
    setContext(next);
    setError(null);
  };

  const clearThread = () => {
    if (busy) return;
    setThreads((prev) => ({ ...prev, [context]: [] }));
    setError(null);
  };

  const handleAudioStop = async () => {
    if (audioChunksRef.current.length === 0) {
      setError('No audio captured. Hold the mic a moment longer, then stop.');
      setErrorKind('voice');
      return;
    }

    setSttProcessing(true);
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/ogg' });
    audioChunksRef.current = [];

    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.ogg');
    formData.append('context', contextRef.current);

    try {
      const response = await apiService.sendAudioToVoiceService(formData);
      const transcript = response.text?.trim();
      if (!transcript) {
        setError('Could not transcribe that clip. Try again in a quieter spot.');
        setErrorKind('voice');
        return;
      }
      setMessage(transcript);
      await sendQuestionRef.current(transcript);
    } catch {
      setError('Voice transcription failed. Check the voice service and try again.');
      setErrorKind('voice');
    } finally {
      setSttProcessing(false);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      audioStreamRef.current?.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
      setIsRecording(false);
      return;
    }

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
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      mediaRecorder.onstop = () => {
        void handleAudioStop();
      };

      mediaRecorderRef.current = mediaRecorder;
      audioStreamRef.current = stream;
      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
    } catch {
      setError('Microphone access was blocked. Allow audio permissions to use voice input.');
      setErrorKind('voice');
    }
  };

  return (
    <div className="chat-page">
      <header className="chat-header">
        <div>
          <p className="chat-kicker">Game Help Bot</p>
          <h1 className="chat-title">FAQ RAG console</h1>
          <p className="chat-lede">
            Ask support-style questions against indexed FAQ data for WoWS, WoW, or LoL.
            Availability can dip when OpenAI rate limits hit.
          </p>
        </div>
        <div className="chat-header-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={clearThread}
            disabled={busy || messages.length === 0}
          >
            Clear thread
          </button>
        </div>
      </header>

      <div className="chat-context-tabs" role="tablist" aria-label="Game corpus">
        {GAME_CONTEXTS.map((entry) => {
          const selected = entry.value === context;
          return (
            <button
              key={entry.value}
              type="button"
              role="tab"
              aria-selected={selected}
              className={`chat-context-tab${selected ? ' is-active' : ''}`}
              onClick={() => handleContextChange(entry.value)}
              disabled={busy && !selected}
            >
              <span className="chat-context-short">{entry.short}</span>
              <span className="chat-context-label">{entry.label}</span>
            </button>
          );
        })}
      </div>
      <p className="chat-context-desc">{activeContext.description}</p>

      <section className="chat-shell" aria-label="Conversation">
        <div className="chat-thread" aria-live="polite">
          {messages.length === 0 && !loading && !sttProcessing ? (
            <div className="chat-empty">
              <div className="chat-empty-rings" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <h2>Ready when you are</h2>
              <p>
                Pick a corpus above, then send a question or try a starter prompt for{' '}
                {activeContext.short}.
              </p>
              <div className="chat-prompt-list">
                {activeContext.prompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className="chat-prompt"
                    onClick={() => void sendQuestion(prompt)}
                    disabled={busy}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <ul className="chat-message-list">
                {messages.map((entry) => (
                  <li
                    key={entry.id}
                    className={`chat-message chat-message--${entry.role}`}
                  >
                    <div className="chat-message-meta">
                      {entry.role === 'user'
                        ? 'You'
                        : entry.role === 'assistant'
                          ? 'Help Bot'
                          : 'System'}
                    </div>
                    <div className="chat-message-body">{entry.content}</div>
                  </li>
                ))}
                {(loading || sttProcessing) && (
                  <li className="chat-message chat-message--assistant chat-message--pending">
                    <div className="chat-message-meta">
                      {sttProcessing ? 'Voice pipeline' : 'Help Bot'}
                    </div>
                    <div className="chat-message-body chat-pending">
                      <span className="chat-pending-dot" />
                      <span className="chat-pending-dot" />
                      <span className="chat-pending-dot" />
                      <span>
                        {sttProcessing ? 'Transcribing speech…' : 'Querying vector index…'}
                      </span>
                    </div>
                  </li>
                )}
              </ul>
              <div ref={threadEndRef} />
            </>
          )}
        </div>

        {error && (
          <div
            className={`chat-banner${
              errorKind === 'rate_limit' ? ' chat-banner--warn' : ' chat-banner--danger'
            }`}
            role="alert"
          >
            <strong>
              {errorKind === 'rate_limit'
                ? 'Rate limited'
                : errorKind === 'auth'
                  ? 'Auth required'
                  : errorKind === 'voice'
                    ? 'Voice issue'
                    : 'Request failed'}
            </strong>
            <span>{error}</span>
          </div>
        )}

        <form className="chat-composer" onSubmit={handleSubmit}>
          <div className="chat-composer-toolbar">
            <label className="chat-toggle">
              <input
                type="checkbox"
                checked={voiceEnabled}
                onChange={(e) => setVoiceEnabled(e.target.checked)}
                disabled={busy}
              />
              <span>Speak replies (TTS)</span>
            </label>
            <button
              type="button"
              className={`btn${isRecording ? ' btn-danger-soft' : ' btn-ghost'}`}
              onClick={() => void toggleRecording()}
              disabled={loading || sttProcessing}
              aria-pressed={isRecording}
            >
              {isRecording ? 'Stop recording' : 'Voice question'}
            </button>
          </div>

          <label className="visually-hidden" htmlFor="chat-input">
            Your question
          </label>
          <textarea
            id="chat-input"
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="form-control chat-input"
            rows={3}
            placeholder={`Ask something about ${activeContext.label}…`}
            disabled={loading || sttProcessing}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void sendQuestion(message);
              }
            }}
          />

          <div className="chat-composer-footer">
            <p className="chat-hint">Enter to send · Shift+Enter for newline</p>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={busy || !message.trim()}
            >
              {loading ? 'Sending…' : 'Send'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default Chat;
