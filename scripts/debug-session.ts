import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

console.log("DB URL exists:", !!process.env.DATABASE_URL);
if (process.env.DATABASE_URL) {
    console.log("DB URL starts with:", process.env.DATABASE_URL.substring(0, 10) + "...");
}

const prisma = new PrismaClient();

async function check() {
    console.log('Checking Session 1...');
    try {
        const session = await prisma.session.findUnique({
            where: { id: 1 },
            include: { subject: true }
        });
        console.log('Session 1:', session);
    } catch (err) {
        console.error("Query failed:", err);
    }
}

check()
    .finally(async () => {
        await prisma.$disconnect();
    });
