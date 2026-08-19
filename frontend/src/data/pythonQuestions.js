export const PYTHON_MODULE_1_QUESTIONS = [
    {
        id: 'py-m1-q1',
        question: 'Q1. What is programming?',
        options: [
            'Creating instructions for computers',
            'Designing components for computers',
            'Managing files on a computer',
            'Connecting devices to a network'
        ],
        correct: 0,
        explanation: 'Programming is the process of creating instructions that tell a computer how to perform a particular task or solve a problem.',
        keyConcept: 'Programming provides sequential instructions for computer execution.',
        subject: 'Python Programming',
        topic: 'Module 1 : Introduction to Programming'
    },
    {
        id: 'py-m1-q2',
        question: 'Q2. Who is known as the creator of Python?',
        options: [
            'James Gosling',
            'Guido van Rossum',
            'Dennis Ritchie',
            'Bjarne Stroustrup'
        ],
        correct: 1,
        explanation: 'Python was created by Guido van Rossum. He started developing Python in the late 1980s, and its first public release came in 1991.',
        keyConcept: 'Guido van Rossum created Python in 1989-1991.',
        subject: 'Python Programming',
        topic: 'Module 1 : Introduction to Programming'
    },
    {
        id: 'py-m1-q3',
        question: 'Q3. In which year was Python first publicly released?',
        options: [
            '1989',
            '1990',
            '1991',
            '1995'
        ],
        correct: 2,
        explanation: 'Python was first publicly released in 1991. Its development had started earlier, around the end of the 1980s.',
        keyConcept: 'Python first public release year: 1991.',
        subject: 'Python Programming',
        topic: 'Module 1 : Introduction to Programming'
    },
    {
        id: 'py-m1-q4',
        question: 'Q4. Which feature is strongly associated with Python?',
        options: [
            'Complex syntax',
            'Readable syntax',
            'Hardware syntax',
            'Assembly syntax'
        ],
        correct: 1,
        explanation: 'Python is popular partly because its syntax is relatively simple and readable, making it easier to learn and develop programs quickly.',
        keyConcept: 'Python features clean and readable syntax.',
        subject: 'Python Programming',
        topic: 'Module 1 : Introduction to Programming'
    },
    {
        id: 'py-m1-q5',
        question: 'Q5. Which field commonly uses Python?',
        options: [
            'Data Science',
            'Artificial Intelligence',
            'Web Development',
            'All of these'
        ],
        correct: 3,
        explanation: 'Python is widely used in Data Science, Artificial Intelligence, Machine Learning, Web Development, Automation, Scientific Computing, and many other areas.',
        keyConcept: 'Python is a multi-domain general-purpose language.',
        subject: 'Python Programming',
        topic: 'Module 1 : Introduction to Programming'
    },
    {
        id: 'py-m1-q6',
        question: 'Q6. Which language is generally considered closest to hardware among Python, Java, and C?',
        options: [
            'Python',
            'Java',
            'C',
            'All equally'
        ],
        correct: 2,
        explanation: 'C provides relatively low-level control over memory and hardware resources compared with Python and Java, which are higher-level languages.',
        keyConcept: 'C language provides low-level hardware memory control.',
        subject: 'Python Programming',
        topic: 'Module 1 : Introduction to Programming'
    },
    {
        id: 'py-m1-q7',
        question: 'Q7. Which Python version family is used for modern Python development?',
        options: [
            'Python 1.x',
            'Python 2.x',
            'Python 3.x',
            'Python 4.x'
        ],
        correct: 2,
        explanation: 'Modern Python development uses the Python 3.x series. Python 2 reached its official end of life in 2020.',
        keyConcept: 'Python 3.x is the standard for modern development.',
        subject: 'Python Programming',
        topic: 'Module 1 : Introduction to Programming'
    },
    {
        id: 'py-m1-q8',
        question: 'Q8. What is the primary purpose of an interpreter?',
        options: [
            'Execute program instructions',
            'Design program interfaces',
            'Store program files',
            'Manage computer hardware'
        ],
        correct: 0,
        explanation: 'An interpreter provides a runtime mechanism for executing program instructions. In Python, the implementation handles the execution of Python programs.',
        keyConcept: 'Interpreters execute source/bytecode instructions.',
        subject: 'Python Programming',
        topic: 'Module 1 : Introduction to Programming'
    },
    {
        id: 'py-m1-q9',
        question: 'Q9. What is the purpose of running a first program such as print("Hello")?',
        options: [
            'Test basic execution',
            'Create a database',
            'Install Python',
            'Configure networking'
        ],
        correct: 0,
        explanation: 'A simple first program verifies that the Python installation and execution environment are working correctly.',
        keyConcept: 'Sanity testing environment setup with print("Hello").',
        subject: 'Python Programming',
        topic: 'Module 1 : Introduction to Programming'
    },
    {
        id: 'py-m1-q10',
        question: `Q10. Which statement executes first?\nprint("Start")\nprint("Middle")\nprint("End")`,
        options: [
            'Start',
            'Middle',
            'End',
            'All together'
        ],
        correct: 0,
        explanation: 'Python normally executes statements sequentially from top to bottom. Therefore, "Start" is printed first.',
        keyConcept: 'Sequential execution flow from top to bottom.',
        subject: 'Python Programming',
        topic: 'Module 1 : Introduction to Programming'
    },
    {
        id: 'py-m1-q11',
        question: `Q11. What will be the output?\nBEGIN\n    PRINT "Python"\n    PRINT "Programming"\nEND`,
        options: [
            'Programming\nPython',
            'Python\nProgramming',
            'Python Programming',
            'Programming Python'
        ],
        correct: 1,
        explanation: 'The two PRINT statements execute sequentially. Therefore, "Python" is printed first, followed by "Programming".',
        keyConcept: 'Sequential output printing line by line.',
        subject: 'Python Programming',
        topic: 'Module 1 : Introduction to Programming'
    },
    {
        id: 'py-m1-q12',
        question: `Q12. What will be printed by this Python code?\nprint("Hello")\nprint("StudySpirit")`,
        options: [
            'Hello StudySpirit',
            'StudySpirit Hello',
            'Hello followed by StudySpirit',
            'StudySpirit followed by Hello'
        ],
        correct: 2,
        explanation: 'Each print() creates a separate line by default. The first statement prints Hello, and the second prints StudySpirit.',
        keyConcept: 'Separate print statements produce sequential output lines.',
        subject: 'Python Programming',
        topic: 'Module 1 : Introduction to Programming'
    },
    {
        id: 'py-m1-q13',
        question: `Q13. What is the output?\nBEGIN\n    PRINT "A"\n    PRINT "B"\n    PRINT "C"\nEND`,
        options: [
            'A B C',
            'C B A',
            'A C B',
            'B A C'
        ],
        correct: 0,
        explanation: 'The instructions are executed in their written order: A → B → C.',
        keyConcept: 'Instruction order preservation during program execution.',
        subject: 'Python Programming',
        topic: 'Module 1 : Introduction to Programming'
    },
    {
        id: 'py-m1-q14',
        question: `Q14. What will the following code print?\nprint(10)\nprint(20)\nprint(10 + 20)`,
        options: [
            '10\n20\n30',
            '30\n20\n10',
            '10 20 30',
            '10\n30\n20'
        ],
        correct: 0,
        explanation: 'The first two statements print 10 and 20. The third evaluates 10 + 20, producing 30.',
        keyConcept: 'Expression evaluation and sequential output in Python.',
        subject: 'Python Programming',
        topic: 'Module 1 : Introduction to Programming'
    },
    {
        id: 'py-m1-q15',
        question: `Q15. What is the output?\nBEGIN\n    PRINT "Start"\n    PRINT 5 + 3\n    PRINT "End"\nEND`,
        options: [
            'Start\n8\nEnd',
            '8\nStart\nEnd',
            'Start\nEnd\n8',
            'End\n8\nStart'
        ],
        correct: 0,
        explanation: 'The statements execute from top to bottom. 5 + 3 is evaluated as 8, so the output order is Start → 8 → End.',
        keyConcept: 'Arithmetic expression evaluation in execution order.',
        subject: 'Python Programming',
        topic: 'Module 1 : Introduction to Programming'
    },
    {
        id: 'py-m1-q16',
        question: 'Q16. Which statement best describes Python\'s execution in CPython?',
        options: [
            'Source → Bytecode → PVM',
            'Source → Machine code → PVM',
            'Source → Java code → PVM',
            'Source → HTML → PVM'
        ],
        correct: 0,
        explanation: 'In CPython, Python source code is compiled into bytecode, which is then executed by the Python Virtual Machine (PVM).',
        keyConcept: 'CPython pipeline: Source → Bytecode → PVM.',
        subject: 'Python Programming',
        topic: 'Module 1 : Introduction to Programming'
    },
    {
        id: 'py-m1-q17',
        question: 'Q17. A student says, "Python is interpreted, so it never uses compilation." What is the best answer?',
        options: [
            'The statement is completely correct',
            'The statement is partly incorrect',
            'The statement is correct only for Java',
            'The statement is correct only for C'
        ],
        correct: 1,
        explanation: 'Python is commonly called interpreted, but CPython first compiles source code into bytecode before that bytecode is executed by the Python Virtual Machine.',
        keyConcept: 'Python uses compilation to bytecode before interpretation.',
        subject: 'Python Programming',
        topic: 'Module 1 : Introduction to Programming'
    },
    {
        id: 'py-m1-q18',
        question: 'Q18. Which language generally provides the most direct control over memory?',
        options: [
            'Python',
            'Java',
            'C',
            'HTML'
        ],
        correct: 2,
        explanation: 'C provides direct mechanisms such as pointers and manual memory management, giving programmers greater control over memory than Python or Java.',
        keyConcept: 'Low-level vs High-level language memory management.',
        subject: 'Python Programming',
        topic: 'Module 1 : Introduction to Programming'
    },
    {
        id: 'py-m1-q19',
        question: 'Q19. Which statement about Python\'s history is correct?',
        options: [
            'Python was created by Guido van Rossum',
            'Python was created by James Gosling',
            'Python was created by Dennis Ritchie',
            'Python was created by Bjarne Stroustrup'
        ],
        correct: 0,
        explanation: 'Guido van Rossum created Python. He began working on it in the late 1980s, and Python was publicly released in 1991.',
        keyConcept: 'Guido van Rossum is the creator of Python.',
        subject: 'Python Programming',
        topic: 'Module 1 : Introduction to Programming'
    },
    {
        id: 'py-m1-q20',
        question: `Q20. Consider the following execution flow:\nPython Source Code\n        ↓\n      Bytecode\n        ↓\n       PVM\n        ↓\n    Execution\nWhat does PVM stand for?`,
        options: [
            'Python Program Manager',
            'Python Virtual Machine',
            'Python Version Manager',
            'Python Variable Machine'
        ],
        correct: 1,
        explanation: 'PVM stands for Python Virtual Machine. It is the component responsible for executing Python bytecode in the CPython execution model.',
        keyConcept: 'PVM = Python Virtual Machine.',
        subject: 'Python Programming',
        topic: 'Module 1 : Introduction to Programming'
    }
];
