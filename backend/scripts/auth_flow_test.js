const http = require("http");

function req(method, path, body, headers = {}, jar = { cookie: "" }) {
  return new Promise((resolve, reject) => {
    const data = body ? Buffer.from(JSON.stringify(body)) : null;
    const opts = {
      hostname: "localhost",
      port: 4000,
      path,
      method,
      headers: {
        "Content-Type": "application/json",
        ...(data ? { "Content-Length": data.length } : {}),
        ...(jar.cookie ? { Cookie: jar.cookie } : {}),
        ...headers,
      },
    };
    const r = http.request(opts, (res) => {
      let buf = "";
      const setCookie = res.headers["set-cookie"];
      if (setCookie && setCookie.length) {
        jar.cookie = setCookie.map((c) => c.split(";")[0]).join("; ");
      }
      res.on("data", (c) => (buf += c));
      res.on("end", () => {
        let json = null;
        try {
          json = buf ? JSON.parse(buf) : null;
        } catch (_) {
          json = { raw: buf };
        }
        resolve({ status: res.statusCode, json, cookie: jar.cookie });
      });
    });
    r.on("error", reject);
    if (data) r.write(data);
    r.end();
  });
}

(async () => {
  const jar = { cookie: "" };

  console.log("send-otp");
  console.log(await req("POST", "/api/auth/send-otp", { phone: "9999911111" }, {}, jar));

  // OTP is random now; verify requires the real OTP (from SMS provider).
  // Still, we can validate refresh/logout behaviors without a cookie.
  console.log("refresh without cookie");
  console.log(await req("POST", "/api/auth/refresh", null, {}, { cookie: "" }));

  console.log("logout without cookie");
  console.log(await req("POST", "/api/auth/logout", null, {}, { cookie: "" }));
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

