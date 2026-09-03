import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    Bot, X, Maximize2, Minimize2, Send, Copy, Check, Sparkles,
    Trash2, HelpCircle, Code, Lightbulb, Compass, ArrowUpRight
} from 'lucide-react';

export default function AIMentorModal({
    isOpen,
    onClose,
    user,
    aiMessages,
    setAiMessages,
    aiInput,
    setAiInput,
    isAiTyping,
    handleSendAiMessage
}) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [aiMessages, isAiTyping, isOpen]);

    // Handle Escape key to close or exit fullscreen
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                if (isFullscreen) {
                    setIsFullscreen(false);
                } else {
                    onClose();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isFullscreen, onClose]);

    if (!isOpen) return null;

    const quickPrompts = [
        "Explain Data Structures & Time Complexity",
        "How to prepare for Technical Coding Interviews?",
        "Give me a 25-minute Pomodoro study plan",
        "Explain Object Oriented Programming with examples",
        "How do Linked Lists compare to Arrays?"
    ];

    const handleCopyText = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleClearChat = () => {
        setAiMessages([
            {
                id: Date.now(),
                sender: 'bot',
                text: `Hi ${user?.name || 'there'}! 👋 How can I help you excel in your studies today?`
            }
        ]);
    };

    return (
        <div className={`ai-mentor-overlay ${isFullscreen ? 'fullscreen-mode' : ''}`}>
            <div className={`ai-mentor-dialog ${isFullscreen ? 'dialog-fullscreen' : ''}`}>
                {/* ── HEADER ── */}
                <div className="ai-dialog-header">
                    <div className="ai-header-brand">
                        <div className="ai-bot-avatar-badge">
                            🤖
                        </div>
                        <div>
                            <div className="ai-title-row">
                                <h3>AI Study Mentor</h3>
                                <span className="ai-live-badge">Online • LLaMA-3.3</span>
                            </div>
                            <span className="ai-subtitle">Personalized 1-on-1 Academic Tutoring</span>
                        </div>
                    </div>

                    <div className="ai-header-actions">
                        <button
                            className="ai-action-icon-btn"
                            onClick={handleClearChat}
                            title="Clear conversation"
                        >
                            <Trash2 size={16} />
                        </button>
                        <button
                            className="ai-action-icon-btn"
                            onClick={() => setIsFullscreen(prev => !prev)}
                            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen Mode"}
                        >
                            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                        </button>
                        <button
                            className="ai-action-icon-btn close-btn"
                            onClick={onClose}
                            title="Close Chat"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* ── MAIN CONTENT AREA ── */}
                <div className="ai-dialog-body">
                    {/* Optional Quick Topics Sidebar in Fullscreen */}
                    {isFullscreen && (
                        <aside className="ai-dialog-sidebar">
                            <div className="sidebar-section-title">
                                <Sparkles size={14} color="#06b6d4" />
                                <span>Suggested Topics</span>
                            </div>
                            <div className="quick-prompts-list">
                                {quickPrompts.map((prompt, idx) => (
                                    <button
                                        key={idx}
                                        className="quick-prompt-btn"
                                        onClick={() => {
                                            setAiInput(prompt);
                                        }}
                                    >
                                        <span>{prompt}</span>
                                        <ArrowUpRight size={14} />
                                    </button>
                                ))}
                            </div>

                            <div className="sidebar-tip-box">
                                <Lightbulb size={16} color="#f59e0b" />
                                <p>Tip: You can ask for code explanations, step-by-step algorithms, or practice questions with solution breakdowns!</p>
                            </div>
                        </aside>
                    )}

                    {/* Messages Container */}
                    <div className="ai-messages-container">
                        {aiMessages.map((msg, index) => (
                            <div
                                key={msg.id || index}
                                className={`ai-message-row ${msg.sender === 'user' ? 'user-row' : 'bot-row'}`}
                            >
                                {msg.sender === 'bot' && (
                                    <div className="ai-row-avatar">
                                        🤖
                                    </div>
                                )}

                                <div className={`ai-bubble ${msg.sender === 'user' ? 'user-bubble' : 'bot-bubble'}`}>
                                    {msg.sender === 'user' ? (
                                        <div className="user-message-text">{msg.text}</div>
                                    ) : (
                                        <div className="bot-markdown-content">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    code({ node, inline, className, children, ...props }) {
                                                        const match = /language-(\w+)/.exec(className || '');
                                                        return !inline ? (
                                                            <div className="code-block-wrapper">
                                                                <div className="code-block-header">
                                                                    <span>{match ? match[1] : 'code'}</span>
                                                                    <button
                                                                        onClick={() => handleCopyText(String(children).replace(/\n$/, ''), index)}
                                                                        className="copy-code-btn"
                                                                        title="Copy Code"
                                                                    >
                                                                        {copiedIndex === index ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                                                                        <span>{copiedIndex === index ? 'Copied' : 'Copy'}</span>
                                                                    </button>
                                                                </div>
                                                                <pre className="custom-pre">
                                                                    <code className={className} {...props}>
                                                                        {children}
                                                                    </code>
                                                                </pre>
                                                            </div>
                                                        ) : (
                                                            <code className="inline-code" {...props}>
                                                                {children}
                                                            </code>
                                                        );
                                                    },
                                                    table({ children }) {
                                                        return (
                                                            <div className="markdown-table-wrapper">
                                                                <table className="custom-markdown-table">{children}</table>
                                                            </div>
                                                        );
                                                    }
                                                }}
                                            >
                                                {msg.text}
                                            </ReactMarkdown>

                                            <div className="bot-bubble-footer">
                                                <button
                                                    onClick={() => handleCopyText(msg.text, index)}
                                                    className="copy-answer-btn"
                                                    title="Copy full answer"
                                                >
                                                    {copiedIndex === index ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                                                    <span>{copiedIndex === index ? 'Copied to clipboard' : 'Copy'}</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isAiTyping && (
                            <div className="ai-message-row bot-row">
                                <div className="ai-row-avatar">🤖</div>
                                <div className="ai-bubble bot-bubble typing-bubble">
                                    <div className="typing-dots">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                    <span className="typing-label">AI Mentor is thinking & formatting answer...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* ── FOOTER INPUT ── */}
                <div className="ai-dialog-footer">
                    {!isFullscreen && (
                        <div className="quick-chips-bar">
                            <span className="chips-label">Quick:</span>
                            {quickPrompts.slice(0, 3).map((prompt, idx) => (
                                <button
                                    key={idx}
                                    className="quick-chip"
                                    onClick={() => setAiInput(prompt)}
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="ai-input-form">
                        <textarea
                            className="ai-textarea-input"
                            placeholder="Ask any concept, question, code problem, or study guidance..."
                            value={aiInput}
                            onChange={e => setAiInput(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendAiMessage();
                                }
                            }}
                            rows={isFullscreen ? 2 : 1}
                        />
                        <button
                            className="ai-submit-send-btn"
                            onClick={handleSendAiMessage}
                            disabled={!aiInput.trim() || isAiTyping}
                            title="Send Question (Enter)"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
