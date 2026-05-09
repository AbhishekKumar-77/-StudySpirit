const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Message = require('../models/Message');

// Get Posts for a Channel
exports.getPosts = async (req, res) => {
    try {
        const { channelId } = req.query;
        if (!channelId) {
            return res.status(400).json({ error: 'Channel ID is required' });
        }

        const posts = await Post.find({ channelId })
            .populate('author', 'name avatar role reputation status')
            .sort({ isPinned: -1, createdAt: -1 });

        // Add reply counts and convert to plain object
        const postsWithDetails = await Promise.all(posts.map(async post => {
            const replies = await Comment.countDocuments({ post: post._id });
            const postObj = post.toObject();
            return {
                ...postObj,
                replies,
                upvotes: postObj.upvotes.length,
                isUpvoted: req.user ? post.upvotes.includes(req.user._id) : false,
                timestamp: formatTimeAgo(post.createdAt)
            };
        }));

        res.json(postsWithDetails);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching posts' });
    }
};

// Create a Post
exports.createPost = async (req, res) => {
    try {
        const { title, content, channelId, tags } = req.body;

        const newPost = new Post({
            title,
            content,
            channelId,
            tags: tags || [],
            author: req.user._id
        });

        await newPost.save();

        // Increment user reputation by 10
        await req.user.updateOne({ $inc: { reputation: 10 } });

        const populatedPost = await newPost.populate('author', 'name avatar role reputation status');

        const postObj = populatedPost.toObject();
        res.status(201).json({
            ...postObj,
            replies: 0,
            upvotes: 0,
            isUpvoted: false,
            timestamp: 'Just now'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error creating post' });
    }
};

// Toggle Upvote on Post
exports.toggleUpvote = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const index = post.upvotes.indexOf(req.user._id);
        if (index === -1) {
            post.upvotes.push(req.user._id);
        } else {
            post.upvotes.splice(index, 1);
        }
        await post.save();

        res.json({
            upvotes: post.upvotes.length,
            isUpvoted: index === -1
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Direct Messages with a User
exports.getDirectMessages = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;

        const messages = await Message.find({
            $or: [
                { sender: currentUserId, recipient: userId },
                { sender: userId, recipient: currentUserId }
            ]
        }).sort({ createdAt: 1 });

        const formattedMessages = messages.map(msg => ({
            _id: msg._id,
            content: msg.content,
            isMine: msg.sender.toString() === currentUserId.toString(),
            timestamp: formatTimeOnly(msg.createdAt),
            createdAt: msg.createdAt
        }));

        res.json(formattedMessages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching messages' });
    }
};

// Send Direct Message
exports.sendDirectMessage = async (req, res) => {
    try {
        const { recipientId, content } = req.body;

        const msg = new Message({
            sender: req.user._id,
            recipient: recipientId,
            content,
            messageType: 'text'
        });

        await msg.save();

        // Real-time delivery via Socket.io
        const io = req.app.get('io');
        const onlineUsers = req.app.get('onlineUsers');

        // Find recipient socket ID
        // Note: onlineUsers forces keys to strings, so ensure lookup uses string
        const recipientSocketIds = onlineUsers.get(recipientId.toString());
        console.log("DM send attempt to:", recipientId.toString());
        console.log("Online users keys:", Array.from(onlineUsers.keys()));

        if (recipientSocketIds && recipientSocketIds.size > 0) {
            for (const recipientSocketId of recipientSocketIds) {
                io.to(recipientSocketId).emit('dm:receive', {
                    senderId: req.user._id.toString(),
                    senderName: req.user.name,
                    senderAvatar: req.user.avatar,
                    message: {
                        _id: msg._id,
                        content: msg.content,
                        isMine: false,
                        timestamp: formatTimeOnly(msg.createdAt),
                        createdAt: msg.createdAt
                    }
                });
            }
            console.log(`💬 DM forwarded directly from controller: ${req.user._id} -> ${recipientId}`);
        }

        res.status(201).json({
            _id: msg._id,
            content: msg.content,
            isMine: true,
            timestamp: formatTimeOnly(msg.createdAt),
            createdAt: msg.createdAt
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error sending message' });
    }
};

// Helper: Format Time Ago (Simple version)
function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " min ago";
    return "Just now";
}

function formatTimeOnly(date) {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Get All Users for DM/Connection
exports.getUsers = async (req, res) => {
    try {
        const User = require('../models/User');
        // Exclude current user
        const users = await User.find({ _id: { $ne: req.user._id } })
            .select('name avatar status role reputation connections pendingConnections');

        // Build formatted list with connection status
        const formattedUsers = users.map(u => {
            const myConnIds = req.user.connections.map(id => id.toString());
            const theirPendingIds = u.pendingConnections.map(id => id.toString());
            const myPendingIds = req.user.pendingConnections.map(id => id.toString());
            const uid = u._id.toString();

            let connectionStatus = 'none';
            if (myConnIds.includes(uid)) connectionStatus = 'connected';
            else if (theirPendingIds.includes(req.user._id.toString())) connectionStatus = 'sent';
            else if (myPendingIds.includes(uid)) connectionStatus = 'received';

            return {
                id: u._id,
                user: {
                    name: u.name,
                    avatar: u.avatar || '👤',
                    status: u.status || 'offline',
                    role: u.role,
                    reputation: u.reputation || 0
                },
                lastMessage: 'Start a conversation',
                timestamp: '',
                unread: 0,
                connectionStatus,
                connectionCount: u.connections?.length || 0
            };
        });

        // Real post counts per user via aggregation
        const userIds = users.map(u => u._id);
        const postCounts = await Post.aggregate([
            { $match: { author: { $in: userIds } } },
            { $group: { _id: '$author', count: { $sum: 1 } } }
        ]);
        const postCountMap = {};
        postCounts.forEach(p => { postCountMap[p._id.toString()] = p.count; });

        const result = formattedUsers.map(u => ({
            ...u,
            postCount: postCountMap[u.id.toString()] || 0
        }));

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching users' });
    }
};

// Get Channel Stats
exports.getChannelStats = async (req, res) => {
    try {
        const stats = await Post.aggregate([
            {
                $group: {
                    _id: "$channelId",
                    count: { $sum: 1 },
                    lastActivity: { $max: "$createdAt" }
                }
            }
        ]);

        const statsMap = {};
        stats.forEach(s => {
            statsMap[s._id] = { count: s.count, lastActivity: s.lastActivity };
        });
        res.json(statsMap);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Send Connection Request
exports.sendConnectionRequest = async (req, res) => {
    try {
        const User = require('../models/User');
        const targetUser = await User.findById(req.body.userId);

        if (!targetUser) return res.status(404).json({ error: 'User not found' });

        // Check if already connected or pending
        if (targetUser.connections.includes(req.user._id) ||
            targetUser.pendingConnections.includes(req.user._id)) {
            return res.status(400).json({ error: 'Request already sent or connected' });
        }

        // Add to target's pending connections
        targetUser.pendingConnections.push(req.user._id);
        await targetUser.save();

        res.json({ success: true, message: 'Request sent' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Accept Connection Request
exports.acceptConnectionRequest = async (req, res) => {
    try {
        const User = require('../models/User');
        const requesterId = req.body.userId;
        const requester = await User.findById(requesterId);

        if (!requester) return res.status(404).json({ error: 'User not found' });

        // Remove from pending
        req.user.pendingConnections = req.user.pendingConnections.filter(id => id.toString() !== requesterId);

        // Add to connections (both sides)
        req.user.connections.push(requesterId);
        requester.connections.push(req.user._id);

        await req.user.save();
        await requester.save();

        res.json({ success: true, message: 'Connected' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Reject Connection Request
exports.rejectConnectionRequest = async (req, res) => {
    try {
        const requesterId = req.body.userId;

        // Remove from pending
        req.user.pendingConnections = req.user.pendingConnections.filter(id => id.toString() !== requesterId);
        await req.user.save();

        res.json({ success: true, message: 'Request rejected' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Network (Connections & Requests)
exports.getNetwork = async (req, res) => {
    try {
        const User = require('../models/User');

        // Populate connections and pending requests
        const user = await User.findById(req.user._id)
            .populate('connections', 'name avatar role status reputation')
            .populate('pendingConnections', 'name avatar role status reputation');

        res.json({
            connections: user.connections,
            pending: user.pendingConnections
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// Get Comments for a Post
exports.getComments = async (req, res) => {
    try {
        const Comment = require('../models/Comment');
        const comments = await Comment.find({ post: req.params.postId })
            .populate('author', 'name avatar status')
            .sort({ createdAt: 1 });

        // Format relative time if needed or return date
        const formatted = comments.map(c => ({
            ...c.toObject(),
            timestamp: formatTimeAgo(c.createdAt)
        }));

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Post a Comment
exports.postComment = async (req, res) => {
    try {
        const Comment = require('../models/Comment');
        const User = require('../models/User');
        const { content } = req.body;
        const newComment = new Comment({
            post: req.params.postId,
            author: req.user._id,
            content
        });
        await newComment.save();
        const populated = await newComment.populate('author', 'name avatar status');

        // Notify post author
        const post = await Post.findById(req.params.postId);
        if (post && post.author.toString() !== req.user._id.toString()) {
            const author = await User.findById(post.author);
            if (author) {
                if (!author.notifications) author.notifications = [];
                author.notifications.push({
                    message: `${req.user.name} replied to your post: "${post.title}"`,
                    type: 'forum',
                    read: false,
                    link: `/discuss`,
                    createdAt: new Date()
                });
                await author.save();
            }
        }

        res.status(201).json({
            ...populated.toObject(),
            timestamp: 'Just now'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Trending Topics
exports.getTrendingTopics = async (req, res) => {
    try {
        const Post = require('../models/Post');
        const tags = await Post.aggregate([
            { $unwind: "$tags" },
            { $group: { _id: "$tags", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        const trending = tags.map(t => ({ tag: t._id, posts: t.count }));
        res.json(trending);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Toggle Downvote on Post
exports.toggleDownvote = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        // Ensure downvotes field exists
        if (!post.downvotes) post.downvotes = [];
        const index = post.downvotes.findIndex(id => id.toString() === req.user._id.toString());
        if (index === -1) {
            post.downvotes.push(req.user._id);
        } else {
            post.downvotes.splice(index, 1);
        }
        await post.save();

        res.json({
            downvotes: post.downvotes.length,
            isDownvoted: index === -1
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Mark Post as Solved
exports.markSolved = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Only the post author can mark it as solved' });
        }
        post.isSolved = !post.isSolved;
        await post.save();
        res.json({ isSolved: post.isSolved });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Clear all posts in a channel (admin/teacher only)
exports.clearChannel = async (req, res) => {
    try {
        const { channelId } = req.params;
        if (!channelId) return res.status(400).json({ error: 'Channel ID required' });

        const result = await Post.deleteMany({ channelId });

        // Also delete comments for those posts (optional cascade)
        const Comment = require('../models/Comment');
        // Since posts are gone, just delete orphan comments if you want
        // For simplicity, skip here

        res.json({ success: true, deleted: result.deletedCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// AI Answer Generator for a Post
exports.aiAnswer = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('author', 'name');
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const GROQ_API_KEY = process.env.GROQ_API_KEY_INTERVIEW || process.env.GROQ_API_KEY || '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';
        if (!GROQ_API_KEY) return res.status(500).json({ error: 'AI service not configured.' });

        const prompt = `A student posted the following question in a study community forum:

Title: ${post.title}
Channel: ${post.channelId}
Question: ${post.content}
Tags: ${(post.tags || []).join(', ') || 'none'}

Please provide a clear, helpful, and thorough answer to this question. Be educational, concise, and use examples where relevant. If it's a DSA/coding question, provide a brief explanation, time/space complexity, and a code snippet. Keep response under 400 words.`;

        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: 'You are a helpful study mentor and expert tutor. Give clear, accurate, student-friendly answers. Format with markdown when helpful.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.5,
                max_tokens: 600
            })
        });

        const data = await groqRes.json();
        const answer = data.choices?.[0]?.message?.content?.trim() || '';
        if (!answer) return res.status(500).json({ error: 'AI generation failed' });

        // Save as a comment authored by system/AI
        const Comment = require('../models/Comment');
        const aiComment = new Comment({
            post: post._id,
            author: req.user._id, // Post as the requesting user
            content: `🤖 **AI Answer:**\n\n${answer}`,
            isAiGenerated: true
        });
        await aiComment.save();
        await aiComment.populate('author', 'name avatar status');

        res.status(201).json({
            ...aiComment.toObject(),
            timestamp: 'Just now',
            isAiGenerated: true
        });
    } catch (err) {
        console.error('❌ AI Answer error:', err);
        res.status(500).json({ error: 'AI answer generation failed.' });
    }
};

