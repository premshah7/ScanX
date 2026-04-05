"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// ─── Helpers ────────────────────────────────────────────────────────────

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 80);
}

async function ensureUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.event.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    return slug;
}

async function requireAuth(roles: string[]) {
    const session = await getServerSession(authOptions);
    if (!session || !roles.includes(session.user.role)) {
        return null;
    }
    return session;
}

async function requireOrganizer(eventId: number, userId: number) {
    const organizer = await prisma.eventOrganizer.findFirst({
        where: { eventId, userId },
    });
    return !!organizer;
}

// ─── Event CRUD ─────────────────────────────────────────────────────────

export async function createEvent(data: {
    name: string;
    description?: string;
    eventDate: string; // ISO string
    eventEndDate?: string;
    venue?: string;
    maxCapacity?: number;
    requiresApproval?: boolean;
    isPublic?: boolean;
    registrationFields?: any[];
}) {
    try {
        const session = await requireAuth(["ADMIN", "FACULTY"]);
        if (!session) return { error: "Unauthorized Access" };

        if (!data.name || !data.eventDate) {
            return { error: "Event name and date are required" };
        }

        const userId = parseInt(session.user.id);
        const slug = await ensureUniqueSlug(generateSlug(data.name));

        const event = await prisma.$transaction(async (tx) => {
            const newEvent = await tx.event.create({
                data: {
                    name: data.name,
                    slug,
                    description: data.description || null,
                    eventDate: new Date(data.eventDate),
                    eventEndDate: data.eventEndDate ? new Date(data.eventEndDate) : null,
                    venue: data.venue || null,
                    maxCapacity: data.maxCapacity || null,
                    requiresApproval: data.requiresApproval ?? false,
                    isPublic: data.isPublic ?? true,
                    registrationFields: data.registrationFields || [],
                    createdById: userId,
                },
            });

            // Auto-add creator as CREATOR organizer
            await tx.eventOrganizer.create({
                data: {
                    eventId: newEvent.id,
                    userId,
                    role: "CREATOR",
                },
            });

            return newEvent;
        });

        revalidatePath("/admin/events");
        revalidatePath("/faculty/events");
        return { success: true, eventId: event.id, slug: event.slug };
    } catch (error) {
        console.error("Error creating event:", error);
        return { error: "Failed to create event" };
    }
}

export async function updateEvent(
    eventId: number,
    data: {
        name?: string;
        description?: string;
        eventDate?: string;
        eventEndDate?: string;
        venue?: string;
        maxCapacity?: number | null;
        requiresApproval?: boolean;
        isPublic?: boolean;
        registrationFields?: any[];
    }
) {
    try {
        const session = await requireAuth(["ADMIN", "FACULTY"]);
        if (!session) return { error: "Unauthorized Access" };

        const userId = parseInt(session.user.id);

        // Check organizer permission (ADMIN bypasses)
        if (session.user.role !== "ADMIN") {
            const isOrg = await requireOrganizer(eventId, userId);
            if (!isOrg) return { error: "Only organizers can edit this event" };
        }

        const updateData: any = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.eventDate !== undefined) updateData.eventDate = new Date(data.eventDate);
        if (data.eventEndDate !== undefined) updateData.eventEndDate = data.eventEndDate ? new Date(data.eventEndDate) : null;
        if (data.venue !== undefined) updateData.venue = data.venue;
        if (data.maxCapacity !== undefined) updateData.maxCapacity = data.maxCapacity;
        if (data.requiresApproval !== undefined) updateData.requiresApproval = data.requiresApproval;
        if (data.isPublic !== undefined) updateData.isPublic = data.isPublic;
        if (data.registrationFields !== undefined) updateData.registrationFields = data.registrationFields;

        await prisma.event.update({
            where: { id: eventId },
            data: updateData,
        });

        revalidatePath("/admin/events");
        revalidatePath("/faculty/events");
        revalidatePath(`/admin/events/${eventId}`);
        revalidatePath(`/faculty/events/${eventId}`);
        return { success: true };
    } catch (error) {
        console.error("Error updating event:", error);
        return { error: "Failed to update event" };
    }
}

