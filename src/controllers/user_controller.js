const User = require('../models/user');
const { STATUS_CODES } = require("../constants/status_codes");
const AuthCredential = require('../models/auth_credentials');
const { generateAccessToken,
  generateRefreshToken,
  accessExpiresAt,
  refreshExpiresAt, tokenDecoder, } = require('../services/jwt/jwt_service')
const { successJson, errorJson, Messages } = require('../constants/messages');
const { generateOtp } = require('../services/otp/otp_service');
const Validator = require('../services/validator/validator_service');
const { sendOtpEmail } = require('../services/email/email_service');

const OtpModel = require('../models/otp');


// Create User
exports.createUser = async (req, res) => {
  try {
    const { email, password, is_therapist } = req.body;

    const newUser = new User({ email, password, is_therapist });
    await newUser.save();
    res.status(STATUS_CODES.CREATED).json(successJson({ user: newUser }, Messages.UserCreatedSuccessfully));
  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(error.message));

  }

};

// Get User by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.UserNotFound));
    res.status(STATUS_CODES.SUCCESS).json(successJson({ user: user }, Messages.UserFetchedSuccessfully));
  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(error.message));
  }
};


// Get User by ID
exports.getMyUser = async (req, res) => {

  try {

    const token = req.user

    const user = await User.findById(token.user_id); //fetching the user from the database
    console.log("USER,", user);
    res.status(STATUS_CODES.SUCCESS).json(successJson({ user: user }, Messages.UserFetchedSuccessfully))

  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(error.message));
  }
};

exports.sendOtp = async (req, res) => {

  try {
    const { email } = req.body;

    if (!Validator.validateEmail(email)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson(Messages.InvalidEmail));
    }

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.UserNotFound));
    }

    const otp = generateOtp();

    const existingOtp = await OtpModel.findOne({ email });

    if (existingOtp) {
      existingOtp.otp = otp;
      existingOtp.createdAt = Date.now(); // Update the creation date
      await existingOtp.save();
    } else {
      await OtpModel.create({ email, otp });
    }

    res.status(STATUS_CODES.SUCCESS).json(successJson({ email: email }, Messages.OTPSentSuccessfully));

    sendOtpEmail(email, otp);

  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(error.message));
  }
};

exports.logoutFromUser = async (req, res) => {

  try {

    const user = req.user;

    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.UserNotFound));
    }

    await AuthCredential.findByIdAndDelete(user.token_id);

    res.status(STATUS_CODES.SUCCESS).json(successJson({ email: user.email, id: user.user_id }, Messages.UserLogoutSuccessfully))

  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(error.message));
  }
};

exports.verifyOtp = async (req, res) => {

  try {

    const { email, otp } = req.body;

    if (!email) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson(Messages.EmailIsRequired));
    }

    if (!otp) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson(Messages.OTPIsRequired));
    }
    const user = await User.findOne({ email: email });
    if (user.is_verified) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson(Messages.UserIsAlreadyVerified));
    }

    const otpFromDb = await OtpModel.findOne({ email });
    if (!otpFromDb) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson(Messages.OTPNotSentForVerification));
    }

    if (otpFromDb.isExpired()) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson(Messages.OTPExpired));
    }

    if (otpFromDb.otp !== otp) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson(Messages.InvalidOtp));
    }

    await user.updateOne({ is_verified: true });
    await otpFromDb.deleteOne();

    res.status(STATUS_CODES.SUCCESS).json(successJson({ email: email }, Messages.OTPVerifiedSuccessfully))

  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(error.message));
  }
};

exports.loginWithUser = async (req, res) => {

  try {
    const { identifier, password } = req.body;


    //Searching user in db
    const user = await User.findOne({ email: identifier });

    if (!user || user.is_deleted) {
      return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.UserNotFound));
    }
    else if (!user.is_verified) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json(errorJson(Messages.UserIsNotVerified));
    }

    // Comparing password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson(Messages.InvalidCredentials));

    const refreshToken = generateRefreshToken(user);

    const authCredential = new AuthCredential({
      user_id: user._id,
      userDetails: {
        email: user.email,
        username: user.username,
        is_verified: user.is_verified,
        is_therapist: user.is_therapist,
      },
      token: user._id,
      refresh_token: refreshToken,
      expiresAt: refreshExpiresAt,
    });


    await authCredential.save();

    const accessToken = generateAccessToken(user, authCredential.id);

    await authCredential.updateOne({ token: accessToken });

    res.status(STATUS_CODES.SUCCESS).json(successJson(
      {
        user: user,  // Sending complete user object as requested
        tokens: { accessToken, accessExpiresAt, refreshToken, refreshExpiresAt }
      },
      Messages.LoginSuccessful,
    ));
  }
  catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(error.message));
  }
}

exports.updateUserProfile = async (req, res) => {

  try {

    const { user_name } = req.body
    const user = req.user;

    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.UserNotFound));
    }

    if (!user_name) {
      return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.UsernameIsRequired));
    }


    const updatedUser = await User.findByIdAndUpdate(
      user.user_id,
      { username: user_name },
      { new: true },
    );
    // await User.findByIdAndUpdate(user.user_id, { username: user_name });


    res.status(STATUS_CODES.SUCCESS).json(successJson({ user: updatedUser }, Messages.UserUpdatedSuccessfully))

  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(error.message));
  }

}


// ...existing code...

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const user = req.user;
    const { oldPassword, newPassword } = req.body;

    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.UserNotFound));
    }
    if (!oldPassword || !newPassword || oldPassword == newPassword) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Old and new passwords are required."));
    }

    const dbUser = await User.findById(user.user_id);
    if (!dbUser) {
      return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.UserNotFound));
    }
    const isMatch = await dbUser.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Old password is incorrect."));
    }

    dbUser.password = newPassword;
    await dbUser.save();

    res.status(STATUS_CODES.SUCCESS).json(successJson({}, "Password changed successfully."));
  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(error.message));
  }
};

// Delete Account
exports.deleteOwnAccount = async (req, res) => {
  try {
    const { user_id } = req.user;

    if (!user_id) {
      return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.UserNotFound));
    }

    const resp = await User.findByIdAndDelete(user_id);
    console.log("🚀 ~ resp:", resp)
    if (!resp)
      return res.status(STATUS_CODES.NOT_FOUND).json(errorJson(Messages.UserNotFound));
    await AuthCredential.deleteMany({ user_id });

    res.status(STATUS_CODES.SUCCESS).json(successJson({}, "Account deleted successfully."));
  } catch (error) {
    res.status(STATUS_CODES.SERVER_ERROR).json(errorJson(error.message));
  }
};

// ...existing code...