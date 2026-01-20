
import { extractTextFromPdf } from "../lib/pdf";
import fs from "fs";
import path from "path";

async function main() {
    const filePath = path.join(process.cwd(), "public", "test.pdf");
    const buffer = fs.readFileSync(filePath);

    console.log("Reading file:", filePath);
    try {
        const text = await extractTextFromPdf(buffer);
        console.log("--- START PDF TEXT ---");
        console.log(text);
        console.log("--- END PDF TEXT ---");

        // Also dump to a file for easier inspection if needed
        fs.writeFileSync("scripts/pdf_dump.txt", text);
        console.log("Text dumped to scripts/pdf_dump.txt");
    } catch (err) {
        console.error("Error extracting text:", err);
    }
}

main();
