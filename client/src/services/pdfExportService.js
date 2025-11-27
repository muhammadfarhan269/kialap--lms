import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateAttendancePDF = (studentData, attendanceData, statisticsData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;

  // Header
  doc.setFontSize(16);
  doc.text('Attendance Certificate', pageWidth / 2, margin + 10, { align: 'center' });

  doc.setFontSize(11);
  doc.text('Learning Management System', pageWidth / 2, margin + 20, { align: 'center' });

  // Student Information
  doc.setFontSize(12);
  doc.text('Student Information', margin, margin + 35);
  doc.setFontSize(10);
  doc.text(`Name: ${studentData.firstName} ${studentData.lastName}`, margin, margin + 42);
  doc.text(`Student ID: ${studentData.studentId}`, margin, margin + 49);
  doc.text(`Email: ${studentData.email}`, margin, margin + 56);
  doc.text(`Course: ${studentData.courseName} (${studentData.courseCode})`, margin, margin + 63);

  // Attendance Statistics
  doc.setFontSize(12);
  doc.text('Attendance Summary', margin, margin + 77);

  const summaryData = [
    ['Metric', 'Count'],
    ['Total Sessions', statisticsData.total_sessions || 0],
    ['Present', statisticsData.present_count || 0],
    ['Absent', statisticsData.absent_count || 0],
    ['Late', statisticsData.late_count || 0],
    ['Excused', statisticsData.excused_count || 0],
    ['Attendance %', `${statisticsData.attendance_percentage || 0}%`],
  ];

  doc.autoTable({
    startY: margin + 82,
    head: [summaryData[0]],
    body: summaryData.slice(1),
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
  });

  const tableEndY = doc.lastAutoTable.finalY + 10;

  // Attendance Details Table
  doc.setFontSize(12);
  doc.text('Detailed Attendance Record', margin, tableEndY + 10);

  const tableData = attendanceData.map((record) => [
    record.attendance_date ? new Date(record.attendance_date).toLocaleDateString() : 'N/A',
    record.status || 'N/A',
    record.note || '-',
  ]);

  doc.autoTable({
    startY: tableEndY + 15,
    head: [['Date', 'Status', 'Notes']],
    body: tableData,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    didDrawPage: (data) => {
      // Footer
      const pageSize = doc.internal.pageSize;
      const pageHeight = pageSize.getHeight();
      const pageWidth = pageSize.getWidth();
      doc.setFontSize(10);
      doc.text(
        `Generated on: ${new Date().toLocaleDateString()}`,
        margin,
        pageHeight - 10
      );
    },
  });

  return doc.output('blob');
};

export const generateCourseAttendancePDF = (courseData, classStats) => {
  const doc = new jsPDF('l'); // landscape
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;

  // Header
  doc.setFontSize(16);
  doc.text('Course Attendance Report', pageWidth / 2, margin + 10, { align: 'center' });

  doc.setFontSize(11);
  doc.text(`Course: ${courseData.courseName} (${courseData.courseCode})`, margin, margin + 25);
  doc.text(`Professor: ${courseData.professorName}`, margin, margin + 32);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, margin + 39);

  // Class Statistics Table
  const tableData = classStats.map((student) => [
    student.student_id,
    `${student.first_name} ${student.last_name}`,
    student.total_sessions || 0,
    student.present_count || 0,
    student.absent_count || 0,
    student.late_count || 0,
    `${student.attendance_percentage || 0}%`,
  ]);

  doc.autoTable({
    startY: margin + 47,
    head: [['ID', 'Student Name', 'Total', 'Present', 'Absent', 'Late', 'Attendance %']],
    body: tableData,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
  });

  return doc.output('blob');
};

export const downloadPDF = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
