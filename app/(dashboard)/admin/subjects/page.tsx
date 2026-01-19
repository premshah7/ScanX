import { prisma } from "@/lib/prisma";
import AddSubjectForm from "@/components/admin/AddSubjectForm";
import SubjectList from "@/components/admin/SubjectList";

export default async function SubjectsPage() {
    const [subjects, facultyList] = await Promise.all([
        prisma.subject.findMany({
            include: {
                faculty: {
                    include: { user: true }
                },
                _count: {
                    select: { students: true }
                }
            },
            orderBy: { id: 'desc' }
        }),
        prisma.faculty.findMany({
            include: { user: true }
        })
    ]);

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Subjects</h1>
                <AddSubjectForm facultyList={facultyList} />
            </div>

            <SubjectList subjects={subjects} facultyList={facultyList} />
        </div>
    );
}
