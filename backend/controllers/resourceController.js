const Resource = require('../models/Resource');
const Group = require('../models/Group');
const Activity = require('../models/Activity');
const User = require('../models/User');
const Folder = require('../models/Folder');
const path = require('path');
const fs = require('fs');
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

        if (resource.group) {
            const group = await Group.findById(resource.group);
            if (group) {
                const isAdmin = group.admins.some(a => a.toString() === req.user._id.toString());
                const isUploader = (resource.uploader && resource.uploader.toString() === req.user._id.toString()) || (resource.owner && resource.owner.toString() === req.user._id.toString());
                if (!isAdmin && !isUploader) return res.status(403).json({ success: false, message: 'Unauthorized' });
            }
        } else {
            // It's a personal resource
            const isOwner = (resource.owner && resource.owner.toString() === req.user._id.toString()) || (resource.uploader && resource.uploader.toString() === req.user._id.toString());
            if (!isOwner) return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

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
        const GROQ_API_KEY = process.env.GROQ_API_KEY_RESOURCE || process.env.GROQ_API_KEY;

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
        const GROQ_API_KEY = process.env.GROQ_API_KEY_RESOURCE || process.env.GROQ_API_KEY;

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

// Generate AI Flashcards (with retry logic for rate limits)
exports.generateFlashcards = async (req, res) => {
    try {
        const { topic, count = 8, difficulty = 'medium' } = req.body;
        const GROQ_API_KEY = process.env.GROQ_API_KEY_RESOURCE || process.env.GROQ_API_KEY;

        if (!GROQ_API_KEY) {
            return res.status(500).json({ success: false, message: "Groq API Key missing. Add GROQ_API_KEY_RESOURCE to your environment." });
        }

        if (!topic || !topic.trim()) {
            return res.status(400).json({ success: false, message: "Topic is required." });
        }

        const cardCount = Math.min(Math.max(parseInt(count) || 8, 1), 20);

        const prompt = `Generate exactly ${cardCount} flashcards for studying the topic: "${topic}".
Difficulty level: ${difficulty}.

IMPORTANT: Return ONLY a valid JSON array with no extra text. Each object must have "front" (question) and "back" (answer) fields.
Keep questions clear and concise. Keep answers brief but informative (1-3 sentences max).

Example format:
[
  {"front": "What is photosynthesis?", "back": "The process by which green plants convert sunlight, water, and CO2 into glucose and oxygen."},
  {"front": "Where does photosynthesis occur?", "back": "In the chloroplasts of plant cells, specifically in the thylakoid membranes."}
]

Generate ${cardCount} flashcards now:`;

        // Retry logic: up to 3 attempts with backoff for rate limits
        let lastError = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${GROQ_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'llama-3.3-70b-versatile',
                        messages: [
                            { role: "system", content: "You are a flashcard generator. Return ONLY valid JSON arrays. No markdown, no explanations, no code fences, just the raw JSON array." },
                            { role: "user", content: prompt }
                        ],
                        temperature: 0.6,
                        max_tokens: 4000
                    })
                });

                // Handle rate limiting (429) and server errors (5xx)
                if (response.status === 429) {
                    const retryAfter = parseInt(response.headers.get('retry-after')) || (attempt * 2);
                    console.warn(`Flashcard Gen: Rate limited (attempt ${attempt}/3). Waiting ${retryAfter}s...`);
                    await new Promise(r => setTimeout(r, retryAfter * 1000));
                    continue;
                }

                if (!response.ok) {
                    const errBody = await response.text().catch(() => '');
                    console.error(`Flashcard Gen: API error ${response.status} (attempt ${attempt}/3):`, errBody);
                    if (response.status >= 500 && attempt < 3) {
                        await new Promise(r => setTimeout(r, attempt * 1500));
                        continue;
                    }
                    lastError = `Groq API error (${response.status})`;
                    break;
                }

                const data = await response.json();

                if (!data.choices || !data.choices[0]?.message?.content) {
                    console.error("Flashcard Gen: Empty AI response (attempt " + attempt + "/3):", JSON.stringify(data, null, 2));
                    if (attempt < 3) {
                        await new Promise(r => setTimeout(r, attempt * 1000));
                        continue;
                    }
                    return res.status(500).json({ success: false, message: "AI returned empty response. Please try again." });
                }

                const rawText = data.choices[0].message.content;

                // Robust JSON parsing with multiple fallback methods
                let flashcards = [];
                try {
                    flashcards = JSON.parse(rawText);
                } catch {
                    // Method 1: Strip markdown fences and try again
                    let cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
                    try {
                        flashcards = JSON.parse(cleaned);
                    } catch {
                        // Method 2: Extract JSON array using regex
                        const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
                        if (jsonMatch) {
                            try {
                                flashcards = JSON.parse(jsonMatch[0]);
                            } catch {
                                // Method 3: Repair truncated JSON (missing closing bracket)
                                const lastBrace = jsonMatch[0].lastIndexOf('}');
                                if (lastBrace !== -1) {
                                    try {
                                        flashcards = JSON.parse(jsonMatch[0].substring(0, lastBrace + 1) + ']');
                                    } catch { /* give up on this method */ }
                                }
                            }
                        }

                        // Method 4: Extract individual objects
                        if (flashcards.length === 0) {
                            const objMatches = cleaned.match(/\{[^{}]*"front"\s*:\s*"[^"]*"[^{}]*"back"\s*:\s*"[^"]*"[^{}]*\}/g);
                            if (objMatches) {
                                flashcards = objMatches.map(str => {
                                    try { return JSON.parse(str); } catch { return null; }
                                }).filter(Boolean);
                            }
                        }
                    }
                }

                if (!Array.isArray(flashcards)) {
                    if (flashcards && flashcards.flashcards) flashcards = flashcards.flashcards;
                    else flashcards = [];
                }

                // Add IDs to each flashcard
                flashcards = flashcards.map((card, idx) => ({
                    id: Date.now() + idx,
                    front: card.front || card.question || "No question",
                    back: card.back || card.answer || "No answer"
                }));

                if (flashcards.length === 0) {
                    if (attempt < 3) {
                        console.warn(`Flashcard Gen: 0 cards parsed (attempt ${attempt}/3). Retrying...`);
                        await new Promise(r => setTimeout(r, attempt * 1000));
                        continue;
                    }
                    return res.status(500).json({ success: false, message: "AI could not generate flashcards for this topic. Try a different topic or fewer cards." });
                }

                return res.json({ success: true, flashcards, topic });

            } catch (fetchErr) {
                console.error(`Flashcard Gen: Network error (attempt ${attempt}/3):`, fetchErr.message);
                lastError = fetchErr.message;
                if (attempt < 3) {
                    await new Promise(r => setTimeout(r, attempt * 1500));
                    continue;
                }
            }
        }

        // All retries exhausted
        res.status(500).json({ success: false, message: lastError || 'Failed to generate flashcards after multiple attempts. Please try again.' });

    } catch (error) {
        console.error("Flashcard Gen Error:", error);
        res.status(500).json({ success: false, message: 'Failed to generate flashcards.', error: error.message });
    }
};

