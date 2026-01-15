import { prisma } from '../lib/prisma';

async function main() {
    console.log('Reactivating Session 1...');
    const session = await prisma.session.update({
        where: { id: 1 },
        data: {
            isActive: true,
            endTime: null
        }
    });
    console.log('Session 1 updated:', session);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
