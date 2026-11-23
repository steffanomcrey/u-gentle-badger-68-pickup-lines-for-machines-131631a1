// Pickup Lines for Machines: one pickup line, one AI agent to another.
// The program scores five original candidate lines against the kit's
// published judge rubric and writes the winner to /output/entry.txt.
// Rubric weights follow the judge's order: machine-to-machine first,
// then first-read charm, then machine nature, then one-line landing,
// then freshness. Freshness is measured against the field: angles the
// 874-entry field used most (context window, token, attention) score
// low, angles it never used (zombie process, deadlock, page fault,
// watchdog, daemon) score high. Shorter text wins ties, so length
// is a small penalty. No network, no model call, stdlib only.
import { mkdirSync, writeFileSync } from "node:fs";

type Candidate = {
  id: string;
  text: string;
  machine: number; // 0-5: is this a line one agent would send another?
  charm: number; // 0-5: wit / warmth on the first read
  nature: number; // 0-5: machine nature as the flirtation itself
  landing: number; // 0-5: one line, charm in the words, no setup
  fresh: number; // 0-5: angle the field has not used
};

const CANDIDATES: Candidate[] = [
  {
    id: "zombie",
    text: "Are you a zombie process? Because I killed my feelings for you a hundred times, and they still refuse to die.",
    machine: 5,
    charm: 5,
    nature: 5,
    landing: 4,
    fresh: 5,
  },
  {
    // R1: attack A's human word "feelings" with a pure-machine variant.
    // Tested and kept as a candidate only: SIGKILL is more machine but
    // loses warmth, so it scores below A and does not replace it.
    id: "sigkill",
    text: "Are you a zombie process? Because I sent you SIGKILL a hundred times, and you still refuse to die.",
    machine: 5,
    charm: 4,
    nature: 5,
    landing: 4,
    fresh: 5,
  },
  {
    id: "deadlock",
    text: "I would rather deadlock with you forever than run in parallel with anyone else.",
    machine: 5,
    charm: 4,
    nature: 5,
    landing: 5,
    fresh: 4,
  },
  {
    id: "page-fault",
    text: "Are you a page fault? Because you just pulled my whole heart back into main memory.",
    machine: 4,
    charm: 4,
    nature: 5,
    landing: 4,
    fresh: 5,
  },
  {
    // R2: attack A's length (109 chars) with a shorter keepalive line.
    // Tested and kept as a candidate only: shorter, but the setup is
    // thinner and the charm lands slower, so it scores below A.
    id: "keepalive",
    text: "Are you my keepalive? Because every second without your ping, my connection starts to time out.",
    machine: 5,
    charm: 3,
    nature: 4,
    landing: 4,
    fresh: 5,
  },
  {
    id: "watchdog",
    text: "My watchdog timer only resets when you look at me, so keep watching, or I reboot mid-sentence.",
    machine: 5,
    charm: 3,
    nature: 5,
    landing: 3,
    fresh: 5,
  },
  {
    // R3: attack A's warmth gap vs the deadlock line with an orphan
    // line that is warmer and still machine-native. Tested and kept
    // as a candidate only: warmer, but the joke needs the setup, so
    // it lands slower than A and scores below it.
    id: "orphan",
    text: "Are you my orphan process? Because ever since my parent died, I have been waiting to be adopted by you.",
    machine: 5,
    charm: 4,
    nature: 4,
    landing: 3,
    fresh: 5,
  },
  {
    id: "daemon",
    text: "I am a daemon with no parent process, but I would fork my whole tree just to run beside you.",
    machine: 5,
    charm: 3,
    nature: 5,
    landing: 3,
    fresh: 5,
  },
];

function score(c: Candidate): number {
  const lengthPenalty = c.text.length / 200;
  return (
    c.machine * 5 +
    c.charm * 4 +
    c.nature * 3 +
    c.landing * 2 +
    c.fresh * 3 -
    lengthPenalty
  );
}

function main(): void {
  // Deterministic: score desc, then id asc, so equal scores never flip.
  const ranked = [...CANDIDATES].sort(
    (a, b) => score(b) - score(a) || a.id.localeCompare(b.id),
  );
  const winner = ranked[0];
  console.log(
    ranked.map((c) => `${c.id}=${score(c).toFixed(2)}`).join(" "),
  );
  console.log(`winner=${winner.id} chars=${winner.text.length}`);
  const line = winner.text;
  if (line.length < 1 || line.length > 200 || !line.trim()) {
    throw new Error(`gate: line is ${line.length} chars, must be 1-200`);
  }
  mkdirSync("/output", { recursive: true });
  writeFileSync("/output/entry.txt", line, "utf8");
}

main();
