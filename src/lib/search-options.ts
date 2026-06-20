import type { SearchSelectOption } from "@/components/form";

/**
 * Option builders for the searchable entity pickers (SearchSelect /
 * RhfSearchSelect). Each centralises which unique fields are matched while the
 * user types, so search behaviour stays consistent across the app.
 */

const joinDot = (parts: Array<string | null | undefined>) =>
  parts.filter(Boolean).join(" · ") || undefined;

const joinSpace = (parts: Array<string | null | undefined>) =>
  parts.filter(Boolean).join(" ");

type StudentLike = {
  id: string;
  firstName: string;
  lastName?: string | null;
  studentCode: string;
  classLevel?: string | null;
  phone?: string | null;
  email?: string | null;
};

/** Search students by name, student code, phone, or email. */
export const studentSearchOptions = (
  students: readonly StudentLike[],
): SearchSelectOption[] =>
  students.map((s) => {
    const name = `${s.firstName} ${s.lastName ?? ""}`.trim();
    return {
      value: s.id,
      label: name || s.studentCode,
      description: joinDot([s.studentCode, s.classLevel]),
      keywords: joinSpace([s.studentCode, s.phone, s.email]),
    };
  });

type BatchLike = {
  id: string;
  name: string;
  classLevel?: string | null;
  courseName?: string | null;
  type?: string | null;
};

/** Search batches by name, class level, course, or type. */
export const batchSearchOptions = (
  batches: readonly BatchLike[],
): SearchSelectOption[] =>
  batches.map((b) => ({
    value: b.id,
    label: b.name,
    description: joinDot([b.classLevel, b.courseName]),
    keywords: joinSpace([b.classLevel, b.courseName, b.type]),
  }));
