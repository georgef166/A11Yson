"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, ChevronRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";

interface Option {
  text: string;
}

interface Question {
  question_id: number;
  text: string;
  options: string[];
}

export default function Quiz() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<{question_id: number, selected_option: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await axios.post("http://localhost:8000/api/quiz/generate");
      if (res.data.questions && res.data.questions.length > 0) {
        setQuestions(res.data.questions);
      } else {
        setError("No questions received from backend.");
      }
    } catch (err) {
      console.error("Error fetching quiz:", err);
      setError("Failed to connect to the backend. Please ensure it is running.");
    } finally {
      setLoading(false);
    }
  };

  const playAudio = async (text: string) => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      const res = await axios.post("http://localhost:8000/api/tts", { text });
      const audio = new Audio(res.data.audio_url);
      audio.play();
      audio.onended = () => setIsPlaying(false);
    } catch (error) {
      console.error("TTS Error:", error);
      setIsPlaying(false);
    }
  };

  const handleOptionSelect = (option: string) => {
    const newResponses = [...responses];
    newResponses[currentQuestionIndex] = {
      question_id: questions[currentQuestionIndex].question_id,
      selected_option: option
    };
    setResponses(newResponses);
  };

  const handleNext = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Submit
      setLoading(true);
      try {
        const res = await axios.post("http://localhost:8000/api/quiz/analyze", responses);
        localStorage.setItem("a11yson_profile", JSON.stringify(res.data));
        router.push("/dashboard");
      } catch (error) {
        console.error("Submission error:", error);
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-white">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          <p>Loading your experience...</p>
        </div>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-white">
        <div className="text-center max-w-md p-6 bg-red-500/10 rounded-2xl border border-red-500/20">
          <h2 className="text-xl font-bold text-red-400 mb-2">Something went wrong</h2>
          <p className="text-neutral-300 mb-4">{error || "Unable to load quiz questions."}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-neutral-800 rounded-full hover:bg-neutral-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const selectedOption = responses[currentQuestionIndex]?.selected_option;

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 flex justify-between items-center text-neutral-400 text-sm">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <div className="h-1 flex-1 mx-4 bg-neutral-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.question_id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="flex gap-4 items-start">
              <h2 className="text-3xl font-semibold leading-tight flex-1">
                {currentQuestion.text}
              </h2>
              <button 
                onClick={() => playAudio(currentQuestion.text)}
                className={`p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors ${isPlaying ? 'text-purple-400' : 'text-neutral-400'}`}
              >
                <Volume2 className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleOptionSelect(option)}
                  className={`w-full p-6 rounded-2xl text-left text-lg font-medium transition-all duration-200 border-2
                    ${selectedOption === option 
                      ? 'border-purple-500 bg-purple-500/10 text-white shadow-[0_0_30px_rgba(168,85,247,0.2)]' 
                      : 'border-white/5 bg-white/5 text-neutral-400 hover:bg-white/10 hover:border-white/10'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    {option}
                    {selectedOption === option && <Check className="w-5 h-5 text-purple-500" />}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 flex justify-end">
          <button
            onClick={handleNext}
            disabled={!selectedOption}
            className={`px-8 py-4 rounded-full font-semibold flex items-center gap-2 transition-all
              ${selectedOption 
                ? 'bg-white text-black hover:bg-neutral-200 cursor-pointer' 
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              }`}
          >
            {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
