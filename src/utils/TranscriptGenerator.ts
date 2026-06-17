import jsPDF from 'jspdf';
import { type Student } from '../types';

export const generateTranscriptPDF = (student: Student) => {
  const doc = new jsPDF();
  
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Unofficial Academic Transcript', 105, 20, { align: 'center' });
  
  let leftY = 40;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  // Name (left column, width 85mm)
  const nameLines = doc.splitTextToSize(`Name: ${student.name}`, 85);
  doc.text(nameLines, 20, leftY);
  leftY += nameLines.length * 6;
  
  // Student ID (left column)
  doc.text(`Student ID: ${student.studentId}`, 20, leftY);
  leftY += 6;
  
  // Program (left column, width 85mm)
  const programLines = doc.splitTextToSize(`Program: ${student.program}`, 85);
  doc.text(programLines, 20, leftY);
  leftY += programLines.length * 6;
  
  let rightY = 40;
  
  // Cumulative GPA (right column, aligned right at 190)
  doc.text('Cumulative GPA:', 115, rightY);
  doc.setFont('helvetica', 'bold');
  doc.text(student.cgpa.toFixed(2), 190, rightY, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  rightY += 6;
  
  // Total GPA Credits (right column)
  doc.text('Total GPA Credits:', 115, rightY);
  doc.text(student.gpaCredits.toString(), 190, rightY, { align: 'right' });
  rightY += 6;
  
  // Total Credits (right column)
  doc.text('Total Credits:', 115, rightY);
  doc.text(student.totalCredits.toString(), 190, rightY, { align: 'right' });
  rightY += 6;
  
  // Total Modules (right column)
  doc.text('Total Modules:', 115, rightY);
  const totalModules = student.semesters.reduce((acc, sem) => acc + sem.courses.length, 0).toString();
  doc.text(totalModules, 190, rightY, { align: 'right' });
  rightY += 6;
  
  // Calculate maximum height reached by either column to place the divider line and start semesters
  const maxHeaderY = Math.max(leftY, rightY);
  
  doc.setLineWidth(0.5);
  doc.line(20, maxHeaderY + 4, 190, maxHeaderY + 4);
  
  let y = maxHeaderY + 12;
  
  student.semesters.forEach(sem => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`${sem.name}`, 20, y);
    doc.setFontSize(12);
    doc.text(`GPA: ${sem.gpa.toFixed(2)}`, 160, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Code', 20, y);
    doc.text('Course Name', 50, y);
    doc.text('Cr', 150, y);
    doc.text('Gr', 165, y);
    doc.text('Pts', 180, y);
    y += 5;
    
    doc.setLineWidth(0.2);
    doc.line(20, y, 190, y);
    y += 8;
    
    doc.setFont('helvetica', 'normal');
    sem.courses.forEach(c => {
      if (y > 280) {
        doc.addPage();
        y = 20;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Code', 20, y);
        doc.text('Course Name', 50, y);
        doc.text('Cr', 150, y);
        doc.text('Gr', 165, y);
        doc.text('Pts', 180, y);
        y += 5;
        doc.line(20, y, 190, y);
        y += 8;
        doc.setFont('helvetica', 'normal');
      }
      
      doc.text(c.code, 20, y);
      const nameLines = doc.splitTextToSize(c.name + (c.isNonGPA ? ' (Non-GPA)' : ''), 90);
      doc.text(nameLines, 50, y);
      doc.text(c.credits.toString(), 150, y);
      doc.text(c.grade, 165, y);
      doc.text(c.isNonGPA ? '-' : c.gradePoints.toFixed(2), 180, y);
      
      y += (nameLines.length * 5) + 3;
    });
    
    y += 10;
  });
  
  doc.save(`${student.studentId}_Transcript.pdf`);
};
