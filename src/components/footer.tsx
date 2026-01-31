import Link from "next/link";
import { Github } from "lucide-react";

export function Footer() {
    return (
        <footer className="w-full bg-white border-t border-[#E2E8F0] mt-auto">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex flex-col items-center justify-center gap-4 text-sm text-[#9CA3AF]">
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                        <span>제작자 구미_5반_최원빈</span>
                        <span className="hidden sm:inline text-[#E2E8F0]">|</span>
                        <Link
                            href="mailto:baskduf@gmail.com"
                            className="hover:text-[#4A4A4A] transition-colors"
                        >
                            baskduf@gmail.com
                        </Link>
                    </div>
                    <Link
                        href="https://github.com/baskduf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#9CA3AF] hover:text-[#3282F6] transition-colors"
                    >
                        <Github className="w-5 h-5" />
                        <span className="sr-only">GitHub</span>
                    </Link>
                    <p className="text-xs text-gray-400 mt-2">
                        © {new Date().getFullYear()} SSAFY Quest. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
