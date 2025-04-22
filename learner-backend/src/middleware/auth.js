const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;

if (!SECRET_KEY) {
    console.error("⚠️ SECRET_KEY is undefined. Check your .env file!");
}

exports.hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

exports.comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

exports.generateToken = (user) => {
    const payload = {
        id: user._id,
        username: user.email,
        role: user.userType || 'learner'  // sécurisé avec fallback
    };
    return jwt.sign(payload, SECRET_KEY, { expiresIn: '6h' });
};

exports.verifyToken = (token) => {
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch (err) {
        return null;
    }
};

exports.authenticate = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).send('Access Denied');
    const token = authHeader.split(' ')[1];
    try {
        const verified = jwt.verify(token, SECRET_KEY);
        console.log('Verified user:', verified);
        req.user = verified;
        next();
    } catch (err) {
        console.error('Token verification failed:', err);
        res.status(400).send('Invalid Token');
    }
};
