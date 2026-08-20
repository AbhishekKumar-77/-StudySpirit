const Project = require('../models/Project');
const User = require('../models/User');

// Helper to get user ID from session
const getUserId = (req) => {
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
        return req.user._id || req.user.id;
    }
    return null;
};

// ── EXISTING FUNCTIONS (preserved) ────────────────────────────────

// Get all projects for current user
exports.getMyProjects = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Please login to view your projects' });

        const projects = await Project.find({ owner: userId })
            .sort({ updatedAt: -1 })
            .populate('owner', 'name avatar');

        res.json({ success: true, projects });
    } catch (error) {
        console.error('Get Projects Error:', error);
        res.status(500).json({ message: 'Failed to fetch projects' });
    }
};

// Get public projects (explore)
exports.exploreProjects = async (req, res) => {
    try {
        const { category, domain, projectType, search, sort = 'recent', tech, hasGithub, hasDemo } = req.query;

        let query = { visibility: { $in: ['public', 'recruiter-only'] } };

        if (category && category !== 'all') query.category = category;
        if (domain && domain !== 'all') query.domain = domain;
        if (projectType && projectType !== 'all') query.projectType = projectType;
        if (hasGithub === 'true') query.githubUrl = { $exists: true, $ne: '' };
        if (hasDemo === 'true') query.liveUrl = { $exists: true, $ne: '' };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } },
                { techStack: { $regex: search, $options: 'i' } },
                { 'technologies.items': { $regex: search, $options: 'i' } }
            ];
        }

        if (tech) {
            const techs = tech.split(',').map(t => t.trim());
            query.$and = techs.map(t => ({
                $or: [
                    { techStack: { $regex: t, $options: 'i' } },
                    { 'technologies.items': { $regex: t, $options: 'i' } }
                ]
            }));
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'stars') sortOption = { 'stars': -1 };
        if (sort === 'views') sortOption = { views: -1 };
        if (sort === 'strength') sortOption = { strengthScore: -1 };

        const projects = await Project.find(query)
            .sort(sortOption)
            .limit(60)
            .populate('owner', 'name avatar');

        res.json({ success: true, projects });
    } catch (error) {
        console.error('Explore Projects Error:', error);
        res.status(500).json({ message: 'Failed to fetch projects' });
    }
};

// Get single project by ID
exports.getProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = getUserId(req);

        const project = await Project.findById(projectId)
            .populate('owner', 'name avatar email')
            .populate('collaborators.user', 'name avatar')
            .populate('forkedFrom', 'name owner')
            .populate('teacherReview.reviewedBy', 'name');

        if (!project) return res.status(404).json({ message: 'Project not found' });

        if (project.visibility === 'private') {
            const isOwner = userId && project.owner._id.toString() === userId.toString();
            const isCollaborator = userId && project.collaborators.some(c => c.user._id.toString() === userId.toString());
            if (!isOwner && !isCollaborator) return res.status(403).json({ message: 'This project is private' });
        }

        project.views += 1;
        await project.save();

        res.json({ success: true, project });
    } catch (error) {
        console.error('Get Project Error:', error);
        res.status(500).json({ message: 'Failed to fetch project' });
    }
};

// Create new project
exports.createProject = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Please login to create a project' });

        const {
            name, description, techStack, category, visibility, githubUrl, liveUrl, readme,
            projectType, domain, story, technologies, teamMembers, myContribution, evidence, featured
        } = req.body;

        if (!name || name.trim().length === 0) return res.status(400).json({ message: 'Project name is required' });

        const project = new Project({
            owner: userId,
            name: name.trim(),
            description: description?.trim() || '',
            techStack: techStack || [],
            category: category || 'other',
            visibility: visibility || 'public',
            githubUrl: githubUrl?.trim() || '',
            liveUrl: liveUrl?.trim() || '',
            readme: readme || '# ' + name.trim() + '\n\nDescribe your project here...',
            projectType: projectType || 'personal',
            domain: domain || 'other',
            story: story || {},
            technologies: technologies || [],
            teamMembers: teamMembers || [],
            myContribution: myContribution || { roles: [], description: '' },
            evidence: evidence || {},
            featured: featured || false
        });

        // Compute and cache strength score
        project.strengthScore = project.computeStrength();

        await project.save();
        await project.populate('owner', 'name avatar');

        res.status(201).json({ success: true, project });
    } catch (error) {
        console.error('Create Project Error:', error);
        res.status(500).json({ message: 'Failed to create project: ' + error.message });
    }
};

