const checkAuth = (req, res, next) => {
    // Check if session exists and is not expired
    if (!req.session || !req.session.isAuthenticated) {
        // Clear any remaining cookies
        res.clearCookie('adminToken');
        res.clearCookie('connect.sid', { path: '/' });
        // Force session destruction
        if (req.session) {
            req.session.destroy();
        }
        return res.redirect('/admin/login');
    }

    // Update last activity timestamp
    req.session.lastActivity = Date.now();
    console.log('Session Status:', {
        isAuthenticated: req.session.isAuthenticated,
        adminUsername: req.session.adminUsername,
        sessionID: req.sessionID
    });
    next();
};

// Add session timeout check
const sessionTimeout = 30000; // 30 seconds in milliseconds

const checkSessionTimeout = (req, res, next) => {
    if (req.session && req.session.lastActivity) {
        const now = Date.now();
        const timeSinceLastActivity = now - req.session.lastActivity;
        
        if (timeSinceLastActivity > sessionTimeout) {
            req.session.destroy((err) => {
                if (err) console.error('Session destruction error:', err);
                res.clearCookie('adminToken');
                res.clearCookie('connect.sid');
                return res.redirect('/admin/login?timeout=true');
            });
            return;
        }
    }
    next();
};

module.exports = { checkAuth, checkSessionTimeout }; 