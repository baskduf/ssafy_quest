import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { Footer } from "@/components/footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "SSAFY Quest",
  description: "SSAFY 백준 알고리즘 랭킹 시스템",
  icons: {
    icon: "/assets/logo.png",
    shortcut: "/assets/logo.png",
    apple: "/assets/app_icon.png",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SSAFY Quest",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};

async function getSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  return session;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className="flex flex-col min-h-screen">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E2E8F0]">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center justify-between h-14">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/assets/mob_ssafy_logo.png"
                  alt="SSAFY Quest"
                  width={100}
                  height={28}
                  className="h-6 sm:h-7 w-auto"
                />
              </Link>

              {/* Nav Links */}
              <div className="flex items-center gap-4">
                {session.isLoggedIn ? (
                  <>
                    <Link
                      href="/mypage"
                      className="text-xs sm:text-sm text-[#4A4A4A] hover:text-[#3282F6] transition-colors"
                    >
                      마이페이지
                    </Link>
                    <span className="text-xs text-[#9CA3AF] hidden sm:inline">
                      {session.campus && session.name
                        ? `${session.campus} ${session.classNum}반 ${session.name}`
                        : session.bojHandle}
                    </span>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="text-xs sm:text-sm font-medium text-[#3282F6] bg-white border border-[#3282F6] hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors"
                  >
                    로그인
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="pt-14 flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
