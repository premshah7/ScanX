import 'dotenv/config'
import { prisma } from '../lib/prisma'
import { Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

async function main() {
    const password = await bcrypt.hash('geoguard123', 10)

    // 1. Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@geoguard.com' },
        update: {},
        create: {
            email: 'admin@geoguard.com',
            name: 'Admin User',
            password,
            role: Role.ADMIN,
        },
    })
    console.log({ admin })

    // 2. Faculty
    const facultyUser = await prisma.user.upsert({
        where: { email: 'faculty@geoguard.com' },
        update: {},
        create: {
            email: 'faculty@geoguard.com',
            name: 'Dr. Smith',
            password,
            role: Role.FACULTY,
            faculty: {
                create: {}
            }
        },
        include: { faculty: true }
    })
    console.log({ facultyUser })

    // 3. Subject
    if (facultyUser.faculty) {
        // Create subject if not exists (using findFirst for simplicity as we don't have unique slug)
        let subject = await prisma.subject.findFirst({ where: { facultyId: facultyUser.faculty.id } });
        if (!subject) {
            subject = await prisma.subject.create({
                data: {
                    name: 'CS101: Intro to CS',
                    facultyId: facultyUser.faculty.id,
                    totalStudents: 60,
                }
            })
        }
        console.log('Subject:', subject.id)

        // 4. Session (Ensure at least one active session)
        const activeSession = await prisma.session.findFirst({
            where: { subjectId: subject.id, isActive: true }
        });

        if (!activeSession) {
            const session = await prisma.session.create({
                data: {
                    subjectId: subject.id,
                    isActive: true,
                    startTime: new Date(),
                }
            });
            console.log("Created Session with ID:", session.id);
        } else {
            console.log("Active Session exists:", activeSession.id);
        }
    }

    // 5. Student
    const studentUser = await prisma.user.upsert({
        where: { email: 'student@geoguard.com' },
        update: {},
        create: {
            email: 'student@geoguard.com',
            name: 'John Doe',
            password,
            role: Role.STUDENT,
            student: {
                create: {
                    rollNumber: 'CS2024001',
                    enrollmentNo: 'EN2024001',
                }
            }
        },
    })
    console.log({ studentUser })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
