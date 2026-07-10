/**
 * QuestionBankService — Curated offline question bank for AI Interview Prep
 * 
 * Provides interview questions, scoring rubrics, and fallback responses
 * when AI providers (Groq, etc.) are unavailable. Guarantees the interview
 * feature ALWAYS works, even without any external API.
 */

// ─── Technical Questions Bank ─────────────────────────────────────────────────
const technicalQuestions = {
    'Software Engineer': [
        // DSA
        { q: "Can you explain the difference between a stack and a queue? When would you use each?", topic: "DSA", difficulty: "easy", idealAnswer: "Stack is LIFO (Last In First Out) — used for undo operations, expression parsing, DFS. Queue is FIFO (First In First Out) — used for BFS, task scheduling, buffering.", scoringHint: "Look for: correct definitions, real-world examples, time complexities" },
        { q: "Walk me through how you would detect a cycle in a linked list. What's the most efficient approach?", topic: "DSA", difficulty: "medium", idealAnswer: "Floyd's Cycle Detection (Tortoise & Hare): Use two pointers — slow moves 1 step, fast moves 2 steps. If they meet, there's a cycle. O(n) time, O(1) space.", scoringHint: "Look for: Floyd's algorithm mention, time/space analysis, edge cases" },
        { q: "How would you find the kth largest element in an unsorted array? Compare different approaches.", topic: "DSA", difficulty: "medium", idealAnswer: "Options: Sort O(n log n), Max-Heap O(n + k log n), QuickSelect O(n) average. QuickSelect is optimal — partition like quicksort but only recurse on relevant half.", scoringHint: "Look for: multiple approaches, tradeoff analysis, QuickSelect knowledge" },
        { q: "Explain the concept of dynamic programming. How is it different from recursion with memoization?", topic: "DSA", difficulty: "medium", idealAnswer: "DP solves problems by breaking into overlapping subproblems. Memoization is top-down (recursive + cache), tabulation is bottom-up (iterative). Both achieve same complexity but tabulation avoids stack overflow.", scoringHint: "Look for: overlapping subproblems, optimal substructure, top-down vs bottom-up" },
        { q: "What is the time complexity of searching in a balanced BST vs an unbalanced one? How do self-balancing trees help?", topic: "DSA", difficulty: "medium", idealAnswer: "Balanced: O(log n). Unbalanced (skewed): O(n). AVL trees maintain balance factor ≤1, Red-Black trees use coloring rules — both guarantee O(log n) operations.", scoringHint: "Look for: log n vs n comparison, AVL/Red-Black mention, rotation concept" },
        { q: "How does a hash map handle collisions? Compare chaining vs open addressing.", topic: "DSA", difficulty: "easy", idealAnswer: "Chaining: each bucket holds a linked list. Open addressing: probe for next empty slot (linear/quadratic/double hashing). Chaining is simpler; open addressing has better cache performance.", scoringHint: "Look for: both methods explained, tradeoffs, load factor mention" },
        { q: "You need to find the shortest path in a weighted graph with no negative edges. Which algorithm do you use and why?", topic: "DSA", difficulty: "medium", idealAnswer: "Dijkstra's algorithm. Uses a min-heap/priority queue. O((V+E) log V). For negative edges, use Bellman-Ford O(VE). For all pairs, Floyd-Warshall O(V³).", scoringHint: "Look for: Dijkstra, priority queue, comparison with Bellman-Ford" },
        { q: "Explain the sliding window technique with an example problem.", topic: "DSA", difficulty: "easy", idealAnswer: "Maintain a window of elements using two pointers. Expand right, shrink left based on condition. Example: max sum subarray of size k — O(n) instead of O(nk).", scoringHint: "Look for: two pointer concept, O(n) efficiency, concrete example" },

        // System Design
        { q: "How would you design a URL shortening service like bit.ly? Walk me through the architecture.", topic: "System Design", difficulty: "medium", idealAnswer: "Components: Load balancer, App servers, Database (NoSQL for speed), Cache (Redis). Use base62 encoding of auto-increment ID. Handle: collision avoidance, analytics tracking, expiration.", scoringHint: "Look for: encoding scheme, database choice, caching layer, scalability" },
        { q: "Explain the concept of database sharding. When would you use it and what are the tradeoffs?", topic: "System Design", difficulty: "hard", idealAnswer: "Sharding splits data across multiple databases. Strategies: hash-based, range-based, geography-based. Tradeoffs: complex joins, rebalancing difficulty, but enables horizontal scaling.", scoringHint: "Look for: sharding strategies, tradeoffs, when to use vs replication" },
        { q: "What is the CAP theorem? Give real-world examples of systems that prioritize different aspects.", topic: "System Design", difficulty: "medium", idealAnswer: "CAP: Consistency, Availability, Partition tolerance — pick 2. CP: MongoDB (strong consistency). AP: Cassandra (always available). CA: traditional RDBMS (no partition tolerance).", scoringHint: "Look for: correct definitions, real examples, understanding that P is unavoidable in distributed systems" },
        { q: "How would you design a rate limiter for an API? What algorithms exist?", topic: "System Design", difficulty: "medium", idealAnswer: "Algorithms: Token bucket (smooth), Sliding window counter (accurate), Fixed window (simple). Implementation: Redis for distributed. Consider: per-user vs per-IP, headers (X-RateLimit-*).", scoringHint: "Look for: multiple algorithms, distributed implementation, practical considerations" },

        // OOP & Fundamentals
        { q: "What are SOLID principles? Pick two and explain with real examples.", topic: "OOP", difficulty: "medium", idealAnswer: "S: Single Responsibility — one class, one job. O: Open/Closed — extend, don't modify. L: Liskov — subtypes must be substitutable. I: Interface Segregation — small, specific interfaces. D: Dependency Inversion — depend on abstractions.", scoringHint: "Look for: correct definitions, practical examples, understanding why they matter" },
        { q: "Explain the difference between SQL and NoSQL databases. When would you choose one over the other?", topic: "Fundamentals", difficulty: "easy", idealAnswer: "SQL: structured, ACID, joins, schema-enforced (PostgreSQL, MySQL). NoSQL: flexible schema, horizontal scaling, eventual consistency (MongoDB, Cassandra). Use SQL for transactions, NoSQL for high-scale unstructured data.", scoringHint: "Look for: ACID vs BASE, schema flexibility, scaling differences" },
        { q: "What happens when you type a URL in the browser and press Enter? Walk through the full process.", topic: "Fundamentals", difficulty: "medium", idealAnswer: "DNS resolution → TCP handshake → TLS handshake (HTTPS) → HTTP request → Server processing → HTTP response → Browser rendering (HTML parse → DOM, CSS parse → CSSOM, JS execution → render tree → paint).", scoringHint: "Look for: DNS, TCP/TLS, HTTP lifecycle, rendering pipeline" },
        { q: "Explain REST API design best practices. What makes a good API?", topic: "Fundamentals", difficulty: "easy", idealAnswer: "Use nouns (not verbs) for endpoints. Proper HTTP methods (GET/POST/PUT/DELETE). Status codes (200, 201, 400, 404, 500). Versioning, pagination, filtering. HATEOAS for discoverability.", scoringHint: "Look for: HTTP methods, status codes, naming conventions, versioning" },
    ],
    'Frontend Developer': [
        { q: "Explain the virtual DOM in React. How does reconciliation work?", topic: "React", difficulty: "medium", idealAnswer: "Virtual DOM is an in-memory representation of the real DOM. On state change, React creates a new VDOM, diffs it with the old one (reconciliation), and applies minimal updates to the real DOM (commit phase).", scoringHint: "Look for: diffing algorithm, fiber architecture, batching" },
        { q: "What are React hooks? Explain useState, useEffect, and useRef with use cases.", topic: "React", difficulty: "easy", idealAnswer: "useState: state management. useEffect: side effects (API calls, subscriptions) with cleanup. useRef: mutable reference that persists across renders without causing re-render. Custom hooks for reusable logic.", scoringHint: "Look for: correct use cases, dependency arrays, cleanup functions" },
        { q: "How would you optimize a React application that's rendering slowly?", topic: "Performance", difficulty: "medium", idealAnswer: "React.memo for pure components, useMemo/useCallback for expensive computations, lazy loading with Suspense, virtualized lists (react-window), code splitting, avoid unnecessary re-renders with proper state structure.", scoringHint: "Look for: multiple optimization strategies, profiling mention, practical experience" },
        { q: "Explain CSS specificity. How do you resolve styling conflicts?", topic: "CSS", difficulty: "easy", idealAnswer: "Specificity hierarchy: inline > ID > class/attribute/pseudo-class > element. !important overrides all. BEM naming convention helps. CSS Modules or CSS-in-JS for scoping.", scoringHint: "Look for: specificity rules, BEM or scoping strategies, practical approach" },
        { q: "What is the event loop in JavaScript? Explain microtasks vs macrotasks.", topic: "JavaScript", difficulty: "hard", idealAnswer: "Event loop processes the call stack, then microtask queue (Promises, queueMicrotask), then macrotask queue (setTimeout, setInterval). Microtasks run before next macrotask. This explains why Promise.then runs before setTimeout.", scoringHint: "Look for: call stack, task queues, microtask priority, practical example" },
        { q: "How would you implement infinite scrolling with React? Consider performance.", topic: "React", difficulty: "medium", idealAnswer: "IntersectionObserver API to detect when sentinel element is visible. Fetch next page. Use virtualization (react-window) for large lists. Debounce scroll events. Handle loading/error states.", scoringHint: "Look for: IntersectionObserver, virtualization, loading states, pagination" },
    ],
    'Backend Developer': [
        { q: "Explain middleware in Express.js. How does the middleware chain work?", topic: "Node.js", difficulty: "easy", idealAnswer: "Middleware functions have access to req, res, next. They execute in order — each calls next() to pass control. Used for: auth, logging, error handling, CORS, body parsing.", scoringHint: "Look for: next() function, order importance, common middleware examples" },
        { q: "How do you handle authentication in a REST API? Compare sessions vs JWT.", topic: "Security", difficulty: "medium", idealAnswer: "Sessions: server stores state, cookie-based, good for SSR. JWT: stateless token, good for microservices/mobile. JWT has no server-side revocation (use refresh tokens + blacklist). Always use HTTPS.", scoringHint: "Look for: stateful vs stateless, token storage, refresh token pattern" },
        { q: "What is database indexing? When should you NOT add an index?", topic: "Database", difficulty: "medium", idealAnswer: "Index is a data structure (B-tree) that speeds up queries. Don't index: small tables, columns with low cardinality, columns frequently written but rarely read, temporary tables. Indexes slow down writes.", scoringHint: "Look for: B-tree mention, write overhead tradeoff, cardinality awareness" },
        { q: "How would you implement caching in a backend system? What invalidation strategies exist?", topic: "Architecture", difficulty: "medium", idealAnswer: "Layers: Application cache (in-memory), Distributed cache (Redis/Memcached), CDN. Invalidation: TTL-based, write-through, write-behind, cache-aside. Stampede protection with locking.", scoringHint: "Look for: multiple cache layers, invalidation strategies, stampede awareness" },
        { q: "Explain the N+1 query problem. How do you solve it?", topic: "Database", difficulty: "medium", idealAnswer: "N+1: fetching a list (1 query) then fetching related data for each item (N queries). Solution: eager loading (JOIN), batch loading (WHERE IN), DataLoader pattern for GraphQL.", scoringHint: "Look for: clear problem description, JOIN solution, DataLoader for GraphQL" },
    ],
    'Data Scientist': [
        { q: "Explain the bias-variance tradeoff. How does it affect model selection?", topic: "ML Theory", difficulty: "medium", idealAnswer: "High bias = underfitting (too simple). High variance = overfitting (too complex). Goal: minimize total error. Regularization (L1/L2), cross-validation, and ensemble methods help balance.", scoringHint: "Look for: correct definitions, regularization, practical strategies" },
        { q: "What is the difference between supervised and unsupervised learning? Give examples of each.", topic: "ML Theory", difficulty: "easy", idealAnswer: "Supervised: labeled data — classification (spam detection), regression (house prices). Unsupervised: no labels — clustering (customer segmentation), dimensionality reduction (PCA).", scoringHint: "Look for: correct definitions, concrete examples, semi-supervised mention is a plus" },
        { q: "How do you handle missing data in a dataset? What are the tradeoffs?", topic: "Data Prep", difficulty: "easy", idealAnswer: "Options: drop rows/columns (loses data), imputation (mean/median/mode — adds bias), KNN imputation, predictive modeling. Consider: % missing, MCAR/MAR/MNAR pattern.", scoringHint: "Look for: multiple strategies, tradeoff awareness, missing data patterns" },
        { q: "Explain gradient descent. What's the difference between batch, mini-batch, and stochastic?", topic: "ML Theory", difficulty: "medium", idealAnswer: "Gradient descent iteratively adjusts parameters to minimize loss function. Batch: entire dataset (stable but slow). SGD: one sample (noisy but fast). Mini-batch: compromise (common in practice). Learning rate is key hyperparameter.", scoringHint: "Look for: loss function minimization, three variants compared, learning rate mention" },
    ],
    'Product Manager': [
        { q: "How would you prioritize features for a product roadmap? What frameworks do you use?", topic: "Strategy", difficulty: "medium", idealAnswer: "Frameworks: RICE (Reach, Impact, Confidence, Effort), MoSCoW (Must/Should/Could/Won't), Kano Model, Value vs Effort matrix. Consider: user research data, business goals, technical feasibility.", scoringHint: "Look for: specific framework names, data-driven approach, stakeholder alignment" },
        { q: "Tell me about a product metric you'd track for a social media app. How would you improve it?", topic: "Analytics", difficulty: "medium", idealAnswer: "DAU/MAU ratio (stickiness), retention (Day 1/7/30), engagement (time spent, posts/user). Improve retention: personalized onboarding, push notifications, social graph features.", scoringHint: "Look for: specific metrics with definitions, improvement hypothesis, A/B testing mention" },
        { q: "How do you make decisions when you don't have enough data?", topic: "Decision Making", difficulty: "hard", idealAnswer: "Use frameworks: reversible vs irreversible decisions (act fast on reversible). Gather qualitative data (user interviews). Run small experiments. Use analogies from similar products. Set a decision deadline.", scoringHint: "Look for: structured approach, qualitative methods, bias awareness" },
    ],
    'DevOps Engineer': [
        { q: "Explain the difference between containers and virtual machines. When would you use each?", topic: "Infrastructure", difficulty: "easy", idealAnswer: "VMs: full OS per instance, hardware-level isolation, heavier. Containers: share host OS kernel, process-level isolation, lightweight. Use VMs for: different OS needs, strong isolation. Containers for: microservices, fast scaling.", scoringHint: "Look for: kernel sharing concept, isolation levels, practical use cases" },
        { q: "What is a CI/CD pipeline? Walk me through a typical pipeline you'd set up.", topic: "DevOps", difficulty: "medium", idealAnswer: "CI: auto build + test on every commit. CD: auto deploy to staging/production. Pipeline: Code push → Lint → Unit tests → Build → Integration tests → Deploy to staging → Smoke tests → Deploy to prod.", scoringHint: "Look for: automation emphasis, testing stages, rollback strategy" },
        { q: "How would you monitor a production system? What metrics and tools would you use?", topic: "Monitoring", difficulty: "medium", idealAnswer: "Four golden signals: latency, traffic, errors, saturation. Tools: Prometheus + Grafana (metrics), ELK Stack (logs), PagerDuty (alerting), Jaeger (tracing). Set up dashboards + alerts with SLOs.", scoringHint: "Look for: golden signals or RED method, specific tools, alerting strategy" },
    ]
};

