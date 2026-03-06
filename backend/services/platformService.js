/**
 * Platform Service - Fetches real data from coding platforms
 * Supports: LeetCode, Codeforces, CodeChef
 */

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const https = require('https');
const http = require('http');

function fetchWithRedirect(url, maxRedirects = 5) {
    return new Promise((resolve, reject) => {
        if (maxRedirects <= 0) return reject(new Error('Too many redirects'));
        const mod = url.startsWith('https') ? https : http;
        const req = mod.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
            }
        }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                let loc = res.headers.location;
                if (loc.startsWith('/')) {
                    const u = new URL(url);
                    loc = u.protocol + '//' + u.host + loc;
                }
                return fetchWithRedirect(loc, maxRedirects - 1).then(resolve).catch(reject);
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data }));
        });
        req.on('error', reject);
        req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')); });
    });
}

// ==================== LEETCODE API ====================

/**
 * Fetch LeetCode user profile using GraphQL
 */
async function fetchLeetCodeProfile(username) {
    try {
        const query = `
            query userPublicProfile($username: String!) {
                matchedUser(username: $username) {
                    username
                    profile {
                        ranking
                        realName
                        aboutMe
                        reputation
                        countryName
                    }
                    submitStats: submitStatsGlobal {
                        acSubmissionNum {
                            difficulty
                            count
                        }
                    }
                }
            }
        `;

        const response = await fetch('https://leetcode.com/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://leetcode.com'
            },
            body: JSON.stringify({
                query,
                variables: { username }
            })
        });

        const result = await response.json();

        if (!result.data?.matchedUser) {
            return null;
        }

        const user = result.data.matchedUser;
        const submitStats = user.submitStats?.acSubmissionNum || [];

        // Parse difficulty counts
        let easy = 0, medium = 0, hard = 0, total = 0;
        submitStats.forEach(stat => {
            if (stat.difficulty === 'Easy') easy = stat.count;
            else if (stat.difficulty === 'Medium') medium = stat.count;
            else if (stat.difficulty === 'Hard') hard = stat.count;
            else if (stat.difficulty === 'All') total = stat.count;
        });

        return {
            username: user.username,
            ranking: user.profile?.ranking || 0,
            solved: total,
            easy,
            medium,
            hard,
            reputation: user.profile?.reputation || 0,
            country: user.profile?.countryName || '',
            connected: true
        };
    } catch (error) {
        console.error('LeetCode API Error:', error.message);
        return null;
    }
}

/**
 * Fetch LeetCode contest rating
 */
async function fetchLeetCodeContestRating(username) {
    try {
        const query = `
            query userContestRankingInfo($username: String!) {
                userContestRanking(username: $username) {
                    attendedContestsCount
                    rating
                    globalRanking
                    totalParticipants
                    topPercentage
                }
            }
        `;

        const response = await fetch('https://leetcode.com/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://leetcode.com'
            },
            body: JSON.stringify({
                query,
                variables: { username }
            })
        });

        const result = await response.json();
        return result.data?.userContestRanking || null;
    } catch (error) {
        console.error('LeetCode Contest API Error:', error.message);
        return null;
    }
}

// ==================== CODEFORCES API ====================

/**
 * Fetch Codeforces user info
 */
async function fetchCodeforcesProfile(handle) {
    try {
        const result = await fetchWithRedirect(`https://codeforces.com/api/user.info?handles=${handle}`);
        if (result.status !== 200) return null;

        const data = JSON.parse(result.data);

        if (data.status !== 'OK' || !data.result?.[0]) {
            return null;
        }

        const user = data.result[0];
        return {
            username: user.handle,
            rating: user.rating || 0,
            maxRating: user.maxRating || 0,
            rank: user.rank || 'Unrated',
            maxRank: user.maxRank || 'Unrated',
            contribution: user.contribution || 0,
            friendOfCount: user.friendOfCount || 0,
            avatar: user.titlePhoto || user.avatar,
            connected: true
        };
    } catch (error) {
        console.error('Codeforces API Error:', error.message);
        return null;
    }
}

