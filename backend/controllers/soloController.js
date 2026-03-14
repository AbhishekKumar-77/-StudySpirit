const User = require('../models/User');
const InterviewSession = require('../models/InterviewSession');
const platformService = require('../services/platformService');
const pdfParse = require('pdf-parse');

// Rate limiting is handled per-IP by express-rate-limit in soloRoutes.js (aiLimiter)

// Get comprehensive Solo Mode dashboard data
// Get comprehensive Solo Mode dashboard data
exports.getDashboardData = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: "Unauthorized" });

        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: "User not found" });

        // Get today's date for activity tracking
        const today = new Date().toISOString().split('T')[0];
        const todayActivity = user.activityLog?.find(log => log.date === today) || {
            problemsSolved: 0,
            studyTime: 0,
            xpEarned: 0,
            focusSessions: 0
        };

        // Initialize learning path if missing
        if (!user.learningPath || !user.learningPath.topics || user.learningPath.topics.length === 0) {
            user.learningPath = {
                currentTopic: 'Arrays & Hashing',
                overallProgress: 0,
                topics: [
                    { name: 'Arrays & Hashing', completed: 0, total: 40, status: 'active' },
                    { name: 'Two Pointers', completed: 0, total: 25, status: 'locked' },
                    { name: 'Sliding Window', completed: 0, total: 20, status: 'locked' },
                    { name: 'Stack & Queue', completed: 0, total: 30, status: 'locked' },
                    { name: 'Binary Search', completed: 0, total: 25, status: 'locked' },
                    { name: 'Linked Lists', completed: 0, total: 30, status: 'locked' },
                    { name: 'Trees & Graphs', completed: 0, total: 50, status: 'locked' },
                    { name: 'Dynamic Programming', completed: 0, total: 60, status: 'locked' }
                ]
            };
            await user.save();
        }

        // 1. Calculate Weekly Activity (Last 7 Days)
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weeklyData = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const log = user.activityLog?.find(l => l.date === dateStr);
            weeklyData.push({
                day: days[d.getDay()],
                hours: log ? Math.round((log.studyTime / 3600) * 10) / 10 : 0,
                problems: log ? log.problemsSolved : 0
            });
        }

        // 2. Generate Activity Heatmap (Yearly Contribution Graph)
        // Score based on study time (per 30 mins = 1 point), problems solved, and focus sessions
        const activityHeatmap = {};
        if (user.activityLog) {
            user.activityLog.forEach(log => {
                // Study time contribution: each 30 minutes (1800s) on platform = 1 point
                const studyTimePoints = Math.floor((log.studyTime || 0) / 1800);
                // Problems + focus sessions + study time based points
                const count = (log.problemsSolved || 0) + (log.focusSessions || 0) + studyTimePoints;
                if (count > 0) activityHeatmap[log.date] = count;
            });
        }

        res.json({
            user: {
                name: user.name,
                email: user.email,
                studyStreak: user.stats.streak,
                totalXP: user.stats.xp,
                level: user.stats.level,
                problemsSolvedToday: todayActivity.problemsSolved,
                dailyGoal: user.stats.dailyGoals,
                totalProblems: user.stats.totalProblems,
                todayStudyTime: todayActivity.studyTime,
                totalStudyTime: user.stats.totalStudyTime || 0,
                reputation: user.reputation || 0,
                connectionsCount: user.connections ? user.connections.length : 0
            },
            activityHeatmap,
            weeklyData,
            platformProfiles: user.platformProfiles,
            learningPath: user.learningPath,
            contestReminders: user.contestReminders || [],
            tasks: user.tasks || [],
            chatHistory: user.chatHistory || []
        });
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// Start a study session
exports.startStudySession = async (req, res) => {
    try {
        const { sessionType } = req.body; // 'focus' or 'break'
        const user = await User.findById(req.user.id);

        if (!user.studySessions) user.studySessions = [];

        const newSession = {
            startTime: new Date(),
            sessionType: sessionType || 'focus',
            completed: false
        };

        user.studySessions.push(newSession);
        await user.save();

        res.status(201).json({
            sessionId: user.studySessions[user.studySessions.length - 1]._id,
            message: "Session started"
        });
    } catch (error) {
        res.status(500).json({ message: "Error starting session" });
    }
};

// End a study session
exports.endStudySession = async (req, res) => {
    try {
        const { sessionId, problemsSolved } = req.body;
        const user = await User.findById(req.user.id);

        const session = user.studySessions.id(sessionId);
        if (!session) return res.status(404).json({ message: "Session not found" });

        session.endTime = new Date();
        session.duration = Math.floor((session.endTime - session.startTime) / 1000); // in seconds
        session.completed = true;

        // Update today's activity log
        const today = new Date().toISOString().split('T')[0];
        let todayLog = user.activityLog.find(log => log.date === today);

        if (!todayLog) {
            todayLog = {
                date: today,
                problemsSolved: 0,
                studyTime: 0,
                xpEarned: 0,
                focusSessions: 0
            };
            user.activityLog.push(todayLog);
        }

        todayLog.studyTime += session.duration;
        if (session.sessionType === 'focus') {
            todayLog.focusSessions += 1;
        }
        if (problemsSolved) {
            todayLog.problemsSolved += problemsSolved;
            user.stats.totalProblems += problemsSolved;
        }

        user.stats.totalStudyTime += session.duration;

        await user.save();
        res.json({ success: true, session, todayLog });
    } catch (error) {
        res.status(500).json({ message: "Error ending session" });
    }
};

// Update learning path progress
exports.updateLearningPath = async (req, res) => {
    try {
        const { topicName, problemsCompleted } = req.body;
        const user = await User.findById(req.user.id);

        const topic = user.learningPath.topics.find(t => t.name === topicName);
        if (!topic) return res.status(404).json({ message: "Topic not found" });

        topic.completed = Math.min(topic.completed + (problemsCompleted || 1), topic.total);
        topic.lastAccessed = new Date();

        // Check if topic is completed and unlock next
        if (topic.completed >= topic.total) {
            topic.status = 'completed';
            const currentIndex = user.learningPath.topics.findIndex(t => t.name === topicName);
            if (currentIndex < user.learningPath.topics.length - 1) {
                user.learningPath.topics[currentIndex + 1].status = 'active';
                user.learningPath.currentTopic = user.learningPath.topics[currentIndex + 1].name;
            }
        }

        // Calculate overall progress
        const totalCompleted = user.learningPath.topics.reduce((sum, t) => sum + t.completed, 0);
        const totalProblems = user.learningPath.topics.reduce((sum, t) => sum + t.total, 0);
        user.learningPath.overallProgress = Math.floor((totalCompleted / totalProblems) * 100);

        await user.save();
        res.json({ success: true, learningPath: user.learningPath });
    } catch (error) {
        res.status(500).json({ message: "Error updating learning path" });
    }
};

