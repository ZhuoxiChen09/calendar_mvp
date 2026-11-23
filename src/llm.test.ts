import assert from "node:assert/strict";
import { test } from "node:test";
import { parseSyllabusResponse } from "./llm";

const valid = { name: "Quiz", type: "quiz", due_date: "2027-01-15", weight_percent: 10 };
const undated = { name: "Read", type: "reading", due_date: null, weight_percent: null };

test("keeps valid assignments and drops invalid entries", () => {
  const course_name = "Example Course";
  const content = JSON.stringify({
    course_name,
    assignments: [
      valid, undated, null, { ...valid, type: "other" },
      { ...valid, due_date: "2027-02-30" }, { ...valid, weight_percent: "10" },
    ],
  });
  assert.deepEqual(parseSyllabusResponse(content), { course_name, assignments: [valid, undated] });
});

test("rejects malformed JSON and invalid top-level data", () => {
  for (const content of ["{", "null", "[]", '{"course_name":12,"assignments":[]}']) {
    assert.throws(() => parseSyllabusResponse(content), /Failed to parse LLM response as JSON/);
  }
});
