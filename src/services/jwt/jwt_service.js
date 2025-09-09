const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_REFRESH_SECRET } = process.env;
const { errorJson, Messages } = require('../../constants/messages');
const { STATUS_CODES } = require("../../constants/status_codes");
const User = require('../../models/user');
const AuthCredential = require('../../models/auth_credentials');

function generateAccessToken(user, token_id) {
    return jwt.sign(
        { user_id: user._id, is_therapist: user.is_therapist, email: user.email, token_id: token_id },
        JWT_SECRET,
        { expiresIn: '1d' }
        // { expiresIn: '20s' }
    );
}

// Generate refresh token with 1-week expiry
function generateRefreshToken(user) {
    return jwt.sign(
        { user_id: user._id, is_therapist: user.is_therapist, email: user.email },
        JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );
}

const validateAdmin = async (req, res, next) => {
    const token = req.user;

    if (token.email !== 'ibadaamir33@gmail.com') {
        return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson(Messages.YouHaveNoAdminAccess));
    } else {
        next();
    }
}

const validateTherapist = async (req, res, next) => {
    const token = req.user;

    if (token.is_therapist == false) {
        return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson(Messages.NotATherapist));
    } else {
        next();
    }
}

const validateUser = async (req, res, next) => {
    try {
        const token = req.header('x-token');

        if (!token) {
            console.log(token);
            return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson(Messages.TokenDecodeFailure));
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        const tokenFromDb = await AuthCredential.findById(decoded.token_id);

        if (!tokenFromDb) {
            return res.status(STATUS_CODES.UNAUTHORIZED).json(errorJson(Messages.UserHasLoggedOut));
        }

        const user = await User.findById(decoded.user_id);
        if (user.is_deleted) {
            return res.status(STATUS_CODES.UNAUTHORIZED).json(errorJson(Messages.UserNotFound));
        }

        req.user = decoded; // Attach decoded token info to the request object for later use
        next(); // Continue to `getMyUser` or other handlers
    } catch (e) {

        if (e.name === "TokenExpiredError") {
            return res.status(STATUS_CODES.UNAUTHORIZED).json(errorJson(Messages.TokenExpired));
        }
        console.log(e);
        return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson(Messages.InvalidTokenSent));
    }
};



const accessExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 we


module.exports = {
    generateAccessToken,
    generateRefreshToken,
    validateUser,
    validateAdmin,
    validateTherapist,
    accessExpiresAt,
    refreshExpiresAt,
}