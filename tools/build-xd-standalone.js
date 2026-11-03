// Builds a single-file, password-protected Experience Design tracker (no Change tab, no iframes).
// Usage: HT_PASSWORD='...' node tools/build-xd-standalone.js
const fs = require("fs"), crypto = require("crypto");
const root = __dirname + "/../";
const pw = process.env.HT_PASSWORD;
if (!pw) { console.error("Set HT_PASSWORD"); process.exit(1); }
let html = fs.readFileSync(root + "src/experience-design.html", "utf8");
html = html.replace('<script src="deps.js"></script>\n', "");
const iter = 250000, salt = crypto.randomBytes(16), iv = crypto.randomBytes(12);
const key = crypto.pbkdf2Sync(pw, salt, iter, 32, "sha256");
const c = crypto.createCipheriv("aes-256-gcm", key, iv);
const ct = Buffer.concat([c.update(html, "utf8"), c.final(), c.getAuthTag()]);
const P = JSON.stringify({ iter, salt: salt.toString("base64"), iv: iv.toString("base64"), data: ct.toString("base64") });
const out = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>HT Discovery: Experience Design Tracker</title>
<style>
:root{--bg:#fff;--surface:#fff;--ink:#18202f;--muted:#525d78;--line:#d8deeb;--accent:#2e4e95;--accent-ink:#fff;--red:#b22420}
@media (prefers-color-scheme:dark){:root{--bg:#0f1626;--surface:#172036;--ink:#e8ecf6;--muted:#9aa6c4;--line:#2a3552;--accent:#8ea8e8;--accent-ink:#0f1626;--red:#ff8782}}
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:16px;background:var(--bg);color:var(--ink);font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}
form{width:100%;max-width:360px;border:1px solid var(--line);border-top:5px solid var(--accent);border-radius:12px;padding:24px;background:var(--surface)}
h1{font-size:1.25rem;margin:0 0 4px}p{margin:0 0 16px;color:var(--muted);font-size:.95rem}
input{width:100%;font:inherit;padding:10px 12px;border:1px solid var(--line);border-radius:8px;background:var(--bg);color:var(--ink)}
button{margin-top:12px;width:100%;font:inherit;font-weight:600;padding:10px;border:0;border-radius:8px;background:var(--accent);color:var(--accent-ink);cursor:pointer}
input:focus-visible,button:focus-visible{outline:3px solid var(--accent);outline-offset:2px}
.err{color:var(--red);font-size:.9rem;min-height:1.3em;margin:8px 0 0}
</style></head>
<body>
<form id="lf" autocomplete="off"><h1>HT Discovery: Experience Design</h1><p>Enter the password to open the planner and tracker.</p>
<label for="pw" style="position:absolute;left:-9999px">Password</label>
<input id="pw" type="password" autocomplete="current-password" autofocus required placeholder="Password">
<button type="submit">Unlock</button><div class="err" id="err" role="alert"></div></form>
<script>
(function(){
  var P=${P};
  function b64(x){var s=atob(x),a=new Uint8Array(s.length);for(var i=0;i<s.length;i++)a[i]=s.charCodeAt(i);return a}
  document.getElementById("lf").addEventListener("submit",function(e){
    e.preventDefault();
    var err=document.getElementById("err");err.textContent="";
    if(!window.crypto||!crypto.subtle){err.textContent="This browser needs a secure (https) connection to unlock the page.";return}
    crypto.subtle.importKey("raw",new TextEncoder().encode(document.getElementById("pw").value),"PBKDF2",false,["deriveKey"]).then(function(k){
      return crypto.subtle.deriveKey({name:"PBKDF2",salt:b64(P.salt),iterations:P.iter,hash:"SHA-256"},k,{name:"AES-GCM",length:256},false,["decrypt"]);
    }).then(function(key){return crypto.subtle.decrypt({name:"AES-GCM",iv:b64(P.iv)},key,b64(P.data))})
    .then(function(buf){var h=new TextDecoder().decode(buf);document.open();document.write(h);document.close()})
    .catch(function(){err.textContent="Wrong password. Try again."});
  });
})();
</script>
</body></html>`;
fs.mkdirSync(root + "downloads", { recursive: true });
fs.writeFileSync(root + "downloads/HT_Experience_Design_Tracker.html", out);
console.log("written", Math.round(out.length / 1024), "KB");
