// Study Plan Templates Data
export const studyPlanTemplates = [
    {
        id: 1,
        name: '🎯 Exam Preparation (1 Week)',
        description: 'Intensive 7-day study plan for exam preparation',
        type: 'exam',
        duration: '7 days',
        hoursPerDay: 6,
        subjects: ['Subject 1', 'Subject 2', 'Subject 3'],
        schedule: {
            day1: { focus: 'Subject 1 - Core Concepts', hours: 6, breaks: 3 },
            day2: { focus: 'Subject 2 - Practice Problems', hours: 6, breaks: 3 },
            day3: { focus: 'Subject 3 - Revision', hours: 6, breaks: 3 },
            day4: { focus: 'Mixed Practice', hours: 6, breaks: 3 },
            day5: { focus: 'Mock Tests', hours: 6, breaks: 3 },
            day6: { focus: 'Weak Areas', hours: 6, breaks: 3 },
            day7: { focus: 'Final Revision', hours: 4, breaks: 2 }
        },
        techniques: ['Pomodoro', 'Active Recall', 'Spaced Repetition'],
        difficulty: 'high'
    },
    {
        id: 2,
        name: '📚 Long-Term Learning (30 Days)',
        description: 'Balanced monthly plan for skill development',
        type: 'skill-building',
        duration: '30 days',
        hoursPerDay: 3,
        subjects: ['New Skill/Technology'],
        schedule: {
            week1: { focus: 'Fundamentals & Basics', hours: 21, topics: 5 },
            week2: { focus: 'Intermediate Concepts', hours: 21, topics: 5 },
            week3: { focus: 'Advanced Topics & Projects', hours: 21, topics: 4 },
            week4: { focus: 'Practice & Portfolio Building', hours: 21, topics: 3 }
        },
        techniques: ['Feynman Technique', 'Project-Based Learning'],
        difficulty: 'medium'
    },
    {
        id: 3,
        name: '⚡ Quick Review (3 Days)',
        description: 'Fast-paced revision for last-minute preparation',
        type: 'revision',
        duration: '3 days',
        hoursPerDay: 8,
        subjects: ['All Subjects'],
        schedule: {
            day1: { focus: 'Key Concepts Review', hours: 8, breaks: 4 },
            day2: { focus: 'Practice Questions', hours: 8, breaks: 4 },
            day3: { focus: 'Mock Test & Analysis', hours: 6, breaks: 3 }
        },
        techniques: ['Active Recall', 'Mind Mapping'],
        difficulty: 'high'
    },
    {
        id: 4,
        name: '🚀 DSA Mastery (60 Days)',
        description: 'Comprehensive Data Structures & Algorithms plan',
        type: 'technical',
        duration: '60 days',
        hoursPerDay: 4,
        subjects: ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'DP'],
        schedule: {
            'Week 1-2': { focus: 'Arrays & Strings', problems: 30, hours: 56 },
            'Week 3-4': { focus: 'Linked Lists & Stacks', problems: 25, hours: 56 },
            'Week 5-6': { focus: 'Trees & BST', problems: 30, hours: 56 },
            'Week 7-8': { focus: 'Graphs & DFS/BFS', problems: 30, hours: 56 }
        },
        techniques: ['Problem Pattern Recognition', 'Spaced Repetition'],
        difficulty: 'high'
    },
    {
        id: 5,
        name: '🎨 Web Development (45 Days)',
        description: 'Full-stack web development learning path',
        type: 'course',
        duration: '45 days',
        hoursPerDay: 3,
        subjects: ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'MongoDB'],
        schedule: {
            'Week 1-2': { focus: 'HTML/CSS Fundamentals', projects: 3, hours: 42 },
            'Week 3-4': { focus: 'JavaScript Basics & DOM', projects: 4, hours: 42 },
            'Week 5-6': { focus: 'React & Component Design', projects: 3, hours: 42 },
            'Week 7': { focus: 'Backend with Node.js', projects: 2, hours: 21 }
        },
        techniques: ['Project-Based Learning', 'Code Review'],
        difficulty: 'medium'
    },
    {
        id: 6,
        name: '💼 Interview Prep (21 Days)',
        description: 'Focused plan for coding interviews',
        type: 'interview',
        duration: '21 days',
        hoursPerDay: 5,
        subjects: ['DSA', 'System Design', 'Behavioral'],
        schedule: {
            'Week 1': { focus: 'Easy-Medium Problems', problems: 35, hours: 35 },
            'Week 2': { focus: 'Medium-Hard Problems', problems: 28, hours: 35 },
            'Week 3': { focus: 'Mock Interviews & System Design', problems: 14, hours: 35 }
        },
        techniques: ['Mock Interviews', 'STAR Method', 'Whiteboarding'],
        difficulty: 'high'
    }
];