// ─── Behavioral / HR Questions Bank ───────────────────────────────────────────
const behavioralQuestions = [
    // Tell Me About Yourself (Opening)
    { q: "Tell me about yourself and your journey so far.", category: "introduction", difficulty: "easy", idealAnswer: "Structure: Present → Past → Future. Briefly mention current role/studies, key achievements, why you're interested in this role. Keep it 60-90 seconds.", scoringHint: "Look for: structured response, relevance, enthusiasm" },
    
    // STAR Method Questions
    { q: "Tell me about a time you faced a significant challenge at work or in a project. How did you handle it?", category: "problem-solving", difficulty: "medium", idealAnswer: "Use STAR: Situation (context), Task (your responsibility), Action (specific steps YOU took), Result (measurable outcome). Show resilience and growth.", scoringHint: "Look for: STAR structure, specific details, measurable results" },
    { q: "Describe a situation where you had to work with a difficult team member. What did you do?", category: "teamwork", difficulty: "medium", idealAnswer: "Show empathy, active listening, and conflict resolution. Describe specific actions: 1-on-1 conversation, finding common ground, compromising. Highlight positive outcome.", scoringHint: "Look for: emotional intelligence, specific actions, resolution" },
    { q: "Give me an example of when you had to learn something quickly under pressure.", category: "adaptability", difficulty: "medium", idealAnswer: "Show learning agility. Describe: the situation urgency, your learning strategy (resources, mentors, hands-on), how you applied it, and the outcome.", scoringHint: "Look for: learning strategy, resourcefulness, time management" },
    { q: "Tell me about your biggest professional failure. What did you learn?", category: "self-awareness", difficulty: "hard", idealAnswer: "Be genuine — pick a real failure. Show: what happened, your role in it, what you learned, and how you applied that lesson. Vulnerability + growth mindset.", scoringHint: "Look for: honesty, accountability, growth mindset, specific lesson" },
    { q: "Describe a time when you had to make a decision with incomplete information.", category: "decision-making", difficulty: "hard", idealAnswer: "Show structured thinking: gathered available data, assessed risks, made a reasoned decision, monitored outcomes, adjusted if needed. Highlight decisiveness.", scoringHint: "Look for: risk assessment, structured approach, adaptability" },
    { q: "Tell me about a time you took initiative beyond your assigned responsibilities.", category: "leadership", difficulty: "medium", idealAnswer: "Show proactiveness: identified an opportunity/problem, proposed a solution, executed it, and the impact. Demonstrate ownership mentality.", scoringHint: "Look for: proactiveness, ownership, impact measurement" },
    { q: "How do you handle tight deadlines and multiple priorities?", category: "time-management", difficulty: "easy", idealAnswer: "Prioritization framework (urgent/important matrix), breaking tasks down, communicating with stakeholders about realistic timelines, delegation when possible.", scoringHint: "Look for: prioritization method, communication skills, realistic expectations" },
    { q: "Where do you see yourself in 5 years?", category: "career-goals", difficulty: "easy", idealAnswer: "Show ambition aligned with the role/company. Mention: skill growth, increasing responsibility, contributing to team/company goals. Avoid being too generic.", scoringHint: "Look for: alignment with role, growth mindset, realistic ambition" },
    { q: "Why should we hire you over other candidates?", category: "value-proposition", difficulty: "hard", idealAnswer: "Unique combination of: relevant skills, specific experiences, cultural fit, passion for the domain. Give concrete examples of value you'd bring.", scoringHint: "Look for: specific differentiators, confidence without arrogance, relevant examples" },

    // Company Culture Fit
    { q: "What kind of work environment do you thrive in?", category: "culture-fit", difficulty: "easy", idealAnswer: "Be specific and genuine. Mention: collaboration style, communication preferences, pace, autonomy level. Research the company's culture beforehand.", scoringHint: "Look for: self-awareness, alignment with company culture, specific preferences" },
    { q: "How do you handle receiving constructive criticism?", category: "self-awareness", difficulty: "medium", idealAnswer: "Show maturity: listen without defensiveness, ask clarifying questions, reflect on feedback, implement changes. Give a specific example of improvement from feedback.", scoringHint: "Look for: open-mindedness, specific example, growth from feedback" },
    { q: "Tell me about a project you're most proud of. What was your contribution?", category: "achievement", difficulty: "easy", idealAnswer: "Describe the project context, your specific role and contributions, challenges overcome, and measurable impact. Show passion and technical depth.", scoringHint: "Look for: specific contributions, measurable impact, passion" },
    { q: "How do you stay updated with the latest trends in your field?", category: "continuous-learning", difficulty: "easy", idealAnswer: "Mention specific sources: tech blogs, conferences, open source contributions, online courses, community involvement. Show genuine curiosity.", scoringHint: "Look for: specific sources named, genuine curiosity, practical application" },
    { q: "Describe a situation where you disagreed with your manager. How did you handle it?", category: "conflict-resolution", difficulty: "hard", idealAnswer: "Show respect + assertiveness: presented data-backed reasoning, listened to their perspective, found compromise or accepted decision professionally. Key: no badmouthing.", scoringHint: "Look for: professionalism, data-driven reasoning, respect" },
];

