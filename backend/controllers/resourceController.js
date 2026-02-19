const Resource = require('../models/Resource');
const Group = require('../models/Group');
const Activity = require('../models/Activity');
const User = require('../models/User');
// const fetch = require('node-fetch'); // Removed as Node 18+ has global fetch

// Upload/Create a resource
exports.createResource = async (req, res) => {
    try {
        const { name, description, groupId, resourceType, url, fileSize, category, tags } = req.body;
        const userId = req.user._id;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        const isMember = group.members.some(m => m.user.toString() === userId.toString());
        if (!isMember) {
            return res.status(403).json({ success: false, message: 'You must be a group member' });
        }

        const resource = new Resource({
            name, description, group: groupId, uploader: userId,
            resourceType: resourceType || 'other', url, fileSize: fileSize || 0,
            category: category || 'General', tags: tags || []
        });

        await resource.save();
        await Group.findByIdAndUpdate(groupId, { $inc: { 'stats.resourcesShared': 1 } });

        const user = await User.findById(userId);
        await Activity.create({
            user: userId, group: groupId, actionType: 'shared_resource',
            description: `${user.name} shared: "${name}"`, xpAwarded: 20
        });
        await User.findByIdAndUpdate(userId, { $inc: { 'stats.xp': 20 } });
        await resource.populate('uploader', 'name avatar');

        res.status(201).json({ success: true, message: 'Resource shared!', resource });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed', error: error.message });
    }
};

// Get resources for a group
exports.getGroupResources = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { category, search, page = 1, limit = 20 } = req.query;
        const query = { group: groupId };
        if (category && category !== 'all') query.category = category;
        if (search) query.name = { $regex: search, $options: 'i' };

        const resources = await Resource.find(query)
            .populate('uploader', 'name avatar')
            .sort({ isPinned: -1, createdAt: -1 })
            .skip((page - 1) * limit).limit(parseInt(limit));

        res.json({ success: true, resources });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed', error: error.message });
    }
};

// Download resource
exports.downloadResource = async (req, res) => {
    try {
        const resource = await Resource.findByIdAndUpdate(
            req.params.resourceId, { $inc: { downloads: 1 } }, { new: true }
        ).populate('uploader', 'name avatar');
        if (!resource) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, resource });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed', error: error.message });
    }
};

// Like/Unlike resource
exports.toggleLike = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.resourceId);
        if (!resource) return res.status(404).json({ success: false, message: 'Not found' });

        const likeIndex = resource.likes.indexOf(req.user._id);
        if (likeIndex > -1) resource.likes.splice(likeIndex, 1);
        else resource.likes.push(req.user._id);
        await resource.save();

        res.json({ success: true, liked: likeIndex === -1, likeCount: resource.likes.length });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed', error: error.message });
    }
};

// Delete resource
exports.deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.resourceId);
        if (!resource) return res.status(404).json({ success: false, message: 'Not found' });

        const group = await Group.findById(resource.group);
        const isAdmin = group.admins.some(a => a.toString() === req.user._id.toString());
        const isUploader = resource.uploader.toString() === req.user._id.toString();
        if (!isAdmin && !isUploader) return res.status(403).json({ success: false, message: 'Unauthorized' });

        await Resource.findByIdAndDelete(req.params.resourceId);
        res.json({ success: true, message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed', error: error.message });
    }
};

// Generate AI Notes
exports.generateNotes = async (req, res) => {
    try {
        const { topic, content } = req.body;
        const GROQ_API_KEY = process.env.GROQ_API_KEY;

        if (!GROQ_API_KEY) {
            return res.status(500).json({ success: false, message: "Groq API Key missing." });
        }

        const prompt = `Create comprehensive study notes for the topic: "${topic}".
        Context/Content: "${content || 'General knowledge'}".
        Format the output in clear Markdown with headers, bullet points, and a summary.`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: "system", content: "You are an expert academic tutor." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.5,
                max_tokens: 2000
            })
        });

        const data = await response.json();
        const generatedText = data.choices?.[0]?.message?.content || "Failed to generate notes.";

        res.json({ success: true, result: generatedText });

    } catch (error) {
        console.error("Notes Gen Error:", error);
        res.status(500).json({ success: false, message: 'Server error.', error: error.message });
    }
};