// Add contest reminder
exports.addContestReminder = async (req, res) => {
    try {
        const { contestName, platform, startTime } = req.body;
        const user = await User.findById(req.user.id);

        if (!user.contestReminders) user.contestReminders = [];

        user.contestReminders.push({
            contestName,
            platform,
            startTime: new Date(startTime),
            reminded: false
        });

        await user.save();
        res.status(201).json({ success: true, reminders: user.contestReminders });
    } catch (error) {
        res.status(500).json({ message: "Error adding reminder" });
    }
};

// Log daily activity (for heatmap)
exports.logActivity = async (req, res) => {
    try {
        const { problemsSolved, studyTime, xpEarned } = req.body;
        const user = await User.findById(req.user.id);

        const today = new Date().toISOString().split('T')[0];
        let todayLog = user.activityLog.find(log => log.date === today);

        if (!todayLog) {
            todayLog = {
                date: today,
                problemsSolved: 0,
                studyTime: 0,
                xpEarned: 0,
                focusSessions: 0
            };
            user.activityLog.push(todayLog);
        }

        todayLog.problemsSolved += problemsSolved || 0;
        todayLog.studyTime += studyTime || 0;
        todayLog.xpEarned += xpEarned || 0;

        // Update streak
        updateStreak(user);

        await user.save();
        res.json({ success: true, todayLog });
    } catch (error) {
        res.status(500).json({ message: "Error logging activity" });
    }
};

// Create a task
exports.createTask = async (req, res) => {
    try {
        const { title, priority, xp, category } = req.body;
        const user = await User.findById(req.user.id);

        const newTask = {
            title,
            priority: priority || 'medium',
            xp: xp || 25,
            category: category || 'general',
            completed: false,
            createdAt: new Date()
        };

        user.tasks.push(newTask);
        await user.save();

        res.status(201).json(user.tasks[user.tasks.length - 1]);
    } catch (error) {
        res.status(500).json({ message: "Error creating task" });
    }
};

// Toggle task completion
exports.toggleTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const user = await User.findById(req.user.id);

        const task = user.tasks.id(taskId);
        if (!task) return res.status(404).json({ message: "Task not found" });

        task.completed = !task.completed;

        if (task.completed) {
            user.stats.xp += task.xp;
            user.stats.level = Math.floor(user.stats.xp / 1000) + 1;

            // Update today's activity
            const today = new Date().toISOString().split('T')[0];
            let todayLog = user.activityLog.find(log => log.date === today);
            if (!todayLog) {
                todayLog = { date: today, problemsSolved: 0, studyTime: 0, xpEarned: 0, focusSessions: 0 };
                user.activityLog.push(todayLog);
            }
            todayLog.xpEarned += task.xp;
        } else {
            user.stats.xp = Math.max(0, user.stats.xp - task.xp);
            user.stats.level = Math.floor(user.stats.xp / 1000) + 1;
        }

        await user.save();
        res.json({ success: true, task, newXP: user.stats.xp, newLevel: user.stats.level });
    } catch (error) {
        console.error('Toggle Task Error:', error);
        res.status(500).json({ message: "Error toggling task" });
    }
};

// AI Chat - Using Groq API (Fast & Free)
exports.chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({ message: "Message is required" });
        }

        const GROQ_API_KEY = process.env.GROQ_API_KEY_SOLOMODE || process.env.GROQ_API_KEY || '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';

        // Check if API Key is configured
        if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
            return res.json({ response: `⚠️ **AI Brain Missing!**\n\nTo answer your questions, I need a **Groq API Key** (free & unlimited!).\n\n**Get it in 30 seconds:**\n1. Visit: https://console.groq.com/keys\n2. Sign up (free, no credit card)\n3. Click "Create API Key"\n4. Copy the key (starts with gsk_...)\n5. Add to backend/.env: GROQ_API_KEY=gsk_...\n6. Restart backend\n\nGroq is FREE, FAST, and has NO rate limits! 🚀` });
        }

        // Try to load user (optional - for chat history)
        let user = null;
        let recentHistory = [];
        try {
            if (req.user && req.user.id) {
                user = await User.findById(req.user.id);
                if (user) {
                    user.chatHistory.push({ role: 'user', message });
                    recentHistory = user.chatHistory.slice(-4).map(msg => ({
                        role: msg.role === 'user' ? 'user' : 'assistant',
                        content: msg.message
                    }));
                }
            }
        } catch (userErr) {
            console.log('⚠️ User lookup skipped (not logged in or error):', userErr.message);
        }

        console.log('🚀 Calling Groq API for AI Chat...');

        let aiResponse = "";

        try {
            const groqResponse = await fetch(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${GROQ_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'llama-3.3-70b-versatile',
                        messages: [
                            {
                                role: 'system',
                                content: 'You are an expert study mentor. Answer questions clearly with examples. Be concise but helpful.'
                            },
                            ...recentHistory,
                            {
                                role: 'user',
                                content: message
                            }
                        ],
                        temperature: 0.7,
                        max_tokens: 1000,
                        top_p: 1,
                        stream: false
                    })
                }
            );

            const data = await groqResponse.json();

            if (data.choices && data.choices[0]?.message?.content) {
                aiResponse = data.choices[0].message.content;
                console.log('✅ Groq Chat Response received');
            } else if (data.error) {
                console.error('❌ Groq API Error:', data.error);
                aiResponse = `**API Error:** ${data.error.message}`;
            } else {
                aiResponse = "**Error:** Unexpected response format.";
            }
        } catch (apiError) {
            console.error('❌ Groq Exception:', apiError.message);
            aiResponse = `**Network Error:** ${apiError.message}`;
        }

        if (!aiResponse) {
            aiResponse = "I'm offline. Please try again.";
        }

        // Save chat history if user is authenticated
        if (user) {
            try {
                user.chatHistory.push({ role: 'ai', message: aiResponse });
                if (user.chatHistory.length > 50) {
                    user.chatHistory = user.chatHistory.slice(-50);
                }
                await user.save();
            } catch (saveErr) {
                console.log('⚠️ Could not save chat history:', saveErr.message);
            }
        }

        res.json({ response: aiResponse });
    } catch (error) {
        console.error('Chat Error:', error);
        res.status(500).json({ message: "Error processing chat" });
    }
};

