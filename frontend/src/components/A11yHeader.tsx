"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

export default function A11yHeader() {
    const { user, signInWithGoogle, logout, loading } = useAuth();

    return (
        <header className="w-full bg-[#2F7625] px-6 py-3 flex items-center shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
                <div className="flex items-center gap-10">
                    <Link href="/" className="flex items-center">
                        <Image
                            src="/logo.svg"
                            alt="A11Yson Logo"
                            width={110}
                            height={40}
                            className="brightness-0 invert"
                        />
                    </Link>

                    <nav className="hidden md:flex items-center gap-8 text-white font-bold text-sm">
                        <Link href="/" className="hover:opacity-80 transition-opacity">
                            Home
                        </Link>
                        <Link href="/profile" className="hover:opacity-80 transition-opacity">
                            Profile
                        </Link>
                        <Link href="/quiz" className="hover:opacity-80 transition-opacity">
                            Quiz
                        </Link>
                        <Link href="#" className="hover:opacity-80 transition-opacity">
                            Download Extension
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-white text-xs font-bold hidden lg:block opacity-80">
                                {user.displayName || user.email}
                            </span>
                            <button
                                onClick={logout}
                                className="bg-white text-[#2F7625] px-6 py-2 rounded-full font-bold text-sm hover:bg-opacity-90 transition-all shadow-md active:scale-95"
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={signInWithGoogle}
                            className="bg-white text-[#2F7625] px-6 py-2 rounded-full font-bold text-sm hover:bg-opacity-90 transition-all shadow-md active:scale-95"
                        >
                            Sign In
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
