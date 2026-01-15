import { prisma } from '../lib/prisma';

async function main() {
    console.log('Ending ALL active sessions...');

    const result = await prisma.session.updateMany({
        where: { isActive: true },
        data: {
            isActive: false,
            endTime: new Date()
        }
    });

    console.log(`Ended ${result.count} active sessions.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