// Study Techniques Library
export const studyTechniques = [
    {
        id: 1,
        name: 'Pomodoro Technique',
        icon: '🍅',
        description: 'Work in 25-minute focused sessions with 5-minute breaks',
        bestFor: ['Focus', 'Time Management', 'Avoiding Burnout'],
        steps: [
            'Choose a task to work on',
            'Set timer for 25 minutes',
            'Work with full focus until timer rings',
            'Take a 5-minute break',
            'After 4 pomodoros, take a longer 15-30 minute break'
        ],
        effectiveness: 95,
        difficulty: 'Easy',
        timeCommitment: 'Flexible',
        color: '#ef4444'
    },
    {
        id: 2,
        name: 'Feynman Technique',
        icon: '🎓',
        description: 'Learn by teaching - explain concepts in simple terms',
        bestFor: ['Deep Understanding', 'Exam Prep', 'Conceptual Learning'],
        steps: [
            'Choose a concept to learn',
            'Explain it in simple terms as if teaching a child',
            'Identify gaps in your explanation',
            'Review source material to fill gaps',
            'Simplify and use analogies'
        ],
        effectiveness: 98,
        difficulty: 'Medium',
        timeCommitment: '30-60 min per concept',
        color: '#8b5cf6'
    },
    {
        id: 3,
        name: 'Spaced Repetition',
        icon: '📅',
        description: 'Review material at increasing intervals for long-term retention',
        bestFor: ['Memory Retention', 'Long-term Learning', 'Language Learning'],
        steps: [
            'Learn new material',
            'Review after 1 day',
            'Review after 3 days',
            'Review after 7 days',
            'Review after 14 days, then monthly'
        ],
        effectiveness: 97,
        difficulty: 'Easy',
        timeCommitment: '15-30 min daily',
        color: '#10b981'
    },
    {
        id: 4,
        name: 'Active Recall',
        icon: '🧠',
        description: 'Test yourself actively instead of passive re-reading',
        bestFor: ['Exam Preparation', 'Quick Learning', 'Self-Assessment'],
        steps: [
            'Study the material once',
            'Close your notes',
            'Write down everything you remember',
            'Check what you missed',
            'Focus on gaps in next study session'
        ],
        effectiveness: 96,
        difficulty: 'Medium',
        timeCommitment: 'Variable',
        color: '#06b6d4'
    },
    {
        id: 5,
        name: 'Mind Mapping',
        icon: '🗺️',
        description: 'Visual representation of concepts and their relationships',
        bestFor: ['Visual Learners', 'Brainstorming', 'Complex Topics'],
        steps: [
            'Write main topic in center',
            'Add main branches for key concepts',
            'Add sub-branches for details',
            'Use colors and images',
            'Review and connect related ideas'
        ],
        effectiveness: 85,
        difficulty: 'Easy',
        timeCommitment: '20-40 min per map',
        color: '#f59e0b'
    },
    {
        id: 6,
        name: 'SQ3R Method',
        icon: '📖',
        description: 'Survey, Question, Read, Recite, Review technique for textbooks',
        bestFor: ['Textbook Learning', 'Academic Study', 'Deep Comprehension'],
        steps: [
            'Survey: Skim through chapter headings',
            'Question: Turn headings into questions',
            'Read: Read actively to answer questions',
            'Recite: Summarize in your own words',
            'Review: Review notes and summaries'
        ],
        effectiveness: 90,
        difficulty: 'Medium',
        timeCommitment: '45-90 min per chapter',
        color: '#ec4899'
    }
];

