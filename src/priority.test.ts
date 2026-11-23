import { test } from "node:test";
import assert from "node:assert/strict";
import { computePriorities } from "./priority";
import type { ParsedSyllabus } from "./types";

const syllabus: ParsedSyllabus = {
  course_name: "TEST 101",
  assignments: [
    { name: "Homework 1", type: "homework", due_date: "2025-01-11", weight_percent: 5 },
    { name: "Midterm", type: "exam", due_date: "2025-01-20", weight_percent: 30 },
    { name: "Reading", type: "reading", due_date: null, weight_percent: null },
    { name: "Quiz 1", type: "quiz", due_date: "2025-01-10", weight_percent: null },
  ],
};

test("drops assignments without a due date", () => {
  const tasks = computePriorities(syllabus, "2025-01-10");
  assert.equal(tasks.length, 3);
  assert.ok(tasks.every((t) => t.name !== "Reading"));
});

test("computes days left, floored at half a day", () => {
  const tasks = computePriorities(syllabus, "2025-01-10");
  const byName = Object.fromEntries(tasks.map((t) => [t.name, t]));
  assert.equal(byName["Homework 1"].days_left, 1);
  assert.equal(byName["Midterm"].days_left, 10);
  assert.equal(byName["Quiz 1"].days_left, 0.5);
});

test("priority is urgency plus weight / 10, sorted descending", () => {
  const tasks = computePriorities(syllabus, "2025-01-10");
  const byName = Object.fromEntries(tasks.map((t) => [t.name, t]));
  assert.equal(byName["Homework 1"].priority, 1 / 1 + 5 / 10);
  assert.equal(byName["Midterm"].priority, 1 / 10 + 30 / 10);
  assert.equal(byName["Quiz 1"].priority, 1 / 0.5 + 0);
  assert.equal(byName["Quiz 1"].weight_percent, 0);
  assert.deepEqual(
    tasks.map((t) => t.name),
    ["Midterm", "Quiz 1", "Homework 1"]
  );
  assert.ok(tasks.every((t) => t.course_name === "TEST 101"));
});
