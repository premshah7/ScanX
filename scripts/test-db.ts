
import { prisma } from "../lib/prisma";

async function main() {
    try {
        console.log("Testing DB connection...");
        const count = await prisma.user.count();
        console.log("Successfully connected. User count:", count);
    } catch (e) {
        console.error("DB Connection Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
