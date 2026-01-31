import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import Link from "next/link";

const ADMIN_EMAIL = "baskduf@gmail.com";

async function getSession() {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    return session;
}

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    // Check if user is logged in and is admin
    if (!session.isLoggedIn || session.ssafyId !== ADMIN_EMAIL) {
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Admin Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <h1 className="text-xl font-bold text-gray-900">
                                Admin Dashboard
                            </h1>
                            <nav className="flex gap-4">
                                <Link
                                    href="/admin"
                                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                                >
                                    Overview
                                </Link>
                                <Link
                                    href="/admin/users"
                                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                                >
                                    Users
                                </Link>
                                <Link
                                    href="/admin/system"
                                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                                >
                                    System
                                </Link>
                            </nav>
                        </div>
                        <Link
                            href="/"
                            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            Back to Site
                        </Link>
                    </div>
                </div>
            </div>

            {/* Admin Content */}
            <div className="max-w-6xl mx-auto px-4 py-6">
                {children}
            </div>
        </div>
    );
}
