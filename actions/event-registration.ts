"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/lib/email";
import { getRegistrationSuccessHtml, getRegistrationStatusUpdateHtml, getStudentRegistrationHtml } from "@/lib/email-templates";

// ─── Guest Registration ─────────────────────────────────────────────────

export async function registerForEvent(
    slug: string,
    guestData: {
        name: string;
        username: string;
        phone?: string;
        password?: string;
        enrollmentNo?: string;
        isStudent?: boolean;
    },
    formData: Record<string, any>
) {
    try {
        // 1. Find the event
        const event = await prisma.event.findUnique({
            where: { slug },
        });

        if (!event || !event.isActive) {
            return { error: "Event not found or is no longer active" };
        }

        let userId: number | null = null;
        let existingUser: any = null;

        // 2. Determine User (Student or Guest)
        if (guestData.isStudent && guestData.enrollmentNo) {
            const student = await prisma.student.findUnique({
                where: { enrollmentNo: guestData.enrollmentNo.trim() },
                include: { user: true }
            });

            if (!student) {
                return { error: "Student with this Enrollment Number not found." };
            }

            userId = student.userId;
            existingUser = student.user;
        } else {
             if (!guestData.name || !guestData.username) {
                return { error: "Name and username are required for guest registration" };
            }
            
            // Check for existing guest/user by username or phone
            existingUser = await prisma.user.findFirst({
                where: {
                    OR: [
                        { username: guestData.username },
                        ...(guestData.phone ? [{ phoneNumber: guestData.phone }] : []),
                    ],
                },
            });
            if (existingUser) userId = existingUser.id;
        }


        // 2. Check capacity
        if (event.maxCapacity) {
            const approvedCount = await prisma.eventRegistration.count({
                where: { eventId: event.id, status: { in: ["APPROVED", "PENDING"] } },
            });
            if (approvedCount >= event.maxCapacity) {
                return { error: "This event is full. No more spots available." };
            }
        }

        // 3. Validate required registration fields (Only for new Guest registrations)
        if (!guestData.isStudent && !existingUser) {
            const fields = (event.registrationFields as any[]) || [];
            for (const field of fields) {
                if (field.required && (!formData[field.name] || formData[field.name] === "")) {
                    return { error: `"${field.label}" is required` };
                }
            }
        }

        // 4. Handle Registration for Found User (Student or Existing Guest)
        if (userId && existingUser) {
            // Check if already registered for this event
            const existingReg = await prisma.eventRegistration.findFirst({
                where: { eventId: event.id, userId },
            });
            if (existingReg) {
                return {
                    error: "You are already registered for this event",
                    status: existingReg.status,
                };
            }

            // Existing user, just create registration
            const autoApprove = !event.requiresApproval;
            const registration = await prisma.$transaction(async (tx) => {
                if (autoApprove) {
                    await tx.user.update({
                        where: { id: userId },
                        data: { status: "APPROVED" },
                    });
                }

                return tx.eventRegistration.create({
                    data: {
                        eventId: event.id,
                        userId: userId,
                        status: autoApprove ? "APPROVED" : "PENDING",
                        formData: formData,
                    },
                });
            });

            revalidatePath(`/events/${slug}`);

            // Send Email if applicable
            if (existingUser.email && !existingUser.email.includes("@event.scanx.local")) {
                const html = getStudentRegistrationHtml(
                    event.name,
                    guestData.enrollmentNo || "N/A",
                    existingUser.name || "Student",
                    autoApprove ? "APPROVED" : "PENDING",
                    event.eventDate,
                    event.venue || ""
                );
                await sendEmail(existingUser.email, `Registration Confirmed: ${event.name}`, html);
            }

            return {
                success: true,
                status: registration.status,
                message: autoApprove
                    ? "Registration successful! You can now scan QR codes for attendance."
                    : "Registration submitted! Awaiting organizer approval.",
            };
        }

        // 5. Create new guest user + student + registration
        const { randomUUID } = await import("crypto");
        const passwordToHash = guestData.password || randomUUID();
        const hashedPassword = await bcrypt.hash(passwordToHash, 10);
        const email = `guest_${guestData.username.toLowerCase().replace(/[^a-z0-9]/g, "")}@event.scanx.local`;

        const autoApprove = !event.requiresApproval;

        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name: guestData.name,
                    username: guestData.username,
                    phoneNumber: guestData.phone || null,
                    email,
                    password: hashedPassword,
                    role: "GUEST",
                    status: autoApprove ? "APPROVED" : "PENDING",
                    student: {
                        create: {
                            rollNumber: `GUEST-${guestData.username.toUpperCase().slice(0, 10)}`,
                            enrollmentNo: `EVT-${randomUUID().slice(0, 8).toUpperCase()}`,
                            batchId: null,
                            guestDetails: formData,
                        },
                    },
                },
            });

            const registration = await tx.eventRegistration.create({
                data: {
                    eventId: event.id,
                    userId: user.id,
                    status: autoApprove ? "APPROVED" : "PENDING",
                    formData: formData,
                },
            });

            return { user, registration };
        });

        revalidatePath(`/events/${slug}`);

        // Send Email if they provided a real email
        const targetEmail = formData.email || (guestData.name.includes("@") ? guestData.name : null);
        
        if (targetEmail && !targetEmail.includes("@event.scanx.local")) {
            const html = getRegistrationSuccessHtml(
                event.name,
                guestData.username,
                autoApprove ? "APPROVED" : "PENDING",
                event.eventDate,
                event.venue || ""
            );
            await sendEmail(targetEmail, `Registration Received: ${event.name}`, html);
        }

        return {
            success: true,
            status: result.registration.status,
            username: guestData.username,
            message: autoApprove
                ? "Registration successful! You can log in with your username to scan QR codes."
                : "Registration submitted! Awaiting organizer approval. You will be able to log in once approved.",
        };
    } catch (error: any) {
        console.error("Event Registration Error:", error);
        if (error.code === "P2002") {
            return { error: "Username or phone number is already taken. Please use different credentials." };
        }
        return { error: "Failed to register for event. Please try again." };
    }
}

