
import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

async function main() {
    console.log("Fetching active session...");
    const session = await prisma.session.findFirst({
        where: { isActive: true },
        include: { subject: true }
    });

    if (!session) {
        console.error("No active session found! Please start a session in the Faculty Dashboard first.");
        return;
    }

    console.log(`Found Session: ${session.id} (${session.subject.name})`);

    console.log("Fetching students...");
    const students = await prisma.student.findMany({
        take: 50, // Test with 50 students on same IP
        include: { user: true }
    });

    const studentIds = students.map(s => s.userId);

    // Create output format for k6
    const output = `export const SESSION_ID = ${session.id};\nexport const STUDENT_IDS = ${JSON.stringify(studentIds)};`;

    fs.writeFileSync("loadtest_data.js", output);
    console.log("Data written to loadtest_data.js");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
