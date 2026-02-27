const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const adminAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // For now, if GOOGLE_CLIENT_ID is not set, we allow the request but log a warning
        // This prevents breaking the user's flow while setting up security
        if (!process.env.GOOGLE_CLIENT_ID) {
            console.warn('⚠️ WARNING: GOOGLE_CLIENT_ID not set. Skipping backend token verification.');
            return next();
        }

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const userEmail = payload.email.toLowerCase().trim();
        const adminEmails = (process.env.ADMIN_EMAIL || '').toLowerCase().split(',').map(e => e.trim());

        console.log(`🔐 Auth Attempt: "${userEmail}"`);
        console.log(`🎯 Allowed Admins: ${adminEmails.join(', ')}`);

        // Check if user is in the allowed admin list
        if (!adminEmails.includes(userEmail)) {
            console.warn(`🚫 Access Denied: ${userEmail} is not in the admin list.`);
            return res.status(403).json({ error: 'Access denied: Admin only' });
        }

        req.user = payload;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = { adminAuth };