// ─── Approval Actions ───────────────────────────────────────────────────

async function requireOrganizerAuth(eventId: number) {
    const session = await getServerSession(authOptions);
    if (!session) return null;

    const userId = parseInt(session.user.id);

    if (session.user.role === "ADMIN") return session;

    const isOrg = await prisma.eventOrganizer.findFirst({
        where: { eventId, userId },
    });

    return isOrg ? session : null;
}

export async function approveRegistration(registrationId: number) {
    try {
        const registration = await prisma.eventRegistration.findUnique({
            where: { id: registrationId },
            include: { user: true, event: true }
        });
        if (!registration) return { error: "Registration not found" };

        const session = await requireOrganizerAuth(registration.eventId);
        if (!session) return { error: "Unauthorized Access" };

        await prisma.$transaction(async (tx) => {
            await tx.eventRegistration.update({
                where: { id: registrationId },
                data: {
                    status: "APPROVED",
                    reviewedAt: new Date(),
                    reviewedById: parseInt(session.user.id),
                },
            });

            await tx.user.update({
                where: { id: registration.userId },
                data: { status: "APPROVED" },
            });
        });

        revalidatePath(`/admin/events/${registration.eventId}`);
        revalidatePath(`/faculty/events/${registration.eventId}`);

        // Send email
        if (registration.user.email && !registration.user.email.includes("@event.scanx.local")) {
            const html = getRegistrationStatusUpdateHtml(registration.event.name, "APPROVED", registration.user.username || "");
            await sendEmail(registration.user.email, `Registration Approved: ${registration.event.name}`, html);
        }
        else {
             // check if formData has email
             const formData = registration.formData as Record<string,any>;
             if(formData?.email) {
                  const html = getRegistrationStatusUpdateHtml(registration.event.name, "APPROVED", registration.user.username || "");
                  await sendEmail(formData.email, `Registration Approved: ${registration.event.name}`, html);
             }
        }

        return { success: true };
    } catch (error) {
        console.error("Error approving registration:", error);
        return { error: "Failed to approve registration" };
    }
}

export async function rejectRegistration(registrationId: number) {
    try {
        const registration = await prisma.eventRegistration.findUnique({
            where: { id: registrationId },
            include: { user: true, event: true }
        });
        if (!registration) return { error: "Registration not found" };

        const session = await requireOrganizerAuth(registration.eventId);
        if (!session) return { error: "Unauthorized Access" };

        await prisma.$transaction(async (tx) => {
            await tx.eventRegistration.update({
                where: { id: registrationId },
                data: {
                    status: "REJECTED",
                    reviewedAt: new Date(),
                    reviewedById: parseInt(session.user.id),
                },
            });

            await tx.user.update({
                where: { id: registration.userId },
                data: { status: "REJECTED" },
            });
        });

        revalidatePath(`/admin/events/${registration.eventId}`);
        revalidatePath(`/faculty/events/${registration.eventId}`);

        // Send email
        if (registration.user.email && !registration.user.email.includes("@event.scanx.local")) {
            const html = getRegistrationStatusUpdateHtml(registration.event.name, "REJECTED", registration.user.username || "");
            await sendEmail(registration.user.email, `Registration Update: ${registration.event.name}`, html);
        }
        else {
             // check if formData has email
             const formData = registration.formData as Record<string,any>;
             if(formData?.email) {
                  const html = getRegistrationStatusUpdateHtml(registration.event.name, "REJECTED", registration.user.username || "");
                  await sendEmail(formData.email, `Registration Update: ${registration.event.name}`, html);
             }
        }

        return { success: true };
    } catch (error) {
        console.error("Error rejecting registration:", error);
        return { error: "Failed to reject registration" };
    }
}