export async function deleteEvent(eventId: number) {
    try {
        const session = await requireAuth(["ADMIN", "FACULTY"]);
        if (!session) return { error: "Unauthorized Access" };

        const userId = parseInt(session.user.id);

        // Only CREATOR or ADMIN can delete
        if (session.user.role !== "ADMIN") {
            const organizer = await prisma.eventOrganizer.findFirst({
                where: { eventId, userId, role: "CREATOR" },
            });
            if (!organizer) return { error: "Only the event creator or admin can delete this event" };
        }

        // Soft delete
        await prisma.event.update({
            where: { id: eventId },
            data: { isActive: false },
        });

        revalidatePath("/admin/events");
        revalidatePath("/faculty/events");
        return { success: true };
    } catch (error) {
        console.error("Error deleting event:", error);
        return { error: "Failed to delete event" };
    }
}

// ─── Event Queries ──────────────────────────────────────────────────────

export async function getEvents(filter?: "upcoming" | "active" | "past" | "all") {
    try {
        const session = await requireAuth(["ADMIN", "FACULTY"]);
        if (!session) return { error: "Unauthorized Access" };

        const now = new Date();
        let where: any = {};

        switch (filter) {
            case "upcoming":
                where = { eventDate: { gt: now }, isActive: true };
                break;
            case "active":
                where = { isActive: true };
                break;
            case "past":
                where = {
                    OR: [
                        { eventEndDate: { lt: now } },
                        { eventEndDate: null, eventDate: { lt: now } },
                    ],
                };
                break;
            case "all":
            default:
                // No filter — show everything
                break;
        }

        // FACULTY can only see their own events
        if (session.user.role === "FACULTY") {
            where.organizers = {
                some: { userId: parseInt(session.user.id) },
            };
        }

        const events = await prisma.event.findMany({
            where,
            orderBy: { eventDate: "desc" },
            include: {
                _count: {
                    select: {
                        registrations: true,
                        sessions: true,
                        organizers: true,
                    },
                },
                createdBy: { select: { name: true, email: true } },
            },
        });

        return { success: true, events };
    } catch (error) {
        console.error("Error fetching events:", error);
        return { error: "Failed to fetch events" };
    }
}

export async function getMyEvents(email: string) {
    try {
        if (!email) return [];

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return [];

        const events = await prisma.event.findMany({
            where: {
                isActive: true,
                organizers: { some: { userId: user.id } },
            },
            orderBy: { eventDate: "desc" },
            include: {
                _count: {
                    select: {
                        registrations: true,
                        sessions: true,
                    },
                },
            },
        });

        return events;
    } catch (error) {
        console.error("Error fetching my events:", error);
        return [];
    }
}

export async function getEventBySlug(slug: string) {
    try {
        const event = await prisma.event.findUnique({
            where: { slug },
            include: {
                createdBy: { select: { name: true } },
                organizers: {
                    include: { user: { select: { name: true, email: true } } },
                },
                _count: {
                    select: { registrations: true },
                },
            },
        });

        if (!event || !event.isActive) {
            return { error: "Event not found" };
        }

        // Count approved registrations to calculate remaining capacity
        const approvedCount = await prisma.eventRegistration.count({
            where: { eventId: event.id, status: "APPROVED" },
        });

        return {
            success: true,
            event: {
                ...event,
                approvedCount,
                spotsRemaining: event.maxCapacity ? event.maxCapacity - approvedCount : null,
            },
        };
    } catch (error) {
        console.error("Error fetching event by slug:", error);
        return { error: "Failed to fetch event" };
    }
}

export async function getEventDetails(eventId: number) {
    try {
        const session = await requireAuth(["ADMIN", "FACULTY"]);
        if (!session) return { error: "Unauthorized Access" };

        const userId = parseInt(session.user.id);

        // Verify organizer access (ADMIN bypasses)
        if (session.user.role !== "ADMIN") {
            const isOrg = await requireOrganizer(eventId, userId);
            if (!isOrg) return { error: "Only organizers can view event details" };
        }

        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                createdBy: { select: { name: true, email: true } },
                organizers: {
                    include: { user: { select: { id: true, name: true, email: true } } },
                },
                registrations: {
                    include: {
                        user: { select: { id: true, name: true, email: true, status: true } },
                        reviewedBy: { select: { name: true } },
                    },
                    orderBy: { registeredAt: "desc" },
                },
                sessions: {
                    orderBy: { startTime: "desc" },
                    include: {
                        _count: { select: { attendances: true, proxyAttempts: true } },
                    },
                },
                _count: {
                    select: { registrations: true },
                },
            },
        });

        if (!event) return { error: "Event not found" };

        // Calculate status counts
        const statusCounts = {
            total: event.registrations.length,
            pending: event.registrations.filter((r) => r.status === "PENDING").length,
            approved: event.registrations.filter((r) => r.status === "APPROVED").length,
            rejected: event.registrations.filter((r) => r.status === "REJECTED").length,
        };

        return { success: true, event, statusCounts };
    } catch (error) {
        console.error("Error fetching event details:", error);
        return { error: "Failed to fetch event details" };
    }
}

