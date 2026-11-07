
import { useEffect, useRef, useState } from 'react';
import {
  ArrowUp,
  Bot,
  Send,
  X,
} from 'lucide-react';

import '../../styles/floating-actions.css';

// =========================================
// Custom JNRmart Chat Icon
// =========================================


function JNRChatIcon() {
  return (
    <svg
      viewBox="0 0 64 64"
      width="54"
      height="54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* JNRmart Coral Background */}
      <path
        d="M32 3C16 3 3 16 3 32s13 29 29 29h17a12 12 0 0 0 12-12V32C61 16 48 3 32 3Z"
        fill="#E66B58"
      />

      {/* White Chat Bubble */}
      <path
        d="M32 17c-9 0-16 6.4-16 14.3 0 3.4 1.3 6.5 3.6 8.9l-1.3 5.1c-.2.8.6 1.4 1.4 1.1l5.2-2.1c2.2.9 4.6 1.3 7.1 1.3 8.8 0 16-6.4 16-14.3S40.8 17 32 17Z"
        fill="#FFFFFF"
      />

      {/* Chat Lines */}
      <rect
        x="25"
        y="28"
        width="14"
        height="3"
        rx="1.5"
        fill="#E66B58"
      />

      <rect
        x="25"
        y="35"
        width="14"
        height="3"
        rx="1.5"
        fill="#E66B58"
      />
    </svg>
  );
}


// =========================================
// Demo Chat Response
// =========================================

function demoReply(message) {
  const text = message.toLowerCase();

  if (/delivery|shipping|ডেলিভারি/.test(text)) {
    return 'Thank you for your interest! Delivery information will be available once our store API is connected.';
  }

  if (/order|track|অর্ডার/.test(text)) {
    return 'You will be able to track your orders directly through JNRmart once order tracking is connected.';
  }

  if (/return|refund|রিটার্ন/.test(text)) {
    return 'Our return and refund information will be available here after the store policies are finalized.';
  }

  return 'Thank you for contacting JNRmart! This is currently a demo assistant. Live AI support will be available after backend integration.';
}

// =========================================
// Quick Questions
// =========================================

const QUICK_QUESTIONS = [
  'Delivery information',
  'Track my order',
  'Returns & Refunds',
];

// =========================================
// Floating Actions Component
// =========================================

export default function FloatingActions() {
  const [showTop, setShowTop] = useState(false);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      text: 'Hello! 👋 Welcome to JNRmart. How can I help you today?',
    },
  ]);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const messageId = useRef(1);

  // Back To Top Visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowTop(window.scrollY > 250);
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Auto Scroll To Latest Message
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  }, [open, messages]);

  // Focus Input + Escape Key
  useEffect(() => {
    if (!open) return;

    inputRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  // Send Message
  const sendMessage = (message) => {
    const text = message.trim();

    if (!text) return;

    const userId = ++messageId.current;
    const assistantId = ++messageId.current;

    setMessages((current) => [
      ...current,
      {
        id: userId,
        role: 'user',
        text,
      },
      {
        id: assistantId,
        role: 'assistant',
        text: demoReply(text),
      },
    ]);

    setInput('');
  };

  // Form Submit
  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(input);
  };

  // Toggle Chat
  const toggleChat = () => {
    setOpen((previous) => !previous);
  };

  // Back To Top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className="floating-actions">

      {/* =================================
          Chat Window
      ================================= */}

      {open && (
        <section
          className="chat-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="chat-title"
        >

          {/* Chat Header */}
          <div className="chat-panel-header">

            <div className="chat-header-info">

              <div className="chat-avatar">
                <Bot size={23} />
              </div>

              <div className="chat-header-text">

                <strong id="chat-title">
                  JNRmart Assistant
                </strong>

                <span>
                  <i className="chat-status-dot" />
                  Demo Assistant
                </span>

              </div>

            </div>

            <button
              type="button"
              className="chat-close"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <X size={20} />
            </button>

          </div>

          {/* Chat Messages */}
          <div
            className="chat-messages"
            aria-live="polite"
            aria-relevant="additions text"
          >

            <div className="chat-date-label">
              Welcome to JNRmart
            </div>

            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-message chat-message--${message.role}`}
              >

                {message.role === 'assistant' && (
                  <div className="chat-message-avatar">
                    <Bot size={16} />
                  </div>
                )}

                <p>{message.text}</p>

              </div>
            ))}

            {/* Quick Questions */}
            {messages.length === 1 && (
              <div className="chat-suggestions">

                <span>Suggested questions</span>

                <div className="chat-suggestion-list">

                  {QUICK_QUESTIONS.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => sendMessage(question)}
                    >
                      {question}
                    </button>
                  ))}

                </div>

              </div>
            )}

            <div ref={bottomRef} />

          </div>

          {/* Chat Input */}
          <div className="chat-panel-footer">

            <form
              className="chat-input-form"
              onSubmit={handleSubmit}
            >

              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Type your message..."
                aria-label="Chat message"
                autoComplete="off"
                maxLength={500}
              />

              <button
                type="submit"
                disabled={!input.trim()}
                aria-label="Send message"
              >
                <Send size={18} />
              </button>

            </form>

            <p className="chat-footer-note">
              Demo mode · Live support coming soon
            </p>

          </div>

        </section>
      )}

      {/* =================================
          Back To Top
      ================================= */}

      {showTop && !open && (
        <button
          type="button"
          className="floating-button back-to-top"
          onClick={scrollToTop}
          aria-label="Back to top"
          title="Back to top"
        >
          <ArrowUp size={21} />
        </button>
      )}

      {/* =================================
          Chatbot Floating Button
      ================================= */}

      <button
        type="button"
        className={`floating-button chatbot-toggle ${
          open ? 'is-open' : ''
        }`}
        onClick={toggleChat}
        aria-label={open ? 'Close chat' : 'Open chat'}
        aria-expanded={open}
        title="JNRmart Assistant"
      >

        {open ? (
          <X size={24} />
        ) : (
          <JNRChatIcon />
        )}

      </button>

    </div>
  );
}
