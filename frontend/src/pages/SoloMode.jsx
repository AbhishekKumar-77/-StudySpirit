import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, BarChart, CheckCircle, Zap, Brain, Play, Clock, Target, TrendingUp,
    BookOpen, Award, Timer, Bell, BellOff, X, Plus, Check, ChevronRight,
    Sparkles, MessageSquare, Lightbulb, Calendar, Volume2, VolumeX,
    Heart, Star, Coffee, Moon, Sun, Wind, Loader,
    Headphones, Eye, Battery, Flame, Edit3,
    Activity, PieChart, BarChart2, Link, ExternalLink, RefreshCw,
    Code, Terminal, Trophy, Medal, Bookmark, Hash, GitBranch,
    Layers, Database, Cpu, Globe, Settings, User, TrendingDown,
    FileCode, Layout, Shuffle, Filter, Search, AlertCircle,
    RotateCcw, Pause, Circle, Maximize2, Minimize2
} from 'lucide-react';
import * as soloApi from '../services/soloApi';

// Helper to format AI messages with markdown-like rendering
function FormatAIMessage({ text }) {
    if (!text) return null;

    const lines = text.split('\n');
    const elements = [];
    let codeBlock = null;
    let codeLines = [];

    lines.forEach((line, i) => {
        // Code block start/end
        if (line.trim().startsWith('```')) {
            if (codeBlock !== null) {
                // End code block
                elements.push(
                    <div key={`code-${i}`} className="my-3 rounded-xl overflow-hidden">
                        {codeBlock && (
                            <div className="bg-[var(--bg-secondary)] px-4 py-1.5 text-xs text-[var(--text-secondary)] font-mono border-b border-[var(--border-color)]">{codeBlock}</div>
                        )}
                        <pre className="bg-[var(--glass-bg)] p-4 overflow-x-auto text-sm leading-relaxed">
                            <code className="text-emerald-300 font-mono">{codeLines.join('\n')}</code>
                        </pre>
                    </div>
                );
                codeBlock = null;
                codeLines = [];
            } else {
                // Start code block
                codeBlock = line.trim().replace('```', '').trim() || 'code';
            }
            return;
        }

        if (codeBlock !== null) {
            codeLines.push(line);
            return;
        }

        const trimmed = line.trim();
        if (!trimmed) {
            elements.push(<div key={i} className="h-2" />);
            return;
        }

        // Headers (## or **Title**)
        if (trimmed.startsWith('### ')) {
            elements.push(<h4 key={i} className="text-[var(--text-primary)] font-bold text-sm mt-3 mb-1.5 flex items-center gap-2">{formatInlineText(trimmed.slice(4))}</h4>);
            return;
        }
        if (trimmed.startsWith('## ')) {
            elements.push(<h3 key={i} className="text-[var(--text-primary)] font-bold text-base mt-3 mb-1.5 flex items-center gap-2">{formatInlineText(trimmed.slice(3))}</h3>);
            return;
        }
        if (trimmed.startsWith('# ')) {
            elements.push(<h2 key={i} className="text-[var(--text-primary)] font-extrabold text-lg mt-3 mb-2">{formatInlineText(trimmed.slice(2))}</h2>);
            return;
        }

        // Bullet points
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
            elements.push(
                <div key={i} className="flex gap-2.5 ml-2 my-0.5">
                    <span className="text-cyan- mt-0.5 shrink-0">•</span>
                    <span className="text-[var(--text-primary)] text-sm leading-relaxed">{formatInlineText(trimmed.slice(2))}</span>
                </div>
            );
            return;
        }

        // Numbered lists
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
            elements.push(
                <div key={i} className="flex gap-2.5 ml-2 my-0.5">
                    <span className="text-cyan-400 font-bold text-sm shrink-0 min-w-[20px]">{numMatch[1]}.</span>
                    <span className="text-[var(--text-primary)] text-sm leading-relaxed">{formatInlineText(numMatch[2])}</span>
                </div>
            );
            return;
        }

        // Table rows (simple pipe-separated)
        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
            // Skip separator rows
            if (trimmed.match(/^\|[\s-|]+\|$/)) return;
            const cells = trimmed.split('|').filter(c => c.trim());
            elements.push(
                <div key={i} className="flex gap-4 py-1 text-sm">
                    {cells.map((cell, ci) => (
                        <span key={ci} className="text-[var(--text-secondary)] flex-1">{formatInlineText(cell.trim())}</span>
                    ))}
                </div>
            );
            return;
        }

        // Regular paragraph
        elements.push(<p key={i} className="text-[var(--text-primary)] text-sm leading-relaxed my-0.5">{formatInlineText(trimmed)}</p>);
    });

    // If code block was never closed
    if (codeBlock !== null && codeLines.length > 0) {
        elements.push(
            <div key="code-unclosed" className="my-3 rounded-xl overflow-hidden">
                <pre className="bg-[var(--glass-bg)] p-4 overflow-x-auto text-sm leading-relaxed">
                    <code className="text-emerald-300 font-mono">{codeLines.join('\n')}</code>
                </pre>
            </div>
        );
    }

    return <div className="space-y-0.5">{elements}</div>;
}

// Format inline text: bold, italic, inline code
function formatInlineText(text) {
    if (!text) return text;
    const parts = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
        // Find the earliest inline pattern
        let earliestIdx = remaining.length;
        let matchLen = 0;
        let matchContent = '';
        let matchType = null;

        // Check for inline code: `code`
        const codeStart = remaining.indexOf('`');
        if (codeStart !== -1) {
            const codeEnd = remaining.indexOf('`', codeStart + 1);
            if (codeEnd !== -1 && codeEnd > codeStart + 1) {
                if (codeStart < earliestIdx) {
                    earliestIdx = codeStart;
                    matchLen = codeEnd - codeStart + 1;
                    matchContent = remaining.slice(codeStart + 1, codeEnd);
                    matchType = 'code';
                }
            }
        }

        // Check for bold: **text**
        const boldStart = remaining.indexOf('**');
        if (boldStart !== -1 && boldStart < earliestIdx) {
            const boldEnd = remaining.indexOf('**', boldStart + 2);
            if (boldEnd !== -1 && boldEnd > boldStart + 2) {
                earliestIdx = boldStart;
                matchLen = boldEnd - boldStart + 2;
                matchContent = remaining.slice(boldStart + 2, boldEnd);
                matchType = 'bold';
            }
        }

        if (!matchType) {
            parts.push(remaining);
            break;
        }

        // Add text before the match
        if (earliestIdx > 0) {
            parts.push(remaining.slice(0, earliestIdx));
        }

        if (matchType === 'code') {
            parts.push(<code key={key++} className="bg-[var(--border-color)]/80 text-cyan-300 px-1.5 py-0.5 rounded text-xs font-mono">{matchContent}</code>);
        } else if (matchType === 'bold') {
            parts.push(<strong key={key++} className="text-[var(--text-primary)] font-bold">{matchContent}</strong>);
        }

        remaining = remaining.slice(earliestIdx + matchLen);
    }

    return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts;
}

