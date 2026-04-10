const { issueOtp, verifyOtp } = require("../../utils/otpStore");

function issue(phone) {
  return issueOtp(phone);
}

function verify(phone, otp) {
  return verifyOtp(phone, otp);
}

module.exports = { issue, verify };

