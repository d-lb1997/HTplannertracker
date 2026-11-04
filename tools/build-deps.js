// Generates deps.js: cross-workstream dependency links between
// experience-design.html (ids t..) and change-and-adoption.html (ids c..).
// Run: node tools/build-deps.js   (edit PAIRS below to change links)
const fs = require("fs");
const root = __dirname + "/../";
const S = root + "src/";
const xdSrc = fs.readFileSync(S + "experience-design.html", "utf8");
const caSrc = fs.readFileSync(S + "change-and-adoption.html", "utf8");

// day + short text per task id
const days = {}, texts = {};
for (const m of xdSrc.matchAll(/^\["(t\d+)","([\d-]+)","\w+","(.*?)"\],?$/gm)) { days[m[1]] = m[2]; texts[m[1]] = m[3]; }
const CFG = JSON.parse(caSrc.match(/var CFG=(\{.*\});\nvar KEY/)[1]);
CFG.tasks.forEach(t => { days[t[0]] = t[1]; texts[t[0]] = t[3]; });

// [xdId, caId, kind, note]
// kinds: joint = same session, xd2ca = XD output feeds Change, ca2xd = Change output feeds XD, sync = align / shared artefact
const PAIRS = [
 ["t07","c05","sync","Workplans reviewed together; shared sessions #8, #12, #14, #17, #23"],
 ["t08","c05","sync","Co-facilitation and note-taking roles for #8, #12, #13, #17"],
 ["t10","c03","ca2xd","Change history feeds the discovery input inventory"],
 ["t12","c10","xd2ca","Persona hypotheses are the basis of the change impact view"],
 ["t14","c19","ca2xd","Frontline site, participants, shift cover and languages come via the Change Lead"],
 ["t15","c11","ca2xd","Works council and HR needs are raised by the Change Manager"],
 ["t16","c11","ca2xd","Consent, recording and anonymity rules depend on works council answers"],
 ["t18","c09","sync","Design stakeholders and the stakeholder map should match"],
 ["t19","c16","sync","Both collect usage, search and survey baselines; ask the Programme Owner once"],
 ["t22","c31","sync","Workshop pack should capture change impact and adoption barriers"],
 ["t26","c20","joint","Programme kickoff (#1)"],
 ["t27","c21","sync","Ways of Working canvas: agreed review and turnaround rules"],
 ["t115","c21","sync","Cadence and review rules agreed before the Ways of Working canvas"],
 ["t30","c19","ca2xd","Interview and test participants and slots"],
 ["t30","c12","ca2xd","Invitations have to reach frontline staff"],
 ["t31","c06","sync","XD questions, including how much tailoring HT expects, go into the sponsor interview guide"],
 ["t31","c24","ca2xd","Change Manager leads the interviews (#4) and asks XD's questions"],
 ["t32","c23","joint","Vision, objectives and value framework (#3); add UX success measures"],
 ["t32","c26","ca2xd","Updated value framework is shared back with XD"],
 ["t33","c24","ca2xd","Appetite for tailoring is noted from the sponsor interview"],
 ["t36","c29","xd2ca","Deep dive (#7) findings that touch change, comms and adoption"],
 ["t39","c31","joint","Persona and journey validation (#8)"],
 ["t40","c33","joint","Frontline access model and languages decision (#9)"],
 ["t40","c34","xd2ca","Decided languages set the languages for comms and champion briefings"],
 ["t41","c32","ca2xd","Works council and HR alignment outcome (#10)"],
 ["t42","c10","xd2ca","Primary personas for Phase 1 set the change impact view"],
 ["t42","c58","xd2ca","Primary personas shape the change impact assessment"],
 ["t44","c35","sync","Both feed Risk Gate 1 (#11)"],
 ["t49","c37","sync","Shared RAIDD log and weekly status"],
 ["t51","c39","joint","Design session Day 1 (#12)"],
 ["t55","c42","joint","Design session Day 2 (#13)"],
 ["t55","c43","sync","UX success measures and adoption measures are agreed together"],
 ["t55","c40","xd2ca","Stakeholder positions and frontline touchpoint needs feed the change impact view"],
 ["t57","c44","sync","Decisions logged the same day; change impact view updated"],
 ["t59","c45","joint","Transformation narrative and engagement (#14)"],
 ["t59","c17","xd2ca","Personas, journeys and quotes feed the narrative canvas"],
 ["t60","c47","sync","Content assessment and ownership (#16): content owner readiness and IA"],
 ["t61","c41","ca2xd","Message to HT staff about usability test participation"],
 ["t64","c49","joint","Usability round 1 (#17)"],
 ["t64","c50","xd2ca","Training and support needs surfaced in the test sessions"],
 ["t68","c51","joint","Prototype sign-off (#18)"],
 ["t72","c56","xd2ca","Design sign-off pack"],
 ["t73","c54","xd2ca","Standard-versus-tailored view shapes the change and adoption strategy"],
 ["t73","c57","xd2ca","How much is tailored drives training and enablement effort"],
 ["t74","c56","joint","Design sign-off (#21)"],
 ["t77","c59","joint","Change and Adoption plus comms review (#23)"],
 ["t79","c62","sync","Both check the Architecture sign-off (#25) for conflicts"],
 ["t83","c63","sync","Check XD outputs against the Change and comms sign-off (#26)"],
 ["t84","c67","sync","Design effort and change effort per wave are costed together"],
 ["t85","c67","joint","Delivery planning and wave options (#27)"],
 ["t86","c68","sync","Playback segments are sequenced together"],
 ["t87","c68","joint","Playback (#28)"],
 ["t88","c69","sync","Hand-off"],
 ["t89","c70","sync","Acceptance criteria for the deliverables"],
 ["t90","c70","joint","Final acceptance (#29)"],
 ["t91","c71","sync","Retro: what to repeat in Delivery"],
 ["t98","c38","sync","Week 2 focus plans"],
 ["t107","c44","sync","Backlog decisions logged and shared the same day"],
];

const short = s => { s = s.replace(/\\"/g, '"'); return s.length > 90 ? s.slice(0, s.lastIndexOf(" ", 88)) + "…" : s; };
const data = { xd: {}, ca: {} };
for (const [x, c, kind, note] of PAIRS) {
  if (!days[x] || !days[c]) throw new Error("Unknown id in pair " + x + " " + c);
  (data.xd[x] = data.xd[x] || []).push({ ws: "ca", id: c, kind, note, day: days[c], text: short(texts[c]) });
  (data.ca[c] = data.ca[c] || []).push({ ws: "xd", id: x, kind, note, day: days[x], text: short(texts[x]) });
}
const tpl = fs.readFileSync(root + "tools/deps.template.js", "utf8");
fs.writeFileSync(S + "deps.js", tpl.replace("/*DATA*/{}", JSON.stringify(data)));
console.log("links:", PAIRS.length, "xd tasks:", Object.keys(data.xd).length, "ca tasks:", Object.keys(data.ca).length);
