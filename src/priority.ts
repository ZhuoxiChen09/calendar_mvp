import dayjs from "dayjs";
import type { ParsedSyllabus, PrioritizedTask } from "./types";

export function computePriorities(
  parsed: ParsedSyllabus,
  todayStr: string | null = null
): PrioritizedTask[] {
  const today = todayStr ? dayjs(todayStr) : dayjs();

  return parsed.assignments
    .filter((a) => a.due_date) // drop those with no due date for MVP
    .map((a) => {
      const due = dayjs(a.due_date as string);
      const daysLeft = Math.max(due.diff(today, "day"), 0.5);
      const weight = a.weight_percent ?? 0;

      const urgency = 1 / daysLeft;
      const importance = weight / 10; // tweak this later
      const priority = urgency + importance;

      return {
        course_name: parsed.course_name,
        name: a.name,
        type: a.type,
        due_date: a.due_date,
        weight_percent: weight,
        days_left: daysLeft,
        priority,
      } as PrioritizedTask;
    })
    .sort((a, b) => b.priority - a.priority);
}
