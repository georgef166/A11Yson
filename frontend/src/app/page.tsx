"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const [backendMessage, setBackendMessage] = useState<string>("Loading...");
  const { user, signInWithGoogle, logout, loading } = useAuth();

  useEffect(() => {
    fetch("http://localhost:8000/api/data")
      .then((res) => res.json())
      .then((data) => setBackendMessage(data.data))
      .catch((err) => setBackendMessage("Error connecting to backend"));
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 font-sans selection:bg-blue-200 dark:selection:bg-blue-900">
      
      {/* Header / Navigation */}
      <header className="w-full border-b border-slate-200 dark:border-slate-800 bg-white/50 backdrop-blur-md dark:bg-black/50 sticky top-0 z-10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tighter text-blue-700 dark:text-blue-400">
              A11Yson
            </h1>
          </div>
          <nav className="flex items-center gap-4">
            {loading ? (
              <span className="text-sm animate-pulse">Checking auth...</span>
            ) : user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium hidden sm:inline-block">
                  Hi, {user.displayName?.split(" ")[0]}
                </span>
                {user.photoURL && (
                   <Image 
                     src={user.photoURL} 
                     alt="Profile" 
                     width={32} 
                     height={32} 
                     className="rounded-full border border-slate-300 dark:border-slate-700"
                   />
                )}
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

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-16 sm:px-8">
        
        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Accessibility <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              Reimagined.
            </span>
          </h2>
          
          <p className="max-w-2xl mx-auto text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
            A personalized, adaptive web experience tailored to your cognitive and sensory needs. Take the quiz to generate your profile and sync it everywhere.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/quiz"
              className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200 rounded-full transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
              aria-label="Start the accessibility quiz"
            >
              Take the Quiz
            </Link>
            <a
              href="#"
              className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800 dark:hover:bg-slate-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
              aria-label="Learn more about A11Yson"
            >
              How it Works
            </a>
          </div>
        </section>

        {/* Features / Accessible Design Elements */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
          {[
            { title: "Smart Analysis", desc: "AI-driven analysis of your reading and interaction patterns.", icon: "🧠" },
            { title: "Adaptive UI", desc: "Instantly transforms web pages to match your visual needs.", icon: "👁️" },
            { title: "Sync Anywhere", desc: "Your profile follows you across devices and browsers.", icon: "☁️" },
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md dark:bg-slate-900/50 dark:border-slate-800 transition-all">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-400">{feature.desc}</p>
            </div>
          ))}
        </div>

      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-slate-500 dark:text-slate-500 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black">
        <p>© 2026 A11Yson Project. Built for Hackville.</p>
        <p className="mt-2 text-xs font-mono opacity-70">
          Backend: {backendMessage}
        </p>
      </footer>
    </div>
  );
}
