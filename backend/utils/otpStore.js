const OTP_TTL_SECONDS = 5 * 60;

// In-memory OTP store: good for dev/single instance.
// For production, replace with Redis or DB table.
const store = new Map(); // phone -> { otp, expiresAtMs }

function generateOtp() {
  // Dev default OTP (any number).
  return "110211";
}

function issueOtp(phone) {
  const otp = generateOtp();
  const expiresAtMs = Date.now() + OTP_TTL_SECONDS * 1000;
  store.set(phone, { otp, expiresAtMs });
  return { otp, ttlSeconds: OTP_TTL_SECONDS };
}

function verifyOtp(phone, otp) {
  const rec = store.get(phone);
  if (!rec) return false;
  if (Date.now() > rec.expiresAtMs) {
    store.delete(phone);
    return false;
  }
  const ok = rec.otp === otp;
  if (ok) store.delete(phone);
  return ok;
}

module.exports = { issueOtp, verifyOtp };

