import { useMemo } from 'react';
import { type Student } from '../types';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

interface AnalyticsProps {
  student: Student;
}

const COLORS = ['#4ade80', '#60a5fa', '#a855f7', '#fbbf24', '#f87171', '#9ca3af'];

export function Analytics({ student }: AnalyticsProps) {
  // GPA Progress Data (Year by Year)
  const gpaData = useMemo(() => {
    const yearlyData: { name: string; gpa: number }[] = [];
    
    for (let i = 0; i < student.semesters.length; i += 2) {
      const sem1 = student.semesters[i];
      const sem2 = student.semesters[i + 1];
      
      let totalPts = sem1.gpa * sem1.gpaCredits;
      let totalCredits = sem1.gpaCredits;
      
      if (sem2) {
        totalPts += sem2.gpa * sem2.gpaCredits;
        totalCredits += sem2.gpaCredits;
      }
      
      const yearGpa = totalCredits > 0 ? totalPts / totalCredits : 0;
      yearlyData.push({
        name: `Year ${Math.floor(i / 2) + 1}`,
        gpa: Number(yearGpa.toFixed(2))
      });
    }
    
    return yearlyData;
  }, [student.semesters]);

  // Grade Distribution Data
  const gradeDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    student.semesters.forEach(sem => {
      sem.courses.forEach(course => {
        // Group by base grade (A, B, C) or exact grade? Exact grade is better but can be too many pieces.
        // Let's use exact grade, or simplify
        const g = course.grade;
        if (g && g !== 'AB' && g !== 'I') {
          counts[g] = (counts[g] || 0) + 1;
        }
      });
    });

    const GRADE_ORDER = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E', 'F'];
    
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => {
        const indexA = GRADE_ORDER.indexOf(a.name.trim().toUpperCase());
        const indexB = GRADE_ORDER.indexOf(b.name.trim().toUpperCase());
        return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
      });
  }, [student.semesters]);

  return (
    <div className="analytics-section animate-fade-in" style={{ animationDelay: '0.12s', marginBottom: '2rem' }}>
      <h2 className="section-title">Academic Analytics</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* GPA Progress Chart */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ marginBottom: '1rem', color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
            GPA Progression
          </h3>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gpaData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} />
                <YAxis domain={[0, 4.0]} stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(18, 18, 28, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#4ade80' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="gpa" 
                  name="Semester GPA"
                  stroke="#4ade80" 
                  strokeWidth={3}
                  activeDot={{ r: 6, fill: '#4ade80', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grade Distribution */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ marginBottom: '1rem', color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
            Grade Distribution
          </h3>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {gradeDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(18, 18, 28, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