/**
 * Fetch Codeforces solved problems count
 */
async function fetchCodeforcesSolvedCount(handle) {
    try {
        const result = await fetchWithRedirect(`https://codeforces.com/api/user.status?handle=${handle}`);
        if (result.status !== 200) return 0;

        const data = JSON.parse(result.data);

        if (data.status !== 'OK') {
            return 0;
        }

        // Count unique solved problems
        const solvedProblems = new Set();
        data.result.forEach(submission => {
            if (submission.verdict === 'OK') {
                const problemId = `${submission.problem.contestId}-${submission.problem.index}`;
                solvedProblems.add(problemId);
            }
        });

        return solvedProblems.size;
    } catch (error) {
        console.error('Codeforces Submissions API Error:', error.message);
        return 0;
    }
}

/**
 * Fetch upcoming Codeforces contests
 */
async function fetchCodeforcesContests() {
    try {
        const result = await fetchWithRedirect('https://codeforces.com/api/contest.list?gym=false');
        if (result.status !== 200) return [];

        const data = JSON.parse(result.data);

        if (data.status !== 'OK') {
            return [];
        }

        // Filter only upcoming contests (BEFORE phase)
        const upcomingContests = data.result
            .filter(contest => contest.phase === 'BEFORE')
            .slice(0, 10)
            .map(contest => ({
                id: contest.id,
                name: contest.name,
                platform: 'Codeforces',
                type: contest.type === 'CF' ? 'Rated' : contest.type,
                startTimeSeconds: contest.startTimeSeconds,
                durationSeconds: contest.durationSeconds,
                url: `https://codeforces.com/contest/${contest.id}`,
                startTime: new Date(contest.startTimeSeconds * 1000).toISOString()
            }));

        return upcomingContests;
    } catch (error) {
        console.error('Codeforces Contests API Error:', error.message);
        return [];
    }
}

// ==================== CODECHEF API ====================

/**
 * Fetch CodeChef user profile (using unofficial API)
 */