export async function getPublicEvents() {
    try {
        const now = new Date();

        const events = await prisma.event.findMany({
            where: {
                isActive: true,
                isPublic: true,
                eventDate: { gte: now },
            },
            orderBy: { eventDate: "asc" },
            include: {
                createdBy: { select: { name: true } },
                _count: { select: { registrations: true } },
            },
        });

        // Enrich with spots remaining
        const enriched = await Promise.all(
            events.map(async (event) => {
                const approvedCount = await prisma.eventRegistration.count({
                    where: { eventId: event.id, status: "APPROVED" },
                });
                return {
                    ...event,
                    approvedCount,
                    spotsRemaining: event.maxCapacity ? event.maxCapacity - approvedCount : null,
                };
            })
        );

        return { success: true, events: enriched };
    } catch (error) {
        console.error("Error fetching public events:", error);
        return { error: "Failed to fetch events" };
    }
}

// ─── Organizer Management ───────────────────────────────────────────────

export async function addOrganizer(eventId: number, userId: number) {
    try {
        const session = await requireAuth(["ADMIN", "FACULTY"]);
        if (!session) return { error: "Unauthorized Access" };

        const callerId = parseInt(session.user.id);

        // Only CREATOR or ADMIN can add organizers
        if (session.user.role !== "ADMIN") {
            const callerOrg = await prisma.eventOrganizer.findFirst({
                where: { eventId, userId: callerId, role: "CREATOR" },
            });
            if (!callerOrg) return { error: "Only the event creator or admin can add organizers" };
        }

        // Verify target user is FACULTY or ADMIN
        const targetUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!targetUser || (targetUser.role !== "FACULTY" && targetUser.role !== "ADMIN")) {
            return { error: "Only faculty or admin users can be organizers" };
        }

        // Check if already an organizer
        const existing = await prisma.eventOrganizer.findUnique({
            where: { eventId_userId: { eventId, userId } },
        });
        if (existing) return { error: "User is already an organizer" };

        await prisma.eventOrganizer.create({
            data: { eventId, userId, role: "ORGANIZER" },
        });

        revalidatePath(`/admin/events/${eventId}`);
        revalidatePath(`/faculty/events/${eventId}`);
        return { success: true };
    } catch (error) {
        console.error("Error adding organizer:", error);
        return { error: "Failed to add organizer" };
    }
}

export async function removeOrganizer(eventId: number, userId: number) {
    try {
        const session = await requireAuth(["ADMIN", "FACULTY"]);
        if (!session) return { error: "Unauthorized Access" };

        const callerId = parseInt(session.user.id);

        // Only CREATOR or ADMIN can remove organizers
        if (session.user.role !== "ADMIN") {
            const callerOrg = await prisma.eventOrganizer.findFirst({
                where: { eventId, userId: callerId, role: "CREATOR" },
            });
            if (!callerOrg) return { error: "Only the event creator or admin can remove organizers" };
        }

        // Can't remove the CREATOR
        const targetOrg = await prisma.eventOrganizer.findFirst({
            where: { eventId, userId },
        });
        if (!targetOrg) return { error: "User is not an organizer" };
        if (targetOrg.role === "CREATOR") return { error: "Cannot remove the event creator" };

        await prisma.eventOrganizer.delete({
            where: { id: targetOrg.id },
        });

        revalidatePath(`/admin/events/${eventId}`);
        revalidatePath(`/faculty/events/${eventId}`);
        return { success: true };
    } catch (error) {
        console.error("Error removing organizer:", error);
        return { error: "Failed to remove organizer" };
    }
}

// ─── Search Faculty (for organizer picker) ──────────────────────────────

export async function searchFaculty(query: string) {
    try {
        const session = await requireAuth(["ADMIN", "FACULTY"]);
        if (!session) return [];

        if (!query || query.length < 2) return [];

        const users = await prisma.user.findMany({
            where: {
                role: { in: ["FACULTY", "ADMIN"] },
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { email: { contains: query, mode: "insensitive" } },
                ],
            },
            select: { id: true, name: true, email: true, role: true },
            take: 10,
        });

        return users;
    } catch (error) {
        console.error("Error searching faculty:", error);
        return [];
    }
}
