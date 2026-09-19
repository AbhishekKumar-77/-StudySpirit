// Intelligent NoSQL Databases with MongoDB (INT252)
// Topic: INTELLIGENT NOSQL DATABASES | Duration: 16 Hours | Level: Beginner to Intermediate

export const NOSQL_COURSE_INFO = {
    id: 'course-int-nosql',
    code: 'INT252',
    name: 'Intelligent NoSQL Databases with MongoDB',
    topicTag: 'INTELLIGENT NOSQL DATABASES',
    duration: '16 Hours',
    level: 'Beginner to Intermediate',
    technologies: ['MongoDB', 'MongoDB Atlas', 'Compass', 'mongosh', 'Node.js', 'Mongoose', 'Python', 'PyMongo'],
    category: 'Databases & AI',
    resourceCount: 32,
    resourceBreakdown: '13 Modules · 9 Practicals · Mini Project · Assessment · Certificate',
    progress: 85,
    color: 'from-emerald-500 via-teal-600 to-cyan-700',
    description: 'Master NoSQL database engineering, schema modeling, high-performance indexing, aggregation pipelines, application integration with Node.js and Python, and AI-augmented predictive database analytics.',
    courseOutcomes: [
        {
            code: 'CO1',
            title: 'NoSQL Concepts & Architectural Comparison',
            description: 'Discuss the core concepts of NoSQL databases and differentiate them from traditional relational databases.'
        },
        {
            code: 'CO2',
            title: 'CRUD, Indexing & Query Optimization',
            description: 'Apply CRUD operations, indexing, and query optimization techniques using MongoDB and mongosh.'
        },
        {
            code: 'CO3',
            title: 'Data Modeling & Schema Design',
            description: 'Analyze various data modeling strategies such as embedding and referencing to design efficient MongoDB schemas.'
        },
        {
            code: 'CO4',
            title: 'Aggregation Framework & Performance Evaluation',
            description: 'Evaluate the performance impact of indexing and aggregation frameworks on complex multi-stage analytical queries.'
        },
        {
            code: 'CO5',
            title: 'Full-Stack Application Integration (Node.js & Python)',
            description: 'Develop applications that integrate MongoDB with programming languages like Node.js (Mongoose) and Python (PyMongo) for intelligent data handling.'
        },
        {
            code: 'CO6',
            title: 'Real-World Mini-Project & AI-Augmented Analytics',
            description: 'Create a functional mini-project using MongoDB, showcasing real-world applications and future trends like AI-driven analytics and AutoML.'
        }
    ],
    units: [
        {
            unit: 'Unit I',
            title: 'Introduction to NoSQL and MongoDB',
            summary: 'Concepts, SQL vs NoSQL, CAP Theorem trade-offs, 4 NoSQL data models, MongoDB Architecture, Community Edition, mongosh, Compass, and MongoDB Atlas cloud.',
            hours: '3 Hours',
            co: 'CO1'
        },
        {
            unit: 'Unit II',
            title: 'MongoDB Basics and CRUD Operations',
            summary: 'Databases, Collections, Documents, BSON Data Types, Creating & Dropping Databases/Collections, Basic Querying & Operators.',
            hours: '3 Hours',
            co: 'CO2'
        },
        {
            unit: 'Unit III',
            title: 'Schema Design and Data Modeling',
            summary: 'Schema-less flexibility, Embedding vs Referencing, 1:1, 1:N, M:N Relationships, Modeling Best Practices, and Schema Validation Rules.',
            hours: '3 Hours',
            co: 'CO3'
        },
        {
            unit: 'Unit IV',
            title: 'Indexing and Aggregation Framework',
            summary: 'Single, Compound, Text Indexes, Performance Analysis with explain(), Covered Queries, Multi-stage Aggregation Pipelines ($match, $group, $sort, $project).',
            hours: '3 Hours',
            co: 'CO4'
        },
        {
            unit: 'Unit V',
            title: 'MongoDB Integration & AI Predictive Analytics',
            summary: 'Node.js & Mongoose integration, Python & PyMongo integration, Application CRUD, and MongoDB for AI Predictive Analytics.',
            hours: '2.5 Hours',
            co: 'CO5'
        },
        {
            unit: 'Unit VI',
            title: 'Mini Project, Production Best Practices & Future Trends',
            summary: 'Building the Student Learning Analytics System, Production Best Practices, Final Assessment / Viva / Quiz, and AI-Augmented Databases & AutoML.',
            hours: '1.5 Hours',
            co: 'CO6'
        }
    ],
    practicals: [
        { id: 'p1', num: 1, title: 'Create NoSQL database and compare with SQL', co: 'CO1' },
        { id: 'p2', num: 2, title: 'Perform CRUD operations on documents', co: 'CO2' },
        { id: 'p3', num: 3, title: 'Use and explore BSON data types', co: 'CO2' },
        { id: 'p4', num: 4, title: 'Model one-to-one and one-to-many relationships', co: 'CO3' },
        { id: 'p5', num: 5, title: 'Apply schema validation and constraints', co: 'CO3' },
        { id: 'p6', num: 6, title: 'Create indexes and analyze performance with explain()', co: 'CO4' },
        { id: 'p7', num: 7, title: 'Build aggregation pipeline using multi-stage operators', co: 'CO4' },
        { id: 'p8', num: 8, title: 'Integrate MongoDB with Node.js and Mongoose ODM', co: 'CO5' },
        { id: 'p9', num: 9, title: 'Install MongoDB environment & establish connection with Python PyMongo', co: 'CO5' }
    ],
    references: [
        {
            title: 'MongoDB Fundamentals: A Hands-on Guide to Using MongoDB and Atlas in the Real World',
            authors: 'Amit Phaltankar, Juned Ahsan, Michael Harrison, Liviu Nedov',
            publisher: 'Packt Publishing'
        },
        {
            title: 'MongoDB in Action (2nd Edition)',
            authors: 'Kyle Banker, Peter Bakkum, Shaun Verch, Douglas Garrett, Tim Hawkins',
            publisher: 'Manning Publications'
        },
        {
            title: 'MongoDB: The Definitive Guide (3rd Edition)',
            authors: 'Shannon Bradshaw, Eoin Brazil, Kristina Chodorow',
            publisher: "O'Reilly Media"
        },
        {
            title: 'Official MongoDB Documentation & Atlas Developer Manual',
            authors: 'MongoDB Inc. Engineering Team',
            publisher: 'mongodb.com/docs'
        }
    ],
    topics: [
        {
            title: 'Unit I — Introduction to NoSQL & MongoDB Architecture',
            unitCode: 'Unit I',
            resources: [
                {
                    id: 'mongo-mod-1',
                    title: 'Module 1 — Introduction to NoSQL and MongoDB Fundamentals',
                    type: 'NOTE',
                    pageCount: 22,
                    readTime: '45 min read',
                    verified: true,
                    verificationBadge: 'Official Curriculum'
                },
                {
                    id: 'mongo-mod-2',
                    title: 'Module 2 — MongoDB Environment, mongosh & Cloud Atlas',
                    type: 'NOTE',
                    pageCount: 18,
                    readTime: '35 min read',
                    verified: true,
                    verificationBadge: 'Official Curriculum'
                },
                {
                    id: 'mongo-prac-1',
                    title: 'Practical 1 — Create NoSQL Database and Compare with SQL',
                    type: 'ASSIGNMENT',
                    pageCount: 6,
                    readTime: '20 min lab',
                    verified: true,
                    verificationBadge: 'Lab Experiment'
                }
            ]
        },
        {
            title: 'Unit II — MongoDB Basics, BSON & CRUD Operations',
            unitCode: 'Unit II',
            resources: [
                {
                    id: 'mongo-mod-3',
                    title: 'Module 3 — MongoDB Databases, Collections and Documents',
                    type: 'NOTE',
                    pageCount: 20,
                    readTime: '40 min read',
                    verified: true,
                    verificationBadge: 'Official Curriculum'
                },
                {
                    id: 'mongo-mod-4',
                    title: 'Module 4 — BSON Data Types & Advanced CRUD Operations',
                    type: 'NOTE',
                    pageCount: 24,
                    readTime: '50 min read',
                    verified: true,
                    verificationBadge: 'Official Curriculum'
                },
                {
                    id: 'mongo-prac-2',
                    title: 'Practical 2 — Perform CRUD Operations on Documents',
                    type: 'ASSIGNMENT',
                    pageCount: 8,
                    readTime: '25 min lab',
                    verified: true,
                    verificationBadge: 'Lab Experiment'
                },
                {
                    id: 'mongo-prac-3',
                    title: 'Practical 3 — Use and Explore BSON Data Types in mongosh',
                    type: 'ASSIGNMENT',
                    pageCount: 6,
                    readTime: '20 min lab',
                    verified: true,
                    verificationBadge: 'Lab Experiment'
                }
            ]
        },
        {
            title: 'Unit III — Schema Design, Modeling & Validation Constraints',
            unitCode: 'Unit III',
            resources: [
                {
                    id: 'mongo-mod-5',
                    title: 'Module 5 — MongoDB Data Modeling & Flexible Schemas',
                    type: 'NOTE',
                    pageCount: 20,
                    readTime: '40 min read',
                    verified: true,
                    verificationBadge: 'Official Curriculum'
                },
                {
                    id: 'mongo-mod-6',
                    title: 'Module 6 — Relationships: 1:1, 1:N & M:N Patterns',
                    type: 'NOTE',
                    pageCount: 22,
                    readTime: '45 min read',
                    verified: true,
                    verificationBadge: 'Official Curriculum'
                },
                {
                    id: 'mongo-mod-7',
                    title: 'Module 7 — Schema Validation Rules & Enforcing Constraints',
                    type: 'NOTE',
                    pageCount: 16,
                    readTime: '30 min read',
                    verified: true,
                    verificationBadge: 'Official Curriculum'
                },
                {
                    id: 'mongo-prac-4',
                    title: 'Practical 4 — Model One-to-One and One-to-Many Relationships',
                    type: 'ASSIGNMENT',
                    pageCount: 8,
                    readTime: '25 min lab',
                    verified: true,
                    verificationBadge: 'Lab Experiment'
                },
                {
                    id: 'mongo-prac-5',
                    title: 'Practical 5 — Apply Schema Validation and Constraints ($jsonSchema)',
                    type: 'ASSIGNMENT',
                    pageCount: 6,
                    readTime: '20 min lab',
                    verified: true,
                    verificationBadge: 'Lab Experiment'
                }
            ]
        },
        {
            title: 'Unit IV — Indexing, explain() & Aggregation Framework',
            unitCode: 'Unit IV',
            resources: [
                {
                    id: 'mongo-mod-8',
                    title: 'Module 8 — Indexing Strategies, Covered Queries & explain()',
                    type: 'NOTE',
                    pageCount: 24,
                    readTime: '50 min read',
                    verified: true,
                    verificationBadge: 'Official Curriculum'
                },
                {
                    id: 'mongo-mod-9',
                    title: 'Module 9 — Aggregation Framework & Multi-Stage Pipelines',
                    type: 'NOTE',
                    pageCount: 26,
                    readTime: '55 min read',
                    verified: true,
                    verificationBadge: 'Official Curriculum'
                },
                {
                    id: 'mongo-prac-6',
                    title: 'Practical 6 — Create Indexes and Analyze Performance with explain()',
                    type: 'ASSIGNMENT',
                    pageCount: 8,
                    readTime: '25 min lab',
                    verified: true,
                    verificationBadge: 'Lab Experiment'
                },
                {
                    id: 'mongo-prac-7',
                    title: 'Practical 7 — Build Multi-Stage Aggregation Pipeline ($group, $match)',
                    type: 'ASSIGNMENT',
                    pageCount: 8,
                    readTime: '30 min lab',
                    verified: true,
                    verificationBadge: 'Lab Experiment'
                }
            ]
        },
        {
            title: 'Unit V — Application Integration (Node.js/Mongoose & Python/PyMongo)',
            unitCode: 'Unit V',
            resources: [
                {
                    id: 'mongo-mod-10',
                    title: 'Module 10 — Node.js & Mongoose ODM Application Integration',
                    type: 'NOTE',
                    pageCount: 24,
                    readTime: '50 min read',
                    verified: true,
                    verificationBadge: 'Official Curriculum'
                },
                {
                    id: 'mongo-mod-11',
                    title: 'Module 11 — Python & PyMongo Application Integration',
                    type: 'NOTE',
                    pageCount: 22,
                    readTime: '45 min read',
                    verified: true,
                    verificationBadge: 'Official Curriculum'
                },
                {
                    id: 'mongo-mod-12',
                    title: 'Module 12 — MongoDB for AI & Predictive Analytics',
                    type: 'NOTE',
                    pageCount: 20,
                    readTime: '40 min read',
                    verified: true,
                    verificationBadge: 'Official Curriculum'
                },
                {
                    id: 'mongo-prac-8',
                    title: 'Practical 8 — Integrate MongoDB with Node.js Express & Mongoose',
                    type: 'ASSIGNMENT',
                    pageCount: 10,
                    readTime: '35 min lab',
                    verified: true,
                    verificationBadge: 'Lab Experiment'
                },
                {
                    id: 'mongo-prac-9',
                    title: 'Practical 9 — Environment Setup & Connection using Python PyMongo',
                    type: 'ASSIGNMENT',
                    pageCount: 10,
                    readTime: '35 min lab',
                    verified: true,
                    verificationBadge: 'Lab Experiment'
                }
            ]
        },
        {
            title: 'Unit VI — Mini Project, Production Best Practices & Final Assessment',
            unitCode: 'Unit VI',
            resources: [
                {
                    id: 'mongo-mod-13',
                    title: 'Module 13 — Mini Project Architecture, Best Practices & AutoML',
                    type: 'NOTE',
                    pageCount: 26,
                    readTime: '55 min read',
                    verified: true,
                    verificationBadge: 'Official Curriculum'
                },
                {
                    id: 'mongo-project-spec',
                    title: 'Mini Project Blueprint — Student Learning Analytics System',
                    type: 'PDF',
                    pageCount: 14,
                    readTime: '1.5 Hours project',
                    verified: true,
                    verificationBadge: 'Capstone Spec'
                },
                {
                    id: 'mongo-assessment-mcq',
                    title: 'Final Assessment — 20 Comprehensive MCQs (CO1 - CO6)',
                    type: 'QUESTION_BANK',
                    questionCount: 20,
                    verified: true,
                    verificationBadge: 'Graded Exam'
                },
                {
                    id: 'mongo-viva-prep',
                    title: 'Comprehensive Viva Voce Guide — Top 25 Technical Questions',
                    type: 'PREVIOUS_PAPER',
                    questionCount: 25,
                    verified: true,
                    verificationBadge: 'Viva Prep'
                }
            ]
        }
    ]
};