// Explain Concept
exports.explainConcept = async (req, res) => {
    try {
        const { topic } = req.body;
        const GROQ_API_KEY = process.env.GROQ_API_KEY;

        if (!GROQ_API_KEY) return res.status(500).json({ success: false, message: "Groq API Key missing." });

        const prompt = `Explain "${topic}" in simple terms as if I am a 5-year-old or a beginner. Use analogies. Format the answer with clear bullet points, numbered steps, or short paragraphs on separate lines. Do not produce a single large block of text.`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [{ role: "user", content: prompt }]
            })
        });

        const data = await response.json();
        const generatedText = data.choices?.[0]?.message?.content || "Failed to explain.";

        res.json({ success: true, result: generatedText });

    } catch (error) {
        console.error("Explain Error:", error);
        res.status(500).json({ success: false, message: 'Server error.', error: error.message });
    }
};

// Search YouTube (using yt-search)
exports.searchYoutube = async (req, res) => {
    try {
        const { query } = req.body;
        if (!query || !query.trim()) return res.status(400).json({ success: false, message: "Search term is required" });

        const yts = require('yt-search');

        // Enhance query to filter for educational content
        const educationalQuery = `${query} educational tutorial course lecture study material -entertainment -vlog -gaming`;

        const searchResults = await yts(educationalQuery);

        const videos = searchResults.videos.slice(0, 12).map(video => ({
            type: 'video',
            title: video.title,
            url: video.url,
            thumbnails: [{ url: video.thumbnail }],
            bestThumbnail: { url: video.thumbnail },
            duration: video.timestamp,
            author: { name: video.author.name },
            views: video.views
        }));

        res.json({ success: true, videos });

    } catch (error) {
        console.error("YouTube Search Error:", error);
        res.status(500).json({ success: false, message: "YouTube search failed.", error: error.message });
    }
};

// Generate AI Flashcards
exports.generateFlashcards = async (req, res) => {
    try {
        const { topic, count = 8, difficulty = 'medium' } = req.body;
        const GROQ_API_KEY = process.env.GROQ_API_KEY;

        if (!GROQ_API_KEY) {
            return res.status(500).json({ success: false, message: "Groq API Key missing." });
        }

        if (!topic || !topic.trim()) {
            return res.status(400).json({ success: false, message: "Topic is required." });
        }

        const prompt = `Generate exactly ${count} flashcards for studying the topic: "${topic}".
Difficulty level: ${difficulty}.

IMPORTANT: Return ONLY a valid JSON array with no extra text. Each object must have "front" (question) and "back" (answer) fields.
Keep questions clear and concise. Keep answers brief but informative (1-3 sentences max).

Example format:
[
  {"front": "What is photosynthesis?", "back": "The process by which green plants convert sunlight, water, and CO2 into glucose and oxygen."},
  {"front": "Where does photosynthesis occur?", "back": "In the chloroplasts of plant cells, specifically in the thylakoid membranes."}
]

Generate ${count} flashcards now:`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: "system", content: "You are a flashcard generator. Return ONLY valid JSON arrays. No markdown, no explanations, just the JSON array." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.6,
                max_tokens: 2000
            })
        });

        const data = await response.json();
        const rawText = data.choices?.[0]?.message?.content || "[]";

        // Extract JSON array from the response
        let flashcards = [];
        try {
            // Try direct parse first
            flashcards = JSON.parse(rawText);
        } catch {
            // Try to extract JSON array from text
            const jsonMatch = rawText.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                flashcards = JSON.parse(jsonMatch[0]);
            }
        }

        // Add IDs to each flashcard
        flashcards = flashcards.map((card, idx) => ({
            id: Date.now() + idx,
            front: card.front || card.question || "No question",
            back: card.back || card.answer || "No answer"
        }));

        res.json({ success: true, flashcards, topic });

    } catch (error) {
        console.error("Flashcard Gen Error:", error);
        res.status(500).json({ success: false, message: 'Failed to generate flashcards.', error: error.message });
    }
};
