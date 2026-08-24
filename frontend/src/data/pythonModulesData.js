// Python Programming Curriculum - Modules 1, 2, and 3

export const PYTHON_MODULES = [
    {
        id: 'py-mod-1',
        courseCode: 'CSE105',
        courseName: 'Python Programming',
        unit: 'Module 1',
        title: 'Module 1 — Introduction to Programming',
        subtitle: 'Think like a programmer before writing code',
        goal: 'Think like a programmer before writing code.',
        type: 'NOTE',
        pageCount: 18,
        readTime: '12 min read',
        verified: true,
        verificationBadge: 'Official Curriculum',
        shortNotes: `SHORT NOTES — MODULE 1

1. Programming Concept
Giving a computer precise, step-by-step instructions to solve a problem.
Mindset: Understand -> Break Down -> Decide -> Write Instructions -> Test -> Improve.

2. Python History & Creator
Creator: Guido van Rossum (developed in late 1980s, first release 1991).
Design Goals: Readability, simplicity, productivity, clear syntax.

3. Applications of Python
AI & ML (NumPy, Pandas, PyTorch, TensorFlow), Web Dev (Django, Flask, FastAPI), Automation, Data Science, Scientific Computing.

4. Python vs C vs Java
Python: High-level, concise, productive, excellent for AI/Data.
C: Lower-level control, native compilation, fast system programming.
Java: High-level, verbose, strong enterprise & JVM ecosystem.

5. Versions
Python 3.x is the active modern version (Python 2 reached End of Life in 2020).

6. Execution Model (CPython Trap)
CPython is the standard implementation.
Source Code -> Bytecode (.pyc) -> Python Virtual Machine (PVM) -> Execution.

7. Execution Flow & Tools
Sequential execution (top to bottom).
Function print() displays output.
Editor: VS Code. Terminal verification: python --version.`,
        fullNotes: `WELCOME TO PROGRAMMING
Module 1 — Introduction to Programming
Goal: Think like a programmer before writing code.

🧠 1. Before You Write Code: Think Like a Programmer
Programming is not primarily about remembering syntax.
A programmer's real job is:
Understand → Break Down → Decide → Write Instructions → Test → Improve

Imagine you want a computer to make tea.
A human can understand:
"Make me a cup of tea."
A computer cannot.
You must break it into instructions:
Start
  ↓
Boil water
  ↓
Add tea
  ↓
Add milk
  ↓
Add sugar
  ↓
Mix
  ↓
Serve

This is the foundation of programming.

💡 Programmer's Mindset
Before writing code, ask:
- What is the problem?
- What information do I have?
- What result do I want?
- What steps are required?
- In what order should those steps happen?

Programming = converting a problem into instructions a computer can execute.

--------------------------------------------------
📌 2. What Is Programming?
Programming is the process of creating a set of instructions that tells a computer what to do and how to do it.

A program can:
- Calculate something
- Store information
- Process data
- Make decisions
- Repeat tasks
- Communicate with users
- Control systems
- Automate work

Real-world example:
Suppose StudySpirit needs to calculate a student's average.
A human thinks:
Take marks → Add marks → Divide by number of subjects → Show average
A programmer converts this thinking into code.

⚠️ Important:
A computer does not understand your intention. It follows the instructions you provide.
So: Good programming starts with clear thinking, not typing.

--------------------------------------------------
🐍 3. Why Was Python Created?
Before Python, programmers often had to work with languages that required more detailed syntax and more effort for common programming tasks.

Guido van Rossum wanted a language that emphasized:
- Readability
- Simplicity
- Productivity
- Clear syntax
- Ease of learning

Python was developed in the late 1980s and was first publicly released in 1991.

Python's philosophy:
Python's design strongly emphasizes code that is readable, clear, and easy to understand.
That's one reason Python became extremely popular among beginners and professionals.

--------------------------------------------------
🗓️ 4. History of Python — Remember the Timeline
Late 1980s → Guido van Rossum begins developing Python
1991       → First public release
Python 2   → Released 2000 (End of life 2020)
Python 3   → Modern active Python family

Guido van Rossum:
Guido van Rossum is the creator of Python. He was originally working at CWI (Centrum Wiskunde & Informatica) in the Netherlands when Python was developed. Python was influenced by the ABC programming language, among other ideas.

⭐ Exam Point:
- Creator: Guido van Rossum
- First public release: 1991
- Modern major version: Python 3.x

--------------------------------------------------
⭐ 5. Why Python?
Python became popular because it allows programmers to express ideas with relatively little syntax.

Compare:
Python:
print("Hello")
The code is immediately readable.

This simplicity makes Python useful for: Beginners, Students, Developers, Data Scientists, AI Engineers, Researchers, Automation Engineers.

Python's major strengths:
- Readable: Code is relatively easy to understand
- Beginner-friendly: Easier starting point
- Productive: Less boilerplate for many tasks
- Versatile: Used across many domains
- Large ecosystem: Thousands of libraries and frameworks
- Cross-platform: Implementations available for major operating systems
- Community: Large developer community

⚠️ But remember: Python is not automatically the best language for everything.
- C is important for systems and low-level programming.
- Java is widely used in enterprise applications and JVM-based systems.
- Python is extremely strong in AI, data science, automation, scripting, and rapid development.

--------------------------------------------------
🌐 6. Where Is Python Used?
Python is used professionally in many fields:
🤖 Artificial Intelligence & Machine Learning (NumPy, Pandas, Scikit-learn, PyTorch, TensorFlow)
📊 Data Science (Collect → Clean → Analyze → Visualize → Insights)
🌐 Web Development (Django, Flask, FastAPI)
⚙️ Automation (File processing, Report generation, Web scraping)
🔬 Scientific Computing (Research, Simulations, Mathematics)

--------------------------------------------------
⚔️ 7. Python vs C vs Java
Feature        | Python         | C                      | Java
Level          | High-level     | Lower-level control    | High-level
Syntax         | Concise        | More detailed          | More verbose
Memory         | Automatic      | Manual control         | Automatic (GC)
Execution      | Runtime/PVM    | Compiled to native     | JVM-based
Learning       | Beginner       | Moderate               | Moderate
Main strength  | Productivity   | System-level control   | Enterprise

--------------------------------------------------
🔢 8. Python Versions
- Python 2: Reached End of Life on January 1, 2020.
- Python 3: Modern standard (Python 3.10, 3.11, 3.12, 3.13). Always use Python 3 for new projects.

--------------------------------------------------
⚙️ 9. Interpreter vs Compiler
- Compiler: Translates full source code into machine/target code before execution.
- Interpreter: Executes program instructions through a runtime process line-by-line or via intermediate representation.

--------------------------------------------------
🧩 10. The Python Trap: "Python Is Only Interpreted"
Technically, CPython compiles source code into bytecode (.pyc) first, then executes it via the Python Virtual Machine (PVM).
Source Code → Compilation → Bytecode → Python Virtual Machine (PVM) → Execution.

--------------------------------------------------
💻 11. What Is CPython?
CPython is the standard, C-implemented Python engine. Other implementations include PyPy, Jython, and IronPython.

--------------------------------------------------
🛠️ 12. Installing & Running Python
Verify in terminal:
python --version  or  python3 --version

VS Code Workflow:
VS Code → Create hello.py → Write print("Hello StudySpirit") → Run → Observe Output.

--------------------------------------------------
▶️ 13. Understanding print() & Execution Flow
print("Hello StudySpirit")
Python executes statements sequentially from top to bottom.

--------------------------------------------------
❌ 14. Common Beginner Mistakes
1. Thinking programming = syntax (Logic & Algorithms come first).
2. Memorizing code without understanding intentions.
3. Running code without predicting expected output.
4. Confusing Python language with CPython implementation.

--------------------------------------------------
🚀 MINI PROJECT — Hello StudySpirit
Write your first Python script:
print("================================")
print("       STUDYSPIRIT")
print("================================")
print("Welcome to Programming")
print("Learn Python Step by Step")
print("Start Coding Today!")
print("================================")`
    },
    {
        id: 'py-mod-2',
        courseCode: 'CSE105',
        courseName: 'Python Programming',
        unit: 'Module 2',
        title: 'Module 2 — Variables',
        subtitle: 'Understand how Python stores, names, and works with data',
        goal: 'Understand how Python stores, names, and works with data.',
        type: 'NOTE',
        pageCount: 16,
        readTime: '10 min read',
        verified: true,
        verificationBadge: 'Official Curriculum',
        shortNotes: `SHORT NOTES — MODULE 2

1. Variables & Objects
A variable is a name/label referring to an object (not a fixed physical box).
name = "Python"  =>  name ──→ "Python" (str object)

2. Objects in Python
Every object has:
- Value (e.g. 10)
- Type (e.g. int)
- Identity (id(x) memory reference)

3. Variable Naming Rules
- Valid: letters, digits, underscore _
- Cannot start with a digit (e.g. 2name is INVALID)
- Cannot contain spaces or Python keywords (e.g. if, for, class)
- Python is Case-Sensitive: name != Name != NAME

4. Dynamic Typing
Variables do not require explicit type declaration and can refer to different object types over time.
x = 10 (int) -> x = "Hello" (str)

5. Assignments & Swapping
- Multiple Assignment: a, b = 10, 20
- Same Value: a = b = c = 0
- Swapping (No temp var): a, b = b, a

6. Value vs Identity (== vs is)
- == compares values (e.g. [1,2] == [1,2] -> True)
- is compares object identity (e.g. [1,2] is [1,2] -> False)`,
        fullNotes: `Module 2 — Variables
Goal: Understand how Python stores, names, and works with data.

🧠 1. What Is a Variable?
A variable is a name that refers to a value/object in a Python program.
Think of it as a label, not a physical box.

name = "Abhishek"
age = 21

Here:
name ───────→ "Abhishek"
age  ───────→ 21

In Python: Variable → reference → object.

--------------------------------------------------
📝 2. Creating a Variable & Dynamic Typing
Python determines the type from the object assigned:
name = "Abhishek"  # str
age = 21           # int
marks = 85.5       # float

You can check the type using: type(age)

--------------------------------------------------
🧩 3. Variables, Objects & Memory
An object is an instance of data with Value, Type, and Identity.
x = 100
- Value: 100
- Type: int
- Identity: id(x)

Reassigning a variable:
x = 10
x = 20  # Name x now refers to object 20

--------------------------------------------------
🏷️ 4. Variable Naming Rules
✅ Valid: name, age, student_name, _marks
❌ Invalid: 2name (starts with number), student-name (hyphen), student name (space), class (keyword)

Python is Case-Sensitive:
name = "A", Name = "B", NAME = "C" are 3 different variables!

--------------------------------------------------
🔑 5. Keywords
Reserved words in Python: if, else, for, while, def, class, return, import, True, False, None.
Check all keywords:
import keyword
print(keyword.kwlist)

--------------------------------------------------
🔄 6. Multiple Assignment & Swapping
- Multiple values: name, age, marks = "Abhishek", 21, 85
- Same value: a = b = c = 0
- Swapping variables:
a = 10
b = 20
a, b = b, a  # Now a = 20, b = 10!

--------------------------------------------------
🔍 7. Identity vs Value (== vs is)
- == compares values: [1, 2] == [1, 2] -> True
- is compares memory identity: [1, 2] is [1, 2] -> False

--------------------------------------------------
🚀 MINI PROJECT — Student Information System
student_name = "Abhishek"
roll_number = 101
age = 21
course = "B.Tech CSE"
university = "LPU"
marks = 85

print("================================")
print("      STUDENT INFORMATION")
print("================================")
print(f"Name       : {student_name}")
print(f"Roll No.   : {roll_number}")
print(f"Age        : {age}")
print(f"Course     : {course}")
print(f"University : {university}")
print(f"Marks      : {marks}")
print("================================")`
    },
    {
        id: 'py-mod-3',
        courseCode: 'CSE105',
        courseName: 'Python Programming',
        unit: 'Module 3',
        title: 'Module 3 — Data Types',
        subtitle: 'Understand numeric, text, boolean & collection data types',
        goal: 'Understand the different kinds of data Python can store, organize, and process.',
        type: 'NOTE',
        pageCount: 22,
        readTime: '15 min read',
        verified: true,
        verificationBadge: 'Official Curriculum',
        shortNotes: `SHORT NOTES — MODULE 3

1. Numeric Types
- int: Whole numbers (e.g. 21, -5)
- float: Decimal numbers (e.g. 99.50)
- complex: Real + Imaginary parts (e.g. 3 + 4j)

2. Boolean & None
- bool: True or False (Logical state)
- None: Represents absence of a value (Type: NoneType)

3. Strings (str)
- Immutable character sequences.
- Indexing: word[0] (positive), word[-1] (negative)
- Slicing: word[0:3]

4. Python Collections Comparison
- List [ ]: Ordered, Mutable, Allows Duplicates
- Tuple ( ): Ordered, Immutable, Allows Duplicates
- Set { }: Unordered, Mutable, Unique elements only
- Dictionary {k:v}: Key-Value pairs, Keys unique & hashable

5. Type Conversion & User Input
- int(), float(), str(), bool(), list(), tuple(), set()
- input() ALWAYS returns a string.
- Convert input: age = int(input("Enter age: "))
- Formatted output: print(f"My name is {name} and I am {age} years old.")`,
        fullNotes: `Module 3 — Data Types
Goal: Understand the different kinds of data Python can store, organize, and process.

🧠 1. What Is a Data Type?
A data type tells Python what kind of value an object represents and what operations can be performed on it.

--------------------------------------------------
🔢 2. Numbers & Special Types
- int: Whole numbers (21, 0, -25)
- float: Decimals (99.50, -2.5)
- complex: Complex numbers (3 + 4j -> z.real = 3.0, z.imag = 4.0)
- bool: True or False
- None: Absence of value (NoneType)

--------------------------------------------------
🔤 3. Strings (str)
Sequences of characters enclosed in quotes.
- Indexing: word = "Python" -> word[0] is 'P', word[-1] is 'n'
- Slicing: word[0:3] -> 'Pyt'
- Strings are IMMUTABLE (cannot reassign individual indices word[0] = 'J').

--------------------------------------------------
📦 4. Core Python Collections
- List [ ]: Ordered, Mutable, Allows Duplicates (data = ["Aman", 21, 85.5])
- Tuple ( ): Ordered, Immutable, Allows Duplicates (coords = (10, 20))
- Set { }: Unordered, Unique elements only (nums = {1, 2, 3})
- Dictionary { }: Key-Value pairs (student = {"name": "Abhishek", "age": 21})

Quick Memory Trick:
- LIST   → Changeable collection
- TUPLE  → Fixed collection
- SET    → Unique collection
- DICT   → Labelled key-value collection

--------------------------------------------------
🔄 5. Type Conversion & User Input
- int("21") → 21
- float(10) → 10.0
- str(21)   → "21"

⚠️ input() ALWAYS returns a string!
name = input("Enter name: ")
age = int(input("Enter age: "))
marks = float(input("Enter marks: "))

Formatted Output (f-strings):
print(f"Name: {name}, Age: {age}, Marks: {marks}")

--------------------------------------------------
🚀 MINI PROJECT — Student Registration Form
name = input("Enter your name: ")
age = int(input("Enter your age: "))
course = input("Enter your course: ")
subjects = ["Python", "DBMS", "DSA"]

student = {
    "name": name,
    "age": age,
    "course": course,
    "subjects": subjects
}

print("================================")
print("      STUDENT REGISTRATION")
print("================================")
print(f"Name     : {student['name']}")
print(f"Age      : {student['age']}")
print(f"Course   : {student['course']}")
print(f"Subjects : {student['subjects']}")
print("================================")
print("Registration Successful!")`
    }
];
