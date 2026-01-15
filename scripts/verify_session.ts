import { prisma } from '../lib/prisma'; // Use the app's prisma instance

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
        // lib/prisma likely manages connection, but we can try to disconnect if needed, 
        // though the pool might handle it.
        await prisma.$disconnect();
    });
