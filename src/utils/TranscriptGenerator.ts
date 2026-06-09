import jsPDF from 'jspdf';
import { type Student } from '../types';

export const generateTranscriptPDF = (student: Student) => {
  const doc = new jsPDF();
  
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Unofficial Academic Transcript', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${student.name}`, 20, 40);
  doc.text(`Student ID: ${student.studentId}`, 20, 48);
  
  doc.text(`Cumulative GPA: ${student.cgpa.toFixed(2)}`, 190, 40, { align: 'right' });
  doc.text(`Total GPA Credits: ${student.gpaCredits}`, 190, 48, { align: 'right' });
  doc.text(`Total Modules: ${student.semesters.reduce((acc, sem) => acc + sem.courses.length, 0)}`, 190, 56, { align: 'right' });
  
  doc.setLineWidth(0.5);
  doc.line(20, 65, 190, 65);
  
  let y = 80;
  
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
