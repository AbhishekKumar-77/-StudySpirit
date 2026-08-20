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

export const PYTHON_MODULE_2_VARIABLES_QUESTIONS = [
    {
        id: 'py-m2-var-q1',
        question: 'Q1. What does a variable represent in Python?',
        options: [
            'A fixed memory location',
            'A name referring to an object',
            'A command for creating data',
            'A keyword for storing values'
        ],
        correct: 1,
        explanation: 'In Python, a variable is best understood as a name/reference that refers to an object. For example, in x = 10, x refers to the integer object 10.',
        keyConcept: 'Variables act as references/names pointing to objects in memory.',
        subject: 'Python Programming',
        topic: 'Module 2 : Variables'
    },
    {
        id: 'py-m2-var-q2',
        question: 'Q2. Which statement correctly creates a variable in Python?',
        options: [
            'int age = 20',
            'variable age = 20',
            'age = 20',
            'create age = 20'
        ],
        correct: 2,
        explanation: 'Python does not require a type declaration when assigning a value. age = 20 creates the name age and makes it refer to the integer object 20.',
        keyConcept: 'Variable creation in Python uses simple assignment without explicit type declarations.',
        subject: 'Python Programming',
        topic: 'Module 2 : Variables'
    },
    {
        id: 'py-m2-var-q3',
        question: 'Q3. Which of the following is a valid Python variable name?',
        options: [
            '2student',
            'student-name',
            'student_name',
            'student name'
        ],
        correct: 2,
        explanation: 'Python identifiers can contain letters, digits, and underscores, but they cannot start with a digit or contain spaces/hyphens.',
        keyConcept: 'Python variable names must use letters, digits, or underscores and cannot start with a number.',
        subject: 'Python Programming',
        topic: 'Module 2 : Variables'
    },
    {
        id: 'py-m2-var-q4',
        question: 'Q4. Which statement about Python variable names is correct?',
        options: [
            'Python variable names are case-sensitive',
            'Python variable names ignore letter case',
            'Python variable names must contain uppercase letters',
            'Python variable names cannot contain underscores'
        ],
        correct: 0,
        explanation: 'Python is case-sensitive. Therefore, name, Name, and NAME are treated as different identifiers.',
        keyConcept: 'Case-sensitivity in Python variable naming.',
        subject: 'Python Programming',
        topic: 'Module 2 : Variables'
    },
    {
        id: 'py-m2-var-q5',
        question: 'Q5. Which of the following cannot be used as a normal variable name?',
        options: [
            'student',
            '_marks',
            'total_marks',
            'class'
        ],
        correct: 3,
        explanation: 'class is a Python reserved keyword and has a predefined meaning in the language. Reserved keywords cannot be used as ordinary variable names.',
        keyConcept: 'Reserved keywords cannot be used as identifiers.',
        subject: 'Python Programming',
        topic: 'Module 2 : Variables'
    },
    {
        id: 'py-m2-var-q6',
        question: 'Q6. What does dynamic typing mean in Python?',
        options: [
            'Variables cannot change their values',
            'Names can refer to objects of different types at different times',
            'Every variable must have a fixed declared type',
            'Python automatically removes all object types'
        ],
        correct: 1,
        explanation: 'Python is dynamically typed. For example: x = 10; x = "Python". The name x first refers to an integer object and later to a string object.',
        keyConcept: 'Dynamic typing allows names to re-bind to objects of different data types.',
        subject: 'Python Programming',
        topic: 'Module 2 : Variables'
    },
    {
        id: 'py-m2-var-q7',
        question: 'Q7. Which statement demonstrates multiple assignment?',
        options: [
            'x = 10, 20',
            'x, y = 10, 20',
            'x + y = 10 + 20',
            'x = y == 10'
        ],
        correct: 1,
        explanation: 'Python allows multiple variables to receive multiple values in a single statement: x, y = 10, 20.',
        keyConcept: 'Multiple assignment assigns values to multiple variables simultaneously.',
        subject: 'Python Programming',
        topic: 'Module 2 : Variables'
    },
    {
        id: 'py-m2-var-q8',
        question: 'Q8. Which statement assigns the same value to three variables?',
        options: [
            'a, b, c = 0',
            'a = b = c = 0',
            'a + b + c = 0',
            'a, b, c == 0'
        ],
        correct: 1,
        explanation: 'Chained assignment allows the same value to be assigned to multiple names: a = b = c = 0.',
        keyConcept: 'Chained assignment syntax (a = b = c = 0).',
        subject: 'Python Programming',
        topic: 'Module 2 : Variables'
    },
    {
        id: 'py-m2-var-q9',
        question: 'Q9. Which Python statement correctly swaps the values of a and b?',
        options: [
            'a = b; b = a',
            'a, b = b, a',
            'swap(a, b)',
            'a == b'
        ],
        correct: 1,
        explanation: 'Python supports tuple unpacking, allowing values to be exchanged directly: a, b = b, a. No temporary variable is required.',
        keyConcept: 'Variable value swapping using tuple unpacking.',
        subject: 'Python Programming',
        topic: 'Module 2 : Variables'
    },
    {
        id: 'py-m2-var-q10',
        question: 'Q10. Which operator compares the values of two objects?',
        options: [
            '=',
            'is',
            '==',
            ':='
        ],
        correct: 2,
        explanation: '== checks value equality. The is operator checks whether two references point to the exact same object in memory.',
        keyConcept: 'Value equality operator (==) vs Object identity operator (is).',
        subject: 'Python Programming',
        topic: 'Module 2 : Variables'
    },
    {
        id: 'py-m2-var-q11',
        question: `Q11. What will be the output?\nx = 10\nprint(x)\n\nx = 20\nprint(x)`,
        options: [
            '10\n10',
            '20\n20',
            '10\n20',
            '20\n10'
        ],
        correct: 2,
        explanation: 'Initially, x refers to 10. After x = 20, the name x refers to 20. Therefore, the two outputs are 10 and 20.',
        keyConcept: 'Re-assignment updates the object reference of a variable.',
        subject: 'Python Programming',
        topic: 'Module 2 : Variables'
    },
    {
        id: 'py-m2-var-q12',
        question: `Q12. What will be printed?\na, b, c = 10, 20, 30\nprint(b)`,
        options: [
            '10',
            '20',
            '30',
            '60'
        ],
        correct: 1,
        explanation: 'Multiple assignment maps the values according to their positions: a → 10, b → 20, c → 30. Therefore, print(b) displays 20.',
        keyConcept: 'Positional mapping in tuple unpacking / multiple assignment.',
        subject: 'Python Programming',
        topic: 'Module 2 : Variables'
    },
    {
        id: 'py-m2-var-q13',
        question: `Q13. What is the output?\na = 10\nb = 20\n\na, b = b, a\n\nprint(a)\nprint(b)`,
        options: [
            '10\n20',
            '20\n10',
            '10\n10',
            '20\n20'
        ],
        correct: 1,
        explanation: 'The right side is evaluated first: b, a → 20, 10. Then those values are assigned: a = 20, b = 10.',
        keyConcept: 'Right-hand side evaluation before assignment during tuple unpacking.',
        subject: 'Python Programming',
        topic: 'Module 2 : Variables'
    },
    {
        id: 'py-m2-var-q14',
        question: `Q14. What will this code print?\nx = 25\nprint(type(x))\n\nx = "Python"\nprint(type(x))`,
        options: [
            "<class 'str'>\n<class 'int'>",
            "<class 'int'>\n<class 'str'>",
            "<class 'float'>\n<class 'str'>",
            "<class 'int'>\n<class 'float'>"
        ],
        correct: 1,
        explanation: 'Initially, x refers to integer 25. Later, it refers to string "Python". type(x) reflects the data type of the currently referenced object.',
        keyConcept: 'type() function reflects current object data type.',
        subject: 'Python Programming',
        topic: 'Module 2 : Variables'
    },
    {
        id: 'py-m2-var-q15',
        question: `Q15. What will be the output?\na = b = c = 5\n\nprint(a)\nprint(b)\nprint(c)`,
        options: [
            '5\n0\n0',
            '0\n5\n0',
            '5\n5\n5',
            '5\n5\n0'
        ],
        correct: 2,
        explanation: 'The statement a = b = c = 5 assigns the value 5 to all three names.',
        keyConcept: 'Chained assignment sets all targets to the same value.',
        subject: 'Python Programming',
        topic: 'Module 2 : Variables'
    },
    {
        id: 'py-m2-var-q16',
        question: `Q16. Consider the following code:\na = [1, 2]\nb = a\nWhich statement is correct?`,
        options: [
            'a and b refer to the same list object',
            'a and b contain different list objects',
            'b stores only the first element of a',
            'a becomes a copy of b'
        ],
        correct: 0,
        explanation: 'b = a makes b refer to the exact same list object that a refers to in memory. It does not create a new copy.',
        keyConcept: 'Reference aliasing for mutable objects in Python.',
        subject: 'Python Programming',
        topic: 'Module 2 : Variables'
    },
    {
        id: 'py-m2-var-q17',
        question: `Q17. Consider:\na = [1, 2]\nb = [1, 2]\nWhich statement is generally correct?`,
        options: [
            'a == b is False',
            'a == b is True',
            'a is b must be True',
            'a and b cannot contain equal values'
        ],
        correct: 1,
        explanation: '== compares values. Both lists contain identical elements [1, 2], so a == b is True, even though a is b is False.',
        keyConcept: 'Value equality vs Memory identity comparison.',
        subject: 'Python Programming',
        topic: 'Module 2 : Variables'
    },
    {
        id: 'py-m2-var-q18',
        question: 'Q18. Which statement correctly describes the difference between == and is?',
        options: [
            '== checks identity, while is checks value',
            '== checks value equality, while is checks identity',
            'Both operators always perform the same comparison',
            '== assigns values, while is assigns objects'
        ],
        correct: 1,
        explanation: '== checks value equality, while is checks object identity in memory.',
        keyConcept: '== vs is operator semantics.',
        subject: 'Python Programming',
        topic: 'Module 2 : Variables'
    },
    {
        id: 'py-m2-var-q19',
        question: 'Q19. Which variable name follows Python\'s naming rules and also follows a common naming convention?',
        options: [
            'StudentName',
            'student-name',
            'student name',
            'student_name'
        ],
        correct: 3,
        explanation: 'student_name is valid and follows the standard Python PEP 8 convention of using snake_case for variable names.',
        keyConcept: 'snake_case convention in Python (PEP 8).',
        subject: 'Python Programming',
        topic: 'Module 2 : Variables'
    },
    {
        id: 'py-m2-var-q20',
        question: `Q20. Consider the following code:\nx = 10\ny = x\nx = 20\n\nprint(y)\nWhat is the output?`,
        options: [
            '10',
            '20',
            '30',
            'Error'
        ],
        correct: 0,
        explanation: 'Initially x and y refer to integer 10. When x = 20 runs, x is re-bound to integer 20, but y still refers to 10. Output is 10.',
        keyConcept: 'Independent variable binding to immutable integer objects.',
        subject: 'Python Programming',
        topic: 'Module 2 : Variables'
    }
];

