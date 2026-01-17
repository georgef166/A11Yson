"use client";

import { useState } from "react";
import Link from "next/link";

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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

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
      setResult(data);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const playQuestionAudio = async (text: string) => {
    // This connects to our ElevenLabs backend
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
        // Fallback to browser TTS
        const u = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(u);
    }
  };

  if (result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-black text-black dark:text-white">
        <h1 className="text-3xl font-bold mb-6">Your Personal A11Yson Profile</h1>
        <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-xl p-8 shadow-lg border border-zinc-200 dark:border-zinc-800">
           <pre className="whitespace-pre-wrap overflow-auto max-h-96">
             {JSON.stringify(result, null, 2)}
           </pre>
           <div className="mt-8 flex gap-4">
              <button 
                onClick={() => {
                    window.postMessage({ type: "A11YSON_PROFILE_UPDATE", profile: result }, "*");
                    // Also save to localStorage for fallback
                    localStorage.setItem("a11yson_profile", JSON.stringify(result));
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold w-full"
              >
                Download Profile to Extension
              </button>
              <Link href="/" className="bg-zinc-200 hover:bg-zinc-300 text-zinc-800 px-6 py-3 rounded-full font-semibold w-full text-center">
                Return Home
              </Link>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-black text-black dark:text-white transition-colors duration-500">
      <div className="w-full max-w-xl">
        {/* Progress Bar */}
        <div className="w-full bg-zinc-200 h-2 rounded-full mb-8 dark:bg-zinc-800">
            <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
            />
        </div>

        {isAnalyzing ? (
            <div className="text-center animate-pulse">
                <h2 className="text-2xl font-bold mb-2">Analyzing your needs...</h2>
                <p className="text-zinc-500">Connecting to Gemini AI...</p>
            </div>
        ) : (
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800">
                <div className="flex justify-between items-start mb-6">
                    <span className="text-sm font-semibold text-blue-600 tracking-wider uppercase">Question {currentQuestion.id} of {questions.length}</span>
                    <button 
                        onClick={() => playQuestionAudio(currentQuestion.text)}
                        className="text-zinc-400 hover:text-blue-500 transition-colors"
                        title="Listen to question"
                    >
                        🔊
                    </button>
                </div>
                
                <h2 className="text-2xl font-bold mb-8 leading-snug">{currentQuestion.text}</h2>

                <div className="space-y-4">
                    {currentQuestion.type === "yesno" && (
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => handleAnswer("yes")}
                                className="p-4 rounded-xl border-2 border-zinc-200 hover:border-blue-500 hover:bg-blue-50 dark:border-zinc-700 dark:hover:bg-blue-900/20 transition-all font-medium"
                            >
                                Yes
                            </button>
                            <button 
                                onClick={() => handleAnswer("no")}
                                className="p-4 rounded-xl border-2 border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800 transition-all font-medium"
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
                                    className="aspect-square rounded-lg border-2 border-zinc-200 hover:border-blue-500 hover:bg-blue-50 dark:border-zinc-700 font-bold text-lg transition-all"
                                 >
                                     {num}
                                 </button>
                             ))}
                             <div className="col-span-5 flex justify-between text-sm text-zinc-500 mt-2">
                                 <span>Never</span>
                                 <span>Always</span>
                             </div>
                        </div>
                    )}
                    
                    {currentQuestion.type === "text" && (
                        <div>
                             <textarea 
                                className="w-full p-4 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-transparent focus:border-blue-500 outline-none min-h-[120px]"
                                placeholder="Type your answer here..."
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleAnswer(e.currentTarget.value);
                                    }
                                }}
                             />
                             <p className="text-xs text-zinc-500 mt-2 text-right">Press Enter to continue</p>
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
