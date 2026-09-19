// 20 Comprehensive MCQs for 'Intelligent NoSQL Databases with MongoDB' (INT252)
// Aligned with Course Outcomes CO1 to CO6

export const NOSQL_MONGO_ASSESSMENT_QUESTIONS = [
    {
        id: 'nosql-q1',
        question: 'Q1. What does the acronym NoSQL fundamentally stand for in modern database engineering?',
        options: [
            'Non-SQL Only',
            'Not Only SQL',
            'No Structured Query Language',
            'Network Optimized SQL'
        ],
        correct: 1,
        explanation: 'NoSQL stands for "Not Only SQL", indicating that these databases support non-relational data models while often providing rich, specialized query languages alongside traditional paradigms.',
        keyConcept: 'NoSQL definition & philosophy (CO1)',
        subject: 'Intelligent NoSQL Databases with MongoDB',
        topic: 'Unit I : Introduction to NoSQL and MongoDB'
    },
    {
        id: 'nosql-q2',
        question: 'Q2. According to the CAP Theorem, which two properties does MongoDB prioritize by default during a network partition?',
        options: [
            'Consistency and Availability (CA)',
            'Availability and Partition Tolerance (AP)',
            'Consistency and Partition Tolerance (CP)',
            'Concurrency and Performance (CP)'
        ],
        correct: 2,
        explanation: 'MongoDB is architecturally a CP system. In the event of a network partition, MongoDB prioritizes strict data consistency over availability by initiating replica set elections and denying writes to isolated nodes.',
        keyConcept: 'CAP Theorem trade-offs (CO1)',
        subject: 'Intelligent NoSQL Databases with MongoDB',
        topic: 'Unit I : Introduction to NoSQL and MongoDB'
    },
    {
        id: 'nosql-q3',
        question: 'Q3. Which of the following is NOT one of the four primary categories of NoSQL databases?',
        options: [
            'Document Database',
            'Key-Value Database',
            'Relational Tuple Store',
            'Wide-Column Store'
        ],
        correct: 2,
        explanation: 'The four recognized NoSQL data models are Document (MongoDB), Key-Value (Redis), Column-Oriented/Wide-Column (Cassandra), and Graph (Neo4j). "Relational Tuple Store" describes traditional RDBMS.',
        keyConcept: 'Four NoSQL data models (CO1)',
        subject: 'Intelligent NoSQL Databases with MongoDB',
        topic: 'Unit I : Introduction to NoSQL and MongoDB'
    },
    {
        id: 'nosql-q4',
        question: 'Q4. What is BSON in MongoDB?',
        options: [
            'Basic Script Object Notation',
            'Binary JSON: a binary serialization format used to store documents and perform remote procedure calls',
            'Byte-Stream Object Networking protocol',
            'Boolean Synchronized Object Namespace'
        ],
        correct: 1,
        explanation: 'BSON stands for Binary JSON. It provides high traversal speed, lightweight footprint, and support for additional data types not present in standard JSON such as Date, Decimal128, and ObjectId.',
        keyConcept: 'BSON format and data types (CO2)',
        subject: 'Intelligent NoSQL Databases with MongoDB',
        topic: 'Unit II : MongoDB Basics and CRUD Operations'
    },
    {
        id: 'nosql-q5',
        question: 'Q5. How many total bytes compose a standard MongoDB ObjectId, and what is its first 4-byte component?',
        options: [
            '16 bytes; MAC address',
            '12 bytes; 4-byte Unix timestamp representing creation time',
            '8 bytes; random integer',
            '32 bytes; SHA-256 cryptographic hash'
        ],
        correct: 1,
        explanation: 'An ObjectId consists of 12 bytes: 4 bytes of timestamp (seconds since Unix epoch), 5 bytes of random value unique to machine and process, and 3 bytes of incrementing counter.',
        keyConcept: 'ObjectId Anatomy (CO2)',
        subject: 'Intelligent NoSQL Databases with MongoDB',
        topic: 'Unit II : MongoDB Basics and CRUD Operations'
    },
    {
        id: 'nosql-q6',
        question: 'Q6. What is the maximum permitted size of an individual BSON document in MongoDB?',
        options: [
            '4 MB',
            '8 MB',
            '16 MB',
            '64 MB'
        ],
        correct: 2,
        explanation: 'The maximum BSON document size limit is 16 Megabytes. For storing binary assets larger than 16MB (such as high-res images, video, and audio), MongoDB provides the GridFS specification.',
        keyConcept: 'Document Size Restrictions & GridFS (CO2)',
        subject: 'Intelligent NoSQL Databases with MongoDB',
        topic: 'Unit II : MongoDB Basics and CRUD Operations'
    },
    {
        id: 'nosql-q7',
        question: 'Q7. Which update operator is used to append a unique value to an array only if that value does not already exist?',
        options: [
            '$push',
            '$addToSet',
            '$appendUnique',
            '$set'
        ],
        correct: 1,
        explanation: '$addToSet adds an element to an array only if it does not already exist in the array, treating the array as a set. In contrast, $push appends regardless of duplicates.',
        keyConcept: 'CRUD Array Update Operators (CO2)',
        subject: 'Intelligent NoSQL Databases with MongoDB',
        topic: 'Unit II : MongoDB Basics and CRUD Operations'
    },
    {
        id: 'nosql-q8',
        question: 'Q8. What is the key guiding philosophy behind document data modeling in MongoDB?',
        options: [
            'Normalize all entities to Third Normal Form (3NF)',
            'Data that is accessed together should be stored together',
            'Always use foreign keys and separate collections for all nested attributes',
            'Duplicate data everywhere without consideration for write frequency'
        ],
        correct: 1,
        explanation: 'The fundamental tenet of MongoDB schema modeling is "Data that is accessed together should be stored together." Schema design is driven by application query and access patterns rather than theoretical normalization.',
        keyConcept: 'Document Data Modeling Philosophy (CO3)',
        subject: 'Intelligent NoSQL Databases with MongoDB',
        topic: 'Unit III : Schema Design and Data Modeling'
    },
    {
        id: 'nosql-q9',
        question: 'Q9. When modeling a "One-to-Squillions" relationship (such as server telemetry logs generated every millisecond), which strategy must be chosen?',
        options: [
            'Embed the logs in an array within the parent server document',
            'Child referencing: Store the parent ID in each individual log document',
            'Two-way referencing between parent and all child records',
            'Denormalize the entire parent document into a single key-value string'
        ],
        correct: 1,
        explanation: 'Child referencing prevents the parent document from exceeding the 16MB BSON limit. Each log document references its parent server via sensorId/serverId.',
        keyConcept: 'Handling Massive One-to-Many Relationships (CO3)',
        subject: 'Intelligent NoSQL Databases with MongoDB',
        topic: 'Unit III : Schema Design and Data Modeling'
    },
    {
        id: 'nosql-q10',
        question: 'Q10. Which operator allows database administrators to enforce JSON Schema validation rules on collection documents?',
        options: [
            '$validateSchema',
            '$jsonSchema',
            '$strictType',
            '$enforceRules'
        ],
        correct: 1,
        explanation: 'The $jsonSchema operator allows defining schema validation rules using standard JSON Schema syntax, enforcing required fields, bsonTypes, value ranges, and regex patterns directly at the engine level.',
        keyConcept: 'Schema Validation with $jsonSchema (CO3)',
        subject: 'Intelligent NoSQL Databases with MongoDB',
        topic: 'Unit III : Schema Design and Data Modeling'
    },
    {
        id: 'nosql-q11',
        question: 'Q11. What data structure does MongoDB utilize internally to store and navigate indexes?',
        options: [
            'Hash Table',
            'B-Tree',
            'Binary Search Tree',
            'Skip List'
        ],
        correct: 1,
        explanation: 'MongoDB WiredTiger storage engine utilizes B-Trees (B-Tree variants) for indexes, providing predictable O(log N) lookup, insertion, deletion, and range traversal operations.',
        keyConcept: 'Index Internal Data Structure (CO4)',
        subject: 'Intelligent NoSQL Databases with MongoDB',
        topic: 'Unit IV : Indexing and Aggregation Framework'
    },
    {
        id: 'nosql-q12',
        question: 'Q12. What does the Equality, Sort, Range (ESR) rule dictate when creating compound indexes?',
        options: [
            'Range fields first, followed by Equality, followed by Sort',
            'Equality fields first, followed by Sort fields, followed by Range fields',
            'Sort fields first, followed by Range fields, followed by Equality fields',
            'Alphabetical ordering of all query fields'
        ],
        correct: 1,
        explanation: 'The ESR rule states that compound indexes should order fields: Equality filters first, Sort keys second, and Range inequality predicates last to ensure optimal index tree pruning.',
        keyConcept: 'The ESR Compound Indexing Rule (CO4)',
        subject: 'Intelligent NoSQL Databases with MongoDB',
        topic: 'Unit IV : Indexing and Aggregation Framework'
    },
    {
        id: 'nosql-q13',
        question: 'Q13. What is a "Covered Query" in MongoDB?',
        options: [
            'A query that uses SSL/TLS encryption over the wire',
            'A query where all requested fields in the query and projection are satisfied entirely by the index, examining 0 documents on disk',
            'A query protected by role-based authorization',
            'A query executed inside a multi-document ACID transaction'
        ],
        correct: 1,
        explanation: 'A covered query is fulfilled entirely from the index RAM without reading documents from storage (totalDocsExamined = 0), yielding ultra-low microsecond latencies.',
        keyConcept: 'Covered Query Optimization (CO4)',
        subject: 'Intelligent NoSQL Databases with MongoDB',
        topic: 'Unit IV : Indexing and Aggregation Framework'
    },
    {
        id: 'nosql-q14',
        question: 'Q14. In an explain("executionStats") plan, what execution stage indicates an unindexed, full collection scan?',
        options: [
            'IXSCAN',
            'FETCH',
            'COLLSCAN',
            'PROJECTION'
        ],
        correct: 2,
        explanation: 'COLLSCAN represents a Collection Scan where MongoDB must inspect every single document in the collection. In production, COLLSCAN on large collections leads to CPU and I/O bottlenecks.',
        keyConcept: 'Interpreting explain() Execution Stats (CO4)',
        subject: 'Intelligent NoSQL Databases with MongoDB',
        topic: 'Unit IV : Indexing and Aggregation Framework'
    },
    {
        id: 'nosql-q15',
        question: 'Q15. Which aggregation pipeline stage is used to deconstruct an array field into individual documents for each element?',
        options: [
            '$split',
            '$unwind',
            '$explode',
            '$flatten'
        ],
        correct: 1,
        explanation: '$unwind deconstructs an array field from the input documents to output a document for each element. Each output document replaces the array with an element value.',
        keyConcept: 'Aggregation Pipeline Array Deconstruction ($unwind) (CO4)',
        subject: 'Intelligent NoSQL Databases with MongoDB',
        topic: 'Unit IV : Indexing and Aggregation Framework'
    },
    {
        id: 'nosql-q16',
        question: 'Q16. What is the role of Mongoose in a Node.js/Express application stack?',
        options: [
            'It is an HTTP routing framework like Express',
            'It is an Object Data Modeling (ODM) library that provides schema definitions, validation, and middleware hooks for MongoDB',
            'It is an in-memory caching engine like Redis',
            'It is a load balancer for distributing requests'
        ],
        correct: 1,
        explanation: 'Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js. It manages relationships between data, provides schema validation, and translates between objects in code and representation in MongoDB.',
        keyConcept: 'Mongoose ODM in Node.js Applications (CO5)',
        subject: 'Intelligent NoSQL Databases with MongoDB',
        topic: 'Unit V : MongoDB Integration'
    },
    {
        id: 'nosql-q17',
        question: 'Q17. Which Python library is the official, high-performance native driver for MongoDB?',
        options: [
            'SQLAlchemy',
            'PyMongo',
            'MongoEngine',
            'Django ORM'
        ],
        correct: 1,
        explanation: 'PyMongo is the official, native Python driver developed by MongoDB Inc., allowing Python applications to communicate directly with MongoDB clusters using native dicts and lists.',
        keyConcept: 'Python PyMongo Integration (CO5)',
        subject: 'Intelligent NoSQL Databases with MongoDB',
        topic: 'Unit V : MongoDB Integration'
    },
    {
        id: 'nosql-q18',
        question: 'Q18. How does MongoDB Atlas Vector Search support modern AI applications and Retrieval-Augmented Generation (RAG)?',
        options: [
            'By compressing JSON files into ZIP archives',
            'By storing high-dimensional vector embeddings and performing approximate k-NN semantic similarity search',
            'By converting all text queries into SQL stored procedures',
            'By replacing the need for AI foundation models'
        ],
        correct: 1,
        explanation: 'Atlas Vector Search allows storing vector embeddings generated by machine learning models and running approximate nearest neighbor (ANN) searches, enabling semantic search and context retrieval for LLM RAG pipelines.',
        keyConcept: 'Vector Search & AI RAG Integration (CO6)',
        subject: 'Intelligent NoSQL Databases with MongoDB',
        topic: 'Unit V : MongoDB Integration'
    },
    {
        id: 'nosql-q19',
        question: 'Q19. In the Student Learning Analytics System mini-project, which aggregation operator would be used to perform a join between "quizResults" and the "students" collection?',
        options: [
            '$merge',
            '$lookup',
            '$join',
            '$combine'
        ],
        correct: 1,
        explanation: 'The $lookup aggregation stage performs a left outer join to an unsharded collection in the same database to filter in documents from the "joined" collection for processing.',
        keyConcept: 'Multi-Collection Joins with $lookup (CO6)',
        subject: 'Intelligent NoSQL Databases with MongoDB',
        topic: 'Unit VI : Project and Final Assessment'
    },
    {
        id: 'nosql-q20',
        question: 'Q20. What is a critical production security best practice for MongoDB deployments?',
        options: [
            'Disable authentication to maximize throughput',
            'Always connect as the root superuser from the web application',
            'Store the MongoDB URI containing credentials directly in public Git repositories',
            'Enable SCRAM authentication, enforce TLS/SSL encryption in transit, and store credentials in environment variables'
        ],
        correct: 3,
        explanation: 'Production best practices require enabling SCRAM/x.509 authentication, role-based access control (RBAC), TLS/SSL network encryption, and never committing connection strings with plaintext credentials.',
        keyConcept: 'Production Security Hardening (CO6)',
        subject: 'Intelligent NoSQL Databases with MongoDB',
        topic: 'Unit VI : Project and Final Assessment'
    }
];
