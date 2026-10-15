// Snapshots public LeetCode stats into src/data/leetcode.json at build time.
// Runs as part of `prebuild`; on any failure it keeps the existing snapshot.
import { readFile, writeFile } from "node:fs/promises";

const USER = "14jayeshjadhav";
const OUT = new URL("../src/data/leetcode.json", import.meta.url);

const query = async (body) => {
  const res = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json", Referer: "https://leetcode.com" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`LeetCode responded ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
};

const calendarFor = async (year) => {
  const data = await query({
    query: `query($u: String!, $y: Int) { matchedUser(username: $u) { userCalendar(year: $y) { submissionCalendar } } }`,
    variables: { u: USER, y: year },
  });
  return JSON.parse(data.matchedUser.userCalendar.submissionCalendar);
};

try {
  const stats = await query({
    query: `query($u: String!) { matchedUser(username: $u) {
      profile { ranking }
      submitStatsGlobal { acSubmissionNum { difficulty count } }
      userCalendar { streak totalActiveDays }
    } }`,
    variables: { u: USER },
  });
  const user = stats.matchedUser;
  const solved = Object.fromEntries(user.submitStatsGlobal.acSubmissionNum.map((s) => [s.difficulty.toLowerCase(), s.count]));

  // The last 371 days (53 weeks), stitched from this year's and last year's calendars.
  const now = new Date();
  const year = now.getUTCFullYear();
  const byDate = new Map();
  for (const cal of [await calendarFor(year - 1), await calendarFor(year)]) {
    for (const [ts, n] of Object.entries(cal)) byDate.set(new Date(Number(ts) * 1000).toISOString().slice(0, 10), n);
  }
  const days = [];
  for (let i = 370; i >= 0; i--) {
    const d = new Date(Date.UTC(year, now.getUTCMonth(), now.getUTCDate() - i)).toISOString().slice(0, 10);
    days.push({ date: d, count: byDate.get(d) ?? 0 });
  }

  // Levels 1–4 split the active days into quartiles, like GitHub's graph.
  const active = days.map((d) => d.count).filter(Boolean).sort((a, b) => a - b);
  const q = (p) => active[Math.floor((active.length - 1) * p)] ?? 1;
  const cuts = [q(0.25), q(0.5), q(0.75)];
  for (const d of days) d.level = d.count === 0 ? 0 : 1 + cuts.filter((c) => d.count > c).length;

  const snapshot = {
    fetchedAt: now.toISOString(),
    username: USER,
    url: `https://leetcode.com/u/${USER}/`,
    solved,
    ranking: user.profile.ranking,
    streak: user.userCalendar.streak,
    activeDays: user.userCalendar.totalActiveDays,
    total: days.reduce((sum, d) => sum + d.count, 0),
    days,
  };
  await writeFile(OUT, JSON.stringify(snapshot));
  console.log(`leetcode.json: ${solved.all} solved, ${snapshot.total} submissions in the last year`);
} catch (err) {
  const existing = await readFile(OUT, "utf8").catch(() => null);
  console.warn(`fetch-leetcode skipped (${err.message}); ${existing ? "keeping existing snapshot" : "no snapshot yet"}`);
}
