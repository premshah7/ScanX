import { prisma } from '../lib/prisma';

async function main() {
    console.log('Checking for ANY active sessions...');
    const activeSessions = await prisma.session.findMany({
        where: { isActive: true },
        include: { subject: true }
    });

    if (activeSessions.length === 0) {
        console.log("No active sessions found.");
    } else {
        console.log(`Found ${activeSessions.length} active sessions:`);
        activeSessions.forEach(s => {
            console.log(`- Session ID: ${s.id} | Subject: ${s.subject.name} | Started: ${s.startTime}`);
        });
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
