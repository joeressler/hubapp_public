import React, { useState, useEffect } from 'react';
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

const Chat: React.FC = () => {
  const [message, setMessage] = useState('');
  const [context, setContext] = useState<ChatContext>('wows');
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [descriptionState, setDescriptionState] = useState<'normal' | 'entering' | 'exiting'>('normal');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const result = await apiService.sendChatMessage(message, context);
      setResponse(result.response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setLoading(false);
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