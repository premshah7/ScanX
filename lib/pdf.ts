// @ts-ignore
import PDFParser from "pdf2json";

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, true); // 1 = text only

        pdfParser.on("pdfParser_dataError", (errData: any) => {
            console.error("PDF Parser Error:", errData.parserError);
            reject(new Error(errData.parserError));
        });

        pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
            try {
                // Config 1 gives simple text content
                const rawText = pdfParser.getRawTextContent();
                resolve(rawText);
            } catch (e) {
                reject(e);
            }
        });

        pdfParser.parseBuffer(buffer);
    });
}

export async function parsePdfToTable(buffer: Buffer): Promise<string[][]> {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser();

        pdfParser.on("pdfParser_dataError", (errData: any) => {
            reject(new Error(errData.parserError));
        });

        pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
            try {
                const allRows: string[][] = [];

                pdfData.Pages.forEach((page: any) => {
                    const texts = page.Texts;
                    const rows: Record<string, { x: number; text: string }[]> = {};
                    const tolerance = 0.5;

                    texts.forEach((t: any) => {
                        const y = t.y;
                        const textContent = decodeURIComponent(t.R[0].T);
                        const existingRowY = Object.keys(rows).find(key => Math.abs(parseFloat(key) - y) < tolerance);
                        const rowY = existingRowY ?? y.toString();

                        if (!rows[rowY]) {
                            rows[rowY] = [];
                        }

                        rows[rowY].push({ x: t.x, text: textContent });
                    });

                    const sortedY = Object.keys(rows).sort((a, b) => parseFloat(a) - parseFloat(b));

                    sortedY.forEach((y) => {
                        const rowItems = rows[y as keyof typeof rows];
                        if (rowItems) {
                            rowItems.sort((a, b) => a.x - b.x);
                            allRows.push(rowItems.map(i => i.text));
                        }
                    });
                });
                resolve(allRows);
            } catch (e) {
                reject(e);
            }
        });

        pdfParser.parseBuffer(buffer);
    });
}
