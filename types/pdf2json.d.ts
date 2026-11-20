declare module "pdf2json" {
    import { EventEmitter } from "events";

    export default class PDFParser extends EventEmitter {
        constructor(context?: unknown, needRawText?: number | boolean);
        parseBuffer(buffer: Buffer): void;
        loadPDF(pdfFilePath: string, verbosity?: number): void;
        getRawTextContent(): string;
    }
}