// 13 Full Modules Data with In-Depth Notes, Summaries & Interactive Elements
export const NOSQL_MONGO_MODULES = [
    {
        id: 'mongo-mod-1',
        courseCode: 'INT252',
        courseName: 'Intelligent NoSQL Databases with MongoDB',
        unit: 'Unit I',
        moduleNumber: 1,
        title: 'Module 1 — Introduction to NoSQL and MongoDB Fundamentals',
        subtitle: 'Foundations of Non-Relational Architecture, 4 Data Models, and CAP Theorem',
        goal: 'Understand why NoSQL emerged, compare SQL vs NoSQL, and evaluate distributed CAP trade-offs.',
        type: 'NOTE',
        pageCount: 22,
        readTime: '45 min read',
        verified: true,
        verificationBadge: 'Official Curriculum',
        shortNotes: `SHORT REVISION NOTES — MODULE 1 (EXAM CRAM KIT)

1. NoSQL Concept:
   - "Not Only SQL" — Non-relational, flexible schema, horizontally scalable databases.
   - Built to handle high-velocity, massive-volume, semi-structured & unstructured data.

2. SQL vs NoSQL Differences:
   - Schema: SQL has rigid predefined tabular schema (DDL); NoSQL has flexible/dynamic schema.
   - Scaling: SQL scales vertically (scale-up CPU/RAM); NoSQL scales horizontally (scale-out across commodity clusters/sharding).
   - Joins: SQL uses expensive relational JOINs; NoSQL uses embedded documents or application references.

3. Four Core NoSQL Models:
   - Key-Value: Redis, AWS DynamoDB (ultra-fast hash lookup, O(1)).
   - Document: MongoDB, Couchbase (hierarchical JSON/BSON documents).
   - Column-Oriented: Apache Cassandra, HBase (wide-column, analytics/time-series).
   - Graph: Neo4j (nodes, edges, properties for social network/knowledge graphs).

4. CAP Theorem (Brewer's Theorem):
   - In any distributed asynchronous network partition (P), a database can guarantee Consistency (C) OR Availability (A), but NEVER both simultaneously.
   - MongoDB is by default a CP system (Consistent & Partition Tolerant), prioritizing strong consistency on primary nodes with tunable read concerns.

5. MongoDB Core Architectural Components:
   - Server -> Database -> Collection -> Document -> Field.
   - Documents are stored internally in binary BSON format with unique 12-byte _id ObjectId.`,
        fullNotes: `# MODULE 1 — Introduction to NoSQL and MongoDB

## 1.1 What is a Database?
A database is an organized collection of structured or semi-structured data that allows computer applications to store, retrieve, update, and manage information efficiently, reliably, and concurrently.

Traditional enterprise architectures historically relied on Relational Database Management Systems (RDBMS) like MySQL, PostgreSQL, and Oracle. However, the exponential growth of web applications, cloud computing, social networks, IoT streaming, and AI workloads created scalability bottlenecks that traditional SQL databases struggled to resolve.

---

## 1.2 What is NoSQL?
NoSQL stands for **Not Only SQL**. It represents a broad category of non-relational database management systems designed specifically to handle:
* High-velocity data ingestion
* Massive volumes of semi-structured and unstructured data
* Flexible, rapidly changing schemas
* Horizontal scaling across distributed commodity server clusters

---

## 1.3 SQL vs NoSQL Detailed Comparison

| Feature | Relational (SQL) | NoSQL (MongoDB) |
| :--- | :--- | :--- |
| **Data Model** | Tables with fixed rows and columns | Collections with flexible BSON documents |
| **Schema** | Rigid, strict compile-time DDL schema | Flexible, dynamic, schema-less / schema-validated |
| **Scaling** | Vertical scaling (Scale-Up: larger CPU/RAM) | Horizontal scaling (Scale-Out: Sharding across nodes) |
| **Transactions** | ACID transactions across all tables | Multi-document ACID transactions within replica sets |
| **Query Language** | Structured Query Language (SQL) | Rich JSON/BSON Query API & Aggregation Pipeline |
| **Relationships** | Enforced Foreign Keys & JOIN operations | Document embedding & normalized DB references |

### SQL vs MongoDB Syntax Example:
\`\`\`sql
-- SQL
SELECT name, age, course FROM students WHERE age >= 20 ORDER BY name ASC;
\`\`\`

\`\`\`javascript
// MongoDB
db.students.find(
    { age: { $gte: 20 } },
    { name: 1, age: 1, course: 1, _id: 0 }
).sort({ name: 1 });
\`\`\`

---

## 1.4 The Four Major Types of NoSQL Databases

### 1. Key-Value Database
* **Structure:** Key -> Value hash map.
* **Characteristics:** Extremely low latency reads and writes.
* **Examples:** Redis, Amazon DynamoDB, Memcached.

### 2. Document Database (MongoDB)
* **Structure:** Hierarchical documents (JSON/BSON/XML).
* **Characteristics:** Natural fit for object-oriented programming; nested objects and arrays.
* **Examples:** MongoDB, Couchbase, CouchDB.

### 3. Column-Oriented Database
* **Structure:** Data stored in columns rather than rows.
* **Characteristics:** Optimized for large-scale analytical queries and time-series aggregation.
* **Examples:** Apache Cassandra, HBase, ScyllaDB.

### 4. Graph Database
* **Structure:** Nodes (entities), Edges (relationships), and Properties.
* **Characteristics:** Unrivaled performance for traversals like social networks and fraud rings.
* **Examples:** Neo4j, Amazon Neptune.

---

## 1.5 The CAP Theorem and Distributed Trade-Offs
Formulated by Eric Brewer, the CAP Theorem dictates that any distributed data store can guarantee at most **two out of three** properties:
1. **Consistency (C):** Every read receives the most recent write or an error.
2. **Availability (A):** Every non-failing request receives a non-error response, without guarantee that it contains the most recent write.
3. **Partition Tolerance (P):** The system continues to operate despite an arbitrary number of messages being dropped or delayed by the network between nodes.

> In real-world distributed networks, network partitions are inevitable. Thus, distributed databases must choose between **CP** (Consistency over Availability) or **AP** (Availability over Consistency).
> **MongoDB** operates by default as a **CP system**: If a primary node becomes unreachable due to a partition, the replica set triggers an election to maintain strict consistency.

---

## 1.6 MongoDB Architecture Overview
\`\`\`
MongoDB Server (mongod process)
      │
      ├── Database: "collegeDB"
      │      │
      │      ├── Collection: "students"
      │      │      ├── Document { _id: 1, name: "Abhishek", course: "CSE" }
      │      │      └── Document { _id: 2, name: "Priya", course: "AI" }
      │      │
      │      └── Collection: "courses"
      │             └── Document { _id: 101, title: "Intelligent NoSQL" }
\`\`\`

* **mongod:** Primary background database daemon process.
* **Database:** Physical container for collections.
* **Collection:** Equivalent to an RDBMS table, without enforced uniform schema.
* **Document:** A BSON-formatted record containing key-value pairs.`
    },
    {
        id: 'mongo-mod-2',
        courseCode: 'INT252',
        courseName: 'Intelligent NoSQL Databases with MongoDB',
        unit: 'Unit I',
        moduleNumber: 2,
        title: 'Module 2 — MongoDB Environment, mongosh & Cloud Atlas',
        subtitle: 'Community Server Setup, Shell Commands, Compass GUI, and Cloud Clusters',
        goal: 'Configure local and cloud MongoDB environments and execute administrative shell commands.',
        type: 'NOTE',
        pageCount: 18,
        readTime: '35 min read',
        verified: true,
        verificationBadge: 'Official Curriculum',
        shortNotes: `SHORT REVISION NOTES — MODULE 2 (EXAM CRAM KIT)

1. Client Tools:
   - mongosh: Modern NodeJS-based command line shell with auto-completion and syntax highlighting.
   - MongoDB Compass: Official GUI for schema visualization, query building, indexing, and pipeline debugging.
   - MongoDB Atlas: Fully-managed DBaaS (Database-as-a-Service) hosted on AWS, GCP, or Azure.

2. Essential mongosh Commands:
   - show dbs : List all databases on server.
   - use <dbName> : Switch context to dbName (created lazily on first insert).
   - db : Print currently selected database name.
   - show collections : Display all collections in current database.
   - cls : Clear terminal window.

3. Atlas Connection URI Structure:
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/<database>?retryWrites=true&w=majority
   Always store this securely in .env (MONGODB_URI) and never commit plaintext credentials to Git.`,
        fullNotes: `# MODULE 2 — MongoDB Environment and Tools

## 2.1 MongoDB Community Server Installation
MongoDB Community Edition is the free, open-source database engine for local development.
* On Windows, installed as a Windows Service running on default port \`27017\`.
* Service executable: \`mongod.exe\` (Database engine daemon).
* Data directory: \`C:\\data\\db\` or custom directory specified via \`--dbpath\`.

---

## 2.2 The MongoDB Shell (\`mongosh\`)
\`mongosh\` is the interactive JavaScript interface to MongoDB. It supports full ES6 syntax, asynchronous operations, and built-in help.

### Core Command Cheat Sheet:
\`\`\`javascript
// 1. Check current connection
db.runCommand({ connectionStatus: 1 })

// 2. Display all databases
show dbs

// 3. Switch or create database context
use universityDB

// 4. Check active database
db

// 5. List collections in active database
show collections

// 6. View database statistics
db.stats()
\`\`\`

---

## 2.3 MongoDB Compass GUI
MongoDB Compass provides visual inspection capabilities without writing manual queries:
* **Schema Tab:** Samples documents to detect data types, missing fields, and schema anomalies.
* **Explain Plan:** Visualizes query execution trees (COLLSCAN vs IXSCAN).
* **Index Manager:** Create, inspect, and drop Single, Compound, and TTL indexes.
* **Aggregation Builder:** Build multi-stage pipelines with live preview of documents at every stage.

---

## 2.4 Connecting to MongoDB Atlas
MongoDB Atlas provides automated failover, backups, and horizontal sharding.
Connecting securely:
\`\`\`javascript
// Node.js Connection String (with Mongoose)
const MONGODB_URI = process.env.MONGODB_URI;
// mongodb+srv://admin:Secr3tPass@cluster0.xxxxx.mongodb.net/universityDB?retryWrites=true&w=majority
\`\`\``
    },
    {
        id: 'mongo-mod-3',
        courseCode: 'INT252',
        courseName: 'Intelligent NoSQL Databases with MongoDB',
        unit: 'Unit II',
        moduleNumber: 3,
        title: 'Module 3 — MongoDB Databases, Collections and Documents',
        subtitle: 'Dynamic Database Creation, Collection Options, and Document Lifecycle',
        goal: 'Master collection creation options, capped collections, and document insertion/deletion.',
        type: 'NOTE',
        pageCount: 20,
        readTime: '40 min read',
        verified: true,
        verificationBadge: 'Official Curriculum',
        shortNotes: `SHORT REVISION NOTES — MODULE 3

1. Lazy Database & Collection Creation:
   - A database and collection only appear on disk when the first document is inserted.
   - Explicit collection creation: db.createCollection("students", { validator: ... }).

2. Capped Collections:
   - Fixed-size circular buffers that overwrite oldest documents when full (FIFO).
   - Created with: db.createCollection("logs", { capped: true, size: 5242880, max: 5000 }).
   - Ideal for log feeds, telemetry, and real-time streaming buffers.

3. Document Restrictions:
   - Maximum BSON document size: 16 Megabytes.
   - For larger files (PDFs, videos, audio), MongoDB provides GridFS.`,
        fullNotes: `# MODULE 3 — MongoDB Databases, Collections and Documents

## 3.1 Creating Databases and Collections
In MongoDB, you do not need to execute \`CREATE DATABASE\`. Simply switch to the name:
\`\`\`javascript
use studySpiritDB
\`\`\`
The database will be physically written when you insert your first record.

### Explicit Collection Creation
\`\`\`javascript
db.createCollection("students", {
    autoIndexId: true
});
\`\`\`

### Capped Collections (Circular Queue)
\`\`\`javascript
// Creates a capped collection of 10MB or max 1,000 documents
db.createCollection("activityLogs", {
    capped: true,
    size: 10485760,
    max: 1000
});
\`\`\`

---

## 3.2 Inserting Documents
\`\`\`javascript
// Single document insertion
db.students.insertOne({
    name: "Abhishek Kumar",
    rollNo: "ST101",
    department: "Computer Science",
    semester: 5,
    enrolledAt: new Date()
});

// Multiple document insertion (Atomic at document level)
db.students.insertMany([
    { name: "Rahul Sharma", rollNo: "ST102", department: "CSE", cgpa: 8.9 },
    { name: "Priya Patel", rollNo: "ST103", department: "IT", cgpa: 9.2 }
]);
\`\`\`

---

## 3.3 Dropping Collections and Databases
\`\`\`javascript
// Drop single collection
db.students.drop();

// Drop entire active database
db.dropDatabase();
\`\`\``
    },
    {
        id: 'mongo-mod-4',
        courseCode: 'INT252',
        courseName: 'Intelligent NoSQL Databases with MongoDB',
        unit: 'Unit II',
        moduleNumber: 4,
        title: 'Module 4 — BSON Data Types & Advanced CRUD Operations',
        subtitle: 'BSON Internals, ObjectId Anatomy, Query Operators ($gt, $in, $regex), and Update Modifiers',
        goal: 'Perform CRUD operations utilizing comparison, logical, element, and array operators.',
        type: 'NOTE',
        pageCount: 24,
        readTime: '50 min read',
        verified: true,
        verificationBadge: 'Official Curriculum',
        shortNotes: `SHORT REVISION NOTES — MODULE 4

1. What is BSON?
   - Binary JSON: Serialized format supporting rich types not present in standard JSON (Date, ObjectId, Decimal128, Binary, Int32, Int64).

2. Anatomy of 12-Byte ObjectId:
   - 4-byte timestamp (seconds since Unix epoch)
   - 5-byte random value (machine and process unique identifier)
   - 3-byte incrementing counter (initialized randomly)
   - Benefit: Globally unique, sortable by creation time without server coordination!

3. Key Query Operators:
   - Comparison: $eq, $ne, $gt, $gte, $lt, $lte, $in, $nin
   - Logical: $and, $or, $not, $nor
   - Element: $exists, $type
   - Array: $all, $elemMatch, $size

4. Update Modifiers:
   - $set: Update or add field.
   - $unset: Remove field.
   - $inc: Increment numeric value.
   - $push / $addToSet: Append element to array ($addToSet prevents duplicates).`,
        fullNotes: `# MODULE 4 — BSON Data Types and CRUD Operations

## 4.1 BSON vs JSON
While JSON is text-based and only supports basic types (string, number, boolean, array, object, null), **BSON (Binary JSON)** provides fast traversal, indexing efficiency, and extended types:
* \`ObjectId\`
* \`ISODate\`
* \`Decimal128\` (for high-precision financial arithmetic)
* \`Int32\` and \`Int64\` (Long)
* \`BinData\` (for hashes, UUIDs, audio chunks)

---

## 4.2 ObjectId Structure
Every document has a default primary key \`_id\`:
\`\`\`javascript
_id: ObjectId("66e858a3f8a42b1574a81c01")
\`\`\`
It is composed of 12 bytes:
\`\`\`
[ 4-byte Timestamp | 5-byte Random Machine/Process ID | 3-byte Incrementing Counter ]
\`\`\`
You can extract creation timestamp in mongosh:
\`\`\`javascript
ObjectId("66e858a3f8a42b1574a81c01").getTimestamp();
\`\`\`

---

## 4.3 Advanced Filtering & Query Operators
\`\`\`javascript
// Find students in CSE with CGPA between 8.0 and 9.5
db.students.find({
    department: "CSE",
    cgpa: { $gte: 8.0, $lte: 9.5 }
});

// Using $in and $or
db.students.find({
    $or: [
        { skills: { $in: ["MongoDB", "Python"] } },
        { honors: true }
    ]
});

// Array matching with $elemMatch
db.students.find({
    examResults: {
        $elemMatch: { subject: "INT252", marks: { $gte: 90 } }
    }
});
\`\`\`

---

## 4.4 Update Operations
\`\`\`javascript
// Update single student
db.students.updateOne(
    { rollNo: "ST101" },
    {
        $set: { semester: 6 },
        $inc: { creditsCompleted: 4 },
        $addToSet: { skills: "Docker" }
    }
);

// Upsert (Insert if not found, update if found)
db.students.updateOne(
    { rollNo: "ST999" },
    { $set: { name: "Aditi Rao", department: "AI" } },
    { upsert: true }
);
\`\`\`

---

## 4.5 Deletion Operations
\`\`\`javascript
// Delete single document
db.students.deleteOne({ rollNo: "ST101" });

// Delete multiple inactive records
db.students.deleteMany({ status: "withdrawn" });
\`\`\``
    },
    {
        id: 'mongo-mod-5',
        courseCode: 'INT252',
        courseName: 'Intelligent NoSQL Databases with MongoDB',
        unit: 'Unit III',
        moduleNumber: 5,
        title: 'Module 5 — MongoDB Data Modeling & Flexible Schemas',
        subtitle: 'Embedding vs Referencing, Document Access Patterns, and Polymorphism',
        goal: 'Design schemas around application query patterns rather than relational normal forms.',
        type: 'NOTE',
        pageCount: 20,
        readTime: '40 min read',
        verified: true,
        verificationBadge: 'Official Curriculum',
        shortNotes: `SHORT REVISION NOTES — MODULE 5

1. The Cardinal Rule of MongoDB Modeling:
   "Data that is accessed together should be stored together."
   Design schemas driven by application queries (Read vs Write ratio) rather than normalization rules (3NF).

2. Embedding (Denormalization):
   - Stores related child data inside the parent document.
   - Advantages: Single-round-trip retrieval, atomic updates, zero JOIN overhead.
   - Disadvantages: 16MB document size limit, duplication if child is shared by many entities.
   - Use when: 1:1 relationships, 1:few relationships, data is tightly bound and rarely mutated independently.

3. Referencing (Normalization):
   - Stores related data in separate collections linked by _id (manual reference or $lookup).
   - Advantages: Prevents unbounded document growth, deduplicates shared master data.
   - Use when: 1:many (large scale), 1:millions, frequently queried independently.`,
        fullNotes: `# MODULE 5 — MongoDB Data Modeling

## 5.1 Relational Normalization vs Document Modeling
In traditional SQL design, data is split into atomic tables (1NF, 2NF, 3NF, BCNF) to eliminate redundancy, relying on SQL \`JOIN\` operations at query time.
In NoSQL document design, queries must be ultra-fast and horizontally scalable. Joins across distributed shards are computationally expensive. Therefore, MongoDB favors **denormalization and embedding** when data is queried together.

---

## 5.2 Embedding (Denormalization Pattern)
\`\`\`javascript
// Student with embedded address and skills
{
    _id: ObjectId("..."),
    name: "Abhishek Kumar",
    email: "abhishek@studyspirit.in",
    address: {
        street: "102 Campus Drive",
        city: "Phagwara",
        state: "Punjab",
        pincode: "144411"
    },
    skills: ["MongoDB", "Node.js", "Python", "React"]
}
\`\`\`
* **Pros:** Single database read retrieves the complete student record.
* **Cons:** Updates to the city must modify this specific document.

---

## 5.3 Referencing (Normalized Pattern)
\`\`\`javascript
// student document in 'students' collection
{
    _id: ObjectId("66a1..."),
    name: "Abhishek Kumar",
    mentorId: ObjectId("66b2...") // Reference to instructors collection
}

// instructor document in 'instructors' collection
{
    _id: ObjectId("66b2..."),
    name: "Dr. Sandeep Sharma",
    title: "Professor of Computer Science",
    cabin: "Block 34, Room 402"
}
\`\`\`
* Querying across references is achieved via the \`$lookup\` aggregation stage.`
    },
    {
        id: 'mongo-mod-6',
        courseCode: 'INT252',
        courseName: 'Intelligent NoSQL Databases with MongoDB',
        unit: 'Unit III',
        moduleNumber: 6,
        title: 'Module 6 — Relationships: 1:1, 1:N & M:N Patterns',
        subtitle: 'Architectural Patterns: One-to-Few, One-to-Many, One-to-Squillions, and Two-Way Referencing',
        goal: 'Implement robust patterns for complex one-to-many and many-to-many relationships.',
        type: 'NOTE',
        pageCount: 22,
        readTime: '45 min read',
        verified: true,
        verificationBadge: 'Official Curriculum',
        shortNotes: `SHORT REVISION NOTES — MODULE 6

1. Relationship Types & Recommended Strategy:
   - One-to-One (1:1): Prefer key-value embedding as a subdocument (e.g. Student -> Profile).
   - One-to-Few (1:10): Embed as an array of subdocuments (e.g. Student -> EmergencyContacts).
   - One-to-Many (1:1000): Reference using parent-side array of ObjectIds or child referencing.
   - One-to-Squillions (1:1,000,000+): Child referencing (child documents store parent's ObjectId). Never store unbounded arrays in parent!

2. Many-to-Many (M:N):
   - Two-Way Referencing: Both documents store an array of the other's _id for fast bidirectional lookup.
   - Associative Collection: Separate junction collection storing { studentId, courseId, grade, enrolledDate }. Ideal when the enrollment itself carries metadata.`,
        fullNotes: `# MODULE 6 — Relationships: One-to-One, One-to-Many and Many-to-Many

## 6.1 One-to-One (1:1)
Example: Student and their Academic ID Verification Details.
\`\`\`javascript
{
    rollNo: "ST101",
    name: "Abhishek",
    verification: {
        aadhaarHash: "e4d9...21a",
        verifiedOn: ISODate("2026-01-10"),
        status: "APPROVED"
    }
}
\`\`\`

---

## 6.2 One-to-Many (1:N)
### Sub-Pattern A: One-to-Few (Embed)
\`\`\`javascript
// Teacher with assigned subjects
{
    _id: ObjectId("..."),
    name: "Prof. Verma",
    assignedCourses: ["INT252", "CSE105", "CSE102"]
}
\`\`\`

### Sub-Pattern B: One-to-Squillions (Child Referencing)
When an entity produces millions of records (e.g., IoT temperature logs or server metrics), **never** embed them in the parent document to avoid hitting the 16MB document limit.
\`\`\`javascript
// Individual Log Document
{
    _id: ObjectId("..."),
    sensorId: ObjectId("66c1..."), // Parent Reference
    reading: 42.5,
    timestamp: ISODate("2026-09-20T04:00:00Z")
}
\`\`\`

---

## 6.3 Many-to-Many (M:N) Pattern
Students and Course Registrations:
\`\`\`javascript
// 'enrollments' collection acts as associative collection
{
    _id: ObjectId("..."),
    studentId: ObjectId("66a1..."),
    courseId: ObjectId("66f8..."),
    semester: "Fall 2026",
    attendancePercent: 92.5,
    grade: "A+"
}
\`\`\``
    },
    {
        id: 'mongo-mod-7',
        courseCode: 'INT252',
        courseName: 'Intelligent NoSQL Databases with MongoDB',
        unit: 'Unit III',
        moduleNumber: 7,
        title: 'Module 7 — Schema Validation Rules & Enforcing Constraints',
        subtitle: 'JSON Schema Validation, Validation Actions, and Business Rules with $jsonSchema',
        goal: 'Enforce enterprise data integrity while preserving NoSQL schema agility.',
        type: 'NOTE',
        pageCount: 16,
        readTime: '30 min read',
        verified: true,
        verificationBadge: 'Official Curriculum',
        shortNotes: `SHORT REVISION NOTES — MODULE 7

1. Why Schema Validation in NoSQL?
   - Prevents corrupted, malformed, or typo data from entering production collections without sacrificing flexible fields.
   - Enforced by the MongoDB server engine during insert and update commands.

2. Syntax:
   - Uses standard JSON Schema format under the $jsonSchema operator.
   - Validates bsonType, required fields, minimum/maximum values, string regex patterns, and enum sets.

3. Validation Levels & Actions:
   - validationLevel: 'strict' (applies to all inserts & updates) or 'moderate' (applies only to valid existing documents).
   - validationAction: 'error' (rejects document write) or 'warn' (writes document but records warning to mongod server log).`,
        fullNotes: `# MODULE 7 — Schema Validation and Constraints

## 7.1 Enforcing Enterprise Integrity with \`$jsonSchema\`
MongoDB allows developers to specify JSON Schema validators on collection creation or via \`collMod\`:

\`\`\`javascript
db.createCollection("students", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["name", "rollNo", "email", "semester", "department"],
            properties: {
                name: {
                    bsonType: "string",
                    description: "must be a string and is required"
                },
                rollNo: {
                    bsonType: "string",
                    pattern: "^ST[0-9]{3,5}$",
                    description: "must match pattern ST followed by digits"
                },
                email: {
                    bsonType: "string",
                    pattern: "^.+@.+\\..+$",
                    description: "must be a valid email format"
                },
                semester: {
                    bsonType: "int",
                    minimum: 1,
                    maximum: 8,
                    description: "must be integer between 1 and 8"
                },
                department: {
                    enum: ["CSE", "IT", "AI_ML", "ECE"],
                    description: "can only be one of the enumerated departments"
                }
            }
        }
    },
    validationLevel: "strict",
    validationAction: "error"
});
\`\`\`

If an application attempts to insert a record missing \`email\` or containing an invalid \`semester\`, MongoDB rejects the operation with \`DocumentValidationFailure\`.`
    },
    {
        id: 'mongo-mod-8',
        courseCode: 'INT252',
        courseName: 'Intelligent NoSQL Databases with MongoDB',
        unit: 'Unit IV',
        moduleNumber: 8,
        title: 'Module 8 — Indexing Strategies, Covered Queries & explain()',
        subtitle: 'B-Trees, Single & Compound Indexes, Text Search, Covered Queries, and Query Plan Diagnostics',
        goal: 'Optimize MongoDB query latency from seconds to milliseconds using appropriate indexes and explain().',
        type: 'NOTE',
        pageCount: 24,
        readTime: '50 min read',
        verified: true,
        verificationBadge: 'Official Curriculum',
        shortNotes: `SHORT REVISION NOTES — MODULE 8

1. Index Basics:
   - Indexes use B-Trees to allow MongoDB to find documents in O(log N) time instead of performing an expensive Collection Scan (COLLSCAN).
   - Default index: { _id: 1 } (created automatically on all collections).

2. Index Types:
   - Single Field Index: db.students.createIndex({ email: 1 }).
   - Compound Index: db.students.createIndex({ department: 1, cgpa: -1 }).
   - Text Index: db.courses.createIndex({ description: "text" }) for linguistic search.
   - Multikey Index: Created automatically when an indexed field contains an array.

3. Equality, Sort, Range (ESR Rule):
   - When designing compound indexes: Equality fields first -> Sort fields second -> Range fields last.

4. Covered Queries:
   - A query where all requested projection fields are present in the index itself.
   - totalDocsExamined = 0! MongoDB returns data directly from RAM without touching disk.

5. explain("executionStats"):
   - COLLSCAN: Bad (scans every document in collection).
   - IXSCAN: Good (scans index B-Tree).
   - Ratio totalDocsExamined / nReturned should ideally be 1.0.`,
        fullNotes: `# MODULE 8 — Indexing and Query Optimization

## 8.1 Why Indexing Matters
Without an index, MongoDB executes a **COLLSCAN** (Collection Scan), reading every document in the collection from disk. With a million documents, a COLLSCAN takes seconds. An index (B-Tree structure in RAM) allows MongoDB to pinpoint matching records in under 2 milliseconds.

---

## 8.2 Index Types
\`\`\`javascript
// 1. Single Field Unique Index
db.students.createIndex({ email: 1 }, { unique: true });

// 2. Compound Index (Department Ascending, CGPA Descending)
db.students.createIndex({ department: 1, cgpa: -1 });

// 3. Full-Text Search Index
db.courses.createIndex({ title: "text", syllabus: "text" });

// 4. Time-To-Live (TTL) Index for self-expiring session tokens (expires after 24 hours)
db.sessions.createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 });
\`\`\`

---

## 8.3 The ESR Rule (Equality, Sort, Range)
To achieve maximum indexing efficiency on multi-field queries:
1. **E**quality: Fields filtered by exact match (\`$eq\`, string literal)
2. **S**ort: Fields used in \`.sort()\`
3. **R**ange: Fields filtered by inequality (\`$gt\`, \`$lt\`, \`$in\`)

\`\`\`javascript
// Query:
db.students.find({ department: "CSE", cgpa: { $gte: 8.5 } }).sort({ semester: 1 });

// Optimal Index according to ESR:
db.students.createIndex({ department: 1, semester: 1, cgpa: 1 });
\`\`\`

---

## 8.4 Analyzing Execution with \`explain()\`
\`\`\`javascript
db.students.find({ department: "CSE", cgpa: { $gt: 8.0 } })
    .explain("executionStats");
\`\`\`
Key performance metrics in the JSON output:
* \`stage\`: Look for **IXSCAN** -> **FETCH**. Avoid **COLLSCAN**.
* \`nReturned\`: Number of documents returned to client.
* \`totalDocsExamined\`: Number of documents read from storage.
* \`executionTimeMillis\`: Total runtime in milliseconds.`
    },
    {
        id: 'mongo-mod-9',
        courseCode: 'INT252',
        courseName: 'Intelligent NoSQL Databases with MongoDB',
        unit: 'Unit IV',
        moduleNumber: 9,
        title: 'Module 9 — Aggregation Framework & Multi-Stage Pipelines',
        subtitle: 'Data Analytics Pipelines: $match, $group, $sort, $project, $unwind, and $lookup',
        goal: 'Construct powerful multi-stage analytics pipelines for institutional reporting and AI feature engineering.',
        type: 'NOTE',
        pageCount: 26,
        readTime: '55 min read',
        verified: true,
        verificationBadge: 'Official Curriculum',
        shortNotes: `SHORT REVISION NOTES — MODULE 9

1. Pipeline Concept:
   - Documents pass sequentially through stages like an industrial assembly line.
   - Output of stage N becomes the input of stage N+1.

2. Core Stages:
   - $match: Filters documents (place early to reduce dataset volume).
   - $group: Groups documents by _id key and computes accumulators ($sum, $avg, $min, $max, $push).
   - $sort: Sorts documents (-1 desc, 1 asc).
   - $project: Reshapes documents, adds computed expressions, suppresses fields.
   - $unwind: Deconstructs an array field, creating one document for each array element.
   - $lookup: Performs left outer join with another collection.

3. Accumulator Operators:
   - $sum: Count or sum values (e.g., totalStudents: { $sum: 1 }).
   - $avg: Arithmetic average.
   - $push: Collects values into an array.
   - $addToSet: Collects unique values into a set.`,
        fullNotes: `# MODULE 9 — Aggregation Framework

## 9.1 Aggregation Pipeline Architecture
The Aggregation Pipeline is MongoDB's framework for data transformation, analytics, and reporting. Documents flow through an array of stages:

\`\`\`
Input Documents
      │
      ▼
┌──────────────┐
│    $match    │  (Filter records early)
└──────┬───────┘
      │
      ▼
┌──────────────┐
│    $group    │  (Compute group statistics & metrics)
└──────┬───────┘
      │
      ▼
┌──────────────┐
│    $sort     │  (Order ranked outputs)
└──────┬───────┘
      │
      ▼
┌──────────────┐
│   $project   │  (Format clean presentation output)
└──────┬───────┘
      │
      ▼
Final Results
\`\`\`

---

## 9.2 Real-World University Analytics Example
Calculate department statistics for enrolled students:
\`\`\`javascript
db.students.aggregate([
    // Stage 1: Filter active students enrolled in 2026
    {
        $match: {
            status: "ACTIVE",
            batchYear: 2026
        }
    },
    // Stage 2: Group by department and compute metrics
    {
        $group: {
            _id: "$department",
            totalStudents: { $sum: 1 },
            averageCGPA: { $avg: "$cgpa" },
            highestCGPA: { $max: "$cgpa" },
            allSkills: { $addToSet: "$primarySkill" }
        }
    },
    // Stage 3: Filter departments with more than 10 students
    {
        $match: {
            totalStudents: { $gte: 10 }
        }
    },
    // Stage 4: Sort descending by average CGPA
    {
        $sort: { averageCGPA: -1 }
    },
    // Stage 5: Project clean output format
    {
        $project: {
            _id: 0,
            department: "$_id",
            totalStudents: 1,
            averageCGPA: { $round: ["$averageCGPA", 2] },
            highestCGPA: 1,
            skillsCount: { $size: "$allSkills" }
        }
    }
]);
\`\`\`

---

## 9.3 Deconstructing Arrays with \`$unwind\`
\`\`\`javascript
// Count the most popular skills across all students
db.students.aggregate([
    { $unwind: "$skills" },
    {
        $group: {
            _id: "$skills",
            count: { $sum: 1 }
        }
    },
    { $sort: { count: -1 } },
    { $limit: 5 }
]);
\`\`\``
    },
    {
        id: 'mongo-mod-10',
        courseCode: 'INT252',
        courseName: 'Intelligent NoSQL Databases with MongoDB',
        unit: 'Unit V',
        moduleNumber: 10,
        title: 'Module 10 — Node.js & Mongoose ODM Application Integration',
        subtitle: 'Connecting Express with Mongoose, Schema Models, Middleware Hooks, and Async CRUD',
        goal: 'Build robust REST APIs utilizing Mongoose models, validation, and middleware hooks.',
        type: 'NOTE',
        pageCount: 24,
        readTime: '50 min read',
        verified: true,
        verificationBadge: 'Official Curriculum',
        shortNotes: `SHORT REVISION NOTES — MODULE 10

1. What is Mongoose?
   - Object Data Modeling (ODM) library for Node.js and MongoDB.
   - Provides strongly-typed schemas, automatic casting, pre/post middleware hooks, and business logic methods.

2. Mongoose Architecture:
   Schema (blueprint) -> Model (constructor compiled from schema) -> Document (instance of model).

3. Middleware Hooks (Pre/Post):
   - Pre-save hooks: Hash passwords with bcrypt before saving.
   - Post-remove hooks: Clean up orphaned reference records.

4. Async CRUD Methods:
   - Create: await Student.create({ ... })
   - Read: await Student.find({ department: 'CSE' }).select('-password')
   - Update: await Student.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true })
   - Delete: await Student.findByIdAndDelete(id)`,
        fullNotes: `# MODULE 10 — MongoDB Integration with Node.js and Mongoose

## 10.1 Establishing MongoDB Connection
\`\`\`javascript
const mongoose = require('mongoose');

const connectDatabase = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log(\`✅ MongoDB Connected: \${conn.connection.host}\`);
    } catch (error) {
        console.error(\`❌ Database Connection Error: \${error.message}\`);
        process.exit(1);
    }
};

module.exports = connectDatabase;
\`\`\`

---

## 10.2 Creating a Strongly-Typed Mongoose Schema
\`\`\`javascript
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Student name is required'],
        trim: true
    },
    rollNo: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/.+@.+\\..+/, 'Please enter a valid email']
    },
    cgpa: {
        type: Number,
        min: 0.0,
        max: 10.0,
        default: 0.0
    },
    skills: [String],
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true // Automatically creates createdAt and updatedAt
});

// Pre-save middleware example
studentSchema.pre('save', function(next) {
    if (this.name) {
        this.name = this.name.charAt(0).toUpperCase() + this.name.slice(1);
    }
    next();
});

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
\`\`\`

---

## 10.3 Asynchronous Controller Implementation
\`\`\`javascript
// Create Student
exports.createStudent = async (req, res) => {
    try {
        const student = await Student.create(req.body);
        res.status(201).json({ success: true, student });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// Query with Pagination & Sorting
exports.getStudents = async (req, res) => {
    try {
        const { page = 1, limit = 10, dept } = req.query;
        const query = dept ? { department: dept } : {};

        const students = await Student.find(query)
            .sort({ cgpa: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Student.countDocuments(query);

        res.json({ success: true, total, count: students.length, students });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
\`\`\``
    },
    {
        id: 'mongo-mod-11',
        courseCode: 'INT252',
        courseName: 'Intelligent NoSQL Databases with MongoDB',
        unit: 'Unit V',
        moduleNumber: 11,
        title: 'Module 11 — Python & PyMongo Application Integration',
        subtitle: 'Native Driver Operations, Python Dict Mapping, Bulk Writes, and Pandas DataFrame Ingestion',
        goal: 'Leverage Python with PyMongo for data engineering pipelines and AI model ingestion.',
        type: 'NOTE',
        pageCount: 22,
        readTime: '45 min read',
        verified: true,
        verificationBadge: 'Official Curriculum',
        shortNotes: `SHORT REVISION NOTES — MODULE 11

1. What is PyMongo?
   - Official Python driver for MongoDB developed by MongoDB Inc.
   - Interacts naturally with native Python dictionaries, lists, and datetime objects.

2. PyMongo Basics:
   - client = MongoClient("mongodb://localhost:27017/")
   - db = client["universityDB"]
   - collection = db["students"]

3. Methods:
   - insert_one(doc), insert_many([docs])
   - find_one({"rollNo": "ST101"}), find({"cgpa": {"$gte": 8.0}})
   - update_one({"rollNo": "ST101"}, {"$set": {"status": "ALUMNI"}})
   - delete_one({"rollNo": "ST101"})
   - aggregate(pipeline)

4. Pandas Integration:
   - Import queries directly into DataFrame: df = pd.DataFrame(list(collection.find()))
   - Bulk load DataFrame to MongoDB: collection.insert_many(df.to_dict('records'))`,
        fullNotes: `# MODULE 11 — MongoDB Integration with Python and PyMongo

## 11.1 Connecting with PyMongo
\`\`\`python
from pymongo import MongoClient
import os

# Initialize client connection
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGODB_URI)

# Access database and collection
db = client["studySpiritDB"]
students = db["students"]

print(f"Connected to database: {db.name}")
\`\`\`

---

## 11.2 Complete CRUD Operations in Python
\`\`\`python
from datetime import datetime

# 1. CREATE (Insert)
new_student = {
    "name": "Abhishek Kumar",
    "rollNo": "ST101",
    "department": "CSE",
    "cgpa": 9.4,
    "skills": ["Python", "MongoDB", "PyTorch"],
    "registeredAt": datetime.now()
}
result = students.insert_one(new_student)
print(f"Inserted document ID: {result.inserted_id}")

# 2. READ (Find)
query = {"department": "CSE", "cgpa": {"$gte": 9.0}}
for doc in students.find(query, {"_id": 0, "name": 1, "cgpa": 1}):
    print(f"Honor Student: {doc['name']} - CGPA: {doc['cgpa']}")

# 3. UPDATE
students.update_one(
    {"rollNo": "ST101"},
    {"$set": {"cgpa": 9.6}, "$push": {"skills": "FastAPI"}}
)

# 4. DELETE
students.delete_one({"rollNo": "ST999"})
\`\`\`

---

## 11.3 AI Data Pipeline Integration with Pandas
\`\`\`python
import pandas as pd

# Fetch student records into a Pandas DataFrame for ML processing
cursor = students.find({"cgpa": {"$gt": 0}})
df = pd.DataFrame(list(cursor))

# Clean DataFrame
df.drop(columns=["_id"], inplace=True)
print(df.describe())
\`\`\``
    },
    {
        id: 'mongo-mod-12',
        courseCode: 'INT252',
        courseName: 'Intelligent NoSQL Databases with MongoDB',
        unit: 'Unit V',
        moduleNumber: 12,
        title: 'Module 12 — MongoDB for AI & Predictive Analytics',
        subtitle: 'Student Performance Prediction, Vector Search, and AI-Driven Query Optimization',
        goal: 'Apply MongoDB schemas to machine learning pipelines, predictive alerts, and vector search.',
        type: 'NOTE',
        pageCount: 20,
        readTime: '40 min read',
        verified: true,
        verificationBadge: 'Official Curriculum',
        shortNotes: `SHORT REVISION NOTES — MODULE 12

1. Modern AI & NoSQL Convergence:
   - NoSQL serves as the operational store for feature engineering, user interaction telemetry, and embeddings.

2. MongoDB Atlas Vector Search:
   - Stores high-dimensional dense vector embeddings generated by LLMs (OpenAI, Gemini, HuggingFace).
   - Executes k-Nearest Neighbor (k-NN) cosine or Euclidean similarity search using Hierarchical Navigable Small World (HNSW) graphs.
   - Powers Retrieval-Augmented Generation (RAG) and intelligent semantic course recommendations.

3. StudySpirit Predictive Analytics Case Study:
   - Schema tracks: quizScores, codingSolved, averageStudyTime, attendance.
   - Predictive alert pipeline: Detects at-risk students before midterm exams by computing a Composite Risk Index.`,
        fullNotes: `# MODULE 12 — MongoDB for AI and Predictive Analytics

## 12.1 The Role of MongoDB in Modern AI Architectures
Modern AI systems require:
1. Fast storage for unstructured user interaction telemetry
2. Flexible schemas that accommodate changing ML feature sets
3. Vector similarity search capabilities for Semantic RAG (Retrieval-Augmented Generation)

---

## 12.2 StudySpirit Student Analytics Schema
\`\`\`javascript
{
    studentId: "ST101",
    name: "Abhishek Kumar",
    academicFeatures: {
        quizScores: [85, 92, 78, 96],
        codingProblemsSolved: 145,
        avgWeeklyStudyHours: 14.5,
        attendancePercent: 88.0
    },
    mlInference: {
        predictedFinalGrade: "A",
        confidenceScore: 0.94,
        riskLevel: "LOW",
        recommendedActions: [
            "Enroll in Advanced Aggregation Pipelines",
            "Take MongoDB Atlas Certification Practice"
        ]
    }
}
\`\`\`

---

## 12.3 MongoDB Atlas Vector Search Pipeline
\`\`\`javascript
// Performing vector semantic search for relevant study notes
db.studyResources.aggregate([
    {
        $vectorSearch: {
            index: "vector_index",
            path: "embedding",
            queryVector: [0.024, -0.045, 0.182, 0.089], // Embedding from AI model
            numCandidates: 100,
            limit: 5
        }
    },
    {
        $project: {
            title: 1,
            unit: 1,
            score: { $meta: "vectorSearchScore" }
        }
    }
]);
\`\`\``
    },
    {
        id: 'mongo-mod-13',
        courseCode: 'INT252',
        courseName: 'Intelligent NoSQL Databases with MongoDB',
        unit: 'Unit VI',
        moduleNumber: 13,
        title: 'Module 13 — Mini Project Architecture, Best Practices & AutoML',
        subtitle: 'Student Learning Analytics System, Production Hardening, and Future Database Trends',
        goal: 'Architect the complete Capstone Mini Project and deploy production-grade database solutions.',
        type: 'NOTE',
        pageCount: 26,
        readTime: '55 min read',
        verified: true,
        verificationBadge: 'Official Curriculum',
        shortNotes: `SHORT REVISION NOTES — MODULE 13

1. Mini Project: Student Learning Analytics System:
   - 5 Collections: students, courses, enrollments, quizResults, studySessions.
   - Demonstrates: Schema validation, compound indexing, multi-stage aggregation, Node.js or Python backend.

2. Production Best Practices:
   - Security: Enable SCRAM authentication, TLS/SSL in transit, role-based access control (RBAC), never commit connection URIs.
   - Connection Pooling: Reuse a single MongoClient instance across the entire application lifecycle.
   - Resource Sizing: Ensure working set (indexes + frequently accessed data) fits entirely into RAM.

3. Future Trends:
   - AI-Augmented Autonomous Databases: Self-tuning indexes, automated query rewrite.
   - AutoML Pipeline Integration: Native model training directly within database engines.`,
        fullNotes: `# MODULE 13 — Mini Project, Production Best Practices and Future Trends

## 13.1 Capstone Mini Project: Student Learning Analytics System
### Core Architecture Requirements:
* **Minimum 5 Collections:** \`students\`, \`courses\`, \`enrollments\`, \`quizResults\`, \`studySessions\`
* **Data Modeling:** Combined embedding and referencing to model 1:N and M:N relationships
* **Indexing:** At least 2 custom compound indexes with \`explain()\` performance proof
* **Aggregation:** Multi-stage pipeline generating class rankings and subject-wise difficulty metrics
* **Application API:** RESTful CRUD service written in Node.js (Mongoose) or Python (PyMongo)

---

## 13.2 Recommended Entity Schemas

### 1. \`students\`
\`\`\`javascript
{
    _id: ObjectId("..."),
    studentId: "ST101",
    name: "Abhishek Kumar",
    email: "abhishek@studyspirit.in",
    department: "CSE",
    semester: 5,
    skills: ["MongoDB", "Node.js", "Python"]
}
\`\`\`

### 2. \`quizResults\`
\`\`\`javascript
{
    _id: ObjectId("..."),
    studentId: "ST101",
    courseCode: "INT252",
    module: "Unit IV — Indexing & Aggregation",
    score: 95,
    totalQuestions: 20,
    timeTakenSeconds: 720,
    submittedAt: ISODate("2026-09-20T04:30:00Z")
}
\`\`\`

---

## 13.3 Analytics Aggregation Query
Compute the overall performance leaderboards across all enrolled students:
\`\`\`javascript
db.quizResults.aggregate([
    {
        $group: {
            _id: "$studentId",
            totalQuizzes: { $sum: 1 },
            averageScore: { $avg: "$score" },
            highestScore: { $max: "$score" }
        }
    },
    {
        $lookup: {
            from: "students",
            localField: "_id",
            foreignField: "studentId",
            as: "studentInfo"
        }
    },
    { $unwind: "$studentInfo" },
    { $sort: { averageScore: -1 } },
    {
        $project: {
            _id: 0,
            studentId: "$_id",
            name: "$studentInfo.name",
            department: "$studentInfo.department",
            totalQuizzes: 1,
            averageScore: { $round: ["$averageScore", 1] },
            highestScore: 1
        }
    }
]);
\`\`\`

---

## 13.4 Production Checklist
1. **Never use \`admin\` user in applications:** Create dedicated users with \`readWrite\` privileges on specific databases.
2. **Prevent slow queries:** Configure \`slowOpThresholdMs\` to log queries taking >100ms.
3. **Monitor Connection Limits:** Set \`maxPoolSize\` according to server concurrency capacity.`
    }
];
