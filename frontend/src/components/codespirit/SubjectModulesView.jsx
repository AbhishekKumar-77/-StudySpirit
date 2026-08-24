import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Folder, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SubjectModulesView({ selectedSubject, dashboardData, onStartPractice }) {
    const navigate = useNavigate();

    // Curated Python Question Bank
    const pythonQuestions = {
        m1: [
            {
                id: 'py_m1_q1',
                title: 'Coding Question 1 — Welcome Message',
                description: 'Write a Python program to print the following message:\nWelcome to StudySpirit',
                language: 'python',
                starterCode: `# TODO: Write a Python program to print "Welcome to StudySpirit"\n`,
                testCases: [{ input: '', output: 'Welcome to StudySpirit' }],
                difficulty: 'easy'
            },
            {
                id: 'py_m1_q2',
                title: 'Coding Question 2 — Python Introduction',
                description: 'Write a Python program to print the following three lines:\nI am learning Python\nPython is easy to learn\nI love programming',
                language: 'python',
                starterCode: `# TODO: Write a Python program to print the three lines\n`,
                testCases: [{ input: '', output: 'I am learning Python\nPython is easy to learn\nI love programming' }],
                difficulty: 'easy'
            },
            {
                id: 'py_m1_q3',
                title: 'Coding Question 3 — Student Welcome',
                description: 'Write a Python program that prints a welcome message for a student joining StudySpirit.',
                language: 'python',
                starterCode: `# TODO: Write a Python program that prints the student welcome message\n`,
                testCases: [{ input: '', output: 'Welcome Student\nWelcome to StudySpirit\nStart Your Programming Journey' }],
                difficulty: 'easy'
            },
            {
                id: 'py_m1_q4',
                title: 'Coding Question 4 — Python Information',
                description: 'Write a Python program to display the following information about Python:\nLanguage: Python\nType: High-Level\nPurpose: Programming',
                language: 'python',
                starterCode: `# TODO: Display the Python information\n`,
                testCases: [{ input: '', output: 'Language: Python\nType: High-Level\nPurpose: Programming' }],
                difficulty: 'easy'
            },
            {
                id: 'py_m1_q5',
                title: 'Coding Question 5 — First Program Challenge ⭐',
                description: 'Write your first Python program for StudySpirit. The program should print exactly the following:\n================================\n       STUDYSPIRIT\n================================\nWelcome to Programming\nLearn Python Step by Step\nStart Coding Today!\n================================',
                language: 'python',
                starterCode: `# TODO: Print the StudySpirit header and welcome banner\n`,
                testCases: [{ input: '', output: '================================\n       STUDYSPIRIT\n================================\nWelcome to Programming\nLearn Python Step by Step\nStart Coding Today!\n================================' }],
                difficulty: 'medium'
            }
        ],
        m2: [
            {
                id: 'py_m2_q1',
                title: 'Coding Question 1 — Student Name',
                description: 'Create a variable named student_name, store a student\'s name in it, and print the name.',
                language: 'python',
                starterCode: `# TODO: Create student_name variable and print it\n`,
                testCases: [{ input: '', output: 'Abhishek' }],
                difficulty: 'easy'
            },
            {
                id: 'py_m2_q2',
                title: 'Coding Question 2 — Student Information',
                description: 'Create variables for a student\'s name, age, and course and display them.',
                language: 'python',
                starterCode: `# TODO: Create name, age, course variables and display them\n`,
                testCases: [{ input: '', output: 'Name: Abhishek\nAge: 21\nCourse: B.Tech CSE' }],
                difficulty: 'easy'
            },
            {
                id: 'py_m2_q3',
                title: 'Coding Question 3 — Multiple Assignment',
                description: 'Use multiple assignment to store the following values:\nName = Rahul\nAge = 20\nMarks = 85\nThen print all three values.',
                language: 'python',
                starterCode: `# TODO: Use multiple assignment to store Name, Age, Marks and print them\n`,
                testCases: [{ input: '', output: 'Name: Rahul\nAge: 20\nMarks: 85' }],
                difficulty: 'easy'
            },
            {
                id: 'py_m2_q4',
                title: 'Coding Question 4 — Same Value Assignment',
                description: 'Create three variables python, dsa, and dbms and assign the value 0 to all three variables using a single statement.',
                language: 'python',
                starterCode: `# TODO: Assign 0 to python, dsa, and dbms in a single statement and print them\n`,
                testCases: [{ input: '', output: 'Python: 0\nDSA: 0\nDBMS: 0' }],
                difficulty: 'easy'
            },
            {
                id: 'py_m2_q5',
                title: 'Coding Question 5 — Swapping Two Variables',
                description: 'Create two variables:\na = 10\nb = 20\nSwap their values using Python\'s multiple assignment technique.',
                language: 'python',
                starterCode: `# TODO: Swap variables a and b using multiple assignment\n`,
                testCases: [{ input: '', output: 'Before Swapping:\na: 10\nb: 20\n\n\nAfter Swapping:\na: 20\nb: 10' }],
                difficulty: 'medium'
            },
            {
                id: 'py_m2_q6',
                title: 'Coding Question 6 — Variable Reassignment',
                description: 'Create a variable language and first assign "C" to it. Then reassign "Python" to the same variable.\nPrint the value after each assignment.',
                language: 'python',
                starterCode: `# TODO: Assign "C" then "Python" to language and print after each assignment\n`,
                testCases: [{ input: '', output: 'C\nPython' }],
                difficulty: 'easy'
            },
            {
                id: 'py_m2_q7',
                title: 'Coding Question 7 — Dynamic Typing',
                description: 'Demonstrate Python\'s dynamic typing by assigning an integer to a variable and then assigning a string to the same variable.',
                language: 'python',
                starterCode: `# TODO: Assign 100 then "Python" to a variable and print\n`,
                testCases: [{ input: '', output: '100\nPython' }],
                difficulty: 'easy'
            },
            {
                id: 'py_m2_q8',
                title: 'Coding Question 8 — Student Information System',
                description: 'Create variables for: Student name, Roll number, Age, Course, University, Marks.\nDisplay all the information in a formatted way.',
                language: 'python',
                starterCode: `# TODO: Display formatted student information system output\n`,
                testCases: [{ input: '', output: '================================\n      STUDENT INFORMATION\n================================\nName: Abhishek\nRoll No: 101\nAge: 21\nCourse: B.Tech CSE\nUniversity: LPU\nMarks: 85\n================ study' }],
                difficulty: 'medium'
            },
            {
                id: 'py_m2_q9',
                title: 'Coding Question 9 — Three-Variable Swap ⭐',
                description: 'Create three variables:\na = 10\nb = 20\nc = 30\nUse multiple assignment to rotate their values so that:\na = 20\nb = 30\nc = 10',
                language: 'python',
                starterCode: `# TODO: Rotate values of a, b, c using multiple assignment\n`,
                testCases: [{ input: '', output: 'Before:\na = 10\nb = 20\nc = 30\n\n\nAfter:\na = 20\nb = 30\nc = 10' }],
                difficulty: 'medium'
            },
            {
                id: 'py_m2_q10',
                title: 'Coding Question 10 — Variable & Object Observation',
                description: 'Create a variable x with the value 50. Assign x to another variable y. Then change x to 100.\nPrint both variables.',
                language: 'python',
                starterCode: `# TODO: Assign y = x, change x = 100, print x: 100 and y: 50\n`,
                testCases: [{ input: '', output: 'x: 100\ny: 50' }],
                difficulty: 'medium'
            }
        ],
        m3: [
            {
                id: 'py_m3_q1',
                title: 'Coding Question 1 — Number Types',
                description: 'Create an integer and a floating-point number. Print both values and their data types.',
                language: 'python',
                starterCode: `# TODO: Create int 25 and float 25.5, print values and types\n`,
                testCases: [{ input: '', output: 'Integer: 25\nType: <class \'int\'>\n\n\nFloat: 25.5\nType: <class \'float\'>' }],
                difficulty: 'easy'
            },
            {
                id: 'py_m3_q2',
                title: 'Coding Question 2 — Boolean Values',
                description: 'Create two Boolean variables representing whether a student is enrolled and whether the student has completed the course.',
                language: 'python',
                starterCode: `# TODO: Create boolean variables for Enrolled and Course Completed\n`,
                testCases: [{ input: '', output: 'Enrolled: True\nCourse Completed: False' }],
                difficulty: 'easy'
            },
            {
                id: 'py_m3_q3',
                title: 'Coding Question 3 — None Value',
                description: 'Create a variable named result and assign None to it. Print the value and its type.',
                language: 'python',
                starterCode: `# TODO: Assign None to result and print value and type\n`,
                testCases: [{ input: '', output: 'Result: None\nType: <class \'NoneType\'>' }],
                difficulty: 'easy'
            },
            {
                id: 'py_m3_q4',
                title: 'Coding Question 4 — String Operations',
                description: 'Create a variable containing the string "StudySpirit" and print:\nThe complete string\nThe first character\nThe last character\nThe length of the string',
                language: 'python',
                starterCode: `# TODO: Perform string operations on "StudySpirit"\n`,
                testCases: [{ input: '', output: 'String: StudySpirit\nFirst Character: S\nLast Character: t\nLength: 11' }],
                difficulty: 'medium'
            },
            {
                id: 'py_m3_q5',
                title: 'Coding Question 5 — List Basics',
                description: 'Create a list containing three programming languages and print the list and its first element.',
                language: 'python',
                starterCode: `# TODO: Create languages list [\'Python\', \'Java\', \'C++\'] and print\n`,
                testCases: [{ input: '', output: 'Languages: [\'Python\', \'Java\', \'C++\']\nFirst Language: Python' }],
                difficulty: 'easy'
            },
            {
                id: 'py_m3_q6',
                title: 'Coding Question 6 — Modify a List',
                description: 'Create a list containing three subjects. Replace the second subject with "Python" and print the updated list.',
                language: 'python',
                starterCode: `# TODO: Replace second subject with "Python" in list\n`,
                testCases: [{ input: '', output: 'Before: [\'DBMS\', \'Java\', \'DSA\']\nAfter: [\'DBMS\', \'Python\', \'DSA\']' }],
                difficulty: 'easy'
            },
            {
                id: 'py_m3_q7',
                title: 'Coding Question 7 — Tuple',
                description: 'Create a tuple containing a student\'s name, age, and course. Print each value using its index.',
                language: 'python',
                starterCode: `# TODO: Create tuple (\'Abhishek\', 21, \'B.Tech CSE\') and print elements\n`,
                testCases: [{ input: '', output: 'Name: Abhishek\nAge: 21\nCourse: B.Tech CSE' }],
                difficulty: 'easy'
            },
            {
                id: 'py_m3_q8',
                title: 'Coding Question 8 — Unique Values Using Set',
                description: 'Create a list containing duplicate numbers. Convert it into a set and display the unique values.',
                language: 'python',
                starterCode: `# TODO: Convert list [10, 20, 20, 30, 30, 40] to set\n`,
                testCases: [{ input: '', output: 'Original: [10, 20, 20, 30, 30, 40]\nUnique: {10, 20, 30, 40}' }],
                difficulty: 'medium'
            },
            {
                id: 'py_m3_q9',
                title: 'Coding Question 9 — Dictionary',
                description: 'Create a dictionary containing a student\'s name, age, and course. Access and print the values using their keys.',
                language: 'python',
                starterCode: `# TODO: Create student dictionary and access values by keys\n`,
                testCases: [{ input: '', output: 'Name: Abhishek\nAge: 21\nCourse: B.Tech CSE' }],
                difficulty: 'medium'
            },
            {
                id: 'py_m3_q10',
                title: 'Coding Question 10 — Type Conversion',
                description: 'Create the string "100". Convert it into an integer and a float. Print the values and their types.',
                language: 'python',
                starterCode: `# TODO: Convert string "100" to int and float and print types\n`,
                testCases: [{ input: '', output: 'Original: 100\nOriginal Type: <class \'str\'>\n\n\nInteger: 100\nInteger Type: <class \'int\'>\n\n\nFloat: 100.0\nFloat Type: <class \'float\'>' }],
                difficulty: 'medium'
            }
        ]
    };

    // Subject curricula definitions
    const subjectCurricula = {
        python: {
            title: "Python Programming",
            icon: "🐍",
            modules: [
                {
                    id: 'm1',
                    name: "Module 1 : Coding Practice (5 Questions)",
                    questions: pythonQuestions.m1
                },
                {
                    id: 'm2',
                    name: "Module 2 : Variables & Assignment (10 Questions)",
                    questions: pythonQuestions.m2
                },
                {
                    id: 'm3',
                    name: "Module 3 : Data Types & Structures (10 Questions)",
                    questions: pythonQuestions.m3
                }
            ]
        },
        c: {
            title: "C Programming",
            icon: "⚡",
            modules: [
                {
                    id: 'm1',
                    name: "Module 1 : Fundamentals of C",
                    questions: [
                        { id: 'c_m1_q1', title: 'Module 1 : C Input & Output', description: 'Write a C program to print Welcome to StudySpirit.', language: 'c', starterCode: '#include <stdio.h>\nint main() {\n    printf("Welcome to StudySpirit\\n");\n    return 0;\n}', testCases: [{ input: '', output: 'Welcome to StudySpirit' }], difficulty: 'easy' }
                    ]
                }
            ]
        },
        cpp: {
            title: "C++ Programming",
            icon: "🔷",
            modules: [
                {
                    id: 'm1',
                    name: "Module 1 : Object Oriented C++",
                    questions: [
                        { id: 'cpp_m1_q1', title: 'Module 1 : C++ Output', description: 'Write a C++ program to print Welcome to StudySpirit.', language: 'cpp', starterCode: '#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Welcome to StudySpirit" << endl;\n    return 0;\n}', testCases: [{ input: '', output: 'Welcome to StudySpirit' }], difficulty: 'easy' }
                    ]
                }
            ]
        },
        java: {
            title: "Java Programming",
            icon: "☕",
            modules: [
                {
                    id: 'm1',
                    name: "Module 1 : Java Fundamentals",
                    questions: [
                        { id: 'java_m1_q1', title: 'Module 1 : Java Output', description: 'Write a Java program to print Welcome to StudySpirit.', language: 'java', starterCode: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Welcome to StudySpirit");\n    }\n}', testCases: [{ input: '', output: 'Welcome to StudySpirit' }], difficulty: 'easy' }
                    ]
                }
            ]
        },
        dsa: {
            title: "Data Structures & Algorithms",
            icon: "🌳",
            modules: [
                {
                    id: 'm1',
                    name: "Module 1 : Linear Data Structures",
                    questions: [
                        { id: 'dsa_m1_q1', title: 'Module 1 : Array Sum', description: 'Read integers and print their sum.', language: 'cpp', starterCode: '#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << a + b;\n    return 0;\n}', testCases: [{ input: '10 20', output: '30' }], difficulty: 'easy' }
                    ]
                }
            ]
        }
    };

    const currentSubjKey = (selectedSubject || 'python').toLowerCase();
    const currData = subjectCurricula[currentSubjKey] || subjectCurricula.python;

    // Track collapse state for modules
    const [collapsedModules, setCollapsedModules] = useState({});
    const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);

    const toggleModule = (modId) => {
        setCollapsedModules(prev => ({ ...prev, [modId]: !prev[modId] }));
    };

    // Calculate solved questions count from dashboard stats
    const solvedTotal = dashboardData?.subjectStats?.[currentSubjKey]?.solved || 0;

    // Map module id → topic keyword the backend curated selector understands
    const moduleTopic = (modId, modName, subject) => {
        if (subject === 'python') {
            if (modId === 'm1') return 'Module 1 Introduction Python Syntax';
            if (modId === 'm2') return 'Module 2 Variables Assignment Python';
            if (modId === 'm3') return 'Module 3 Data Types List Dict Tuple Set Boolean Conversion Python';
        }
        return modName;
    };

    // Launch single question or whole module questions directly in code editor
    const launchQuestions = (questionsList, topicTitle) => {
        if (!questionsList || questionsList.length === 0) return;
        navigate('/code-editor', {
            state: {
                sessionId: `session_${Date.now()}`,
                challenges: questionsList,
                totalCount: questionsList.length,
                topic: topicTitle,
                difficulty: questionsList[0]?.difficulty || 'medium',
                secureMode: false
            }
        });
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            {/* Main Outer Container Card matching Image 2 */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all">
                
                {/* Subject Header Bar */}
                <div 
                    onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
                    className="flex items-center justify-between p-6 cursor-pointer bg-slate-50/50 hover:bg-slate-50 border-b border-gray-100 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-xl shadow-inner">
                            {currData.icon}
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">{currData.title}</h1>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                        {isHeaderCollapsed ? <ChevronDown size={22} /> : <ChevronUp size={22} />}
                    </button>
                </div>

                {/* Modules List */}
                {!isHeaderCollapsed && (
                    <div className="p-6 space-y-6">
                        {currData.modules.map((mod, modIdx) => {
                            const isCollapsed = collapsedModules[mod.id];
                            const questionsList = mod.questions || [];
                            const totalQuestions = questionsList.length;

                            return (
                                <div key={mod.id} className="border border-indigo-50 rounded-2xl overflow-hidden bg-slate-50/30">
                                    {/* Module Group Header */}
                                    <div 
                                        onClick={() => toggleModule(mod.id)}
                                        className="flex items-center justify-between p-4 bg-indigo-50/40 cursor-pointer hover:bg-indigo-50/70 transition-colors border-b border-indigo-50"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <Folder size={18} className="text-indigo-600" />
                                            <h3 className="font-bold text-sm text-gray-900">{mod.name}</h3>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    launchQuestions(questionsList, mod.name);
                                                }}
                                                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1"
                                            >
                                                <Play size={12} className="fill-current" />
                                                <span>Practice All Module ({totalQuestions})</span>
                                            </button>
                                            <button className="text-gray-400 hover:text-gray-600">
                                                {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Submodules / Questions List */}
                                    {!isCollapsed && (
                                        <div className="p-4 space-y-3 bg-white">
                                            {questionsList.map((q, qIdx) => {
                                                const isDone = modIdx === 0 && qIdx === 0 && solvedTotal > 0;
                                                return (
                                                    <div 
                                                        key={q.id || qIdx}
                                                        className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/60 border border-slate-100 hover:border-indigo-200 transition-all group"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0">
                                                                <FileText size={18} />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-sm text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                                    {q.title}
                                                                </h4>
                                                                <p className="text-xs text-gray-400 font-medium">
                                                                    1 Problem • {currData.title} Practice
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-6">
                                                            <div className="text-right">
                                                                <span className="text-xs font-bold text-indigo-600 block">
                                                                    {isDone ? '1 / 1 Done' : '0 / 1 Done'}
                                                                </span>
                                                                <div className="w-20 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                                                    <div 
                                                                        className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                                                                        style={{ width: isDone ? '100%' : '0%' }}
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Practice Button */}
                                                            <button
                                                                onClick={() => launchQuestions([q], q.title)}
                                                                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 transform hover:scale-105 active:scale-95"
                                                            >
                                                                <Play size={13} className="fill-current" />
                                                                <span>Practice</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
