// Builds the password-protected index.html (AES-256-GCM, PBKDF2) from src/.
// Usage: HT_PASSWORD='...' node tools/build-protected.js
const fs = require("fs"), crypto = require("crypto"), cp = require("child_process");
const root = __dirname + "/../", S = root + "src/";
const pw = process.env.HT_PASSWORD;
if (!pw) { console.error("Set HT_PASSWORD"); process.exit(1); }
cp.execFileSync("node", [__dirname + "/build-deps.js"], { stdio: "inherit" });
const deps = fs.readFileSync(S + "deps.js", "utf8");
const inline = h => h.replace('<script src="deps.js"></script>', () => "<script>" + deps + "</script>");
const payload = JSON.stringify({
  xd: inline(fs.readFileSync(S + "experience-design.html", "utf8")),
  ca: inline(fs.readFileSync(S + "change-and-adoption.html", "utf8")),
});
const iter = 250000, salt = crypto.randomBytes(16), iv = crypto.randomBytes(12);
const key = crypto.pbkdf2Sync(pw, salt, iter, 32, "sha256");
const c = crypto.createCipheriv("aes-256-gcm", key, iv);
const ct = Buffer.concat([c.update(payload, "utf8"), c.final(), c.getAuthTag()]);
const P = { iter, salt: salt.toString("base64"), iv: iv.toString("base64"), data: ct.toString("base64") };
const shell = fs.readFileSync(S + "shell.html", "utf8");
fs.writeFileSync(root + "index.html", shell.replace("/*PAYLOAD*/{}", () => JSON.stringify(P)));
console.log("index.html written,", Math.round(ct.length / 1024), "KB encrypted");