// Intelligent response generator for any question
function generateIntelligentResponse(message, user) {
    const lowerMsg = message.toLowerCase();
    const words = lowerMsg.split(/\s+/);

    // Detect question type
    const isHowQuestion = lowerMsg.startsWith('how') || lowerMsg.includes('how to') || lowerMsg.includes('how do');
    const isWhatQuestion = lowerMsg.startsWith('what') || lowerMsg.includes('what is') || lowerMsg.includes('what are');
    const isWhyQuestion = lowerMsg.startsWith('why') || lowerMsg.includes('why is') || lowerMsg.includes('why does');
    const isExplainRequest = lowerMsg.includes('explain') || lowerMsg.includes('tell me about') || lowerMsg.includes('describe');
    const isSolveRequest = lowerMsg.includes('solve') || lowerMsg.includes('solution') || lowerMsg.includes('answer');
    const isCodeRequest = lowerMsg.includes('code') || lowerMsg.includes('program') || lowerMsg.includes('implement') || lowerMsg.includes('write');

    // Programming/DSA Topics
    if (containsAny(lowerMsg, ['array', 'list', 'vector'])) {
        return generateTopicExplanation('Arrays', {
            definition: 'A linear data structure that stores elements in contiguous memory locations.',
            keyPoints: [
                'Fixed size (static arrays) or dynamic size',
                'O(1) access by index',
                'O(n) insertion/deletion (need to shift elements)',
                'Great for sequential access patterns'
            ],
            example: `// Example: Finding max element
int findMax(int arr[], int n) {
    int max = arr[0];
    for(int i = 1; i < n; i++) {
        if(arr[i] > max) max = arr[i];
    }
    return max;
}`,
            patterns: ['Two Pointers', 'Sliding Window', 'Prefix Sum', 'Kadane\'s Algorithm'],
            practiceProblems: ['Two Sum', 'Maximum Subarray', 'Merge Intervals']
        });
    }

    if (containsAny(lowerMsg, ['linked list', 'linkedlist', 'node', 'pointer'])) {
        return generateTopicExplanation('Linked Lists', {
            definition: 'A linear data structure where elements are stored in nodes, each pointing to the next.',
            keyPoints: [
                'Dynamic size - grows/shrinks easily',
                'O(n) access - must traverse from head',
                'O(1) insertion/deletion at known position',
                'Types: Singly, Doubly, Circular'
            ],
            example: `// Node structure
struct Node {
    int data;
    Node* next;
};

// Insert at beginning
void insertAtHead(Node** head, int data) {
    Node* newNode = new Node();
    newNode->data = data;
    newNode->next = *head;
    *head = newNode;
}`,
            patterns: ['Fast & Slow Pointers', 'Reverse', 'Merge', 'Detect Cycle'],
            practiceProblems: ['Reverse Linked List', 'Detect Cycle', 'Merge Two Sorted Lists']
        });
    }

    if (containsAny(lowerMsg, ['tree', 'binary tree', 'bst', 'traversal'])) {
        return generateTopicExplanation('Trees', {
            definition: 'A hierarchical data structure with nodes connected by edges, having one root and no cycles.',
            keyPoints: [
                'Root: topmost node, Leaf: no children',
                'Height: longest path from root to leaf',
                'BST: left < root < right property',
                'Balanced trees ensure O(log n) operations'
            ],
            example: `// Tree Traversals
void inorder(Node* root) {
    if(root == NULL) return;
    inorder(root->left);    // Left
    cout << root->data;      // Root
    inorder(root->right);   // Right
}

void preorder(Node* root) {
    if(root == NULL) return;
    cout << root->data;      // Root
    preorder(root->left);    // Left
    preorder(root->right);   // Right
}`,
            patterns: ['DFS (Inorder, Preorder, Postorder)', 'BFS (Level Order)', 'Recursion'],
            practiceProblems: ['Maximum Depth', 'Invert Binary Tree', 'Validate BST', 'Lowest Common Ancestor']
        });
    }

    if (containsAny(lowerMsg, ['graph', 'bfs', 'dfs', 'dijkstra', 'shortest path'])) {
        return generateTopicExplanation('Graphs', {
            definition: 'A data structure consisting of vertices (nodes) connected by edges.',
            keyPoints: [
                'Types: Directed/Undirected, Weighted/Unweighted',
                'Representations: Adjacency Matrix, Adjacency List',
                'BFS: Level-by-level, uses Queue, finds shortest path (unweighted)',
                'DFS: Explores deeply, uses Stack/Recursion, finds all paths'
            ],
            example: `// BFS Implementation
void BFS(vector<vector<int>>& adj, int start) {
    vector<bool> visited(adj.size(), false);
    queue<int> q;
    q.push(start);
    visited[start] = true;
    
    while(!q.empty()) {
        int node = q.front();
        q.pop();
        cout << node << " ";
        
        for(int neighbor : adj[node]) {
            if(!visited[neighbor]) {
                visited[neighbor] = true;
                q.push(neighbor);
            }
        }
    }
}`,
            patterns: ['BFS for shortest path', 'DFS for exploration', 'Topological Sort', 'Union-Find'],
            practiceProblems: ['Number of Islands', 'Course Schedule', 'Clone Graph', 'Word Ladder']
        });
    }

    if (containsAny(lowerMsg, ['dynamic programming', ' dp ', 'memoization', 'tabulation', 'subproblem'])) {
        return generateTopicExplanation('Dynamic Programming', {
            definition: 'An optimization technique that solves problems by breaking them into overlapping subproblems and storing results.',
            keyPoints: [
                '1. Identify if problem has optimal substructure',
                '2. Check for overlapping subproblems',
                '3. Define state (what changes between subproblems)',
                '4. Write recurrence relation',
                '5. Choose: Memoization (top-down) or Tabulation (bottom-up)'
            ],
            example: `// Fibonacci with Memoization
int fib(int n, vector<int>& memo) {
    if(n <= 1) return n;
    if(memo[n] != -1) return memo[n];
    memo[n] = fib(n-1, memo) + fib(n-2, memo);
    return memo[n];
}

// Fibonacci with Tabulation
int fibTab(int n) {
    vector<int> dp(n+1);
    dp[0] = 0; dp[1] = 1;
    for(int i = 2; i <= n; i++) {
        dp[i] = dp[i-1] + dp[i-2];
    }
    return dp[n];
}`,
            patterns: ['0/1 Knapsack', 'Longest Common Subsequence', 'Matrix Chain', 'Subset Sum'],
            practiceProblems: ['Climbing Stairs', 'Coin Change', 'Longest Increasing Subsequence', 'Edit Distance']
        });
    }

    if (containsAny(lowerMsg, ['recursion', 'recursive', 'base case', 'backtracking'])) {
        return generateTopicExplanation('Recursion & Backtracking', {
            definition: 'Recursion is when a function calls itself. Backtracking explores all possibilities by trying choices and undoing them if they don\'t work.',
            keyPoints: [
                'Every recursion needs: Base Case + Recursive Case',
                'Think: How does solving smaller problem help?',
                'Backtracking = Recursion + Undoing choices',
                'Used for: Permutations, Combinations, Puzzles'
            ],
            example: `// Generate all subsets (backtracking)
void generateSubsets(vector<int>& nums, int i, 
                     vector<int>& current, 
                     vector<vector<int>>& result) {
    if(i == nums.size()) {
        result.push_back(current);
        return;
    }
    // Include nums[i]
    current.push_back(nums[i]);
    generateSubsets(nums, i+1, current, result);
    current.pop_back(); // Backtrack
    
    // Exclude nums[i]
    generateSubsets(nums, i+1, current, result);
}`,
            patterns: ['Subsets', 'Permutations', 'N-Queens', 'Sudoku Solver'],
            practiceProblems: ['Subsets', 'Permutations', 'Combination Sum', 'Word Search']
        });
    }

    if (containsAny(lowerMsg, ['sort', 'sorting', 'merge sort', 'quick sort', 'bubble'])) {
        return generateTopicExplanation('Sorting Algorithms', {
            definition: 'Algorithms that arrange elements in a specific order (ascending/descending).',
            keyPoints: [
                'Bubble/Insertion/Selection: O(n²) - simple but slow',
                'Merge Sort: O(n log n) - stable, uses extra space',
                'Quick Sort: O(n log n) average - in-place, not stable',
                'Counting/Radix: O(n) - for specific cases'
            ],
            example: `// Quick Sort
int partition(int arr[], int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    for(int j = low; j < high; j++) {
        if(arr[j] < pivot) {
            i++;
            swap(arr[i], arr[j]);
        }
    }
    swap(arr[i+1], arr[high]);
    return i + 1;
}

void quickSort(int arr[], int low, int high) {
    if(low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}`,
            patterns: ['Divide & Conquer', 'Two Pointers for merging'],
            practiceProblems: ['Sort an Array', 'Merge Intervals', 'Sort Colors', 'Kth Largest Element']
        });
    }

    if (containsAny(lowerMsg, ['binary search', 'search', 'find'])) {
        return generateTopicExplanation('Binary Search', {
            definition: 'A search algorithm that finds a target in a sorted array by repeatedly dividing the search interval in half.',
            keyPoints: [
                'Only works on SORTED data',
                'O(log n) time complexity',
                'Compare with middle, go left or right',
                'Can be used for more than just searching!'
            ],
            example: `// Standard Binary Search
int binarySearch(int arr[], int n, int target) {
    int left = 0, right = n - 1;
    
    while(left <= right) {
        int mid = left + (right - left) / 2;
        
        if(arr[mid] == target) return mid;
        else if(arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1; // Not found
}

// Find first occurrence
int firstOccurrence(int arr[], int n, int target) {
    int left = 0, right = n - 1, result = -1;
    while(left <= right) {
        int mid = left + (right - left) / 2;
        if(arr[mid] == target) {
            result = mid;
            right = mid - 1; // Keep searching left
        } else if(arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return result;
}`,
            patterns: ['Find exact value', 'Find boundary', 'Search in answer space'],
            practiceProblems: ['Binary Search', 'Search in Rotated Array', 'Find Peak Element', 'Koko Eating Bananas']
        });
    }

    // Stack & Queue
    if (containsAny(lowerMsg, ['stack', 'queue', 'lifo', 'fifo'])) {
        return generateTopicExplanation('Stack & Queue', {
            definition: 'Stack (LIFO): Last In First Out. Queue (FIFO): First In First Out.',
            keyPoints: [
                'Stack: push/pop/top - all O(1)',
                'Queue: enqueue/dequeue/front - all O(1)',
                'Stack uses: Expression evaluation, Parentheses matching, Undo functionality',
                'Queue uses: BFS, Task scheduling, Buffering'
            ],
            example: `// Check balanced parentheses using Stack
bool isBalanced(string s) {
    stack<char> st;
    for(char c : s) {
        if(c == '(' || c == '{' || c == '[') {
            st.push(c);
        } else {
            if(st.empty()) return false;
            char top = st.top();
            if((c == ')' && top == '(') ||
               (c == '}' && top == '{') ||
               (c == ']' && top == '[')) {
                st.pop();
            } else return false;
        }
    }
    return st.empty();
}`,
            patterns: ['Monotonic Stack', 'Next Greater Element', 'Sliding Window (Deque)'],
            practiceProblems: ['Valid Parentheses', 'Daily Temperatures', 'Sliding Window Maximum']
        });
    }

    // Hash Map / Set
    if (containsAny(lowerMsg, ['hash', 'map', 'dictionary', 'set', 'hashmap', 'hashtable'])) {
        return generateTopicExplanation('Hash Tables (Maps & Sets)', {
            definition: 'A data structure that maps keys to values using a hash function for O(1) average access.',
            keyPoints: [
                'O(1) average for insert, delete, search',
                'HashMap: key-value pairs',
                'HashSet: unique values only',
                'Handles collisions via chaining or probing'
            ],
            example: `// Count frequency of elements
unordered_map<int, int> countFrequency(vector<int>& nums) {
    unordered_map<int, int> freq;
    for(int num : nums) {
        freq[num]++;
    }
    return freq;
}

// Two Sum using HashMap
vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> seen;
    for(int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        if(seen.count(complement)) {
            return {seen[complement], i};
        }
        seen[nums[i]] = i;
    }
    return {};
}`,
            patterns: ['Frequency counting', 'Two Sum pattern', 'Grouping/Categorizing'],
            practiceProblems: ['Two Sum', 'Group Anagrams', 'Longest Consecutive Sequence', 'Top K Frequent']
        });
    }

    // Time Complexity
    if (containsAny(lowerMsg, ['time complexity', 'space complexity', 'big o', 'complexity', 'o(n)'])) {
        return `⏱️ **Time & Space Complexity**

**Big O Notation** describes how algorithm performance scales with input size.

📊 **Common Complexities (best to worst):**

| Complexity | Name | Example |
|------------|------|---------|
| O(1) | Constant | Array access by index |
| O(log n) | Logarithmic | Binary Search |
| O(n) | Linear | Single loop through array |
| O(n log n) | Linearithmic | Merge Sort, Quick Sort |
| O(n²) | Quadratic | Nested loops |
| O(2ⁿ) | Exponential | Recursive Fibonacci |
| O(n!) | Factorial | Permutations |

🔍 **How to Analyze:**

1. **Identify loops** - Each loop multiplies complexity
2. **Recursive calls** - Draw the recursion tree
3. **Drop constants** - O(2n) → O(n)
4. **Keep dominant term** - O(n² + n) → O(n²)

💡 **Tips to Optimize:**
- Use HashMaps to reduce O(n²) → O(n)
- Use Binary Search on sorted data
- Use memoization for overlapping subproblems
- Consider space-time tradeoffs

What specific algorithm's complexity would you like me to analyze?`;
    }

    // Study methods
    if (containsAny(lowerMsg, ['study', 'learn', 'memorize', 'remember', 'prepare', 'exam'])) {
        return `📚 **Effective Study Strategies**

**🧠 Active Learning Techniques:**

1. **Feynman Technique**
   - Explain the concept as if teaching a 5-year-old
   - Identify gaps in your understanding
   - Go back and fill those gaps

2. **Spaced Repetition**
   - Review after: 1 day → 3 days → 1 week → 2 weeks
   - Use flashcards (Anki is great!)
   - Don't cram - spread learning over time

3. **Practice Problems**
   - Solve problems WITHOUT looking at solutions first
   - Struggle for 15-20 mins before checking hints
   - Review and re-solve problems after a few days

4. **Pomodoro Technique**
   - 25 mins focused study
   - 5 mins break
   - After 4 sessions, take 15-30 min break

**📅 Study Plan Framework:**
\`\`\`
Week 1-2: Arrays, Strings, Two Pointers
Week 3-4: Linked Lists, Stacks, Queues
Week 5-6: Trees, BST, Recursion
Week 7-8: Graphs (BFS, DFS)
Week 9-10: Dynamic Programming
Week 11-12: Mixed practice + Mock interviews
\`\`\`

**💪 Motivation Tips:**
- Set small, achievable daily goals (2-3 problems)
- Track your progress visually
- Celebrate wins, no matter how small
- Remember: Consistency > Intensity

What specific topic would you like to start studying?`;
    }

    // Greetings
    if (containsAny(lowerMsg, ['hello', 'hi', 'hey', 'good morning', 'good evening'])) {
        return `👋 **Hello! Welcome to StudySpirit AI!**

I'm your personal study mentor, and I can help you with virtually ANY academic topic!

**📚 What I can help with:**
- **Programming & DSA** - Arrays, Trees, Graphs, DP, and more
- **Problem Solving** - Step-by-step explanations and hints
- **Concepts** - Any subject: Math, Science, CS fundamentals
- **Study Tips** - Effective learning strategies
- **Exam Prep** - Practice and review techniques

**💡 How to get the best help:**
- Ask specific questions for detailed answers
- Request examples if you need code
- Ask "explain like I'm a beginner" for simpler explanations
- Tell me where you're stuck for targeted help

**What would you like to learn today?** 🎯`;
    }

    // Thanks
    if (containsAny(lowerMsg, ['thank', 'thanks', 'thx'])) {
        return `You're very welcome! 🌟

**Remember:**
- Every question you ask makes you smarter
- Struggling with problems is how learning happens
- Consistency beats intensity

Feel free to ask anything else - I'm here to help you succeed! 🚀

Happy studying! 💪`;
    }

    // Handle any other question with helpful response
    return `📚 **I'd love to help you with: "${message}"**

To give you the best answer, I need a bit more context:

**If you're asking about a concept:**
→ Tell me your current level (beginner/intermediate/advanced)
→ What specifically confuses you?

**If you're stuck on a problem:**
→ What approach have you tried?
→ What's the expected output?

**If you want code:**
→ What programming language?
→ What are the input/output requirements?

**I can help you with:**
• Data Structures (Arrays, Trees, Graphs, etc.)
• Algorithms (Sorting, Searching, DP, etc.)
• Programming concepts
• Mathematics & Science
• Study techniques & exam prep

**Just rephrase your question with more details, and I'll give you a comprehensive explanation!** 🎯`;
}

