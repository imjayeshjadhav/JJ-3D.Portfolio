// Snapshots public GitHub stats into src/data/github.json at build time, so
// the site never calls GitHub at runtime. Runs as `prebuild`; on any failure
// it keeps the existing snapshot and exits cleanly.
import { readFile, writeFile } from "node:fs/promises";

const USER = "imjayeshjadhav";
const OUT = new URL("../src/data/github.json", import.meta.url);

const parseContributions = (html) => {
  // Counts live in <tool-tip for="contribution-day-component-W-D">N contributions on …</tool-tip>
  const counts = new Map();
  for (const m of html.matchAll(/<tool-tip[^>]*for="(contribution-day-component-[\d-]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
    const n = m[2].match(/^(\d+)\s+contribution/);
    counts.set(m[1], n ? Number(n[1]) : 0);
  }
  const days = [];
  for (const m of html.matchAll(/<td[^>]*data-date="([\d-]+)"[^>]*id="(contribution-day-component-[\d-]+)"[^>]*data-level="(\d)"/g)) {
    days.push({ date: m[1], level: Number(m[3]), count: counts.get(m[2]) ?? 0 });
  }
  return days.sort((a, b) => a.date.localeCompare(b.date));
};

try {
  const headers = { "User-Agent": `${USER}-portfolio-build` };
  const [userRes, calRes] = await Promise.all([
    fetch(`https://api.github.com/users/${USER}`, { headers }),
    fetch(`https://github.com/users/${USER}/contributions`, { headers }),
  ]);
  if (!userRes.ok || !calRes.ok) throw new Error(`GitHub responded ${userRes.status} / ${calRes.status}`);
  const user = await userRes.json();
  const days = parseContributions(await calRes.text());
  if (days.length < 300) throw new Error(`only parsed ${days.length} days`);

  const snapshot = {
    fetchedAt: new Date().toISOString(),
    publicRepos: user.public_repos,
    followers: user.followers,
    total: days.reduce((sum, d) => sum + d.count, 0),
    days,
  };
  await writeFile(OUT, JSON.stringify(snapshot));
  console.log(`github.json: ${days.length} days, ${snapshot.total} contributions`);
} catch (err) {
  const existing = await readFile(OUT, "utf8").catch(() => null);
  console.warn(`fetch-github skipped (${err.message}); ${existing ? "keeping existing snapshot" : "no snapshot yet"}`);
}
