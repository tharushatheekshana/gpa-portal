export interface Course {
  code: string;
  name: string;
  credits: number;
  grade: string;
  gradePoints: number;
  isNonGPA: boolean;
}

export interface Semester {
  id: string;
  name: string;
  courses: Course[];
  gpa: number;
  credits: number;
  gpaCredits: number;
}

export interface Student {
  studentId: string;
  name: string;
  nameWithInitials?: string;
  program: string;
  cgpa: number;
  totalCredits: number;
  gpaCredits: number;
  semesters: Semester[];
}

export const GRADE_POINTS: Record<string, number> = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D+': 1.3, 'D': 1.0, 'E': 0.0, 'AB': 0.0
};