export const PYTHON_MODULE_2_DATA_QUESTIONS = [
    {
        id: 'py-m2-data-q1',
        question: 'Q1. Which data type is used to represent whole numbers in Python?',
        options: [
            'float',
            'int',
            'str',
            'bool'
        ],
        correct: 1,
        explanation: 'The int data type represents whole numbers such as 10, 0, and -25 without a decimal point.',
        keyConcept: 'int represents whole integers.',
        subject: 'Python Programming',
        topic: 'Module 2 : Data Types'
    },
    {
        id: 'py-m2-data-q2',
        question: 'Q2. Which of the following is a floating-point value?',
        options: [
            '25',
            '"25.5"',
            '25.5',
            'True'
        ],
        correct: 2,
        explanation: '25.5 is a numeric value containing a decimal part, so Python represents it as a float. "25.5" is a string because it is enclosed in quotes.',
        keyConcept: 'float data type represents real numbers with decimal points.',
        subject: 'Python Programming',
        topic: 'Module 2 : Data Types'
    },
    {
        id: 'py-m2-data-q3',
        question: 'Q3. Which values can a Boolean variable contain?',
        options: [
            'Yes and No',
            '1 and 0 only',
            'True and False',
            '"True" and "False"'
        ],
        correct: 2,
        explanation: 'Python\'s Boolean type, bool, has exactly two truth values: True and False (capitalized without quotes).',
        keyConcept: 'bool type values: True and False.',
        subject: 'Python Programming',
        topic: 'Module 2 : Data Types'
    },
    {
        id: 'py-m2-data-q4',
        question: 'Q4. What does None represent in Python?',
        options: [
            'The integer zero',
            'An empty string',
            'Absence of a meaningful value',
            'A Boolean false value'
        ],
        correct: 2,
        explanation: 'None is a special singleton object in Python used to signify the absence of a value or null state.',
        keyConcept: 'None represents null or absence of value.',
        subject: 'Python Programming',
        topic: 'Module 2 : Data Types'
    },
    {
        id: 'py-m2-data-q5',
        question: 'Q5. Which data type represents a sequence of characters?',
        options: [
            'list',
            'str',
            'set',
            'dict'
        ],
        correct: 1,
        explanation: 'Strings use the str type and represent ordered sequences of characters, such as "Python" or "StudySpirit".',
        keyConcept: 'str type represents textual data.',
        subject: 'Python Programming',
        topic: 'Module 2 : Data Types'
    },
    {
        id: 'py-m2-data-q6',
        question: 'Q6. Which collection is ordered and mutable?',
        options: [
            'Tuple',
            'Set',
            'List',
            'None'
        ],
        correct: 2,
        explanation: 'A list is an ordered and mutable collection. Its elements can be modified, added, or removed after creation.',
        keyConcept: 'List: ordered and mutable.',
        subject: 'Python Programming',
        topic: 'Module 2 : Data Types'
    },
    {
        id: 'py-m2-data-q7',
        question: 'Q7. Which collection is ordered and immutable?',
        options: [
            'List',
            'Tuple',
            'Set',
            'Dictionary'
        ],
        correct: 1,
        explanation: 'A tuple maintains its element order and cannot be modified after creation (immutable).',
        keyConcept: 'Tuple: ordered and immutable.',
        subject: 'Python Programming',
        topic: 'Module 2 : Data Types'
    },
    {
        id: 'py-m2-data-q8',
        question: 'Q8. What is the main characteristic of a set?',
        options: [
            'It stores key-value pairs',
            'It stores only unique elements',
            'It stores elements by fixed indexes',
            'It stores only strings'
        ],
        correct: 1,
        explanation: 'A set is an unordered collection designed to contain unique elements. Duplicate values are automatically eliminated.',
        keyConcept: 'Set: unordered collection of unique elements.',
        subject: 'Python Programming',
        topic: 'Module 2 : Data Types'
    },
    {
        id: 'py-m2-data-q9',
        question: 'Q9. Which data structure stores information as key-value pairs?',
        options: [
            'List',
            'Tuple',
            'Set',
            'Dictionary'
        ],
        correct: 3,
        explanation: 'A dictionary (dict) stores data using key-value pairs, e.g. student = {"name": "Rahul", "age": 20}.',
        keyConcept: 'Dictionary stores data in key-value format.',
        subject: 'Python Programming',
        topic: 'Module 2 : Data Types'
    },
    {
        id: 'py-m2-data-q10',
        question: 'Q10. What type of value does input() return by default?',
        options: [
            'int',
            'float',
            'str',
            'bool'
        ],
        correct: 2,
        explanation: 'input() always returns the user\'s entry as a string (str). Explicit type casting like int() or float() is needed for numbers.',
        keyConcept: 'input() always returns a string (str).',
        subject: 'Python Programming',
        topic: 'Module 2 : Data Types'
    },
    {
        id: 'py-m2-data-q11',
        question: `Q11. What is the output?\nx = 10\ny = 2.5\n\nprint(type(x))\nprint(type(y))`,
        options: [
            "<class 'float'>\n<class 'int'>",
            "<class 'int'>\n<class 'float'>",
            "<class 'str'>\n<class 'float'>",
            "<class 'int'>\n<class 'int'>"
        ],
        correct: 1,
        explanation: '10 is an integer (<class \'int\'>), while 2.5 is a float (<class \'float\'>).',
        keyConcept: 'type() output for int and float numeric literals.',
        subject: 'Python Programming',
        topic: 'Module 2 : Data Types'
    },
    {
        id: 'py-m2-data-q12',
        question: `Q12. What will this code print?\nnumbers = [10, 20, 30]\nnumbers[1] = 50\n\nprint(numbers)`,
        options: [
            '[10, 20, 30]',
            '[50, 20, 30]',
            '[10, 50, 30]',
            '[10, 20, 50]'
        ],
        correct: 2,
        explanation: 'Lists are mutable. Index 1 refers to the second element (20), which is replaced with 50, resulting in [10, 50, 30].',
        keyConcept: 'List item modification by index.',
        subject: 'Python Programming',
        topic: 'Module 2 : Data Types'
    },
    {
        id: 'py-m2-data-q13',
        question: `Q13. What will happen when this code runs?\nnumbers = (10, 20, 30)\nnumbers[1] = 50`,
        options: [
            'The tuple becomes [10, 50, 30]',
            'The value at index 1 becomes 50',
            'Python raises an error',
            'The tuple becomes {10, 50, 30}'
        ],
        correct: 2,
        explanation: 'Tuples are immutable. Attempting item assignment raises a TypeError.',
        keyConcept: 'Tuple immutability prevents item reassignment.',
        subject: 'Python Programming',
        topic: 'Module 2 : Data Types'
    },
    {
        id: 'py-m2-data-q14',
        question: `Q14. What is the output?\nx = "25"\ny = int(x)\n\nprint(type(x))\nprint(type(y))`,
        options: [
            "<class 'int'>\n<class 'int'>",
            "<class 'str'>\n<class 'str'>",
            "<class 'str'>\n<class 'int'>",
            "<class 'int'>\n<class 'str'>"
        ],
        correct: 2,
        explanation: 'x is a string "25". int(x) converts it to integer 25. Therefore, types are str and int.',
        keyConcept: 'Explicit type casting using int().',
        subject: 'Python Programming',
        topic: 'Module 2 : Data Types'
    },
    {
        id: 'py-m2-data-q15',
        question: `Q15. What will be printed?\nnumbers = {10, 20, 20, 30, 30}\n\nprint(len(numbers))`,
        options: [
            '3',
            '4',
            '5',
            '2'
        ],
        correct: 0,
        explanation: 'A set contains only unique elements. Duplicate 20s and 30s are ignored, leaving {10, 20, 30} with length 3.',
        keyConcept: 'Set deduplication reduces unique length.',
        subject: 'Python Programming',
        topic: 'Module 2 : Data Types'
    },
    {
        id: 'py-m2-data-q16',
        question: `Q16. Consider the following code:\nx = input("Enter a number: ")\nprint(type(x))\nIf the user enters 100, what will be printed?`,
        options: [
            "<class 'int'>",
            "<class 'float'>",
            "<class 'str'>",
            "<class 'bool'>"
        ],
        correct: 2,
        explanation: 'Even when the user inputs digits like 100, input() returns a string "<class \'str\'>".',
        keyConcept: 'input() return type is always str.',
        subject: 'Python Programming',
        topic: 'Module 2 : Data Types'
    },
    {
        id: 'py-m2-data-q17',
        question: 'Q17. Which statement correctly describes the difference between a list and a tuple?',
        options: [
            'Lists allow duplicates, while tuples do not',
            'Lists are mutable, while tuples are immutable',
            'Lists use keys, while tuples use values',
            'Lists are unordered, while tuples are ordered'
        ],
        correct: 1,
        explanation: 'Both lists and tuples maintain order and allow duplicates. The primary distinction is that lists are mutable while tuples are immutable.',
        keyConcept: 'List vs Tuple mutability distinction.',
        subject: 'Python Programming',
        topic: 'Module 2 : Data Types'
    },
    {
        id: 'py-m2-data-q18',
        question: `Q18. Consider the following code:\nstudent = {\n    "name": "Aman",\n    "age": 21\n}\n\nprint(student["name"])\nWhat will be printed?`,
        options: [
            'name',
            'Aman',
            '"name"',
            '21'
        ],
        correct: 1,
        explanation: '"name" is the key, and "Aman" is its associated value. Accessing student["name"] returns "Aman".',
        keyConcept: 'Dictionary key lookup returns associated value.',
        subject: 'Python Programming',
        topic: 'Module 2 : Data Types'
    },
    {
        id: 'py-m2-data-q19',
        question: `Q19. Which statement is correct about the following values?\na = False\nb = 0\nc = None\nd = ""`,
        options: [
            'All four values have the same type',
            'a and b are both strings',
            'Each value represents a different Python object/type concept',
            'c and d are both Boolean values'
        ],
        correct: 2,
        explanation: 'False is bool, 0 is int, None is NoneType, and "" is str. They are distinct types with different roles.',
        keyConcept: 'Different falsy values belong to distinct data types.',
        subject: 'Python Programming',
        topic: 'Module 2 : Data Types'
    },
    {
        id: 'py-m2-data-q20',
        question: `Q20. A student wants to store student name, age, course, and marks with descriptive labels. Which data structure is the most natural choice?`,
        options: [
            'List',
            'Tuple',
            'Set',
            'Dictionary'
        ],
        correct: 3,
        explanation: 'A dictionary is ideal because each data item can be mapped to a meaningful descriptive key (e.g. "name", "age", "course", "marks").',
        keyConcept: 'Dictionary structure for labeled data representation.',
        subject: 'Python Programming',
        topic: 'Module 2 : Data Types'
    }
];

