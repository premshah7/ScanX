import { prisma } from '../lib/prisma'; // Use app prisma
import { revalidatePath } from 'next/cache'; // Can't use in script, but we update DB.

async function main() {
    console.log('Ending Session 1...');
    const session = await prisma.session.update({
        where: { id: 1 },
        data: {
            isActive: false,
            endTime: new Date()
        }
    });
    console.log('Session 1 ended manually:', session);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
