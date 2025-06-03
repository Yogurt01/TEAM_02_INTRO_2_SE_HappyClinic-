const jwt = require('jsonwebtoken');

exports.generateToken = (user) => {
    const fullName = user.displayName || `${user.name?.givenName || ''} ${user.name?.familyName || ''}`.trim();
    const email =
        user.email ||                         // already set on user
        user.emails?.[0]?.value ||            // from Google profile
        user._json?.email;
    const payload = {
        id: user.id , // or user._id if you're storing in DB
        username: fullName,
        email: email
    };

    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Hàm xác thực token
exports.verifyToken = (token) => {
    try {
        // Giải mã token
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid token');
    }
};