// Update project
exports.updateProject = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Please login to update projects' });

        const { projectId } = req.params;
        const updates = req.body;

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (project.owner.toString() !== userId.toString()) return res.status(403).json({ message: 'Not authorized' });

        const allowedUpdates = [
            'name', 'description', 'techStack', 'category', 'visibility', 'githubUrl', 'liveUrl',
            'readme', 'status', 'tags', 'thumbnail',
            // New fields
            'projectType', 'domain', 'story', 'technologies', 'teamMembers',
            'myContribution', 'evidence', 'featured', 'aiSummary'
        ];

        allowedUpdates.forEach(field => {
            if (updates[field] !== undefined) project[field] = updates[field];
        });

        // Recompute strength
        project.strengthScore = project.computeStrength();

        await project.save();
        await project.populate('owner', 'name avatar');

        res.json({ success: true, project });
    } catch (error) {
        console.error('Update Project Error:', error);
        res.status(500).json({ message: 'Failed to update project' });
    }
};

// Delete project
exports.deleteProject = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Please login to delete projects' });

        const { projectId } = req.params;
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (project.owner.toString() !== userId.toString()) return res.status(403).json({ message: 'Not authorized' });

        await Project.findByIdAndDelete(projectId);
        res.json({ success: true, message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Delete Project Error:', error);
        res.status(500).json({ message: 'Failed to delete project' });
    }
};

// Add/Update file to project
exports.addFile = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Please login' });

        const { projectId } = req.params;
        const { name, content, path, language } = req.body;
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (project.owner.toString() !== userId.toString()) return res.status(403).json({ message: 'Not authorized' });

        const existingFileIndex = project.files.findIndex(f => f.path === path);
        const fileData = { name, path, content, type: 'file', size: content ? content.length : 0, language: language || 'text' };

        if (existingFileIndex >= 0) project.files[existingFileIndex] = fileData;
        else project.files.push(fileData);

        await project.save();
        res.json({ success: true, file: fileData });
    } catch (error) {
        console.error('Add File Error:', error);
        res.status(500).json({ message: 'Failed to add file' });
    }
};

// Delete file from project
exports.deleteFile = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Please login' });

        const { projectId, filePath } = req.params;
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (project.owner.toString() !== userId.toString()) return res.status(403).json({ message: 'Not authorized' });

        project.files = project.files.filter(f => f.path !== decodeURIComponent(filePath));
        await project.save();
        res.json({ success: true, message: 'File deleted' });
    } catch (error) {
        console.error('Delete File Error:', error);
        res.status(500).json({ message: 'Failed to delete file' });
    }
};

// Star/Unstar project
exports.toggleStar = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Please login to star projects' });

        const { projectId } = req.params;
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const hasStarred = project.stars.some(id => id.toString() === userId.toString());
        if (hasStarred) project.stars = project.stars.filter(id => id.toString() !== userId.toString());
        else project.stars.push(userId);

        await project.save();
        res.json({ success: true, starred: !hasStarred, starCount: project.stars.length });
    } catch (error) {
        console.error('Toggle Star Error:', error);
        res.status(500).json({ message: 'Failed to toggle star' });
    }
};

// Fork project
exports.forkProject = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Please login to fork projects' });

        const { projectId } = req.params;
        const originalProject = await Project.findById(projectId);
        if (!originalProject) return res.status(404).json({ message: 'Project not found' });
        if (originalProject.visibility === 'private') return res.status(403).json({ message: 'Cannot fork a private project' });

        const forkedProject = new Project({
            owner: userId,
            name: originalProject.name + ' (Fork)',
            description: originalProject.description,
            readme: originalProject.readme,
            techStack: originalProject.techStack,
            category: originalProject.category,
            visibility: 'public',
            files: originalProject.files,
            forkedFrom: originalProject._id,
            tags: originalProject.tags,
            projectType: originalProject.projectType,
            domain: originalProject.domain,
            technologies: originalProject.technologies
        });

        await forkedProject.save();
        originalProject.forks.push(userId);
        await originalProject.save();
        await forkedProject.populate('owner', 'name avatar');

        res.status(201).json({ success: true, project: forkedProject });
    } catch (error) {
        console.error('Fork Project Error:', error);
        res.status(500).json({ message: 'Failed to fork project' });
    }
};