// ─── Group Discussion Topics & Templates ──────────────────────────────────────
const gdTopics = [
    { topic: "Is Artificial Intelligence a threat to human employment, or a catalyst for new opportunities?", category: "technology" },
    { topic: "Remote work vs office work: Which model is better for innovation and collaboration?", category: "workplace" },
    { topic: "Should coding be made a mandatory subject in schools from a young age?", category: "education" },
    { topic: "Social media: connecting people or creating isolation?", category: "society" },
    { topic: "Is a college degree still necessary for a successful career in tech?", category: "education" },
    { topic: "Startups vs established companies: Where should fresh graduates work first?",  category: "career" },
    { topic: "Data privacy vs convenience: Should users sacrifice privacy for better services?", category: "technology" },
    { topic: "Is the gig economy empowering workers or exploiting them?", category: "economy" },
    { topic: "Electric vehicles: Are they truly sustainable, or just shifting the pollution problem?", category: "environment" },
    { topic: "Open source software vs proprietary software: Which model drives better innovation?", category: "technology" },
    { topic: "Should tech companies be held responsible for the content on their platforms?", category: "ethics" },
    { topic: "The role of cryptocurrency in the future of global finance.", category: "finance" },
    { topic: "Space exploration: A necessary investment or a waste of resources?", category: "science" },
    { topic: "Work-life balance: Is it achievable in high-growth industries?", category: "workplace" },
    { topic: "The ethical implications of autonomous weapons and AI in warfare.", category: "ethics" },
];

