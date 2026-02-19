import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                otp: { label: "OTP", type: "text" }, // Optional
            },
            async authorize(credentials) {
                console.log("[AUTH] Authorize called with:", {
                    email: credentials?.email,
                    hasPassword: !!credentials?.password,
                    otp: credentials?.otp
                });

                if (!credentials?.email) {
                    console.log("[AUTH] Missing identifier");
                    throw new Error("Missing identifier");
                }

                const identifier = credentials.email; // Can be email or phone

                // ---------------------------------------------------------
                // ---------------------------------------------------------
                // 1. OTP LOGIN FLOW
                // ---------------------------------------------------------
                if (credentials.otp) {
                    // We need to import verifyOtpCode dynamically or move it to a shared lib that is safe
                    // Assuming verifyOtpCode is imported from "@/lib/otp"
                    const { verifyOtpCode } = await import("@/lib/otp");

                    // RESOLVE IDENTIFIER (Username -> Email/Phone)
                    // Matches logic in actions/otp.ts
                    let targetIdentifier = identifier;
                    const isEmail = identifier.includes("@");
                    const isPhone = /^\+?[0-9\s-]{10,}$/.test(identifier);

                    if (!isEmail && !isPhone) {
                        const user = await prisma.user.findUnique({
                            where: { username: identifier },
                            select: { email: true, phoneNumber: true }
                        });

                        if (user) {
                            if (user.email && !user.email.includes("@event.scanx.local")) {
                                targetIdentifier = user.email;
                            } else if (user.phoneNumber) {
                                targetIdentifier = user.phoneNumber;
                            }
                        }
                    }

                    const isValid = await verifyOtpCode(targetIdentifier, credentials.otp as string);
                    if (!isValid) {
                        throw new Error("Invalid or expired OTP");
                    }

                    // Find existing user by ANY valid identifier
                    let user = await prisma.user.findFirst({
                        where: {
                            OR: [
                                { email: targetIdentifier },
                                { phoneNumber: targetIdentifier },
                                { username: identifier } // Fallback if targetIdentifier didn't match?
                            ]
                        },
                    });

                    // Auto-Register Guest if not found (Only for Phone-like inputs usually?)
                    // If we are doing Email OTP, we probably expect the user to exist.
                    // But keeping existing logic for safety if it was relied upon.
                    if (!user) {
                        const { randomUUID } = await import("crypto");
                        // Only auto-register if it looks like a phone number? 
                        // Or if we want to allow new users via OTP (not implemented for Email generally without name)
                        // For now, allow it but it might fail validation if email is required.
                        const name = "Guest " + identifier.slice(-4);
                        const email = isEmail ? identifier : `guest_${identifier}@event.scanx.local`;

                        // Only create if we have a phone number or it is an email
                        if (!isEmail && !isPhone) {
                            throw new Error("User not found and cannot auto-register with username only");
                        }

                        const password = await bcrypt.hash(randomUUID(), 10);

                        user = await prisma.user.create({
                            data: {
                                name,
                                email,
                                phoneNumber: isPhone ? identifier : null,
                                password,
                                role: "GUEST",
                                status: "PENDING",
                                student: {
                                    create: {
                                        rollNumber: `GUEST-${identifier.slice(-6)}`,
                                        enrollmentNo: `EVT-${identifier.slice(-6)}`,
                                    },
                                },
                            },
                        });
                    }

                    return {
                        id: user.id.toString(),
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        status: user.status,
                    };
                }

                // ---------------------------------------------------------
                // 2. STANDARD PASSWORD FLOW
                // ---------------------------------------------------------
                // ---------------------------------------------------------
                // 2. STANDARD PASSWORD FLOW (OR GUEST NO-PASSWORD)
                // ---------------------------------------------------------

                const user = await prisma.user.findFirst({
                    where: {
                        OR: [
                            { email: identifier },
                            { phoneNumber: identifier },
                            { username: identifier },
                        ],
                    },
                });

                if (!user) {
                    console.log("[AUTH] User NOT found for identifier:", identifier);
                    throw new Error("Invalid credentials");
                }
                console.log("[AUTH] User found:", { id: user.id, role: user.role, username: user.username });

                // BYPASS PASSWORD CHECK FOR GUESTS
                if (user.role === "GUEST") {
                    // Guests can login with just username/phone
                    return {
                        id: user.id.toString(),
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        status: user.status,
                    };
                }

                // STUDENTS/ADMINS MUST HAVE PASSWORD
                if (!credentials?.password) {
                    console.log("[AUTH] Missing password for non-guest user");
                    throw new Error("Missing password");
                }

                const isValidPassword = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isValidPassword) {
                    throw new Error("Invalid credentials");
                }

                return {
                    id: user.id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
                token.status = user.status;
            }

            // Refetch status to ensure it's up to date (for polling on pending page)
            if (token.email) {
                const freshUser = await prisma.user.findUnique({
                    where: { email: token.email as string },
                    select: { status: true, role: true }
                });
                if (freshUser) {
                    token.status = freshUser.status;
                    token.role = freshUser.role; // Keep role in sync too
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as string;
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.status = token.status as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth/login",
        error: "/auth/error",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
};
