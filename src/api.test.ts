import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createApp } from "./app";
import type { ParsedSyllabus } from "./types";

const syllabusText = "Example course. A practice quiz is due next year.";
const parsed: ParsedSyllabus = {
  course_name: "Example Course",
  assignments: [{ name: "Practice quiz", type: "quiz", due_date: "2099-01-01", weight_percent: 10 }],
};
const server = createApp(async (text) => {
  assert.equal(text, syllabusText);
  return parsed;
}).listen(0, "127.0.0.1");

let base: string;
before(async () => {
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    if (server.listening) resolve();
    else server.once("listening", resolve);
  });
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  base = `http://127.0.0.1:${address.port}`;
});
after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    server.closeIdleConnections();
  });
});

function parseText(body: object) {
  return fetch(`${base}/api/parse-syllabus-text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

test("rejects missing syllabus text", async () => {
  const response = await parseText({});
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error, "syllabusText is required");
});

test("rejects blank syllabus text", async () => {
  const response = await parseText({ syllabusText: "  " });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error, "Invalid syllabus text");
});

test("rejects uploads with a non-PDF media type", async () => {
  const form = new FormData();
  form.append("pdf", new Blob(["example"], { type: "text/plain" }), "example.txt");
  const response = await fetch(`${base}/api/parse-syllabus-pdf`, { method: "POST", body: form });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error, "Invalid file type");
});

test("parses text using the injected extractor", async () => {
  const response = await parseText({ syllabusText });
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.course, parsed.course_name);
  assert.equal(data.totalTasks, 1);
  assert.equal(data.tasks[0].name, "Practice quiz");
});
