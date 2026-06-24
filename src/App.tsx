import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import './App.css'; // Add your styling here

// Initialize the Gemini API client
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

function App() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { role: 'model', text: 'Hello! I am your Gemini assistant. How can I help you today?' }
  ]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // 1. Add the user's message to the chat view immediately
    const userMessage = { role: 'user', text: input };
    setChatHistory((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // 2. Initialize the model (using gemini-3.5-flash for speedy & smart chat)
      const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

      // 3. Format history for the API requirements
      // The API expects 'user' and 'model' roles mapped correctly
      const apiHistory = chatHistory.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

      // 4. Start a multi-turn chat session with existing history
      const chat = model.startChat({ history: apiHistory });
      const result = await chat.sendMessage(input);
      const responseText = result.response.text();

      // 5. Append the AI's response to the UI
      setChatHistory((prev) => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      console.error("Error communicating with Gemini API:", error);
      setChatHistory((prev) => [
        ...prev,
        { role: 'model', text: "❌ Sorry, something went wrong. Please try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h2>Gemini AI Assistant</h2>
      </header>

      <div className="chat-window">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`message-wrapper ${msg.role}`}>
            <div className="message-bubble">
              {/* ReactMarkdown formats code blocks, bullet points, etc. */}
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && <div className="message-wrapper model loading">Thinking...</div>}
      </div>

      <form onSubmit={handleSend} className="input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

export default App;