// Helper function to check if message contains any of the keywords
function containsAny(text, keywords) {
    return keywords.some(keyword => text.includes(keyword));
}

// Generate topic explanation in structured format
function generateTopicExplanation(topic, info) {
    let response = `📚 **${topic}**\n\n`;
    response += `**Definition:** ${info.definition}\n\n`;
    response += `**Key Points:**\n`;
    info.keyPoints.forEach((point, i) => {
        response += `${i + 1}. ${point}\n`;
    });
    response += `\n**Code Example:**\n\`\`\`cpp\n${info.example}\n\`\`\`\n\n`;
    response += `**Common Patterns:** ${info.patterns.join(', ')}\n\n`;
    response += `**Practice Problems:** ${info.practiceProblems.join(', ')}\n\n`;
    response += `Would you like me to explain any of these in more detail? Or work through a specific problem?`;
    return response;
}

// Generate helpful response for any question
function generateHelpfulResponse(message, isHow, isWhat, isWhy, isExplain, isCode) {
    // Extract the main topic from the question
    const cleanedMsg = message.replace(/[?!.,]/g, '').trim();

    let response = `I'd love to help you with: **"${message}"**\n\n`;

    if (isHow) {
        response += `📝 **Here's my approach to answer your "How" question:**\n\n`;
        response += `To give you the best step-by-step explanation, could you tell me:\n`;
        response += `1. What's your current understanding of this topic?\n`;
        response += `2. Are you looking for a conceptual explanation or code implementation?\n\n`;
    } else if (isWhat) {
        response += `📖 **Let me explain this concept:**\n\n`;
        response += `To provide the most helpful explanation, please share:\n`;
        response += `1. What context are you learning this in? (course, interview prep, etc.)\n`;
        response += `2. What related concepts are you already familiar with?\n\n`;
    } else if (isWhy) {
        response += `🤔 **Great question! Understanding "why" is key to deep learning.**\n\n`;
        response += `To explain the reasoning behind this, tell me:\n`;
        response += `1. What's your hypothesis about why this might be the case?\n`;
        response += `2. Any specific part that's confusing?\n\n`;
    } else if (isCode) {
        response += `💻 **I can help you with the code!**\n\n`;
        response += `For a complete solution, please share:\n`;
        response += `1. What programming language are you using?\n`;
        response += `2. What's the expected input and output?\n`;
        response += `3. Any constraints to consider?\n\n`;
    } else if (isExplain) {
        response += `📚 **I'll explain this clearly for you!**\n\n`;
        response += `To tailor my explanation:\n`;
        response += `1. What's your background level? (beginner/intermediate/advanced)\n`;
        response += `2. Would you like examples and analogies?\n\n`;
    }

    response += `**Meanwhile, here's a starting point:**\n\n`;
    response += `I'm ready to explain ANY topic including:\n`;
    response += `• Data Structures & Algorithms\n`;
    response += `• Programming concepts\n`;
    response += `• Mathematics\n`;
    response += `• Problem-solving strategies\n`;
    response += `• Study techniques\n\n`;
    response += `Just provide a bit more context, and I'll give you a comprehensive explanation! 🎯`;

    return response;
}


