import React, { useState } from 'react';
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
    <div className="chat-container">
      <h1>Game Support Chat</h1>
      <p className="lead">Get help with your favorite games using my AI-powered support system.</p>
      
      <div className="context-selector mb-4">
        <label className="form-label">Select Game: </label>
        <select 
          value={context} 
          onChange={(e) => setContext(e.target.value as ChatContext)}
          className="form-select"
          style={{ width: 'auto', display: 'inline-block', marginLeft: '10px' }}
        >
          {GAME_CONTEXTS.map((ctx) => (
            <option key={ctx.value} value={ctx.value}>
              {ctx.label}
            </option>
          ))}
        </select>
        
        {GAME_CONTEXTS.find(ctx => ctx.value === context)?.description && (
          <p className="text-muted mt-2">
            {GAME_CONTEXTS.find(ctx => ctx.value === context)?.description}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group mb-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="form-control"
            rows={4}
            placeholder="Type your question here..."
            style={{ width: '100%', maxWidth: '600px' }}
          />
        </div>
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading || !message.trim()}
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
        <div className="response-container mt-4">
          <h4>Response:</h4>
          <div className="response-text p-3 bg-light rounded">
            {response}
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat; 