// Get user's public projects (profile)
exports.getUserProjects = async (req, res) => {
    try {
        const { userId } = req.params;
        const projects = await Project.find({ owner: userId, visibility: { $in: ['public', 'recruiter-only'] } })
            .sort({ updatedAt: -1 })
            .populate('owner', 'name avatar');
        res.json({ success: true, projects });
    } catch (error) {
        console.error('Get User Projects Error:', error);
        res.status(500).json({ message: 'Failed to fetch user projects' });
    }
};

// AI README Generator
exports.generateReadme = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Please login' });

        const { projectId } = req.params;
        const project = await Project.findById(projectId).populate('owner', 'name');
        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (project.owner._id.toString() !== userId.toString()) return res.status(403).json({ message: 'Not authorized' });

        const GROQ_API_KEY = process.env.GROQ_API_KEY_INTERVIEW || process.env.GROQ_API_KEY;
        if (!GROQ_API_KEY) return res.status(500).json({ message: 'AI service not configured.' });

        const techStr = (project.techStack || []).join(', ') || 'Not specified';
        const tagsStr = (project.tags || []).join(', ') || '';

        const prompt = `Create a professional GitHub README.md for this project:
Project Name: ${project.name}
Category: ${project.category}
Description: ${project.description || 'No description provided'}
Tech Stack: ${techStr}
Tags: ${tagsStr}
GitHub URL: ${project.githubUrl || 'N/A'}
Live Demo: ${project.liveUrl || 'N/A'}
Status: ${project.status}

Generate a complete README.md with: header, badges, features, tech stack, getting started, usage, contributing, license.
Output ONLY raw markdown.`;

        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'qwen/qwen3.6-27b',
                messages: [
                    { role: 'system', content: 'You are a technical documentation expert. Write excellent GitHub README files in markdown. Output ONLY raw markdown, no code fences, no wrapper.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.6, max_tokens: 2000
            })
        });

        const data = await groqRes.json();
        const readme = data.choices?.[0]?.message?.content?.trim() || '';
        if (!readme) return res.status(500).json({ message: 'AI generation failed' });

        project.readme = readme;
        await project.save();
        res.json({ success: true, readme });
    } catch (err) {
        console.error('generateReadme error:', err);
        res.status(500).json({ success: false, message: 'README generation failed.' });
    }
};

// ── NEW FUNCTIONS ──────────────────────────────────────────────────

// GET /projects/stats — portfolio statistics for current user
exports.getProjectStats = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Please login' });

        const projects = await Project.find({ owner: userId });

        const totalProjects = projects.length;
        const published = projects.filter(p => p.visibility === 'public' || p.visibility === 'recruiter-only').length;
        const liveDemos = projects.filter(p => p.liveUrl && p.liveUrl.trim()).length;
        const featuredCount = projects.filter(p => p.featured).length;

        // Unique technologies across all projects
        const allTechs = new Set();
        const techUsage = {};
        projects.forEach(p => {
            // From structured technologies
            p.technologies?.forEach(group => {
                group.items?.forEach(tech => {
                    allTechs.add(tech);
                    techUsage[tech] = (techUsage[tech] || 0) + 1;
                });
            });
            // From legacy techStack
            p.techStack?.forEach(tech => {
                allTechs.add(tech);
                techUsage[tech] = (techUsage[tech] || 0) + 1;
            });
        });

        // Top technologies by usage
        const topTechnologies = Object.entries(techUsage)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([name, count]) => ({ name, count, percent: Math.round((count / totalProjects) * 100) }));

        // Average strength
        const avgStrength = totalProjects > 0
            ? Math.round(projects.reduce((sum, p) => sum + (p.strengthScore || 0), 0) / totalProjects)
            : 0;

        // Recent activity (last 10 projects modified)
        const recentActivity = projects
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 5)
            .map(p => ({
                projectId: p._id,
                projectName: p.name,
                action: 'Updated project',
                time: p.updatedAt
            }));

        res.json({
            success: true,
            stats: {
                totalProjects,
                published,
                liveDemos,
                featuredCount,
                totalTechnologies: allTechs.size,
                avgStrength,
                topTechnologies,
                recentActivity
            }
        });
    } catch (error) {
        console.error('getProjectStats Error:', error);
        res.status(500).json({ message: 'Failed to fetch stats' });
    }
};

// POST /projects/:id/featured — toggle featured flag (max 5)
exports.toggleFeatured = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Please login' });

        const { projectId } = req.params;
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (project.owner.toString() !== userId.toString()) return res.status(403).json({ message: 'Not authorized' });

        if (!project.featured) {
            // Check featured count limit
            const featuredCount = await Project.countDocuments({ owner: userId, featured: true });
            if (featuredCount >= 5) return res.status(400).json({ message: 'You can feature at most 5 projects.' });
        }

        project.featured = !project.featured;
        await project.save();
        res.json({ success: true, featured: project.featured });
    } catch (error) {
        console.error('toggleFeatured Error:', error);
        res.status(500).json({ message: 'Failed to toggle featured' });
    }
};