// Helper Functions

function generateActivityHeatmap(activityLog) {
    const heatmap = [];
    const today = new Date();

    for (let i = 83; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const log = activityLog?.find(l => l.date === dateStr);
        const problemCount = log?.problemsSolved || 0;

        let level = 0;
        if (problemCount >= 8) level = 4;
        else if (problemCount >= 5) level = 3;
        else if (problemCount >= 3) level = 2;
        else if (problemCount >= 1) level = 1;

        heatmap.push({
            date: dateStr,
            count: problemCount,
            level
        });
    }

    return heatmap;
}

function calculateWeeklyPerformance(activityLog) {
    const weekData = [];
    const today = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const log = activityLog?.find(l => l.date === dateStr);

        weekData.push({
            day: days[date.getDay()],
            problems: log?.problemsSolved || 0,
            time: log?.studyTime ? (log.studyTime / 3600).toFixed(1) : 0,
            xp: log?.xpEarned || 0
        });
    }

    return weekData;
}

function updateStreak(user) {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const todayLog = user.activityLog.find(l => l.date === today);
    const yesterdayLog = user.activityLog.find(l => l.date === yesterdayStr);

    if (todayLog && todayLog.problemsSolved > 0) {
        if (yesterdayLog && yesterdayLog.problemsSolved > 0) {
            // Continue streak
        } else if (!yesterdayLog || yesterdayLog.problemsSolved === 0) {
            if (user.stats.streak > 0) {
                // Check if we need to reset streak
                const twoDaysAgo = new Date();
                twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
                const twoDaysAgoLog = user.activityLog.find(l => l.date === twoDaysAgo.toISOString().split('T')[0]);
                if (!twoDaysAgoLog || twoDaysAgoLog.problemsSolved === 0) {
                    user.stats.streak = 1;
                }
            } else {
                user.stats.streak = 1;
            }
        }

        // Increment streak if active today
        if (user.stats.streak === 0 || (yesterdayLog && yesterdayLog.problemsSolved > 0)) {
            user.stats.streak += 1;
        }
    }
}