// Pre-built GD dialogue templates for AI participants
const gdDialogueTemplates = {
    introduction: [
        { name: "Aria", text: "Welcome everyone to today's group discussion. Our topic is: \"{topic}\". Let me start by asking each of you to share your initial thoughts. {user}, why don't you kick us off?" },
        { name: "Aria", text: "Good to see everyone here. Today we'll be discussing: \"{topic}\". This is a topic that affects all of us. {user}, what's your take on this?" },
    ],
    alexReactions: [
        { text: "That's an interesting point, but I'd argue from a data perspective that {counterpoint}. The numbers actually suggest a more nuanced picture." },
        { text: "I see where you're coming from, but let me play devil's advocate. If we look at the research, {counterpoint}." },
        { text: "I agree with parts of what you said, especially about {agreement}. However, I think you're overlooking {gap}." },
        { text: "Statistically speaking, that's only partially correct. Studies show that {fact}, which changes the equation significantly." },
    ],
    sarahReactions: [
        { text: "I love that perspective! Building on it, what if we also consider {extension}? That could open up entirely new possibilities." },
        { text: "That's a creative way to look at it. I think the human element here is crucial — {humanAngle}." },
        { text: "Absolutely! And from a design thinking perspective, {designAngle}. We need to empathize with all stakeholders." },
        { text: "While I agree with the optimism, I think we should also acknowledge {concern}. Balance is key." },
    ],
};