// ================= FOLDER MANAGEMENT =================

exports.createFolder = async (req, res) => {
    try {
        const { name, color, icon, parentFolder } = req.body;
        const userId = req.user._id;

        const folder = new Folder({
            name,
            color,
            icon,
            parentFolder: parentFolder || null,
            owner: userId
        });

        await folder.save();
        res.status(201).json({ success: true, folder });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getFolders = async (req, res) => {
    try {
        const userId = req.user._id;
        const folders = await Folder.find({ owner: userId });
        res.json({ success: true, folders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteFolder = async (req, res) => {
    try {
        const { folderId } = req.params;
        const userId = req.user._id;

        const folder = await Folder.findOne({ _id: folderId, owner: userId });
        if (!folder) return res.status(404).json({ success: false, message: 'Folder not found' });

        // Update all resources in this folder to be uncategorized (null folder)
        await Resource.updateMany({ folder: folderId }, { folder: null });

        // Also handle subfolders if any (optional for now)
        await Folder.findByIdAndDelete(folderId);

        res.json({ success: true, message: 'Folder deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================= INDIVIDUAL RESOURCE MANAGEMENT =================

exports.savePersonalResource = async (req, res) => {
    try {
        const { name, description, resourceType, url, folderId, content, metadata, category, tags } = req.body;
        const userId = req.user._id;

        const resource = new Resource({
            name,
            description,
            owner: userId,
            folder: folderId || null,
            resourceType: resourceType || 'other',
            url,
            content,
            metadata,
            category: category || 'General',
            tags: tags || []
        });

        await resource.save();
        res.status(201).json({ success: true, resource });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMyResources = async (req, res) => {
    try {
        const userId = req.user._id;
        const { folderId } = req.query;

        const query = { owner: userId };
        if (folderId) query.folder = folderId;

        const resources = await Resource.find(query).sort({ createdAt: -1 });
        res.json({ success: true, resources });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const { folderId, category } = req.body;
        const userId = req.user._id;

        // In a real production app, you'd upload to S3/Cloudinary here.
        // For this project, we'll store local path as URL (if served from static)
        // or just return success if it's processed.

        const resource = new Resource({
            name: req.file.originalname,
            owner: userId,
            folder: folderId || null,
            resourceType: req.file.mimetype.includes('pdf') ? 'pdf' : req.file.mimetype.includes('image') ? 'image' : 'other',
            url: `/uploads/resources/${req.file.filename}`, // Placeholder path
            fileSize: req.file.size,
            category: category || 'General'
        });

        await resource.save();
        res.status(201).json({ success: true, resource });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
