"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [justSignedIn, setJustSignedIn] = useState(false);
  const [error, setError] = useState("");

  // Handle "Insta Go to Quiz" redirect only if user effectively signs in on this page
  const handleGoogleSignIn = async () => {
    try {
      setJustSignedIn(true);
      await signInWithGoogle();
      // The useEffect will handle the push when 'user' updates
    } catch (e) { console.error(e); }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setJustSignedIn(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Authentication failed");
      setJustSignedIn(false);
    }
  };

  useEffect(() => {
    if (user && !loading && justSignedIn) {
      router.push("/quiz");
    }
  }, [user, loading, justSignedIn, router]);

  if (loading || justSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin text-4xl">🌀</div>
      </div>
    );
  }

  // LOGGED IN VIEW -> Show Standard Landing Page
  if (user) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 font-sans selection:bg-blue-200 dark:selection:bg-blue-900">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center px-4 py-16 sm:px-8">
          {/* Hero Section */}
          <section className="text-center max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold tracking-wide border border-blue-200 dark:border-blue-800 backdrop-blur-sm">
              ✨ Redefining Digital Accessibility
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 dark:from-white dark:via-blue-200 dark:to-white drop-shadow-sm">
              The Web, <br className="hidden md:block" /> Adapted to <span className="text-blue-600 dark:text-blue-400">You.</span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              A11Yson uses Gemini AI to dynamically rewrite, restyle, and reorganize the web based on your unique cognitive and visual needs.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Link
                href="/quiz"
                className="h-14 px-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg transition-all shadow-lg hover:shadow-blue-500/25 flex items-center gap-2 group"
              >
                Retake Quiz via Gemini
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link
                href="/profile"
                className="h-14 px-8 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-lg transition-all flex items-center"
              >
                View Analysis
              </Link>
            </div>
          </section>

          {/* Features Grid */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
            {/* Feature 1 */}
            <div className="bg-white/50 dark:bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center text-2xl mb-6">🧠</div>
              <h3 className="text-xl font-bold mb-3">Cognitive Load AI</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Gemini analyzes page complexity and can summarize content, hide distractions, or rewrite jargon instantly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/50 dark:bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center text-2xl mb-6">👁️</div>
              <h3 className="text-xl font-bold mb-3">Adaptive Visuals</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Personalized contrast modes, dyslexia-friendly fonts, and Bionic Reading integration tailored to your vision.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/50 dark:bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-2xl flex items-center justify-center text-2xl mb-6">🤝</div>
              <h3 className="text-xl font-bold mb-3">Universal Sync</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Your profile travels with you. Configure once on the dashboard, and the Chrome Extension adapts every site you visit.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // NOT LOGGED IN VIEW -> Sign In Card
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 font-sans selection:bg-blue-200 dark:selection:bg-blue-900">

      <Header />

      <main className="flex-grow flex flex-col items-center justify-center px-4 py-8 relative">

        {/* Background decor */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-blue-400/20 blur-[100px] rounded-full"></div>
          <div className="absolute bottom-[20%] right-[10%] w-64 h-64 bg-purple-400/20 blur-[100px] rounded-full"></div>
        </div>

        <div className="w-full max-w-md bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 animate-in fade-in zoom-in-95 duration-500 relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">{isSignUp ? "Create Account" : "Welcome Back"}</h1>
            <p className="text-slate-500 dark:text-slate-400">{isSignUp ? "Sign up to get personalized visuals" : "Sign in to access your dashboard"}</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100 italic">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleEmailSignIn} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-bold mb-2 ml-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-transparent focus:border-blue-500 outline-none transition-colors"
                placeholder="you@a11yson.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-transparent focus:border-blue-500 outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-black font-bold py-4 rounded-xl hover:opacity-90 transition-opacity flex justify-center">
              {isSignUp ? "Create A11Yson Account" : "Sign In with Email"}
            </button>
          </form>

          <div className="text-center mb-6">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-4"
            >
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </button>
          </div>

          <div className="relative flex items-center gap-4 mb-6">
            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Or</span>
            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-black border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors group"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6 group-hover:scale-110 transition-transform" alt="Google" />
            Sign in with Google
          </button>

          <div className="text-center mt-8 text-sm text-slate-500">
            New to A11Yson? <a href="#" className="text-blue-600 font-bold hover:underline">Create an account</a>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