// ─── Scoring Helpers ──────────────────────────────────────────────────────────
function scoreAnswer(answer, idealAnswer, scoringHint) {
    if (!answer || answer.trim().length < 10) return { score: 1, feedback: "Answer was too short or missing. Try to elaborate with specific examples." };
    
    const words = answer.trim().split(/\s+/).length;
    const idealKeywords = idealAnswer.toLowerCase().split(/\s+/);
    const answerLower = answer.toLowerCase();
    
    // Keyword matching
    let keywordHits = 0;
    const importantKeywords = idealKeywords.filter(w => w.length > 4); // Only meaningful words
    importantKeywords.forEach(kw => {
        if (answerLower.includes(kw)) keywordHits++;
    });
    const keywordScore = importantKeywords.length > 0 ? (keywordHits / importantKeywords.length) : 0;
    
    // Length score (prefer 50-300 words)
    let lengthScore = 0;
    if (words >= 50 && words <= 300) lengthScore = 1;
    else if (words >= 20 && words < 50) lengthScore = 0.6;
    else if (words > 300) lengthScore = 0.8;
    else lengthScore = 0.3;
    
    // Structure score (has examples, uses structured language)
    let structureScore = 0;
    if (answerLower.includes('example') || answerLower.includes('for instance') || answerLower.includes('such as')) structureScore += 0.3;
    if (answerLower.includes('because') || answerLower.includes('therefore') || answerLower.includes('however')) structureScore += 0.3;
    if (answerLower.includes('first') || answerLower.includes('second') || answerLower.includes('finally')) structureScore += 0.4;
    
    // Combined score (1-10)
    const rawScore = (keywordScore * 0.5 + lengthScore * 0.25 + structureScore * 0.25) * 10;
    const score = Math.max(1, Math.min(10, Math.round(rawScore)));
    
    let feedback = "";
    if (score >= 8) feedback = "Excellent answer! You covered the key concepts well with clear structure.";
    else if (score >= 6) feedback = "Good answer. Consider adding more specific examples or technical depth.";
    else if (score >= 4) feedback = "Adequate but could be stronger. Try using the STAR method or providing concrete examples.";
    else feedback = "Needs improvement. Focus on covering key concepts and providing structured, detailed responses.";
    
    return { score, feedback };
}