// Connect Platform (Real API Integration)
exports.connectPlatform = async (req, res) => {
    try {
        const { platform, username } = req.body;

        if (!username) {
            return res.status(400).json({ message: "Username is required" });
        }

        let profileData = null;

        switch (platform.toLowerCase()) {
            case 'leetcode':
                profileData = await platformService.fetchLeetCodeProfile(username);
                if (profileData) {
                    // Also fetch contest rating
                    const contestData = await platformService.fetchLeetCodeContestRating(username);
                    profileData = {
                        username: username,
                        connected: true,
                        rating: contestData?.rating || 0,
                        problemsSolved: profileData.solved || 0,
                        rank: profileData.ranking ? `Rank ${profileData.ranking}` : 'N/A',
                        easy: profileData.easy || 0,
                        medium: profileData.medium || 0,
                        hard: profileData.hard || 0
                    };
                }
                break;

            case 'codeforces':
                profileData = await platformService.fetchCodeforcesProfile(username);
                if (profileData) {
                    const solvedCount = await platformService.fetchCodeforcesSolvedCount(username);
                    profileData = {
                        username: username,
                        connected: true,
                        rating: profileData.rating || 0,
                        maxRating: profileData.maxRating || 0,
                        problemsSolved: solvedCount,
                        rank: profileData.rank || 'Unrated'
                    };
                }
                break;

            case 'codechef':
                profileData = await platformService.fetchCodeChefProfile(username);
                if (!profileData) {
                    // Try alternative API
                    profileData = await platformService.fetchCodeChefProfileAlt(username);
                }
                if (profileData) {
                    profileData = {
                        username: username,
                        connected: true,
                        rating: profileData.rating || 0,
                        maxRating: profileData.maxRating || 0,
                        problemsSolved: profileData.solved || 0,
                        stars: profileData.stars || '1★'
                    };
                }
                break;

            case 'hackerrank':
                profileData = await platformService.fetchHackerRankProfile(username);
                if (!profileData) {
                    profileData = await platformService.fetchHackerRankProfileAlt(username);
                }
                if (profileData) {
                    profileData = {
                        username: username,
                        connected: true,
                        problemsSolved: profileData.problemsSolved || 0,
                        badges: profileData.badges || 0,
                        points: profileData.points || 0,
                        rank: profileData.rank || 0,
                        stars: profileData.stars || 0
                    };
                }
                break;

            case 'hackerearth':
                profileData = await platformService.fetchHackerEarthProfile(username);
                if (profileData) {
                    profileData = {
                        username: username,
                        connected: true,
                        rating: profileData.rating || 0,
                        problemsSolved: profileData.problemsSolved || 0
                    };
                }
                break;

            case 'github':
                // Just link the profile, no data syncing
                profileData = {
                    username: username,
                    connected: true
                };
                break;

            case 'linkedin':
                // Just link the profile
                profileData = {
                    username: username,
                    connected: true
                };
                break;

            default:
                return res.status(400).json({ message: "Invalid platform. Supported: leetcode, codeforces, codechef, hackerrank, hackerearth, github, linkedin" });
        }

        if (!profileData) {
            return res.status(404).json({ message: `User '${username}' not found on ${platform}. Please check the username.` });
        }

        // If user is authenticated, save to database
        if (req.user && req.user.id) {
            try {
                const user = await User.findById(req.user.id);
                if (user) {
                    profileData.lastSynced = new Date();
                    user.platformProfiles[platform.toLowerCase()] = profileData;
                    await user.save();
                }
            } catch (dbError) {
                console.error('Error saving to database:', dbError);
                // Continue anyway - we have the data
            }
        }

        res.json({
            success: true,
            platform,
            data: profileData
        });
    } catch (error) {
        console.error('Platform Connection Error:', error);
        res.status(500).json({ message: "Error connecting platform", error: error.message });
    }
};

