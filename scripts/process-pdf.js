
const fs = require('fs');
const PDFParser = require("pdf2json");
const { jsPDF } = require('jspdf');

const pdfParser = new PDFParser();

function generateOutput(students) {
    console.log(`Generating output for ${students.length} students...`);

    // 1. Generate PDF
    const doc = new jsPDF();
    doc.setFontSize(10);
    let y = 10;
    const lineHeight = 7;

    // Header
    const header = "Name Email RollNo EnrollmentNo";
    doc.text(header, 10, y);
    y += lineHeight;

    students.forEach((s, index) => {
        // Data Synthesis
        const email = `${s.enrollmentNo}@darshan.ac.in`;
        const rollNo = s.rollNo || (index + 1).toString();

        // Line Format: Name Email RollNo EnrollmentNo
        // Ensure name has no weird chars (and decode)
        let cleanName = s.name.replace(/[^a-zA-Z\s]/g, "").trim();
        // Remove extra spaces
        cleanName = cleanName.replace(/\s+/g, " ");

        const line = `${cleanName} ${email} ${rollNo} ${s.enrollmentNo}`;

        if (y > 280) {
            doc.addPage();
            y = 10;
            doc.text(header, 10, y);
            y += lineHeight;
        }

        doc.text(line, 10, y);
        y += lineHeight;
    });

    try {
        const pdfBytes = doc.output('arraybuffer');
        fs.writeFileSync('public/students.pdf', Buffer.from(pdfBytes));
        console.log("SUCCESS: Created public/students.pdf");
    } catch (e) {
        console.error("FAILED to write PDF:", e);
    }

    // 2. Generate CSV (Backup)
    try {
        const csvContent = "Name,Email,RollNumber,EnrollmentNo\n" +
            students.map((s, index) => {
                const email = `${s.enrollmentNo}@darshan.ac.in`;
                const rollNo = s.rollNo || (index + 1).toString();
                return `${s.name},${email},${rollNo},${s.enrollmentNo}`;
            }).join("\n");
        fs.writeFileSync('public/students.csv', csvContent);
        console.log("SUCCESS: Created public/students.csv");
    } catch (e) {
        console.error("FAILED to write CSV:", e);
    }
}

pdfParser.on("pdfParser_dataError", errData => console.error("PDF Parser Error:", errData.parserError));
pdfParser.on("pdfParser_dataReady", pdfData => {
    try {
        const students = [];

        pdfData.Pages.forEach((page, pageIndex) => {
            const texts = page.Texts;
            const rows = {};
            const tolerance = 0.5;

            texts.forEach(t => {
                const y = t.y;
                const textContent = decodeURIComponent(t.R[0].T);
                let rowY = Object.keys(rows).find(key => Math.abs(parseFloat(key) - y) < tolerance);
                if (!rowY) {
                    rowY = y;
                    rows[rowY] = [];
                }
                rows[rowY].push({ x: t.x, text: textContent });
            });

            const sortedY = Object.keys(rows).sort((a, b) => parseFloat(a) - parseFloat(b));

            sortedY.forEach((y, rowIndex) => {
                const rowItems = rows[y].sort((a, b) => a.x - b.x);
                // Debug to finding "101"
                if (rowIndex < 30) {
                    try {
                        const dData = JSON.stringify(rowItems.map(i => ({ x: i.x.toFixed(2), t: decodeURIComponent(i.text) })));
                        fs.appendFileSync('debug_rows.json', `ROW ${rowIndex}: ${dData}\n`);
                    } catch (e) { }
                }
                const fullText = rowItems.map(i => i.text).join(" ");

                // Match Enrollment (2 + 10 digits)
                const enrollmentMatch = fullText.match(/\b(2\d{10})\b/);

                if (enrollmentMatch) {
                    const enrollmentNo = enrollmentMatch[1];
                    const enrollItem = rowItems.find(i => i.text.includes(enrollmentNo));
                    const enrollX = enrollItem ? enrollItem.x : 0;

                    // Extract Roll Number (Look for 1-4 digit number)
                    const rollItem = rowItems.find(i => {
                        const t = decodeURIComponent(i.text).trim();
                        // Roll numbers are usually short integers (e.g. 101, 102)
                        return /^\d{1,4}$/.test(t);
                    });
                    const extractedRollNo = rollItem ? decodeURIComponent(rollItem.text).trim() : null;

                    // Name extraction
                    // Using X coordinate heuristic based on previous analysis
                    const nameParts = rowItems
                        .filter(i => i.x > (enrollX + 2) && i.x < 35)
                        .map(i => decodeURIComponent(i.text).trim())
                        .filter(t => t.length > 0 && !/^\d+$/.test(t)); // Filter out numbers from name

                    const name = nameParts.join(" ");

                    if (name.length > 2) {
                        students.push({ enrollmentNo, name, rollNo: extractedRollNo });
                    }
                }
            });
        });

        console.log(`\nProcessed ${pdfData.Pages.length} pages. Found ${students.length} students total.`);

        if (students.length > 0) {
            generateOutput(students);
        } else {
            console.error("No students extracted!");
        }

    } catch (e) {
        console.error("Processing logic error:", e);
    }
});

console.log("Starting PDF processing...");
pdfParser.loadPDF("./public/Programming Test Result.pdf");
