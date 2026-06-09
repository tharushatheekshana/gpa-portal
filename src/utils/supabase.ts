import { createClient } from '@supabase/supabase-js';
import { type Student, type Semester, type Course, GRADE_POINTS } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

function formatSemesterName(id: string): string {
  const numMatch = id.match(/\d+/);
  if (!numMatch) return id;
  const num = parseInt(numMatch[0]);
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'][num - 1];
  return roman ? `Semester ${roman}` : id;
}

export async function checkStudentExists(studentId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('students')
    .select('id')
    .eq('id', studentId)
    .single();
    
  if (error || !data) return false;
  return true;
}

export async function fetchStudentData(studentId: string): Promise<Student | null> {
  // 1. Fetch student record
  const { data: studentRecord, error: studentError } = await supabase
    .from('students')
    .select('*')
    .eq('id', studentId)
    .single();

  if (studentError || !studentRecord) {
    return null;
  }

  // 2. Fetch all grades for this student
  const { data: gradeRecords, error: gradesError } = await supabase
    .from('grades')
    .select('*')
    .eq('student_id', studentId);

  if (gradesError || !gradeRecords) {
    return null;
  }

  // 3. Fetch curriculum
  const { data: curriculumRecords, error: curriculumError } = await supabase
    .from('curriculum')
    .select('*');

  if (curriculumError || !curriculumRecords) {
    return null;
  }

  // Group grades by semester
  const gradesBySemester: Record<string, typeof gradeRecords> = {};
  for (const record of gradeRecords) {
    if (!gradesBySemester[record.semester_id]) {
      gradesBySemester[record.semester_id] = [];
    }
    gradesBySemester[record.semester_id].push(record);
  }

  let totalCredits = 0;
  let gpaCredits = 0;
  let totalGradePoints = 0;

  const semesters: Semester[] = Object.keys(gradesBySemester).map(semesterId => {
    let semTotalCredits = 0;
    let semGpaCredits = 0;
    let semGradePoints = 0;

    const semesterGrades = gradesBySemester[semesterId];

    const courses: Course[] = semesterGrades.map(sg => {
      const curriculumCourse = curriculumRecords.find(c => c.code === sg.course_code);
      if (!curriculumCourse) {
        throw new Error(`Course ${sg.course_code} not found in curriculum`);
      }

      const points = GRADE_POINTS[sg.grade] !== undefined ? GRADE_POINTS[sg.grade] : 0;
      
      semTotalCredits += curriculumCourse.credits;
      
      if (!curriculumCourse.is_non_gpa) {
        semGpaCredits += curriculumCourse.credits;
        semGradePoints += (points * curriculumCourse.credits);
      }

      return {
        code: curriculumCourse.code,
        name: curriculumCourse.title,
        credits: curriculumCourse.credits,
        grade: sg.grade,
        gradePoints: points,
        isNonGPA: curriculumCourse.is_non_gpa
      };
    }).sort((a, b) => {
      const aHasHyphen = a.code.includes('-');
      const bHasHyphen = b.code.includes('-');
      if (aHasHyphen !== bHasHyphen) {
        return aHasHyphen ? 1 : -1;
      }
      return a.code.localeCompare(b.code);
    });

    const gpa = semGpaCredits > 0 ? (semGradePoints / semGpaCredits) : 0;

    totalCredits += semTotalCredits;
    gpaCredits += semGpaCredits;
    totalGradePoints += semGradePoints;

    return {
      id: semesterId,
      name: formatSemesterName(semesterId),
      courses,
      gpa,
      credits: semTotalCredits,
      gpaCredits: semGpaCredits
    };
  }).sort((a, b) => {
    const getOrder = (id: string) => {
      const numMatch = id.match(/\d+/);
      return numMatch ? parseInt(numMatch[0]) : 99;
    };
    return getOrder(a.id) - getOrder(b.id);
  });

  const cgpa = gpaCredits > 0 ? (totalGradePoints / gpaCredits) : 0;

  return {
    studentId: studentRecord.id,
    name: studentRecord.name,
    nameWithInitials: studentRecord.name_with_initials,
    program: studentRecord.program,
    cgpa,
    totalCredits,
    gpaCredits,
    semesters
  };
}

export async function fetchAllStudentsBasic() {
  const { data, error } = await supabase
    .from('students')
    .select('id, name, program')
    .order('id');
    
  if (error || !data) return [];
  return data;
}

export async function updateStudentGrade(studentId: string, courseCode: string, newGrade: string) {
  // Check if grade exists
  const { data: existing } = await supabase
    .from('grades')
    .select('id')
    .eq('student_id', studentId)
    .eq('course_code', courseCode)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('grades')
      .update({ grade: newGrade })
      .eq('id', existing.id);
    return !error;
  } else {
    // If we need to insert a grade that didn't exist before, we might need semester_id.
    // For safety, let's just assume we only update existing grades for now.
    // To properly insert, we need the course's semester. Let's find it.
    const { data: curriculumCourse } = await supabase
      .from('curriculum')
      .select('semester_id')
      .eq('code', courseCode)
      .single();
      
    if (!curriculumCourse) return false;

    const { error } = await supabase
      .from('grades')
      .insert({
        student_id: studentId,
        course_code: courseCode,
        semester_id: curriculumCourse.semester_id,
        grade: newGrade
      });
    return !error;
  }
}
