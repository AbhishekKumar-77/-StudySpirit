import React, { useState } from 'react';
import {
    Globe, Users, ArrowRight, MessageSquare, Briefcase, GraduationCap,
    Coffee, Sparkles, Bot, Send, Mic, MicOff, ChevronLeft
} from 'lucide-react';
import englishLabApi from '../../services/englishLabApi';
import AriaAvatar from '../AriaAvatar';

export default function RealSituationsView({ profile = {} }) {
    const [selectedScenario, setSelectedScenario] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isAiSpeaking, setIsAiSpeaking] = useState(false);

    const categories = [
        {
            title: 'College & Academic Scenarios',
            icon: GraduationCap,
            persona: 'professor',
            color: 'purple',
            scenarios: [
                {
                    id: 'prof_feedback',
                    title: 'Discuss Project Feedback with Professor',
                    desc: 'Request guidance on your research architecture and ask for extension or improvement tips.',
                    objective: 'Politely explain your progress and ask 2 specific architectural questions.'
                },
                {
                    id: 'lecture_doubt',
                    title: 'Ask a Question in a Large Lecture',
                    desc: 'Interrupt politely to clarify a complex algorithmic concept.',
                    objective: 'Frame a concise, respectful question without disrupting the flow.'
                },
                {
                    id: 'viva_defense',
                    title: 'Defend Your Final Year Viva Project',
                    desc: 'Answer challenging questions from an external viva examiner about your tech stack choice.',
                    objective: 'Justify your MongoDB and Redis caching choices calmly and factually.'
                }
            ]
        },
        {
            title: 'Workplace & Agile Teamwork',
            icon: Briefcase,
            persona: 'tech_lead',
            color: 'indigo',
            scenarios: [
                {
                    id: 'standup_update',
                    title: 'Daily Agile Standup (60 Seconds)',
                    desc: 'Give your 3 updates: What you did yesterday, what you are doing today, and blockers.',
                    objective: 'Be structured and succinct within 60 seconds.'
                },
                {
                    id: 'explain_blocker',
                    title: 'Explain a Technical Blocker to Senior Engineer',
                    desc: 'Describe a tricky race condition or database lock without sounding flustered.',
                    objective: 'Clearly define the symptoms, steps reproduced, and proposed fix.'
                },
                {
                    id: 'pr_review',
                    title: 'Discuss Pull Request Feedback Disagreement',
                    desc: 'Politely discuss a reviewer’s suggestion to refactor your code.',
                    objective: 'Demonstrate collaborative attitude and propose a balanced middle ground.'
                }
            ]
        },
        {
            title: 'Career & Networking Scenarios',
            icon: Users,
            persona: 'recruiter',
            color: 'emerald',
            scenarios: [
                {
                    id: 'recruiter_intro',
                    title: 'Talk to a Tech Recruiter at a Career Fair',
                    desc: 'Give your 30-second elevator pitch and highlight your top project.',
                    objective: 'Engage the recruiter and ask about upcoming graduate software roles.'
                },
                {
                    id: 'salary_discuss',
                    title: 'Negotiating Internship / Full-time Stipend',
                    desc: 'Discuss compensation expectations politely based on market standards.',
                    objective: 'Express excitement about the role while stating your expected range.'
                }
            ]
        },
        {
            title: 'Daily Life & Social Communication',
            icon: Coffee,
            persona: 'aria',
            color: 'amber',
            scenarios: [
                {
                    id: 'cafe_order',
                    title: 'Ordering at a Tech Cafe & Customizing Preferences',
                    desc: 'Order specialty coffee and customize milk and seating preferences.',
                    objective: 'Use natural conversational English and polite requests.'
                },
                {
                    id: 'small_talk',
                    title: 'Small Talk with International Team Members',
                    desc: 'Break the ice on a Monday morning call before a sprint meeting starts.',
                    objective: 'Discuss weekend activities, hobbies, and build rapport.'
                }
            ]
        }
    ];

    const startScenario = (scenario, category) => {
        setSelectedScenario({ ...scenario, persona: category.persona, categoryTitle: category.title });
        setMessages([
            {
                role: 'ai',
                text: `Welcome to the "${scenario.title}" simulation. Objective: ${scenario.objective}. Whenever you are ready, please begin the conversation!`,
                correction: null
            }
        ]);
    };

    const handleSendMessage = async (textToSend) => {
        const query = textToSend || inputText;
        if (!query.trim()) return;

        setInputText('');
        setMessages(prev => [...prev, { role: 'user', text: query }]);

        setIsAiSpeaking(true);
        try {
            const res = await englishLabApi.softSkillsAIChat(query, messages, {
                persona: selectedScenario.persona,
                scenario: selectedScenario
            });

            const replyText = res.reply || res.response || "Understood. Please go ahead with your next point.";
            setMessages(prev => [
                ...prev,
                {
                    role: 'ai',
                    text: replyText,
                    correction: res.correction || null
                }
            ]);

            speakText(replyText);
        } catch (e) {
            console.error('Scenario chat error', e);
        } finally {
            setIsAiSpeaking(false);
        }
    };

    const speakText = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            window.speechSynthesis.speak(utterance);
        }
    };

    if (selectedScenario) {
        return (
            <div className="space-y-4">
                {/* Scenario Header Bar */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                window.speechSynthesis.cancel();
                                setSelectedScenario(null);
                            }}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" /> Back to Scenarios
                        </button>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">
                                {selectedScenario.categoryTitle}
                            </span>
                            <h2 className="font-bold text-slate-900 text-sm">{selectedScenario.title}</h2>
                        </div>
                    </div>

                    <div className="hidden sm:block text-right">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Goal:</span>
                        <p className="text-xs text-slate-700 font-medium max-w-xs truncate">{selectedScenario.objective}</p>
                    </div>
                </div>

                {/* Scenario Chat View */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[580px] overflow-hidden">
                    <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                {msg.correction && (
                                    <div className="max-w-md p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                                        <strong>💡 Communication Tip:</strong> {msg.correction}
                                    </div>
                                )}
                                <div className={`max-w-md p-4 rounded-2xl text-xs leading-relaxed ${
                                    msg.role === 'user'
                                        ? 'bg-purple-600 text-white rounded-br-none font-medium'
                                        : 'bg-white border border-slate-200 text-slate-900 rounded-bl-none shadow-2xs'
                                }`}>
                                    {msg.role === 'ai' && (
                                        <span className="font-bold text-[10px] text-purple-700 block mb-1">
                                            Roleplay Partner
                                        </span>
                                    )}
                                    <p>{msg.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input Bar */}
                    <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-2">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Type your spoken response in this scenario..."
                            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-purple-500 focus:outline-none"
                        />
                        <button
                            onClick={() => handleSendMessage()}
                            className="px-4 py-2.5 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-700 shadow-2xs"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Globe className="w-4 h-4" />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-900 text-lg">Real-Life Communication Scenarios</h2>
                        <p className="text-xs text-slate-500">Practice realistic workplace, academic, and networking conversations with AI roleplay partners.</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {categories.map((cat, idx) => {
                    const Icon = cat.icon;
                    return (
                        <div key={idx} className="space-y-3">
                            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                <Icon className="w-4 h-4 text-purple-600" />
                                {cat.title}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {cat.scenarios.map((scen, sIdx) => (
                                    <div
                                        key={sIdx}
                                        onClick={() => startScenario(scen, cat)}
                                        className="bg-slate-50 hover:bg-purple-50/50 p-4 rounded-xl border border-slate-200 hover:border-purple-300 transition-all cursor-pointer space-y-2 group flex flex-col justify-between"
                                    >
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-xs group-hover:text-purple-700 transition-colors">
                                                {scen.title}
                                            </h4>
                                            <p className="text-[11px] text-slate-500 leading-snug mt-1">{scen.desc}</p>
                                        </div>

                                        <button className="text-[11px] font-bold text-purple-600 group-hover:underline flex items-center gap-1 pt-2">
                                            Start Scenario <ArrowRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