// AI Plan Generation Prompts
export const generateStudyPlanPrompt = (inputs) => {
    return `You are an expert study planner AI. Generate a detailed, personalized study plan based on the following information:

**Student Profile:**
- Subjects/Topics: ${inputs.subjects}
- Days Available: ${inputs.daysAvailable} days
- Hours Per Day: ${inputs.hoursPerDay} hours
- Main Goal: ${inputs.goal}
- Current Level: ${inputs.currentLevel}
- Deadline: ${inputs.deadline || 'No specific deadline'}
- Preferred Study Technique: ${inputs.preferredTechnique}

**Requirements:**
1. Create a day-by-day breakdown of the study schedule
2. Distribute topics evenly based on complexity and available time
3. Include specific tasks for each day
4. Suggest appropriate study techniques for each topic
5. Add break times and revision sessions
6. Include practice/testing milestones
7. Provide motivational tips

**Format the response as:**

📊 **STUDY PLAN SUMMARY**
- Total Study Hours: [X] hours
- Study Intensity: [Low/Medium/High]
- Expected Outcomes: [List outcomes]

📅 **DAILY BREAKDOWN**
[Provide detailed day-by-day schedule]

🎯 **MILESTONES & CHECKPOINTS**
[List key milestones and when to assess progress]

💡 **STUDY TECHNIQUES RECOMMENDED**
[Specific techniques for different topics]

⚡ **PRO TIPS**
[Actionable advice for success]

Generate a comprehensive, motivating, and realistic study plan.`;
};

// Calendar Helper Functions
export const generateCalendarDates = (month, year) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const dates = [];

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        dates.push({
            date: prevMonthLastDay - i,
            isCurrentMonth: false,
            isPrevMonth: true,
            fullDate: new Date(year, month - 1, prevMonthLastDay - i)
        });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        dates.push({
            date: i,
            isCurrentMonth: true,
            isPrevMonth: false,
            fullDate: new Date(year, month, i)
        });
    }

    // Next month days to complete the grid
    const remainingDays = 42 - dates.length;
    for (let i = 1; i <= remainingDays; i++) {
        dates.push({
            date: i,
            isCurrentMonth: false,
            isPrevMonth: false,
            fullDate: new Date(year, month + 1, i)
        });
    }

    return dates;
};

// Study Session Logger Helpers
export const calculateSessionStats = (sessions) => {
    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const avgFocus = sessions.reduce((sum, s) => sum + (s.focusLevel || 0), 0) / totalSessions || 0;

    const subjectBreakdown = sessions.reduce((acc, s) => {
        acc[s.subject] = (acc[s.subject] || 0) + s.duration;
        return acc;
    }, {});

    return {
        totalSessions,
        totalMinutes,
        totalHours,
        avgFocus: Math.round(avgFocus),
        subjectBreakdown,
        streakDays: calculateStreak(sessions)
    };
};

const calculateStreak = (sessions) => {
    if (sessions.length === 0) return 0;

    const sortedSessions = [...sessions].sort((a, b) =>
        new Date(b.date) - new Date(a.date)
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let session of sortedSessions) {
        const sessionDate = new Date(session.date);
        sessionDate.setHours(0, 0, 0, 0);

        const dayDiff = Math.floor((currentDate - sessionDate) / (1000 * 60 * 60 * 24));

        if (dayDiff === streak) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
};

// Export default object with all data
export default {
    studyPlanTemplates,
    studyTechniques,
    generateStudyPlanPrompt,
    generateCalendarDates,
    calculateSessionStats
};
