const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    console.log('Checking Session 1...');
    const session = await prisma.session.findUnique({
        where: { id: 1 },
        include: { subject: true }
    });
    console.log('Session 1:', session);
}

check()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
