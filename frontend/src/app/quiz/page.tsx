"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import A11yHeader from "@/components/A11yHeader";
import { useAuth } from "@/context/AuthContext";

interface Option {
  id: string;
  label: string;
  boldPart?: string;
  suffix?: string;
}

interface Question {
  id: number;
  text: string;
  subtitle?: string;
  options: Option[];
  key: string;
}

const questions: Question[] = [
  {
    id: 1,
    text: "When interacting with text and information on most websites, what tends to be your biggest challenge?",
    subtitle: "(Check all that apply)*",
    key: "reading_challenges",
    options: [
      { id: "hard_to_read", label: "Text feels ", boldPart: "hard to read or visually tiring", suffix: ", even when I adjust the size" },
      { id: "lose_place", label: "I can read the text, but I ", boldPart: "lose my place or need to reread", suffix: " often." },
      { id: "dense_pages", label: "Pages feel ", boldPart: "dense or overwhelming", suffix: ", making it hard to process information." },
      { id: "comfortable", label: "I usually read and process content comfortably." },
    ],
  },
  {
    id: 2,
    text: "How does the visual presentation of sites usually feel to you?",
    subtitle: "(Check all that apply)*",
    key: "visual_feel",
    options: [
      { id: "low_contrast", label: "Content blends together due to ", boldPart: "low contrast or colour choices" },
      { id: "eye_strain", label: "Brightness, glare, or certain colours cause ", boldPart: "eye strain or discomfort" },
      { id: "no_interference", label: "I notice visuals, but ", boldPart: "they don't interfere", suffix: " with my understanding" },
      { id: "works_well", label: "The visual design usually works well for me" },
    ],
  },
  {
    id: 3,
    text: "What most often interrupts your focus when using websites?",
    subtitle: "(Check all that apply)*",
    key: "focus_interruptions",
    options: [
      { id: "animations", label: "Animations, movements, or changing elements" },
      { id: "too_much_info", label: "Too much information competing for my attention at once" },
      { id: "visual_intensity", label: "Visual intensity (brightness, flashing, busy layouts)" },
      { id: "stay_focused", label: "I usually stay focused without difficulty" },
    ],
  },
];

export default function QuizPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  const currentQuestion = questions[currentIndex];

  const toggleOption = (optionId: string) => {
    setSelectedOptions((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId]
    );
  };

  const handleNext = () => {
    if (selectedOptions.length === 0) return;

    const newAnswers = { ...answers, [currentQuestion.key]: selectedOptions };
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOptions([]);
    } else {
      submitQuiz(newAnswers);
    }
  };

  const submitQuiz = async (finalAnswers: any) => {
    setIsAnalyzing(true);
    try {
      let baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout guard

      const response = await fetch(`${baseUrl}/api/analyze-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalAnswers),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();
      localStorage.setItem("a11yson_profile", JSON.stringify(data));
      window.postMessage({ type: "A11YSON_PROFILE_UPDATE", profile: data }, "*");
      router.push("/profile");
    } catch (error) {
      console.error("Analysis failed:", error);
      // Fallback: If AI fails or times out, save a default ADHD profile so the user isn't stuck
      const fallbackData = { primary_condition: "ADHD", explanation: "AI analysis timed out. Applying default safe profile." };
      localStorage.setItem("a11yson_profile", JSON.stringify(fallbackData));
      router.push("/profile");
    }
  };

  if (isAnalyzing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F1F7F2]">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <div className="w-12 h-12 border-4 border-[#2F7625] border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 className="text-2xl font-bold text-[#2F7625]">Analyzing your results...</h2>
          <p className="text-slate-500 max-w-sm text-sm">Generating your personalized neuro-accessibility profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F7F2] text-slate-900 font-sans flex flex-col">
      <A11yHeader />

      <main className="flex-grow flex flex-col items-center pt-6 pb-10 px-4">

        {/* Progress Decoration */}
        <div className="w-full max-w-2xl relative mb-10 mt-6 px-4">
          <div className="w-full h-5 bg-white rounded-full shadow-sm border border-white/50 relative overflow-hidden">
            {/* Green Progress Fill */}
            <div
              className="absolute left-0 top-0 h-full bg-[#2F7625] transition-all duration-700 ease-out rounded-full"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Growing Vine Container */}
          <div
            className="absolute -top-16 left-4 right-4 pointer-events-none transition-all duration-1000 ease-out overflow-hidden h-32 flex items-center"
            style={{
              width: `calc(${((currentIndex + 1) / questions.length) * 100}% - 32px)`,
            }}
          >
            <div className="flex shrink-0 items-center h-full">
              <Image src="/vine.png" alt="Vine" width={250} height={150} className="object-contain shrink-0" />
              <Image src="/vine.png" alt="Vine" width={250} height={150} className="object-contain shrink-0 -ml-16 rotate-6" />
              <Image src="/vine.png" alt="Vine" width={250} height={150} className="object-contain shrink-0 -ml-16 -rotate-3" />
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="w-full max-w-2xl bg-white rounded-[32px] shadow-[0_12px_40px_rgba(0,0,0,0.03)] border border-white/50 p-8 md:p-10 relative animate-in fade-in slide-in-from-bottom-3 duration-500">
          <h2 className="text-2xl font-bold text-slate-800 leading-tight mb-2">
            {currentQuestion.text}
          </h2>
          {currentQuestion.subtitle && (
            <p className="text-lg text-slate-500 mb-8">{currentQuestion.subtitle}</p>
          )}

          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <button
                key={option.id}
                onClick={() => toggleOption(option.id)}
                className={`w-full text-left p-4 md:p-5 rounded-2xl border-2 transition-all flex items-center gap-4 group shadow-sm ${selectedOptions.includes(option.id)
                  ? "bg-[#F1F7F2] border-[#2F7625]/20"
                  : "bg-[#F8FAF8] border-transparent hover:bg-[#F2F4F2]"
                  }`}
              >
                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${selectedOptions.includes(option.id)
                  ? "bg-[#2F7625] border-[#2F7625]"
                  : "bg-white border-slate-200"
                  }`}>
                  {selectedOptions.includes(option.id) && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="text-base text-slate-700 leading-snug">
                  {option.label}
                  {option.boldPart && <span className="font-bold">{option.boldPart}</span>}
                  {option.suffix}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="w-full max-w-2xl mt-10 flex justify-between items-center px-4">
          <div className="text-xl font-bold text-slate-400">
            {currentQuestion.id}/{questions.length}
          </div>
          <button
            onClick={handleNext}
            disabled={selectedOptions.length === 0}
            className={`px-12 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg active:scale-[0.98] ${selectedOptions.length > 0
              ? "bg-[#2F7625] text-white hover:bg-[#206015]"
              : "bg-slate-300 text-slate-500 cursor-not-allowed"
              }`}
          >
            {currentIndex === questions.length - 1 ? "Finish" : "Continue"}
          </button>
        </div>
      </main>
    </div>
  );
}
