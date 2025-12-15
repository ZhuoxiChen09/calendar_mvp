export type AssignmentType = "homework" | "exam" | "project" | "quiz" | "reading";

export interface Assignment {
  name: string;
  type: AssignmentType;
  due_date: string | null;
  weight_percent: number | null;
}

export interface ParsedSyllabus {
  course_name: string;
  assignments: Assignment[];
}

export interface PrioritizedTask {
  course_name: string;
  name: string;
  type: AssignmentType;
  due_date: string | null;
  weight_percent: number;
  days_left: number;
  priority: number;
}