export async function bulkApproveRegistrations(eventId: number, registrationIds: number[]) {
    try {
        const session = await requireOrganizerAuth(eventId);
        if (!session) return { error: "Unauthorized Access" };

        const registrations = await prisma.eventRegistration.findMany({
            where: { id: { in: registrationIds }, eventId },
        });

        if (registrations.length === 0) return { error: "No registrations found" };

        await prisma.$transaction(async (tx) => {
            await tx.eventRegistration.updateMany({
                where: { id: { in: registrationIds }, eventId },
                data: {
                    status: "APPROVED",
                    reviewedAt: new Date(),
                    reviewedById: parseInt(session.user.id),
                },
            });

            const userIds = registrations.map((r) => r.userId);
            await tx.user.updateMany({
                where: { id: { in: userIds } },
                data: { status: "APPROVED" },
            });
        });

        revalidatePath(`/admin/events/${eventId}`);
        revalidatePath(`/faculty/events/${eventId}`);
        return { success: true, count: registrations.length };
    } catch (error) {
        console.error("Error bulk approving:", error);
        return { error: "Failed to bulk approve registrations" };
    }
}

export async function bulkRejectRegistrations(eventId: number, registrationIds: number[]) {
    try {
        const session = await requireOrganizerAuth(eventId);
        if (!session) return { error: "Unauthorized Access" };

        const registrations = await prisma.eventRegistration.findMany({
            where: { id: { in: registrationIds }, eventId },
        });

        if (registrations.length === 0) return { error: "No registrations found" };

        await prisma.$transaction(async (tx) => {
            await tx.eventRegistration.updateMany({
                where: { id: { in: registrationIds }, eventId },
                data: {
                    status: "REJECTED",
                    reviewedAt: new Date(),
                    reviewedById: parseInt(session.user.id),
                },
            });

            const userIds = registrations.map((r) => r.userId);
            await tx.user.updateMany({
                where: { id: { in: userIds } },
                data: { status: "REJECTED" },
            });
        });

        revalidatePath(`/admin/events/${eventId}`);
        revalidatePath(`/faculty/events/${eventId}`);
        return { success: true, count: registrations.length };
    } catch (error) {
        console.error("Error bulk rejecting:", error);
        return { error: "Failed to bulk reject registrations" };
    }
}

// ─── Registration Queries ────────────────────────────────────────────────

export async function getEventRegistrations(
    eventId: number,
    statusFilter?: "PENDING" | "APPROVED" | "REJECTED"
) {
    try {
        const session = await requireOrganizerAuth(eventId);
        if (!session) return { error: "Unauthorized Access" };

        const where: any = { eventId };
        if (statusFilter) where.status = statusFilter;

        const registrations = await prisma.eventRegistration.findMany({
            where,
            orderBy: { registeredAt: "desc" },
            include: {
                user: { select: { id: true, name: true, email: true, username: true, phoneNumber: true, status: true } },
                reviewedBy: { select: { name: true } },
            },
        });

        return { success: true, registrations };
    } catch (error) {
        console.error("Error fetching registrations:", error);
        return { error: "Failed to fetch registrations" };
    }
}

export async function exportRegistrations(eventId: number) {
    try {
        const session = await requireOrganizerAuth(eventId);
        if (!session) return { error: "Unauthorized Access" };

        const event = await prisma.event.findUnique({
            where: { id: eventId },
        });
        if (!event) return { error: "Event not found" };

        const registrations = await prisma.eventRegistration.findMany({
            where: { eventId },
            orderBy: { registeredAt: "asc" },
            include: {
                user: { select: { name: true, email: true, username: true, phoneNumber: true } },
                reviewedBy: { select: { name: true } },
            },
        });

        // Build CSV
        const fields = (event.registrationFields as any[]) || [];
        const headers = [
            "Name",
            "Username",
            "Email",
            "Phone",
            "Status",
            "Registered At",
            "Reviewed By",
            ...fields.map((f: any) => f.label),
        ];

        const rows = registrations.map((reg) => {
            const fd = (reg.formData as Record<string, any>) || {};
            return [
                reg.user.name,
                reg.user.username || "",
                reg.user.email,
                reg.user.phoneNumber || "",
                reg.status,
                new Date(reg.registeredAt).toLocaleString(),
                reg.reviewedBy?.name || "",
                ...fields.map((f: any) => fd[f.name] || ""),
            ];
        });

        const csv = [
            headers.join(","),
            ...rows.map((row) =>
                row.map((cell: string) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
            ),
        ].join("\n");

        return { success: true, csv, filename: `${event.slug}-registrations.csv` };
    } catch (error) {
        console.error("Error exporting registrations:", error);
        return { error: "Failed to export registrations" };
    }
}
