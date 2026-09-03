import React, { useState } from 'react';
import { BookOpen, Volume2, Bookmark, CheckCircle2, RefreshCw, Sparkles, Layers, List, Check } from 'lucide-react';
import englishLabApi from '../../services/englishLabApi';

export default function VocabularyBuilderView({ profile = {}, onRefresh }) {
    const [selectedTopic, setSelectedTopic] = useState('Tech & Engineering');
    const [viewMode, setViewMode] = useState('grid'); // grid | flashcard
    const [flashcardIdx, setFlashcardIdx] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [savedWords, setSavedWords] = useState(profile.savedVocabulary || []);
    const [userSentence, setUserSentence] = useState('');
    const [sentenceTargetWord, setSentenceTargetWord] = useState('Optimize');
    const [sentenceFeedback, setSentenceFeedback] = useState(null);

    const topicDecks = {
        'Tech & Engineering': [
            { word: 'Orchestrate', ipa: '/ˈɔː.kɪ.streɪt/', meaning: 'Coordinate and organize multiple components or services smoothly', context: 'Architecture', usage: 'Kubernetes is used to orchestrate containerized microservices across cloud clusters.' },
            { word: 'Refactor', ipa: '/riːˈfæk.tər/', meaning: 'Restructure existing code without changing its external behavior', context: 'Software Quality', usage: 'We refactored the database access layer to eliminate N+1 query bottlenecks.' },
            { word: 'Optimize', ipa: '/ˈɒp.tɪ.maɪz/', meaning: 'Make the best or most effective use of a computational resource', context: 'Performance', usage: 'Adding Redis caching optimized our backend endpoint latency from 400ms down to 25ms.' },
            { word: 'Benchmark', ipa: '/ˈbentʃ.mɑːk/', meaning: 'Evaluate or check by comparison with a standard test', context: 'Testing', usage: 'We benchmarked the throughput of WebSockets against HTTP/2 polling.' }
        ],
        'Job Interviews': [
            { word: 'Collaborate', ipa: '/kəˈlæb.ə.reɪt/', meaning: 'Work jointly on an activity or project to produce something', context: 'Teamwork', usage: 'I collaborated closely with UI designers to implement pixel-perfect responsive layouts.' },
            { word: 'Demonstrate', ipa: '/ˈdem.ən.streɪt/', meaning: 'Clearly show the existence or truth of something by giving proof', context: 'Impact', usage: 'My semester portfolio demonstrates hands-on proficiency in React, Node, and MongoDB.' },
            { word: 'Articulate', ipa: '/ɑːˈtɪk.jə.lət/', meaning: 'Express ideas fluently and clearly in speech or writing', context: 'Communication', usage: 'She articulated the project requirements clearly to non-technical stakeholders.' },
            { word: 'Initiative', ipa: '/ɪˈnɪʃ.ə.tɪv/', meaning: 'The power or opportunity to act or take charge before others do', context: 'Leadership', usage: 'I took the initiative to set up a CI/CD pipeline using GitHub Actions for the repository.' }
        ],
        'Business & Idioms': [
            { word: 'Touch Base', ipa: '/tʌtʃ beɪs/', meaning: 'Briefly make contact or reconnect with someone for an update', context: 'Workplace Idiom', usage: 'Let us touch base tomorrow afternoon to confirm the sprint deliverables.' },
            { word: 'Circle Back', ipa: '/ˈsɜː.kəl bæk/', meaning: 'Return to discuss a topic at a later point in time', context: 'Agile Meeting', usage: 'Let us circle back to the pricing tier question once we receive client feedback.' },
            { word: 'Bandwidth', ipa: '/ˈbænd.wɪtθ/', meaning: 'Mental capacity or available time to take on additional tasks', context: 'Productivity', usage: 'I currently do not have the bandwidth to take on a second bug fix before Friday.' },
            { word: 'Hit the Ground Running', ipa: '/hɪt ðə ɡraʊnd/', meaning: 'Start a new project or job energetically and with immediate success', context: 'Career', usage: 'With my strong foundational knowledge in JavaScript, I can hit the ground running in your frontend team.' }
        ],
        'Linking & Transition Words': [
            { word: 'Consequently', ipa: '/ˈkɒn.sɪ.kwənt.li/', meaning: 'As a result; therefore', context: 'Formal Discourse', usage: 'Server CPU utilization surged; consequently, the autoscaler spun up two extra instances.' },
            { word: 'Substantiate', ipa: '/səbˈstæn.ʃi.eɪt/', meaning: 'Provide evidence to support or prove the truth of an assertion', context: 'Arguments', usage: 'The benchmark graphs substantiate our claim of 4x improved query response.' },
            { word: 'Conversely', ipa: '/ˈkɒn.vɜːs.li/', meaning: 'Introducing a statement or idea that reverses or contrasts', context: 'Comparison', usage: 'SQL databases excel at ACID compliance; conversely, NoSQL provides horizontal flexibility.' }
        ]
    };

    const currentWords = topicDecks[selectedTopic] || topicDecks['Tech & Engineering'];
    const currentFlashcard = currentWords[flashcardIdx] || currentWords[0];

    const handleSaveWord = async (wordObj) => {
        try {
            await englishLabApi.saveWordToBank(wordObj);
            setSavedWords(prev => [...prev, { ...wordObj, status: 'Learning' }]);
        } catch (e) {
            console.error('Save word error', e);
        }
    };

    const speakWord = (word) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'en-US';
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleCheckSentence = () => {
        if (!userSentence.trim()) return;
        const contains = userSentence.toLowerCase().includes(sentenceTargetWord.toLowerCase());
        setSentenceFeedback({
            correct: contains,
            message: contains
                ? `Excellent usage! You correctly incorporated "${sentenceTargetWord}" into a meaningful sentence.`
                : `Please include the exact target word "${sentenceTargetWord}" in your sentence.`
        });
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                        <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-900 text-lg">Vocabulary & Idiom Builder</h2>
                        <p className="text-xs text-slate-500">Master high-impact tech verbs, interview words, and corporate idioms with pronunciation and usage.</p>
                    </div>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            viewMode === 'grid' ? 'bg-white text-purple-700 shadow-2xs' : 'text-slate-600'
                        }`}
                    >
                        <List className="w-3.5 h-3.5" /> List View
                    </button>
                    <button
                        onClick={() => { setViewMode('flashcard'); setFlashcardIdx(0); setIsFlipped(false); }}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            viewMode === 'flashcard' ? 'bg-white text-purple-700 shadow-2xs' : 'text-slate-600'
                        }`}
                    >
                        <Layers className="w-3.5 h-3.5" /> Flashcard Mode
                    </button>
                </div>
            </div>

            {/* Topic Selector */}
            <div className="flex gap-2 border-b border-slate-100 pb-3 overflow-x-auto">
                {Object.keys(topicDecks).map(t => (
                    <button
                        key={t}
                        onClick={() => {
                            setSelectedTopic(t);
                            setFlashcardIdx(0);
                            setIsFlipped(false);
                            setSentenceTargetWord(topicDecks[t][0].word);
                            setSentenceFeedback(null);
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            selectedTopic === t
                                ? 'bg-purple-600 text-white shadow-2xs'
                                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* FLASHCARD MODE */}
            {viewMode === 'flashcard' && (
                <div className="max-w-md mx-auto space-y-4 text-center">
                    <div
                        onClick={() => setIsFlipped(!isFlipped)}
                        className="bg-gradient-to-br from-purple-50 via-white to-purple-50 p-8 rounded-3xl border-2 border-purple-200 shadow-md min-h-[260px] flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.01]"
                    >
                        <div>
                            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">
                                {currentFlashcard.context} • Card {flashcardIdx + 1}/{currentWords.length}
                            </span>
                            <h3 className="text-2xl font-black text-slate-900 mt-3">{currentFlashcard.word}</h3>
                            <span className="text-xs font-mono text-slate-500">{currentFlashcard.ipa}</span>
                        </div>

                        {isFlipped ? (
                            <div className="space-y-2 py-4">
                                <p className="text-xs text-slate-800 font-semibold">{currentFlashcard.meaning}</p>
                                <p className="text-xs text-purple-900 bg-purple-100/60 p-2.5 rounded-xl italic">
                                    "{currentFlashcard.usage}"
                                </p>
                            </div>
                        ) : (
                            <p className="text-xs text-purple-600 font-bold py-6">
                                🔄 Click card to reveal meaning & example usage
                            </p>
                        )}

                        <div className="flex items-center justify-between pt-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); speakWord(currentFlashcard.word); }}
                                className="p-2 bg-white border border-slate-200 rounded-xl text-purple-600 hover:bg-purple-50"
                            >
                                <Volume2 className="w-4 h-4" />
                            </button>
                            <span className="text-[11px] text-slate-400">Click to flip</span>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleSaveWord(currentFlashcard); }}
                                className="p-2 bg-white border border-slate-200 rounded-xl text-purple-600 hover:bg-purple-50"
                            >
                                <Bookmark className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-center gap-3">
                        <button
                            disabled={flashcardIdx === 0}
                            onClick={() => { setFlashcardIdx(i => Math.max(0, i - 1)); setIsFlipped(false); }}
                            className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl disabled:opacity-40"
                        >
                            ← Previous
                        </button>
                        <button
                            disabled={flashcardIdx === currentWords.length - 1}
                            onClick={() => { setFlashcardIdx(i => Math.min(currentWords.length - 1, i + 1)); setIsFlipped(false); }}
                            className="px-5 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl disabled:opacity-40 shadow-2xs"
                        >
                            Next Card →
                        </button>
                    </div>
                </div>
            )}

            {/* LIST / GRID VIEW */}
            {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentWords.map((w, idx) => {
                        const isSaved = savedWords.some(sw => sw.word.toLowerCase() === w.word.toLowerCase());
                        return (
                            <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">{w.context}</span>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-slate-900 text-base">{w.word}</h3>
                                                <span className="text-xs font-mono text-slate-400">{w.ipa}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => speakWord(w.word)}
                                                className="p-1.5 bg-white border border-slate-200 rounded-lg text-purple-600 hover:bg-purple-50"
                                            >
                                                <Volume2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleSaveWord(w)}
                                                className={`p-1.5 rounded-lg border transition-all ${
                                                    isSaved
                                                        ? 'bg-purple-100 border-purple-300 text-purple-700'
                                                        : 'bg-white border-slate-200 text-slate-400 hover:text-purple-600'
                                                }`}
                                            >
                                                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-purple-600' : ''}`} />
                                            </button>
                                        </div>
                                    </div>

                                    <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">{w.meaning}</p>
                                    <div className="bg-white p-2.5 rounded-lg border border-slate-100 text-xs text-slate-600 italic mt-2">
                                        "{w.usage}"
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        setSentenceTargetWord(w.word);
                                        setUserSentence('');
                                        setSentenceFeedback(null);
                                    }}
                                    className="text-[11px] font-bold text-purple-700 hover:underline flex items-center gap-1 pt-2 self-start"
                                >
                                    <Sparkles className="w-3 h-3" /> Practice writing a sentence with "{w.word}"
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Interactive Sentence Practice Box */}
            <div className="p-5 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        Sentence Construction Challenge: <strong>"{sentenceTargetWord}"</strong>
                    </h4>
                </div>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={userSentence}
                        onChange={(e) => setUserSentence(e.target.value)}
                        placeholder={`Type a realistic sentence incorporating "${sentenceTargetWord}"...`}
                        className="flex-1 px-4 py-2 bg-white border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <button
                        onClick={handleCheckSentence}
                        className="px-5 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-700 shadow-2xs"
                    >
                        Verify
                    </button>
                </div>

                {sentenceFeedback && (
                    <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                        sentenceFeedback.correct
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                            : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        {sentenceFeedback.message}
                    </div>
                )}
            </div>
        </div>
    );
}
