
import { extractTextFromPdf } from "../lib/pdf";
import fs from "fs";
import path from "path";
import { jsPDF } from "jspdf";

async function main() {
    const inputPath = path.join(process.cwd(), "public", "test.pdf");
    const outputPath = path.join(process.cwd(), "public", "formatted_upload.pdf");

    const buffer = fs.readFileSync(inputPath);
    const text = await extractTextFromPdf(buffer);
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);

    // --- PARSING LOGIC (From Strategy 1) ---
    interface ParsedUser {
        name: string;
        email: string;
        rollNumber: string;
        enrollmentNo: string;
    }

    const students: ParsedUser[] = [];
    const ignoredHeaders = ["Name", "Email", "Roll No.", "Enrollment No.", "Batch", "Break"];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (ignoredHeaders.some(h => line.includes(h))) continue;

        const emailMatch = line.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)$/);
        if (emailMatch) {
            const email = emailMatch[0];
            const name = line.substring(0, line.lastIndexOf(email)).trim();

            if (i + 1 < lines.length) {
                const nextLine = lines[i + 1].trim();
                const parts = nextLine.split(/\s+/);
                if (parts.length >= 2 && /^\d+$/.test(parts[0])) {
                    students.push({
                        name,
                        email,
                        rollNumber: parts[0],
                        enrollmentNo: parts.slice(1).join(" ")
                    });
                    i++; // Skip next line
                }
            }
        }
    }

    console.log(`Found ${students.length} students.`);

    // --- GENERATE PDF ---
    const doc = new jsPDF();
    let y = 10;
    const lineHeight = 7;
    const pageHeight = doc.internal.pageSize.height;

    doc.setFontSize(10);
    // Format: Name Email Roll Enroll
    // The legacy parser expects: [Name Parts...] [Email] [Roll] [Enroll] [Batch...]

    students.forEach((student) => {
        // Construct the line
        const line = `${student.name} ${student.email} ${student.rollNumber} ${student.enrollmentNo}`;

        if (y > pageHeight - 10) {
            doc.addPage();
            y = 10;
        }

        doc.text(line, 10, y);
        y += lineHeight;
    });

    const outputBuffer = Buffer.from(doc.output('arraybuffer'));
    fs.writeFileSync(outputPath, outputBuffer);
    console.log(`Created formatted PDF at: ${outputPath}`);
}

main();
