import React from 'react';
import { Trophy, Calendar, Clock, Award, Shield, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ContestsView({ onStartPractice }) {
    // Check if current time is Sunday 10am-12pm
    const now = new Date();
    const isSunday = now.getDay() === 0; // 0 = Sunday
    const currentHour = now.getHours();
    const isLive = isSunday && currentHour >= 10 && currentHour < 12;

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            {/* Main Header Banner */}
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-8 rounded-3xl shadow-xl border border-purple-800/30">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300">
                        <Trophy size={26} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Coding Contests & Speed Arena</h2>
                        <p className="text-sm text-purple-200">Compete with fellow students in scheduled weekend coding challenges</p>
                    </div>
                </div>
            </div>

            {/* Weekly Sunday Contest Card */}
            <div className="bg-white p-8 rounded-3xl border border-purple-100 shadow-md relative overflow-hidden space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center text-2xl shadow-lg shadow-purple-500/20 shrink-0">
                            🏆
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                                    isLive ? 'bg-emerald-100 text-emerald-700 border border-emerald-300 animate-pulse' : 'bg-purple-100 text-purple-700'
                                }`}>
                                    {isLive ? 'LIVE CONTEST IN PROGRESS' : 'EVERY SUNDAY • WEEKLY CONTEST'}
                                </span>
                            </div>
                            <h3 className="text-xl font-black text-gray-900">StudySpirit Sunday Grand Coding Contest</h3>
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-2 font-medium">
                                <Calendar size={14} className="text-purple-600" /> Every Sunday 
                                <Clock size={14} className="text-purple-600 ml-2" /> 10:00 AM – 12:00 PM (2 Hours)
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => onStartPractice('dsa', 'Weekly Contest Mock Test', 'hard', 4)}
                        className={`px-6 py-3.5 rounded-2xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 transform hover:scale-105 active:scale-95 ${
                            isLive 
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30' 
                                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/30'
                        }`}
                    >
                        <Zap size={16} className="fill-current" />
                        <span>{isLive ? 'Join Live Contest Now' : 'Enter Contest Practice Test'}</span>
                    </button>
                </div>

                {/* Contest Rules & Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100">
                        <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block mb-1">Duration</span>
                        <div className="text-lg font-black text-gray-900">120 Minutes</div>
                        <p className="text-xs text-gray-500 mt-1">4 competitive programming problems (Easy to Hard)</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                        <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block mb-1">Rewards</span>
                        <div className="text-lg font-black text-gray-900">+500 XP & Badge</div>
                        <p className="text-xs text-gray-500 mt-1">Earn leaderboard ranking boost & exclusive certificates</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">Evaluation</span>
                        <div className="text-lg font-black text-gray-900">Real-time Judge0</div>
                        <p className="text-xs text-gray-500 mt-1">Instant hidden test case compilation & execution</p>
                    </div>
                </div>

                <div className="pt-2 text-xs text-gray-500 font-medium flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>Contests take place every Sunday morning from 10:00 AM to 12:00 PM. Results update live on the Leaderboard.</span>
                </div>
            </div>
        </div>
    );
}
