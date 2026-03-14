const Project = require('../models/Project');
const User = require('../models/User');

// Helper to get user ID from session
const getUserId = (req) => {
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
        return req.user._id || req.user.id;
    }
    return null;
};

// Get all projects for current user
exports.getMyProjects = async (req, res) => {
    try {
        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({ message: 'Please login to view your projects' });
        }

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
        const { category, search, sort = 'recent' } = req.query;

        let query = { visibility: 'public' };

        if (category && category !== 'all') {
            query.category = category;
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'stars') {
            sortOption = { 'stars.length': -1 };
        } else if (sort === 'views') {
            sortOption = { views: -1 };
        }

        const projects = await Project.find(query)
            .sort(sortOption)
            .limit(50)
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
            .populate('forkedFrom', 'name owner');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check visibility
        if (project.visibility === 'private') {
            const isOwner = userId && project.owner._id.toString() === userId.toString();
            const isCollaborator = userId && project.collaborators.some(c => c.user._id.toString() === userId.toString());

            if (!isOwner && !isCollaborator) {
                return res.status(403).json({ message: 'This project is private' });
            }
        }

        // Increment views
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

        if (!userId) {
            return res.status(401).json({ message: 'Please login to create a project' });
        }

        const { name, description, techStack, category, visibility, githubUrl, liveUrl, readme } = req.body;

        if (!name || name.trim().length === 0) {
            return res.status(400).json({ message: 'Project name is required' });
        }

        const project = new Project({
            owner: userId,
            name: name.trim(),
            description: description?.trim() || '',
            techStack: techStack || [],
            category: category || 'other',
            visibility: visibility || 'public',
            githubUrl: githubUrl?.trim() || '',
            liveUrl: liveUrl?.trim() || '',
            readme: readme || '# ' + name.trim() + '\n\nDescribe your project here...'
        });

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

        if (!userId) {
            return res.status(401).json({ message: 'Please login to update projects' });
        }

        const { projectId } = req.params;
        const updates = req.body;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check ownership
        if (project.owner.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this project' });
        }

        // Allowed updates
        const allowedUpdates = ['name', 'description', 'techStack', 'category', 'visibility', 'githubUrl', 'liveUrl', 'readme', 'status', 'tags', 'thumbnail'];

        allowedUpdates.forEach(field => {
            if (updates[field] !== undefined) {
                project[field] = updates[field];
            }
        });

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

        if (!userId) {
            return res.status(401).json({ message: 'Please login to delete projects' });
        }

        const { projectId } = req.params;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.owner.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this project' });
        }

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

        if (!userId) {
            return res.status(401).json({ message: 'Please login' });
        }

        const { projectId } = req.params;
        const { name, content, path, language } = req.body;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.owner.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Check if file exists
        const existingFileIndex = project.files.findIndex(f => f.path === path);

        const fileData = {
            name,
            path,
            content,
            type: 'file',
            size: content ? content.length : 0,
            language: language || 'text'
        };

        if (existingFileIndex >= 0) {
            project.files[existingFileIndex] = fileData;
        } else {
            project.files.push(fileData);
        }

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

        if (!userId) {
            return res.status(401).json({ message: 'Please login' });
        }

        const { projectId, filePath } = req.params;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.owner.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

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

        if (!userId) {
            return res.status(401).json({ message: 'Please login to star projects' });
        }

        const { projectId } = req.params;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const hasStarred = project.stars.some(id => id.toString() === userId.toString());

        if (hasStarred) {
            project.stars = project.stars.filter(id => id.toString() !== userId.toString());
        } else {
            project.stars.push(userId);
        }

        await project.save();

        res.json({
            success: true,
            starred: !hasStarred,
            starCount: project.stars.length
        });
    } catch (error) {
        console.error('Toggle Star Error:', error);
        res.status(500).json({ message: 'Failed to toggle star' });
    }
};

// Fork project
exports.forkProject = async (req, res) => {
    try {
        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({ message: 'Please login to fork projects' });
        }

        const { projectId } = req.params;

        const originalProject = await Project.findById(projectId);

        if (!originalProject) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (originalProject.visibility === 'private') {
            return res.status(403).json({ message: 'Cannot fork a private project' });
        }

        // Create forked project
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
            tags: originalProject.tags
        });

        await forkedProject.save();

        // Add to original project's forks
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

        const projects = await Project.find({
            owner: userId,
            visibility: 'public'
        })
            .sort({ updatedAt: -1 })
            .populate('owner', 'name avatar');

        res.json({ success: true, projects });
    } catch (error) {
        console.error('Get User Projects Error:', error);
        res.status(500).json({ message: 'Failed to fetch user projects' });
    }
};

// ─────────────────────────────────────────────────────────────
// AI README Generator
// POST /api/projects/:projectId/generate-readme
// ─────────────────────────────────────────────────────────────
exports.generateReadme = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ message: 'Please login' });

        const { projectId } = req.params;
        const project = await Project.findById(projectId).populate('owner', 'name');

        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (project.owner._id.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const GROQ_API_KEY = process.env.GROQ_API_KEY_INTERVIEW || process.env.GROQ_API_KEY || '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';
        if (!GROQ_API_KEY) return res.status(500).json({ message: 'AI service not configured.' });

        const techStr = (project.techStack || []).join(', ') || 'Not specified';
        const tagsStr = (project.tags || []).join(', ') || '';

        const prompt = `Create a professional, well-structured GitHub README.md for this project:

Project Name: ${project.name}
Category: ${project.category}
Description: ${project.description || 'No description provided'}
Tech Stack: ${techStr}
Tags: ${tagsStr}
GitHub URL: ${project.githubUrl || 'N/A'}
Live Demo: ${project.liveUrl || 'N/A'}
Status: ${project.status}

Generate a complete README.md with these sections (use proper markdown):
1. A banner-style header with project name and a one-liner description
2. Badges for tech stack (use shields.io style markdown badge syntax)
3. ## ✨ Features — 4-6 bullet points based on the description/category
4. ## 🛠️ Tech Stack — table or list of technologies used
5. ## 🚀 Getting Started — Prerequisites, Installation steps, Running locally
6. ## 📖 Usage — brief usage guide
7. ## 🤝 Contributing — standard contribution guide
8. ## 📄 License — MIT License line

Keep it professional, exciting, and well-formatted. Output ONLY the raw markdown, nothing else.`;

        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: 'You are a technical documentation expert. Write excellent GitHub README files in markdown. Output ONLY raw markdown, no code fences, no wrapper.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.6,
                max_tokens: 2000
            })
        });

        const data = await groqRes.json();
        const readme = data.choices?.[0]?.message?.content?.trim() || '';

        if (!readme) return res.status(500).json({ message: 'AI generation failed' });

        // Optionally save it back to the project
        project.readme = readme;
        await project.save();

        res.json({ success: true, readme });
    } catch (err) {
        console.error('❌ generateReadme error:', err);
        res.status(500).json({ success: false, message: 'README generation failed.' });
    }
};