export default function SoloMode() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [distractionBlock, setDistractionBlock] = useState(false);
    const [showAddTask, setShowAddTask] = useState(false);
    const [newTask, setNewTask] = useState('');
    const [chatMessage, setChatMessage] = useState('');
    const [currentMood, setCurrentMood] = useState(null);
    const [showMoodTracker, setShowMoodTracker] = useState(false);
    const [showJournal, setShowJournal] = useState(false);
    const [journalEntry, setJournalEntry] = useState('');
    const [energyLevel, setEnergyLevel] = useState(75);
    const [showBreathing, setShowBreathing] = useState(false);
    const [breathingPhase, setBreathingPhase] = useState('inhale');
    const [showCelebration, setShowCelebration] = useState(false);
    const [confetti, setConfetti] = useState([]);
    const [studyStreak, setStudyStreak] = useState(7);
    const [totalXP, setTotalXP] = useState(2450);
    const [showPlatformConnect, setShowPlatformConnect] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState(null);
    const [platformUsername, setPlatformUsername] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionError, setConnectionError] = useState('');
    const [showCodingReminder, setShowCodingReminder] = useState(false);
    const [dailyGoal, setDailyGoal] = useState(5);
    const [problemsSolvedToday, setProblemsSolvedToday] = useState(3);
    const [lastRefreshTime, setLastRefreshTime] = useState(new Date());
    const [highestStreak, setHighestStreak] = useState(15);
    const [totalStudyTime, setTotalStudyTime] = useState(0);
    const [isSendingMessage, setIsSendingMessage] = useState(false);

    // Enhanced Focus Mode States
    const [isFullscreenFocus, setIsFullscreenFocus] = useState(false);
    const [focusSessionActive, setFocusSessionActive] = useState(false);
    const [focusSessionId, setFocusSessionId] = useState(null);
    const [sessionType, setSessionType] = useState('focus'); // 'focus', 'shortBreak', 'longBreak'
    const [sessionsCompleted, setSessionsCompleted] = useState(0);
    const [focusDuration, setFocusDuration] = useState(25); // minutes
    const [shortBreakDuration, setShortBreakDuration] = useState(5); // minutes
    const [longBreakDuration, setLongBreakDuration] = useState(15); // minutes
    const [autoStartBreaks, setAutoStartBreaks] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [ambientSound, setAmbientSound] = useState(null); // 'rain', 'forest', 'coffee', 'waves', null
    const [showFocusSettings, setShowFocusSettings] = useState(false);
    const [focusedTaskId, setFocusedTaskId] = useState(null);
    const [todaysFocusTime, setTodaysFocusTime] = useState(0); // seconds
    const [distractionCount, setDistractionCount] = useState(0);
    const [focusScore, setFocusScore] = useState(85);
    const [showDistractionWarning, setShowDistractionWarning] = useState(false);

    // New Feature States
    const [timerMode, setTimerMode] = useState('countdown'); // 'countdown' or 'stopwatch'
    const [stopwatchTime, setStopwatchTime] = useState(0);
    const [showFullscreenAI, setShowFullscreenAI] = useState(false);
    const [isFullscreenAIMentor, setIsFullscreenAIMentor] = useState(false);

    // Study Suggestions States
    const [studyTopics, setStudyTopics] = useState(''); // Changed to store actual topic names
    const [studyDays, setStudyDays] = useState(7);
    const [studyPressure, setStudyPressure] = useState('medium');
    const [studyHoursPerDay, setStudyHoursPerDay] = useState(4);
    const [studySuggestions, setStudySuggestions] = useState(null);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [showStudySuggestionModal, setShowStudySuggestionModal] = useState(false);

    // Dynamic Dashboard States
    const [weeklyActivityData, setWeeklyActivityData] = useState([]);
    const [activityHeatmap, setActivityHeatmap] = useState({});

    // Fetch Dashboard Data
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const data = await soloApi.getStats();
                if (data && data.user) {
                    setWeeklyActivityData(data.weeklyData || []);

                    // Handle activityHeatmap - backend sends it as an object {date: count}
                    if (data.activityHeatmap) {
                        if (Array.isArray(data.activityHeatmap)) {
                            // If it's an array of {date, count} objects, convert to map
                            const heatmapMap = {};
                            data.activityHeatmap.forEach(item => {
                                heatmapMap[item.date] = item.count;
                            });
                            setActivityHeatmap(heatmapMap);
                        } else {
                            // It's already an object map {date: count} - use directly
                            setActivityHeatmap(data.activityHeatmap);
                        }
                    }

                    setStudyStreak(data.user.studyStreak || 0);
                    setTotalXP(data.user.totalXP || 0);
                    setPlatformProfiles(prev => ({ ...prev, ...data.platformProfiles }));
                    setTotalStudyTime(data.user.totalStudyTime || 0);
                    setDailyGoal(data.user.dailyGoal || 5);
                    setProblemsSolvedToday(data.user.problemsSolvedToday || 0);
                    if (data.user.studyStreak) setHighestStreak(Math.max(15, data.user.studyStreak));
                }
            } catch (err) {
                console.error('Failed to fetch dashboard', err);
            }
        };
        fetchDashboardData();
    }, []);

    const [platformProfiles, setPlatformProfiles] = useState({
        leetcode: {
            connected: false,
            username: '',
            rating: 0,
            problemsSolved: 0,
            easy: 0,
            medium: 0,
            hard: 0,
            streak: 0,
            ranking: 0,
            contests: 0,
            badges: []
        },
        codeforces: {
            connected: false,
            username: '',
            rating: 0,
            maxRating: 0,
            rank: 'Unrated',
            problemsSolved: 0,
            contests: 0
        },
        codechef: {
            connected: false,
            username: '',
            rating: 0,
            stars: '1★',
            maxRating: 0,
            problemsSolved: 0,
            contests: 0
        },
        hackerrank: {
            connected: false,
            username: '',
            stars: 0,
            badges: 0,
            certificates: [],
            problemsSolved: 0,
            points: 0,
            rank: 0
        },
        hackerearth: {
            connected: false,
            username: '',
            rating: 0,
            problemsSolved: 0
        },
        linkedin: {
            connected: false,
            username: '',
            profileUrl: ''
        },
        github: {
            connected: false,
            username: '',
            repos: 0,
            followers: 0,
            profileUrl: ''
        }
    });

    // Skill Tree Generator States
    const [generatedSkillTree, setGeneratedSkillTree] = useState(null);
    const [skillTopicInput, setSkillTopicInput] = useState('');
    const [isGeneratingTree, setIsGeneratingTree] = useState(false);

    // Upcoming contests state (now fetched from real APIs)
    const [upcomingContests, setUpcomingContests] = useState([]);
    const [isLoadingContests, setIsLoadingContests] = useState(false);





    const [dailyQuote] = useState({
        text: "The only way to learn a new programming language is by writing programs in it.",
        author: "Dennis Ritchie"
    });

    const [tasks, setTasks] = useState([]);

    const [achievements] = useState([
        { id: 1, title: 'First Blood', icon: Trophy, unlocked: true, description: 'Solve your first problem', xp: 50 },
        { id: 2, title: '100 Problems', icon: Target, unlocked: true, description: 'Solve 100 problems', xp: 500 },
        { id: 3, title: 'Streak Master', icon: Flame, unlocked: true, description: '7 day streak', xp: 200 },
        { id: 4, title: 'Hard Crusher', icon: Medal, unlocked: false, description: 'Solve 50 hard problems', xp: 1000 },
        { id: 5, title: 'Contest Winner', icon: Award, unlocked: false, description: 'Top 100 in a contest', xp: 2000 },
        { id: 6, title: 'All Rounder', icon: Star, unlocked: true, description: 'Connect all platforms', xp: 300 }
    ]);

    const [chatHistory, setChatHistory] = useState([
        { type: 'ai', message: "Hello! I'm your AI coding mentor. Based on your LeetCode profile, I can see you're doing great with Arrays. Want me to suggest some challenging Graph problems to improve that skill? 🚀" },
        { type: 'user', message: 'Yes, please suggest some graph problems!' },
        { type: 'ai', message: 'Great choice! Based on your current level, I recommend:\n\n1. **Number of Islands** (Medium) - Classic BFS/DFS\n2. **Course Schedule** (Medium) - Topological Sort\n3. **Clone Graph** (Medium) - Graph traversal\n\nStart with Number of Islands - it has a 97% similarity with your solved Tree problems. Would you like detailed hints?' }
    ]);

    const moods = [
        { id: 'productive', icon: Zap, color: 'emerald', label: 'Productive' },
        { id: 'focused', icon: Target, color: 'blue', label: 'Focused' },
        { id: 'learning', icon: BookOpen, color: 'violet', label: 'Learning' },
        { id: 'struggling', icon: AlertCircle, color: 'amber', label: 'Struggling' },
        { id: 'tired', icon: Battery, color: 'red', label: 'Need Break' }
    ];

    const platformColors = {
        leetcode: { bg: 'bg-[#FFA116]', text: 'text-[#FFA116]', border: 'border-[#FFA116]' },
        codeforces: { bg: 'bg-[#1F8ACB]', text: 'text-[#1F8ACB]', border: 'border-[#1F8ACB]' },
        hackerrank: { bg: 'bg-[#00EA64]', text: 'text-[#00EA64]', border: 'border-[#00EA64]' },
        hackerearth: { bg: 'bg-[#2C3454]', text: 'text-[#2C3454]', border: 'border-[#2C3454]' },
        codechef: { bg: 'bg-[#5B4638]', text: 'text-[#C4A574]', border: 'border-[#C4A574]' },
        linkedin: { bg: 'bg-[#0A66C2]', text: 'text-[#0A66C2]', border: 'border-[#0A66C2]' },
        github: { bg: 'bg-[#171515]', text: 'text-[var(--text-primary)]', border: 'border-[var(--border-color)]' }
    };

    const platformIcons = {
        leetcode: Code,
        codeforces: Terminal,
        hackerrank: Terminal,
        hackerearth: Globe,
        codechef: Trophy,
        linkedin: User,
        github: GitBranch
    };

    const platformUrls = {
        leetcode: 'https://leetcode.com',
        codeforces: 'https://codeforces.com',
        hackerrank: 'https://www.hackerrank.com',
        hackerearth: 'https://www.hackerearth.com',
        codechef: 'https://www.codechef.com',
        linkedin: 'https://www.linkedin.com/in/',
        github: 'https://github.com/'
    };

    // Fetch upcoming contests on mount
    useEffect(() => {
        const fetchContests = async () => {
            setIsLoadingContests(true);
            try {
                const contests = await soloApi.getUpcomingContests();
                if (contests && Array.isArray(contests)) {
                    setUpcomingContests(contests);
                }
            } catch (error) {
                console.error('Failed to fetch contests:', error);
                // Set some fallback contests if API fails
                setUpcomingContests([
                    { id: 1, name: 'Loading contests...', platform: 'Loading', time: '--', date: '--', type: '--', url: '#' }
                ]);
            } finally {
                setIsLoadingContests(false);
            }
        };

        fetchContests();
        // Refresh contests every 5 minutes
        const interval = setInterval(fetchContests, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // Breathing Exercise Timer
    useEffect(() => {
        let breathingInterval;
        if (showBreathing) {
            breathingInterval = setInterval(() => {
                setBreathingPhase(prev => {
                    if (prev === 'inhale') return 'hold';
                    if (prev === 'hold') return 'exhale';
                    return 'inhale';
                });
            }, 4000);
        }
        return () => clearInterval(breathingInterval);
    }, [showBreathing]);

    // Enhanced Pomodoro Timer & Stopwatch
    useEffect(() => {
        let interval;
        if (isTimerRunning) {
            interval = setInterval(() => {
                if (timerMode === 'stopwatch') {
                    setStopwatchTime(prev => prev + 1);
                    // Also track focus time if it's a focus session
                    if (sessionType === 'focus') {
                        setTodaysFocusTime(prev => prev + 1);
                    }
                } else {
                    // Countdown Logic
                    if (pomodoroTime > 0) {
                        setPomodoroTime(prev => prev - 1);
                        // Track today's focus time
                        if (sessionType === 'focus') {
                            setTodaysFocusTime(prev => prev + 1);
                        }
                    } else {
                        // Timer finished
                        setIsTimerRunning(false);
                        handleSessionComplete();
                    }
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, pomodoroTime, timerMode, sessionType]);

    // Fullscreen API handler
    useEffect(() => {
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement && isFullscreenFocus) {
                // User exited fullscreen - track as distraction if timer running
                if (isTimerRunning && sessionType === 'focus') {
                    setDistractionCount(prev => prev + 1);
                    setShowDistractionWarning(true);
                    setTimeout(() => setShowDistractionWarning(false), 3000);
                }
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, [isFullscreenFocus, isTimerRunning, sessionType]);

    // Handle session completion
    const handleSessionComplete = async () => {
        if (soundEnabled) {
            playNotificationSound();
        }
        triggerCelebration();

        if (sessionType === 'focus') {
            setSessionsCompleted(prev => prev + 1);
            setTotalXP(prev => prev + 50); // XP for completing focus session

            // Log to backend
            try {
                await soloApi.logActivity('focus_completed', {
                    duration: focusDuration,
                    sessionsCompleted: sessionsCompleted + 1
                });
            } catch (err) {
                console.error('Failed to log focus session:', err);
            }

            // Auto-start break if enabled
            if (autoStartBreaks) {
                const nextSession = (sessionsCompleted + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
                setSessionType(nextSession);
                setPomodoroTime(nextSession === 'longBreak' ? longBreakDuration * 60 : shortBreakDuration * 60);
                setTimeout(() => setIsTimerRunning(true), 1000);
            } else {
                setSessionType('shortBreak');
                setPomodoroTime(shortBreakDuration * 60);
            }
        } else {
            // Break completed, switch back to focus
            setSessionType('focus');
            setPomodoroTime(focusDuration * 60);
            if (autoStartBreaks) {
                setTimeout(() => setIsTimerRunning(true), 1000);
            }
        }
    };

    // Play notification sound
    const playNotificationSound = () => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (err) {
            console.log('Audio not supported');
        }
    };

    // Enter fullscreen focus mode
    const enterFullscreenFocus = async () => {
        try {
            await document.documentElement.requestFullscreen();
            setIsFullscreenFocus(true);
            setFocusSessionActive(true);
            setDistractionBlock(true);

            // Start session in backend
            try {
                const result = await soloApi.startStudySession('focus');
                if (result.sessionId) {
                    setFocusSessionId(result.sessionId);
                }
            } catch (err) {
                console.error('Failed to start session:', err);
            }
        } catch (err) {
            console.error('Fullscreen not supported:', err);
            // Still enable focus mode without fullscreen
            setIsFullscreenFocus(true);
            setFocusSessionActive(true);
            setDistractionBlock(true);
        }
    };

    // Exit fullscreen focus mode
    const exitFullscreenFocus = async () => {
        if (document.fullscreenElement) {
            await document.exitFullscreen();
        }
        setIsFullscreenFocus(false);
        setFocusSessionActive(false);
        setDistractionBlock(false);

        // End session in backend
        if (focusSessionId) {
            try {
                await soloApi.endStudySession();
            } catch (err) {
                console.error('Failed to end session:', err);
            }
        }
    };

    // Start focus session
    const startFocusSession = () => {
        setSessionType('focus');
        setPomodoroTime(focusDuration * 60);
        setIsTimerRunning(true);
    };

    // Pause/Resume timer
    const toggleTimer = () => {
        setIsTimerRunning(!isTimerRunning);
    };

    // Reset timer
    const resetTimer = () => {
        setIsTimerRunning(false);
        if (timerMode === 'stopwatch') {
            setStopwatchTime(0);
        } else {
            if (sessionType === 'focus') {
                setPomodoroTime(focusDuration * 60);
            } else if (sessionType === 'shortBreak') {
                setPomodoroTime(shortBreakDuration * 60);
            } else {
                setPomodoroTime(longBreakDuration * 60);
            }
        }
    };

    // Skip to next session
    const skipSession = () => {
        setIsTimerRunning(false);
        if (sessionType === 'focus') {
            const nextSession = (sessionsCompleted + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
            setSessionType(nextSession);
            setPomodoroTime(nextSession === 'longBreak' ? longBreakDuration * 60 : shortBreakDuration * 60);
        } else {
            setSessionType('focus');
            setPomodoroTime(focusDuration * 60);
        }
    };

    // Calculate focus progress percentage
    const getFocusProgress = () => {
        const totalTime = sessionType === 'focus'
            ? focusDuration * 60
            : sessionType === 'shortBreak'
                ? shortBreakDuration * 60
                : longBreakDuration * 60;
        return ((totalTime - pomodoroTime) / totalTime) * 100;
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatFocusTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const mins = Math.floor((totalSeconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    };

    const getTimeAgo = useCallback((date) => {
        const seconds = Math.floor((new Date() - date) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
        const hours = Math.floor(minutes / 60);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }, []);



    const toggleTask = (id) => {
        const task = tasks.find(t => t.id === id);
        if (!task.completed) {
            triggerCelebration();
            setTotalXP(prev => prev + task.xp);
        } else {
            setTotalXP(prev => prev - task.xp);
        }
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const addTask = () => {
        if (newTask.trim()) {
            setTasks([...tasks, { id: Date.now(), title: newTask, completed: false, xp: 25 }]);
            setNewTask('');
            setShowAddTask(false);
        }
    };

    const handleSendMessage = async () => {
        if (chatMessage.trim()) {
            const userMsg = chatMessage;
            setChatMessage('');
            setChatHistory(prev => [...prev, { type: 'user', message: userMsg }]);
            setIsSendingMessage(true);

            try {
                const response = await soloApi.sendAIMessage(userMsg);
                setChatHistory(prev => [...prev, {
                    type: 'ai',
                    message: response.response || "I'm here to help! Please ask me about study topics, DSA, or any learning-related questions."
                }]);
            } catch (error) {
                console.error('AI Chat Error:', error);
                setChatHistory(prev => [...prev, {
                    type: 'ai',
                    message: "I'm having trouble connecting right now. Please try again in a moment! 🔄"
                }]);
            } finally {
                setIsSendingMessage(false);
            }
        }
    };

    // Fetch personalized study suggestions
    const handleGetStudySuggestions = async () => {
        if (!studyTopics.trim()) {
            alert('Please enter the topics/chapters you want to study!');
            return;
        }

        setIsLoadingSuggestions(true);
        try {
            const result = await soloApi.getStudySuggestions({
                topics: studyTopics,
                daysAvailable: studyDays,
                hoursPerDay: studyHoursPerDay,
                pressureLevel: studyPressure
            });
            if (result.success) {
                setStudySuggestions(result);
            }
        } catch (error) {
            console.error('Study Suggestions Error:', error);
            alert('Failed to generate study plan. Please try again.');
        } finally {
            setIsLoadingSuggestions(false);
        }
    };

    const handleGenerateSkillTree = async () => {
        if (!skillTopicInput.trim()) {
            alert('Please enter a topic to generate a learning path!');
            return;
        }

        setIsGeneratingTree(true);
        try {
            const result = await soloApi.generateSkillTree(skillTopicInput);
            if (result.success) {
                setGeneratedSkillTree(result.skillTree);
            }
        } catch (error) {
            console.error('Skill Tree Generation Error:', error);
            alert('Failed to generate learning path. Please try again.');
        } finally {
            setIsGeneratingTree(false);
        }
    };

    const triggerCelebration = () => {
        setShowCelebration(true);
        const pieces = Array.from({ length: 50 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 0.5,
            duration: 2 + Math.random() * 2,
            color: ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b'][Math.floor(Math.random() * 5)]
        }));
        setConfetti(pieces);
        setTimeout(() => {
            setShowCelebration(false);
            setConfetti([]);
        }, 4000);
    };

    const connectPlatform = (platform) => {
        setSelectedPlatform(platform);
        setPlatformUsername('');
        setConnectionError('');
        setShowPlatformConnect(true);
    };

    const handlePlatformConnect = async () => {
        if (!platformUsername.trim()) {
            setConnectionError('Please enter a username');
            return;
        }

        setIsConnecting(true);
        setConnectionError('');

        try {
            const result = await soloApi.connectPlatform(selectedPlatform, platformUsername.trim());

            if (result.success) {
                // Update local state with real data from API
                setPlatformProfiles(prev => ({
                    ...prev,
                    [selectedPlatform]: {
                        ...prev[selectedPlatform],
                        connected: true,
                        username: platformUsername.trim(),
                        ...result.data
                    }
                }));

                setPlatformUsername('');
                setShowPlatformConnect(false);
                setSelectedPlatform(null);
                setLastRefreshTime(new Date());
            }
        } catch (error) {
            console.error('Platform connection error:', error);
            setConnectionError(error.message || `Failed to connect to ${selectedPlatform}. Please check the username and try again.`);
        } finally {
            setIsConnecting(false);
        }
    };

    const refreshPlatformData = async (platform = null) => {
        setIsRefreshing(true);

        try {
            // If specific platform, refresh just that one
            if (platform && platformProfiles[platform]?.connected) {
                const result = await soloApi.refreshPlatformData(platform);
                if (result.success) {
                    setPlatformProfiles(prev => ({
                        ...prev,
                        [platform]: {
                            ...prev[platform],
                            ...result.data
                        }
                    }));
                }
            } else {
                // Refresh all connected platforms
                const connectedPlatforms = Object.entries(platformProfiles)
                    .filter(([_, data]) => data.connected)
                    .map(([name]) => name);

                for (const p of connectedPlatforms) {
                    try {
                        const result = await soloApi.refreshPlatformData(p);
                        if (result.success) {
                            setPlatformProfiles(prev => ({
                                ...prev,
                                [p]: {
                                    ...prev[p],
                                    ...result.data
                                }
                            }));
                        }
                    } catch (err) {
                        console.error(`Failed to refresh ${p}: `, err);
                    }
                }
            }

            setLastRefreshTime(new Date());
        } catch (error) {
            console.error('Refresh error:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const disconnectPlatform = async (platform) => {
        try {
            await soloApi.disconnectPlatform(platform);
            setPlatformProfiles(prev => ({
                ...prev,
                [platform]: {
                    ...prev[platform],
                    connected: false,
                    username: ''
                }
            }));
        } catch (error) {
            console.error('Disconnect error:', error);
        }
    };

    const getTotalProblemsSolved = () => {
        return Object.values(platformProfiles)
            .filter(p => p.connected)
            .reduce((acc, p) => acc + (p.problemsSolved || 0), 0);
    };



    return (
        <div className="min-h-screen bg-gradient-to-br    relative pb-16 overflow-hidden">
            {/* Animated Background Orbs */}
            <div className="fixed -top-[10%] -left-[5%] w-[600px] h-[600px] bg-cyan-/15 rounded-full blur-[80px] animate-float pointer-events-none" />
            <div className="fixed -bottom-[10%] -right-[5%] w-[700px] h-[700px] bg-pink-500/12 rounded-full blur-[80px] animate-float-reverse pointer-events-none" />
            <div className="fixed top-[40%] right-[10%] w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[60px] animate-float pointer-events-none" />

            {/* Floating Particles */}
            {[...Array(15)].map((_, i) => (
                <div
                    key={`particle - ${i} `}
                    className="fixed w-1 h-1 rounded-full pointer-events-none animate-particle"
                    style={{
                        left: `${10 + (i * 6)}% `,
                        top: `${15 + (i * 5)}% `,
                        background: ['rgba(139, 92, 246, 0.7)', 'rgba(236, 72, 153, 0.7)', 'rgba(6, 182, 212, 0.7)', 'rgba(16, 185, 129, 0.7)'][i % 4],
                        animationDelay: `${i * 0.3} s`,
                        boxShadow: `0 0 ${5 + (i % 5) * 2}px currentColor`
                    }}
                />
            ))}

            {/* Celebration Confetti */}
            {showCelebration && (
                <div className="fixed inset-0 pointer-events-none z-[9999]">
                    {confetti.map(piece => (
                        <div
                            key={piece.id}
                            className="absolute w-2.5 h-2.5 animate-confetti"
                            style={{
                                left: `${piece.left}% `,
                                top: '-10%',
                                background: piece.color,
                                animationDuration: `${piece.duration} s`,
                                animationDelay: `${piece.delay} s`,
                                borderRadius: Math.random() > 0.5 ? '50%' : '0'
                            }}
                        />
                    ))}
                </div>
            )}

            {/* FULLSCREEN FOCUS MODE OVERLAY */}
            {isFullscreenFocus && (
                <div
                    className="flex flex-col"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        zIndex: 99999,
                        backgroundColor: '#09090b',
                        overflow: 'hidden'
                    }}
                >
                    {/* Distraction Warning Toast */}
                    {showDistractionWarning && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/90 text-[var(--text-primary)] px-6 py-3 rounded-2xl flex items-center gap-3 shadow-2xl animate-bounce z-50">
                            <AlertCircle className="w-5 h-5" />
                            <span className="font-bold">Distraction detected! Stay focused 🎯</span>
                        </div>
                    )}

                    {/* Top Bar */}
                    <div className="flex justify-between items-center p-6">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full">
                                <Flame className="w-5 h-5 text-orange-400" />
                                <span className="text-[var(--text-primary)] font-bold">{sessionsCompleted} Sessions</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full">
                                <Clock className="w-5 h-5 text-cyan-400" />
                                <span className="text-[var(--text-primary)] font-bold">{formatFocusTime(todaysFocusTime)}</span>
                            </div>
                            {distractionCount > 0 && (
                                <div className="flex items-center gap-2 bg-red-500/20 px-4 py-2 rounded-full">
                                    <AlertCircle className="w-5 h-5 text-red-400" />
                                    <span className="text-red-400 font-bold">{distractionCount} Distractions</span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowFullscreenAI(!showFullscreenAI)}
                                className={`px-4 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${showFullscreenAI ? 'bg-cyan- text-[var(--text-primary)]' : 'bg-white/5 text-cyan- hover:bg-white/10'}`}
                            >
                                <Brain className="w-5 h-5" />
                                Ask AI
                            </button>
                            <button
                                onClick={() => setSoundEnabled(!soundEnabled)}
                                className={`p-3 rounded-xl transition-all ${soundEnabled ? 'bg-cyan-/20 text-cyan-' : 'bg-white/5 text-[var(--text-secondary)]'}`}
                            >
                                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                            </button>
                            <button
                                onClick={() => setShowFocusSettings(!showFocusSettings)}
                                className="p-3 bg-white/5 rounded-xl text-[var(--text-secondary)] hover:bg-white/10 transition-all"
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                            <button
                                onClick={exitFullscreenFocus}
                                className="px-5 py-3 bg-red-500/20 text-red-400 rounded-xl font-bold hover:bg-red-500/30 transition-all flex items-center gap-2"
                            >
                                <X className="w-5 h-5" />
                                Exit Focus
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-6 relative z-0 overflow-y-auto">
                        {/* Timer Mode Switcher */}
                        <div className="flex p-1.5 bg-white/5 rounded-xl gap-1">
                            <button
                                onClick={() => { setTimerMode('countdown'); setIsTimerRunning(false); }}
                                className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${timerMode === 'countdown' ? 'bg-indigo-500 text-[var(--text-primary)] shadow-lg' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                            >
                                Countdown
                            </button>
                            <button
                                onClick={() => { setTimerMode('stopwatch'); setIsTimerRunning(false); }}
                                className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${timerMode === 'stopwatch' ? 'bg-indigo-500 text-[var(--text-primary)] shadow-lg' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                            >
                                Stopwatch
                            </button>
                        </div>

                        {/* Session Type Tabs (Only for Countdown) */}
                        {timerMode === 'countdown' && (
                            <div className="flex gap-2 bg-white/5 p-1.5 rounded-2xl">
                                {[
                                    { type: 'focus', label: 'Focus', icon: Target, time: focusDuration },
                                    { type: 'shortBreak', label: 'Short Break', icon: Coffee, time: shortBreakDuration },
                                    { type: 'longBreak', label: 'Long Break', icon: Moon, time: longBreakDuration }
                                ].map(({ type, label, icon: Icon, time }) => (
                                    <button
                                        key={type}
                                        onClick={() => {
                                            setSessionType(type);
                                            setPomodoroTime(time * 60);
                                            setIsTimerRunning(false);
                                        }}
                                        className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all text-sm ${sessionType === type
                                            ? type === 'focus' ? 'bg-cyan- text-[var(--text-primary)] shadow-lg shadow-violet-500/30' : 'bg-emerald-500 text-[var(--text-primary)] shadow-lg shadow-emerald-500/30'
                                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Timer Circle */}
                        <div className="relative">
                            <svg className="w-80 h-80 -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="none" />
                                {timerMode === 'countdown' && (
                                    <circle
                                        cx="50" cy="50" r="45"
                                        stroke={sessionType === 'focus' ? '#8b5cf6' : '#10b981'}
                                        strokeWidth="4"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeDasharray={`${2 * Math.PI * 45} `}
                                        strokeDashoffset={`${2 * Math.PI * 45 * (1 - getFocusProgress() / 100)} `}
                                        className="transition-all duration-1000"
                                    />
                                )}
                                {timerMode === 'stopwatch' && (
                                    <circle
                                        cx="50" cy="50" r="45"
                                        stroke="#8b5cf6"
                                        strokeWidth="4"
                                        fill="none"
                                        strokeDasharray={`${2 * Math.PI * 45} `}
                                        strokeDashoffset="0"
                                        className="animate-spin-slow opacity-50"
                                        style={{ transformOrigin: '50px 50px', animationDuration: '4s' }}
                                    />
                                )}
                            </svg>

                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-7xl font-black text-[var(--text-primary)] tracking-wider">
                                    {timerMode === 'countdown' ? formatTime(pomodoroTime) : formatTime(stopwatchTime)}
                                </span>
                                <span className={`text-lg font-bold mt-2 ${sessionType === 'focus' ? 'text-cyan-' : 'text-emerald-400'}`}>
                                    {timerMode === 'stopwatch' ? '⏱️ STOPWATCH' : sessionType === 'focus' ? '🎯 FOCUS TIME' : sessionType === 'shortBreak' ? '☕ SHORT BREAK' : '🌙 LONG BREAK'}
                                </span>
                            </div>
                        </div>

                        {/* Control Buttons */}
                        <div className="flex items-center gap-5">
                            <button onClick={resetTimer} className="p-4 bg-white/5 rounded-2xl text-[var(--text-secondary)] hover:bg-white/10 hover:text-[var(--text-primary)] transition-all">
                                <RotateCcw className="w-6 h-6" />
                            </button>
                            <button
                                onClick={toggleTimer}
                                className={`px-12 py-4 rounded-2xl font-black text-xl flex items-center gap-3 transition-all shadow-xl ${isTimerRunning ? 'bg-amber-500 text-[var(--text-primary)] hover:bg-amber-600 shadow-amber-500/30' : 'bg-gradient-to-r from-cyan- to-pink-500 text-[var(--text-primary)] hover:opacity-90 shadow-violet-500/30'}`}
                            >
                                {isTimerRunning ? <><Pause className="w-6 h-6" /> PAUSE</> : <><Play className="w-6 h-6" /> START</>}
                            </button>
                            <button onClick={skipSession} className="p-4 bg-white/5 rounded-2xl text-[var(--text-secondary)] hover:bg-white/10 hover:text-[var(--text-primary)] transition-all">
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Session Progress */}
                        <div className="flex items-center gap-3 mt-4">
                            {[1, 2, 3, 4].map((session) => (
                                <div
                                    key={session}
                                    className={`w-3 h-3 rounded-full transition-all ${session <= sessionsCompleted % 4 || (sessionsCompleted % 4 === 0 && sessionsCompleted > 0 && session === 4) ? 'bg-cyan- shadow-lg shadow-violet-500/50' : 'bg-white/10'}`}
                                />
                            ))}
                            <span className="text-[var(--text-secondary)] ml-2 text-sm">
                                {4 - (sessionsCompleted % 4 || 4)} until long break
                            </span>
                        </div>
                    </div>

                    {/* Bottom Task Bar */}
                    <div className="p-6 border-t border-[var(--border-color)]">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[var(--text-primary)] font-bold flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                                    Tasks for This Session
                                </h3>
                                <button
                                    onClick={() => setShowAddTask(true)}
                                    className="px-4 py-2 bg-cyan-/20 text-cyan- rounded-xl font-bold hover:bg-cyan-/30 transition-all flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Task
                                </button>
                            </div>
                            {showAddTask && (
                                <div className="mb-4 p-4 bg-cyan-/10 border border-cyan-500/20 rounded-xl animate-fade-in-up">
                                    <input
                                        type="text"
                                        value={newTask}
                                        onChange={(e) => setNewTask(e.target.value)}
                                        placeholder="What do you want to focus on?"
                                        className="w-full px-4 py-3 bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] text-sm mb-3 focus:outline-none focus:border-cyan-500 placeholder-slate-500"
                                        onKeyPress={(e) => e.key === 'Enter' && addTask()}
                                        autoFocus
                                    />
                                    <div className="flex gap-3">
                                        <button onClick={addTask} className="flex-1 bg-cyan- text-[var(--text-primary)] py-2.5 rounded-lg font-bold hover:bg-cyan- transition-all flex items-center justify-center gap-2">
                                            <Plus className="w-4 h-4" /> Add Task
                                        </button>
                                        <button onClick={() => setShowAddTask(false)} className="flex-1 bg-white/5 text-[var(--text-secondary)] py-2.5 rounded-lg font-bold hover:bg-white/10 transition-all">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {tasks.filter(t => !t.completed).slice(0, 5).map(task => (
                                    <div
                                        key={task.id}
                                        onClick={() => toggleTask(task.id)}
                                        className={`flex-shrink-0 px-5 py-3 rounded-xl cursor-pointer transition-all flex items-center gap-3 ${focusedTaskId === task.id ? 'bg-cyan-/20 border-2 border-cyan-500' : 'bg-white/5 border-2 border-transparent hover:border-[var(--border-color)]'}`}
                                    >
                                        <Circle className="w-5 h-5 text-[var(--text-secondary)]" />
                                        <span className="text-[var(--text-primary)]">{task.title}</span>
                                        <span className="text-xs text-emerald-400 font-bold">+{task.xp} XP</span>
                                    </div>
                                ))}
                                {tasks.filter(t => !t.completed).length === 0 && (
                                    <div className="text-[var(--text-muted)] italic">No pending tasks. Add some tasks to stay productive!</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Settings Panel */}
                    {showFocusSettings && (
                        <div className="absolute right-6 top-20 bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-2xl p-6 w-80 shadow-2xl z-[101]">
                            <h3 className="text-[var(--text-primary)] font-bold mb-4 flex items-center gap-2">
                                <Settings className="w-5 h-5" />
                                Focus Settings
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[var(--text-secondary)] text-sm block mb-2">Focus Duration</label>
                                    <div className="flex gap-2">
                                        {[15, 25, 45, 60].map(mins => (
                                            <button
                                                key={mins}
                                                onClick={() => {
                                                    setFocusDuration(mins);
                                                    if (sessionType === 'focus' && !isTimerRunning) {
                                                        setPomodoroTime(mins * 60);
                                                    }
                                                }}
                                                className={`flex-1 py-2 rounded-lg font-bold text-sm ${focusDuration === mins
                                                    ? 'bg-cyan- text-[var(--text-primary)]'
                                                    : 'bg-white/5 text-[var(--text-secondary)] hover:bg-white/10'
                                                    }`}
                                            >
                                                {mins}m
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[var(--text-secondary)] text-sm block mb-2">Short Break</label>
                                    <div className="flex gap-2">
                                        {[3, 5, 10].map(mins => (
                                            <button
                                                key={mins}
                                                onClick={() => setShortBreakDuration(mins)}
                                                className={`flex-1 py-2 rounded-lg font-bold text-sm ${shortBreakDuration === mins
                                                    ? 'bg-emerald-500 text-[var(--text-primary)]'
                                                    : 'bg-white/5 text-[var(--text-secondary)] hover:bg-white/10'
                                                    }`}
                                            >
                                                {mins}m
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-[var(--text-secondary)]">Auto-start breaks</span>
                                    <button
                                        onClick={() => setAutoStartBreaks(!autoStartBreaks)}
                                        className={`w-12 h-6 rounded-full transition-all ${autoStartBreaks ? 'bg-cyan-' : 'bg-white/10'}`}
                                    >
                                        <div className={`w-5 h-5 bg-white rounded-full transition-all ${autoStartBreaks ? 'ml-6' : 'ml-0.5'}`} />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-[var(--text-secondary)]">Sound notifications</span>
                                    <button
                                        onClick={() => setSoundEnabled(!soundEnabled)}
                                        className={`w-12 h-6 rounded-full transition-all ${soundEnabled ? 'bg-cyan-' : 'bg-white/10'}`}
                                    >
                                        <div className={`w-5 h-5 bg-white rounded-full transition-all ${soundEnabled ? 'ml-6' : 'ml-0.5'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Fullscreen AI Chat Panel */}
                    {showFullscreenAI && (
                        <div className="absolute right-0 top-[88px] bottom-0 w-[400px] bg-[var(--glass-bg)] border-l border-[var(--border-color)] backdrop-blur-xl shadow-2xl flex flex-col z-[100]">
                            <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
                                <h3 className="text-[var(--text-primary)] font-bold flex items-center gap-2">
                                    <Brain className="w-5 h-5 text-cyan-" />
                                    AI Study Companion
                                </h3>
                                <button
                                    onClick={() => setShowFullscreenAI(false)}
                                    className="p-2 hover:bg-white/10 rounded-lg text-[var(--text-secondary)]"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {chatHistory.length === 0 ? (
                                    <div className="text-center text-[var(--text-secondary)] mt-10 p-4">
                                        <Brain className="w-12 h-12 text-[var(--text-primary)] mx-auto mb-3" />
                                        <p>Hi! I'm here to help you study.</p>
                                        <p className="text-sm mt-2">Ask me to explain a concept, give a hint for a problem, or just keep you motivated!</p>
                                    </div>
                                ) : (
                                    chatHistory.map((msg, idx) => (
                                        <div key={idx} className={`${msg.type === 'user' ? 'self-end ml-auto' : 'self-start'} max-w-[85%]`}>
                                            <div className={`p-3 rounded-2xl ${msg.type === 'user' ? 'bg-indigo-600 text-[var(--text-primary)]' : 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'} text-sm`}>
                                                {msg.type === 'ai' ? (
                                                    <FormatAIMessage text={msg.message} />
                                                ) : (
                                                    msg.message
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                                {isSendingMessage && (
                                    <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm pl-2">
                                        <Loader className="w-3 h-3 animate-spin" /> Thinking...
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-[var(--border-color)] bg-[var(--glass-bg)]">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={chatMessage}
                                        onChange={(e) => setChatMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder="Ask about concepts or motivation..."
                                        className="w-full pl-4 pr-12 py-3 bg-[var(--bg-secondary)] rounded-xl text-[var(--text-primary)] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!chatMessage.trim() || isSendingMessage}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-cyan- text-[var(--text-primary)] rounded-lg hover:bg-cyan- disabled:opacity-50 transition-all"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Animated Background Elements */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-/5 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '4s' }} />
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
                    </div>
                </div>
            )}

            {/* Platform Connect Modal */}
            {
                showPlatformConnect && (
                    <div className="fixed inset-0 bg-[var(--bg-secondary)]lack/80 backdrop-blur-sm flex items-center justify-center z-[9999]" onClick={() => !isConnecting && setShowPlatformConnect(false)}>
                        <div className="bg-gradient-to-br from-slate-900/95 to-indigo-900/95 rounded-3xl p-8 max-w-lg w-[90%] border border-indigo-500/30 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black text-[var(--text-primary)] flex items-center gap-3">
                                    <Link className="w-6 h-6 text-indigo-500" />
                                    Connect {selectedPlatform?.charAt(0).toUpperCase() + selectedPlatform?.slice(1)}
                                </h2>
                                <button
                                    onClick={() => setShowPlatformConnect(false)}
                                    disabled={isConnecting}
                                    className="bg-red-500/20 text-red-400 w-9 h-9 rounded-full flex items-center justify-center hover:bg-red-500/30 transition-all disabled:opacity-50"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <p className="text-[var(--text-secondary)] mb-4">Enter your {selectedPlatform} username to sync your progress and statistics from the platform.</p>

                            {/* Platform-specific info */}
                            <div className="mb-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                                <p className="text-indigo-300 text-sm">
                                    {selectedPlatform === 'leetcode' && '🔗 We\'ll fetch your solved problems, rating, and difficulty breakdown.'}
                                    {selectedPlatform === 'codeforces' && '🔗 We\'ll fetch your rating, rank, and contest history.'}
                                    {selectedPlatform === 'codechef' && '🔗 We\'ll fetch your rating, stars, and problem count.'}
                                    {selectedPlatform === 'hackerrank' && '🔗 We\'ll fetch your badges, points, and certifications.'}
                                    {selectedPlatform === 'hackerearth' && '🔗 We\'ll fetch your rating and problem statistics.'}
                                </p>
                            </div>

                            <input
                                type="text"
                                value={platformUsername}
                                onChange={(e) => { setPlatformUsername(e.target.value); setConnectionError(''); }}
                                onKeyPress={(e) => e.key === 'Enter' && !isConnecting && handlePlatformConnect()}
                                placeholder={`Enter ${selectedPlatform} username`}
                                disabled={isConnecting}
                                className="w-full px-4 py-4 bg-[var(--border-color)]/80 border border-indigo-500/30 rounded-xl text-[var(--text-primary)] mb-3 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                            />

                            {/* Error Message */}
                            {connectionError && (
                                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-red-400 text-sm">{connectionError}</p>
                                </div>
                            )}

                            <div className="flex gap-4">
                                <button
                                    onClick={handlePlatformConnect}
                                    disabled={isConnecting || !platformUsername.trim()}
                                    className="flex-1 py-4 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl text-[var(--text-primary)] font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isConnecting ? (
                                        <>
                                            <Loader className="w-5 h-5 animate-spin" />
                                            Connecting...
                                        </>
                                    ) : (
                                        'Connect Account'
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowPlatformConnect(false)}
                                    disabled={isConnecting}
                                    className="flex-1 py-4 bg-[var(--border-color)]/80 border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] font-bold hover:bg-[var(--bg-secondary)]/80 transition-all disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Mood Tracker Modal */}
            {
                showMoodTracker && (
                    <div className="fixed inset-0 bg-[var(--bg-secondary)]lack/80 backdrop-blur-sm flex items-center justify-center z-[9999]" onClick={() => setShowMoodTracker(false)}>
                        <div className="bg-gradient-to-br from-slate-900/95 to-violet-900/95 rounded-3xl p-8 max-w-lg w-[90%] border border-cyan-500/30 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black text-[var(--text-primary)]">How are you feeling?</h2>
                                <button onClick={() => setShowMoodTracker(false)} className="bg-red-500/20 text-red-400 w-9 h-9 rounded-full flex items-center justify-center hover:bg-red-500/30 transition-all">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-6">
                                {moods.map(mood => (
                                    <button
                                        key={mood.id}
                                        onClick={() => { setCurrentMood(mood.id); setTimeout(() => setShowMoodTracker(false), 300); }}
                                        className={`p - 5 rounded - xl flex flex - col items - center gap - 2 transition - all border - 2 ${currentMood === mood.id ? `border-${mood.color}-500 bg-${mood.color}-500/20` : 'border-transparent bg-[var(--border-color)]/60 hover:border-white/20'} `}
                                    >
                                        <mood.icon className={`w - 7 h - 7 text - ${mood.color} -500`} />
                                        <span className="text-[var(--text-primary)] text-xs font-semibold">{mood.label}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="p-4 bg-cyan-/10 rounded-xl border border-cyan-500/30">
                                <p className="text-[var(--text-secondary)] text-sm">
                                    {currentMood === 'struggling' && '💡 Try solving an easier problem first to build momentum.'}
                                    {currentMood === 'tired' && '☕ Take a 10-minute break. Fresh mind = better code!'}
                                    {currentMood === 'productive' && '🚀 Great! Tackle those challenging problems now!'}
                                    {currentMood === 'focused' && '🎯 Perfect state for complex algorithms!'}
                                    {currentMood === 'learning' && '📚 Explore a new topic or data structure today!'}
                                    {!currentMood && 'Select your mood to get personalized advice.'}
                                </p>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Breathing Exercise Modal */}
            {
                showBreathing && (
                    <div className="fixed inset-0 bg-[var(--bg-secondary)]lack/80 backdrop-blur-sm flex items-center justify-center z-[9999]" onClick={() => setShowBreathing(false)}>
                        <div className="bg-gradient-to-br from-slate-900/95 to-emerald-900/95 rounded-3xl p-8 max-w-md w-[90%] border border-emerald-500/30 shadow-2xl text-center relative" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => setShowBreathing(false)} className="absolute top-4 right-4 bg-red-500/20 text-red-400 w-9 h-9 rounded-full flex items-center justify-center hover:bg-red-500/30 transition-all">
                                <X className="w-5 h-5" />
                            </button>
                            <h2 className="text-2xl font-black text-[var(--text-primary)] mb-8">Breathing Exercise</h2>
                            <div className={`w - 44 h - 44 mx - auto rounded - full border - 4 flex items - center justify - center mb - 8 transition - all duration - [4000ms] ${breathingPhase === 'inhale' ? 'border-emerald-500 scale-125 bg-emerald-500/20' :
                                breathingPhase === 'hold' ? 'border-amber-500 scale-100 bg-amber-500/20' :
                                    'border-blue-500 scale-75 bg-[var(--bg-secondary)]lue-500/20'
                                } `}>
                                <Wind className="w-12 h-12 text-[var(--text-primary)]" />
                            </div>
                            <div className="text-2xl font-black text-[var(--text-primary)] mb-2">
                                {breathingPhase === 'inhale' && 'Breathe In'}
                                {breathingPhase === 'hold' && 'Hold'}
                                {breathingPhase === 'exhale' && 'Breathe Out'}
                            </div>
                            <p className="text-[var(--text-secondary)] text-sm">Follow the rhythm to relax</p>
                        </div>
                    </div>
                )
            }

            {/* Journal Modal */}
            {
                showJournal && (
                    <div className="fixed inset-0 bg-[var(--bg-secondary)]lack/80 backdrop-blur-sm flex items-center justify-center z-[9999]" onClick={() => setShowJournal(false)}>
                        <div className="bg-gradient-to-br from-slate-900/95 to-violet-900/95 rounded-3xl p-8 max-w-2xl w-[90%] border border-cyan-500/30 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black text-[var(--text-primary)] flex items-center gap-3">
                                    <Edit3 className="w-6 h-6 text-cyan-" /> Study Journal
                                </h2>
                                <button onClick={() => setShowJournal(false)} className="bg-red-500/20 text-red-400 w-9 h-9 rounded-full flex items-center justify-center hover:bg-red-500/30 transition-all">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <textarea
                                value={journalEntry}
                                onChange={(e) => setJournalEntry(e.target.value)}
                                placeholder="What did you learn today? What problems did you solve? What concepts are still unclear?"
                                className="w-full min-h-[250px] p-4 bg-[var(--border-color)]/80 border border-cyan-500/30 rounded-xl text-[var(--text-primary)] resize-y focus:outline-none focus:border-cyan-500 mb-4"
                            />
                            <button onClick={() => { setJournalEntry(''); setShowJournal(false); }} className="w-full py-4 bg-gradient-to-r from-cyan- to-purple-500 rounded-xl text-[var(--text-primary)] font-bold hover:shadow-lg hover:shadow-violet-500/30 transition-all">
                                Save Entry
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Coding Reminder Modal */}
            {
                showCodingReminder && (
                    <div className="fixed inset-0 bg-[var(--bg-secondary)]lack/80 backdrop-blur-sm flex items-center justify-center z-[9999]" onClick={() => setShowCodingReminder(false)}>
                        <div className="bg-gradient-to-br from-slate-900/95 to-amber-900/95 rounded-3xl p-8 max-w-lg w-[90%] border border-amber-500/30 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black text-[var(--text-primary)] flex items-center gap-3">
                                    <Bell className="w-6 h-6 text-amber-500" /> Coding Reminders
                                </h2>
                                <button onClick={() => setShowCodingReminder(false)} className="bg-red-500/20 text-red-400 w-9 h-9 rounded-full flex items-center justify-center hover:bg-red-500/30 transition-all">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Target className="w-5 h-5 text-emerald-500" />
                                        <span className="text-[var(--text-primary)] font-bold">Daily Goal Reminder</span>
                                    </div>
                                    <p className="text-[var(--text-secondary)] text-sm mb-3">
                                        You've solved {problemsSolvedToday}/{dailyGoal} problems today. {dailyGoal - problemsSolvedToday > 0 ? `${dailyGoal - problemsSolvedToday} more to go!` : 'Goal achieved! 🎉'}
                                    </p>
                                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all" style={{ width: `${Math.min((problemsSolvedToday / dailyGoal) * 100, 100)}% ` }} />
                                    </div>
                                </div>
                                <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/30">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Flame className="w-5 h-5 text-amber-500" />
                                        <span className="text-[var(--text-primary)] font-bold">Streak Protection</span>
                                    </div>
                                    <p className="text-[var(--text-secondary)] text-sm">🔥 Current streak: {studyStreak} days | Best: {highestStreak} days</p>
                                    <p className="text-amber-400 text-xs mt-2">Solve at least 1 problem today to keep your streak alive!</p>
                                </div>
                                <div className="p-4 bg-cyan-/10 rounded-xl border border-cyan-500/30">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Trophy className="w-5 h-5 text-cyan-" />
                                        <span className="text-[var(--text-primary)] font-bold">Upcoming Contest</span>
                                    </div>
                                    <p className="text-[var(--text-secondary)] text-sm">Weekly Contest 387 in 2 days. Practice medium-level problems to prepare!</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <button onClick={() => setShowCodingReminder(false)} className="py-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl text-[var(--text-primary)] font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-emerald-500/30 transition-all">
                                        <Play className="w-4 h-4" /> Start Solving
                                    </button>
                                    <button onClick={() => setShowCodingReminder(false)} className="py-3 bg-[var(--border-color)]/80 border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] font-bold hover:bg-[var(--bg-secondary)]/80 transition-all">
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-[var(--glass-bg)] backdrop-blur-3xl border-b border-cyan-500/20 shadow-lg shadow-violet-500/15">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 bg-indigo-500/15 text-blue-400 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-500/25 transition-all">
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>
                        <div className="text-2xl font-black bg-gradient-to-r from-white via-violet-300 to-blue-400 bg-clip-text text-transparent">
                            🎯 SOLO MODE
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowMoodTracker(true)} className="bg-pink-500/15 border border-pink-500/30 text-pink-500 p-2.5 rounded-xl hover:bg-pink-500/25 transition-all" title="Track Mood">
                                <Heart className="w-5 h-5" />
                            </button>
                            <button onClick={() => setShowBreathing(true)} className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 p-2.5 rounded-xl hover:bg-emerald-500/25 transition-all" title="Breathing">
                                <Wind className="w-5 h-5" />
                            </button>
                            <button onClick={() => setShowJournal(true)} className="bg-cyan-/15 border border-cyan-500/30 text-cyan- p-2.5 rounded-xl hover:bg-cyan-/25 transition-all" title="Journal">
                                <Edit3 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
                {/* Header */}
                <header className="bg-gradient-to-r from-indigo-500/15 to-violet-500/15 backdrop-blur-3xl rounded-3xl p-8 mb-8 border border-cyan-500/30 shadow-xl shadow-violet-500/20 relative overflow-hidden">
                    <div className="flex items-center gap-5 mb-6">
                        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-5 rounded-2xl shadow-lg shadow-blue-500/40">
                            <Code className="w-10 h-10 text-[var(--text-primary)]" />
                        </div>
                        <div>
                            <div className="text-xs text-blue-400 font-bold tracking-widest mb-1 uppercase">🚀 Your Coding Journey</div>
                            <h1 className="text-3xl font-black text-[var(--text-primary)] mb-2">Solo Mode - Code & Conquer</h1>
                            <p className="text-[var(--text-secondary)]">Track your coding progress across platforms with AI-powered insights</p>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-cyan-/15 to-purple-500/15 rounded-xl p-5 border border-cyan-500/30">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-cyan-" />
                            <span className="text-cyan- text-xs font-bold uppercase tracking-wider">Daily Inspiration</span>
                        </div>
                        <p className="text-purple-200 italic text-lg">"{dailyQuote.text}"</p>
                        <p className="text-[var(--text-secondary)] text-sm mt-1">— {dailyQuote.author}</p>
                    </div>
                </header>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    {[
                        { icon: Code, label: 'Problems Solved', value: getTotalProblemsSolved(), gradient: 'from-blue-500 to-cyan-500' },
                        { icon: Flame, label: 'Current Streak', value: `${studyStreak} Days`, gradient: 'from-amber-500 to-red-500' },
                        {
                            icon: Target, label: 'Daily Goal', value: `${problemsSolvedToday}/${dailyGoal}`, gradient: 'from-emerald-500 to-green-400'
                        },
                        { icon: Star, label: 'Total XP', value: totalXP, gradient: 'from-cyan- to-purple-500' },
                        { icon: Clock, label: 'Total Study Time', value: formatFocusTime(totalStudyTime), gradient: 'from-pink-500 to-rose-500' }
                    ].map((stat, idx) => (
                        <div key={idx} className="glass-card rounded-2xl p-5 hover:scale-105 transition-transform">
                            <div className="flex items-center gap-3">
                                <div className={`bg-gradient-to-br ${stat.gradient} p-3 rounded-xl shadow-lg`}>
                                    <stat.icon className="w-5 h-5 text-[var(--text-primary)]" />
                                </div>
                                <div>
                                    <div className="text-2xl font-black text-[var(--text-primary)]">{stat.value}</div>
                                    <div className="text-xs text-[var(--text-secondary)]">{stat.label}</div>
                                </div>
                            </div>
                        </div>
                    ))
                    }
                    {/* Focus Mode Card - Clickable */}
                    <div
                        onClick={enterFullscreenFocus}
                        className="glass-card rounded-2xl p-5 hover:scale-105 transition-transform cursor-pointer group border-2 border-transparent hover:border-cyan-500/50"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-3 rounded-xl shadow-lg group-hover:shadow-pink-500/50 transition-all">
                                <Maximize2 className="w-5 h-5 text-[var(--text-primary)]" />
                            </div>
                            <div>
                                <div className="text-lg font-black text-[var(--text-primary)] group-hover:text-pink-400 transition-colors">Focus Mode</div>
                                <div className="text-xs text-[var(--text-secondary)]">Enter Fullscreen</div>
                            </div>
                        </div>
                    </div>
                </div >

                {/* Tabs */}
                < div className="flex flex-wrap gap-3 mb-8" >
                    {
                        [
                            { id: 'dashboard', label: 'Dashboard', icon: Layout },
                            { id: 'platforms', label: 'Platforms', icon: Link },
                            { id: 'focus', label: 'Focus', icon: Zap },
                            { id: 'ai-mentor', label: 'AI Mentor', icon: Brain },
                            { id: 'skills', label: 'Skills', icon: GitBranch }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm uppercase tracking-wide transition-all ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-[var(--text-primary)] shadow-lg shadow-indigo-500/30 border border-indigo-500/50'
                                    : 'bg-[var(--glass-bg)] text-[var(--text-primary)] border border-[var(--border-color)] hover:bg-[var(--border-color)]/60'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))
                    }
                </div >

                {/* Dashboard Tab */}
                {
                    activeTab === 'dashboard' && (
                        <div className="grid lg:grid-cols-2 gap-6">
                            {/* Platform Progress */}
                            <div className="glass-card rounded-2xl p-6">
                                <div className="flex justify-between items-center mb-5">
                                    <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-3">
                                        <BarChart className="w-5 h-5 text-blue-500" />
                                        Platform Progress
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setShowCodingReminder(true)} className="bg-amber-500/20 text-amber-500 p-2 rounded-lg hover:bg-amber-500/30 transition-all" title="Set Reminder">
                                            <Bell className="w-4 h-4" />
                                        </button>
                                        <button onClick={refreshPlatformData} className={`bg-[var(--bg-secondary)]lue-500/20 text-blue-400 p-2 rounded-lg hover:bg-[var(--bg-secondary)]lue-500/30 transition-all ${isRefreshing ? 'animate-spin' : ''}`} title="Refresh">
                                            <RefreshCw className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mb-5 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                    <Clock className="w-4 h-4 text-emerald-500" />
                                    <span className="text-xs text-emerald-300">Last refreshed: {getTimeAgo(lastRefreshTime)}</span>
                                    <span className="text-xs text-[var(--text-secondary)] ml-auto">Auto-refresh: 1 hour</span>
                                </div>
                                <div className="space-y-5">
                                    {Object.entries(platformProfiles).map(([key, profile]) => {
                                        const Icon = platformIcons[key];
                                        const colors = platformColors[key];
                                        const isCodingPlatform = ['leetcode', 'codeforces', 'codechef', 'hackerrank', 'hackerearth'].includes(key);
                                        const totalProblems = key === 'leetcode' ? 3000 : key === 'hackerrank' ? 500 : 1000;
                                        const progress = profile.connected && isCodingPlatform ? ((profile.problemsSolved || 0) / totalProblems) * 100 : 0;

                                        // Generate platform URL with username if connected
                                        const platformUrl = profile.connected && profile.username
                                            ? (key === 'linkedin' || key === 'github' ? platformUrls[key] + profile.username : platformUrls[key])
                                            : platformUrls[key];

                                        return (
                                            <div key={key} className="p-4 bg-white/5 rounded-xl border border-[var(--border-color)] hover:border-[var(--border-color)] transition-all group">
                                                <div className="flex justify-between items-center mb-4">
                                                    <div
                                                        className="flex items-center gap-4 flex-1 cursor-pointer"
                                                        onClick={() => window.open(platformUrl, '_blank')}
                                                        title={`Visit ${key}`}
                                                    >
                                                        <div className={`w-12 h-12 rounded-xl ${colors.bg}/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform overflow-hidden`}>
                                                            {profile.connected && profile.avatar ? (
                                                                <img src={profile.avatar} alt={profile.username} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Icon className={`w-6 h-6 ${colors.text}`} />
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[var(--text-primary)] font-bold text-lg capitalize">{key}</span>
                                                                {!profile.connected && (
                                                                    <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded uppercase tracking-wider">Not Connected</span>
                                                                )}
                                                                <ExternalLink className="w-4 h-4 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            </div>
                                                            {profile.connected && (
                                                                <div className="text-sm text-[var(--text-secondary)]">@{profile.username}</div>
                                                            )}
                                                            {profile.connected && isCodingPlatform && profile.rating > 0 && (
                                                                <div className="text-sm text-[var(--text-secondary)]">Rating: {profile.rating}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {profile.connected ? (
                                                            <>
                                                                {isCodingPlatform && (
                                                                    <div className="text-right mr-2">
                                                                        <span className={`${colors.text} font-black text-2xl`}>{profile.problemsSolved}</span>
                                                                        <div className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">Solved</div>
                                                                    </div>
                                                                )}
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        disconnectPlatform(key);
                                                                    }}
                                                                    className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-500/20 transition-all"
                                                                    title="Disconnect"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    connectPlatform(key);
                                                                }}
                                                                className={`${colors.bg} text-[var(--text-primary)] px-5 py-2.5 rounded-lg text-sm font-bold hover:brightness-110 shadow-lg shadow-${colors.text}/20 transition-all`}
                                                            >
                                                                Connect
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                {profile.connected && isCodingPlatform && (
                                                    <>
                                                        <div className="w-full h-4 bg-[var(--glass-bg)] rounded-full overflow-hidden p-[2px] border border-[var(--border-color)]">
                                                            <div className={`h-full ${colors.bg} rounded-full transition-all duration-1000 shadow-[0_0_10px_currentColor]`} style={{ width: `${progress}%` }} />
                                                        </div>
                                                        <div className="flex justify-between mt-2 text-xs font-semibold text-[var(--text-muted)]">
                                                            <span>Level {Math.floor(progress / 10) + 1}</span>
                                                            <span>{progress.toFixed(1)}% Mastered</span>
                                                        </div>
                                                    </>
                                                )}
                                                {profile.connected && !isCodingPlatform && (
                                                    <div className="mt-2 text-sm text-[var(--text-secondary)] italic">
                                                        Click to visit your {key} profile
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Weekly Activity */}
                            <div className="glass-card rounded-2xl p-6">
                                <div className="flex justify-between items-center mb-5">
                                    <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-3">
                                        <BarChart2 className="w-5 h-5 text-blue-500" />
                                        Weekly Activity
                                    </h3>
                                    <span className="text-xs text-[var(--text-secondary)]">Hours per day</span>
                                </div>
                                <div className="flex gap-3 items-end justify-between px-2" style={{ height: '220px' }}>
                                    {weeklyActivityData.map((data, idx) => {
                                        const maxHours = Math.max(1, ...weeklyActivityData.map(d => d.hours));
                                        const heightPercent = data.hours > 0 ? Math.max(8, (data.hours / maxHours) * 100) : 3;
                                        const barGradients = [
                                            'from-blue-500 to-blue-400',
                                            'from-cyan-500 to-cyan-400',
                                            'from-emerald-500 to-emerald-400',
                                            'from-amber-500 to-amber-400',
                                            'from-pink-500 to-pink-400',
                                            'from-cyan- to-violet-400',
                                            'from-teal-500 to-teal-400'
                                        ];
                                        const glowColors = [
                                            'shadow-blue-500/40',
                                            'shadow-cyan-500/40',
                                            'shadow-emerald-500/40',
                                            'shadow-amber-500/40',
                                            'shadow-pink-500/40',
                                            'shadow-violet-500/40',
                                            'shadow-teal-500/40'
                                        ];
                                        const textColors = ['text-blue-400', 'text-cyan-400', 'text-emerald-400', 'text-amber-400', 'text-pink-400', 'text-cyan-', 'text-teal-400'];
                                        return (
                                            <div key={data.day} className="flex-1 flex flex-col items-center group cursor-pointer">
                                                <div className="relative w-full flex flex-col items-center justify-end" style={{ height: '180px' }}>
                                                    {/* Hours label - always visible on hover */}
                                                    <span className={`text-xs font-bold ${textColors[idx]} mb-1 opacity-0 group-hover:opacity-100 transition-all duration-300`}>
                                                        {data.hours}h
                                                    </span>
                                                    {/* Bar */}
                                                    <div
                                                        className={`w-full max-w-[40px] bg-gradient-to-t ${barGradients[idx]} rounded-t-lg transition-all duration-700 ease-out group-hover:shadow-lg ${glowColors[idx]} group-hover:brightness-110`}
                                                        style={{
                                                            height: `${heightPercent}%`,
                                                            opacity: data.hours > 0 ? 1 : 0.25
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-xs text-[var(--text-secondary)] font-bold mt-2">{data.day}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="flex justify-around mt-5 p-4 bg-[var(--bg-secondary)]lue-500/10 rounded-xl">
                                    <div className="text-center">
                                        <div className="text-xs text-[var(--text-secondary)]">Total</div>
                                        <div className="text-lg font-bold text-blue-400">{weeklyActivityData.reduce((sum, d) => sum + d.hours, 0).toFixed(1)}h</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-[var(--text-secondary)]">Problems</div>
                                        <div className="text-lg font-bold text-emerald-400">{weeklyActivityData.reduce((sum, d) => sum + d.problems, 0)}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-[var(--text-secondary)]">Avg/Day</div>
                                        <div className="text-lg font-bold text-cyan-">{(weeklyActivityData.reduce((sum, d) => sum + d.hours, 0) / 7).toFixed(1)}h</div>
                                    </div>
                                </div>
                            </div>

                            {/* Analytics Cards */}
                            {/* Yearly Activity / Contribution Graph */}
                            <div className="lg:col-span-2">
                                <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-3 mb-5">
                                    <Activity className="w-5 h-5 text-cyan-" />
                                    Yearly Activity
                                </h3>
                                <div className="glass-card rounded-2xl p-6 overflow-x-auto">
                                    <div className="min-w-[700px]">
                                        <h4 className="text-sm font-semibold text-[var(--text-secondary)] mb-2">Last 12 Months</h4>
                                        <div className="flex gap-[3px]" style={{ height: '112px' }}>
                                            {(() => {
                                                const weeks = [];
                                                const today = new Date();
                                                const startDate = new Date(today);
                                                startDate.setDate(today.getDate() - 364);
                                                // Adjust to Sunday
                                                startDate.setDate(startDate.getDate() - startDate.getDay());

                                                for (let w = 0; w < 53; w++) {
                                                    const days = [];
                                                    for (let d = 0; d < 7; d++) {
                                                        const date = new Date(startDate);
                                                        date.setDate(startDate.getDate() + (w * 7) + d);
                                                        if (date > today) break;
                                                        days.push(date.toISOString().split('T')[0]);
                                                    }
                                                    if (days.length > 0) weeks.push(days);
                                                }
                                                return weeks.map((week, idx) => (
                                                    <div key={idx} className="flex flex-col gap-[3px]">
                                                        {week.map(dateStr => {
                                                            // count = contribution score from backend
                                                            // (problems + focusSessions + 1 if studied > 15 min)
                                                            const count = activityHeatmap[dateStr] || 0;

                                                            // Color intensity based on activity count (like GitHub)
                                                            let bgColor = '#1e293b'; // slate-800 - no activity
                                                            let borderColor = 'rgba(255,255,255,0.03)';
                                                            if (count >= 1) { bgColor = '#064e3b'; borderColor = '#065f46'; } // emerald-900
                                                            if (count >= 3) { bgColor = '#047857'; borderColor = '#059669'; } // emerald-700
                                                            if (count >= 5) { bgColor = '#10b981'; borderColor = '#34d399'; } // emerald-500
                                                            if (count >= 8) { bgColor = '#34d399'; borderColor = '#6ee7b7'; } // emerald-400

                                                            // Format tooltip - show hours studied
                                                            const tooltipText = count > 0
                                                                ? `${dateStr}: ${count} contribution${count > 1 ? 's' : ''}`
                                                                : `${dateStr}: No activity`;

                                                            return (
                                                                <div
                                                                    key={dateStr}
                                                                    style={{
                                                                        width: '13px',
                                                                        height: '13px',
                                                                        borderRadius: '2px',
                                                                        backgroundColor: bgColor,
                                                                        border: `1px solid ${borderColor}`,
                                                                        transition: 'all 0.2s ease'
                                                                    }}
                                                                    className="hover:scale-125 hover:shadow-lg hover:shadow-emerald-500/30 cursor-pointer"
                                                                    title={tooltipText}
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                        <div className="flex items-center gap-2 mt-4 text-xs text-[var(--text-secondary)]">
                                            <span>Less</span>
                                            <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.05)' }} />
                                            <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#064e3b', border: '1px solid #065f46' }} />
                                            <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#047857', border: '1px solid #059669' }} />
                                            <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#10b981', border: '1px solid #34d399' }} />
                                            <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#34d399', border: '1px solid #6ee7b7' }} />
                                            <span>More</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Platforms Tab */}
                {
                    activeTab === 'platforms' && (
                        <div>
                            <div className="grid md:grid-cols-2 gap-5 mb-6">
                                {Object.entries(platformProfiles).map(([key, profile]) => {
                                    const Icon = platformIcons[key];
                                    const colors = platformColors[key];
                                    const isCodingPlatform = ['leetcode', 'codeforces', 'codechef', 'hackerrank', 'hackerearth'].includes(key);

                                    // Generate platform URL
                                    const platformUrl = profile.connected && profile.username
                                        ? (key === 'linkedin' || key === 'github' ? platformUrls[key] + profile.username : platformUrls[key])
                                        : platformUrls[key];

                                    return (
                                        <div
                                            key={key}
                                            className={`${profile.connected ? `border-2 ${colors.border} bg-opacity-10` : 'border-2 border-[var(--border-color)] bg-[var(--glass-bg)]'} rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer group`}
                                            style={{ backgroundColor: profile.connected ? `${key === 'leetcode' ? '#FFA116' : key === 'hackerrank' ? '#00EA64' : key === 'codechef' ? '#C4A574' : key === 'linkedin' ? '#0A66C2' : key === 'github' ? '#171515' : '#2C3454'}10` : undefined }}
                                            onClick={() => window.open(platformUrl, '_blank')}
                                        >
                                            <div className="flex justify-between items-start mb-5">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-14 h-14 rounded-xl ${colors.bg}/20 flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden`}>
                                                        {profile.connected && profile.avatar ? (
                                                            <img src={profile.avatar} alt={profile.username} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Icon className={`w-7 h-7 ${colors.text}`} />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-xl font-bold text-[var(--text-primary)] capitalize">{key}</div>
                                                            <ExternalLink className="w-4 h-4 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                        <div className={`text-sm ${profile.connected ? colors.text : 'text-[var(--text-muted)]'}`}>
                                                            {profile.connected ? `@${profile.username}` : 'Not Connected'}
                                                        </div>
                                                    </div>
                                                </div>
                                                {profile.connected ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-md">Connected</span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                disconnectPlatform(key);
                                                            }}
                                                            className="bg-red-500/10 border border-red-500/30 text-red-400 p-2 rounded-lg text-xs font-bold hover:bg-red-500/20 transition-all"
                                                            title="Disconnect"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            connectPlatform(key);
                                                        }}
                                                        className={`${colors.bg} hover:opacity-80 text-[var(--text-primary)] px-4 py-2 rounded-lg text-sm font-bold transition-all`}
                                                    >
                                                        Connect
                                                    </button>
                                                )}
                                            </div>
                                            {profile.connected ? (
                                                <>
                                                    {isCodingPlatform && (
                                                        <>
                                                            <div className="grid grid-cols-2 gap-3 mb-4">
                                                                <div className="bg-[var(--bg-secondary)]lack/20 rounded-xl p-4 text-center">
                                                                    <div className={`text-2xl font-black ${colors.text}`}>{profile.problemsSolved}</div>
                                                                    <div className="text-xs text-[var(--text-secondary)]">Problems</div>
                                                                </div>
                                                                <div className="bg-[var(--bg-secondary)]lack/20 rounded-xl p-4 text-center">
                                                                    <div className={`text-2xl font-black ${colors.text}`}>{profile.rating || (profile.stars + ' ⭐') || profile.points}</div>
                                                                    <div className="text-xs text-[var(--text-secondary)]">{key === 'hackerrank' ? 'Stars' : 'Rating'}</div>
                                                                </div>
                                                            </div>
                                                            {key === 'leetcode' && (
                                                                <div className="bg-[var(--bg-secondary)]lack/20 rounded-xl p-4">
                                                                    <div className="text-xs text-[var(--text-secondary)] mb-3">Problem Distribution</div>
                                                                    <div className="flex gap-2">
                                                                        <div className="h-2 rounded-full bg-emerald-500" style={{ flex: profile.easy }} />
                                                                        <div className="h-2 rounded-full bg-amber-500" style={{ flex: profile.medium }} />
                                                                        <div className="h-2 rounded-full bg-red-500" style={{ flex: profile.hard }} />
                                                                    </div>
                                                                    <div className="flex justify-between mt-3 text-xs text-[var(--text-secondary)]">
                                                                        <span>Easy: {profile.easy}</span>
                                                                        <span>Medium: {profile.medium}</span>
                                                                        <span>Hard: {profile.hard}</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                    {!isCodingPlatform && (
                                                        <div className="bg-[var(--bg-secondary)]lack/20 rounded-xl p-4 text-center">
                                                            <div className="text-[var(--text-secondary)] text-sm">
                                                                Click to visit your {key} profile
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <p className="text-[var(--text-secondary)] text-sm">Connect your {key} account to sync your {isCodingPlatform ? 'progress and compete in challenges' : 'profile'}.</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="glass-card rounded-2xl p-6">
                                <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-3 mb-5">
                                    <Award className="w-5 h-5 text-amber-500" />
                                    Badges & Certificates
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {[...(platformProfiles.leetcode?.badges || []), ...(platformProfiles.hackerrank?.certificates || [])].map((badge, idx) => (
                                        <div key={idx} className="px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl text-amber-400 text-sm font-semibold flex items-center gap-2">
                                            <Star className="w-4 h-4" /> {badge}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Focus Tab */}
                {
                    activeTab === 'focus' && (
                        <div className="grid lg:grid-cols-2 gap-6">
                            {/* Pomodoro Timer */}
                            <div className="glass-card rounded-2xl p-8 bg-gradient-to-br from-red-500/15 to-amber-500/15 relative">
                                <button
                                    onClick={enterFullscreenFocus}
                                    className="absolute top-4 right-4 p-2 bg-white/5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10 transition-all"
                                    title="Enter Fullscreen Mode"
                                >
                                    <Maximize2 className="w-5 h-5" />
                                </button>
                                <h3 className="text-xl font-bold text-[var(--text-primary)] text-center flex items-center justify-center gap-3 mb-8">
                                    <Timer className="w-6 h-6 text-red-500" />
                                    Pomodoro Timer
                                </h3>
                                <div className="text-center mb-10">
                                    <div className="text-7xl font-black bg-gradient-to-r from-red-500 to-amber-500 bg-clip-text text-transparent font-mono">
                                        {formatTime(pomodoroTime)}
                                    </div>
                                </div>
                                <div className="flex gap-4 justify-center mb-8">
                                    <button onClick={() => setIsTimerRunning(!isTimerRunning)} className={`px-8 py-4 rounded-xl font-bold text-lg text-[var(--text-primary)] ${isTimerRunning ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-emerald-500 to-green-500'} hover:shadow-lg transition-all`}>
                                        {isTimerRunning ? 'Pause' : 'Start'}
                                    </button>
                                    <button onClick={() => { setIsTimerRunning(false); setPomodoroTime(25 * 60); }} className="px-8 py-4 rounded-xl font-bold text-lg bg-[var(--border-color)]/80 border border-white/20 text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]/80 transition-all">
                                        Reset
                                    </button>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {[{ label: '25 min', value: 25 }, { label: '45 min', value: 45 }, { label: '60 min', value: 60 }].map((preset) => (
                                        <button key={preset.value} onClick={() => { setIsTimerRunning(false); setPomodoroTime(preset.value * 60); }} className={`py-3 rounded-xl font-bold text-[var(--text-primary)] ${pomodoroTime === preset.value * 60 ? 'bg-amber-500/20' : 'bg-[var(--border-color)]/60'} border border-[var(--border-color)] hover:bg-[var(--bg-secondary)]/60 transition-all`}>
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Focus Stats */}
                            <div className="glass-card rounded-2xl p-6">
                                <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-3 mb-5">
                                    <Zap className="w-5 h-5 text-yellow-500" />
                                    Focus Stats
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-4 bg-gradient-to-r from-cyan-/10 to-purple-500/10 rounded-xl border border-cyan-500/20">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[var(--text-secondary)] text-sm">Today's Focus Time</span>
                                            <span className="text-cyan- font-bold text-lg">{formatFocusTime(todaysFocusTime)}</span>
                                        </div>
                                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-cyan- to-purple-500 rounded-full transition-all" style={{ width: `${Math.min((todaysFocusTime / 14400) * 100, 100)}%` }} />
                                        </div>
                                        <div className="text-xs text-[var(--text-muted)] mt-1">Goal: 4 hours</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-4 bg-[var(--bg-secondary)]lue-500/10 rounded-xl border border-blue-500/20 text-center">
                                            <div className="text-2xl font-black text-blue-400">{sessionsCompleted}</div>
                                            <div className="text-xs text-[var(--text-secondary)]">Sessions Today</div>
                                        </div>
                                        <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-center">
                                            <div className="text-2xl font-black text-emerald-400">{focusScore}%</div>
                                            <div className="text-xs text-[var(--text-secondary)]">Focus Score</div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Flame className="w-5 h-5 text-amber-500" />
                                            <span className="text-[var(--text-primary)] font-bold">Streak</span>
                                        </div>
                                        <div className="text-3xl font-black text-amber-400">{studyStreak} <span className="text-sm text-[var(--text-secondary)] font-normal">days</span></div>
                                    </div>
                                </div>
                            </div>

                            {/* Achievements */}
                            <div className="lg:col-span-2 glass-card rounded-2xl p-6">
                                <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-3 mb-5">
                                    <Award className="w-5 h-5 text-amber-500" />
                                    Achievements
                                </h3>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {achievements.map((ach) => (
                                        <div key={ach.id} className={`p-5 ${ach.unlocked ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/30' : 'bg-[var(--border-color)]/40 border-[var(--border-color)] opacity-60'} border rounded-xl transition-all ${ach.unlocked ? 'hover:shadow-lg hover:shadow-amber-500/20' : ''}`}>
                                            <div className="flex items-center gap-4 mb-3">
                                                <div className={`p-3 rounded-xl ${ach.unlocked ? 'bg-amber-500/30' : 'bg-[var(--bg-secondary)]/30'}`}>
                                                    <ach.icon className={`w-6 h-6 ${ach.unlocked ? 'text-amber-400' : 'text-[var(--text-muted)]'}`} />
                                                </div>
                                                <div>
                                                    <div className={`font-bold ${ach.unlocked ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>{ach.title}</div>
                                                    <div className={`text-xs ${ach.unlocked ? 'text-amber-400' : 'text-[var(--text-muted)]'}`}>+{ach.xp} XP</div>
                                                </div>
                                            </div>
                                            <p className={`text-sm ${ach.unlocked ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'}`}>{ach.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* AI Mentor Tab */}
                {
                    activeTab === 'ai-mentor' && (
                        <div className="w-full">
                            {/* AI Chat Section - Full Width */}
                            <div className={`glass-card rounded-2xl p-6 flex flex-col ${isFullscreenAIMentor ? 'fixed inset-4 z-[9999] h-auto' : 'h-[700px]'}`}>
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-3">
                                        <Brain className="w-5 h-5 text-cyan-" />
                                        AI Study Mentor
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-[var(--text-secondary)] hidden sm:block">💡 Ask about DSA, algorithms, problem hints, study tips!</span>
                                        <button
                                            onClick={() => setIsFullscreenAIMentor(!isFullscreenAIMentor)}
                                            className="p-2 bg-cyan-/20 text-cyan- rounded-lg hover:bg-cyan-/30 transition-all"
                                            title={isFullscreenAIMentor ? "Exit Fullscreen" : "Fullscreen"}
                                        >
                                            {isFullscreenAIMentor ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className={`flex-1 overflow-y-auto mb-4 p-5 bg-[var(--glass-bg)] rounded-xl space-y-4 ${isFullscreenAIMentor ? 'max-h-[calc(100vh-280px)]' : ''}`}>
                                    {chatHistory.length === 0 ? (
                                        <div className="text-center py-16">
                                            <Brain className="w-16 h-16 text-cyan-/30 mx-auto mb-4" />
                                            <p className="text-xl font-bold text-[var(--text-primary)] mb-2">Hi! I'm your AI Study Mentor 🎓</p>
                                            <p className="text-[var(--text-secondary)] max-w-md mx-auto">Ask me about DSA, algorithms, coding problems, study strategies, or anything else you need help with!</p>
                                            <div className="flex flex-wrap justify-center gap-2 mt-6">
                                                {['Explain Binary Search', 'How to approach DP?', 'Study plan for interviews', 'Time complexity of sorting'].map((suggestion) => (
                                                    <button
                                                        key={suggestion}
                                                        onClick={() => { setChatMessage(suggestion); }}
                                                        className="px-4 py-2 bg-cyan-/10 border border-cyan-500/20 rounded-xl text-sm text-violet-300 hover:bg-cyan-/20 hover:border-cyan-500/40 transition-all"
                                                    >
                                                        {suggestion}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        chatHistory.map((msg, idx) => (
                                            <div key={idx} className={`${msg.type === 'user' ? 'self-end ml-auto' : 'self-start'} max-w-[75%]`}>
                                                <div className={`p-4 rounded-2xl ${msg.type === 'user' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-cyan-/15 border border-cyan-500/30'} text-[var(--text-primary)]`}>
                                                    {msg.type === 'ai' && (
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Brain className="w-4 h-4 text-cyan-" />
                                                            <span className="text-xs text-cyan- font-bold">AI MENTOR</span>
                                                        </div>
                                                    )}
                                                    {msg.type === 'ai' ? (
                                                        <FormatAIMessage text={msg.message} />
                                                    ) : (
                                                        <div className="text-sm leading-relaxed">{msg.message}</div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    {isSendingMessage && (
                                        <div className="self-start max-w-[75%]">
                                            <div className="p-4 rounded-2xl bg-cyan-/15 border border-cyan-500/30 text-[var(--text-primary)]">
                                                <div className="flex items-center gap-2">
                                                    <Loader className="w-4 h-4 text-cyan- animate-spin" />
                                                    <span className="text-sm text-cyan-">Thinking...</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={chatMessage}
                                        onChange={(e) => setChatMessage(e.target.value)}
                                        placeholder="Ask about DSA, algorithms, study tips, problem hints..."
                                        className="flex-1 px-5 py-4 bg-[var(--border-color)]/80 border border-cyan-500/30 rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-cyan-500 text-sm"
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!chatMessage.trim() || isSendingMessage}
                                        className="bg-gradient-to-r from-cyan- to-purple-500 text-[var(--text-primary)] px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-violet-500/30 transition-all disabled:opacity-50"
                                    >
                                        <MessageSquare className="w-4 h-4" /> Send
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Skills Tab */}
                {
                    activeTab === 'skills' && (
                        <div className="space-y-6">
                            {/* Generator Input Section */}
                            <div className="glass-card rounded-2xl p-8 text-center bg-gradient-to-br from-indigo-500/10 to-violet-500/10">
                                <h3 className="text-2xl font-black text-[var(--text-primary)] mb-2 flex items-center justify-center gap-3">
                                    <GitBranch className="w-8 h-8 text-cyan-" />
                                    AI Skill Tree Generator
                                </h3>
                                <p className="text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto">
                                    Enter any programming language, framework, or technical topic. Our AI will construct a complete, step-by-step mastery path from scratch to expert.
                                </p>

                                <div className="max-w-xl mx-auto flex gap-3 relative z-20">
                                    <input
                                        type="text"
                                        value={skillTopicInput}
                                        onChange={(e) => setSkillTopicInput(e.target.value)}
                                        placeholder="e.g. Python, C++, System Design, React..."
                                        className="flex-1 px-5 py-4 bg-[var(--glass-bg)] border border-cyan-500/30 rounded-xl text-[var(--text-primary)] text-lg focus:outline-none focus:border-cyan-500 shadow-xl transition-all"
                                        onKeyPress={(e) => e.key === 'Enter' && handleGenerateSkillTree()}
                                    />
                                    <button
                                        onClick={handleGenerateSkillTree}
                                        disabled={isGeneratingTree || !skillTopicInput.trim()}
                                        className="bg-gradient-to-r from-cyan- to-indigo-600 text-[var(--text-primary)] px-8 py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-violet-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isGeneratingTree ? <Loader className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                        Generate
                                    </button>
                                </div>
                            </div>

                            {isGeneratingTree && (
                                <div className="text-center py-12 animate-pulse">
                                    <div className="inline-block p-4 bg-cyan-/20 rounded-full mb-4">
                                        <Brain className="w-8 h-8 text-cyan- animate-bounce" />
                                    </div>
                                    <h4 className="text-xl font-bold text-[var(--text-primary)] mb-2">Constructing Knowledge Graph...</h4>
                                    <p className="text-[var(--text-secondary)]">Analyzing prerequisites, modules, and learning sequencing.</p>
                                </div>
                            )}

                            {/* Generated Tree Display */}
                            {generatedSkillTree && !isGeneratingTree && (
                                <div className="animate-fade-in-up">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h2 className="text-3xl font-black text-[var(--text-primary)] mb-1">{generatedSkillTree.title}</h2>
                                            <p className="text-[var(--text-secondary)]">{generatedSkillTree.description}</p>
                                        </div>
                                        <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm font-bold flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4" /> AI Verified Path
                                        </div>
                                    </div>

                                    <div className="relative border-l-2 border-cyan-500/30 ml-4 md:ml-8 space-y-12 py-4">
                                        {generatedSkillTree.levels.map((level, lvlIdx) => (
                                            <div key={lvlIdx} className="relative pl-8 md:pl-12">
                                                {/* Level Marker */}
                                                <div className="absolute -left-[11px] top-0 w-6 h-6 rounded-full bg-[var(--bg-secondary)] border-4 border-cyan-500 z-10 shadow-[0_0_15px_rgba(139,92,246,0.5)]" />

                                                <div className="glass-card rounded-2xl overflow-hidden border border-cyan-500/20">
                                                    {/* Level Header */}
                                                    <div className="bg-gradient-to-r from-cyan-/20 to-indigo-600/20 p-5 border-b border-[var(--border-color)]">
                                                        <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-3">
                                                            <span className="bg-cyan- text-[var(--text-primary)] text-xs px-2 py-1 rounded uppercase tracking-wider">Level {lvlIdx + 1}</span>
                                                            {level.name}
                                                        </h3>
                                                    </div>

                                                    {/* Modules Grid */}
                                                    <div className="p-6 grid gap-4">
                                                        {level.modules.map((module, modIdx) => (
                                                            <div key={modIdx} className="bg-[var(--glass-bg)] rounded-xl p-5 hover:bg-[var(--border-color)]/40 transition-colors border border-[var(--border-color)]">
                                                                <h4 className="text-lg font-bold text-indigo-300 mb-2">{module.title}</h4>
                                                                <p className="text-sm text-[var(--text-secondary)] mb-4">{module.description}</p>

                                                                <div className="space-y-3 mt-4">
                                                                    {module.topics.map((topic, tIdx) => {
                                                                        if (typeof topic === 'string') {
                                                                            return (
                                                                                <div key={tIdx} className="inline-block mr-2 mb-2">
                                                                                    <span className="px-3 py-1 bg-[var(--border-color)]/50 rounded-lg text-xs font-medium text-[var(--text-secondary)] border border-[var(--border-color)]">
                                                                                        • {topic}
                                                                                    </span>
                                                                                </div>
                                                                            );
                                                                        }
                                                                        return (
                                                                            <div key={tIdx} className="p-3 bg-[var(--glass-bg)] rounded-lg border border-[var(--border-color)] hover:border-cyan-500/20 transition-colors">
                                                                                <div className="font-bold text-indigo-300 text-sm mb-2 flex items-start gap-2">
                                                                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></span>
                                                                                    {topic.title}
                                                                                </div>
                                                                                {topic.subtopics && topic.subtopics.length > 0 && (
                                                                                    <div className="flex flex-wrap gap-2 ml-3.5">
                                                                                        {topic.subtopics.map((sub, sIdx) => (
                                                                                            <span key={sIdx} className="px-2 py-1 bg-[var(--glass-bg)] rounded text-[11px] text-[var(--text-secondary)] border border-[var(--border-color)]">
                                                                                                {sub}
                                                                                            </span>
                                                                                        ))}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Completion Marker */}
                                        <div className="relative pl-8 md:pl-12">
                                            <div className="absolute -left-[11px] top-0 w-6 h-6 rounded-full bg-emerald-500 border-4 border-[var(--border-color)] z-10 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                                            <div className="text-emerald-400 font-bold pt-1">Mastery Achieved 🏆</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!generatedSkillTree && !isGeneratingTree && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 bg-[var(--glass-bg)] p-8 rounded-2xl border border-[var(--border-color)]">
                                    <div className="text-center p-4">
                                        <div className="w-12 h-12 bg-[var(--bg-secondary)]lue-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-blue-400">
                                            <GitBranch className="w-6 h-6" />
                                        </div>
                                        <h4 className="font-bold text-[var(--text-primary)] mb-2">Structured Path</h4>
                                        <p className="text-xs text-[var(--text-secondary)]">Logically ordered modules from fundamentals to advanced concepts.</p>
                                    </div>
                                    <div className="text-center p-4">
                                        <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-purple-400">
                                            <Brain className="w-6 h-6" />
                                        </div>
                                        <h4 className="font-bold text-[var(--text-primary)] mb-2">AI Curated</h4>
                                        <p className="text-xs text-[var(--text-secondary)]">Content generated by advanced LLMs tailored to modern industry standards.</p>
                                    </div>
                                    <div className="text-center p-4">
                                        <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-emerald-400">
                                            <Target className="w-6 h-6" />
                                        </div>
                                        <h4 className="font-bold text-[var(--text-primary)] mb-2">Actionable Steps</h4>
                                        <p className="text-xs text-[var(--text-secondary)]">Clear topics and subtopics to guide your daily study sessions.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                }
            </div >

            {/* Global Styles */}
            < style jsx > {`
        .glass-card {
          background: linear-gradient(135deg, rgba(20, 20, 40, 0.8) 0%, rgba(30, 15, 50, 0.6) 100%);
          backdrop-filter: blur(30px);
          border: 1px solid rgba(139, 92, 246, 0.2);
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(40px, -40px) rotate(8deg); }
          50% { transform: translate(-30px, 30px) rotate(-8deg); }
          75% { transform: translate(30px, 15px) rotate(5deg); }
        }

        .animate-float {
          animation: float 25s ease-in-out infinite;
        }

        .animate-float-reverse {
          animation: float 30s ease-in-out infinite reverse;
        }

        @keyframes particle {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.7; }
          25% { transform: translate(30px, -25px) scale(1.2); opacity: 1; }
          50% { transform: translate(-20px, 35px) scale(0.8); opacity: 0.5; }
          75% { transform: translate(25px, 15px) scale(1.1); opacity: 0.8; }
        }

        .animate-particle {
          animation: particle 12s ease-in-out infinite;
        }

        @keyframes confetti {
          0% { transform: translateY(0) rotateZ(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotateZ(720deg); opacity: 0; }
        }

        .animate-confetti {
          animation: confetti 3s ease-out forwards;
        }

        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(30, 34, 54, 0.5);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style >
        </div >
    );
}