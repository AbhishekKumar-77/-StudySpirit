const Event = require('../models/Event');
const User = require('../models/User');

// Seed mock data if empty (Simulator since we can't scrape)
// Seed mock data if empty (Simulator since we can't scrape)
exports.seedEvents = async () => {
    try {
        const events = [
            {
                title: "Google Cloud Hero Hackathon",
                platform: "Unstop",
                description: "Join the ultimate cloud coding challenge and win swags!",
                date: new Date(Date.now() + 86400000 * 5), // 5 days from now
                link: "https://unstop.com/hackathons/google-cloud-hero",
                type: "Hackathon",
                imageUrl: "https://d8it4huxumps7.cloudfront.net/uploads/images/63d8d64673648_google_cloud_hero_hero_banner.jpg"
            },
            {
                title: "LinkedIn Career Webinar: Resume Tips",
                platform: "LinkedIn",
                description: "Learn from top recruiters about what makes a CV stand out.",
                date: new Date(Date.now() + 86400000 * 2), // 2 days from now
                link: "https://linkedin.com/events/resume-tips-webinar",
                type: "Webinar",
                imageUrl: "https://static.licdn.com/aero-v1/sc/h/5a0n56345037d004653310056"
            },
            {
                title: "CodeChef Starters 120",
                platform: "CodeChef",
                description: "Weekly coding contest for beginners and intermediates.",
                date: new Date(Date.now() + 86400000 * 1), // Tomorrow
                link: "https://codechef.com/contest/START120",
                type: "Contest",
                imageUrl: "https://cdn.codechef.com/sites/all/themes/abacus/logo.png"
            },
            {
                title: "SIH 2026 Internal Hackathon",
                platform: "Unstop",
                description: "The biggest internal hackathon of the year. Build for India!",
                date: new Date(Date.now() + 86400000 * 10),
                link: "https://unstop.com/hackathons/sih-2026",
                type: "Hackathon",
                imageUrl: "https://www.sih.gov.in/img/logo.png"
            },
            {
                title: "LeetCode Biweekly Contest 124",
                platform: "LeetCode",
                description: "Solve 4 problems in 90 minutes. Global ranking.",
                date: new Date(Date.now() + 86400000 * 3),
                link: "https://leetcode.com/contest/biweekly-contest-124/",
                type: "Contest",
                imageUrl: "https://leetcode.com/static/images/LeetCode_Sharing.png"
            },
            {
                title: "AWS Community Day",
                platform: "Meetup",
                description: "Connect with cloud enthusiasts and learn AWS.",
                date: new Date(Date.now() + 86400000 * 15),
                link: "https://aws.amazon.com/events/",
                type: "Conference",
                imageUrl: "https://d1.awsstatic.com/events/aws-hosted-events/2020/US/Community-Day-2020/Community-Day-Source-File_Asset-Package_Logo_RGB_Squid-Ink.3a89078693874313853110298188165681650389.png"
            },
            {
                title: "React Conf 2026",
                platform: "Conference",
                description: "The biggest React.js conference. Learn about the latest features.",
                date: new Date(Date.now() + 86400000 * 20),
                link: "https://reactconf.com",
                type: "Conference",
                imageUrl: "https://reactconf.com/images/og.png"
            },
            {
                title: "Global AI Summit",
                platform: "Webinar",
                description: "Explore the future of Artificial Intelligence with industry leaders.",
                date: new Date(Date.now() + 86400000 * 12),
                link: "https://ai-summit.global",
                type: "Webinar",
                imageUrl: "https://www.globalaisummit.org/assets/images/logo.png"
            },
            {
                title: "Codeforces Round 950",
                platform: "Codeforces",
                description: "Rated round for Div. 2 participants.",
                date: new Date(Date.now() + 86400000 * 4),
                link: "https://codeforces.com/contests",
                type: "Contest",
                imageUrl: "https://codeforces.org/s/83842/images/codeforces-logo-with-telegram.png"
            },
            {
                title: "Open Source Summit",
                platform: "Linux Foundation",
                description: "The premier event for open source developers and community leaders.",
                date: new Date(Date.now() + 86400000 * 25),
                link: "https://events.linuxfoundation.org/open-source-summit-north-america/",
                type: "Conference",
                imageUrl: "https://events.linuxfoundation.org/wp-content/uploads/2023/12/oss-na-24-logo-white.svg"
            }
        ];

        // Upsert events (insert if not exists, update if exists)
        for (const event of events) {
            await Event.updateOne(
                { title: event.title }, // Filter by title
                { $set: event },        // Update fields
                { upsert: true }        // Create if doesn't exist
            );
        }
        console.log("Mock Events Seeded/Updated");
    } catch (err) {
        console.error("Seed error:", err);
    }
};

// Get all events
exports.getEvents = async (req, res) => {
    // try seeding first
    await exports.seedEvents();

    try {
        const events = await Event.find().sort({ date: 1 });
        res.json({ success: true, events });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Track/Monitor an event
exports.toggleMonitor = async (req, res) => {
    try {
        const { eventId } = req.body;
        const userId = req.user.id;

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: "Event not found" });

        const isMonitoring = event.monitors.includes(userId);

        if (isMonitoring) {
            event.monitors.pull(userId);
        } else {
            event.monitors.push(userId);
        }

        await event.save();

        res.json({
            success: true,
            message: isMonitoring ? "Removed from monitoring" : "Added to monitoring",
            isMonitoring: !isMonitoring
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get user's monitored events
exports.getMonitoredEvents = async (req, res) => {
    try {
        const events = await Event.find({ monitors: req.user.id }).sort({ date: 1 });
        res.json({ success: true, events });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
