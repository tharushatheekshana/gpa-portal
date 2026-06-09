import { useState } from 'react';
import { type Student } from '../types';
import { SemesterResults } from './SemesterResults';
import { Analytics } from './Analytics';
import { generateTranscriptPDF } from '../utils/TranscriptGenerator';
import { GpaCalculationModal } from './GpaCalculationModal';
import './Dashboard.css';

interface DashboardProps {
  student: Student;
  onLogout: () => void;
}

export function Dashboard({ student, onLogout }: DashboardProps) {
  const [isGpaModalOpen, setIsGpaModalOpen] = useState(false);

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav glass-panel">
        <div className="nav-brand">
          <h2 className="text-gradient">GPA Portal</h2>
        </div>
        <div className="nav-user" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="user-info">
            <span className="user-name">{student.name}</span>
            <span className="user-id">{student.studentId}</span>
          </div>
          
          <button 
            className="notification-btn"
            title="Download Transcript"
            onClick={() => generateTranscriptPDF(student)}
            style={{
              background: 'transparent', border: 'none', fontSize: '1.5rem',
              cursor: 'pointer', padding: '8px', color: '#60a5fa',
              transition: 'transform 0.2s ease'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span style={{ filter: 'drop-shadow(0 0 8px #60a5fa)' }}>📥</span>
          </button>
          

          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </nav>

      <main className="dashboard-main">
        <div className="welcome-section animate-fade-in">
          <h1>Welcome back, <span className="text-gradient">{student.nameWithInitials || student.name.split(' ')[0]}</span></h1>
          <p className="program-name">
            {student.program}
          </p>
        </div>

        <div className="progress-section animate-fade-in" style={{ animationDelay: '0.05s', marginBottom: '2rem' }}>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontWeight: 'bold' }}>Degree Progress</span>
              <span style={{ color: 'var(--text-secondary)' }}>{student.totalCredits} / 120 Credits</span>
            </div>
            <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${Math.min(100, (student.totalCredits / 120) * 100)}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
                borderRadius: '6px',
                transition: 'width 1s ease-out'
              }} />
            </div>
          </div>
        </div>

        <div className="stats-grid animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="stat-card glass-panel gpa-highlight-card" style={{ position: 'relative' }}>
            <button 
              onClick={() => setIsGpaModalOpen(true)}
              title="How is this calculated?"
              style={{
                position: 'absolute', top: '15px', right: '15px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%',
                width: '28px', height: '28px', color: 'rgba(255,255,255,0.7)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s ease', padding: 0
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </button>
            <div className="stat-label">Cumulative GPA</div>
            <div className="stat-value text-gradient gpa-glow">{student.cgpa.toFixed(2)}</div>
            <div className="stat-desc">Out of 4.00</div>
          </div>
          
          <div className="stat-card glass-panel">
            <div className="stat-label">Total Credits</div>
            <div className="stat-value">{student.totalCredits}</div>
            <div className="stat-desc">{student.gpaCredits} GPA Credits</div>
          </div>
          
          <div className="stat-card glass-panel">
            <div className="stat-label">Courses Completed</div>
            <div className="stat-value standing-good">
              {student.semesters.reduce((acc, sem) => acc + sem.courses.length, 0)}
            </div>
            <div className="stat-desc">Total modules taken</div>
          </div>
        </div>

        <Analytics student={student} />

        <div className="classifications-section animate-fade-in" style={{ animationDelay: '0.2s', marginBottom: '2rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>Degree Classifications</h3>
            <div className="classifications-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
              
              <div style={{ padding: '1rem', background: student.cgpa >= 3.70 ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255,255,255,0.03)', borderRadius: '8px', border: `1px solid rgba(74, 222, 128, ${student.cgpa >= 3.70 ? '0.8' : '0.2'})`, position: 'relative', boxShadow: student.cgpa >= 3.70 ? '0 0 15px rgba(74, 222, 128, 0.2)' : 'none' }}>
                {student.cgpa >= 3.70 && <span style={{position: 'absolute', top: '-10px', right: '-10px', background: '#4ade80', color: '#000', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'}}>You are here</span>}
                <div style={{ color: '#4ade80', fontWeight: 'bold', marginBottom: '0.25rem' }}>First Class</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>CGPA ≥ 3.70</div>
              </div>

              <div style={{ padding: '1rem', background: (student.cgpa >= 3.30 && student.cgpa < 3.70) ? 'rgba(96, 165, 250, 0.1)' : 'rgba(255,255,255,0.03)', borderRadius: '8px', border: `1px solid rgba(96, 165, 250, ${(student.cgpa >= 3.30 && student.cgpa < 3.70) ? '0.8' : '0.2'})`, position: 'relative', boxShadow: (student.cgpa >= 3.30 && student.cgpa < 3.70) ? '0 0 15px rgba(96, 165, 250, 0.2)' : 'none' }}>
                {(student.cgpa >= 3.30 && student.cgpa < 3.70) && <span style={{position: 'absolute', top: '-10px', right: '-10px', background: '#60a5fa', color: '#000', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'}}>You are here</span>}
                <div style={{ color: '#60a5fa', fontWeight: 'bold', marginBottom: '0.25rem' }}>Second Upper</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>CGPA 3.30 - 3.69</div>
              </div>

              <div style={{ padding: '1rem', background: (student.cgpa >= 2.70 && student.cgpa < 3.30) ? 'rgba(251, 191, 36, 0.1)' : 'rgba(255,255,255,0.03)', borderRadius: '8px', border: `1px solid rgba(251, 191, 36, ${(student.cgpa >= 2.70 && student.cgpa < 3.30) ? '0.8' : '0.2'})`, position: 'relative', boxShadow: (student.cgpa >= 2.70 && student.cgpa < 3.30) ? '0 0 15px rgba(251, 191, 36, 0.2)' : 'none' }}>
                {(student.cgpa >= 2.70 && student.cgpa < 3.30) && <span style={{position: 'absolute', top: '-10px', right: '-10px', background: '#fbbf24', color: '#000', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'}}>You are here</span>}
                <div style={{ color: '#fbbf24', fontWeight: 'bold', marginBottom: '0.25rem' }}>Second Lower</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>CGPA 2.70 - 3.29</div>
              </div>

              <div style={{ padding: '1rem', background: (student.cgpa >= 2.00 && student.cgpa < 2.70) ? 'rgba(156, 163, 175, 0.1)' : 'rgba(255,255,255,0.03)', borderRadius: '8px', border: `1px solid rgba(156, 163, 175, ${(student.cgpa >= 2.00 && student.cgpa < 2.70) ? '0.8' : '0.2'})`, position: 'relative', boxShadow: (student.cgpa >= 2.00 && student.cgpa < 2.70) ? '0 0 15px rgba(156, 163, 175, 0.2)' : 'none' }}>
                {(student.cgpa >= 2.00 && student.cgpa < 2.70) && <span style={{position: 'absolute', top: '-10px', right: '-10px', background: '#9ca3af', color: '#000', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'}}>You are here</span>}
                <div style={{ color: '#9ca3af', fontWeight: 'bold', marginBottom: '0.25rem' }}>Pass</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>CGPA 2.00 - 2.69</div>
              </div>

            </div>
          </div>
        </div>

        <div className="results-section animate-fade-in" style={{ animationDelay: '0.25s', marginBottom: '2rem' }}>
          <h2 className="section-title">Academic Record</h2>
          <div className="semesters-list">
            {student.semesters.map(semester => (
              <SemesterResults key={semester.id} semester={semester} />
            ))}
          </div>
        </div>
      </main>

      <GpaCalculationModal 
        isOpen={isGpaModalOpen} 
        onClose={() => setIsGpaModalOpen(false)} 
      />
    </div>
  );
}
