"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Import router
import Header from "@/components/Header";    // Keep the header visible behind/above

interface Question {
  id: number;
  text: string;
  type: "scale" | "yesno" | "text";
  key: string;
}

const questions: Question[] = [
  {
    id: 1,
    text: "When reading a long article, do you find lines of text tend to blur or swim together?",
    type: "yesno",
    key: "visual_confusion",
  },
  {
    id: 2,
    text: "Do you often find yourself re-reading the same sentence multiple times because you lost focus?",
    type: "scale", // 1-5
    key: "attention_focus",
  },
  {
    id: 3,
    text: "Do bright white backgrounds on websites cause you eye strain or headaches?",
    type: "yesno",
    key: "light_sensitivity",
  },
  {
    id: 4,
    text: "How do you feel when a webpage has many moving elements (GIFs, auto-play videos)?",
    type: "text", // Prompt for descriptive feeling
    key: "sensory_overload",
  },
];

export default function QuizPage() {
  const router = useRouter(); // Initialize router
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = (answer: any) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.key]: answer }));
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      submitQuiz({ ...answers, [currentQuestion.key]: answer });
    }
  };

  const submitQuiz = async (finalAnswers: any) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("http://localhost:8000/api/analyze-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalAnswers),
      });
      const data = await response.json();

      // Save Result Globally
      localStorage.setItem("a11yson_profile", JSON.stringify(data));

      // Send message in case extension is listening (optional, but good for immediate update)
      window.postMessage({ type: "A11YSON_PROFILE_UPDATE", profile: data }, "*");

      // Redirect to Profile Dashboard
      router.push("/profile");

    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const playQuestionAudio = async (text: string) => {
    try {
      const res = await fetch("http://localhost:8000/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const blob = await res.blob();
      const audio = new Audio(URL.createObjectURL(blob));
      audio.play();
    } catch (e) {
      console.error("TTS failed", e);
      const u = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans relative">
      <Header />

      {/* Dimmed Backdrop Context */}
      <div className="absolute inset-0 z-0 bg-[url('/grid-pattern.svg')] opacity-5"></div>

      {/* Main Content Centered Modal */}
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4 relative z-10 backdrop-blur-sm bg-block/5">

        <div className="w-full max-w-xl">
          {/* Progress Bar */}
          <div className="w-full bg-slate-200 h-2 rounded-full mb-8 dark:bg-slate-800">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
            />
          </div>

          {isAnalyzing ? (
            <div className="text-center animate-pulse py-12 bg-white dark:bg-black/80 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800">
              <h2 className="text-3xl font-bold mb-4">Calibrating your experience...</h2>
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-slate-500">A11Yson is analyzing your cognitive needs via Gemini.</p>
            </div>
          ) : (
            <div className="bg-white/95 dark:bg-black/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex justify-between items-start mb-6">
                <span className="text-xs font-bold text-blue-600 tracking-wider uppercase bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">Question {currentQuestion.id} of {questions.length}</span>
                <button
                  onClick={() => playQuestionAudio(currentQuestion.text)}
                  className="text-slate-400 hover:text-blue-500 transition-colors p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                  title="Listen to question"
                >
                  🔊
                </button>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold mb-8 leading-snug text-slate-900 dark:text-white">{currentQuestion.text}</h2>

              <div className="space-y-4">
                {currentQuestion.type === "yesno" && (
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleAnswer("yes")}
                      className="py-4 px-6 rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 dark:border-slate-800 dark:hover:border-blue-500 dark:hover:bg-blue-900/20 transition-all font-bold text-lg"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleAnswer("no")}
                      className="py-4 px-6 rounded-xl border-2 border-slate-200 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-slate-600 dark:hover:bg-slate-800 transition-all font-bold text-lg"
                    >
                      No
                    </button>
                  </div>
                )}

                {currentQuestion.type === "scale" && (
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map(num => (
                      <button
                        key={num}
                        onClick={() => handleAnswer(num)}
                        className="aspect-square rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 dark:border-slate-800 dark:hover:border-blue-500 font-bold text-xl transition-all"
                      >
                        {num}
                      </button>
                    ))}
                    <div className="col-span-5 flex justify-between text-xs text-slate-500 font-semibold mt-2 uppercase tracking-wide">
                      <span>Never</span>
                      <span>Always</span>
                    </div>
                  </div>
                )}

                {currentQuestion.type === "text" && (
                  <div>
                    <textarea
                      className="w-full p-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none min-h-[140px] text-lg transition-all placeholder:text-slate-400"
                      placeholder="Type your answer here..."
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAnswer(e.currentTarget.value);
                        }
                      }}
                    />
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs text-slate-400">Shift + Enter for new line</span>
                      <button
                        onClick={(e) => {
                          const val = (e.currentTarget.parentElement?.previousElementSibling as HTMLTextAreaElement).value;
                          handleAnswer(val);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold text-sm transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
