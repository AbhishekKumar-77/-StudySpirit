import React, { useState } from 'react';
import { Bot, X, Send, Sparkles, HelpCircle, Code2, Bug, Zap } from 'lucide-react';
import api from '../../services/api';

export default function AICodingTutorModal({ isOpen, onClose, selectedSubject }) {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { role: 'assistant', content: `Hello! I am your AI Coding Tutor for **${selectedSubject || 'Python'}**. How can I assist you with your logic, debugging, or concept today?` }
    ]);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSend = async () => {
        if (!input.trim() || loading) return;
        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const res = await api.post('/codespirit/review', {
                code: userMsg,
                language: selectedSubject,
                problemTitle: 'General Inquiry',
                problemDescription: userMsg
            });
            const feedback = res.data?.review?.overallFeedback || "Think about breaking down the logic step by step. What happens when the input array is empty?";
            setMessages(prev => [...prev, { role: 'assistant', content: feedback }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Think about what should happen when the array contains duplicate values. Try handling the base case first!" }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
            <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="p-4 bg-gradient-to-r from-purple-700 to-indigo-700 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                            <Bot size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">AI Coding Tutor</h3>
                            <p className="text-[11px] text-purple-200">Socratic mode active ({selectedSubject})</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white">
                        <X size={18} />
                    </button>
                </div>

                {/* Messages Container */}
                <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-gray-50">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                                m.role === 'user' 
                                    ? 'bg-purple-600 text-white rounded-br-none shadow-sm' 
                                    : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none shadow-sm'
                            }`}>
                                {m.content}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex items-center gap-2 text-xs text-gray-400 p-2">
                            <Sparkles size={14} className="animate-spin text-purple-600" />
                            <span>Tutor is thinking...</span>
                        </div>
                    )}
                </div>

                {/* Quick Prompts */}
                <div className="p-2 bg-white border-t border-gray-100 flex gap-1.5 overflow-x-auto text-[11px] font-semibold text-purple-700">
                    <button onClick={() => setInput("Give me a hint")} className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 shrink-0">💡 Hint</button>
                    <button onClick={() => setInput("Explain this concept")} className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 shrink-0">📖 Explain</button>
                    <button onClick={() => setInput("Debug my logic")} className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 shrink-0">🐛 Debug</button>
                    <button onClick={() => setInput("Analyze complexity")} className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 shrink-0">⚡ Complexity</button>
                </div>

                {/* Input Field */}
                <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask your AI Tutor..."
                        className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                        onClick={handleSend}
                        className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-colors shadow-md shadow-purple-600/20"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
