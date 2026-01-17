
import { jsPDF } from "jspdf";
import fs from "fs";
import path from "path";

// Polyfill for btoa/atob in Node.js (sometimes needed by jsPDF)
if (typeof global.btoa === 'undefined') {
    global.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
}
if (typeof global.atob === 'undefined') {
    global.atob = (b64Encoded) => Buffer.from(b64Encoded, 'base64').toString('binary');
}

async function generate() {
    console.log("Generating Mock PDFs...");

    // 1. Student Mock Data
    // Format: Name Email EnrollmentNo RollNo
    // Note: The parser splits by whitespace.
    // Logic: Name=BeforeEmail, Roll=AfterEmail[0], Enroll=AfterEmail[1]
    const students = [
        "Alice_Student alice.test@example.com 1001 ENR001",
        "Bob_Builder bob.test@example.com 1002 ENR002",
        "Charlie_Chaplin charlie.test@example.com 1003 ENR003",
        "David_Beckham david.test@example.com 1004 ENR004",
        "Eve_Polastri eve.test@example.com 1005 ENR005"
    ];

    const docStudents = new jsPDF();
    docStudents.setFontSize(12);
    docStudents.text("Mock Student Data for Bulk Upload", 10, 10);
    docStudents.text("Format: Name Email RollNo EnrollmentNo", 10, 20);

    let y = 30;
    students.forEach(line => {
        docStudents.text(line, 10, y);
        y += 10;
    });

    const studentPdfPath = path.resolve(process.cwd(), "mock_students.pdf");
    fs.writeFileSync(studentPdfPath, Buffer.from(docStudents.output('arraybuffer')));
    console.log(`Created: ${studentPdfPath}`);

    // 2. Faculty Mock Data
    // Format: Name Email
    const faculty = [
        "Dr.Strange strange.doc@example.com",
        "Prof.Xavier xavier.prof@example.com",
        "Tony_Stark ironman@example.com"
    ];

    const docFaculty = new jsPDF();
    docFaculty.setFontSize(12);
    docFaculty.text("Mock Faculty Data for Bulk Upload", 10, 10);
    docFaculty.text("Format: Name Email", 10, 20);

    y = 30;
    faculty.forEach(line => {
        docFaculty.text(line, 10, y);
        y += 10;
    });

    const facultyPdfPath = path.resolve(process.cwd(), "mock_faculty.pdf");
    fs.writeFileSync(facultyPdfPath, Buffer.from(docFaculty.output('arraybuffer')));
    console.log(`Created: ${facultyPdfPath}`);
}

generate().catch(console.error);