// Disconnect platform
exports.disconnectPlatform = async (req, res) => {
    try {
        const { platform } = req.body;
        const user = await User.findById(req.user.id);

        if (user.platformProfiles[platform]) {
            user.platformProfiles[platform].connected = false;
            user.platformProfiles[platform].username = '';
            await user.save();
            res.json({ success: true, message: `Disconnected from ${platform}` });
        } else {
            res.status(400).json({ message: "Invalid platform" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error disconnecting platform" });
    }
};

// Get all upcoming contests
exports.getUpcomingContests = async (req, res) => {
    try {
        const contests = await platformService.fetchAllUpcomingContests();

        // Format contests for frontend
        const formattedContests = contests.map(contest => ({
            id: contest.id,
            name: contest.name,
            platform: contest.platform,
            type: contest.type,
            time: platformService.formatTimeUntil(contest.startTime),
            date: platformService.formatContestDate(contest.startTime),
            url: contest.url,
            startTime: contest.startTime,
            durationSeconds: contest.durationSeconds
        }));

        res.json(formattedContests);
    } catch (error) {
        console.error('Contests API Error:', error);
        res.status(500).json({ message: "Error fetching contests" });
    }
};

// Refresh platform data
exports.refreshPlatformData = async (req, res) => {
    try {
        const { platform } = req.params;
        const user = await User.findById(req.user.id);

        const platformProfile = user.platformProfiles[platform];
        if (!platformProfile || !platformProfile.connected || !platformProfile.username) {
            return res.status(400).json({ message: `${platform} is not connected. Please connect first.` });
        }

        // Cache Check: Don't refresh if it was synced in the last hour to prevent API Bans (Rate Limits)
        if (platformProfile.lastSynced) {
            const lastSyncedTime = new Date(platformProfile.lastSynced).getTime();
            const now = new Date().getTime();
            const oneHourInMillis = 60 * 60 * 1000;

            if (now - lastSyncedTime < oneHourInMillis) {
                console.log(`[Cache Hit] Serving cached platform data for ${platform}`);
                return res.json({ success: true, platform, data: platformProfile, cached: true });
            }
        }

        const username = platformProfile.username;
        let updatedData = null;

        switch (platform) {
            case 'leetcode':
                const lcProfile = await platformService.fetchLeetCodeProfile(username);
                const lcContest = await platformService.fetchLeetCodeContestRating(username);
                if (lcProfile) {
                    user.platformProfiles.leetcode = {
                        ...user.platformProfiles.leetcode,
                        rating: lcContest?.rating || user.platformProfiles.leetcode.rating,
                        problemsSolved: lcProfile.solved,
                        rank: lcProfile.ranking ? `Rank ${lcProfile.ranking}` : user.platformProfiles.leetcode.rank,
                        easy: lcProfile.easy,
                        medium: lcProfile.medium,
                        hard: lcProfile.hard
                    };
                    updatedData = user.platformProfiles.leetcode;
                }
                break;

            case 'codeforces':
                const cfProfile = await platformService.fetchCodeforcesProfile(username);
                if (cfProfile) {
                    const solvedCount = await platformService.fetchCodeforcesSolvedCount(username);
                    user.platformProfiles.codeforces = {
                        ...user.platformProfiles.codeforces,
                        rating: cfProfile.rating,
                        maxRating: cfProfile.maxRating,
                        rank: cfProfile.rank,
                        problemsSolved: solvedCount
                    };
                    updatedData = user.platformProfiles.codeforces;
                }
                break;

            case 'codechef':
                let ccProfile = await platformService.fetchCodeChefProfile(username);
                if (!ccProfile) ccProfile = await platformService.fetchCodeChefProfileAlt(username);
                if (ccProfile) {
                    user.platformProfiles.codechef = {
                        ...user.platformProfiles.codechef,
                        rating: ccProfile.rating,
                        maxRating: ccProfile.maxRating,
                        stars: ccProfile.stars,
                        problemsSolved: ccProfile.solved || user.platformProfiles.codechef.problemsSolved
                    };
                    updatedData = user.platformProfiles.codechef;
                }
                break;

            case 'hackerrank':
                let hrProfile = await platformService.fetchHackerRankProfile(username);
                if (!hrProfile) hrProfile = await platformService.fetchHackerRankProfileAlt(username);
                if (hrProfile) {
                    user.platformProfiles.hackerrank = {
                        ...user.platformProfiles.hackerrank,
                        problemsSolved: hrProfile.problemsSolved,
                        points: hrProfile.points,
                        rank: hrProfile.rank,
                        stars: hrProfile.stars
                    };
                    updatedData = user.platformProfiles.hackerrank;
                }
                break;

            case 'hackerearth':
                const heProfile = await platformService.fetchHackerEarthProfile(username);
                if (heProfile) {
                    user.platformProfiles.hackerearth = {
                        ...user.platformProfiles.hackerearth,
                        rating: heProfile.rating,
                        problemsSolved: heProfile.problemsSolved
                    };
                    updatedData = user.platformProfiles.hackerearth;
                }
                break;

            case 'github':
            case 'linkedin':
                // No syncing for these platforms, just return existing data
                updatedData = user.platformProfiles[platform];
                break;

            default:
                return res.status(400).json({ message: "Invalid platform" });
        }

        if (!updatedData) {
            return res.status(500).json({ message: `Failed to refresh ${platform} data` });
        }

        // Set last synced timestamp to prevent rate-limit bans
        updatedData.lastSynced = new Date();

        await user.save();
        res.json({ success: true, platform, data: updatedData });
    } catch (error) {
        console.error('Refresh Platform Error:', error);
        res.status(500).json({ message: "Error refreshing platform data" });
    }
};

// Get Study Suggestions based on workload, days, and pressure
// AI-Powered Study Planner using Groq
exports.getStudySuggestions = async (req, res) => {
    try {
        const { topics, daysAvailable, hoursPerDay, pressureLevel } = req.body;
        const GROQ_API_KEY = process.env.GROQ_API_KEY_PLANNER || process.env.GROQ_API_KEY || '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';

        // Validation
        if (!topics || topics.trim().length === 0) {
            return res.status(400).json({ message: "Topics/chapters are required" });
        }

        if (!daysAvailable || daysAvailable < 1) {
            return res.status(400).json({ message: "Days available is required" });
        }

        if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
            return res.status(500).json({ message: "AI service not configured" });
        }

        // Calculate Derived Metrics and Structure for Frontend
        const hours = parseInt(hoursPerDay) || 4;
        const days = parseInt(daysAvailable) || 7;
        const pressure = pressureLevel || "medium";

        let intensity = 'moderate';
        if ((pressure === 'high' && hours >= 4) || hours >= 6) intensity = 'intense';
        else if (pressure === 'low' && hours < 3) intensity = 'relaxed';
        else intensity = 'moderate';

        const totalHours = hours * days;
        const pomodoroLength = 25;
        const focusSessions = Math.floor((hours * 60) / 30); // 25m work + 5m break

        const summary = {
            intensity,
            totalDays: days,
            totalHours: totalHours,
            topics: topics
        };

        const dailyPlan = {
            totalHours: hours,
            focusSessions: focusSessions,
            pomodoroLength: pomodoroLength
        };

        const motivation = getMotivationalMessage(intensity, pressure);

        // Build Prompt for AI
        const prompt = `You are an expert study mentor. Create a structured study plan for:
- Topics: ${topics}
- Duration: ${days} days
- Daily Study: ${hours} hours
- Intensity level: ${intensity}

Return a valid JSON object with this exact structure:
{
  "name": "A creative name for the study plan",
  "description": "A brief, encouraging description of the plan",
  "subjects": ["List", "of", "main", "topics", "covered"],
  "schedule": {
    "Day 1": {
      "focus": "Main topic/theme for the day",
      "hours": ${hours},
      "description": "Brief description of what to do"
    },
    // ... continue for all ${days} days
  }
}
Do not include markdown formatting. Return raw JSON only.`;

        // Call Groq API
        try {
            const groqResponse = await fetch(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${GROQ_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'llama-3.3-70b-versatile',
                        messages: [
                            {
                                role: 'system',
                                content: 'You are an expert study planner. You strictly output valid JSON only.'
                            },
                            {
                                role: 'user',
                                content: prompt
                            }
                        ],
                        temperature: 0.5,
                        response_format: { type: "json_object" },
                        max_tokens: 3500
                    })
                }
            );

            const data = await groqResponse.json();

            if (data.choices && data.choices[0]?.message?.content) {
                let aiResult;
                try {
                    aiResult = JSON.parse(data.choices[0].message.content);
                } catch (e) {
                    const raw = data.choices[0].message.content.replace(/```json/g, '').replace(/```/g, '');
                    aiResult = JSON.parse(raw);
                }

                res.json({
                    success: true,
                    plan: {
                        name: aiResult.name || `Study Plan for ${topics}`,
                        description: aiResult.description || "Your customized study roadmap.",
                        subjects: aiResult.subjects || (topics ? topics.split(',').map(s => s.trim()) : []),
                        schedule: aiResult.schedule || {},
                        duration: `${days} Days`,
                        hoursPerDay: hours
                    }
                });
            } else {
                throw new Error("No response from AI");
            }
        } catch (apiError) {
            console.error('Groq API Error:', apiError);
            res.status(500).json({ message: "Error generating study plan. Please try again." });
        }
    } catch (error) {
        console.error('Study Suggestions Error:', error);
        res.status(500).json({ message: "Error processing request" });
    }
};