// POST /projects/:id/build-log — add a build log entry
exports.addBuildLog = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Please login' });

        const { projectId } = req.params;
        const { title, description, commitUrl, mediaUrl, date } = req.body;

        if (!title) return res.status(400).json({ message: 'Log title is required' });

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (project.owner.toString() !== userId.toString()) return res.status(403).json({ message: 'Not authorized' });

        const logEntry = {
            title,
            description: description || '',
            commitUrl: commitUrl || '',
            mediaUrl: mediaUrl || '',
            date: date ? new Date(date) : new Date()
        };

        project.buildLogs.push(logEntry);
        project.buildLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
        await project.save();

        res.json({ success: true, buildLog: logEntry, buildLogs: project.buildLogs });
    } catch (error) {
        console.error('addBuildLog Error:', error);
        res.status(500).json({ message: 'Failed to add build log' });
    }
};

// GET /projects/portfolio/:userId — featured + published projects for public portfolio
exports.getPortfolio = async (req, res) => {
    try {
        const { userId } = req.params;

        const featured = await Project.find({ owner: userId, featured: true, visibility: { $ne: 'private' } })
            .sort({ strengthScore: -1 })
            .populate('owner', 'name avatar');

        const all = await Project.find({ owner: userId, visibility: { $in: ['public', 'recruiter-only'] } })
            .sort({ updatedAt: -1 })
            .populate('owner', 'name avatar');

        const owner = await User.findById(userId).select('name avatar email bio skills');

        res.json({ success: true, featured, all, owner });
    } catch (error) {
        console.error('getPortfolio Error:', error);
        res.status(500).json({ message: 'Failed to fetch portfolio' });
    }
};

