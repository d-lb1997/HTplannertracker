// Extracts the planner data (tasks, deliverables, sessions, agendas, ...) from the legacy single-file page
// into typed-friendly JSON for the React app. Usage: node tools/extract-xd-data.js
const fs = require("fs"), vm = require("vm");
const root = __dirname + "/../";
const src = fs.readFileSync(root + "src/experience-design.html", "utf8");
const script = src.slice(src.indexOf("<script>\n(function(){") + 9);
const cut = script.indexOf("/* ================= weekly planner");
const prefix = script.slice(0, cut);
const wkStart = script.indexOf("var PBIDX=");
const wkEnd = script.indexOf("function qWeek");
const names = ["WEEKS","SESS","TAGS","T","WS","DIMS","LV","M","SESSIONS","STATUSES","DL","PACKS","PACKNAME","CONTRIB_R","CONTRIB_C","NEEDS","QS","RAIDD","PRE","PSTAT","CSTAT","PERS","JRN","BEFORE","GUARD","PBIDX","WK","NEEDWK","MATWK","PACKWK","ASKST"];
const sandbox = { localStorage: { getItem: () => null, setItem() {} }, document: {}, window: {}, console };
const out = vm.runInNewContext("(function(){" + prefix.replace(/^\(function\(\)\{\s*"use strict";/, "") + "\n" + script.slice(wkStart, wkEnd) + "\nvar ASKST=[\"Open\",\"Requested\",\"Received\",\"At risk\"];\nreturn {" + names.join(",") + "};})()", sandbox);
fs.writeFileSync(root + "app/src/data/planner.generated.json", JSON.stringify(out));
console.log(Object.keys(out).map(k => k + ":" + (Array.isArray(out[k]) ? out[k].length : typeof out[k])).join(" "));