// ─── Report Generation ────────────────────────────────────────────────────────
function generateFallbackReport(exchanges, mode) {
    const scores = exchanges.filter(e => e.score > 0).map(e => e.score);
    const avgScore = scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 5;
    
    const strengths = [];
    const improvements = [];
    
    if (avgScore >= 7) {
        strengths.push("Strong technical knowledge demonstrated across multiple topics");
        strengths.push("Answers were well-structured and articulate");
        strengths.push("Good use of examples to illustrate points");
    } else if (avgScore >= 5) {
        strengths.push("Showed foundational understanding of key concepts");
        strengths.push("Attempted to provide structured responses");
        improvements.push("Add more depth to technical explanations");
        improvements.push("Use concrete examples from personal experience");
    } else {
        strengths.push("Showed willingness to engage with all questions");
        improvements.push("Review core concepts for the target role");
        improvements.push("Practice structuring answers using frameworks like STAR");
        improvements.push("Prepare specific examples from past projects");
    }
    
    if (improvements.length === 0) {
        improvements.push("Consider exploring advanced topics for a stronger edge");
        improvements.push("Practice communicating complex ideas more concisely");
    }
    
    const feedbackTemplates = {
        high: "The candidate demonstrated strong competency across the assessed areas. With continued preparation, they would be a strong contender for the role.",
        medium: "The candidate shows solid foundational skills with room for growth. Focused practice on core concepts and interview technique would significantly improve performance.",
        low: "The candidate is in the early stages of preparation. A structured study plan focusing on fundamentals and regular mock interview practice is recommended."
    };
    
    return {
        overallScore: avgScore,
        strengths,
        improvements,
        overallFeedback: avgScore >= 7 ? feedbackTemplates.high : avgScore >= 5 ? feedbackTemplates.medium : feedbackTemplates.low,
        gdMetrics: mode === 'gd' ? {
            logic: Math.min(10, avgScore + Math.floor(Math.random() * 2)),
            communication: Math.min(10, avgScore + Math.floor(Math.random() * 2) - 1),
            teamwork: Math.min(10, avgScore + Math.floor(Math.random() * 2)),
            confidence: Math.min(10, avgScore + Math.floor(Math.random() * 2) - 1)
        } : undefined,
        source: 'question_bank'
    };
}

