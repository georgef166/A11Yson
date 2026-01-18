"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
    const { user, signInWithGoogle, logout, loading } = useAuth();

    return (
        <header className="w-full border-b border-slate-200 dark:border-slate-800 bg-white/50 backdrop-blur-md dark:bg-black/50 sticky top-0 z-10 p-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tighter text-blue-700 dark:text-blue-400">
                            A11Yson
                        </h1>
                    </Link>

                    {/* New Nav Links */}
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                        <Link href="/" className="text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors">
                            Home
                        </Link>
                        <Link href="/profile" className="text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors">
                            Profile
                        </Link>
                        <Link href="/quiz" className="text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors">
                            Quiz
                        </Link>
                    </nav>
                </div>

                <nav className="flex items-center gap-4">
                    {loading ? (
                        <span className="text-sm animate-pulse">Checking auth...</span>
                    ) : user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium hidden sm:inline-block">
                                Hi, {user.displayName?.split(" ")[0]}
                            </span>

                            <Link href="/profile">
                                {user.photoURL ? (
                                    <Image
                                        src={user.photoURL}
                                        alt="Profile"
                                        width={32}
                                        height={32}
                                        className="rounded-full border border-slate-300 dark:border-slate-700 hover:opacity-80 transition-opacity cursor-pointer"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 border border-slate-300 dark:border-slate-700 flex items-center justify-center">
                                        <span className="text-xs font-bold">{user.email?.[0].toUpperCase()}</span>
                                    </div>
                                )}
                            </Link>

                            <button
                                onClick={logout}
                                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                                aria-label="Sign out"
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={signInWithGoogle}
                            className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                            aria-label="Sign in with Google"
                        >
                            Sign In
                        </button>
                    )}
                </nav>
            </div>
        </header>
    );
}
