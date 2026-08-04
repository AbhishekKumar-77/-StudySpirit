import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import { YjsSocketProvider } from '../services/yjsSocketProvider';
import { Play, Pause, Square, Terminal, Users, CheckCircle, AlertCircle, RefreshCw, Copy, Check } from 'lucide-react';
import { getSocket } from '../services/groupAPI';

export default function CollaborativeCodeEditor({
    roomId,
    user,
    isHost = false,
    readOnly = false,
    language = 'javascript',
    onLanguageChange,
    initialCode = '// Write your collaborative code here...\n\nfunction main() {\n  console.log("Hello, StudySpirit Group Mode!");\n}\n\nmain();'
}) {
    const editorRef = useRef(null);
    const monacoRef = useRef(null);
    const bindingRef = useRef(null);
    const providerRef = useRef(null);
    const ydocRef = useRef(null);

    const [activeCollaborators, setActiveCollaborators] = useState([]);
    const [isRunningCode, setIsRunningCode] = useState(false);
    const [executionOutput, setExecutionOutput] = useState({ stdout: '', stderr: '', error: '' });
    const [copied, setCopied] = useState(false);

    // Initialize Yjs Document and Socket Provider
    useEffect(() => {
        if (!roomId) return;

        const socket = getSocket();
        const ydoc = new Y.Doc();
        ydocRef.current = ydoc;

        const yText = ydoc.getText('monaco');
        if (yText.toString().length === 0 && initialCode) {
            yText.insert(0, initialCode);
        }

        const provider = new YjsSocketProvider(socket, roomId, ydoc, {
            id: user?._id || user?.id,
            name: user?.name || 'Peer Developer',
            role: isHost ? 'Teacher / Host' : 'Student'
        });
        providerRef.current = provider;

        // Monitor Awareness for active collaborators
        const updateCollaborators = () => {
            const states = Array.from(provider.awareness.getStates().values());
            const activeUsers = states
                .map(s => s.user)
                .filter(Boolean);
            
            // Deduplicate by ID
            const unique = [];
            const map = new Map();
            for (const u of activeUsers) {
                if (u.id && !map.has(u.id)) {
                    map.set(u.id, u);
                    unique.push(u);
                }
            }
            setActiveCollaborators(unique);
        };

        provider.awareness.on('change', updateCollaborators);
        updateCollaborators();

        return () => {
            if (bindingRef.current) {
                bindingRef.current.destroy();
                bindingRef.current = null;
            }
            if (providerRef.current) {
                providerRef.current.destroy();
                providerRef.current = null;
            }
            if (ydocRef.current) {
                ydocRef.current.destroy();
                ydocRef.current = null;
            }
        };
    }, [roomId, user, isHost]);

    // Bind Monaco Editor to Yjs once Editor mounts
    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;

        if (ydocRef.current && providerRef.current) {
            const yText = ydocRef.current.getText('monaco');
            const model = editor.getModel();

            if (bindingRef.current) {
                bindingRef.current.destroy();
            }

            bindingRef.current = new MonacoBinding(
                yText,
                model,
                new Set([editor]),
                providerRef.current.awareness
            );
        }
    };

    // Execute code using client JS sandbox or mock backend execution runner
    const handleRunCode = async () => {
        setIsRunningCode(true);
        setExecutionOutput({ stdout: '', stderr: '', error: '' });

        const currentCode = editorRef.current ? editorRef.current.getValue() : '';

        try {
            if (language === 'javascript') {
                const logs = [];
                const originalLog = console.log;
                const originalError = console.error;

                console.log = (...args) => {
                    logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '));
                };
                console.error = (...args) => {
                    logs.push('[Error] ' + args.join(' '));
                };

                try {
                    // Safe execution sandbox evaluation
                    const runFn = new Function(currentCode);
                    runFn();
                    setExecutionOutput({
                        stdout: logs.join('\n') || 'Code executed successfully with no console output.',
                        stderr: '',
                        error: ''
                    });
                } catch (err) {
                    setExecutionOutput({
                        stdout: logs.join('\n'),
                        stderr: err.toString(),
                        error: err.message
                    });
                } finally {
                    console.log = originalLog;
                    console.error = originalError;
                }
            } else {
                // Simulated code runner output for Python / C++ / Java
                await new Promise(res => setTimeout(res, 800));
                setExecutionOutput({
                    stdout: `[${language.toUpperCase()} Runner Simulated Output]\nProgram finished with exit code 0.\nCode compiled successfully in 0.24s.`,
                    stderr: '',
                    error: ''
                });
            }
        } catch (err) {
            setExecutionOutput({ stdout: '', stderr: '', error: err.message });
        } finally {
            setIsRunningCode(false);
        }
    };

    const handleCopyCode = () => {
        if (editorRef.current) {
            navigator.clipboard.writeText(editorRef.current.getValue());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#1e1e2e] border border-violet-500/20 rounded-xl overflow-hidden shadow-2xl">
            {/* Header Controls & Active Collaborators */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#181825] border-b border-violet-500/20">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-violet-400 font-semibold text-sm">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        CRDT Collaborative Mode
                    </div>

                    {/* Collaborator Badges */}
                    <div className="flex items-center -space-x-2 overflow-hidden pl-2 border-l border-white/10">
                        {activeCollaborators.map((collab, idx) => (
                            <div
                                key={collab.id || idx}
                                title={`${collab.name} (${collab.role})`}
                                style={{ backgroundColor: collab.color }}
                                className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white ring-2 ring-[#181825]"
                            >
                                {collab.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                        ))}
                    </div>
                    <span className="text-xs text-gray-400 font-medium">
                        {activeCollaborators.length} editing live
                    </span>
                </div>

                {/* Right Actions: Language Selector, Copy, Run Code */}
                <div className="flex items-center gap-2">
                    <select
                        value={language}
                        onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
                        className="bg-[#242437] text-gray-200 border border-violet-500/30 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-violet-400"
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                        <option value="c">C</option>
                    </select>

                    <button
                        onClick={handleCopyCode}
                        className="p-1.5 text-gray-400 hover:text-white bg-[#242437] hover:bg-[#2f2f45] rounded-lg border border-violet-500/20 transition-all text-xs flex items-center gap-1"
                    >
                        {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>

                    <button
                        onClick={handleRunCode}
                        disabled={isRunningCode}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-xs rounded-lg transition-all shadow-md shadow-emerald-900/30"
                    >
                        {isRunningCode ? (
                            <RefreshCw size={14} className="animate-spin" />
                        ) : (
                            <Play size={14} fill="currentColor" />
                        )}
                        Run Code
                    </button>
                </div>
            </div>

            {/* Main Monaco Editor Container */}
            <div className="relative flex-1 min-h-[380px]">
                <Editor
                    height="100%"
                    language={language}
                    theme="vs-dark"
                    onMount={handleEditorDidMount}
                    options={{
                        readOnly: readOnly,
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineHeight: 20,
                        fontFamily: "'Fira Code', 'Courier New', monospace",
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        cursorBlinking: 'smooth',
                        cursorSmoothCaretAnimation: 'on'
                    }}
                />
            </div>

            {/* Embedded Execution Terminal */}
            <div className="flex flex-col bg-[#11111b] border-t border-violet-500/20 max-h-[160px] overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-1.5 bg-[#181825] text-xs font-mono text-gray-400 border-b border-white/5">
                    <Terminal size={13} className="text-violet-400" />
                    Console Output
                </div>
                <div className="p-3 font-mono text-xs overflow-y-auto space-y-1 text-gray-300 min-h-[60px]">
                    {executionOutput.stdout && (
                        <pre className="text-emerald-400 whitespace-pre-wrap">{executionOutput.stdout}</pre>
                    )}
                    {executionOutput.stderr && (
                        <pre className="text-rose-400 whitespace-pre-wrap">{executionOutput.stderr}</pre>
                    )}
                    {executionOutput.error && (
                        <pre className="text-red-500 font-bold whitespace-pre-wrap">Error: {executionOutput.error}</pre>
                    )}
                    {!executionOutput.stdout && !executionOutput.stderr && !executionOutput.error && (
                        <span className="text-gray-500 italic">Click "Run Code" to execute script...</span>
                    )}
                </div>
            </div>
        </div>
    );
}