// ─── Public API ───────────────────────────────────────────────────────────────

class QuestionBankService {
    
    /**
     * Get a question for the given interview context.
     * @param {Object} opts
     * @param {string} opts.mode - 'technical' | 'behavioral' | 'gd'
     * @param {string} opts.role - Target role
     * @param {number} opts.questionNumber - Current question number
     * @param {number} opts.totalQuestions - Total questions planned
     * @param {string[]} opts.askedQuestions - Questions already asked (to avoid repeats)
     * @param {string} opts.previousAnswer - The user's last answer (for scoring)
     * @param {string} opts.previousQuestion - The question they were answering
     * @returns {Object} { question, feedback, idealAnswer, score, spokenText, speakers? }
     */
    getQuestion({ mode, role, questionNumber, totalQuestions, askedQuestions = [], previousAnswer, previousQuestion }) {
        let result;
        
        if (mode === 'gd') {
            result = this._getGDResponse(questionNumber, previousAnswer);
        } else if (mode === 'behavioral') {
            result = this._getBehavioralQuestion(questionNumber, askedQuestions, previousAnswer, previousQuestion);
        } else {
            // technical or resume mode
            result = this._getTechnicalQuestion(role, questionNumber, askedQuestions, previousAnswer, previousQuestion);
        }
        
        return result;
    }

    /**
     * Generate a final report from exchanges without AI.
     */
    generateReport(exchanges, mode) {
        return generateFallbackReport(exchanges, mode);
    }

    /**
     * Get an introduction message for the start of an interview.
     */
    getIntroduction(mode, role, company) {
        if (mode === 'gd') {
            const topic = gdTopics[Math.floor(Math.random() * gdTopics.length)];
            const template = gdDialogueTemplates.introduction[Math.floor(Math.random() * gdDialogueTemplates.introduction.length)];
            const text = template.text.replace('{topic}', topic.topic).replace('{user}', 'you');
            return {
                question: topic.topic,
                feedback: "",
                idealAnswer: "",
                score: 0,
                spokenText: text,
                speakers: [{ name: "Aria", text }],
                source: 'question_bank'
            };
        }
        
        const companyLabel = company === 'Startup' ? 'a high-growth startup' : company === 'General Tech' ? 'a tech company' : company || 'a tech company';
        const intro = `Hi there! I'm Aria, and I'll be your interviewer today. I see you're interviewing for the ${role || 'Software Engineer'} position at ${companyLabel}. Let's get started — could you tell me a little about yourself and your background?`;
        
        return {
            question: "Tell me about yourself.",
            feedback: "",
            idealAnswer: "",
            score: 0,
            spokenText: intro,
            source: 'question_bank'
        };
    }

    // ─── Private Methods ────────────────────────────────────────────────

