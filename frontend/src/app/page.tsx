"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import A11yHeader from "@/components/A11yHeader";
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
      <div className="flex min-h-screen items-center justify-center bg-[#F1F7F2]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#2F7625] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#2F7625] font-bold animate-pulse">Entering A11Yson...</p>
        </div>
      </div>
    );
  }

  // LOGGED IN VIEW -> Show Standard Landing Page
  if (user) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F1F7F2] text-slate-900 font-sans selection:bg-[#2F7625]/20">
        <A11yHeader />
        <main className="flex-grow flex flex-col items-center justify-center px-4 py-16 sm:px-8 relative overflow-hidden">
          {/* Animated Background Gradient Shapes */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#2F7625]/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#2F7625]/10 rounded-full blur-[120px] animate-pulse duration-[5s]"></div>
          </div>

          {/* Hero Section */}
          <section className="text-center max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
            <div className="mb-6">
              <Image
                src="/logo.svg"
                alt="A11Yson Logo"
                width={200}
                height={80}
                className="mx-auto"
              />
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-[#2F7625]">
              The Web, <br className="hidden md:block" /> Adapted to You.
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              A11Yson uses Gemini AI to dynamically rewrite, restyle, and reorganize the web based on your unique cognitive and visual needs.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Link
                href="/quiz"
                className="h-14 px-10 rounded-full bg-[#2F7625] hover:bg-[#206015] text-white font-bold text-lg transition-all shadow-lg hover:shadow-[#2F7625]/25 flex items-center gap-2 group"
              >
                Retake Quiz via Gemini
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link
                href="/profile"
                className="h-14 px-10 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-lg transition-all flex items-center shadow-sm"
              >
                View Analysis
              </Link>
            </div>
          </section>

          {/* Features Grid */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full relative z-10">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <h3 className="text-xl font-bold mb-3">Cognitive Load AI</h3>
              <p className="text-slate-600 leading-relaxed">
                Gemini analyzes page complexity and can summarize content, hide distractions, or rewrite jargon instantly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <h3 className="text-xl font-bold mb-3">Adaptive Visuals</h3>
              <p className="text-slate-600 leading-relaxed">
                Personalized contrast modes, dyslexia-friendly fonts, and Bionic Reading integration tailored to your vision.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <h3 className="text-xl font-bold mb-3">Universal Sync</h3>
              <p className="text-slate-600 leading-relaxed">
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
    <div className="flex min-h-screen flex-col bg-[#F1F7F2] text-slate-900 font-sans">

      <A11yHeader />

      <main className="flex-grow flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">

        {/* Animated Background Gradient Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-5%] left-[-5%] w-[45%] h-[45%] bg-[#2F7625]/15 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-[-5%] right-[-5%] w-[45%] h-[45%] bg-[#2F7625]/15 rounded-full blur-[100px] animate-pulse duration-[6s]"></div>
        </div>

        {/* Centered Logo above card */}
        <div className="mb-6 relative z-10">
          <Image
            src="/logo.svg"
            alt="A11Yson Logo"
            width={140}
            height={60}
          />
        </div>

        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 animate-in fade-in zoom-in-95 duration-500 relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-black">
              Welcome Back
            </h1>
            <p className="text-slate-500 text-sm">
              Sign in to access your profile
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100 italic flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleEmailSignIn} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-bold mb-2 ml-1 text-black">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 rounded-xl border border-slate-200 bg-[#f1f5f1] text-sm focus:border-[#2F7625] focus:bg-white outline-none transition-all shadow-sm"
                placeholder="yourname@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 ml-1 text-black">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 rounded-xl border border-slate-200 bg-[#f1f5f1] text-sm focus:border-[#2F7625] focus:bg-white outline-none transition-all shadow-sm"
                placeholder="Your password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#2F7625] text-white font-bold py-4 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all shadow-md mt-2"
            >
              Sign In with Email
            </button>
          </form>

          <div className="text-center mb-6">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm font-bold text-[#206015] hover:opacity-80 underline underline-offset-4"
            >
              Don't have an account? Sign Up
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-bold">Or</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-[#333] text-white py-4 rounded-xl font-bold hover:brightness-125 active:scale-[0.98] transition-all shadow-md"
          >
            <Image src="/globe.svg" alt="Google" width={20} height={20} className="brightness-0 invert" />
            Sign In with Google
          </button>

          <div className="text-center mt-8 text-sm font-medium">
            <span className="text-slate-500">New to A11Yson?</span>{" "}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[#2F7625] font-bold hover:underline underline-offset-4"
            >
              Create an account!
            </button>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
