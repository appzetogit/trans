const crypto = require("crypto");

const DEFAULT_ITERATIONS = 120_000;
const KEYLEN = 32;
const DIGEST = "sha256";

function base64url(buf) {
  return Buffer.from(buf).toString("base64url");
}

function pbkdf2(password, salt, iterations) {
  return crypto.pbkdf2Sync(String(password), salt, iterations, KEYLEN, DIGEST);
}

function hashPassword(password, { iterations = DEFAULT_ITERATIONS } = {}) {
  const salt = crypto.randomBytes(16);
  const hash = pbkdf2(password, salt, iterations);
  return {
    salt: base64url(salt),
    hash: base64url(hash),
    iterations,
  };
}

function timingSafeEqualStr(a, b) {
  const aa = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}

function verifyPassword(password, { salt, hash, iterations }) {
  const saltBuf = Buffer.from(String(salt), "base64url");
  const derived = pbkdf2(password, saltBuf, Number(iterations) || DEFAULT_ITERATIONS);
  const derivedStr = base64url(derived);
  return timingSafeEqualStr(derivedStr, String(hash));
}

module.exports = { hashPassword, verifyPassword, DEFAULT_ITERATIONS };