function getMotivationalMessage(intensity, pressure) {
    const messages = {
        'intense-high': "💪 This is challenging, but you've got this! Focus on one topic at a time. Every hour of focused study counts. Remember: pressure creates diamonds!",
        'intense-medium': "🔥 Ambitious goals need focused action! Break down your study into small wins. You're capable of more than you think!",
        'intense-low': "📈 Great mindset! Channel that calm energy into deep, focused study sessions. Consistency will be your superpower.",
        'moderate-high': "🎯 You have a solid plan! The pressure you feel just shows you care. Use that energy wisely and take breaks.",
        'moderate-medium': "✨ Perfect balance! Stay consistent, review regularly, and you'll master this material. You're on the right track!",
        'moderate-low': "🌟 Smooth sailing! Use this comfortable pace to go deep on difficult concepts. Quality over quantity!",
        'relaxed-high': "🧘 Take a breath - you have more time than you think! The pressure is internal. Focus on understanding, not just covering material.",
        'relaxed-medium': "🌈 Great position! Use this time wisely for thorough understanding. Build strong foundations.",
        'relaxed-low': "☕ Enjoy the learning journey! With low pressure and ample time, focus on mastering concepts and building strong skills."
    };

    return messages[`${intensity}-${pressure}`] || messages['moderate-medium'];
}
// Generate Skill Tree (Learning Path) using AI
exports.generateSkillTree = async (req, res) => {
    try {
        const { topic } = req.body;
        const GROQ_API_KEY = process.env.GROQ_API_KEY_SOLOMODE || process.env.GROQ_API_KEY || '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';

        if (!topic || topic.trim().length === 0) {
            return res.status(400).json({ message: "Topic is required" });
        }

        if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
            return res.status(500).json({ message: "AI service not configured" });
        }

        const prompt = `Create a comprehensive, hierarchical learning path (Skill Tree) for: ${topic}

**Structure:**
Break it down into 3 main levels: Beginner, Intermediate, and Advanced.
For each level, create a set of numbered **Chapters**.
For each Chapter, provide a list of detailed **Topics**.
For each Topic, list key **Subtopics**.

**JSON Response Format ONLY:**
{
  "title": "${topic} Mastery Path",
  "description": "Complete chapter-wise curriculum from basics to expert.",
  "levels": [
    {
      "name": "Beginner / Intermediate / Advanced",
      "modules": [
        {
          "title": "Chapter 1: [Chapter Name]",
          "description": "Brief chapter overview",
          "topics": [
            {
              "title": "Topic Name",
              "subtopics": ["Subtopic 1", "Subtopic 2", "Subtopic 3"]
            }
          ]
        }
      ]
    }
  ]
}

**Rules:**
1. Ensure strictly valid JSON output.
2. Use sequential chapter numbering (Chapter 1, Chapter 2...) across the levels or within levels.
3. Be detailed in subtopics.
`;

        console.log(`Generating detailed skill tree for: ${topic}`);

        const groqResponse = await fetch(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert curriculum designer. You create structured, step-by-step learning paths with chapters and subtopics. Output pure JSON only.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.5,
                    max_tokens: 3000,
                    response_format: { type: "json_object" }
                })
            }
        );

        const data = await groqResponse.json();

        if (data.error) {
            console.error('Groq API returned error:', data.error);
            return res.status(500).json({ message: data.error.message || "AI service error" });
        }

        if (data.choices && data.choices[0]?.message?.content) {
            let skillTree;
            try {
                skillTree = JSON.parse(data.choices[0].message.content);
            } catch (parseErr) {
                // Fallback: strip markdown code fences
                const raw = data.choices[0].message.content
                    .replace(/```json\s*/gi, '')
                    .replace(/```\s*/g, '')
                    .trim();
                skillTree = JSON.parse(raw);
            }
            res.json({ success: true, skillTree });
        } else {
            console.error('Unexpected Groq response:', JSON.stringify(data).substring(0, 500));
            throw new Error("No response from AI");
        }

    } catch (error) {
        console.error('Skill Tree Generation Error:', error.message || error);
        res.status(500).json({ message: "Failed to generate learning path. Please try again." });
    }
};





exports.logHeartbeat = async (req, res) => { res.status(200).json({ success: true, message: 'Heartbeat logged' }); };
