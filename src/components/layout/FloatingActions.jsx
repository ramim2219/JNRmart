import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Bot, Send, X } from 'lucide-react';

// UI-only chatbot. Replace demoReply with your Laravel/AI API in a later step.
function demoReply(message) {
  const text = message.toLowerCase();
  if (/delivery|shipping|ডেলিভারি/.test(text)) return 'Delivery information will be available once JNRmart is connected to the backend.';
  if (/order|track|অর্ডার/.test(text)) return 'Order tracking will be available after the order API is connected.';
  if (/return|refund|রিটার্ন/.test(text)) return 'Return and refund details will be added when the store policies are finalized.';
  return 'Welcome to JNRmart! This is a demo chat interface. Our AI assistant will be enabled after backend integration.';
}

export default function FloatingActions() {
  const [showTop, setShowTop] = useState(false);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', text: 'Hi! Welcome to JNRmart. Ask about delivery, orders or returns. (Demo mode)' },
  ]);
  const bottomRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setShowTop(window.scrollY > 250);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [open, messages]);

  const sendMessage = (event) => {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    setMessages((current) => [
      ...current,
      { id: Date.now(), role: 'user', text },
      { id: Date.now() + 1, role: 'assistant', text: demoReply(text) },
    ]);
    setInput('');
  };

  return (
    <div className="floating-actions">
      {open && (
        <section className="chat-panel" role="dialog" aria-label="JNRmart chat assistant">
          <div className="chat-panel-header">
            <div className="chat-panel-title"><Bot size={23} /><div><strong>JNRmart Assistant</strong><small>Demo chat · API coming later</small></div></div>
            <button type="button" className="chat-close" onClick={() => setOpen(false)} aria-label="Close chat"><X size={19} /></button>
          </div>
          <div className="chat-messages" aria-live="polite">
            {messages.map((message) => <p key={message.id} className={`chat-bubble chat-bubble--${message.role}`}>{message.text}</p>)}
            <div ref={bottomRef} />
          </div>
          <form className="chat-input-form" onSubmit={sendMessage}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your message..." aria-label="Chat message" maxLength={500} />
            <button type="submit" disabled={!input.trim()} aria-label="Send message"><Send size={18} /></button>
          </form>
        </section>
      )}
      {showTop && (
        <button type="button" className="floating-button back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top" title="Back to top"><ArrowUp size={21} /></button>
      )}
      <button type="button" className="floating-button chatbot-toggle" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Close AI chat' : 'Open AI chat'} aria-expanded={open} title="JNRmart chat"><Bot size={23} /></button>
    </div>
  );
}
