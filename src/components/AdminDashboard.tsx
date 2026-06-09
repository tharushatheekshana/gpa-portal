import { useState, useEffect } from 'react';
import { fetchAllStudentsBasic, fetchStudentData, updateStudentGrade } from '../utils/supabase';
import { type Student } from '../types';
import './AdminDashboard.css';
import '../components/Dashboard.css'; // Reuse some Dashboard styles
import '../components/SemesterResults.css';

interface AdminDashboardProps {
  onLogout: () => void;
}

interface StudentBasic {
  id: string;
  name: string;
  program: string;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [students, setStudents] = useState<StudentBasic[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentBasic[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  
  const [editingCourse, setEditingCourse] = useState<string | null>(null);
  const [tempGrade, setTempGrade] = useState<string>('');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setIsLoading(true);
    const data = await fetchAllStudentsBasic();
    setStudents(data);
    setFilteredStudents(data);
    setIsLoading(false);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearch(query);
    const filtered = students.filter(s => 
      s.id.toLowerCase().includes(query) || 
      s.name.toLowerCase().includes(query)
    );
    setFilteredStudents(filtered);
  };

  const openStudentModal = async (studentId: string) => {
    setIsModalLoading(true);
    // Show modal immediately with loading state
    setSelectedStudent({ studentId } as any); // Temporary stub
    const data = await fetchStudentData(studentId);
    if (data) {
      setSelectedStudent(data);
    }
    setIsModalLoading(false);
  };

  const closeStudentModal = () => {
    setSelectedStudent(null);
    setEditingCourse(null);
  };

  const handleEditClick = (courseCode: string, currentGrade: string) => {
    setEditingCourse(courseCode);
    setTempGrade(currentGrade);
  };

  const handleSaveGrade = async (studentId: string, courseCode: string) => {
    const success = await updateStudentGrade(studentId, courseCode, tempGrade);
    if (success) {
      // Re-fetch student data to update the UI
      setEditingCourse(null);
      const data = await fetchStudentData(studentId);
      if (data) {
        setSelectedStudent(data);
      }
    } else {
      alert("Failed to update grade");
    }
  };

  return (
    <div className="admin-dashboard dashboard-container">
      <nav className="dashboard-nav glass-panel">
        <div className="nav-brand">
          <h2 className="text-gradient">Admin Dashboard</h2>
        </div>
        <div className="nav-user">
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </nav>

      <main className="admin-main">
        <div className="admin-header">
          <h1>Student Directory</h1>
        </div>

        <div className="search-container animate-fade-in">
          <input 
            type="text" 
            placeholder="Search by ID or Name..." 
            value={search}
            onChange={handleSearch}
            className="search-input"
          />
        </div>

        {isLoading ? (
          <div className="loading-spinner">Loading students...</div>
        ) : (
          <div className="students-grid animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {filteredStudents.map(student => (
              <div 
                key={student.id} 
                className="student-card glass-panel"
                onClick={() => openStudentModal(student.id)}
              >
                <div className="student-id">{student.id}</div>
                <div className="student-name">{student.name}</div>
                <div className="student-program">{student.program}</div>
              </div>
            ))}
            {filteredStudents.length === 0 && (
              <div>No students found.</div>
            )}
          </div>
        )}
      </main>

      {selectedStudent && (
        <div className="student-detail-overlay" onClick={closeStudentModal}>
          <div className="student-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="text-gradient" style={{ margin: 0 }}>
                  {selectedStudent.name || selectedStudent.studentId}
                </h2>
                {!isModalLoading && <span style={{ color: '#94a3b8' }}>ID: {selectedStudent.studentId} | CGPA: {selectedStudent.cgpa?.toFixed(2)}</span>}
              </div>
              <button className="close-btn" onClick={closeStudentModal}>&times;</button>
            </div>
            
            <div className="modal-content">
              {isModalLoading ? (
                <div className="loading-spinner">Loading student records...</div>
              ) : (
                <div className="semesters-list">
                  {selectedStudent.semesters?.map(semester => (
                    <div key={semester.id} className="semester-card glass-panel animate-fade-in">
                      <div className="semester-header">
                        <h3 className="semester-title">{semester.name}</h3>
                        <div className="semester-stats">
                          <div className="stat">
                            <span className="stat-label">GPA</span>
                            <span className="stat-value">{semester.gpa.toFixed(2)}</span>
                          </div>
                          <div className="stat">
                            <span className="stat-label">Credits</span>
                            <span className="stat-value">{semester.credits}</span>
                          </div>
                        </div>
                      </div>

                      <div className="courses-table-wrapper">
                        <table className="courses-table">
                          <thead>
                            <tr>
                              <th>Course Code</th>
                              <th>Course Name</th>
                              <th>Credits</th>
                              <th>Grade</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {semester.courses.map(course => (
                              <tr key={course.code}>
                                <td>{course.code}</td>
                                <td>
                                  {course.name}
                                  {course.isNonGPA && <span className="non-gpa-badge" style={{ marginLeft: '8px', fontSize: '0.7rem', padding: '2px 4px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>Non-GPA</span>}
                                </td>
                                <td>{course.credits}</td>
                                <td>
                                  {editingCourse === course.code ? (
                                    <select 
                                      className="edit-grade-select"
                                      value={tempGrade}
                                      onChange={(e) => setTempGrade(e.target.value)}
                                    >
                                      <option value="A+">A+</option>
                                      <option value="A">A</option>
                                      <option value="A-">A-</option>
                                      <option value="B+">B+</option>
                                      <option value="B">B</option>
                                      <option value="B-">B-</option>
                                      <option value="C+">C+</option>
                                      <option value="C">C</option>
                                      <option value="C-">C-</option>
                                      <option value="D+">D+</option>
                                      <option value="D">D</option>
                                      <option value="E">E</option>
                                      <option value="AB">AB</option>
                                    </select>
                                  ) : (
                                    <span className={"grade-badge grade-" + course.grade.replace(/[-+]/g, '')}>
                                      {course.grade}
                                    </span>
                                  )}
                                </td>
                                <td>
                                  {editingCourse === course.code ? (
                                    <div className="course-actions">
                                      <button 
                                        className="save-btn" 
                                        onClick={() => handleSaveGrade(selectedStudent.studentId, course.code)}
                                      >
                                        Save
                                      </button>
                                      <button 
                                        className="close-btn"
                                        style={{ fontSize: '1rem', marginLeft: '0.5rem' }}
                                        onClick={() => setEditingCourse(null)}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <button 
                                      className="edit-btn" 
                                      onClick={() => handleEditClick(course.code, course.grade)}
                                    >
                                      Edit
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                  {selectedStudent.semesters?.length === 0 && (
                    <div style={{ color: '#94a3b8' }}>No grades recorded yet.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
