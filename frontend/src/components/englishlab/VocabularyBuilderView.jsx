import React, { useState } from 'react';
import { BookOpen, Volume2, Bookmark, CheckCircle2, RefreshCw, Mic, Sparkles } from 'lucide-react';
import englishLabApi from '../../services/englishLabApi';

export default function VocabularyBuilderView({ profile = {}, onRefresh }) {
    const [selectedTopic, setSelectedTopic] = useState('Job Interviews');
    const [savedWords, setSavedWords] = useState(profile.savedVocabulary || []);
    const [userSentence, setUserSentence] = useState('');
    const [sentenceFeedback, setSentenceFeedback] = useState(null);
    const [saving, setSaving] = useState(false);

    const topics = ['Job Interviews', 'Technology & Work', 'Academic Writing', 'Professional Communication'];

    const topicWords = {
        'Job Interviews': [
            { word: 'Collaborate', meaning: 'Work jointly on an activity or project', context: 'Workplace', usage: 'We collaborated with the frontend team to build the API.' },
            { word: 'Demonstrate', meaning: 'Clearly show the existence or truth of something by giving proof', context: 'Professional', usage: 'This project demonstrates my proficiency in Node.js and MongoDB.' },
            { word: 'Initiative', meaning: 'The ability to assess and initiate things independently', context: 'Career', usage: 'I took the initiative to refactor the database schema.' },
            { word: 'Proficient', meaning: 'Competent or skilled in doing or using something', context: 'Technical', usage: 'I am proficient in React and asynchronous JavaScript.' },
            { word: 'Contribute', meaning: 'Give something in order to achieve a result', context: 'Teamwork', usage: 'I contributed key modules to the open-source repository.' }
        ],
        'Technology & Work': [
            { word: 'Architecture', meaning: 'The conceptual structure and logical organization of a system', context: 'Engineering', usage: 'The microservice architecture improves scalability.' },
            { word: 'Optimize', meaning: 'Make the best or most effective use of a resource', context: 'Performance', usage: 'We optimized the database query to reduce latency.' }
        ]
    };

    const currentWords = topicWords[selectedTopic] || topicWords['Job Interviews'];

    const handleSaveWord = async (wordObj) => {
        try {
            await englishLabApi.saveWordToBank(wordObj);
            setSavedWords(prev => [...prev, { ...wordObj, status: 'Learning' }]);
        } catch (e) {
            console.error('Save word error', e);
        }
    };

    const handleEvaluateSentence = (targetWord) => {
        if (!userSentence.trim()) return;
        const contains = userSentence.toLowerCase().includes(targetWord.toLowerCase());
        setSentenceFeedback({
            correct: contains,
            feedback: contains
                ? `Excellent usage! You correctly incorporated "${targetWord}" into a natural sentence.`
                : `Please make sure to include the word "${targetWord}" in your sentence.`
        });
    };

    const speakWord = (word) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'en-US';
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
                <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    Vocabulary Builder & Personal Vocab Bank
                </h2>
                <p className="text-xs text-slate-500">Master useful professional vocabulary with audio pronunciation and usage practice.</p>
            </div>

            {/* Topic Selector */}
            <div className="flex gap-2 border-b border-slate-100 pb-3 overflow-x-auto">
                {topics.map(t => (
                    <button
                        key={t}
                        onClick={() => { setSelectedTopic(t); setSentenceFeedback(null); }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedTopic === t
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                            }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* Word Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentWords.map((w, idx) => {
                    const isSaved = savedWords.some(sw => sw.word.toLowerCase() === w.word.toLowerCase());
                    return (
                        <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between">
                            <div>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">{w.context}</span>
                                        <h3 className="font-bold text-slate-900 text-base">{w.word}</h3>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => speakWord(w.word)} className="p-1.5 bg-white border border-slate-200 rounded-lg text-purple-600 hover:bg-purple-50">
                                            <Volume2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleSaveWord(w)}
                                            className={`p-1.5 rounded-lg border transition-all ${isSaved ? 'bg-purple-100 border-purple-300 text-purple-700' : 'bg-white border-slate-200 text-slate-400 hover:text-purple-600'}`}
                                        >
                                            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-purple-600' : ''}`} />
                                        </button>
                                    </div>
                                </div>

                                <p className="text-xs text-slate-700 mt-1 leading-relaxed">{w.meaning}</p>
                                <div className="bg-white p-2.5 rounded-lg border border-slate-100 text-xs text-slate-600 italic mt-2">
                                    "{w.usage}"
                                </div>
                            </div>

                            {/* Use in a sentence exercise */}
                            <div className="pt-2 border-t border-slate-200/60 space-y-2">
                                <label className="block text-[11px] font-bold text-slate-700">Use "{w.word}" in a sentence:</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={userSentence}
                                        onChange={(e) => setUserSentence(e.target.value)}
                                        placeholder={`Write a sentence using "${w.word}"...`}
                                        className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-purple-500"
                                    />
                                    <button
                                        onClick={() => handleEvaluateSentence(w.word)}
                                        className="px-3 py-1.5 bg-purple-600 text-white font-bold text-xs rounded-lg hover:bg-purple-700"
                                    >
                                        Check
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {sentenceFeedback && (
                <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${sentenceFeedback.correct ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {sentenceFeedback.feedback}
                </div>
            )}
        </div>
    );
}