// POST /projects/:id/import-github — fetch metadata from GitHub public API
exports.importGithub = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Please login' });

        const { projectId } = req.params;
        const { githubUrl } = req.body;

        if (!githubUrl) return res.status(400).json({ message: 'GitHub URL required' });

        // Extract owner/repo from URL
        const match = githubUrl.match(/github\.com\/([^/]+)\/([^/\s?#]+)/);
        if (!match) return res.status(400).json({ message: 'Invalid GitHub URL format' });

        const [, repoOwner, repoName] = match;

        // Fetch from GitHub public API (no auth needed for public repos)
        const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}`;
        const langUrl = `${apiUrl}/languages`;
        const topicsUrl = `${apiUrl}/topics`;

        const [repoRes, langRes] = await Promise.all([
            fetch(apiUrl, { headers: { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'StudySpirit-App' } }),
            fetch(langUrl, { headers: { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'StudySpirit-App' } })
        ]);

        if (!repoRes.ok) return res.status(404).json({ message: 'Repository not found or is private' });

        const repoData = await repoRes.json();
        const langData = langRes.ok ? await langRes.json() : {};

        const meta = {
            name: repoData.name,
            description: repoData.description || '',
            languages: langData,
            topics: repoData.topics || [],
            stars: repoData.stargazers_count || 0,
            forks: repoData.forks_count || 0,
            lastPushed: repoData.pushed_at ? new Date(repoData.pushed_at) : null,
            repoUrl: repoData.html_url
        };

        // Update the project if it exists
        if (projectId !== 'preview') {
            const project = await Project.findById(projectId);
            if (project && project.owner.toString() === userId.toString()) {
                project.githubUrl = repoData.html_url;
                project.githubMeta = {
                    languages: langData,
                    topics: repoData.topics || [],
                    stars: repoData.stargazers_count || 0,
                    forks: repoData.forks_count || 0,
                    lastPushed: meta.lastPushed
                };

                // Auto-populate tech stack from languages if not already set
                const langs = Object.keys(langData);
                if (langs.length > 0 && (!project.techStack || project.techStack.length === 0)) {
                    project.techStack = langs;
                }

                project.strengthScore = project.computeStrength();
                await project.save();
            }
        }

        res.json({ success: true, meta });
    } catch (error) {
        console.error('importGithub Error:', error);
        res.status(500).json({ message: 'Failed to fetch GitHub metadata' });
    }
};

// POST /projects/:id/ai-summary — generate AI project summary for recruiters
exports.generateProjectSummary = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Please login' });

        const { projectId } = req.params;
        const project = await Project.findById(projectId).populate('owner', 'name');
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const isOwner = project.owner._id.toString() === userId.toString();
        if (!isOwner) return res.status(403).json({ message: 'Not authorized' });

        const GROQ_API_KEY = process.env.GROQ_API_KEY_INTERVIEW || process.env.GROQ_API_KEY;
        if (!GROQ_API_KEY) return res.status(500).json({ message: 'AI service not configured' });

        const allTechs = [
            ...(project.techStack || []),
            ...(project.technologies || []).flatMap(g => g.items || [])
        ];
        const uniqueTechs = [...new Set(allTechs)];

        const prompt = `Analyze this student project and write a concise, professional recruiter-facing summary.

Project: ${project.name}
Type: ${project.projectType} | Domain: ${project.domain}
Description: ${project.description || 'N/A'}
Problem: ${project.story?.problem || 'N/A'}
Solution: ${project.story?.solution || 'N/A'}
Impact: ${project.story?.impact || 'N/A'}
Technologies: ${uniqueTechs.join(', ') || 'N/A'}
GitHub: ${project.githubUrl ? 'Yes' : 'No'} | Live Demo: ${project.liveUrl ? 'Yes' : 'No'}
Student Contribution: ${project.myContribution?.description || 'N/A'}

Write a 2-3 sentence recruiter summary that:
1. States what this project demonstrates about the student
2. Highlights key technical skills shown (only what's actually in the data)
3. Notes evidence quality (GitHub, live demo if present)

Keep it factual and professional. Then list 4-6 skill signals as a JSON array at the end.

Format: [SUMMARY PARAGRAPH]
SKILLS_JSON: ["skill1","skill2",...]`;

        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'qwen/qwen3.6-27b',
                messages: [
                    { role: 'system', content: 'You are a technical recruiter analyst. Write concise, accurate project summaries from real data only. Never fabricate skills or achievements.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.4, max_tokens: 500
            })
        });

        const data = await groqRes.json();
        const rawContent = data.choices?.[0]?.message?.content?.trim() || '';

        // Extract summary and skills
        const skillsMatch = rawContent.match(/SKILLS_JSON:\s*(\[.*?\])/s);
        let skills = [];
        try { skills = skillsMatch ? JSON.parse(skillsMatch[1]) : []; } catch (e) { skills = []; }
        const summary = rawContent.replace(/SKILLS_JSON:.*$/s, '').trim();

        // Cache the summary
        project.aiSummary = summary;
        await project.save();

        res.json({ success: true, summary, skills });
    } catch (error) {
        console.error('generateProjectSummary Error:', error);
        res.status(500).json({ message: 'AI summary generation failed' });
    }
};

// GET /projects/search — extended project search
exports.searchProjects = async (req, res) => {
    try {
        const { q, domain, projectType, tech, hasGithub, hasDemo, sort = 'strength', limit = 20 } = req.query;

        let query = { visibility: { $in: ['public', 'recruiter-only'] } };

        if (domain && domain !== 'all') query.domain = domain;
        if (projectType && projectType !== 'all') query.projectType = projectType;
        if (hasGithub === 'true') query.githubUrl = { $exists: true, $ne: '' };
        if (hasDemo === 'true') query.liveUrl = { $exists: true, $ne: '' };

        if (q) {
            query.$or = [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { 'story.problem': { $regex: q, $options: 'i' } },
                { 'story.solution': { $regex: q, $options: 'i' } },
                { techStack: { $regex: q, $options: 'i' } },
                { 'technologies.items': { $regex: q, $options: 'i' } },
                { tags: { $regex: q, $options: 'i' } }
            ];
        }

        if (tech) {
            const techs = tech.split(',').map(t => t.trim()).filter(Boolean);
            query.$and = techs.map(t => ({
                $or: [
                    { techStack: { $regex: t, $options: 'i' } },
                    { 'technologies.items': { $regex: t, $options: 'i' } }
                ]
            }));
        }

        let sortOption = { strengthScore: -1 };
        if (sort === 'recent') sortOption = { createdAt: -1 };
        if (sort === 'views') sortOption = { views: -1 };

        const projects = await Project.find(query)
            .sort(sortOption)
            .limit(parseInt(limit))
            .populate('owner', 'name avatar');

        res.json({ success: true, projects, count: projects.length });
    } catch (error) {
        console.error('searchProjects Error:', error);
        res.status(500).json({ message: 'Search failed' });
    }
};
