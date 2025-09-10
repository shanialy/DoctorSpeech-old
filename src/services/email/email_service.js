const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail', // Use your email service provider here
  auth: {
    user: process.env.EMAIL_USER, // Email account
    pass: process.env.EMAIL_PASS, // Email account password or App password if 2FA
  },
});

exports.sendOtpEmail = async (email, otp) => {
  try {
    const message = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Doctor Speech, OTP update',
      text: `Your OTP code is: ${otp}`,
      // html: '<h1>From the team of Tiny Dragon Therapy</h1>',
    };

    await transporter.sendMail(message);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
