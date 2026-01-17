"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white selection:bg-purple-500 selection:text-white overflow-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px]" />
      </div>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-neutral-300">AI-Powered Accessibility Assistant</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-neutral-200 to-neutral-500">
            A11Yson
          </h1>
          
          <p className="text-xl md:text-2xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Your personalized cognitive companion. Experience the web in a way that works for 
            <span className="text-purple-400 font-semibold"> You</span>.
          </p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12"
          >
            <Link href="/quiz">
              <button className="group relative px-8 py-4 bg-white text-black rounded-full font-semibold text-lg hover:bg-neutral-200 transition-all flex items-center gap-2">
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 rounded-full bg-white/50 blur-lg opacity-0 group-hover:opacity-50 transition-opacity" />
              </button>
            </Link>
            
            <Link href="/dashboard">
              <button className="px-8 py-4 rounded-full font-semibold text-lg text-white border border-white/10 hover:bg-white/5 transition-all">
                Dashboard
              </button>
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