async function fetchCodeChefProfile(username) {
    try {
        // We scrape directly from CodeChef's robust user profile using our custom redirects config
        const response = await fetchWithRedirect(`https://www.codechef.com/users/${username}`);

        if (response.status !== 200 || !response.data) {
            return null;
        }

        const html = response.data;

        // Use RegEx to parse the necessary HTML values
        const ratingMatch = html.match(/rating-number[^>]*>(\d+)/);
        const maxMatch = html.match(/Highest Rating[^>]*>(\d+)/i);
        const rankMatch = html.match(/Global Rank[^>]*>[^<]*<a[^>]*>(\d+)/i);
        const starsMatch = html.match(/class="rating"[^>]*>(\d)\s*&#x2605;/i) || html.match(/(\d)\s*&#x2605;/i);
        const problemsMatch = html.match(/Fully Solved \(([0-9]+)\)/i);

        let rating = 0;
        if (ratingMatch && ratingMatch[1]) {
            rating = parseInt(ratingMatch[1]);
        }

        if (rating === 0) return null; // Invalid user typically has no rating block

        return {
            username: username,
            rating: rating,
            maxRating: maxMatch ? parseInt(maxMatch[1]) : 0,
            stars: starsMatch ? `${starsMatch[1]}★` : '1★',
            globalRank: rankMatch ? parseInt(rankMatch[1]) : 0,
            countryRank: 0,
            country: '',
            solved: problemsMatch ? parseInt(problemsMatch[1]) : 0,
            connected: true
        };
    } catch (error) {
        console.error('CodeChef API Error:', error.message);
        return null;
    }
}

/**
 * Alternative CodeChef profile fetch using different API
 */
async function fetchCodeChefProfileAlt(username) {
    // Redundant since the direct scraping works without external third-party tools
    return await fetchCodeChefProfile(username);
}

// ==================== HACKERRANK API ====================

/**
 * Fetch HackerRank user profile
 * Note: HackerRank doesn't have an official public API
 * This uses an unofficial approach
 */
async function fetchHackerRankProfile(username) {
    try {
        // Try unofficial HackerRank API
        const response = await fetch(`https://www.hackerrank.com/rest/hackers/${username}/scores_elo`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            // Try alternative endpoint for basic profile
            const profileResponse = await fetch(`https://www.hackerrank.com/rest/hackers/${username}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json'
                }
            });

            if (!profileResponse.ok) {
                return null;
            }

            const profileData = await profileResponse.json();
            return {
                username: profileData.model?.username || username,
                connected: true,
                problemsSolved: profileData.model?.solved_challenges || 0,
                badges: profileData.model?.badges_count || 0,
                points: 0,
                rank: profileData.model?.rank || 0,
                stars: 0
            };
        }

        const data = await response.json();

        // Calculate total score and extract data
        let totalScore = 0;
        let tracks = [];

        if (data.model) {
            for (const [track, score] of Object.entries(data.model)) {
                if (typeof score === 'number') {
                    totalScore += score;
                    tracks.push({ name: track, score });
                }
            }
        }

        return {
            username: username,
            connected: true,
            problemsSolved: 0, // Will be fetched separately if needed
            badges: 0,
            points: totalScore,
            rank: 0,
            stars: Math.min(5, Math.floor(totalScore / 500)), // Approximate stars
            tracks
        };
    } catch (error) {
        console.error('HackerRank API Error:', error.message);
        return null;
    }
}

/**
 * Alternative HackerRank profile fetch
 */
async function fetchHackerRankProfileAlt(username) {
    try {
        const response = await fetch(`https://www.hackerrank.com/rest/contests/master/hackers/${username}/profile`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) return null;

        const data = await response.json();
        return {
            username: data.model?.username || username,
            connected: true,
            problemsSolved: data.model?.solved_challenges || 0,
            badges: data.model?.badges_count || 0,
            points: data.model?.score || 0,
            rank: data.model?.rank || 0,
            stars: data.model?.level || 0
        };
    } catch (error) {
        console.error('HackerRank Alt API Error:', error.message);
        return null;
    }
}

// ==================== HACKEREARTH API ====================

/**
 * Fetch HackerEarth user profile
 * Note: HackerEarth requires API key for official API
 * This uses unofficial approach
 */
async function fetchHackerEarthProfile(username) {
    try {
        // HackerEarth doesn't have a reliable public API
        // Try to fetch basic profile info
        const response = await fetch(`https://www.hackerearth.com/@${username}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html'
            }
        });

        if (!response.ok) {
            return null;
        }

        // Since we can't parse the HTML easily, return basic connected status
        // The profile exists if we get a 200 response
        return {
            username: username,
            connected: true,
            rating: 0,
            problemsSolved: 0,
            message: 'HackerEarth profile connected. Detailed stats require login.'
        };
    } catch (error) {
        console.error('HackerEarth API Error:', error.message);
        return null;
    }
}

// ==================== GITHUB API ====================

/**
 * Fetch GitHub user profile
 */
async function fetchGitHubProfile(username) {
    try {
        const response = await fetch(`https://api.github.com/users/${username}`, {
            headers: {
                'User-Agent': 'StudySpirit-App'
            }
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return {
            username: data.login,
            name: data.name || data.login,
            connected: true,
            repos: data.public_repos || 0,
            followers: data.followers || 0,
            avatar: data.avatar_url,
            bio: data.bio || '',
            url: data.html_url
        };
    } catch (error) {
        console.error('GitHub API Error:', error.message);
        return null;
    }
}

// ==================== LINKEDIN API ====================

/**
 * Fetch LinkedIn user profile (Mock/Basic)
 */
async function fetchLinkedInProfile(username) {
    try {
        // LinkedIn does not have a public API without OAuth
        // We simulate connection by validating the username format or simple check
        if (!username || username.length < 3) return null;

        return {
            username: username,
            connected: true,
            message: 'LinkedIn profile linked. Visit your profile to see updates.'
        };
    } catch (error) {
        console.error('LinkedIn Connection Error:', error.message);
        return null;
    }
}

// ==================== CONTEST AGGREGATOR ====================

/**
 * Fetch all upcoming contests from all platforms
 */
async function fetchAllUpcomingContests() {
    try {
        const contests = [];

        // Fetch Codeforces contests
        const cfContests = await fetchCodeforcesContests();
        contests.push(...cfContests);

        // Fetch LeetCode contests (using estimated schedule - LeetCode contests are weekly)
        const lcContests = generateLeetCodeContestSchedule();
        contests.push(...lcContests);

        // Sort by start time
        contests.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

        return contests.slice(0, 10); // Return top 10 upcoming
    } catch (error) {
        console.error('Contest Aggregator Error:', error.message);
        return [];
    }
}

/**
 * Generate LeetCode contest schedule (they're weekly)
 */
function generateLeetCodeContestSchedule() {
    const contests = [];
    const now = new Date();

    // LeetCode Weekly Contest: Every Sunday at 10:30 AM IST (5:00 AM UTC)
    // LeetCode Biweekly Contest: Every other Saturday at 8:00 PM IST (2:30 PM UTC)

    for (let i = 0; i < 4; i++) {
        // Calculate next Sunday
        const nextSunday = new Date(now);
        nextSunday.setDate(now.getDate() + ((7 - now.getDay()) % 7) + (i * 7));
        nextSunday.setUTCHours(5, 0, 0, 0); // 5:00 AM UTC = 10:30 AM IST

        if (nextSunday > now) {
            const weekNumber = Math.floor((nextSunday - new Date('2024-01-07')) / (7 * 24 * 60 * 60 * 1000)) + 378;
            contests.push({
                id: `lc-weekly-${weekNumber}`,
                name: `Weekly Contest ${weekNumber}`,
                platform: 'LeetCode',
                type: 'Rated',
                startTimeSeconds: Math.floor(nextSunday.getTime() / 1000),
                durationSeconds: 5400, // 90 minutes
                url: 'https://leetcode.com/contest/',
                startTime: nextSunday.toISOString()
            });
        }
    }

    return contests;
}

/**
 * Format time until contest
 */
function formatTimeUntil(startTimeISO) {
    const now = new Date();
    const start = new Date(startTimeISO);
    const diffMs = start - now;

    if (diffMs < 0) return 'Started';

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    const remainingHours = diffHours % 24;

    if (diffDays > 0) {
        return `${diffDays}d ${remainingHours}h`;
    }
    return `${diffHours}h ${Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))}m`;
}

/**
 * Format date for display
 */
function formatContestDate(startTimeISO) {
    const date = new Date(startTimeISO);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;

    if (date.toDateString() === now.toDateString()) {
        return `Today, ${displayHours}:${minutes} ${ampm}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return `Tomorrow, ${displayHours}:${minutes} ${ampm}`;
    }
    return `${days[date.getDay()]}, ${displayHours}:${minutes} ${ampm}`;
}

module.exports = {
    // LeetCode
    fetchLeetCodeProfile,
    fetchLeetCodeContestRating,

    // Codeforces
    fetchCodeforcesProfile,
    fetchCodeforcesSolvedCount,
    fetchCodeforcesContests,

    // CodeChef
    fetchCodeChefProfile,
    fetchCodeChefProfileAlt,

    // HackerRank
    fetchHackerRankProfile,
    fetchHackerRankProfileAlt,

    // HackerEarth
    fetchHackerEarthProfile,

    // Social
    fetchGitHubProfile,
    fetchLinkedInProfile,

    // Aggregated
    fetchAllUpcomingContests,
    formatTimeUntil,
    formatContestDate
};
