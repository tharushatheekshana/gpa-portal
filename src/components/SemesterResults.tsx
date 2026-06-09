import { useState } from 'react';
import { type Semester } from '../types';
import './SemesterResults.css';

interface SemesterResultsProps {
  semester: Semester;
}

export function SemesterResults({ semester }: SemesterResultsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="semester-card glass-panel">
      <div 
        className="semester-header" 
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
      >
        <div className="semester-info">
          <h3>{semester.name}</h3>
          <p className="semester-meta">{semester.credits} Credits ({semester.gpaCredits} GPA Credits)</p>
        </div>
        <div className="semester-stats">
          <div className="gpa-badge" style={{ position: 'relative' }}>
            {semester.gpa >= 3.70 && (
              <div style={{ position: 'absolute', top: '-15px', right: '0', background: 'rgba(251, 191, 36, 0.2)', border: '1px solid #fbbf24', color: '#fbbf24', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '10px', whiteSpace: 'nowrap', fontWeight: 'bold', boxShadow: '0 0 10px rgba(251, 191, 36, 0.3)' }}>
                🏆 Dean's List
              </div>
            )}
            <span className="gpa-value">{semester.gpa.toFixed(2)}</span>
            <span className="gpa-label">GPA</span>
          </div>
          <button className={`expand-btn ${isExpanded ? 'expanded' : ''}`}>
            ▼
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="semester-content animate-fade-in">
          <div className="table-responsive">
            <table className="courses-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Course Name</th>
                  <th className="center-col">Credits</th>
                  <th className="center-col">Grade</th>
                  <th className="center-col">Points</th>
                </tr>
              </thead>
              <tbody>
                {semester.courses.map((course) => (
                  <tr key={course.code} className={course.isNonGPA ? 'non-gpa-row' : ''}>
                    <td className="course-code">{course.code}</td>
                    <td>
                      {course.name}
                      {course.isNonGPA && <span className="non-gpa-badge-small">Non-GPA</span>}
                    </td>
                    <td className="center-col">{course.credits}</td>
                    <td className="center-col">
                      <span className={`grade-badge grade-${course.grade.charAt(0)}`}>
                        {course.grade}
                      </span>
                    </td>
                    <td className="center-col">
                      {course.isNonGPA ? '-' : course.gradePoints.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
