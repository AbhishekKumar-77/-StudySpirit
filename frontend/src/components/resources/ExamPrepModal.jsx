import React, { useState } from 'react';
import { Zap, X, CheckCircle2, BookOpen, FileCheck, Layers, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import resourceApi from '../../services/resourceApi';

export default function ExamPrepModal({ onClose, onOpenPack }) {
    const [subject, setSubject] = useState('Database Management Systems (CSE101)');
    const [examType, setExamType] = useState('Midterm Examination');
    const [selectedUnits, setSelectedUnits] = useState(['Unit 1', 'Unit 2', 'Unit 3']);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedPack, setGeneratedPack] = useState(null);

    const availableUnits = ['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5'];

    const toggleUnit = (u) => {
        if (selectedUnits.includes(u)) {
            setSelectedUnits(selectedUnits.filter(item => item !== u));
        } else {
            setSelectedUnits([...selectedUnits, u]);
        }
    };

    const handleCreatePack = async () => {
        setIsGenerating(true);
        try {
            const data = await resourceApi.generateExamPack({
                subject,
                examType,
                units: selectedUnits
            });
            if (data && data.pack) {
                setGeneratedPack(data.pack);
            }
        } catch (err) {
            console.error('Exam pack error:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 border border-slate-200 shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-600 border border-purple-100 text-xs font-bold mb-2">
                        <Zap className="w-3.5 h-3.5 fill-purple-600" />
                        <span>Exam Preparation Mode</span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-extrabold text-slate-900">
                        Create Exam Resource Pack
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                        Select your exam scope to assemble a high-yield revision pack of verified notes, previous papers, and AI flashcards.
                    </p>
                </div>

                {!generatedPack ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                            <select
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 font-medium"
                            >
                                <option value="Database Management Systems (CSE101)">Database Management Systems (CSE101)</option>
                                <option value="Operating Systems (CSE202)">Operating Systems (CSE202)</option>
                                <option value="Computer Networks (CSE301)">Computer Networks (CSE301)</option>
                                <option value="Data Structures & Algorithms (CSE102)">Data Structures & Algorithms (CSE102)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Exam Type</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setExamType('Midterm Examination')}
                                    className={`p-3 rounded-xl border text-xs font-bold text-left transition ${
                                        examType === 'Midterm Examination'
                                            ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-xs'
                                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    Midterm Examination (Units 1–3)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setExamType('Endterm Final Exam')}
                                    className={`p-3 rounded-xl border text-xs font-bold text-left transition ${
                                        examType === 'Endterm Final Exam'
                                            ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-xs'
                                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    Endterm Final Exam (Full Syllabus)
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Include Units</label>
                            <div className="flex flex-wrap gap-2">
                                {availableUnits.map(u => {
                                    const isSel = selectedUnits.includes(u);
                                    return (
                                        <button
                                            key={u}
                                            type="button"
                                            onClick={() => toggleUnit(u)}
                                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                                isSel ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                        >
                                            {isSel && <CheckCircle2 className="w-3.5 h-3.5" />}
                                            <span>{u}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <button
                            onClick={handleCreatePack}
                            disabled={isGenerating}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-3 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 mt-4"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Assembling High-Yield Exam Pack...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    <span>Generate Exam Revision Pack</span>
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-4 text-xs">
                            <h3 className="font-extrabold text-purple-900 mb-1">Your Exam Pack is Ready!</h3>
                            <p className="text-slate-600">{generatedPack.summary}</p>
                        </div>

                        <div className="space-y-2">
                            {generatedPack.resources.map((res, idx) => (
                                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs font-bold text-slate-800">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        <span>{res.title}</span>
                                    </div>
                                    <span className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                                        {res.type}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={onClose}
                                className="bg-purple-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md"
                            >
                                Start Revision Now
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
