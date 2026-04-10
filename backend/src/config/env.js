function requireEnv(name) {
  const v = process.env[name];
  if (!v) {
    const err = new Error(`Missing env: ${name}`);
    err.statusCode = 500;
    throw err;
  }
  return v;
}

function isProd() {
  return String(process.env.NODE_ENV || "development") === "production";
}

module.exports = { requireEnv, isProd };