    _getTechnicalQuestion(role, qNum, asked, prevAnswer, prevQuestion) {
        const roleKey = Object.keys(technicalQuestions).find(k => 
            role?.toLowerCase().includes(k.toLowerCase())
        ) || 'Software Engineer';
        
        const pool = technicalQuestions[roleKey] || technicalQuestions['Software Engineer'];
        const available = pool.filter(q => !asked.includes(q.q));
        const selected = available.length > 0 
            ? available[Math.floor(Math.random() * available.length)]
            : pool[Math.floor(Math.random() * pool.length)]; // Repeat if exhausted
        
        // Score previous answer if provided
        let scoring = { score: 0, feedback: "" };
        if (prevAnswer && prevQuestion) {
            const prevQ = pool.find(q => q.q === prevQuestion);
            scoring = scoreAnswer(prevAnswer, prevQ?.idealAnswer || prevQuestion, prevQ?.scoringHint || "");
        }
        
        const reaction = scoring.score > 0 
            ? (scoring.score >= 7 
                ? `Great answer! I liked how you explained that. ` 
                : scoring.score >= 4 
                    ? `Thanks for your response. ${scoring.feedback} `
                    : `I appreciate the attempt. ${scoring.feedback} `)
            : '';
        
        const spokenText = `${reaction}${selected.q}`;
        
        return {
            question: selected.q,
            feedback: scoring.feedback,
            idealAnswer: selected.idealAnswer,
            score: scoring.score,
            spokenText,
            source: 'question_bank'
        };
    }

    _getBehavioralQuestion(qNum, asked, prevAnswer, prevQuestion) {
        const available = behavioralQuestions.filter(q => !asked.includes(q.q));
        
        // First question is always "tell me about yourself"
        let selected;
        if (qNum === 1) {
            selected = behavioralQuestions.find(q => q.category === 'introduction') || available[0];
        } else {
            selected = available.length > 0 
                ? available[Math.floor(Math.random() * available.length)]
                : behavioralQuestions[Math.floor(Math.random() * behavioralQuestions.length)];
        }
        
        let scoring = { score: 0, feedback: "" };
        if (prevAnswer && prevQuestion) {
            const prevQ = behavioralQuestions.find(q => q.q === prevQuestion);
            scoring = scoreAnswer(prevAnswer, prevQ?.idealAnswer || prevQuestion, prevQ?.scoringHint || "");
        }
        
        const reaction = scoring.score > 0 
            ? (scoring.score >= 7 
                ? `That was a compelling answer — I can tell you've reflected on your experiences. ` 
                : scoring.score >= 4 
                    ? `Thank you for sharing that. ${scoring.feedback} `
                    : `I appreciate your openness. ${scoring.feedback} `)
            : '';
        
        return {
            question: selected.q,
            feedback: scoring.feedback,
            idealAnswer: selected.idealAnswer,
            score: scoring.score,
            spokenText: `${reaction}${selected.q}`,
            source: 'question_bank'
        };
    }

    _getGDResponse(qNum, prevAnswer) {
        const topics = gdTopics;
        const topic = topics[Math.floor(Math.random() * topics.length)];
        
        const alexLines = gdDialogueTemplates.alexReactions;
        const sarahLines = gdDialogueTemplates.sarahReactions;
        
        const alexReaction = alexLines[Math.floor(Math.random() * alexLines.length)].text
            .replace('{counterpoint}', 'the data shows a more complex picture')
            .replace('{agreement}', 'the core premise')
            .replace('{gap}', 'the implementation challenges')
            .replace('{fact}', 'adoption rates vary significantly by region');
        
        const sarahReaction = sarahLines[Math.floor(Math.random() * sarahLines.length)].text
            .replace('{extension}', 'the creative applications in emerging markets')
            .replace('{humanAngle}', 'people adapt to change differently based on their context')
            .replace('{designAngle}', 'we need to design inclusive solutions')
            .replace('{concern}', 'the unintended consequences on marginalized communities');
        
        const speakers = [];
        
        if (qNum === 1) {
            speakers.push({ name: "Aria", text: `Welcome to our group discussion! Today's topic is: "${topic.topic}". Let's hear everyone's opening thoughts. Go ahead and share your perspective.` });
        } else {
            speakers.push({ name: "Alex", text: alexReaction });
            speakers.push({ name: "Sarah", text: sarahReaction });
            speakers.push({ name: "Aria", text: `Interesting points from both sides. What are your thoughts on this? Do you agree more with Alex's analytical take or Sarah's creative perspective?` });
        }
        
        const scoring = prevAnswer ? scoreAnswer(prevAnswer, topic.topic, "Look for: clarity, relevance, structured argument") : { score: 0, feedback: "" };
        
        return {
            question: speakers[speakers.length - 1].text,
            feedback: scoring.feedback,
            idealAnswer: "A strong GD participant would present a balanced view with data points, acknowledge others' perspectives, and propose actionable solutions.",
            score: scoring.score,
            spokenText: speakers.map(s => s.text).join(' '),
            speakers,
            source: 'question_bank'
        };
    }
}

module.exports = new QuestionBankService();
